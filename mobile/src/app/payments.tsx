import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';

import { api } from '../lib/api';
import { getStoredToken, getStoredUser } from '../lib/auth';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface Payment {
  id: number;
  procurement_id?: number;
  amount?: number | string;
  status?: string;
  transaction_ref?: string | null;
  paid_at?: string | null;
}

export default function PaymentsScreen() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadPayments() {
    try {
      setError('');

      const token = await getStoredToken();
      const user = await getStoredUser();

      if (!token || !user?.id) {
        router.replace('/');
        return;
      }

      const farmerResponse =
        await api.get<ApiResponse<{ id: number }>>(
          `/farmers/user/${user.id}`,
          token,
        );

      const response =
        await api.get<ApiResponse<Payment[]>>(
          `/payments/farmer/${farmerResponse.data.id}`,
          token,
        );

      setPayments(response.data || []);
    } catch (err) {
      console.error('Payment loading error:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load payment information.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPayments();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Loading payment information...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
    >
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <View>
          <Text style={styles.title}>
            Payments
          </Text>

          <Text style={styles.subtitle}>
            Track your procurement payments.
          </Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoIcon}>💰</Text>

        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>
            Payment records
          </Text>

          <Text style={styles.infoText}>
            Payment information is requested from the
            MandiMitra backend.
          </Text>
        </View>
      </View>

      {error ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Payment information unavailable
          </Text>

          <Text style={styles.muted}>
            {error}
          </Text>

          <Pressable
            style={styles.button}
            onPress={loadPayments}
          >
            <Text style={styles.buttonText}>
              Try Again
            </Text>
          </Pressable>
        </View>
      ) : payments.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.emptyIcon}>💳</Text>

          <Text style={styles.emptyTitle}>
            No payment records
          </Text>

          <Text style={styles.muted}>
            Your payment information will appear here
            after procurement is completed and a payment
            record exists.
          </Text>
        </View>
      ) : (
        payments.map((payment) => (
          <View
            key={payment.id}
            style={styles.paymentCard}
          >
            <View style={styles.paymentTop}>
              <View>
                <Text style={styles.paymentLabel}>
                  Payment #{payment.id}
                </Text>

                <Text style={styles.amount}>
                  ₹{payment.amount ?? '—'}
                </Text>
              </View>

              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                  {payment.status || 'UNKNOWN'}
                </Text>
              </View>
            </View>

            {payment.procurement_id !== undefined && (
              <Text style={styles.detail}>
                Procurement ID: {payment.procurement_id}
              </Text>
            )}

            {payment.transaction_ref && (
              <Text style={styles.detail}>
                Transaction: {payment.transaction_ref}
              </Text>
            )}

            {payment.paid_at && (
              <Text style={styles.detail}>
                Paid: {new Date(
                  payment.paid_at,
                ).toLocaleString('en-IN')}
              </Text>
            )}
          </View>
        ))
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
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
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
    color: '#1F6B45',
  },

  title: {
    fontSize: 27,
    fontWeight: '700',
  },

  subtitle: {
    color: '#68736B',
    marginTop: 4,
    fontSize: 13,
  },

  infoCard: {
    backgroundColor: '#E5F1EA',
    borderRadius: 18,
    padding: 17,
    flexDirection: 'row',
    marginBottom: 18,
  },

  infoIcon: {
    fontSize: 29,
    marginRight: 13,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    color: '#1F6B45',
    fontWeight: '700',
    fontSize: 15,
  },

  infoText: {
    color: '#52645A',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 23,
    alignItems: 'center',
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },

  emptyIcon: {
    fontSize: 43,
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: '700',
  },

  muted: {
    color: '#68736B',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 8,
  },

  button: {
    backgroundColor: '#1F6B45',
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 10,
    marginTop: 15,
  },

  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
  },

  paymentTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  paymentLabel: {
    color: '#68736B',
    fontSize: 12,
  },

  amount: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 3,
  },

  statusBadge: {
    backgroundColor: '#E5F1EA',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  statusText: {
    color: '#1F6B45',
    fontSize: 11,
    fontWeight: '700',
  },

  detail: {
    color: '#68736B',
    fontSize: 12,
    marginTop: 8,
  },
});
