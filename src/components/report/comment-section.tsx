'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, ThumbsUp, Flag, Send, Loader2, User, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getInitials } from '@/lib/utils';
import { RelativeTime } from '@/components/ui/relative-time';
import { toast } from 'sonner';
import Link from 'next/link';
import { useParams } from 'next/navigation';

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
}

export function CommentSection({ reportId }: CommentSectionProps) {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  // Fetch comments from API
  const loadComments = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/reports/${reportId}/comments?limit=50`, {
        credentials: 'include',
      });

      if (!response.ok) {
        // If 404, report might not exist or no comments yet - not an error
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
      }));

      setComments(formattedComments);
    } catch (error) {
      console.error('Failed to load comments:', error);
      // Don't show error toast on load - gracefully handle by showing empty state
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

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

    setIsSubmitting(true);
    setAuthError(false);

    try {
      const response = await fetch(`/api/v1/reports/${reportId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: newComment }),
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

      const data = await response.json();
      toast.success(data.message || 'Komentár bol odoslaný a čaká na schválenie');
      setNewComment('');

      // Reload comments to show the new one (if it's auto-approved)
      await loadComments();
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error(error instanceof Error ? error.message : 'Nepodarilo sa odoslať komentár');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvote = async (commentId: string) => {
    // Optimistic update
    setComments(
      comments.map((c) =>
        c.id === commentId
          ? { ...c, upvotes: c.upvotes + 1 }
          : c
      )
    );
    toast.success('Hlas bol zaznamenaný');
    // Note: Upvote API endpoint would need to be implemented for persistence
  };

  const handleReport = (_commentId: string) => {
    toast.info('Komentár bol nahlásený moderátorovi');
    // Note: Report comment API endpoint would need to be implemented
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
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Pridajte svoj komentár alebo skúsenosť s týmto podvodom..."
            className="w-full min-h-[120px] px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50/50 text-sm
                       placeholder:text-slate-400 resize-none
                       focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10
                       transition-all duration-200"
            disabled={isSubmitting}
          />
          <div className="absolute bottom-3 right-3 text-xs text-slate-400">
            {newComment.length}/2000
          </div>
        </div>

        {authError && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <div className="flex items-center gap-3">
              <LogIn className="h-5 w-5 text-amber-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800">Pre pridanie komentára sa musíte prihlásiť</p>
                <p className="text-xs text-amber-600 mt-1">Po prihlásení budete môcť pridávať komentáre a zdieľať svoje skúsenosti.</p>
              </div>
              <Link href="/auth/login">
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                  Prihlásiť sa
                </Button>
              </Link>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            Váš komentár bude po odoslaní overený moderátorom pred zverejnením
          </p>
          <Button
            type="submit"
            disabled={isSubmitting || !newComment.trim() || newComment.trim().length < 10}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {isSubmitting ? 'Odosiela sa...' : 'Pridať komentár'}
          </Button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-slate-400" />
            </div>
            <h4 className="text-lg font-medium text-slate-700 mb-2">Zatiaľ žiadne komentáre</h4>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Buďte prvý, kto pridá komentár a pomôže ostatným s informáciami o tomto podvode.
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={`p-5 rounded-xl border transition-all duration-200 ${
                comment.isApproved
                  ? 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                  : 'bg-amber-50/50 border-amber-200 opacity-75'
              }`}
            >
              {/* Comment Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-sm font-semibold text-white shadow-sm">
                    {getInitials(comment.author.name)}
                  </div>

                  {/* Author Info */}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900">{comment.author.name}</span>
                      {comment.author.role === 'ADMIN' && (
                        <Badge variant="danger" className="text-xs">
                          Admin
                        </Badge>
                      )}
                      {comment.author.role === 'MODERATOR' && (
                        <Badge variant="info" className="text-xs">
                          Moderátor
                        </Badge>
                      )}
                      {!comment.isApproved && (
                        <Badge variant="warning" className="text-xs">
                          Čaká na schválenie
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      <RelativeTime date={comment.createdAt} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Comment Content */}
              <div className="pl-13 mb-3">
                <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{comment.content}</p>
              </div>

              {/* Comment Actions */}
              {comment.isApproved && (
                <div className="flex items-center gap-2 pl-13 pt-3 border-t border-slate-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUpvote(comment.id)}
                    className="h-8 gap-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">{comment.upvotes}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReport(comment.id)}
                    className="h-8 gap-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Flag className="h-3.5 w-3.5" />
                    <span className="text-xs">Nahlásiť</span>
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
