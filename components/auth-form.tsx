"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';

interface AuthFormProps {
  onLogin: (username: string, password: string) => Promise<{ 
    success: boolean; 
    message?: string;
  }>;
}

export function AuthForm({ onLogin }: AuthFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { requestDailyPassword } = useAuth();

  const handleRequestPassword = async () => {
    if (!username) {
      setError('Введите имя пользователя');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await requestDailyPassword(username);
      if (result.success) {
        setSuccessMessage('Пароль отправлен в Telegram');
      } else {
        setError(result.message || 'Не удалось отправить пароль');
      }
    } catch (error) {
      setError('Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const result = await onLogin(username, password);
      if (!result.success) {
        setError(result.message || 'Ошибка входа');
      }
    } catch (error) {
      setError('Произошла ошибка при входе');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Вход в систему</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Имя пользователя"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>
          
          {error && (
            <p className="text-sm text-red-500 bg-red-50 p-2 rounded">
              {error}
            </p>
          )}

          {successMessage && (
            <p className="text-sm text-green-500 bg-green-50 p-2 rounded">
              {successMessage}
            </p>
          )}
          
          <div className="flex gap-2">
            <Button 
              type="submit" 
              className="flex-1"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Вход...
                </span>
              ) : (
                'Вход'
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleRequestPassword}
              disabled={loading}
            >
              Запросить пароль
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}