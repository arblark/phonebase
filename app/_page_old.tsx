"use client";

import { useEffect, useState } from 'react';
import { AuthForm } from '@/components/auth-form';
import { PhoneCard } from '@/components/phone-card';
import { AddPhoneDialog } from '@/components/add-phone-dialog';
import { ActionLogs } from '@/components/action-logs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/use-auth';
import { usePhoneRecords } from '@/lib/hooks/use-phone-records';
import { Search, LogOut } from 'lucide-react';
import { initializeSupabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { PhoneRecord } from '@/types';

export default function Home() {
  const { currentUser, login, logout } = useAuth();
  const { phoneRecords, logs, loading, logsLoading, addPhoneRecord, addComment, deleteComment } = usePhoneRecords();
  const [searchQuery, setSearchQuery] = useState('');
  const [initializing, setInitializing] = useState(true);

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

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Initializing...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <AuthForm onLogin={login} />
      </div>
    );
  }

  const filteredRecords = (phoneRecords || []).filter(record => {
    const searchNumbers = searchQuery.replace(/\D/g, '');
    const phoneNumbers = record.phoneNumber.replace(/\D/g, '');
    return searchNumbers.length >= 3 ? phoneNumbers.includes(searchNumbers) : true;
  }).map(record => ({
    ...record,
    blurred: currentUser.role === 'user' && searchQuery.replace(/\D/g, '').length < 3,
  }));

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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Phone Number Tracker</h1>
          <div className="flex items-center gap-4">
            {currentUser.role === 'admin' && <ActionLogs logs={logs} loading={logsLoading} />}
            <AddPhoneDialog onAdd={handleAddPhoneRecord} />
            <Button variant="outline" onClick={logout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            className="pl-10"
            placeholder="Search phone numbers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredRecords.map((record) => (
              <PhoneCard
                key={record.id}
                record={record}
                onAddComment={handleAddComment}
                onDeleteComment={handleDeleteComment}
                isAdmin={currentUser.role === 'admin'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}