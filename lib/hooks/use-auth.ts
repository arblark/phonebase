"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@/types';

const DAILY_PASSWORD_DURATION = 24 * 60 * 60 * 1000; // 24 часа в миллисекундах

interface StoredSession {
  user: {
    id: string;
    username: string;
    role: 'admin' | 'user';
    password: string;
    created_at: string;
  };
  expiresAt: number;
}

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sessionTimer, setSessionTimer] = useState<NodeJS.Timeout | null>(null);

  const clearSession = () => {
    setCurrentUser(null);
    if (sessionTimer) {
      clearTimeout(sessionTimer);
      setSessionTimer(null);
    }
    localStorage.removeItem('userSession');
  };

  useEffect(() => {
    const checkStoredSession = () => {
      const storedSession = localStorage.getItem('userSession');
      if (storedSession) {
        const session: StoredSession = JSON.parse(storedSession);
        const now = Date.now();
        
        if (now < session.expiresAt) {
          setCurrentUser(session.user);
          const timeLeft = session.expiresAt - now;
          const timer = setTimeout(clearSession, timeLeft);
          setSessionTimer(timer);
        } else {
          clearSession();
        }
      }
    };

    checkStoredSession();
    return () => {
      if (sessionTimer) clearTimeout(sessionTimer);
    };
  }, []);

  const generateDailyPassword = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const getNextUpdateTime = () => {
    const now = new Date();
    const next = new Date(now);
    next.setHours(13, 0, 0, 0);
    
    if (now.getHours() >= 13) {
      next.setDate(next.getDate() + 1);
    }
    
    return next;
  };

  const sendTelegramCode = async (telegramId: string, code: string) => {
    const nextUpdate = getNextUpdateTime();
    const message = `Ваш пароль для входа: ${code}\nПароль действителен до ${nextUpdate.toLocaleString('ru-RU', { 
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })}`;

    const response = await fetch('/api/send-telegram-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telegramId, code, message })
    });
    return response.ok;
  };

  const requestDailyPassword = async (username: string) => {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (error || !user || user.role !== 'user') {
        return { success: false, message: 'Пользователь не найден' };
      }

      if (user.daily_password && user.password_expires_at && user.device_id) {
        const now = new Date();
        const expiresAt = new Date(user.password_expires_at);
        const deviceId = localStorage.getItem('deviceId');

        if (now < expiresAt && deviceId === user.device_id) {
          return { 
            success: false, 
            message: 'У вас уже есть действующий пароль. Следующий запрос будет доступен после 13:00' 
          };
        }

        if (now < expiresAt && deviceId !== user.device_id) {
          return { 
            success: false, 
            message: 'Пароль уже привязан к другому устройству' 
          };
        }
      }

      const deviceId = localStorage.getItem('deviceId') || crypto.randomUUID();
      localStorage.setItem('deviceId', deviceId);

      const dailyPassword = generateDailyPassword();
      const nextUpdate = getNextUpdateTime();

      await supabase
        .from('users')
        .update({
          daily_password: dailyPassword,
          password_expires_at: nextUpdate.toISOString(),
          device_id: deviceId,
          password_requested_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (user.telegram_id) {
        await sendTelegramCode(user.telegram_id, dailyPassword);
      }

      return { success: true };
    } catch (error) {
      console.error('Error requesting daily password:', error);
      return { success: false, message: 'Ошибка при запросе пароля' };
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (error || !user) {
        return { success: false, message: 'Пользователь не найден' };
      }

      if (user.role === 'user') {
        const deviceId = localStorage.getItem('deviceId');
        
        if (!user.daily_password || !user.password_expires_at) {
          return { success: false, message: 'Необходимо запросить пароль' };
        }

        if (!deviceId || deviceId !== user.device_id) {
          return { success: false, message: 'Этот пароль привязан к другому устройству' };
        }

        const now = new Date();
        const expiresAt = new Date(user.password_expires_at);
        
        if (now > expiresAt) {
          return { success: false, message: 'Срок действия пароля истек. Запросите новый пароль' };
        }

        if (password !== user.daily_password) {
          return { success: false, message: 'Неверный пароль' };
        }

        const session: StoredSession = {
          user: {
            id: user.id,
            username: user.username,
            role: user.role,
            password: user.password,
            created_at: user.created_at
          },
          expiresAt: expiresAt.getTime()
        };

        localStorage.setItem('userSession', JSON.stringify(session));
        setCurrentUser(session.user);
      } else {
        if (password !== user.password) {
          return { success: false, message: 'Неверные учетные данные' };
        }

        const adminUser = {
          id: user.id,
          username: user.username,
          role: user.role,
          password: user.password,
          created_at: user.created_at
        };
        setCurrentUser(adminUser);
        localStorage.setItem('userSession', JSON.stringify({
          user: adminUser,
          expiresAt: Date.now() + (365 * 24 * 60 * 60 * 1000)
        }));
      }

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Ошибка входа' };
    }
  };

  const logout = () => {
    clearSession();
  };

  return { currentUser, login, logout, requestDailyPassword };
}