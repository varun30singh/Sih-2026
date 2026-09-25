import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
  cropId?: number | string;
  quantity_estimate?: number | string;
  token_number?: string | number;
  tokenNumber?: string | number;
  status?: string;
  created_at?: string;
  createdAt?: string;
  crops?: {
    id: number;
    name: string;
    msp_rate?: number;
    unit?: string;
  };
  slots?: {
    id: number;
    centre_id: number;
    crop_id: number;
    date: string;
    start_time: string;
    end_time: string;
    capacity: number;
    booked_count: number;
    procurement_centres?: {
      id: number;
      name: string;
      location: string;
    };
  };
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

interface CentreItem {
  id: number;
  name: string;
  location: string;
  capacity_per_slot?: number;
  processing_rate?: number | null;
}

interface CropItem {
  id: number;
  name: string;
  mspRate?: number;
  unit?: string;
}

interface SlotItem {
  id: number;
  centre_id: number;
  crop_id: number;
  date: string;
  start_time: string;
  end_time: string;
  capacity: number;
  booked_count: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

function formatDate(isoString?: string | null): string {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}

function formatTime(isoString?: string | null): string {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString;
  }
}

function formatDateTime(isoString?: string | null): string {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
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
  if (s === 'cancelled') {
    return { bg: '#FEE2E2', text: '#991B1B' };
  }
  return { bg: '#DCEDE3', text: '#1F6B45' };
}

