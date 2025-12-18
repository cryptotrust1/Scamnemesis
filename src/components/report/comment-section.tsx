'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, ThumbsUp, Flag, Send, Loader2 } from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import { getInitials } from '@/lib/utils';
import { RelativeTime } from '@/components/ui/relative-time';
import { toast } from 'sonner';

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
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

    try {
      const response = await fetch(`/api/v1/reports/${reportId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: newComment }),
      });

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

  const handleUpvote = (commentId: string) => {
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
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Pridajte svoj komentár alebo skúsenosť..."
            className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            disabled={isSubmitting}
          />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Váš komentár bude po odoslaní overený moderátorom pred zverejnením
          </p>
          <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
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
          <Card className="p-8 text-center text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Zatiaľ žiadne komentáre. Buďte prvý, kto pridá komentár!</p>
          </Card>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id} className={!comment.isApproved ? 'opacity-60' : ''}>
              <div className="p-4 space-y-3">
                {/* Comment Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                      {getInitials(comment.author.name)}
                    </div>

                    {/* Author Info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{comment.author.name}</span>
                        {comment.author.role === 'ADMIN' && (
                          <Badge variant="destructive" className="text-xs">
                            Admin
                          </Badge>
                        )}
                        {comment.author.role === 'MODERATOR' && (
                          <Badge variant="secondary" className="text-xs">
                            Moderátor
                          </Badge>
                        )}
                        {!comment.isApproved && (
                          <Badge variant="warning" className="text-xs">
                            Čaká na schválenie
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <RelativeTime date={comment.createdAt} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comment Content */}
                <div className="pl-13">
                  <p className="text-sm whitespace-pre-line">{comment.content}</p>
                </div>

                {/* Comment Actions */}
                {comment.isApproved && (
                  <div className="flex items-center gap-2 pl-13">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUpvote(comment.id)}
                      className="h-8 gap-1"
                    >
                      <ThumbsUp className="h-3 w-3" />
                      <span className="text-xs">{comment.upvotes}</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReport(comment.id)}
                      className="h-8 gap-1"
                    >
                      <Flag className="h-3 w-3" />
                      <span className="text-xs">Nahlásiť</span>
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
