import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

type BibleVerse = Database['public']['Tables']['bible_verses']['Row'];
type BibleVersion = Database['public']['Tables']['bible_versions']['Row'];

export function useBible() {
  const [versions, setVersions] = useState<BibleVersion[]>([]);
  const [currentVersion, setCurrentVersion] = useState<string>('nvi');
  const [loading, setLoading] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    loadVersions();
    return () => {
      mounted.current = false;
    };
  }, []);

  const loadVersions = async () => {
    const { data, error } = await supabase
      .from('bible_versions')
      .select('*')
      .order('name');

    if (data && !error && mounted.current) {
      setVersions(data);
    }
  };

  const searchVerses = async (query: string): Promise<BibleVerse[]> => {
    if (mounted.current) {
      setLoading(true);
    }
    try {
      // Check if it's a reference search (e.g., "John 3:16")
      const referenceMatch = query.match(/(\d?\s*\w+)\s*(\d+):?(\d+)?(?:-(\d+))?/i);
      
      if (referenceMatch) {
        // Reference search
        const [, bookName, chapter, startVerse, endVerse] = referenceMatch;
        const bookNumber = getBookNumber(bookName);
        
        if (bookNumber) {
          let queryBuilder = supabase
            .from('bible_verses')
            .select('*')
            .eq('version_id', currentVersion)
            .eq('book', bookNumber)
            .eq('chapter', parseInt(chapter));

          if (startVerse) {
            if (endVerse) {
              queryBuilder = queryBuilder
                .gte('verse', parseInt(startVerse))
                .lte('verse', parseInt(endVerse));
            } else {
              queryBuilder = queryBuilder.eq('verse', parseInt(startVerse));
            }
          }

          const { data, error } = await queryBuilder.order('verse');
          
          if (!error && data) {
            return data;
          }
        }
      } else {
        // Text search
        const { data, error } = await supabase
          .from('bible_verses')
          .select('*')
          .eq('version_id', currentVersion)
          .textSearch('text', query, {
            type: 'websearch',
            config: 'portuguese'
          })
          .limit(50);

        if (!error && data) {
          return data;
        }
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
    
    return [];
  };

  const getVerse = async (book: number, chapter: number, verse: number): Promise<BibleVerse | null> => {
    const { data, error } = await supabase
      .from('bible_verses')
      .select('*')
      .eq('version_id', currentVersion)
      .eq('book', book)
      .eq('chapter', chapter)
      .eq('verse', verse)
      .single();

    return !error && data ? data : null;
  };

  const getChapter = async (book: number, chapter: number): Promise<BibleVerse[]> => {
    const { data, error } = await supabase
      .from('bible_verses')
      .select('*')
      .eq('version_id', currentVersion)
      .eq('book', book)
      .eq('chapter', chapter)
      .order('verse');

    return !error && data ? data : [];
  };

  return {
    versions,
    currentVersion,
    setCurrentVersion,
    loading,
    searchVerses,
    getVerse,
    getChapter,
  };
}

// Helper function to convert book names to numbers
function getBookNumber(bookName: string): number | null {
  const books: { [key: string]: number } = {
    // Novo Testamento
    'mateus': 40, 'mt': 40, 'mat': 40,
    'marcos': 41, 'mc': 41, 'mar': 41,
    'lucas': 42, 'lc': 42, 'luc': 42,
    'joão': 43, 'jo': 43, 'john': 43,
    'atos': 44, 'at': 44, 'acts': 44,
    'romanos': 45, 'rm': 45, 'rom': 45,
    '1 coríntios': 46, '1co': 46, '1 cor': 46,
    '2 coríntios': 47, '2co': 47, '2 cor': 47,
    'gálatas': 48, 'gl': 48, 'gal': 48,
    'efésios': 49, 'ef': 49, 'eph': 49,
    'filipenses': 50, 'fp': 50, 'phil': 50,
    'colossenses': 51, 'cl': 51, 'col': 51,
    '1 tessalonicenses': 52, '1ts': 52, '1 thess': 52,
    '2 tessalonicenses': 53, '2ts': 53, '2 thess': 53,
    '1 timóteo': 54, '1tm': 54, '1 tim': 54,
    '2 timóteo': 55, '2tm': 55, '2 tim': 55,
    'tito': 56, 'tt': 56, 'tit': 56,
    'filemom': 57, 'fm': 57, 'phlm': 57,
    'hebreus': 58, 'hb': 58, 'heb': 58,
    'tiago': 59, 'tg': 59, 'james': 59,
    '1 pedro': 60, '1pe': 60, '1 pet': 60,
    '2 pedro': 61, '2pe': 61, '2 pet': 61,
    '1 joão': 62, '1jo': 62, '1 john': 62,
    '2 joão': 63, '2jo': 63, '2 john': 63,
    '3 joão': 64, '3jo': 64, '3 john': 64,
    'judas': 65, 'jd': 65, 'jude': 65,
    'apocalipse': 66, 'ap': 66, 'rev': 66,
    
    // Antigo Testamento (alguns exemplos)
    'gênesis': 1, 'gn': 1, 'gen': 1,
    'êxodo': 2, 'ex': 2, 'exod': 2,
    'salmos': 19, 'sl': 19, 'ps': 19, 'psalm': 19,
    'provérbios': 20, 'pv': 20, 'prov': 20,
    'isaías': 23, 'is': 23, 'isa': 23,
  };

  const normalized = bookName.toLowerCase().trim();
  return books[normalized] || null;
}