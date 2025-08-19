import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import {
  User,
  Settings,
  Bell,
  BookOpen,
  Heart,
  Users,
  LogOut,
  ChevronRight,
  Star,
  Calendar,
} from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/hooks/useAuth';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useChurches } from '@/hooks/useChurches';
import AuthScreen from '@/components/AuthScreen';

interface UserStats {
  versesRead: number;
  churchesFollowed: number;
  servicesAttended: number;
  bookmarkedVerses: number;
}

export default function ProfileTab() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { bookmarks } = useBookmarks();
  const { followedChurches } = useChurches();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(false);

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

  const userStats: UserStats = {
    versesRead: 0, // Would need to track this
    churchesFollowed: followedChurches.length,
    servicesAttended: 0, // Would need to track this
    bookmarkedVerses: bookmarks.length,
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: async () => {
          const { error } = await signOut();
          if (error) {
            Alert.alert('Erro', 'Não foi possível sair da conta');
          }
        }},
      ]
    );
  };

  const openSettings = () => {
    Alert.alert('Configurações', 'Tela de configurações seria aberta aqui.');
  };

  const openBookmarks = () => {
    Alert.alert('Favoritos', 'Seus versículos salvos apareceriam aqui.');
  };

  const openReadingHistory = () => {
    Alert.alert('Histórico de Leitura', 'Seu histórico de leitura da Bíblia apareceria aqui.');
  };

  const openFollowedChurches = () => {
    Alert.alert('Igrejas Seguidas', 'Suas igrejas seguidas apareceriam aqui.');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <User size={32} color="#ffffff" />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.user_metadata?.full_name || 'Usuário'}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seu Progresso</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <BookOpen size={24} color="#1e3a8a" />
              <Text style={styles.statNumber}>{userStats.versesRead}</Text>
              <Text style={styles.statLabel}>Versículos Lidos</Text>
            </View>
            <View style={styles.statCard}>
              <Heart size={24} color="#ef4444" />
              <Text style={styles.statNumber}>{userStats.churchesFollowed}</Text>
              <Text style={styles.statLabel}>Igrejas</Text>
            </View>
            <View style={styles.statCard}>
              <Calendar size={24} color="#10b981" />
              <Text style={styles.statNumber}>{userStats.servicesAttended}</Text>
              <Text style={styles.statLabel}>Cultos</Text>
            </View>
            <View style={styles.statCard}>
              <Star size={24} color="#f59e0b" />
              <Text style={styles.statNumber}>{userStats.bookmarkedVerses}</Text>
              <Text style={styles.statLabel}>Favoritos</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          <TouchableOpacity style={styles.menuItem} onPress={openBookmarks}>
            <View style={styles.menuItemLeft}>
              <Star size={20} color="#f59e0b" />
              <Text style={styles.menuItemText}>Versículos Favoritos</Text>
            </View>
            <ChevronRight size={20} color="#6b7280" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={openReadingHistory}>
            <View style={styles.menuItemLeft}>
              <BookOpen size={20} color="#1e3a8a" />
              <Text style={styles.menuItemText}>Histórico de Leitura</Text>
            </View>
            <ChevronRight size={20} color="#6b7280" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={openFollowedChurches}>
            <View style={styles.menuItemLeft}>
              <Users size={20} color="#10b981" />
              <Text style={styles.menuItemText}>Igrejas Seguidas</Text>
            </View>
            <ChevronRight size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configurações</Text>
          
          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Bell size={20} color="#6b7280" />
              <Text style={styles.menuItemText}>Notificações Push</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#f3f4f6', true: '#bfdbfe' }}
              thumbColor={notificationsEnabled ? '#1e3a8a' : '#9ca3af'}
            />
          </View>
          
          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Settings size={20} color="#6b7280" />
              <Text style={styles.menuItemText}>Reproduzir Cultos Automaticamente</Text>
            </View>
            <Switch
              value={autoPlayEnabled}
              onValueChange={setAutoPlayEnabled}
              trackColor={{ false: '#f3f4f6', true: '#bfdbfe' }}
              thumbColor={autoPlayEnabled ? '#1e3a8a' : '#9ca3af'}
            />
          </View>
          
          <TouchableOpacity style={styles.menuItem} onPress={openSettings}>
            <View style={styles.menuItemLeft}>
              <Settings size={20} color="#6b7280" />
              <Text style={styles.menuItemText}>Configurações do App</Text>
            </View>
            <ChevronRight size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <LogOut size={20} color="#ef4444" />
            <Text style={styles.signOutText}>Sair</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>App Bíblia Sagrada v1.0.0</Text>
          <Text style={styles.appInfoText}>© 2025 Comunidade de Fé</Text>
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
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#bfdbfe',
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 12,
    fontWeight: '500',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  signOutText: {
    fontSize: 16,
    color: '#ef4444',
    marginLeft: 8,
    fontWeight: '600',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  appInfoText: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 4,
  },
});