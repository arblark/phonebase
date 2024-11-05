"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { PhoneRecord } from '@/types';
import { cn } from '@/lib/utils';

interface AddPhoneDialogProps {
  onAdd: (record: Omit<PhoneRecord, 'id' | 'dateAdded' | 'comments'> & { comment?: string }) => void;
}

export function AddPhoneDialog({ onAdd }: AddPhoneDialogProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isPositive, setIsPositive] = useState(false);
  const [comment, setComment] = useState('');
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onAdd({
      phoneNumber,
      isDangerous: !isPositive,
      rating: isPositive ? 1 : -1,
      comment: comment.trim() || undefined
    });
    
    setOpen(false);
    setPhoneNumber('');
    setIsPositive(false);
    setComment('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Добавить номер</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить новый номер</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Номер телефона</Label>
            <Input
              id="phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+7 999 999-99-99"
              required
            />
          </div>
          
          <div className="flex items-center justify-between space-x-2 p-4 rounded-lg border">
            <Label htmlFor="rating-type" className="font-medium">Норм или НЕнорм</Label>
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-sm transition-colors",
                isPositive ? "text-green-600" : "text-red-600"
              )}>
                {isPositive ? "Positive" : "Negative"}
              </span>
              <Switch
                id="rating-type"
                checked={isPositive}
                onCheckedChange={setIsPositive}
                className={cn(
                  "transition-colors",
                  isPositive ? "bg-green-500" : "bg-red-500",
                  "hover:bg-green-600 data-[state=checked]:bg-green-500",
                  "hover:bg-red-600 data-[state=unchecked]:bg-red-500"
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Комментарий</Label>
            <Input
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Добавьте комментарий..."
            />
          </div>

          <Button 
            type="submit"
            className={cn(
              "w-full transition-colors",
              isPositive ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
            )}
          >
            Добавить номер
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}