import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SPACING, BORDER_RADIUS } from '../../src/constants/colors';
import { useColors } from '../../src/hooks/useColors';
import { supabase } from '../../src/lib/supabase';
import { useTranslation } from '../../src/hooks/useTranslation';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const COLORS = useColors();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');
  const t = useTranslation();

  const handleResetPassword = async () => {
    setError('');
    if (!email) {
      setError(t('auth.fillAllFields'));
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t('auth.invalidEmail'));
      return;
    }

    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        { redirectTo: 'nutrisnap://reset-password' }
      );

      if (resetError) {
        setError(t('errors.generic'));
      } else {
        setEmailSent(true);
      }
    } catch {
      setError(t('errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={styles.successContainer}>
          <LinearGradient
            colors={[COLORS.secondary, COLORS.secondary + 'BB']}
            style={styles.successIconCircle}
          >
            <Ionicons name="mail" size={40} color="#fff" />
          </LinearGradient>

          <Text style={[styles.successTitle, { color: COLORS.textPrimary }]}>
            {t('auth.emailSent')}
          </Text>
          <Text style={[styles.successText, { color: COLORS.textSecondary }]}>
            {t('auth.emailSentDesc')}
          </Text>
          <Text style={[styles.emailHighlight, { color: COLORS.secondary }]}>{email}</Text>
          <Text style={[styles.successSubtext, { color: COLORS.textSecondary }]}>
            {t('auth.checkSpam')}
          </Text>

          <TouchableOpacity onPress={() => router.replace('/(auth)/login')} activeOpacity={0.85}>
            <LinearGradient
              colors={[COLORS.secondary, COLORS.secondary + 'CC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitButton}
            >
              <Text style={styles.submitButtonText}>{t('auth.backToLogin')}</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <LinearGradient
              colors={[COLORS.secondary, COLORS.secondary + 'BB']}
              style={styles.logoCircle}
            >
              <Ionicons name="lock-open-outline" size={34} color="#fff" />
            </LinearGradient>
            <Text style={[styles.title, { color: COLORS.textPrimary }]}>
              {t('auth.forgotPassword')}
            </Text>
            <Text style={[styles.subtitle, { color: COLORS.textSecondary }]}>
              {t('auth.forgotPasswordDesc')}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {!!error && (
              <View style={[styles.errorBox, { backgroundColor: COLORS.error + '18', borderColor: COLORS.error + '40' }]}>
                <Ionicons name="alert-circle-outline" size={16} color={COLORS.error} />
                <Text style={[styles.errorText, { color: COLORS.error }]}>{error}</Text>
              </View>
            )}

            <View style={[styles.inputContainer, { backgroundColor: COLORS.cardBackground, borderColor: COLORS.border }]}>
              <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: COLORS.textPrimary }]}
                placeholder={t('auth.email')}
                placeholderTextColor={COLORS.textLight}
                value={email}
                onChangeText={(v) => { setEmail(v); setError(''); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
              />
            </View>

            <TouchableOpacity onPress={handleResetPassword} disabled={loading} activeOpacity={0.85}>
              <LinearGradient
                colors={[COLORS.secondary, COLORS.secondary + 'CC']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitButton}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.submitButtonText}>{t('auth.sendResetLink')}</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: COLORS.textSecondary }]}>
              {t('auth.rememberPassword')}{' '}
            </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={[styles.footerLink, { color: COLORS.secondary }]}>{t('auth.login')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xxl,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    ...Platform.select({
      web: { boxShadow: '0px 4px 10px rgba(0,0,0,0.15)' },
      default: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 6 },
    }),
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SPACING.md,
  },
  form: {
    gap: SPACING.sm,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 13,
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 16,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xl,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
  },
  // Success state
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
  },
  successIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    ...Platform.select({
      web: { boxShadow: '0px 4px 10px rgba(0,0,0,0.15)' },
      default: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 6 },
    }),
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  successText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  emailHighlight: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  successSubtext: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
});
