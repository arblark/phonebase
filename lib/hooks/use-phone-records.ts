import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { PhoneRecord, LogEntry, Comment, Database } from '@/types';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing environment variables for Supabase connection');
}
interface AddPhoneRecordParams {
  phoneNumber: string;
  isDangerous: boolean;
  rating: number;
  userId: string;
  initialComment?: string;
}

interface PhoneRecordsState {
  phoneRecords: PhoneRecord[];
  logs: LogEntry[];
  loading: boolean;
  logsLoading: boolean;
  addPhoneRecord: (params: AddPhoneRecordParams) => Promise<Database['public']['Tables']['phone_records']['Row'] | null>;
  addComment: (phoneId: string, text: string, isPositive: boolean, userId: string) => Promise<void>;
  deleteComment: (phoneId: string, commentId: string, userId: string) => Promise<void>;
}

type DatabaseLog = Database['public']['Tables']['logs']['Row'];
type DatabaseComment = Database['public']['Tables']['comments']['Row'];

interface SupabaseJoinResponse<T, U> {
  data: (T & { users: U | null })[] | null;
  error: Error | null;
}

export function usePhoneRecords(): PhoneRecordsState {
  const [phoneRecords, setPhoneRecords] = useState<PhoneRecord[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);

  const fetchLogs = async (): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('logs')
        .select(`
          *,
          users (
            username
          )
        `)
        .order('created_at', { ascending: false }) as SupabaseJoinResponse<DatabaseLog, { username: string }>;

      if (error) throw error;
      if (!data) return;

      setLogs(data.map(log => ({
        id: log.id,
        action: log.action,
        details: log.details,
        timestamp: log.timestamp,
        user: log.users?.username || 'System'
      })));
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLogsLoading(false);
    }
  };

  const addLog = async (userId: string, action: string, details: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('logs')
        .insert({
          user_id: userId,
          action,
          details,
          timestamp: new Date().toISOString()
        });

      if (error) throw error;
      await fetchLogs();
    } catch (error) {
      console.error('Error adding log:', error);
    }
  };

  const fetchPhoneRecords = async (): Promise<void> => {
    try {
      const { data: records, error: recordsError } = await supabase
        .from('phone_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (recordsError) throw recordsError;
      if (!records) return;

      const recordsWithComments = await Promise.all(
        records.map(async (record) => {
          const { data: comments, error: commentsError } = await supabase
            .from('comments')
            .select(`
              *,
              users (
                username
              )
            `)
            .eq('phone_id', record.id)
            .order('created_at', { ascending: false }) as SupabaseJoinResponse<DatabaseComment, { username: string }>;

          if (commentsError) throw commentsError;
          if (!comments) return null;

          const formattedComments: Comment[] = comments.map(comment => ({
            id: comment.id,
            text: comment.text,
            isPositive: comment.is_positive,
            dateAdded: new Date(comment.date_added).toLocaleDateString(),
            userId: comment.user_id,
            userName: comment.users?.username || 'Unknown User'
          }));

          return {
            id: record.id,
            phoneNumber: record.phone_number,
            isDangerous: record.is_dangerous,
            rating: record.rating,
            dateAdded: new Date(record.date_added).toLocaleDateString(),
            comments: formattedComments
          };
        })
      );

      setPhoneRecords(recordsWithComments.filter((record): record is PhoneRecord => record !== null));
    } catch (error) {
      console.error('Error fetching phone records:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhoneRecords();
    fetchLogs();
  }, []);

  const addPhoneRecord = async ({ 
    phoneNumber, 
    isDangerous, 
    rating, 
    userId, 
    initialComment 
  }: AddPhoneRecordParams): Promise<Database['public']['Tables']['phone_records']['Row'] | null> => {
    try {
      const now = new Date().toISOString();
      
      const { data: record, error: recordError } = await supabase
        .from('phone_records')
        .insert({
          phone_number: phoneNumber,
          rating: rating,
          is_dangerous: isDangerous,
          date_added: now,
          created_at: now
        })
        .select()
        .single();

      if (recordError) throw recordError;

      if (initialComment && record) {
        const { error: commentError } = await supabase
          .from('comments')
          .insert({
            phone_id: record.id,
            user_id: userId,
            text: initialComment,
            is_positive: rating > 0,
            date_added: now,
            created_at: now
          });

        if (commentError) throw commentError;
      }

      await addLog(userId, 'Добавлен номер', `Добавлен номер ${phoneNumber} с рейтингом ${rating}`);
      await fetchPhoneRecords();
      return record;
    } catch (error) {
      console.error('Error adding phone record:', error);
      return null;
    }
  };

  const addComment = async (
    phoneId: string, 
    text: string, 
    isPositive: boolean, 
    userId: string
  ): Promise<void> => {
    try {
      const now = new Date().toISOString();
      
      const { error: commentError } = await supabase
        .from('comments')
        .insert({
          phone_id: phoneId,
          user_id: userId,
          text,
          is_positive: isPositive,
          date_added: now,
          created_at: now
        });

      if (commentError) throw commentError;

      const { data: record, error: recordError } = await supabase
        .from('phone_records')
        .select('rating, phone_number')
        .eq('id', phoneId)
        .single();

      if (recordError) throw recordError;

      const newRating = record.rating + (isPositive ? 1 : -1);

      const { error: updateError } = await supabase
        .from('phone_records')
        .update({ 
          rating: newRating,
          is_dangerous: newRating < 0
        })
        .eq('id', phoneId);

      if (updateError) throw updateError;

      await addLog(
        userId,
        'Добавлен комментарий',
        `Добавлен ${isPositive ? 'позитивный' : 'негативный'} комментарий к номеру ${record.phone_number}: "${text}"`
      );
      await fetchPhoneRecords();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const deleteComment = async (
    phoneId: string, 
    commentId: string, 
    userId: string
  ): Promise<void> => {
    try {
      const { data: comment, error: commentError } = await supabase
        .from('comments')
        .select('is_positive, text')
        .eq('id', commentId)
        .single();

      if (commentError) throw commentError;

      const { data: record, error: recordError } = await supabase
        .from('phone_records')
        .select('rating, phone_number')
        .eq('id', phoneId)
        .single();

      if (recordError) throw recordError;

      const ratingChange = comment.is_positive ? -1 : 1;
      const newRating = record.rating + ratingChange;

      const { error: deleteError } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (deleteError) throw deleteError;

      const { error: updateError } = await supabase
        .from('phone_records')
        .update({ 
          rating: newRating,
          is_dangerous: newRating < 0
        })
        .eq('id', phoneId);

      if (updateError) throw updateError;

      await addLog(
        userId,
        'Удалён комментарий',
        `Удалён комментарий "${comment.text}" в номере ${record.phone_number}`
      );
      await fetchPhoneRecords();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  return {
    phoneRecords,
    logs,
    loading,
    logsLoading,
    addPhoneRecord,
    addComment,
    deleteComment,
  };
}