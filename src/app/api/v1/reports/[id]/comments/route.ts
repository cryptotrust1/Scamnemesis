import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/middleware/auth';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const CommentCreateSchema = z.object({
  content: z.string().min(10, 'Comment must be at least 10 characters').max(3000, 'Comment must not exceed 3000 characters'),
});

// ===== FILE UPLOAD CONFIGURATION =====
const S3_ENDPOINT = process.env.S3_ENDPOINT || 'http://localhost:9000';
const S3_BUCKET = process.env.S3_BUCKET || 'scamnemesis';
const S3_REGION = process.env.S3_REGION || 'us-east-1';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES_PER_COMMENT = 5;

// Allowed file types with magic bytes for validation
const ALLOWED_TYPES: Record<string, { magicBytes: number[][]; extensions: string[] }> = {
  'image/jpeg': {
    magicBytes: [[0xFF, 0xD8, 0xFF]],
    extensions: ['jpg', 'jpeg'],
  },
  'image/png': {
    magicBytes: [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
    extensions: ['png'],
  },
  'application/pdf': {
    magicBytes: [[0x25, 0x50, 0x44, 0x46]], // %PDF
    extensions: ['pdf'],
  },
};

// Lazy S3 client initialization
let _s3Client: S3Client | null | undefined = undefined;
function getS3Client(): S3Client | null {
  if (_s3Client === undefined) {
    const accessKey = process.env.S3_ACCESS_KEY;
    const secretKey = process.env.S3_SECRET_KEY;

    if (!accessKey || !secretKey) {
      console.warn('[Comments] S3 credentials not set. File uploads disabled.');
      _s3Client = null;
    } else {
      _s3Client = new S3Client({
        endpoint: S3_ENDPOINT,
        region: S3_REGION,
        credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
        forcePathStyle: true,
      });
    }
  }
  return _s3Client;
}

function generateFileKey(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || 'bin';
  const uuid = crypto.randomUUID();
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '/');
  return `comments/${date}/${uuid}.${ext}`;
}

function isValidMimeType(mimeType: string): boolean {
  return mimeType in ALLOWED_TYPES;
}

function validateExtension(filename: string, mimeType: string): boolean {
  const typeInfo = ALLOWED_TYPES[mimeType];
  if (!typeInfo) return false;
  const ext = filename.split('.').pop()?.toLowerCase();
  return ext ? typeInfo.extensions.includes(ext) : false;
}

function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
  const typeInfo = ALLOWED_TYPES[mimeType];
  if (!typeInfo || typeInfo.magicBytes.length === 0) return true;

  for (const magic of typeInfo.magicBytes) {
    if (buffer.length >= magic.length) {
      let matches = true;
      for (let i = 0; i < magic.length; i++) {
        if (buffer[i] !== magic[i]) {
          matches = false;
          break;
        }
      }
      if (matches) return true;
    }
  }
  return false;
}

const CommentQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  sort: z.enum(['newest', 'oldest']).default('newest'),
});

