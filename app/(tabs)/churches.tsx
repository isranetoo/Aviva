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
import { Search, MapPin, Users, Clock, QrCode, Heart } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/hooks/useAuth';
import { useChurches } from '@/hooks/useChurches';
import AuthScreen from '@/components/AuthScreen';


export default function ChurchesTab() {
  const { user, loading: authLoading } = useAuth();
  const { churches, loading, searchChurches, toggleFollow, isFollowing } = useChurches();
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
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    const results = await searchChurches(searchQuery);
    setSearchResults(results);
  };

  const openChurchDetails = (church: any) => {
    Alert.alert(
      church.name,
      `${church.description || 'Igreja cristã'}\n\nLocalização: ${church.location || 'Não informado'}\nMembros: ${church.members_count}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Ver Detalhes', onPress: () => {} },
      ]
    );
  };

  const handleToggleFollow = async (churchId: string) => {
    const { error } = await toggleFollow(churchId);
    if (error) {
      Alert.alert('Erro', 'Não foi possível seguir/deixar de seguir a igreja');
    }
  };

  const scanQRCode = () => {
    Alert.alert(
      'Scanner QR Code',
      'Escaneie um QR code de uma igreja para se conectar rapidamente.',
      [{ text: 'OK' }]
    );
  };

  const displayChurches = searchQuery ? searchResults : churches;
  const nearbyChurches = churches.slice(0, 2);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Descobrir Igrejas</Text>
        <Text style={styles.headerSubtitle}>Conecte-se com sua comunidade de fé local</Text>
      </View>

      {/* Search and QR */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#6b7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar igrejas ou localizações"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity style={styles.qrButton} onPress={scanQRCode}>
          <QrCode size={24} color="#1e3a8a" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Nearby Churches */}
        {searchQuery === '' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Igrejas Próximas</Text>
            {nearbyChurches.map((church) => (
              <TouchableOpacity
                key={church.id}
                style={styles.churchCard}
                onPress={() => openChurchDetails(church)}
              >
                <View style={styles.churchHeader}>
                  <View style={styles.churchInfo}>
                    <Text style={styles.churchName}>{church.name}</Text>
                    <View style={styles.churchMeta}>
                      <MapPin size={16} color="#6b7280" />
                      <Text style={styles.churchLocation}>{church.location || 'Localização não informada'}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[styles.followButton, isFollowing(church.id) && styles.followingButton]}
                    onPress={() => handleToggleFollow(church.id)}
                  >
                    <Heart 
                      size={20} 
                      color={isFollowing(church.id) ? '#ffffff' : '#1e3a8a'}
                      fill={isFollowing(church.id) ? '#ffffff' : 'none'}
                    />
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.churchDescription}>{church.description || 'Igreja cristã comprometida com o ensino bíblico e comunhão.'}</Text>
                
                <View style={styles.churchStats}>
                  <View style={styles.stat}>
                    <Users size={16} color="#6b7280" />
                    <Text style={styles.statText}>{church.members_count} membros</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* All Churches / Search Results */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {searchQuery ? 'Resultados da Busca' : 'Todas as Igrejas'}
          </Text>
          {displayChurches.map((church) => (
            <TouchableOpacity
              key={church.id}
              style={styles.churchCard}
              onPress={() => openChurchDetails(church)}
            >
              <View style={styles.churchHeader}>
                <View style={styles.churchInfo}>
                  <Text style={styles.churchName}>{church.name}</Text>
                  <View style={styles.churchMeta}>
                    <MapPin size={16} color="#6b7280" />
                    <Text style={styles.churchLocation}>{church.location || 'Localização não informada'}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.followButton, isFollowing(church.id) && styles.followingButton]}
                  onPress={() => handleToggleFollow(church.id)}
                >
                  <Heart 
                    size={20} 
                    color={isFollowing(church.id) ? '#ffffff' : '#1e3a8a'}
                    fill={isFollowing(church.id) ? '#ffffff' : 'none'}
                  />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.churchDescription}>{church.description || 'Igreja cristã comprometida com o ensino bíblico e comunhão.'}</Text>
              
              <View style={styles.churchStats}>
                <View style={styles.stat}>
                  <Users size={16} color="#6b7280" />
                  <Text style={styles.statText}>{church.members_count} membros</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {searchQuery && displayChurches.length === 0 && (
          <View style={styles.noResults}>
            <Text style={styles.noResultsText}>Nenhuma igreja encontrada para "{searchQuery}"</Text>
          </View>
        )}
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
    alignItems: 'center',
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
  qrButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 14,
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
  churchCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
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
  churchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  churchInfo: {
    flex: 1,
  },
  churchName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  churchMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  churchLocation: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  followButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 24,
    padding: 8,
    borderWidth: 2,
    borderColor: '#1e3a8a',
  },
  followingButton: {
    backgroundColor: '#1e3a8a',
    borderColor: '#1e3a8a',
  },
  churchDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
    marginBottom: 16,
  },
  churchStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center'
  },
});