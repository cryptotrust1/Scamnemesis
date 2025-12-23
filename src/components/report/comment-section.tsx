'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { MessageSquare, ThumbsUp, Flag, Send, Loader2, LogIn, Paperclip, X, Image, FileText, Smile } from 'lucide-react';
import { getInitials } from '@/lib/utils';
import { RelativeTime } from '@/components/ui/relative-time';
import { toast } from 'sonner';
import Link from 'next/link';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface CommentAttachment {
  id: string;
  url: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

interface Comment {
  id: string;
  author: {
    name: string;
    role: 'USER' | 'ADMIN' | 'MODERATOR';
  };
  content: string;
  createdAt: string;
  upvotes: number;
  isApproved: boolean;
  attachments?: CommentAttachment[];
}

interface CommentSectionProps {
  reportId: string;
}

interface ApiComment {
  id: string;
  content: string;
  created_at: string;
  author?: string;
  author_display_name?: string;
  author_role?: string;
  upvotes?: number;
  status?: string;
  attachments?: CommentAttachment[];
}

const MAX_CHARS = 3000;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];

export function CommentSection({ reportId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Close emoji picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch comments from API
  const loadComments = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/reports/${reportId}/comments?limit=50`, {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 404) {
          setComments([]);
          return;
        }
        throw new Error('Failed to load comments');
      }

      const data = await response.json();

      const formattedComments: Comment[] = (data.comments || []).map((c: ApiComment) => ({
        id: c.id,
        author: {
          name: c.author_display_name || c.author || 'Anonymous',
          role: (c.author_role?.toUpperCase() || 'USER') as 'USER' | 'ADMIN' | 'MODERATOR',
        },
        content: c.content,
        createdAt: c.created_at,
        upvotes: c.upvotes || 0,
        isApproved: c.status === 'APPROVED',
        attachments: c.attachments || [],
      }));

      setComments(formattedComments);
    } catch (error) {
      console.error('Failed to load comments:', error);
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    for (const file of files) {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        toast.error(`Nepodporovaný typ súboru: ${file.name}. Povolené sú PNG, JPEG a PDF.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`Súbor ${file.name} je príliš veľký. Maximum je 10 MB.`);
        continue;
      }
      if (attachments.length >= 5) {
        toast.error('Maximum je 5 súborov na komentár.');
        break;
      }
      setAttachments(prev => [...prev, file]);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleEmojiSelect = (emoji: { native: string }) => {
    setNewComment(prev => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) {
      toast.error('Komentár nemôže byť prázdny');
      return;
    }

    if (newComment.trim().length < 10) {
      toast.error('Komentár musí mať aspoň 10 znakov');
      return;
    }

    if (newComment.length > MAX_CHARS) {
      toast.error(`Komentár nesmie presiahnuť ${MAX_CHARS} znakov`);
      return;
    }

    setIsSubmitting(true);
    setAuthError(false);

    try {
      // Create FormData for file uploads
      const formData = new FormData();
      formData.append('content', newComment);
      attachments.forEach((file) => {
        formData.append('attachments', file);
      });

      const response = await fetch(`/api/v1/reports/${reportId}/comments`, {
        method: 'POST',
        credentials: 'include',
        body: attachments.length > 0 ? formData : JSON.stringify({ content: newComment }),
        headers: attachments.length > 0 ? undefined : { 'Content-Type': 'application/json' },
      });

      if (response.status === 401 || response.status === 403) {
        setAuthError(true);
        toast.error('Pre pridanie komentára sa musíte prihlásiť');
        return;
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to post comment');
      }

      const responseData = await response.json();
      toast.success(responseData.message || 'Komentár bol odoslaný a čaká na schválenie administrátorom');
      setNewComment('');
      setAttachments([]);

      await loadComments();
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error(error instanceof Error ? error.message : 'Nepodarilo sa odoslať komentár');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvote = async (commentId: string) => {
    setComments(
      comments.map((c) =>
        c.id === commentId
          ? { ...c, upvotes: c.upvotes + 1 }
          : c
      )
    );
    toast.success('Hlas bol zaznamenaný');
  };

  const handleReport = (_commentId: string) => {
    toast.info('Komentár bol nahlásený moderátorovi');
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (type === 'application/pdf') return <FileText className="h-4 w-4" />;
    return <Paperclip className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="text-sm text-slate-500">Načítavam komentáre...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={newComment}
            onChange={(e) => {
              if (e.target.value.length <= MAX_CHARS) {
                setNewComment(e.target.value);
              }
            }}
            placeholder="Pridajte svoj komentár alebo skúsenosť s týmto podvodom... Emoji sú podporované! 😊"
            className="w-full min-h-[140px] px-4 py-4 rounded-xl border-2 border-slate-200 bg-white text-slate-900 text-sm
                       placeholder:text-slate-400 resize-none
                       focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10
                       transition-all duration-200"
            disabled={isSubmitting}
          />
          <div className={`absolute bottom-3 right-3 text-xs font-medium ${
            newComment.length > MAX_CHARS * 0.9
              ? newComment.length > MAX_CHARS
                ? 'text-red-500'
                : 'text-amber-500'
              : 'text-slate-400'
          }`}>
            {newComment.length}/{MAX_CHARS}
          </div>
        </div>

        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg border border-slate-200"
              >
                {getFileIcon(file.type)}
                <span className="text-sm text-slate-700 max-w-[150px] truncate">{file.name}</span>
                <span className="text-xs text-slate-500">({formatFileSize(file.size)})</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(index)}
                  className="p-1 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X className="h-3.5 w-3.5 text-slate-500" />
                </button>
              </div>
            ))}
          </div>
        )}

        {authError && (
          <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-200">
            <div className="flex items-center gap-3">
              <LogIn className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-800">Pre pridanie komentára sa musíte prihlásiť</p>
                <p className="text-xs text-amber-600 mt-1">Po prihlásení budete môcť pridávať komentáre a zdieľať svoje skúsenosti.</p>
              </div>
              <Link
                href="/auth/login"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Prihlásiť sa
              </Link>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            {/* File Upload Button */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.jpg,.jpeg,.pdf"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting || attachments.length >= 5}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Priložiť súbor (PNG, JPEG, PDF, max 10MB)"
            >
              <Paperclip className="h-4 w-4" />
              <span className="hidden sm:inline">Priložiť</span>
            </button>

            {/* Emoji Picker Button */}
            <div className="relative" ref={emojiPickerRef}>
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors disabled:opacity-50"
                title="Pridať emoji"
              >
                <Smile className="h-4 w-4" />
                <span className="hidden sm:inline">Emoji</span>
              </button>

              {showEmojiPicker && (
                <div className="absolute bottom-full left-0 mb-2 z-50">
                  <Picker
                    data={data}
                    onEmojiSelect={handleEmojiSelect}
                    theme="light"
                    locale="sk"
                    previewPosition="none"
                    skinTonePosition="none"
                  />
                </div>
              )}
            </div>

            <p className="text-xs text-slate-500 hidden md:block">
              PNG, JPEG, PDF do 10MB
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim() || newComment.trim().length < 10 || newComment.length > MAX_CHARS}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Odosiela sa...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Pridať komentár</span>
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
          💡 Váš komentár bude po odoslaní overený administrátorom pred zverejnením. Maximálne 3000 znakov.
        </p>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="py-12 text-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 mx-auto rounded-full bg-white border-2 border-slate-200 flex items-center justify-center mb-4 shadow-sm">
              <MessageSquare className="h-8 w-8 text-slate-400" />
            </div>
            <h4 className="text-lg font-semibold text-slate-700 mb-2">Zatiaľ žiadne komentáre</h4>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Buďte prvý, kto pridá komentár a pomôže ostatným s informáciami o tomto podvode.
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={`p-5 rounded-xl border-2 transition-all duration-200 ${
                comment.isApproved
                  ? 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
                  : 'bg-amber-50/50 border-amber-200 opacity-75'
              }`}
            >
              {/* Comment Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-bold text-white shadow-md">
                    {getInitials(comment.author.name)}
                  </div>

                  {/* Author Info */}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900">{comment.author.name}</span>
                      {comment.author.role === 'ADMIN' && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full border border-red-200">
                          Admin
                        </span>
                      )}
                      {comment.author.role === 'MODERATOR' && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
                          Moderátor
                        </span>
                      )}
                      {!comment.isApproved && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full border border-amber-200">
                          Čaká na schválenie
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      <RelativeTime date={comment.createdAt} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Comment Content */}
              <div className="mb-3 ml-13">
                <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{comment.content}</p>
              </div>

              {/* Comment Attachments */}
              {comment.attachments && comment.attachments.length > 0 && (
                <div className="mb-3 ml-13 flex flex-wrap gap-2">
                  {comment.attachments.map((attachment) => (
                    <a
                      key={attachment.id}
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors"
                    >
                      {attachment.fileType.startsWith('image/') ? (
                        <Image className="h-4 w-4 text-blue-500" />
                      ) : (
                        <FileText className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm text-slate-700 max-w-[150px] truncate">{attachment.fileName}</span>
                    </a>
                  ))}
                </div>
              )}

              {/* Comment Actions */}
              {comment.isApproved && (
                <div className="flex items-center gap-2 ml-13 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleUpvote(comment.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">{comment.upvotes}</span>
                  </button>

                  <button
                    onClick={() => handleReport(comment.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Flag className="h-3.5 w-3.5" />
                    <span className="text-xs">Nahlásiť</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
