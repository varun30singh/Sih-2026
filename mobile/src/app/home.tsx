import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';

import { api } from '../lib/api';
import { getStoredToken, getStoredUser } from '../lib/auth';

interface FarmerProfile {
  id: number;
  user_id: number | null;
  name: string;
  village: string | null;
  phone: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface QueueItem {
  id: number;
  token_number?: string | number;
  status?: string;
  queue_position?: number;
  estimated_wait_minutes?: number;
  centre_id?: number;
}

export default function HomeScreen() {
  const [farmer, setFarmer] = useState<FarmerProfile | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadDashboard() {
    try {
      const token = await getStoredToken();
      const user = await getStoredUser();

      if (!token || !user?.id) {
        router.replace('/');
        return;
      }

      const farmerResponse =
        await api.get<ApiResponse<FarmerProfile>>(
          `/farmers/user/${user.id}`,
          token,
        );

      setFarmer(farmerResponse.data);

      try {
        const queueResponse =
          await api.get<ApiResponse<QueueItem[]>>(
            `/queue?farmerId=${farmerResponse.data.id}`,
            token,
          );

        setQueue(queueResponse.data || []);
      } catch (queueError) {
        console.log('Queue data unavailable:', queueError);
        setQueue([]);
      }
    } catch (error) {
      console.error('Dashboard loading error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function refreshDashboard() {
    setRefreshing(true);
    await loadDashboard();
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Loading your dashboard...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.safeArea}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refreshDashboard}
        />
      }
    >
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Welcome back 👋
          </Text>

          <Text style={styles.name}>
            {farmer?.name || 'Farmer'}
          </Text>

          <Text style={styles.location}>
            {farmer?.village || 'Village not available'}
          </Text>
        </View>

        <Pressable
          style={styles.profileButton}
          onPress={() =>
            console.log('Profile screen coming next')
          }
        >
          <Text style={styles.profileIcon}>
            👤
          </Text>
        </Pressable>
      </View>

      {/* PROCUREMENT STATUS */}
      <View style={styles.statusCard}>
        <View>
          <Text style={styles.statusLabel}>
            Procurement Status
          </Text>

          <Text style={styles.statusTitle}>
            {queue.length > 0
              ? 'You have an active queue'
              : 'No active queue'}
          </Text>

          <Text style={styles.statusDescription}>
            {queue.length > 0
              ? 'Track your token and waiting time below.'
              : 'Book a slot or join a queue when you are ready.'}
          </Text>
        </View>

        <Text style={styles.statusEmoji}>
          {queue.length > 0 ? '🎫' : '🌾'}
        </Text>
      </View>

      {/* LIVE QUEUE */}
      {queue.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Live Queue
          </Text>

          {queue.slice(0, 2).map((item) => (
            <View
              key={item.id}
              style={styles.queueCard}
            >
              <View>
                <Text style={styles.queueLabel}>
                  Token
                </Text>

                <Text style={styles.token}>
                  #{item.token_number ?? item.id}
                </Text>
              </View>

              <View style={styles.queueRight}>
                <Text style={styles.queueStatus}>
                  {item.status || 'ACTIVE'}
                </Text>

                {item.estimated_wait_minutes !==
                  undefined && (
                  <Text style={styles.waitTime}>
                    ~{item.estimated_wait_minutes} min wait
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* QUICK ACTIONS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Quick Actions
        </Text>

        <View style={styles.actionGrid}>
          {/* FIND CENTRE */}
          <Pressable
            style={styles.actionCard}
            onPress={() => router.push('/smart-centres')}
          >
            <Text style={styles.actionIcon}>
              📍
            </Text>

            <Text style={styles.actionTitle}>
              Find Centre
            </Text>

            <Text style={styles.actionText}>
              Smart centre recommendations
            </Text>
          </Pressable>

          {/* BOOK SLOT */}
          <Pressable
            style={styles.actionCard}
            onPress={() => router.push('/book-slot')}
          >
            <Text style={styles.actionIcon}>
              📅
            </Text>

            <Text style={styles.actionTitle}>
              Book Slot
            </Text>

            <Text style={styles.actionText}>
              Reserve a procurement slot
            </Text>
          </Pressable>

          {/* MY QUEUE */}
          <Pressable
            style={styles.actionCard}
            onPress={() => router.push('/queue')}
          >
            <Text style={styles.actionIcon}>
              🎫
            </Text>

            <Text style={styles.actionTitle}>
              My Queue
            </Text>

            <Text style={styles.actionText}>
              Track token and waiting time
            </Text>
          </Pressable>

          {/* PAYMENTS */}
          <Pressable
            style={styles.actionCard}
            onPress={() => router.push('/payments')}
          >
            <Text style={styles.actionIcon}>
              💰
            </Text>

            <Text style={styles.actionTitle}>
              Payments
            </Text>

            <Text style={styles.actionText}>
              Check payment status
            </Text>
          </Pressable>

          {/* CHAT WITH ASSISTANT */}
          <Pressable
            style={styles.actionCard}
            onPress={() => router.push('/chat')}
          >
            <Text style={styles.actionIcon}>
              🤖
            </Text>

            <Text style={styles.actionTitle}>
              Krish AI
            </Text>

            <Text style={styles.actionText}>
              Ask Krish AI about queues, slots & rates
            </Text>
          </Pressable>
        </View>
      </View>

      {/* ASSISTANT */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          MandiMitra Services
        </Text>

        <Pressable
          style={styles.serviceCard}
          onPress={() => router.push('/chat')}
        >
          <Text style={styles.serviceIcon}>
            🤖
          </Text>

          <View style={styles.serviceContent}>
            <Text style={styles.serviceTitle}>
              Krish AI
            </Text>

            <Text style={styles.serviceText}>
              Ask Krish AI about procurement, queues, slots,
              payments and farming.
            </Text>
          </View>

          <Text style={styles.arrow}>
            →
          </Text>
        </Pressable>
      </View>

      <Text style={styles.footer}>
        Connected to MandiMitra backend
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7F4',
  },

  container: {
    padding: 20,
    paddingBottom: 40,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F7F4',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },

  greeting: {
    fontSize: 14,
    color: '#68736B',
    marginBottom: 4,
  },

  name: {
    fontSize: 28,
    fontWeight: '700',
  },

  location: {
    fontSize: 14,
    color: '#68736B',
    marginTop: 4,
  },

  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileIcon: {
    fontSize: 22,
  },

  statusCard: {
    backgroundColor: '#1F6B45',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },

  statusLabel: {
    color: '#DCEDE3',
    fontSize: 13,
    marginBottom: 6,
  },

  statusTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '700',
  },

  statusDescription: {
    color: '#E5F1EA',
    fontSize: 13,
    marginTop: 6,
    maxWidth: 270,
    lineHeight: 19,
  },

  statusEmoji: {
    fontSize: 42,
  },

  section: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 12,
  },

  queueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  queueLabel: {
    fontSize: 12,
    color: '#68736B',
  },

  token: {
    fontSize: 25,
    fontWeight: '700',
    marginTop: 3,
  },

  queueRight: {
    alignItems: 'flex-end',
  },

  queueStatus: {
    fontSize: 12,
    fontWeight: '700',
  },

  waitTime: {
    fontSize: 13,
    color: '#68736B',
    marginTop: 5,
  },

  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  actionCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },

  actionIcon: {
    fontSize: 27,
    marginBottom: 10,
  },

  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 5,
  },

  actionText: {
    fontSize: 12,
    color: '#68736B',
    lineHeight: 17,
  },

  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
  },

  serviceIcon: {
    fontSize: 30,
    marginRight: 14,
  },

  serviceContent: {
    flex: 1,
  },

  serviceTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },

  serviceText: {
    fontSize: 12,
    color: '#68736B',
    lineHeight: 17,
  },

  arrow: {
    fontSize: 24,
    marginLeft: 8,
  },

  footer: {
    textAlign: 'center',
    fontSize: 11,
    color: '#89928B',
    marginTop: 4,
  },
});