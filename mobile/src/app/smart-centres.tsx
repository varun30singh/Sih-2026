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
import { getStoredToken } from '../lib/auth';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface Centre {
  id: number;
  name: string;
  location: string;
  capacity_per_slot: number;
  processing_rate: number | null;
  created_at?: string;
}

export default function SmartCentresScreen() {
  const [centres, setCentres] = useState<Centre[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  async function loadCentres() {
    try {
      setError('');

      const response =
        await api.get<ApiResponse<Centre[]>>(
          '/procurement-centres',
        );

      setCentres(response.data || []);
    } catch (err) {
      console.error('Centre loading error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load procurement centres.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadCentres();
  }, []);

  async function refresh() {
    setRefreshing(true);
    await loadCentres();
  }

  function openBooking(centreId: number) {
    router.push({
      pathname: '/book-slot',
      params: {
        centreId: String(centreId),
      },
    });
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>
          Finding procurement centres...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refresh}
        />
      }
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.title}>
            Find Centre
          </Text>

          <Text style={styles.subtitle}>
            View procurement centres connected to MandiMitra.
          </Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoIcon}>📍</Text>

        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>
            Live centre availability
          </Text>

          <Text style={styles.infoText}>
            Centre information is loaded directly from the
            MandiMitra backend.
          </Text>
        </View>
      </View>

      {error ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>
            Unable to load centres
          </Text>

          <Text style={styles.errorText}>
            {error}
          </Text>

          <Pressable
            style={styles.retryButton}
            onPress={loadCentres}
          >
            <Text style={styles.retryText}>
              Try Again
            </Text>
          </Pressable>
        </View>
      ) : centres.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>🌾</Text>

          <Text style={styles.emptyTitle}>
            No centres available
          </Text>

          <Text style={styles.emptyText}>
            Procurement centres have not been added to
            the MandiMitra system yet.
          </Text>

          <Text style={styles.emptyHint}>
            Once an administrator creates a centre, it
            will appear here automatically.
          </Text>
        </View>
      ) : (
        <View>
          <Text style={styles.sectionTitle}>
            Available Centres ({centres.length})
          </Text>

          {centres.map((centre) => (
            <View
              key={centre.id}
              style={styles.centreCard}
            >
              <View style={styles.centreTop}>
                <View style={styles.centreIcon}>
                  <Text>🏪</Text>
                </View>

                <View style={styles.centreMain}>
                  <Text style={styles.centreName}>
                    {centre.name}
                  </Text>

                  <Text style={styles.location}>
                    📍 {centre.location}
                  </Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>
                    {centre.capacity_per_slot}
                  </Text>

                  <Text style={styles.statLabel}>
                    Capacity / slot
                  </Text>
                </View>

                <View style={styles.stat}>
                  <Text style={styles.statValue}>
                    {centre.processing_rate ?? '—'}
                  </Text>

                  <Text style={styles.statLabel}>
                    Processing rate
                  </Text>
                </View>
              </View>

              <Pressable
                style={styles.bookButton}
                onPress={() => openBooking(centre.id)}
              >
                <Text style={styles.bookButtonText}>
                  View Available Slots →
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F7F4',
  },

  container: {
    padding: 20,
    paddingBottom: 40,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F7F4',
    padding: 30,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  backText: {
    fontSize: 32,
    lineHeight: 34,
    color: '#1F6B45',
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 27,
    fontWeight: '700',
  },

  subtitle: {
    fontSize: 13,
    color: '#68736B',
    marginTop: 4,
    lineHeight: 18,
  },

  infoCard: {
    backgroundColor: '#E5F1EA',
    borderRadius: 18,
    padding: 17,
    flexDirection: 'row',
    marginBottom: 24,
  },

  infoIcon: {
    fontSize: 27,
    marginRight: 13,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F6B45',
  },

  infoText: {
    fontSize: 12,
    color: '#52645A',
    marginTop: 4,
    lineHeight: 17,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 12,
  },

  centreCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 17,
    marginBottom: 14,
  },

  centreTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  centreIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#E5F1EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  centreMain: {
    flex: 1,
  },

  centreName: {
    fontSize: 17,
    fontWeight: '700',
  },

  location: {
    fontSize: 13,
    color: '#68736B',
    marginTop: 5,
  },

  statsRow: {
    flexDirection: 'row',
    marginTop: 17,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EDF0ED',
    paddingVertical: 13,
  },

  stat: {
    flex: 1,
  },

  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },

  statLabel: {
    fontSize: 11,
    color: '#68736B',
    marginTop: 3,
  },

  bookButton: {
    backgroundColor: '#1F6B45',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 14,
  },

  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
  },

  emptyIcon: {
    fontSize: 46,
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
  },

  emptyText: {
    textAlign: 'center',
    color: '#68736B',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },

  emptyHint: {
    textAlign: 'center',
    color: '#89928B',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
  },

  errorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
  },

  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
  },

  errorText: {
    color: '#68736B',
    marginTop: 7,
    lineHeight: 19,
  },

  retryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#1F6B45',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 15,
  },

  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
