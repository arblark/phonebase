"use client";

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
import { LogEntry } from '@/types';
import { ClipboardList, Loader2, Calendar } from 'lucide-react';
import { useState } from 'react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ActionLogsProps {
  logs: LogEntry[];
  loading?: boolean;
}

export function ActionLogs({ logs, loading = false }: ActionLogsProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setIsCalendarOpen(false);
  };

  const filteredLogs = date
    ? logs.filter(log => {
        const logDate = new Date(log.timestamp);
        return (
          logDate.getDate() === date.getDate() &&
          logDate.getMonth() === date.getMonth() &&
          logDate.getFullYear() === date.getFullYear()
        );
      })
    : logs;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 text-base">
          <ClipboardList className="w-4 h-4" />
          Логи
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <DialogTitle className="text-base sm:text-lg">Действия на сайте</DialogTitle>
          <DialogDescription className="sr-only">
            Просмотр логов действий пользователей
          </DialogDescription>
          
          <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal text-base min-h-10 w-full sm:w-auto",
                  !date && "text-muted-foreground"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP') : <span>Выбрать дату</span>}
              </Button>
            </DialogTrigger>
            <DialogContent className="p-0 max-w-[350px]">
              <DialogHeader className="p-4 pb-0">
                <DialogTitle>Выберите дату</DialogTitle>
                <DialogDescription>
                  Выберите дату для фильтрации логов
                </DialogDescription>
              </DialogHeader>
              <div className="p-4">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={handleDateSelect}
                  initialFocus
                  className="rounded-md border p-3 mx-auto"
                />
              </div>
            </DialogContent>
          </Dialog>
        </DialogHeader>
        <ScrollArea className="h-[500px] pr-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-base">
              {date ? 'Нет логов для выбранной даты' : 'Логи отсутствуют'}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-gray-50 rounded-lg space-y-1 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex justify-between text-base">
                    <span className="font-medium">{log.action}</span>
                    <span className="text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-base text-gray-600">{log.details}</p>
                  <p className="text-sm text-gray-400">Пользователь: {log.user}</p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}