export default function QueueScreen() {
  const [farmer, setFarmer] = useState<FarmerProfile | null>(null);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [centresMap, setCentresMap] = useState<Record<number, CentreItem>>({});
  const [cropsMap, setCropsMap] = useState<Record<number, CropItem>>({});
  const [slotsMap, setSlotsMap] = useState<Record<number, SlotItem>>({});

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingBookingId, setCancellingBookingId] = useState<number | null>(
    null,
  );
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

      // Fetch bookings, queue, centres, crops, and slots in parallel
      const [
        bookingsResponse,
        queueResponse,
        centresResponse,
        cropsResponse,
        slotsResponse,
      ] = await Promise.all([
        api
          .get<ApiResponse<BookingItem[]>>(
            `/bookings/farmer/${farmerId}`,
            token,
          )
          .catch(() => ({ success: false, data: [] })),
        api
          .get<ApiResponse<QueueItem[]>>('/queue', token)
          .catch(() => ({ success: false, data: [] })),
        api
          .get<ApiResponse<CentreItem[]>>('/procurement-centres', token)
          .catch(() => ({ success: false, data: [] })),
        api
          .get<ApiResponse<CropItem[]>>('/crops', token)
          .catch(() => ({ success: false, data: [] })),
        api
          .get<ApiResponse<SlotItem[]>>('/slots', token)
          .catch(() => ({ success: false, data: [] })),
      ]);

      const allBookings = bookingsResponse.data || [];
      const allQueueItems = queueResponse.data || [];
      const fetchedCentres = centresResponse.data || [];
      const fetchedCrops = cropsResponse.data || [];
      const fetchedSlots = slotsResponse.data || [];

      // Create lookup maps by ID
      const cMap: Record<number, CentreItem> = {};
      fetchedCentres.forEach((c) => {
        cMap[c.id] = c;
      });
      setCentresMap(cMap);

      const crMap: Record<number, CropItem> = {};
      fetchedCrops.forEach((cr) => {
        crMap[cr.id] = cr;
      });
      setCropsMap(crMap);

      const sMap: Record<number, SlotItem> = {};
      fetchedSlots.forEach((s) => {
        sMap[s.id] = s;
      });
      setSlotsMap(sMap);

      // Keep only bookings matching this farmer
      const farmerBookings = allBookings.filter((b) => {
        const bFarmerId = b.farmer_id !== undefined ? b.farmer_id : b.farmerId;
        if (bFarmerId === undefined) return false;
        return Number(bFarmerId) === Number(farmerId);
      });
      setBookings(farmerBookings);

      // Collect active (non-cancelled) booking IDs
      const activeBookings = farmerBookings.filter(
        (b) => b.status !== 'cancelled',
      );
      const activeBookingIds = new Set<string>(
        activeBookings.map((b) => String(b.id)),
      );

      // Filter queue rows: match booking_id against active bookings and exclude done queue items
      const filteredQueue = allQueueItems.filter(
        (q) =>
          activeBookingIds.has(String(q.booking_id)) &&
          q.status?.toLowerCase() !== 'done',
      );

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

  function promptCancelBooking(bookingId: number) {
    Alert.alert(
      'Cancel Booking',
      'Cancel this booking? This cannot be undone.',
      [
        {
          text: 'No, Keep It',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => handleCancelBooking(bookingId),
        },
      ],
    );
  }

  async function handleCancelBooking(bookingId: number) {
    try {
      setCancellingBookingId(bookingId);

      // 1. Optimistic update: immediately remove from queue & active bookings
      setQueue((prev) =>
        prev.filter((q) => Number(q.booking_id) !== Number(bookingId)),
      );
      setBookings((prev) =>
        prev.map((b) =>
          Number(b.id) === Number(bookingId)
            ? { ...b, status: 'cancelled' }
            : b,
        ),
      );

      const token = await getStoredToken();
      if (!token) {
        router.replace('/');
        return;
      }

      // 2. Call backend cancellation endpoint
      await api.patch(`/bookings/${bookingId}/cancel`, {}, token);

      Alert.alert(
        'Booking Cancelled',
        'Your procurement booking and queue entry have been cancelled successfully.',
      );

      // 3. Re-fetch from server to verify synchronized state
      await loadQueueData(false);
    } catch (err) {
      console.error('Cancellation error:', err);
      Alert.alert(
        'Cancellation Failed',
        err instanceof Error
          ? err.message
          : 'Unable to cancel booking. Please try again.',
      );
      // Re-fetch on failure to restore true state
      await loadQueueData(false);
    } finally {
      setCancellingBookingId(null);
    }
  }

  // Active (non-cancelled) bookings for the farmer
  const activeBookings = bookings.filter((b) => b.status !== 'cancelled');

  // Loading State
  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#1F6B45" />
        <Text style={styles.loadingText}>Loading your queue & bookings...</Text>
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
              {farmer.village
                ? `Village: ${farmer.village}`
                : 'MandiMitra Registered'}
            </Text>
          </View>
          <View style={styles.farmerBadge}>
            <Text style={styles.farmerBadgeText}>ID #{farmer.id}</Text>
          </View>
        </View>
      )}

      {/* ================= SECTION 1: YOUR ACTIVE BOOKING ================= */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Active Booking</Text>

        {activeBookings.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyTitle}>No Active Booking</Text>
            <Text style={styles.emptyText}>
              You do not have any active procurement bookings right now.
            </Text>
            <Pressable
              style={styles.bookSlotButton}
              onPress={() => router.push('/book-slot')}
            >
              <Text style={styles.bookSlotButtonText}>Book a Slot</Text>
            </Pressable>
          </View>
        ) : (
          activeBookings.map((b) => {
            const slotId = Number(b.slot_id ?? b.slotId);
            const slot = b.slots || (slotId ? slotsMap[slotId] : undefined);
            const centreId = slot?.centre_id;
            const centre = centreId ? centresMap[centreId] : undefined;
            const centreName =
              b.slots?.procurement_centres?.name ||
              centre?.name ||
              (centreId ? `Centre #${centreId}` : 'Procurement Centre');

            const cropId = Number(b.crop_id ?? b.cropId);
            const crop = cropId ? cropsMap[cropId] : undefined;
            const cropName =
              b.crops?.name || crop?.name || (cropId ? `Crop #${cropId}` : 'Crop');

            const dateStr = slot?.date
              ? formatDate(slot.date)
              : formatDate(b.created_at);

            const timeStr =
              slot?.start_time && slot?.end_time
                ? `${formatTime(slot.start_time)} – ${formatTime(slot.end_time)}`
                : 'Scheduled Window';

            const tokenStr = String(
              b.token_number ?? b.tokenNumber ?? `T-${b.id}`,
            );

            const isCancelling = cancellingBookingId === Number(b.id);

            return (
              <View key={b.id} style={styles.activeBookingCard}>
                <View style={styles.bookingTopRow}>
                  <View>
                    <Text style={styles.bookingCardSubtitle}>
                      PROCUREMENT TOKEN
                    </Text>
                    <Text style={styles.bookingTokenText}>#{tokenStr}</Text>
                  </View>

                  <View style={styles.bookingStatusBadge}>
                    <Text style={styles.bookingStatusText}>
                      {(b.status || 'BOOKED').toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Procurement Centre</Text>
                  <Text style={styles.infoValue}>
                    {centreName}
                    {centre?.location ? ` (${centre.location})` : ''}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Crop</Text>
                  <Text style={styles.infoValue}>🌾 {cropName}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Scheduled Window</Text>
                  <Text style={styles.infoValue}>
                    📅 {dateStr} • {timeStr}
                  </Text>
                </View>

                {b.quantity_estimate ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Estimated Quantity</Text>
                    <Text style={styles.infoValue}>
                      {b.quantity_estimate} Quintals
                    </Text>
                  </View>
                ) : null}

                {/* Cancel Booking Button */}
                <Pressable
                  style={({ pressed }) => [
                    styles.cancelButton,
                    pressed && styles.cancelButtonPressed,
                    isCancelling && styles.disabledButton,
                  ]}
                  onPress={() => promptCancelBooking(Number(b.id))}
                  disabled={isCancelling}
                >
                  {isCancelling ? (
                    <ActivityIndicator color="#C0392B" size="small" />
                  ) : (
                    <Text style={styles.cancelButtonText}>Cancel Booking</Text>
                  )}
                </Pressable>
              </View>
            );
          })
        )}
      </View>

      {/* ================= SECTION 2: ACTIVE QUEUE ENTRIES ================= */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Queue Entries</Text>

        {queue.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🎫</Text>
            <Text style={styles.emptyTitle}>No Active Queue</Text>
            <Text style={styles.emptyText}>
              You are not in any queue right now.
            </Text>
            <Text style={styles.emptyHint}>
              When a procurement token is issued for your booking, your live
              status will appear here.
            </Text>
          </View>
        ) : (
          queue.map((item) => {
            const badge = getStatusBadgeStyle(item.status);
            const centre = centresMap[item.centre_id];
            const centreName =
              centre?.name || `Procurement Centre #${item.centre_id}`;

            const matchingBooking = bookings.find(
              (b) => Number(b.id) === Number(item.booking_id),
            );
            const cropId = matchingBooking
              ? Number(matchingBooking.crop_id ?? matchingBooking.cropId)
              : undefined;
            const crop = cropId ? cropsMap[cropId] : undefined;
            const cropName = matchingBooking?.crops?.name || crop?.name;

            const isCancelling = cancellingBookingId === Number(item.booking_id);

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
                  <Text style={styles.infoValue}>
                    {centreName}
                    {centre?.location ? ` (${centre.location})` : ''}
                  </Text>
                </View>

                {cropName && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Crop</Text>
                    <Text style={styles.infoValue}>🌾 {cropName}</Text>
                  </View>
                )}

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
                    <Text style={styles.infoLabel}>Position in Queue</Text>
                    <Text style={[styles.infoValue, { color: '#1F6B45' }]}>
                      #{item.queue_position}
                    </Text>
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

                {/* Cancel Booking Button for active queue entry */}
                <Pressable
                  style={({ pressed }) => [
                    styles.cancelButton,
                    pressed && styles.cancelButtonPressed,
                    isCancelling && styles.disabledButton,
                  ]}
                  onPress={() => promptCancelBooking(item.booking_id)}
                  disabled={isCancelling}
                >
                  {isCancelling ? (
                    <ActivityIndicator color="#C0392B" size="small" />
                  ) : (
                    <Text style={styles.cancelButtonText}>Cancel Booking</Text>
                  )}
                </Pressable>
              </View>
            );
          })
        )}
      </View>

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
    padding: 16,
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
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
  },

  buttonPressed: {
    opacity: 0.85,
  },

  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  farmerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8EDE9',
  },

  farmerInfo: {
    flex: 1,
  },

  farmerLabel: {
    fontSize: 11,
    color: '#68736B',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  farmerName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#202720',
    marginTop: 2,
  },

  farmerSub: {
    fontSize: 12,
    color: '#68736B',
    marginTop: 2,
  },

  farmerBadge: {
    backgroundColor: '#E5F1EA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  farmerBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1F6B45',
  },

  section: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#202720',
    marginBottom: 12,
  },

  activeBookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8EDE9',
  },

  bookingTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  bookingCardSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#68736B',
    letterSpacing: 0.8,
  },

  bookingTokenText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F6B45',
    marginTop: 2,
    fontFamily: 'monospace',
  },

  bookingStatusBadge: {
    backgroundColor: '#E5F1EA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  bookingStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1F6B45',
    letterSpacing: 0.5,
  },

  queueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8EDE9',
  },

  queueTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  queueLabel: {
    fontSize: 11,
    color: '#68736B',
    fontWeight: '600',
    textTransform: 'uppercase',
  },

  tokenNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#202720',
    marginTop: 2,
    fontFamily: 'monospace',
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  divider: {
    height: 1,
    backgroundColor: '#E8EDE9',
    marginVertical: 12,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },

  infoLabel: {
    fontSize: 12,
    color: '#68736B',
  },

  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#202720',
    textAlign: 'right',
    flexShrink: 1,
    marginLeft: 12,
  },

  cancelButton: {
    borderWidth: 1.5,
    borderColor: '#1F6B45',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginTop: 12,
  },

  cancelButtonPressed: {
    backgroundColor: '#FDF2F2',
    borderColor: '#C0392B',
  },

  cancelButtonText: {
    color: '#C0392B',
    fontSize: 13,
    fontWeight: '700',
  },

  disabledButton: {
    opacity: 0.6,
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8EDE9',
  },

  emptyIcon: {
    fontSize: 36,
    marginBottom: 8,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#202720',
    marginBottom: 4,
  },

  emptyText: {
    fontSize: 13,
    color: '#68736B',
    textAlign: 'center',
  },

  emptyHint: {
    fontSize: 12,
    color: '#8A938D',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 17,
  },

  bookSlotButton: {
    backgroundColor: '#1F6B45',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 10,
    marginTop: 14,
  },

  bookSlotButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },

  refreshHintCard: {
    flexDirection: 'row',
    backgroundColor: '#E5F1EA',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 16,
  },

  refreshHintIcon: {
    fontSize: 20,
    marginRight: 10,
  },

  refreshHintContent: {
    flex: 1,
  },

  refreshHintTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F6B45',
  },

  refreshHintText: {
    fontSize: 11,
    color: '#2D5B41',
    marginTop: 2,
    lineHeight: 15,
  },

  footer: {
    fontSize: 11,
    color: '#8A938D',
    textAlign: 'center',
    marginTop: 4,
  },
});