"use client";

import { useEffect, useState, useMemo } from 'react';
import { AuthForm } from '@/components/auth-form';
import { PhoneCard } from '@/components/phone-card';
import { AddPhoneDialog } from '@/components/add-phone-dialog';
import { ActionLogs } from '@/components/action-logs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/use-auth';
import { usePhoneRecords } from '@/lib/hooks/use-phone-records';
import { Search, LogOut, Menu, CalendarIcon } from 'lucide-react';
import { initializeSupabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { PhoneRecord } from '@/types';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { UsersDialog } from '@/components/users-dialog';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export default function Home() {
  const { currentUser, login, logout } = useAuth();
  const { phoneRecords, logs, loading, logsLoading, addPhoneRecord, addComment, deleteComment, updateRating } = usePhoneRecords();
  const [searchQuery, setSearchQuery] = useState('');
  const [initializing, setInitializing] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAddPhoneDialogOpen, setIsAddPhoneDialogOpen] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    const init = async () => {
      try {
        await initializeSupabase();
      } catch (error) {
        console.error('Failed to initialize database:', error);
      } finally {
        setInitializing(false);
      }
    };
    init();
  }, []);

  const filteredRecords = useMemo(() => {
    const searchNumbers = searchQuery.replace(/\D/g, '');
    
    // Фильтрация по номеру телефона
    let records = (phoneRecords || []).filter(record => {
      const phoneNumbers = record.phoneNumber.replace(/\D/g, '');
      if (currentUser?.role === 'user') {
        return searchNumbers.length >= 10 && phoneNumbers.includes(searchNumbers);
      }
      return searchNumbers.length >= 10 ? phoneNumbers.includes(searchNumbers) : true;
    });
    
    // Для администратора добавляем фильтрацию по дате
    if (currentUser?.role === 'admin' && selectedDate) {
      const selectedDateStr = format(selectedDate, 'dd.MM.yyyy');
      
      records = records.filter(record => {
        const recordDateStr = record.dateAdded.split(',')[0].trim();
        return recordDateStr === selectedDateStr;
      });
    }
    
    // Добавляем размытие номеров для обычных пользователей
    records = records.map(record => ({
      ...record,
      blurred: currentUser?.role === 'user' && searchQuery.replace(/\D/g, '').length < 10,
    }));

    return records;
  }, [phoneRecords, searchQuery, currentUser?.role, selectedDate]);

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Инициализация...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <AuthForm onLogin={login} />
      </div>
    );
  }

  const handleAddPhoneRecord = async (record: Omit<PhoneRecord, 'id' | 'dateAdded' | 'comments'> & { comment?: string }) => {
    if (!currentUser) return;
    await addPhoneRecord({
      ...record,
      userId: currentUser.id,
      initialComment: record.comment
    });
  };

  const handleAddComment = async (phoneId: string, text: string, isPositive: boolean) => {
    if (!currentUser) return;
    await addComment(phoneId, text, isPositive, currentUser.id);
  };

  const handleDeleteComment = async (phoneId: string, commentId: string) => {
    if (!currentUser) return;
    await deleteComment(phoneId, commentId, currentUser.id);
  };

  const handleUpdateRating = async (phoneId: string, increment: boolean) => {
    if (!currentUser) return;
    await updateRating(phoneId, increment, currentUser.id);
  };

  function renderMobileMenu() {
    return (
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden ml-auto">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Открыть меню</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[250px] sm:w-[300px]">
          <SheetHeader>
            <SheetTitle>Меню</SheetTitle>
            <SheetDescription>
              Доступ к дополнительным функциям и возможностям
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            {currentUser?.role === 'admin' && (
              <>
                <ActionLogs logs={logs} loading={logsLoading} />
                <UsersDialog />
              </>
            )}
            <AddPhoneDialog 
              onAdd={handleAddPhoneRecord} 
              initialPhoneNumber={searchQuery}
              open={isAddPhoneDialogOpen}
              onOpenChange={setIsAddPhoneDialogOpen}
              currentUser={currentUser}
              disabled={editingCardId !== null}
            />
            <Button variant="outline" onClick={logout} className="w-full gap-2">
              <LogOut className="w-4 h-4" />
              Выйти
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {editingCardId && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={(e) => e.preventDefault()}
          onMouseDown={(e) => e.preventDefault()}
          onMouseUp={(e) => e.preventDefault()}
          onTouchStart={(e) => e.preventDefault()}
          onTouchEnd={(e) => e.preventDefault()}
        />
      )}
      <div className="container mx-auto py-4 px-4 sm:py-6 sm:px-6 md:py-8">
        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold">База телефонов с отзывами</h1>
            <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 sm:gap-4">
              {currentUser?.role === 'admin' && (
                <>
                  <ActionLogs logs={logs} loading={logsLoading} />
                  <UsersDialog />
                </>
              )}
              <AddPhoneDialog 
                onAdd={handleAddPhoneRecord} 
                initialPhoneNumber={searchQuery}
                open={isAddPhoneDialogOpen}
                onOpenChange={setIsAddPhoneDialogOpen}
                currentUser={currentUser}
                disabled={editingCardId !== null}
              />
              <Button 
                variant="outline" 
                onClick={logout} 
                className="gap-2"
                disabled={editingCardId !== null}
              >
                <LogOut className="w-4 h-4" />
                <span>Выйти</span>
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                className="pl-10 h-10 text-base"
                placeholder="Поиск номера телефона..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Поиск номера телефона"
                disabled={editingCardId !== null}
                style={{ fontSize: '16px' }}
              />
            </div>
            
            {currentUser?.role === 'admin' && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal h-10",
                      !selectedDate && "text-muted-foreground"
                    )}
                    disabled={editingCardId !== null}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, "dd.MM.yyyy", { locale: ru })
                    ) : (
                      <span>Выберите дату</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    locale={ru}
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredRecords.map((record) => (
                  <PhoneCard
                    key={record.id}
                    record={record}
                    onAddComment={handleAddComment}
                    onDeleteComment={handleDeleteComment}
                    onUpdateRating={handleUpdateRating}
                    currentUser={currentUser}
                    onCommentEditStart={() => setEditingCardId(record.id)}
                    onCommentEditEnd={() => setEditingCardId(null)}
                    disabled={editingCardId !== null && editingCardId !== record.id}
                    className={cn(
                      "relative",
                      editingCardId === record.id && "z-50"
                    )}
                  />
                ))}
              </div>
              {filteredRecords.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                  <p className="text-gray-600 mb-4">
                    {currentUser?.role === 'admin' ? 
                      `Номера телефонов за ${format(selectedDate || new Date(), "dd.MM.yyyy", { locale: ru })} не найдены.` : 
                      `Номер ${searchQuery} не найден в базе данных.`}
                    {currentUser?.role === 'user' && searchQuery.replace(/\D/g, '').length >= 10 && " Вы можете добавить его:"}
                  </p>
                  {currentUser?.role === 'user' && searchQuery.replace(/\D/g, '').length >= 10 && (
                    <Button 
                      onClick={() => setIsAddPhoneDialogOpen(true)}
                      className="gap-2"
                      disabled={editingCardId !== null}
                    >
                      Добавить номер
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}