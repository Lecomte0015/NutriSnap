import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../src/constants/colors';
import { Button, MascotAnimated, ScanOverlay } from '../src/components';
import { useStore } from '../src/store/useStore';
import { useMascotController } from '../src/hooks/useMascotController';
import i18n from '../src/i18n';

export default function CameraScreen() {
  const router = useRouter();
  const { user, profile, isPremium, analysisCountToday, incrementAnalysisCount } = useStore();
  const { setThinking, resetToIdle } = useMascotController();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const t = i18n.t.bind(i18n);

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      // Haptic feedback when taking photo
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
      });

      if (photo?.base64) {
        setCapturedImage(photo.base64);
        // Success haptic
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert(t('common.error'), t('errors.generic'));
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets[0]?.base64) {
        setCapturedImage(result.assets[0].base64);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(t('common.error'), t('errors.generic'));
    }
  };

  const analyzeImage = async () => {
    if (!capturedImage || !user) return;

    // Check analysis limit for free users
    if (!isPremium && analysisCountToday >= 3) {
      Alert.alert(
        t('errors.analysisLimit'),
        '',
        [
          { text: t('common.cancel'), style: 'cancel' },
          { 
            text: t('subscription.subscribe'),
            onPress: () => router.push('/paywall')
          },
        ]
      );
      return;
    }

    setAnalyzing(true);
    setThinking(); // Utilise le hook pour activer le mode thinking

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/analyze-meal`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            image_base64: capturedImage,
            language: profile?.language || 'fr',
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        incrementAnalysisCount();
        
        // Navigate to result with analysis data
        router.push({
          pathname: '/result',
          params: {
            analysis: JSON.stringify(data.analysis),
            image: capturedImage,
          },
        });
      } else if (response.status === 429) {
        Alert.alert(
          t('errors.analysisLimit'),
          '',
          [
            { text: t('common.cancel'), style: 'cancel' },
            { 
              text: t('subscription.subscribe'),
              onPress: () => router.push('/paywall')
            },
          ]
        );
      } else {
        const error = await response.json();
        Alert.alert(t('common.error'), error.detail || t('errors.generic'));
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      Alert.alert(t('common.error'), t('errors.network'));
    } finally {
      setAnalyzing(false);
      resetToIdle(); // Réinitialise la mascotte
    }
  };

  const retakePicture = () => {
    setCapturedImage(null);
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <ActivityIndicator size="large" color={COLORS.secondary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <MascotAnimated mood="sad" size={120} />
          <Text style={styles.permissionTitle}>{t('camera.permissionRequired')}</Text>
          <Text style={styles.permissionText}>{t('camera.permissionMessage')}</Text>
          <Button
            title={t('camera.grantPermission')}
            onPress={requestPermission}
            style={styles.permissionButton}
          />
          <Button
            title={t('common.back')}
            onPress={() => router.back()}
            variant="outline"
            style={styles.backButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (capturedImage) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Close button */}
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <Ionicons name="close" size={28} color={COLORS.textWhite} />
        </TouchableOpacity>

        <View style={styles.previewContainer}>
          <Image
            source={{ uri: `data:image/jpeg;base64,${capturedImage}` }}
            style={styles.previewImage}
            resizeMode="contain"
          />

          {analyzing && (
            <View style={styles.analyzingOverlay}>
              <MascotAnimated mood="thinking" size={120} />
              <Text style={styles.analyzingText}>{t('camera.analyzing')}</Text>
              <ActivityIndicator size="large" color={COLORS.secondary} style={styles.loader} />
            </View>
          )}
        </View>

        <View style={styles.previewActions}>
          <Button
            title={t('analysis.retake')}
            onPress={retakePicture}
            variant="outline"
            style={styles.actionButton}
            disabled={analyzing}
          />
          <Button
            title={t('common.continue')}
            onPress={analyzeImage}
            style={styles.actionButton}
            loading={analyzing}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Close button */}
      <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
        <Ionicons name="close" size={28} color={COLORS.textWhite} />
      </TouchableOpacity>

      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
      >
        {/* Scan Overlay with animated guides */}
        <ScanOverlay isScanning={false} />
        <View style={styles.cameraOverlay}>
          <Text style={styles.guideText}>Placez votre repas dans le cadre</Text>
        </View>
      </CameraView>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
          <Ionicons name="images" size={28} color={COLORS.textWhite} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
          <View style={styles.captureInner} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.flipButton}
          onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
        >
          <Ionicons name="camera-reverse" size={28} color={COLORS.textWhite} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    left: SPACING.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frameGuide: {
    width: 280,
    height: 280,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: COLORS.textWhite,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 12,
  },
  guideText: {
    color: COLORS.textWhite,
    fontSize: 14,
    marginTop: SPACING.lg,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingBottom: 40,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  galleryButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.textWhite,
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.textWhite,
  },
  flipButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  analyzingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyzingText: {
    color: COLORS.textWhite,
    fontSize: 18,
    fontWeight: '500',
    marginTop: SPACING.md,
  },
  loader: {
    marginTop: SPACING.md,
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(0,0,0,0.8)',
    gap: SPACING.md,
  },
  actionButton: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.background,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  permissionButton: {
    marginTop: SPACING.xl,
    width: '100%',
  },
  backButton: {
    marginTop: SPACING.md,
    width: '100%',
  },
});
