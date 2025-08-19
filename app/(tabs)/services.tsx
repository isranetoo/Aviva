import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Calendar, Clock, MapPin, Users, Play, Bell } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/hooks/useAuth';
import { useServices } from '@/hooks/useServices';
import AuthScreen from '@/components/AuthScreen';


export default function ServicesTab() {
  const { user, loading: authLoading } = useAuth();
  const { liveServices, upcomingServices, loading, joinLiveService } = useServices();
  const [reminders, setReminders] = useState<string[]>([]);

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

  const handleJoinLiveService = async (service: any) => {
    Alert.alert(
      'Participar do Culto Ao Vivo',
      `Participar de "${service.sermon_title || service.title}" na ${service.churches?.name}?\n\nVocê verá destaques de versículos em tempo real e anotações do sermão.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Participar Agora', onPress: async () => {
          const { error } = await joinLiveService(service.id);
          if (error) {
            Alert.alert('Erro', 'Não foi possível participar do culto');
          } else {
            Alert.alert('Conectado!', 'Você está conectado ao culto ao vivo.');
          }
        }},
      ]
    );
  };

  const toggleReminder = (serviceId: string) => {
    setReminders(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const openServiceDetails = (service: any) => {
    const serviceDate = new Date(service.starts_at);
    const formattedDate = serviceDate.toLocaleDateString('pt-BR');
    const formattedTime = serviceDate.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    Alert.alert(
      service.sermon_title || service.title,
      `Igreja: ${service.churches?.name}\nPregador: ${service.preacher_name || 'Não informado'}\nPassagem: ${service.sermon_passage || 'Não informado'}\nData: ${formattedDate} às ${formattedTime}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Ver Passagem', onPress: () => {} },
      ]
    );
  };

  const formatServiceTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24 && diffInHours > -24) {
      if (diffInHours > 0) {
        return 'Hoje';
      } else if (diffInHours > -24) {
        return 'Hoje';
      }
    } else if (diffInHours < 48) {
      return 'Amanhã';
    }
    
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cultos da Igreja</Text>
        <Text style={styles.headerSubtitle}>Conecte-se com adoração e sermões ao vivo</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Live Services */}
        {liveServices.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Ao Vivo Agora</Text>
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>AO VIVO</Text>
              </View>
            </View>
            {liveServices.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={[styles.serviceCard, styles.liveServiceCard]}
                onPress={() => openServiceDetails(service)}
              >
                <View style={styles.serviceHeader}>
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceTitle}>{service.sermon_title || service.title}</Text>
                    <Text style={styles.churchName}>{service.churches?.name}</Text>
                    <Text style={styles.servicePreacher}>com {service.preacher_name || 'Pregador'}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.joinButton}
                    onPress={() => handleJoinLiveService(service)}
                  >
                    <Play size={16} color="#ffffff" />
                    <Text style={styles.joinButtonText}>Participar</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.passageSection}>
                  <Text style={styles.passageLabel}>Passagem de Hoje:</Text>
                  <Text style={styles.passageText}>{service.sermon_passage || 'Não informado'}</Text>
                </View>
                
                <View style={styles.serviceStats}>
                  <View style={styles.stat}>
                    <Users size={16} color="#6b7280" />
                    <Text style={styles.statText}>{service.attendees_count} assistindo</Text>
                  </View>
                  <View style={styles.stat}>
                    <Clock size={16} color="#6b7280" />
                    <Text style={styles.statText}>{new Date(service.starts_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Upcoming Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Próximos Cultos</Text>
          {upcomingServices.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={styles.serviceCard}
              onPress={() => openServiceDetails(service)}
            >
              <View style={styles.serviceHeader}>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceTitle}>{service.sermon_title || service.title}</Text>
                  <Text style={styles.churchName}>{service.churches?.name}</Text>
                  <Text style={styles.servicePreacher}>com {service.preacher_name || 'Pregador'}</Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.reminderButton,
                    reminders.includes(service.id) && styles.reminderActiveButton
                  ]}
                  onPress={() => toggleReminder(service.id)}
                >
                  <Bell 
                    size={20} 
                    color={reminders.includes(service.id) ? '#ffffff' : '#1e3a8a'}
                  />
                </TouchableOpacity>
              </View>
              
              <View style={styles.passageSection}>
                <Text style={styles.passageLabel}>Passagem:</Text>
                <Text style={styles.passageText}>{service.sermon_passage || 'Não informado'}</Text>
              </View>
              
              <View style={styles.serviceStats}>
                <View style={styles.stat}>
                  <Calendar size={16} color="#6b7280" />
                  <Text style={styles.statText}>{formatServiceTime(service.starts_at)}</Text>
                </View>
                <View style={styles.stat}>
                  <Clock size={16} color="#6b7280" />
                  <Text style={styles.statText}>{new Date(service.starts_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Empty State */}
        {liveServices.length === 0 && upcomingServices.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Calendar size={48} color="#d1d5db" />
            <Text style={styles.emptyStateTitle}>Nenhum Culto Disponível</Text>
            <Text style={styles.emptyStateText}>
              Siga igrejas para ver seus próximos cultos e participar da adoração ao vivo.
            </Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
    marginRight: 6,
  },
  liveText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  serviceCard: {
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
  liveServiceCard: {
    borderColor: '#ef4444',
    borderWidth: 2,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  churchName: {
    fontSize: 16,
    color: '#1e3a8a',
    fontWeight: '600',
    marginBottom: 2,
  },
  servicePreacher: {
    fontSize: 14,
    color: '#6b7280',
  },
  joinButton: {
    backgroundColor: '#ef4444',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
  },
  joinButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  reminderButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 24,
    padding: 8,
    borderWidth: 2,
    borderColor: '#1e3a8a',
  },
  reminderActiveButton: {
    backgroundColor: '#1e3a8a',
  },
  passageSection: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  passageLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  passageText: {
    fontSize: 16,
    color: '#1e3a8a',
    fontWeight: '600',
  },
  serviceStats: {
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});