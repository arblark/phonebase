"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, Loader2, Edit2, Save, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { User } from '@/types';

interface EditableUser extends User {
  isEditing?: boolean;
}

export function UsersDialog() {
  const [users, setUsers] = useState<EditableUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [editedUser, setEditedUser] = useState<Partial<User> | null>(null);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'user')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (user: User) => {
    setEditedUser({
      ...user,
      id: user.id
    });
  };

  const handleSave = async () => {
    if (!editedUser?.id) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({
          telegram_id: editedUser.telegram_id,
          daily_password: editedUser.daily_password,
          password_expires_at: editedUser.password_expires_at,
          password_requested_at: editedUser.password_requested_at,
          device_id: editedUser.device_id
        })
        .eq('id', editedUser.id);

      if (error) throw error;
      
      await fetchUsers();
      setEditedUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return 'Не указано';
    return new Date(date).toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Users className="w-4 h-4" />
          Пользователи
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Управление пользователями</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[500px] pr-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="p-4 bg-gray-50 rounded-lg space-y-2 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{user.username}</span>
                    {editedUser?.id === user.id ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleSave}
                          className="h-8 px-2"
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditedUser(null)}
                          className="h-8 px-2"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(user)}
                        className="h-8 px-2"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid gap-2">
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-sm text-gray-500">ID устройства:</span>
                      {editedUser?.id === user.id ? (
                        <Input
                          value={editedUser.device_id || ''}
                          onChange={(e) => setEditedUser({
                            ...editedUser,
                            device_id: e.target.value
                          })}
                          className="h-8"
                        />
                      ) : (
                        <span className="text-sm">{user.device_id || 'Не указан'}</span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-sm text-gray-500">Telegram ID:</span>
                      {editedUser?.id === user.id ? (
                        <Input
                          value={editedUser.telegram_id || ''}
                          onChange={(e) => setEditedUser({
                            ...editedUser,
                            telegram_id: e.target.value
                          })}
                          className="h-8"
                        />
                      ) : (
                        <span className="text-sm">{user.telegram_id || 'Не указан'}</span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-sm text-gray-500">Временный пароль:</span>
                      {editedUser?.id === user.id ? (
                        <Input
                          value={editedUser.daily_password || ''}
                          onChange={(e) => setEditedUser({
                            ...editedUser,
                            daily_password: e.target.value
                          })}
                          className="h-8"
                        />
                      ) : (
                        <span className="text-sm">{user.daily_password || 'Не указан'}</span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-sm text-gray-500">Время получения пароля:</span>
                      <span className="text-sm">
                        {formatDate(user.password_requested_at)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-sm text-gray-500">Срок действия пароля:</span>
                      <span className="text-sm">
                        {formatDate(user.password_expires_at)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 