import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Search, BookOpen, Star, ArrowRight } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/hooks/useAuth';
import { useBible } from '@/hooks/useBible';
import { useBookmarks } from '@/hooks/useBookmarks';
import AuthScreen from '@/components/AuthScreen';

const BOOK_NAMES: { [key: number]: string } = {
  1: 'Gênesis', 19: 'Salmos', 20: 'Provérbios', 23: 'Isaías',
  40: 'Mateus', 41: 'Marcos', 42: 'Lucas', 43: 'João',
  44: 'Atos', 45: 'Romanos', 46: '1 Coríntios', 47: '2 Coríntios',
  48: 'Gálatas', 49: 'Efésios', 50: 'Filipenses', 58: 'Hebreus',
  59: 'Tiago', 60: '1 Pedro', 62: '1 João', 66: 'Apocalipse'
};

export default function BibleTab() {
  const { user, loading: authLoading } = useAuth();
  const { searchVerses, loading: searchLoading, currentVersion } = useBible();
  const { bookmarks, addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    const results = await searchVerses(searchQuery);
    setSearchResults(results);
  };

  const openVerse = (verse: any) => {
    const bookName = BOOK_NAMES[verse.book] || `Livro ${verse.book}`;
    Alert.alert(
      'Versículo',
      `${bookName} ${verse.chapter}:${verse.verse}\n\n${verse.text}`,
      [{ text: 'OK' }]
    );
  };

  const toggleBookmark = async (verse: any) => {
    const bookName = BOOK_NAMES[verse.book] || `Livro ${verse.book}`;
    
    if (isBookmarked(currentVersion, verse.book, verse.chapter, verse.verse)) {
      // Remove bookmark - need to find the bookmark first
      const bookmark = bookmarks.find(b => 
        b.version_id === currentVersion &&
        b.book === verse.book &&
        b.chapter === verse.chapter &&
        b.verse === verse.verse
      );
      if (bookmark) {
        await removeBookmark(bookmark.id);
        Alert.alert('Removido', 'Versículo removido dos favoritos');
      }
    } else {
      await addBookmark(currentVersion, verse.book, verse.chapter, verse.verse);
      Alert.alert('Salvo', 'Versículo adicionado aos favoritos');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bíblia Sagrada</Text>
        <Text style={styles.headerSubtitle}>Nova Versão Internacional</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#6b7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar versículos ou referências (ex: João 3:16)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={searchLoading}
        >
          <Text style={styles.searchButtonText}>
            {searchLoading ? 'Buscando...' : 'Buscar'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Results */}
        {searchResults.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resultados da Busca</Text>
            {searchResults.map((result, index) => (
              <TouchableOpacity
                key={index}
                style={styles.verseCard}
                onPress={() => openVerse(result)}
              >
                <View style={styles.verseHeader}>
                  <Text style={styles.verseReference}>
                    {BOOK_NAMES[result.book] || `Livro ${result.book}`} {result.chapter}:{result.verse}
                  </Text>
                  <TouchableOpacity onPress={() => toggleBookmark(result)}>
                    <Star 
                      size={16} 
                      color={isBookmarked(currentVersion, result.book, result.chapter, result.verse) ? "#f59e0b" : "#6b7280"}
                      fill={isBookmarked(currentVersion, result.book, result.chapter, result.verse) ? "#f59e0b" : "none"}
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.verseText} numberOfLines={2}>
                  {result.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Quick Access */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acesso Rápido</Text>
          <View style={styles.quickAccessGrid}>
            <TouchableOpacity style={styles.quickAccessCard}>
              <BookOpen size={24} color="#1e3a8a" />
              <Text style={styles.quickAccessText}>Navegar Livros</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAccessCard}>
              <Star size={24} color="#f59e0b" />
              <Text style={styles.quickAccessText}>Favoritos</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bookmarked Verses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Versículos Favoritos</Text>
          {bookmarks.slice(0, 3).map((bookmark, index) => (
            <TouchableOpacity
              key={index}
              style={styles.verseCard}
              onPress={() => {
                // Create a verse object from bookmark
                const verse = {
                  book: bookmark.book,
                  chapter: bookmark.chapter,
                  verse: bookmark.verse,
                  text: 'Carregando texto...' // Would need to fetch actual text
                };
                openVerse(verse);
              }}
            >
              <View style={styles.verseHeader}>
                <Text style={styles.verseReference}>
                  {BOOK_NAMES[bookmark.book] || `Livro ${bookmark.book}`} {bookmark.chapter}:{bookmark.verse}
                </Text>
                <ArrowRight size={16} color="#1e3a8a" />
              </View>
              {bookmark.note && (
                <Text style={styles.verseText} numberOfLines={2}>
                  {bookmark.note}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Popular Verses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Versículos Populares</Text>
          <View style={styles.popularVerses}>
            {['João 3:16', 'Salmos 23:1', '1 Cor 13:4', 'Fil 4:13'].map((ref, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.popularVerseTag}
                onPress={() => {
                  setSearchQuery(ref);
                  handleSearch();
                }}
              >
                <Text style={styles.popularVerseText}>{ref}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 18,
    color: '#6b7280',
  },
  header: {
    backgroundColor: '#1e3a8a',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#bfdbfe',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 14,
    color: '#1f2937',
  },
  searchButton: {
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  verseCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  verseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  verseReference: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e3a8a',
  },
  verseText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
  },
  quickAccessGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAccessCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  quickAccessText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 8,
  },
  popularVerses: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  popularVerseTag: {
    backgroundColor: '#1e3a8a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  popularVerseText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
});