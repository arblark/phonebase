"use client";

import { useState, useEffect, useRef } from 'react';
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
import InputMask from 'react-input-mask';
import { Loader2 } from 'lucide-react';

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
  const [isPositive, setIsPositive] = useState(false);
  const [comment, setComment] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    setIsSubmitting(true);
    
    try {
      // Форматируем номер для отправки
      const formattedNumber = `8${phoneNumber}`;
      
      await onAdd({
        phoneNumber: formattedNumber,
        isDangerous: !isPositive,
        rating: isPositive ? 1 : -1,
        comment: comment.trim() || undefined
      });
      
      handleOpenChange(false);
      setPhoneNumber('');
      setIsPositive(false);
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
      {!open && (
        <DialogTrigger asChild>
          <Button disabled={disabled}>Добавить номер</Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить новый номер</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Номер телефона</Label>
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
                    style={{ opacity: phoneNumber ? 1 : 0.5 }}
                  />
                )}
              </InputMask>
              {error && (
                <p className="text-sm text-red-500 mt-1">{error}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between space-x-2 p-4 rounded-lg border">
            <Label htmlFor="rating-type" className="font-medium">Норм или НЕнорм</Label>
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-sm transition-colors",
                isPositive ? "text-green-600" : "text-red-600"
              )}>
                {isPositive ? "Хороший" : "Плохой"}
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