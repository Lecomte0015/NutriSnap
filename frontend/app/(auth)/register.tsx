import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { SPACING, BORDER_RADIUS } from '../../src/constants/colors';
import { useColors } from '../../src/hooks/useColors';
import { supabase } from '../../src/lib/supabase';
import { GoogleLogo } from '../../src/components';
import { useTranslation } from '../../src/hooks/useTranslation';

WebBrowser.maybeCompleteAuthSession();

export default function RegisterScreen() {
  const router = useRouter();
  const COLORS = useColors();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const t = useTranslation();

  const redirectTo = makeRedirectUri({ scheme: 'nutrisnap', path: '/' });

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setError('');
    setOauthLoading(provider);
    try {
      if (Platform.OS === 'web') {
        const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
            skipBrowserRedirect: true,
          },
        });
        console.log('[OAuth] URL générée:', data?.url);
        console.log('[OAuth] Erreur:', oauthError);
        if (oauthError || !data?.url) { setError(t('errors.generic')); return; }
        window.location.href = data.url;
        return;
      }

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo, skipBrowserRedirect: true },
      });

      if (oauthError || !data?.url) {
        setError(t('errors.generic'));
        return;
      }

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

      if (result.type === 'success' && result.url) {
        const code = new URL(result.url).searchParams.get('code');
        if (code) await supabase.auth.exchangeCodeForSession(result.url);
      }
    } catch {
      setError(t('errors.generic'));
    } finally {
      setOauthLoading(null);
    }
  };

  const handleRegister = async () => {
    setError('');
    if (!email || !password || !confirmPassword) {
      setError(t('auth.fillAllFields'));
      return;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signUpError) {
        setError(signUpError.message || t('auth.registerError'));
      } else if (data.session) {
        router.replace('/onboarding');
      } else if (data.user) {
        setError('Vérifiez votre email et cliquez sur le lien de confirmation pour continuer.');
      }
    } catch {
      setError(t('errors.generic'));
    } finally {
      setLoading(false);
    }
  };

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
          {/* Back button */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <LinearGradient
              colors={[COLORS.secondary, COLORS.secondary + 'BB']}
              style={styles.logoCircle}
            >
              <Text style={styles.logoEmoji}>✨</Text>
            </LinearGradient>
            <Text style={[styles.title, { color: COLORS.textPrimary }]}>{t('auth.register')}</Text>
          </View>

          {/* OAuth buttons */}
          <View style={styles.oauthGroup}>
            <TouchableOpacity
              style={styles.googleBtn}
              onPress={() => handleOAuth('google')}
              disabled={!!oauthLoading || loading}
              activeOpacity={0.85}
            >
              {oauthLoading === 'google' ? (
                <ActivityIndicator size="small" color="#3c4043" />
              ) : (
                <GoogleLogo size={20} />
              )}
              <Text style={styles.googleBtnText}>{t('auth.google')}</Text>
            </TouchableOpacity>

            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={[styles.appleBtn, { backgroundColor: COLORS.cardBackground, borderColor: COLORS.border }]}
                onPress={() => handleOAuth('apple')}
                disabled={!!oauthLoading || loading}
                activeOpacity={0.85}
              >
                {oauthLoading === 'apple' ? (
                  <ActivityIndicator size="small" color={COLORS.textPrimary} />
                ) : (
                  <Ionicons name="logo-apple" size={20} color={COLORS.textPrimary} />
                )}
                <Text style={[styles.appleBtnText, { color: COLORS.textPrimary }]}>{t('auth.apple')}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: COLORS.border }]} />
            <Text style={[styles.dividerText, { color: COLORS.textSecondary }]}>{t('auth.orContinueWith')}</Text>
            <View style={[styles.dividerLine, { backgroundColor: COLORS.border }]} />
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Error message */}
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
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: COLORS.cardBackground, borderColor: COLORS.border }]}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: COLORS.textPrimary }]}
                placeholder={t('auth.password')}
                placeholderTextColor={COLORS.textLight}
                value={password}
                onChangeText={(v) => { setPassword(v); setError(''); }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <View style={[styles.inputContainer, { backgroundColor: COLORS.cardBackground, borderColor: COLORS.border }]}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: COLORS.textPrimary }]}
                placeholder={t('auth.confirmPassword')}
                placeholderTextColor={COLORS.textLight}
                value={confirmPassword}
                onChangeText={(v) => { setConfirmPassword(v); setError(''); }}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                <Ionicons
                  name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* Register button */}
            <TouchableOpacity
              onPress={handleRegister}
              disabled={loading || !!oauthLoading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[COLORS.secondary, COLORS.secondary + 'CC']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.registerButton}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.registerButtonText}>{t('auth.register')}</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: COLORS.textSecondary }]}>{t('auth.hasAccount')} </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={[styles.footerLink, { color: COLORS.secondary }]}>{t('auth.login')}</Text>
              </TouchableOpacity>
            </Link>
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
      web: { boxShadow: '0px 4px 10px rgba(0,0,0,0.15)' } as any,
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 6,
      },
    }),
  },
  logoEmoji: {
    fontSize: 34,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  oauthGroup: {
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#dadce0',
    backgroundColor: '#ffffff',
    gap: SPACING.xs,
    ...Platform.select({
      web: { boxShadow: '0px 1px 3px rgba(0,0,0,0.12)' } as any,
      default: {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 3,
        elevation: 2,
      },
    }),
  },
  googleBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3c4043',
  },
  appleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    gap: SPACING.xs,
  },
  appleBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: SPACING.md,
    fontSize: 13,
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
  eyeIcon: {
    padding: SPACING.xs,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  registerButtonText: {
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
});
