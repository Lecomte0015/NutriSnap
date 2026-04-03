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
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../src/constants/colors';
import { MascotAnimated } from '../src/components';
import { useStore } from '../src/store/useStore';
import i18n from '../src/i18n';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const COACH_RESPONSES = [
  {
    keywords: ['bonjour', 'salut', 'hello', 'coucou'],
    response: "Salut champion ! Je suis ton coach nutrition. Comment puis-je t'aider aujourd'hui ?",
  },
  {
    keywords: ['maigrir', 'perdre', 'poids', 'mincir'],
    response: "Pour perdre du poids efficacement, je te conseille :\n\n1. Privilegie les legumes a chaque repas\n2. Bois au moins 2L d'eau par jour\n3. Fais 30min d'activite physique quotidienne\n4. Dors 7-8h par nuit\n\nScanne tes repas pour que je puisse t'aider a suivre ta progression !",
  },
  {
    keywords: ['proteine', 'muscle', 'musculation', 'prendre'],
    response: "Pour prendre du muscle, voici mes conseils :\n\n1. Mange 1.6-2g de proteines par kg de poids\n2. Consomme assez de glucides complexes\n3. Entraine-toi regulierement\n4. Recupere bien entre les seances\n\nScanne tes repas pour verifier tes apports en proteines !",
  },
  {
    keywords: ['snack', 'grignoter', 'faim', 'envie'],
    response: "Une petite faim ? Voici des snacks sains :\n\n- Pomme + beurre de cacahuete\n- Une poignee d'amandes\n- Yaourt grec + fruits\n- Batonnets de legumes + houmous\n\nCes options te caleront sans exploser tes calories !",
  },
  {
    keywords: ['calorie', 'combien', 'manger'],
    response: "Le nombre de calories depend de ton objectif !\n\nTon profil indique un objectif de calories quotidien. Pour le respecter :\n\n1. Scanne chaque repas\n2. Verifie ton total sur le tableau de bord\n3. Ajuste tes portions si necessaire\n\nN'oublie pas : la qualite compte autant que la quantite !",
  },
  {
    keywords: ['merci', 'super', 'genial', 'top'],
    response: "Avec plaisir ! C'est un honneur de t'accompagner dans ton parcours. N'hesite pas si tu as d'autres questions !",
  },
];

const DEFAULT_RESPONSE = "Je comprends ta question ! Pour te donner les meilleurs conseils, scanne tes repas et je pourrai analyser ton alimentation en detail. Sinon, pose-moi une question sur la nutrition, les calories, ou les exercices !";

export default function CoachScreen() {
  const router = useRouter();
  const { profile, isPremium } = useStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Salut ${profile?.first_name || 'champion'} !\n\nJe suis ton coach nutrition personnel. Pose-moi n'importe quelle question sur :\n\n- Comment atteindre tes objectifs\n- Les meilleurs aliments a consommer\n- Des conseils personnalises\n\nJe suis la pour t'aider !`,
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const t = i18n.t.bind(i18n);

  const getCoachResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    for (const item of COACH_RESPONSES) {
      if (item.keywords.some(keyword => lowerMessage.includes(keyword))) {
        return item.response;
      }
    }
    
    return DEFAULT_RESPONSE;
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const response = getCoachResponse(userMessage.text);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  if (!isPremium) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Coach IA</Text>
          <View style={{ width: 40 }} />
        </View>
        
        <View style={styles.premiumLock}>
          <MascotAnimated mood="sad" size={150} />
          <Text style={styles.lockTitle}>Fonctionnalite Premium</Text>
          <Text style={styles.lockText}>
            Debloque ton coach nutrition personnel avec l'abonnement Premium !
          </Text>
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => router.push('/paywall-new')}
          >
            <Text style={styles.upgradeButtonText}>Passer a Premium</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Coach IA</Text>
        <View style={styles.coachAvatar}>
          <MascotAnimated mood={isTyping ? 'thinking' : 'happy'} size={40} />
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.isUser ? styles.userBubble : styles.botBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  message.isUser ? styles.userText : styles.botText,
                ]}
              >
                {message.text}
              </Text>
            </View>
          ))}

          {isTyping && (
            <View style={[styles.messageBubble, styles.botBubble, styles.typingBubble]}>
              <ActivityIndicator size="small" color={COLORS.secondary} />
              <Text style={styles.typingText}>En train d'ecrire...</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Pose ta question..."
            placeholderTextColor={COLORS.textLight}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isTyping}
          >
            <Ionicons
              name="send"
              size={20}
              color={inputText.trim() ? COLORS.textWhite : COLORS.textLight}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  coachAvatar: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.secondary,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.cardBackground,
    ...SHADOWS.small,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: COLORS.textWhite,
  },
  botText: {
    color: COLORS.textPrimary,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    marginLeft: SPACING.sm,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.cardBackground,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 15,
    color: COLORS.textPrimary,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  premiumLock: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  lockTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
  },
  lockText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 24,
  },
  upgradeButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.round,
    marginTop: SPACING.xl,
  },
  upgradeButtonText: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
