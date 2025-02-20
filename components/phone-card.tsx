"use client";

import { useState, useRef } from 'react';
import { PhoneRecord, User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThumbsUp, ThumbsDown, Trash2, ShieldAlert, ShieldCheck, CircleUser, Plus, Minus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhoneCardProps {
  record: PhoneRecord;
  onAddComment: (id: string, comment: string, isPositive: boolean) => void;
  onDeleteComment: (phoneId: string, commentId: string) => void;
  onUpdateRating?: (phoneId: string, increment: boolean) => void;
  currentUser: User | null;
  onCommentEditStart?: () => void;
  onCommentEditEnd?: () => void;
  disabled?: boolean;
  className?: string;
}

export function PhoneCard({ 
  record, 
  onAddComment, 
  onDeleteComment, 
  onUpdateRating, 
  currentUser,
  onCommentEditStart,
  onCommentEditEnd,
  disabled,
  className
}: PhoneCardProps) {
  const [newComment, setNewComment] = useState('');
  const [isPositive, setIsPositive] = useState(true);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [updatingRating, setUpdatingRating] = useState<'increment' | 'decrement' | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const commentInputRef = useRef<HTMLInputElement>(null);

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!isEditing && value.trim() && currentUser?.role === 'user') {
      setIsEditing(true);
      onCommentEditStart?.();
    }
    setNewComment(value);
  };

  const handleAddComment = async () => {
    if (newComment.trim()) {
      setIsAddingComment(true);
      try {
        await onAddComment(record.id, newComment, isPositive);
        setNewComment('');
        setIsPositive(true);
        if (currentUser?.role === 'user') {
          setIsEditing(false);
          onCommentEditEnd?.();
        }
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

  const handleUpdateRating = async (increment: boolean) => {
    setUpdatingRating(increment ? 'increment' : 'decrement');
    try {
      await onUpdateRating?.(record.id, increment);
    } finally {
      setUpdatingRating(null);
    }
  };

  return (
    <Card className={cn(
      "w-full border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
      record.isDangerous ? "border-red-500" : "border-green-500",
      "hover:border-opacity-75 hover:scale-[1.02]",
      disabled && "opacity-50 pointer-events-none",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold">
          <span className={cn(
            record.blurred ? "blur-sm select-none" : "",
            "cursor-default"
          )}>
            {record.phoneNumber}
          </span>
        </CardTitle>
        <div className="flex items-center gap-2">
          {currentUser?.role === 'admin' && (
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleUpdateRating(false)}
                disabled={updatingRating === 'decrement'}
                className="h-7 w-7 p-0"
              >
                {updatingRating === 'decrement' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Minus className="h-4 w-4" />
                )}
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
                onClick={() => handleUpdateRating(true)}
                disabled={updatingRating === 'increment'}
                className="h-7 w-7 p-0"
              >
                {updatingRating === 'increment' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
          {currentUser?.role === 'user' && (
            <span className={cn(
              "font-medium transition-colors min-w-[2rem] text-center",
              record.isDangerous ? "text-red-500" : "text-green-500"
            )}>
              {record.rating}
            </span>
          )}
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
            <span>Добавлено: {record.dateAdded}</span>
          </div>
          <div className="space-y-1">
            {record.comments.map((comment) => (
              <div 
                key={comment.id} 
                className={cn(
                  "flex items-start justify-between text-sm p-2 rounded transition-all duration-200",
                  "hover:shadow-sm",
                  comment.isPositive ? "bg-green-50" : "bg-red-50"
                )}
              >
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  {comment.isPositive ? (
                    <ThumbsUp className="w-4 h-4 text-green-500 fill-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <ThumbsDown className="w-4 h-4 text-red-500 fill-red-500 flex-shrink-0 mt-0.5" />
                  )}
                  <span className="flex-1 break-words">{comment.text}</span>
                  <div className="flex flex-col items-end gap-1 text-xs text-gray-500 flex-shrink-0 ml-2">
                    <div className="flex items-center gap-1">
                      <CircleUser className="w-3 h-3" />
                      <span>{comment.userName}</span>
                    </div>
                    <span>{comment.dateAdded.split(',')[0]}</span>
                    <span>{comment.dateAdded.split(',')[1]}</span>
                  </div>
                </div>
                {currentUser?.role === 'admin' && (
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
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <Input
              ref={commentInputRef}
              placeholder="Текст"
              value={newComment}
              onChange={handleCommentChange}
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
                disabled={!newComment.trim()}
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
                disabled={!newComment.trim()}
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
          {isEditing && currentUser?.role === 'user' && (
            <p className="text-sm text-yellow-600 mt-2">
              Сохраните комментарий, прежде чем продолжить
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}