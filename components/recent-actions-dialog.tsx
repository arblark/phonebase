"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogEntry } from '@/types';
import { supabase } from '@/lib/supabase';
import {
  History,
  Loader2,
  Search,
  RotateCw,
  PhoneCall,
  MessageSquarePlus,
  Trash2,
  TrendingUp,
  LogIn,
  KeyRound,
  UserCog,
  CircleUser,
  Clock,
  Activity,
  CheckCircle2,
  X,
} from 'lucide-react';
import { format, formatDistanceToNow, startOfDay, endOfDay, subDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';

type PeriodType = 'today' | '7days';
type CategoryType = 'all' | 'numbers' | 'comments' | 'rating' | 'auth';

function getActionMeta(action: string) {
  const lower = action.toLowerCase();
  if (lower.includes('добавлен номер')) {
    return {
      icon: PhoneCall,
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconClass: 'text-emerald-600',
      dotClass: 'bg-emerald-500',
    };
  }
  if (lower.includes('удалён комментарий') || lower.includes('удален')) {
    return {
      icon: Trash2,
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      iconClass: 'text-rose-600',
      dotClass: 'bg-rose-500',
    };
  }
  if (lower.includes('комментарий') || lower.includes('отзыв')) {
    return {
      icon: MessageSquarePlus,
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      iconClass: 'text-blue-600',
      dotClass: 'bg-blue-500',
    };
  }
  if (lower.includes('рейтинг')) {
    return {
      icon: TrendingUp,
      badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
      iconClass: 'text-purple-600',
      dotClass: 'bg-purple-500',
    };
  }
  if (lower.includes('вход')) {
    return {
      icon: LogIn,
      badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
      iconClass: 'text-teal-600',
      dotClass: 'bg-teal-500',
    };
  }
  if (lower.includes('парол')) {
    return {
      icon: KeyRound,
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      iconClass: 'text-amber-600',
      dotClass: 'bg-amber-500',
    };
  }
  if (lower.includes('пользовател')) {
    return {
      icon: UserCog,
      badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      iconClass: 'text-indigo-600',
      dotClass: 'bg-indigo-500',
    };
  }
  return {
    icon: Activity,
    badgeClass: 'bg-gray-100 text-gray-700 border-gray-200',
    iconClass: 'text-gray-600',
    dotClass: 'bg-gray-400',
  };
}

export function RecentActionsDialog() {
  const [open, setOpen] = useState(false);
  const [period, setPeriod] = useState<PeriodType>('today');
  const [category, setCategory] = useState<CategoryType>('all');
  const [search, setSearch] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogsForPeriod = useCallback(async (selectedPeriod: PeriodType) => {
    setLoading(true);
    try {
      const now = new Date();
      let start: string;
      const end = endOfDay(now).toISOString();

      if (selectedPeriod === 'today') {
        start = startOfDay(now).toISOString();
      } else {
        // За последние 7 дней (включая сегодня)
        start = startOfDay(subDays(now, 6)).toISOString();
      }

      const { data, error } = await supabase
        .from('logs')
        .select(`id, action, details, timestamp, users ( username )`)
        .gte('timestamp', start)
        .lte('timestamp', end)
        .order('timestamp', { ascending: false })
        .limit(1000);

      if (error) throw error;

      if (data) {
        setLogs(
          data.map((log: any) => ({
            id: log.id,
            action: log.action,
            details: log.details,
            timestamp: log.timestamp,
            user: log.users?.username || 'Система',
          }))
        );
      }
    } catch (err) {
      console.error('Ошибка загрузки недавних действий:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchLogsForPeriod(period);
    }
  }, [open, period, fetchLogsForPeriod]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Фильтр по категории
      if (category !== 'all') {
        const lower = log.action.toLowerCase();
        if (category === 'numbers' && !lower.includes('номер')) return false;
        if (category === 'comments' && !lower.includes('комментарий') && !lower.includes('отзыв')) return false;
        if (category === 'rating' && !lower.includes('рейтинг')) return false;
        if (
          category === 'auth' &&
          !lower.includes('вход') &&
          !lower.includes('парол') &&
          !lower.includes('пользовател')
        )
          return false;
      }

      // Фильтр по поисковому запросу
      if (search.trim()) {
        const q = search.toLowerCase();
        const inDetails = log.details.toLowerCase().includes(q);
        const inAction = log.action.toLowerCase().includes(q);
        const inUser = log.user.toLowerCase().includes(q);
        return inDetails || inAction || inUser;
      }

      return true;
    });
  }, [logs, category, search]);

  const formatLogDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return {
        relative: formatDistanceToNow(date, { addSuffix: true, locale: ru }),
        formatted: format(date, 'd MMMM yyyy, HH:mm', { locale: ru }),
      };
    } catch {
      return { relative: '', formatted: dateStr };
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 text-base">
          <History className="w-4 h-4 text-blue-600" />
          <span>Недавние действия</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-4 sm:p-6">
        <DialogHeader className="pb-3 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" />
                Недавние действия
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                Хронология всех операций пользователей в системе
              </DialogDescription>
            </div>

            <div className="flex items-center gap-2">
              <Tabs
                value={period}
                onValueChange={(val) => setPeriod(val as PeriodType)}
                className="w-auto"
              >
                <TabsList className="grid grid-cols-2 h-9">
                  <TabsTrigger value="today" className="text-xs sm:text-sm px-3">
                    За сегодня
                  </TabsTrigger>
                  <TabsTrigger value="7days" className="text-xs sm:text-sm px-3">
                    За 7 дней
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-gray-500 hover:text-gray-900"
                onClick={() => fetchLogsForPeriod(period)}
                disabled={loading}
                title="Обновить список"
              >
                <RotateCw className={cn('w-4 h-4', loading && 'animate-spin')} />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Панель фильтров и поиска */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 py-3 border-b">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по действию, номеру, тексту или логину..."
              className="pl-9 pr-8 h-9 text-sm"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <Button
              variant={category === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategory('all')}
              className="h-8 text-xs whitespace-nowrap"
            >
              Все ({logs.length})
            </Button>
            <Button
              variant={category === 'numbers' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategory('numbers')}
              className="h-8 text-xs whitespace-nowrap gap-1"
            >
              <PhoneCall className="w-3 h-3 text-emerald-600" />
              Номера
            </Button>
            <Button
              variant={category === 'comments' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategory('comments')}
              className="h-8 text-xs whitespace-nowrap gap-1"
            >
              <MessageSquarePlus className="w-3 h-3 text-blue-600" />
              Отзывы
            </Button>
            <Button
              variant={category === 'rating' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategory('rating')}
              className="h-8 text-xs whitespace-nowrap gap-1"
            >
              <TrendingUp className="w-3 h-3 text-purple-600" />
              Рейтинг
            </Button>
            <Button
              variant={category === 'auth' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategory('auth')}
              className="h-8 text-xs whitespace-nowrap gap-1"
            >
              <LogIn className="w-3 h-3 text-teal-600" />
              Входы
            </Button>
          </div>
        </div>

        {/* Список действий */}
        <ScrollArea className="flex-1 h-[460px] pr-3 my-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500 gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="text-sm">Загрузка действий...</span>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500 gap-2">
              <CheckCircle2 className="w-10 h-10 text-gray-300" />
              <p className="text-base font-medium">Действия не найдены</p>
              <p className="text-xs text-gray-400">
                {search.trim()
                  ? 'Попробуйте изменить поисковый запрос или сбросить фильтры'
                  : period === 'today'
                  ? 'За сегодня пока не зафиксировано действий'
                  : 'За последние 7 дней действий нет'}
              </p>
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              {filteredLogs.map((log) => {
                const meta = getActionMeta(log.action);
                const ActionIcon = meta.icon;
                const { relative, formatted } = formatLogDate(log.timestamp);

                return (
                  <div
                    key={log.id}
                    className="p-3.5 bg-white border rounded-xl hover:shadow-sm transition-all duration-150 flex flex-col gap-2 relative overflow-hidden"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn('gap-1.5 font-medium px-2.5 py-0.5', meta.badgeClass)}
                        >
                          <ActionIcon className={cn('w-3.5 h-3.5', meta.iconClass)} />
                          <span>{log.action}</span>
                        </Badge>

                        <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                          <CircleUser className="w-3.5 h-3.5 text-gray-500" />
                          <span className="font-medium">{log.user}</span>
                        </div>
                      </div>

                      <div
                        className="flex items-center gap-1.5 text-xs text-gray-400"
                        title={formatted}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span className="font-medium text-gray-600">{relative}</span>
                        <span className="hidden sm:inline text-gray-300">•</span>
                        <span className="hidden sm:inline">{formatted}</span>
                      </div>
                    </div>

                    <p className="text-sm sm:text-base text-gray-800 break-words leading-relaxed pl-0.5">
                      {log.details}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Подвал */}
        <div className="pt-2 border-t flex items-center justify-between text-xs text-gray-500">
          <span>
            Показано: <strong className="text-gray-800">{filteredLogs.length}</strong> из{' '}
            <strong className="text-gray-800">{logs.length}</strong>
          </span>
          <span>
            Период: {period === 'today' ? 'текущие сутки' : 'последние 7 дней'}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
