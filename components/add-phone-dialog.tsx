"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneRecord } from '@/types';
import { cn } from '@/lib/utils';
import InputMask from 'react-input-mask';
import { Loader2 } from 'lucide-react';
import { Plus, ThumbsUp, ThumbsDown } from 'lucide-react';

interface AddPhoneDialogProps {
  onAdd: (record: Omit<PhoneRecord, 'id' | 'dateAdded' | 'comments'> & { comment?: string }) => void;
  initialPhoneNumber?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  currentUser: any;
  disabled?: boolean;
}

export function AddPhoneDialog({ onAdd, initialPhoneNumber = '', open, onOpenChange, currentUser, disabled }: AddPhoneDialogProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isPositive, setIsPositive] = useState<boolean | null>(null);
  const [comment, setComment] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function formatInitialPhoneNumber(number: string) {
    // Убираем все нецифровые символы
    const digits = number.replace(/\D/g, '');
    // Если номер начинается с 8 или 7, используем оставшиеся цифры
    const cleanDigits = digits.startsWith('8') || digits.startsWith('7')
      ? digits.slice(1)
      : digits;
    // Берем только первые 10 цифр
    return cleanDigits.slice(0, 10);
  }

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
    if (newOpen) {
      if (initialPhoneNumber) {
        setPhoneNumber(formatInitialPhoneNumber(initialPhoneNumber));
      } else {
        setPhoneNumber('');
      }
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Убираем первую 8 и все нецифровые символы
    const digits = value.slice(1).replace(/\D/g, '');
    setPhoneNumber(digits);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCommentError(null);
    setRatingError(null);
    
    // Проверяем, что комментарий не пустой
    if (!comment.trim()) {
      setCommentError("Комментарий обязателен");
      return;
    }
    
    // Проверяем, что тип номера выбран
    if (isPositive === null) {
      setRatingError("Сначала укажите Хороший или Плохой");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Форматируем номер для отправки
      const formattedNumber = `8${phoneNumber}`;
      
      await onAdd({
        phoneNumber: formattedNumber,
        isDangerous: !isPositive,
        rating: isPositive ? 1 : -1,
        comment: comment.trim()
      });
      
      handleOpenChange(false);
      setPhoneNumber('');
      setIsPositive(null);
      setComment('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при добавлении номера');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Обновляем номер телефона при изменении initialPhoneNumber
  useEffect(() => {
    if (initialPhoneNumber) {
      setPhoneNumber(formatInitialPhoneNumber(initialPhoneNumber));
    }
  }, [initialPhoneNumber]);

  // Форматируем номер для отображения
  const displayValue = phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '($1)$2$3');

  return (
    <Dialog open={open ?? isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="default" 
          className="gap-2 text-base"
          disabled={disabled}
        >
          <Plus className="w-4 h-4" />
          Добавить номер
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Добавить номер телефона</DialogTitle>
          <DialogDescription className="text-base">
            Добавьте новый номер телефона с комментарием
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-base">Номер телефона</Label>
            <div className="relative">
              <InputMask
                mask="8(999)999-99-99"
                value={`8${phoneNumber}`}
                onChange={handlePhoneChange}
                alwaysShowMask
                maskChar="_"
              >
                {(inputProps: any) => (
                  <Input
                    {...inputProps}
                    ref={inputRef}
                    id="phone"
                    required
                    className={cn(
                      inputProps.className,
                      "text-foreground placeholder:text-muted-foreground/50",
                      "[&>*]:opacity-50 [&>*]:text-muted-foreground",
                      error && "border-red-500 focus-visible:ring-red-500"
                    )}
                    style={{ opacity: phoneNumber ? 1 : 0.5, fontSize: '16px' }}
                  />
                )}
              </InputMask>
              {error && (
                <p className="text-sm text-red-500 mt-1">{error}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment" className="text-base">Комментарий <span className="text-red-500">*</span></Label>
            <Input
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Добавьте комментарий..."
              className={cn(
                "text-base",
                commentError && "border-red-500 focus-visible:ring-red-500"
              )}
              style={{ fontSize: '16px' }}
              required
            />
            {commentError && (
              <p className="text-sm text-red-500 mt-1">{commentError}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label className="text-base">Поставить оценку <span className="text-red-500">*</span></Label>
            <div className="flex items-center gap-3">
              <Button 
                type="button"
                className={cn(
                  "flex-1 gap-2",
                  isPositive === true 
                    ? "bg-green-500 hover:bg-green-600 text-white" 
                    : "bg-slate-500 hover:bg-slate-800 text-white"
                )}
                onClick={() => setIsPositive(true)}
              >
                <ThumbsUp className="w-4 h-4" />
                Хороший
              </Button>
              <Button 
                type="button"
                className={cn(
                  "flex-1 gap-2",
                  isPositive === false 
                    ? "bg-red-500 hover:bg-red-600 text-white" 
                    : "bg-slate-500 hover:bg-slate-800 text-white"
                )}
                onClick={() => setIsPositive(false)}
              >
                <ThumbsDown className="w-4 h-4" />
                Плохой
              </Button>
            </div>
            {ratingError && (
              <p className="text-sm text-red-500 mt-1">{ratingError}</p>
            )}
          </div>

          <Button 
            type="submit"
            className={cn(
              "w-full transition-colors text-base",
              isPositive === true ? "bg-green-500 hover:bg-green-600" : 
              isPositive === false ? "bg-red-500 hover:bg-red-600" :
              "bg-primary hover:bg-primary/90"
            )}
            disabled={phoneNumber.length < 10 || isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Добавление...</span>
              </div>
            ) : (
              "Добавить номер"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}