import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { Database } from '@/lib/database.types';

type Bookmark = Database['public']['Tables']['user_bookmarks']['Row'];

export function useBookmarks() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    if (user) {
      loadBookmarks();
    } else {
      if (mounted.current) {
        setBookmarks([]);
      }
    }
    return () => {
      mounted.current = false;
    };
  }, [user]);

  const loadBookmarks = async () => {
    if (!user) return;

    if (mounted.current) {
      setLoading(true);
    }
    const { data, error } = await supabase
      .from('user_bookmarks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data && !error && mounted.current) {
      setBookmarks(data);
    }
    if (mounted.current) {
      setLoading(false);
    }
  };

  const addBookmark = async (
    versionId: string,
    book: number,
    chapter: number,
    verse: number,
    note?: string
  ) => {
    if (!user) return { error: 'User not authenticated' };

    const { data, error } = await supabase
      .from('user_bookmarks')
      .insert({
        user_id: user.id,
        version_id: versionId,
        book,
        chapter,
        verse,
        note,
      })
      .select()
      .single();

    if (!error && data && mounted.current) {
      setBookmarks(prev => [data, ...prev]);
    }

    return { data, error };
  };

  const removeBookmark = async (bookmarkId: string) => {
    if (!user) return { error: 'User not authenticated' };

    const { error } = await supabase
      .from('user_bookmarks')
      .delete()
      .eq('id', bookmarkId)
      .eq('user_id', user.id);

    if (!error && mounted.current) {
      setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
    }

    return { error };
  };

  const updateBookmark = async (bookmarkId: string, note: string) => {
    if (!user) return { error: 'User not authenticated' };

    const { data, error } = await supabase
      .from('user_bookmarks')
      .update({ note })
      .eq('id', bookmarkId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (!error && data && mounted.current) {
      setBookmarks(prev => 
        prev.map(b => b.id === bookmarkId ? data : b)
      );
    }

    return { data, error };
  };

  const isBookmarked = (versionId: string, book: number, chapter: number, verse: number) => {
    return bookmarks.some(b => 
      b.version_id === versionId &&
      b.book === book &&
      b.chapter === chapter &&
      b.verse === verse
    );
  };

  const getBookmark = (versionId: string, book: number, chapter: number, verse: number) => {
    return bookmarks.find(b => 
      b.version_id === versionId &&
      b.book === book &&
      b.chapter === chapter &&
      b.verse === verse
    );
  };

  return {
    bookmarks,
    loading,
    addBookmark,
    removeBookmark,
    updateBookmark,
    isBookmarked,
    getBookmark,
    loadBookmarks,
  };
}