"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Loader2, Eye, EyeOff } from 'lucide-react';

interface AuthFormProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
}

export function AuthForm({ onLogin }: AuthFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Введите имя и пароль');
      return;
    }

    setError('');
    setLoading(true);
    
    try {
      const success = await onLogin(username, password);
      if (!success) {
        setError('Кривое имя или пароль');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="w-5 h-5" />
          Login
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Логин"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              required
              className="w-full"
              autoComplete="username"
            />
          </div>
          <div className="space-y-2 flex items-stretch">
            <div className="flex-grow relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                className="w-full pr-10"
                autoComplete="current-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          {error && (
            <p className="text-sm text-red-500 bg-red-50 p-2 rounded">
              {error}
            </p>
          )}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Logging in...
              </span>
            ) : (
              'Вход'
            )}
          </Button>
        </form>
        <div className="mt-4 text-sm text-gray-500">
          <p className="font-medium mb-1">Пароли узнать у админа:</p>
          <div className="space-y-1 bg-gray-50 p-2 rounded">
            <p>Admin: admin/***</p>
            <p>User: user/***</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}