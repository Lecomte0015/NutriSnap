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
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../src/constants/colors';
import { supabase } from '../../src/lib/supabase';
import { Button, Mascot } from '../../src/components';
import i18n from '../../src/i18n';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const t = i18n.t.bind(i18n);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert(t('common.error'), 'Veuillez entrer votre email');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert(t('common.error'), 'Veuillez entrer un email valide');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: 'nutrisnap://reset-password',
        }
      );

      if (error) {
        Alert.alert(t('common.error'), 'Erreur lors de l\'envoi de l\'email');
        console.error('Reset password error:', error);
      } else {
        setEmailSent(true);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      Alert.alert(t('common.error'), t('errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={styles.successContainer}>
          <Mascot mood="happy" size={150} />
          <Text style={styles.successTitle}>Email envoyé !</Text>
          <Text style={styles.successText}>
            Nous avons envoyé un lien de réinitialisation à{'\n'}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>
          <Text style={styles.successSubtext}>
            Vérifiez votre boîte de réception et vos spams.
          </Text>
          <Button
            title="Retour à la connexion"
            onPress={() => router.replace('/(auth)/login')}
            style={styles.backToLoginButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Mascot mood="thinking" size={140} />
            <Text style={styles.title}>Mot de passe oublié ?</Text>
            <Text style={styles.subtitle}>
              Pas de souci ! Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Votre email"
                placeholderTextColor={COLORS.textLight}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
              />
            </View>

            <Button
              title="Envoyer le lien"
              onPress={handleResetPassword}
              loading={loading}
              style={styles.resetButton}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Vous vous souvenez ? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.footerLink}>{t('auth.login')}</Text>
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
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SPACING.md,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
    ...SHADOWS.small,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  resetButton: {
    marginTop: SPACING.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xl,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  footerLink: {
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
  // Success state styles
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginTop: SPACING.lg,
  },
  successText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginTop: SPACING.md,
    lineHeight: 24,
  },
  emailHighlight: {
    fontWeight: '600',
    color: COLORS.secondary,
  },
  successSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  backToLoginButton: {
    marginTop: SPACING.xl,
    width: '100%',
  },
});
