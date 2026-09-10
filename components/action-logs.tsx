"use client";

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LogEntry } from '@/types';
import {
  ClipboardList,
  Loader2,
  Calendar,
  Search,
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
  X,
} from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ActionLogsProps {
  logs: LogEntry[];
  loading?: boolean;
  reloadLogs: (date?: Date) => Promise<void>;
}

function getActionMeta(action: string) {
  const lower = action.toLowerCase();
  if (lower.includes('добавлен номер')) {
    return {
      icon: PhoneCall,
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconClass: 'text-emerald-600',
    };
  }
  if (lower.includes('удалён комментарий') || lower.includes('удален')) {
    return {
      icon: Trash2,
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      iconClass: 'text-rose-600',
    };
  }
  if (lower.includes('комментарий') || lower.includes('отзыв')) {
    return {
      icon: MessageSquarePlus,
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      iconClass: 'text-blue-600',
    };
  }
  if (lower.includes('рейтинг')) {
    return {
      icon: TrendingUp,
      badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
      iconClass: 'text-purple-600',
    };
  }
  if (lower.includes('вход')) {
    return {
      icon: LogIn,
      badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
      iconClass: 'text-teal-600',
    };
  }
  if (lower.includes('парол')) {
    return {
      icon: KeyRound,
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      iconClass: 'text-amber-600',
    };
  }
  if (lower.includes('пользовател')) {
    return {
      icon: UserCog,
      badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      iconClass: 'text-indigo-600',
    };
  }
  return {
    icon: Activity,
    badgeClass: 'bg-gray-100 text-gray-700 border-gray-200',
    iconClass: 'text-gray-600',
  };
}

export function ActionLogs({ logs, loading = false, reloadLogs }: ActionLogsProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [search, setSearch] = useState('');

  const handleDateSelect = async (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setIsCalendarOpen(false);
    await reloadLogs(selectedDate ?? new Date());
  };

  const handleSelectToday = async () => {
    const today = new Date();
    setDate(today);
    await reloadLogs(today);
  };

  const filteredLogs = useMemo(() => {
    if (!search.trim()) return logs;
    const q = search.toLowerCase();
    return logs.filter(
      (log) =>
        log.details.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.user.toLowerCase().includes(q)
    );
  }, [logs, search]);

  return (
    <Dialog
      onOpenChange={async (open) => {
        if (open) {
          await reloadLogs(date ?? new Date());
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 text-base">
          <ClipboardList className="w-4 h-4 text-gray-700" />
          <span>Логи</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-4 sm:p-6">
        <DialogHeader className="pb-3 border-b">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-gray-700" />
                Журнал действий по датам
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                Просмотр всех записей аудита за выбранную дату
              </DialogDescription>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectToday}
                className="text-xs h-9"
              >
                Сегодня
              </Button>

              <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'justify-start text-left font-normal text-sm h-9 flex-1 sm:flex-initial',
                      !date && 'text-muted-foreground'
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {date ? format(date, 'd MMMM yyyy', { locale: ru }) : <span>Выбрать дату</span>}
                  </Button>
                </DialogTrigger>
                <DialogContent className="p-0 max-w-[350px]">
                  <DialogHeader className="p-4 pb-0">
                    <DialogTitle className="text-base">Выберите дату</DialogTitle>
                    <DialogDescription className="text-xs">
                      Выберите день для просмотра логов
                    </DialogDescription>
                  </DialogHeader>
                  <div className="p-4">
                    <CalendarComponent
                      mode="single"
                      selected={date}
                      onSelect={handleDateSelect}
                      initialFocus
                      locale={ru}
                      className="rounded-md border p-3 mx-auto"
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </DialogHeader>

        {/* Поиск по загруженным логам */}
        <div className="py-2 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по действию, номеру или пользователю..."
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
        </div>

        {/* Список логов */}
        <ScrollArea className="flex-1 h-[450px] pr-3 my-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500 gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
              <span className="text-sm">Загрузка логов...</span>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-16 text-gray-500 text-sm">
              {search.trim()
                ? 'Ничего не найдено по данному запросу'
                : date
                ? `За ${format(date, 'd MMMM yyyy', { locale: ru })} логов не найдено`
                : 'Логи отсутствуют'}
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              {filteredLogs.map((log) => {
                const meta = getActionMeta(log.action);
                const ActionIcon = meta.icon;
                const formattedTime = new Date(log.timestamp).toLocaleTimeString('ru-RU', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                });

                return (
                  <div
                    key={log.id}
                    className="p-3.5 bg-white border rounded-xl hover:shadow-sm transition-all duration-150 flex flex-col gap-2"
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

                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>{formattedTime}</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-800 break-words leading-relaxed pl-0.5">
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
            {date ? format(date, 'd MMMM yyyy', { locale: ru }) : 'Дата не выбрана'}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
