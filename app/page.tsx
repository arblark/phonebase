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
import { Search, LogOut, Menu } from 'lucide-react';
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

export default function Home() {
  const { currentUser, login, logout } = useAuth();
  const { phoneRecords, logs, loading, logsLoading, addPhoneRecord, addComment, deleteComment, updateRating } = usePhoneRecords();
  const [searchQuery, setSearchQuery] = useState('');
  const [initializing, setInitializing] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAddPhoneDialogOpen, setIsAddPhoneDialogOpen] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);

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
    const records = (phoneRecords || []).filter(record => {
      const phoneNumbers = record.phoneNumber.replace(/\D/g, '');
      if (currentUser?.role === 'user') {
        return searchNumbers.length >= 10 && phoneNumbers.includes(searchNumbers);
      }
      return searchNumbers.length >= 10 ? phoneNumbers.includes(searchNumbers) : true;
    }).map(record => ({
      ...record,
      blurred: currentUser?.role === 'user' && searchQuery.replace(/\D/g, '').length < 10,
    }));

    return currentUser?.role === 'admin' ? records.slice(0, 6) : records;
  }, [phoneRecords, searchQuery, currentUser?.role]);

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
            <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
              <div className="hidden md:flex items-center gap-4">
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
                  <span className="hidden sm:inline">Выйти</span>
                </Button>
              </div>
              {renderMobileMenu()}
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              className="pl-10 h-10"
              placeholder="Поиск номера телефона..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Поиск номера телефона"
              disabled={editingCardId !== null}
            />
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
              {currentUser?.role === 'user' && 
               searchQuery.replace(/\D/g, '').length >= 10 && 
               filteredRecords.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                  <p className="text-gray-600 mb-4">
                    Номер {searchQuery} не найден в базе данных.
                    {currentUser?.role === 'user' && " Вы можете добавить его:"}
                  </p>
                  <Button 
                    onClick={() => setIsAddPhoneDialogOpen(true)}
                    className="gap-2"
                    disabled={editingCardId !== null}
                  >
                    Добавить номер
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}