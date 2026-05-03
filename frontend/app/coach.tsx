import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../src/constants/colors';
import { useColors } from '../src/hooks/useColors';
import { MascotAnimated } from '../src/components';
import { useStore } from '../src/store/useStore';
import { useTranslation } from '../src/hooks/useTranslation';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function CoachScreen() {
  const router = useRouter();
  const COLORS = useColors();
  const { profile, user, isPremium } = useStore();
  const t = useTranslation();

  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: '1',
      text: t('coach.greeting', { name: profile?.first_name || t('coach.champion') }),
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const historyRef = useRef<Array<{ role: string; content: string }>>([]);

  const sendMessage = async () => {
    if (!inputText.trim() || isTyping) return;

    const userText = inputText.trim();
    setInputText('');

    const userMessage: Message = {
      id: Date.now().toString(),
      text: userText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    historyRef.current.push({ role: 'user', content: userText });

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/coach/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user?.id, message: userText, history: historyRef.current.slice(-10) }),
      });

      if (response.ok) {
        const data = await response.json();
        const botText = data.response;
        historyRef.current.push({ role: 'assistant', content: botText });
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: botText, isUser: false, timestamp: new Date() }]);
      } else {
        throw new Error('API error');
      }
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: t('coach.errorMsg'),
        isUser: false,
        timestamp: new Date(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  if (!isPremium) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
        <View style={[styles.header, { borderBottomColor: COLORS.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: COLORS.textPrimary }]}>{t('profile.aiCoach')}</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.premiumLock}>
          <MascotAnimated mood="sad" size={150} />
          <Text style={[styles.lockTitle, { color: COLORS.textPrimary }]}>{t('coach.premiumFeature')}</Text>
          <Text style={[styles.lockText, { color: COLORS.textSecondary }]}>
            {t('coach.premiumDesc')}
          </Text>
          <TouchableOpacity style={[styles.upgradeButton, { backgroundColor: COLORS.secondary }]} onPress={() => router.push('/paywall-new')}>
            <Text style={styles.upgradeButtonText}>{t('coach.upgradeToPremium')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <View style={[styles.header, { borderBottomColor: COLORS.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: COLORS.textPrimary }]}>{t('profile.aiCoach')}</Text>
        <View style={styles.coachAvatar}>
          <MascotAnimated mood={isTyping ? 'thinking' : 'happy'} size={40} />
        </View>
      </View>

      <KeyboardAvoidingView style={styles.chatContainer} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={100}>
        <ScrollView ref={scrollViewRef} style={styles.messagesContainer} contentContainerStyle={styles.messagesContent} showsVerticalScrollIndicator={false}>
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.isUser
                  ? { backgroundColor: COLORS.secondary, alignSelf: 'flex-end' }
                  : { backgroundColor: COLORS.cardBackground, alignSelf: 'flex-start', ...SHADOWS.small },
              ]}
            >
              <Text style={[styles.messageText, { color: message.isUser ? '#FFFFFF' : COLORS.textPrimary }]}>
                {message.text}
              </Text>
            </View>
          ))}

          {isTyping && (
            <View style={[styles.messageBubble, { backgroundColor: COLORS.cardBackground, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center' }]}>
              <ActivityIndicator size="small" color={COLORS.secondary} />
              <Text style={[styles.typingText, { color: COLORS.textSecondary }]}>{t('coach.typing')}</Text>
            </View>
          )}
        </ScrollView>

        <View style={[styles.inputContainer, { borderTopColor: COLORS.border, backgroundColor: COLORS.cardBackground }]}>
          <TextInput
            style={[styles.input, { backgroundColor: COLORS.background, color: COLORS.textPrimary }]}
            value={inputText}
            onChangeText={setInputText}
            placeholder={t('coach.placeholder')}
            placeholderTextColor={COLORS.textLight}
            multiline
            maxLength={500}
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: (!inputText.trim() || isTyping) ? COLORS.border : COLORS.secondary }]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isTyping}
          >
            {isTyping ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="send" size={20} color={inputText.trim() ? '#FFFFFF' : COLORS.textLight} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: 'bold' },
  coachAvatar: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  chatContainer: { flex: 1 },
  messagesContainer: { flex: 1 },
  messagesContent: { padding: SPACING.md, paddingBottom: SPACING.xl },
  messageBubble: { maxWidth: '80%', padding: SPACING.md, borderRadius: BORDER_RADIUS.lg, marginBottom: SPACING.sm },
  messageText: { fontSize: 15, lineHeight: 22 },
  typingText: { marginLeft: SPACING.sm, fontSize: 14 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
  },
  input: { flex: 1, borderRadius: BORDER_RADIUS.lg, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, fontSize: 15, maxHeight: 100 },
  sendButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginLeft: SPACING.sm },
  premiumLock: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  lockTitle: { fontSize: 22, fontWeight: 'bold', marginTop: SPACING.lg },
  lockText: { fontSize: 16, textAlign: 'center', marginTop: SPACING.sm, lineHeight: 24 },
  upgradeButton: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.round, marginTop: SPACING.xl },
  upgradeButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
