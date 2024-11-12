"use client";

import { useState } from 'react';
import { PhoneRecord } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThumbsUp, ThumbsDown, Trash2, ShieldAlert, ShieldCheck, User, Plus, Minus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhoneCardProps {
  record: PhoneRecord;
  onAddComment: (id: string, comment: string, isPositive: boolean) => void;
  onDeleteComment: (phoneId: string, commentId: string) => void;
  onUpdateRating?: (phoneId: string, increment: boolean) => void;
}

export function PhoneCard({ record, onAddComment, onDeleteComment, onUpdateRating }: PhoneCardProps) {
  const [newComment, setNewComment] = useState('');
  const [isPositive, setIsPositive] = useState(true);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  const handleAddComment = async () => {
    if (newComment.trim()) {
      setIsAddingComment(true);
      try {
        await onAddComment(record.id, newComment, isPositive);
        setNewComment('');
        setIsPositive(true);
      } finally {
        setIsAddingComment(false);
      }
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    setDeletingCommentId(commentId);
    try {
      await onDeleteComment(record.id, commentId);
    } finally {
      setDeletingCommentId(null);
    }
  };

  return (
    <Card className={cn(
      "w-full border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
      record.isDangerous ? "border-red-500" : "border-green-500",
      "hover:border-opacity-75 hover:scale-[1.02]"
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold">
          <span className={record.blurred ? "blur-sm" : ""}>
            {record.phoneNumber}
          </span>
        </CardTitle>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdateRating?.(record.id, false)}
              className="h-7 w-7 p-0"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className={cn(
              "font-medium transition-colors min-w-[2rem] text-center",
              record.isDangerous ? "text-red-500" : "text-green-500"
            )}>
              {record.rating}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdateRating?.(record.id, true)}
              className="h-7 w-7 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {record.isDangerous ? (
            <ShieldAlert className="w-5 h-5 text-red-500 transition-transform hover:scale-110" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-green-500 transition-transform hover:scale-110" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-sm text-gray-500">
            Добавлено: {record.dateAdded}
          </div>
          <div className="space-y-1">
            {record.comments.map((comment) => (
              <div 
                key={comment.id} 
                className={cn(
                  "flex items-center justify-between text-sm p-2 rounded transition-all duration-200",
                  "hover:shadow-sm",
                  comment.isPositive ? "bg-green-50" : "bg-red-50"
                )}
              >
                <div className="flex items-center gap-2 flex-1">
                  {comment.isPositive ? (
                    <ThumbsUp className="w-4 h-4 text-green-500 fill-green-500 flex-shrink-0" />
                  ) : (
                    <ThumbsDown className="w-4 h-4 text-red-500 fill-red-500 flex-shrink-0" />
                  )}
                  <span className="flex-1 break-words">{comment.text}</span>
                  <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                    <User className="w-3 h-3" />
                    <span>{comment.userName}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteComment(comment.id)}
                  disabled={deletingCommentId === comment.id}
                  className="ml-2 flex-shrink-0 hover:bg-red-100 transition-colors"
                >
                  {deletingCommentId === comment.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 text-red-500" />
                  )}
                </Button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <Input
              placeholder="Текст"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="transition-all duration-200 focus:ring-2"
            />
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={isPositive ? "default" : "outline"}
                onClick={() => setIsPositive(true)}
                className={cn(
                  "transition-all duration-200",
                  isPositive ? "bg-green-500 hover:bg-green-600" : ""
                )}
              >
                <ThumbsUp className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={!isPositive ? "default" : "outline"}
                onClick={() => setIsPositive(false)}
                className={cn(
                  "transition-all duration-200",
                  !isPositive ? "bg-red-500 hover:bg-red-600" : ""
                )}
              >
                <ThumbsDown className="w-4 h-4" />
              </Button>
            </div>
            <Button 
              onClick={handleAddComment} 
              size="sm"
              disabled={isAddingComment || !newComment.trim()}
              className="transition-transform hover:scale-105"
            >
              {isAddingComment ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Сохранить"
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}