import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../src/constants/colors';
import { useColors } from '../src/hooks/useColors';
import { Button, Card, Mascot } from '../src/components';
import { useStore } from '../src/store/useStore';
import { useTranslation } from '../src/hooks/useTranslation';

type Plan = 'monthly' | 'yearly';

export default function PaywallScreen() {
  const router = useRouter();
  const COLORS = useColors();
  const { user, subscription, setSubscription, setIsPremium } = useStore();
  const [selectedPlan, setSelectedPlan] = useState<Plan>('yearly');
  const [loading, setLoading] = useState(false);
  const t = useTranslation();

  const plans = {
    monthly: {
      price: '€9.99',
      period: t('subscription.perMonth'),
      savings: null,
    },
    yearly: {
      price: '€59.99',
      period: t('subscription.perYear'),
      savings: '50%',
    },
  };

  const handleSubscribe = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // In production, this would call RevenueCat
      // For now, we'll simulate a subscription
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/subscriptions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            plan: selectedPlan,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
        setIsPremium(true);
        Alert.alert(
          t('common.success'),
          t('subscription.successMsg'),
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert(t('common.error'), t('errors.generic'));
      }
    } catch (error) {
      console.error('Subscription error:', error);
      Alert.alert(t('common.error'), t('errors.network'));
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    Alert.alert(t('subscription.restore'), t('subscription.restoreNote'), [{ text: 'OK' }]);
  };

  const isCurrentlyTrial = subscription?.status === 'trial';
  const trialDaysLeft = subscription?.trial_end_date
    ? Math.max(0, Math.ceil((new Date(subscription.trial_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 7;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      {/* Close button */}
      <TouchableOpacity style={[styles.closeButton, { backgroundColor: COLORS.cardBackground }]} onPress={() => router.back()}>
        <Ionicons name="close" size={28} color={COLORS.textPrimary} />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Mascot mood="excited" size={100} />
          <Text style={[styles.title, { color: COLORS.textPrimary }]}>{t('subscription.title')}</Text>
          {isCurrentlyTrial && (
            <View style={[styles.trialBadge, { backgroundColor: COLORS.secondary }]}>
              <Ionicons name="time-outline" size={16} color="#FFFFFF" />
              <Text style={styles.trialText}>
                {t('subscription.trialDaysLeft', { count: trialDaysLeft })}
              </Text>
            </View>
          )}
        </View>

        {/* Features comparison */}
        <Card style={styles.featuresCard}>
          <View style={styles.featureRow}>
            <Text style={[styles.featureLabel, { color: COLORS.textPrimary }]}>{t('subscription.analysesPerDay')}</Text>
            <View style={styles.featureComparison}>
              <View style={styles.freeColumn}>
                <Text style={[styles.columnHeader, { color: COLORS.textSecondary }]}>{t('subscription.free')}</Text>
                <Text style={[styles.featureValueFree, { color: COLORS.textPrimary }]}>3</Text>
              </View>
              <View style={styles.premiumColumn}>
                <Text style={[styles.columnHeaderPremium, { color: COLORS.secondary }]}>Premium</Text>
                <Text style={[styles.featureValuePremium, { color: COLORS.secondary }]}>{t('subscription.unlimited')}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.featureDivider, { backgroundColor: COLORS.border }]} />

          {[
            { label: t('subscription.featureTracking'), free: false, premium: true },
            { label: t('subscription.featureCoaching'), free: false, premium: true },
            { label: t('subscription.featureHistory'), free: false, premium: true },
            { label: t('subscription.featureNoAds'), free: false, premium: true },
          ].map((feature, index) => (
            <View key={index}>
              <View style={styles.featureRowSimple}>
                <Text style={[styles.featureLabel, { color: COLORS.textPrimary }]}>{feature.label}</Text>
                <View style={styles.featureIcons}>
                  <Ionicons
                    name={feature.free ? 'checkmark-circle' : 'close-circle'}
                    size={24}
                    color={feature.free ? COLORS.success : COLORS.error}
                  />
                  <Ionicons
                    name={feature.premium ? 'checkmark-circle' : 'close-circle'}
                    size={24}
                    color={feature.premium ? COLORS.success : COLORS.error}
                    style={styles.premiumIcon}
                  />
                </View>
              </View>
              {index < 3 && <View style={[styles.featureDivider, { backgroundColor: COLORS.border }]} />}
            </View>
          ))}
        </Card>

        {/* Plan selection */}
        <Text style={[styles.selectPlanTitle, { color: COLORS.textPrimary }]}>{t('subscription.choosePlan')}</Text>

        <TouchableOpacity
          style={[
            styles.planCard,
            { backgroundColor: COLORS.cardBackground },
            selectedPlan === 'yearly' && { borderColor: COLORS.secondary },
          ]}
          onPress={() => setSelectedPlan('yearly')}
        >
          {plans.yearly.savings && (
            <View style={[styles.savingsBadge, { backgroundColor: COLORS.success }]}>
              <Text style={styles.savingsText}>Économisez {plans.yearly.savings}</Text>
            </View>
          )}
          <View style={styles.planContent}>
            <View style={styles.planRadio}>
              <View style={[
                styles.radioOuter,
                { borderColor: COLORS.border },
                selectedPlan === 'yearly' && { borderColor: COLORS.secondary },
              ]}>
                {selectedPlan === 'yearly' && <View style={[styles.radioInner, { backgroundColor: COLORS.secondary }]} />}
              </View>
            </View>
            <View style={styles.planInfo}>
              <Text style={[styles.planName, { color: COLORS.textPrimary }]}>{t('subscription.yearly')}</Text>
              <Text style={[styles.planPrice, { color: COLORS.secondary }]}>
                {plans.yearly.price}
                <Text style={[styles.planPeriod, { color: COLORS.textSecondary }]}>{plans.yearly.period}</Text>
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.planCard,
            { backgroundColor: COLORS.cardBackground },
            selectedPlan === 'monthly' && { borderColor: COLORS.secondary },
          ]}
          onPress={() => setSelectedPlan('monthly')}
        >
          <View style={styles.planContent}>
            <View style={styles.planRadio}>
              <View style={[
                styles.radioOuter,
                { borderColor: COLORS.border },
                selectedPlan === 'monthly' && { borderColor: COLORS.secondary },
              ]}>
                {selectedPlan === 'monthly' && <View style={[styles.radioInner, { backgroundColor: COLORS.secondary }]} />}
              </View>
            </View>
            <View style={styles.planInfo}>
              <Text style={[styles.planName, { color: COLORS.textPrimary }]}>{t('subscription.monthly')}</Text>
              <Text style={[styles.planPrice, { color: COLORS.secondary }]}>
                {plans.monthly.price}
                <Text style={[styles.planPeriod, { color: COLORS.textSecondary }]}>{plans.monthly.period}</Text>
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Subscribe button */}
        <Button
          title={isCurrentlyTrial ? t('subscription.subscribe') : t('subscription.startTrial')}
          onPress={handleSubscribe}
          loading={loading}
          style={styles.subscribeButton}
        />

        {/* Restore purchases */}
        <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
          <Text style={[styles.restoreText, { color: COLORS.secondary }]}>{t('subscription.restore')}</Text>
        </TouchableOpacity>

        {/* Legal links */}
        <View style={styles.legalLinks}>
          <TouchableOpacity>
            <Text style={[styles.legalText, { color: COLORS.textLight }]}>{t('subscription.terms')}</Text>
          </TouchableOpacity>
          <Text style={[styles.legalDivider, { color: COLORS.textLight }]}>|</Text>
          <TouchableOpacity>
            <Text style={[styles.legalText, { color: COLORS.textLight }]}>{t('subscription.privacy')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: SPACING.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    ...SHADOWS.small,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: SPACING.md,
  },
  trialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
    marginTop: SPACING.sm,
  },
  trialText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: SPACING.xs,
  },
  featuresCard: {
    marginBottom: SPACING.lg,
  },
  featureRow: {
    marginBottom: SPACING.sm,
  },
  featureRowSimple: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  featureLabel: {
    fontSize: 15,
  },
  featureComparison: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
  },
  freeColumn: {
    flex: 1,
    alignItems: 'center',
  },
  premiumColumn: {
    flex: 1,
    alignItems: 'center',
  },
  columnHeader: {
    fontSize: 12,
    marginBottom: SPACING.xs,
  },
  columnHeaderPremium: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  featureValueFree: {
    fontSize: 18,
    fontWeight: '600',
  },
  featureValuePremium: {
    fontSize: 18,
    fontWeight: '600',
  },
  featureIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumIcon: {
    marginLeft: SPACING.xl,
  },
  featureDivider: {
    height: 1,
  },
  selectPlanTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  planCard: {
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    ...SHADOWS.small,
  },
  savingsBadge: {
    position: 'absolute',
    top: -10,
    right: SPACING.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  savingsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  planContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planRadio: {
    marginRight: SPACING.md,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 16,
    fontWeight: '600',
  },
  planPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  planPeriod: {
    fontSize: 14,
    fontWeight: '400',
  },
  subscribeButton: {
    marginTop: SPACING.lg,
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  restoreText: {
    fontSize: 14,
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  legalText: {
    fontSize: 12,
  },
  legalDivider: {
    marginHorizontal: SPACING.sm,
  },
});