// GET /reports/:id/comments - List comments for a report
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const { searchParams } = new URL(request.url);
    const query = CommentQuerySchema.safeParse({
      limit: searchParams.get('limit') ?? 20,
      offset: searchParams.get('offset') ?? 0,
      sort: searchParams.get('sort') ?? 'newest',
    });

    if (!query.success) {
      return NextResponse.json(
        { error: 'validation_error', message: query.error.message },
        { status: 400 }
      );
    }

    const { limit, offset, sort } = query.data;

    // Find the report
    const report = await prisma.report.findFirst({
      where: {
        OR: [{ id }, { publicId: id }],
        status: 'APPROVED',
      },
      select: { id: true },
    });

    if (!report) {
      return NextResponse.json(
        { error: 'not_found', message: 'Report not found' },
        { status: 404 }
      );
    }

    // Fetch approved comments with attachments
    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: {
          reportId: report.id,
          status: 'APPROVED',
        },
        include: {
          user: {
            select: {
              displayName: true,
              role: true,
            },
          },
          attachments: {
            select: {
              id: true,
              fileKey: true,
              fileName: true,
              fileSize: true,
              mimeType: true,
            },
          },
        },
        orderBy: {
          createdAt: sort === 'newest' ? 'desc' : 'asc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.comment.count({
        where: {
          reportId: report.id,
          status: 'APPROVED',
        },
      }),
    ]);

    // Generate URLs for attachments
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

    return NextResponse.json({
      comments: comments.map(c => ({
        id: c.id,
        content: c.content,
        author: c.user?.displayName || 'Anonymous',
        author_display_name: c.user?.displayName || 'Anonymous',
        author_role: c.user?.role || 'BASIC',
        status: 'APPROVED',
        upvotes: c.upvotes,
        created_at: c.createdAt.toISOString(),
        attachments: c.attachments.map(a => ({
          id: a.id,
          fileName: a.fileName,
          fileSize: a.fileSize,
          fileType: a.mimeType,
          url: siteUrl
            ? `${siteUrl}/api/v1/evidence/files/${encodeURIComponent(a.fileKey)}`
            : `/api/v1/evidence/files/${encodeURIComponent(a.fileKey)}`,
        })),
      })),
      pagination: {
        total,
        limit,
        offset,
        has_more: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST /reports/:id/comments - Add a comment to a report
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Require authentication
  const auth = await requireAuth(request, ['comment:create']);
  if (auth instanceof NextResponse) return auth;

  const { id } = params;

  try {
    // Detect content type for backwards compatibility
    const contentType = request.headers.get('content-type') || '';
    const isFormData = contentType.includes('multipart/form-data');

    let content: string;
    let files: File[] = [];

    if (isFormData) {
      // Parse FormData (new behavior with attachments)
      const formData = await request.formData();
      content = formData.get('content') as string || '';
      files = formData.getAll('attachments') as File[];
    } else {
      // Parse JSON (backwards compatible)
      const body = await request.json();
      content = body.content || '';
    }

    // Validate content
    const validated = CommentCreateSchema.safeParse({ content });
    if (!validated.success) {
      return NextResponse.json(
        { error: 'validation_error', message: validated.error.message },
        { status: 400 }
      );
    }

    // Validate file count
    if (files.length > MAX_FILES_PER_COMMENT) {
      return NextResponse.json(
        { error: 'too_many_files', message: `Maximum ${MAX_FILES_PER_COMMENT} files per comment` },
        { status: 400 }
      );
    }

    // Find the report
    const report = await prisma.report.findFirst({
      where: {
        OR: [{ id }, { publicId: id }],
        status: 'APPROVED',
      },
      select: { id: true },
    });

    if (!report) {
      return NextResponse.json(
        { error: 'not_found', message: 'Report not found' },
        { status: 404 }
      );
    }

    // Check if user has already commented recently (spam prevention)
    const recentComment = await prisma.comment.findFirst({
      where: {
        reportId: report.id,
        userId: auth.userId,
        createdAt: {
          gte: new Date(Date.now() - 60 * 1000), // Within last minute
        },
      },
    });

    if (recentComment) {
      return NextResponse.json(
        { error: 'rate_limited', message: 'Please wait before posting another comment' },
        { status: 429 }
      );
    }

    // Process file uploads if any
    const uploadedFiles: { fileKey: string; fileName: string; fileSize: number; mimeType: string }[] = [];
    const uploadErrors: string[] = [];

    if (files.length > 0) {
      const s3Client = getS3Client();

      if (!s3Client) {
        // S3 not available - continue without attachments
        console.warn('[Comments] S3 not available, skipping file uploads');
      } else {
        for (const file of files) {
          // Validate MIME type
          if (!isValidMimeType(file.type)) {
            uploadErrors.push(`${file.name}: File type not allowed`);
            continue;
          }

          // Validate extension
          if (!validateExtension(file.name, file.type)) {
            uploadErrors.push(`${file.name}: Extension does not match content type`);
            continue;
          }

          // Validate size
          if (file.size > MAX_FILE_SIZE) {
            uploadErrors.push(`${file.name}: File too large (max 10MB)`);
            continue;
          }

          try {
            const buffer = Buffer.from(await file.arrayBuffer());

            // Validate magic bytes
            if (!validateMagicBytes(buffer, file.type)) {
              uploadErrors.push(`${file.name}: File content does not match claimed type`);
              continue;
            }

            // Generate file key and upload
            const fileKey = generateFileKey(file.name);
            await s3Client.send(new PutObjectCommand({
              Bucket: S3_BUCKET,
              Key: fileKey,
              Body: buffer,
              ContentType: file.type,
              ContentLength: file.size,
              Metadata: {
                'original-name': encodeURIComponent(file.name),
                'uploader-id': auth.userId,
                'uploaded-at': new Date().toISOString(),
              },
            }));

            uploadedFiles.push({
              fileKey,
              fileName: file.name,
              fileSize: file.size,
              mimeType: file.type,
            });
          } catch (uploadError) {
            console.error(`[Comments] Error uploading ${file.name}:`, uploadError);
            uploadErrors.push(`${file.name}: Upload failed`);
          }
        }
      }
    }

    // Create comment with attachments in a transaction
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

    const comment = await prisma.$transaction(async (tx) => {
      // Create comment
      const newComment = await tx.comment.create({
        data: {
          reportId: report.id,
          userId: auth.userId,
          content: validated.data.content,
          status: 'PENDING_MODERATION',
        },
        include: {
          user: { select: { displayName: true } },
        },
      });

      // Create and fetch attachments if any files were uploaded
      let attachments: { id: string; fileKey: string; fileName: string; fileSize: number; mimeType: string }[] = [];

      if (uploadedFiles.length > 0) {
        try {
          await tx.commentAttachment.createMany({
            data: uploadedFiles.map(f => ({
              commentId: newComment.id,
              fileKey: f.fileKey,
              fileName: f.fileName,
              fileSize: f.fileSize,
              mimeType: f.mimeType,
            })),
          });

          // Fetch attachments for response
          attachments = await tx.commentAttachment.findMany({
            where: { commentId: newComment.id },
            select: { id: true, fileKey: true, fileName: true, fileSize: true, mimeType: true },
          });
        } catch (attachmentError) {
          console.error('Error saving attachments:', attachmentError);
          // Continue without attachments - comment is still created
        }
      }

      return { ...newComment, attachments };
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        action: 'COMMENT_CREATED',
        entityType: 'Comment',
        entityId: comment.id,
        userId: auth.userId,
        changes: {
          report_id: report.id,
          content_length: validated.data.content.length,
          attachments_count: uploadedFiles.length,
        },
        ipAddress: request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip'),
      },
    });

    return NextResponse.json({
      id: comment.id,
      content: comment.content,
      author: comment.user?.displayName || 'Anonymous',
      status: 'pending_moderation',
      message: 'Your comment has been submitted and is pending moderation.',
      created_at: comment.createdAt.toISOString(),
      attachments: comment.attachments.map(a => ({
        id: a.id,
        fileName: a.fileName,
        fileSize: a.fileSize,
        fileType: a.mimeType,
        url: siteUrl
          ? `${siteUrl}/api/v1/evidence/files/${encodeURIComponent(a.fileKey)}`
          : `/api/v1/evidence/files/${encodeURIComponent(a.fileKey)}`,
      })),
      upload_errors: uploadErrors.length > 0 ? uploadErrors : undefined,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
