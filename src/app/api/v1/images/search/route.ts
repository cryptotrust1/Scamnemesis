import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/middleware/auth';

export const dynamic = 'force-dynamic';

const SearchQuerySchema = z.object({
  min_similarity: z.coerce.number().min(0.5).max(0.99).default(0.6),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export async function POST(request: NextRequest) {
  // Require search:face scope (Standard tier or higher)
  const auth = await requireAuth(request, ['search:face']);
  if (auth instanceof NextResponse) return auth;

  try {
    // Parse multipart form data
    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;

    if (!imageFile) {
      return NextResponse.json(
        { error: 'missing_image', message: 'Image file is required' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(imageFile.type)) {
      return NextResponse.json(
        { error: 'invalid_file_type', message: `File type must be one of: ${allowedTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (imageFile.size > maxSize) {
      return NextResponse.json(
        { error: 'file_too_large', message: 'File size must not exceed 10MB' },
        { status: 400 }
      );
    }

    // Parse query parameters
    const minSimilarity = formData.get('min_similarity');
    const limitParam = formData.get('limit');

    const params = SearchQuerySchema.safeParse({
      min_similarity: minSimilarity ?? 0.6,
      limit: limitParam ?? 20,
    });

    if (!params.success) {
      return NextResponse.json(
        { error: 'validation_error', message: params.error.message },
        { status: 400 }
      );
    }

    const { min_similarity, limit } = params.data;

    // Convert file to buffer for processing
    const _imageBuffer = Buffer.from(await imageFile.arrayBuffer());

    // In production, this would:
    // 1. Extract face embedding using face recognition model (e.g., face-api.js, AWS Rekognition)
    // 2. Search for similar embeddings in pgvector database
    // 3. Return matching faces with similarity scores

    // Mock face detection
    // In production: const faceEmbedding = await extractFaceEmbedding(imageBuffer);
    const faceDetected = true; // Mock: assume face is detected

    if (!faceDetected) {
      return NextResponse.json(
        { error: 'no_face_detected', message: 'No face detected in uploaded image' },
        { status: 400 }
      );
    }

    // Mock embedding (512-dimensional vector for face recognition)
    // In production, this would be the actual face embedding
    const _mockEmbedding = new Array(512).fill(0).map(() => Math.random() * 2 - 1);

    // Search for similar faces using pgvector
    // In production:
    // const results = await prisma.$queryRaw`
    //   SELECT e.*, r.id as report_id, r.summary, r.fraud_type,
    //          1 - (e.face_embedding <=> ${mockEmbedding}::vector) as similarity
    //   FROM "Evidence" e
    //   JOIN "Report" r ON e."reportId" = r.id
    //   WHERE e.face_embedding IS NOT NULL
    //     AND r.status = 'APPROVED'
    //     AND 1 - (e.face_embedding <=> ${mockEmbedding}::vector) > ${min_similarity}
    //   ORDER BY similarity DESC
    //   LIMIT ${limit}
    // `;

    // For now, return mock results demonstrating the response structure
    // In production, this would be replaced with actual vector similarity search
    const mockResults = await prisma.evidence.findMany({
      where: {
        type: 'IMAGE',
        report: {
          status: 'APPROVED',
        },
      },
      include: {
        report: {
          select: {
            id: true,
            summary: true,
            fraudType: true,
            publishedAt: true,
            perpetrators: {
              select: {
                id: true,
                fullName: true,
                nickname: true,
              },
            },
          },
        },
      },
      take: limit,
    });

    // Transform results
    const results = mockResults.map((evidence, index) => ({
      evidence_id: evidence.id,
      report_id: evidence.report.id,
      similarity: Math.max(min_similarity, 0.95 - (index * 0.05)), // Mock similarity scores
      thumbnail_url: evidence.thumbnailUrl || evidence.url,
      report: {
        id: evidence.report.id,
        summary: evidence.report.summary,
        fraud_type: evidence.report.fraudType?.toLowerCase(),
        published_at: evidence.report.publishedAt?.toISOString(),
        perpetrators: evidence.report.perpetrators.map(p => ({
          id: p.id,
          full_name: p.fullName,
          nickname: p.nickname,
        })),
      },
    }));

    // Filter by minimum similarity
    const filteredResults = results.filter(r => r.similarity >= min_similarity);

    return NextResponse.json({
      query: {
        min_similarity,
        limit,
        image_size: imageFile.size,
        image_type: imageFile.type,
      },
      results: filteredResults,
      total: filteredResults.length,
      processing_time_ms: Math.floor(Math.random() * 500) + 100, // Mock processing time
    });
  } catch (error) {
    console.error('Error performing face search:', error);
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to perform face search' },
      { status: 500 }
    );
  }
}
