import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';

import { api } from '../lib/api';
import { getStoredToken, getStoredUser } from '../lib/auth';

interface FarmerProfile {
  id: number;
  user_id: number | null;
  name: string;
  village: string | null;
  phone: string | null;
}

interface BookingItem {
  id: number | string;
  farmer_id?: number | string;
  farmerId?: number | string;
  slot_id?: number | string;
  slotId?: number | string;
  crop_id?: number | string;
  quantity_estimate?: number;
  token_number?: string | number;
  tokenNumber?: string | number;
  status?: string;
  created_at?: string;
  createdAt?: string;
}

interface QueueItem {
  id: number;
  booking_id: number;
  centre_id: number;
  status: string;
  entered_at: string;
  called_at?: string | null;
  token_number?: string | number;
  queue_position?: number;
  estimated_wait_minutes?: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

function formatDateTime(isoString?: string | null): string {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

function getStatusBadgeStyle(status?: string) {
  const s = status?.toLowerCase();
  if (s === 'done') {
    return { bg: '#E8F5E9', text: '#2E7D32' };
  }
  if (s === 'quality_check' || s === 'weighing') {
    return { bg: '#FFF8E1', text: '#F57F17' };
  }
  return { bg: '#DCEDE3', text: '#1F6B45' };
}

export default function QueueScreen() {
  const [farmer, setFarmer] = useState<FarmerProfile | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadQueueData = useCallback(async (isPullToRefresh = false) => {
    if (isPullToRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
      setErrorMessage(null);
    }

    try {
      const token = await getStoredToken();
      const user = await getStoredUser();

      if (!token || !user?.id) {
        router.replace('/');
        return;
      }

      // Step 3a: Get farmer profile via GET /farmers/user/:userId
      const farmerResponse = await api.get<ApiResponse<FarmerProfile>>(
        `/farmers/user/${user.id}`,
        token,
      );

      const farmerData = farmerResponse.data;
      if (!farmerData?.id) {
        throw new Error('Farmer profile not found for this account.');
      }
      setFarmer(farmerData);
      const farmerId = farmerData.id;

      // Step 3b: Fetch bookings from real bookings endpoint and keep only those whose farmer_id equals this farmer's id
      let farmerBookings: BookingItem[] = [];
      try {
        const bookingsResponse = await api.get<ApiResponse<BookingItem[]>>(
          `/bookings/farmer/${farmerId}`,
          token,
        );

        const allBookings = bookingsResponse.data || [];
        farmerBookings = allBookings.filter((b) => {
          const bFarmerId = b.farmer_id !== undefined ? b.farmer_id : b.farmerId;
          if (bFarmerId === undefined) return false;
          return Number(bFarmerId) === Number(farmerId);
        });
      } catch (bookingErr) {
        console.warn('Bookings request warning:', bookingErr);
        farmerBookings = [];
      }

      // Collect the set of the farmer's booking IDs
      const farmerBookingIds = new Set<string>(
        farmerBookings.map((b) => String(b.id)),
      );

      // Step 3c: Fetch GET /queue and keep only rows whose booking_id is in that set of farmer's booking IDs
      const queueResponse = await api.get<ApiResponse<QueueItem[]>>(
        '/queue',
        token,
      );

      const allQueueItems = queueResponse.data || [];

      // Filter queue rows: match booking_id against the farmer's booking IDs
      const filteredQueue = allQueueItems.filter((q) =>
        farmerBookingIds.has(String(q.booking_id)),
      );

      // Step 3d: Show filtered rows (or empty state if none match)
      setQueue(filteredQueue);
      setErrorMessage(null);
    } catch (error) {
      console.error('Queue loading error:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to load queue data';
      setErrorMessage(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadQueueData(false);
    }, [loadQueueData]),
  );

  async function handleRefresh() {
    await loadQueueData(true);
  }

  // Loading State
  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#1F6B45" />
        <Text style={styles.loadingText}>Loading your queue...</Text>
      </View>
    );
  }

  // Error State with Retry Button
  if (errorMessage && !refreshing) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Unable to Load Queue</Text>
        <Text style={styles.errorDescription}>{errorMessage}</Text>
        <Pressable
          style={({ pressed }) => [
            styles.retryButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => loadQueueData(false)}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
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
          onRefresh={handleRefresh}
          colors={['#1F6B45']}
          tintColor="#1F6B45"
        />
      }
    >
      {/* FARMER SUMMARY BANNER */}
      {farmer && (
        <View style={styles.farmerCard}>
          <View style={styles.farmerInfo}>
            <Text style={styles.farmerLabel}>Farmer</Text>
            <Text style={styles.farmerName}>{farmer.name}</Text>
            <Text style={styles.farmerSub}>
              {farmer.village ? `Village: ${farmer.village}` : 'MandiMitra Registered'}
            </Text>
          </View>
          <View style={styles.farmerBadge}>
            <Text style={styles.farmerBadgeText}>ID #{farmer.id}</Text>
          </View>
        </View>
      )}

      {/* QUEUE CONTENT */}
      {queue.length === 0 ? (
        /* EMPTY STATE: Only shown when the filtered result is truly empty */
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>🎫</Text>
          <Text style={styles.emptyTitle}>No Active Queue</Text>
          <Text style={styles.emptyText}>
            You are not in any queue right now
          </Text>
          <Text style={styles.emptyHint}>
            When a procurement token is issued for your booking, your live status will appear here.
          </Text>
        </View>
      ) : (
        /* QUEUE LIST: Filtered rows */
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Queue Entries</Text>

          {queue.map((item) => {
            const badge = getStatusBadgeStyle(item.status);
            return (
              <View key={item.id} style={styles.queueCard}>
                <View style={styles.queueTopRow}>
                  <View>
                    <Text style={styles.queueLabel}>Queue Entry</Text>
                    <Text style={styles.tokenNumber}>
                      #{item.token_number ?? item.id}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: badge.bg },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        { color: badge.text },
                      ]}
                    >
                      {item.status ? item.status.toUpperCase() : 'WAITING'}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Booking ID</Text>
                  <Text style={styles.infoValue}>#{item.booking_id}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Procurement Centre</Text>
                  <Text style={styles.infoValue}>Centre #{item.centre_id}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Joined Queue</Text>
                  <Text style={styles.infoValue}>
                    {formatDateTime(item.entered_at)}
                  </Text>
                </View>

                {item.called_at ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Called At</Text>
                    <Text style={styles.infoValue}>
                      {formatDateTime(item.called_at)}
                    </Text>
                  </View>
                ) : null}

                {item.queue_position !== undefined ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Position</Text>
                    <Text style={styles.infoValue}>{item.queue_position}</Text>
                  </View>
                ) : null}

                {item.estimated_wait_minutes !== undefined ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Estimated Wait</Text>
                    <Text style={styles.infoValue}>
                      ~{item.estimated_wait_minutes} min
                    </Text>
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      )}

      {/* PULL TO REFRESH HINT */}
      <View style={styles.refreshHintCard}>
        <Text style={styles.refreshHintIcon}>🔄</Text>
        <View style={styles.refreshHintContent}>
          <Text style={styles.refreshHintTitle}>Live Status</Text>
          <Text style={styles.refreshHintText}>
            Pull down to refresh your real-time queue position and status.
          </Text>
        </View>
      </View>

      <Text style={styles.footer}>Connected to MandiMitra backend</Text>
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

  centeredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F7F4',
    padding: 24,
  },

  loadingText: {
    marginTop: 14,
    fontSize: 15,
    color: '#68736B',
  },

  errorIcon: {
    fontSize: 48,
    marginBottom: 14,
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 8,
    textAlign: 'center',
  },

  errorDescription: {
    fontSize: 14,
    color: '#68736B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },

  retryButton: {
    backgroundColor: '#1F6B45',
    paddingVertical: 13,
    paddingHorizontal: 28,
    borderRadius: 12,
  },

  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  buttonPressed: {
    opacity: 0.8,
  },

  farmerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6EAE6',
  },

  farmerInfo: {
    flex: 1,
  },

  farmerLabel: {
    fontSize: 12,
    color: '#68736B',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 3,
  },

  farmerName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111111',
  },

  farmerSub: {
    fontSize: 13,
    color: '#68736B',
    marginTop: 2,
  },

  farmerBadge: {
    backgroundColor: '#DCEDE3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },

  farmerBadgeText: {
    color: '#1F6B45',
    fontWeight: '700',
    fontSize: 12,
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 28,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E6EAE6',
  },

  emptyIcon: {
    fontSize: 54,
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F6B45',
    textAlign: 'center',
    marginBottom: 10,
  },

  emptyHint: {
    fontSize: 13,
    color: '#68736B',
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 280,
  },

  section: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 12,
    color: '#111111',
  },

  queueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E6EAE6',
  },

  queueTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  queueLabel: {
    fontSize: 12,
    color: '#68736B',
    fontWeight: '600',
  },

  tokenNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111111',
    marginTop: 2,
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },

  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },

  divider: {
    height: 1,
    backgroundColor: '#E6EAE6',
    marginVertical: 16,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
  },

  infoLabel: {
    fontSize: 14,
    color: '#68736B',
  },

  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
  },

  refreshHintCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E6EAE6',
  },

  refreshHintIcon: {
    fontSize: 24,
    marginRight: 12,
  },

  refreshHintContent: {
    flex: 1,
  },

  refreshHintTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 3,
  },

  refreshHintText: {
    fontSize: 12,
    color: '#68736B',
    lineHeight: 17,
  },

  footer: {
    textAlign: 'center',
    fontSize: 11,
    color: '#89928B',
    marginTop: 8,
  },
});