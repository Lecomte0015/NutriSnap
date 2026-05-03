import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Vibration,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../src/constants/colors';
import { useColors } from '../src/hooks/useColors';
import { Card, MascotAnimated } from '../src/components';
import { useTranslation } from '../src/hooks/useTranslation';
import { useStore } from '../src/store/useStore';

const OFF_BASE = 'https://world.openfoodfacts.org/api/v0/product';

function computeNutriScore(product: any): number {
  const cal = product.calories || 0;
  const sugar = product.sugar || 0;
  const fat = product.fat || 0;
  const protein = product.protein || 0;
  const fiber = product.fiber || 0;

  let score = 10;
  if (cal > 500) score -= 3;
  else if (cal > 300) score -= 1;
  if (sugar > 20) score -= 2;
  else if (sugar > 10) score -= 1;
  if (fat > 20) score -= 2;
  else if (fat > 10) score -= 1;
  if (protein > 10) score += 1;
  if (fiber > 3) score += 1;
  return Math.max(1, Math.min(10, score));
}

async function lookupBarcode(barcode: string): Promise<any | null> {
  try {
    const res = await fetch(`${OFF_BASE}/${barcode}.json`, {
      headers: { 'User-Agent': 'NutriSnap/1.0' },
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.status !== 1 || !json.product) return null;
    const p = json.product;
    const n = p.nutriments || {};
    const product = {
      name: p.product_name || p.product_name_fr || 'Produit inconnu',
      brand: p.brands || '',
      calories: Math.round(n['energy-kcal_100g'] || n['energy-kcal'] || 0),
      protein: parseFloat((n['proteins_100g'] || 0).toFixed(1)),
      carbs: parseFloat((n['carbohydrates_100g'] || 0).toFixed(1)),
      fat: parseFloat((n['fat_100g'] || 0).toFixed(1)),
      sugar: parseFloat((n['sugars_100g'] || 0).toFixed(1)),
      fiber: parseFloat((n['fiber_100g'] || 0).toFixed(1)),
      image: p.image_front_url || p.image_url || null,
      barcode,
    };
    product.score = computeNutriScore(product);
    return product;
  } catch {
    return null;
  }
}

export default function BarcodeScannerScreen() {
  const router = useRouter();
  const COLORS = useColors();
  const { hapticsEnabled } = useStore();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const t = useTranslation();

  const handleBarcodeScanned = async ({ type, data }: BarcodeScanningResult) => {
    if (scanned) return;
    setScanned(true);
    setLoading(true);
    if (hapticsEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (hapticsEnabled) Vibration.vibrate(100);

    const found = await lookupBarcode(data);
    setLoading(false);

    if (found) {
      setProduct(found);
    } else {
      Alert.alert(
        'Produit non trouvé',
        `Code-barres: ${data}\n\nCe produit n'est pas dans la base Open Food Facts.`,
        [{ text: 'Scanner à nouveau', onPress: () => setScanned(false) }]
      );
    }
  };

  const handleAddToMeal = () => {
    if (!product) return;

    // Navigate back with product data
    router.back();
    // In a real app, you would pass this data to the meal tracker
    Alert.alert(
      'Produit ajoute',
      `${product.name} a ete ajoute a votre repas.\n\nCalories: ${product.calories} kcal`
    );
  };

  const handleScanAgain = () => {
    setScanned(false);
    setProduct(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 7) return COLORS.success;
    if (score >= 4) return COLORS.warning;
    return COLORS.error;
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.permissionContainer, { backgroundColor: COLORS.background }]}>
          <MascotAnimated mood="sad" size={120} />
          <Text style={[styles.permissionTitle, { color: COLORS.textPrimary }]}>Acces camera requis</Text>
          <Text style={[styles.permissionText, { color: COLORS.textSecondary }]}>
            Pour scanner les codes-barres, nous avons besoin d'acceder a votre camera.
          </Text>
          <TouchableOpacity style={[styles.permissionButton, { backgroundColor: COLORS.secondary }]} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Autoriser la camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={[styles.backButtonText, { color: COLORS.textSecondary }]}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (product) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: COLORS.textPrimary }]}>Produit trouve</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={[styles.productContainer, { backgroundColor: COLORS.background }]}>
          <Card style={styles.productCard}>
            <View style={styles.productHeader}>
              <View style={styles.productInfo}>
                <Text style={[styles.productBrand, { color: COLORS.textSecondary }]}>{product.brand}</Text>
                <Text style={[styles.productName, { color: COLORS.textPrimary }]}>{product.name}</Text>
                <Text style={[styles.productBarcode, { color: COLORS.textLight }]}>Code: {product.barcode}</Text>
              </View>
              <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(product.score) }]}>
                <Text style={styles.scoreText}>{product.score}/10</Text>
              </View>
            </View>

            <View style={[styles.nutritionGrid, { borderTopColor: COLORS.border }]}>
              <View style={styles.nutritionItem}>
                <Text style={[styles.nutritionValue, { color: COLORS.textPrimary }]}>{product.calories}</Text>
                <Text style={[styles.nutritionLabel, { color: COLORS.textSecondary }]}>Calories</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={[styles.nutritionValue, { color: COLORS.textPrimary }]}>{product.protein}g</Text>
                <Text style={[styles.nutritionLabel, { color: COLORS.textSecondary }]}>Proteines</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={[styles.nutritionValue, { color: COLORS.textPrimary }]}>{product.carbs}g</Text>
                <Text style={[styles.nutritionLabel, { color: COLORS.textSecondary }]}>Glucides</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={[styles.nutritionValue, { color: COLORS.textPrimary }]}>{product.fat}g</Text>
                <Text style={[styles.nutritionLabel, { color: COLORS.textSecondary }]}>Lipides</Text>
              </View>
            </View>

            {product.sugar > 20 && (
              <View style={styles.warningBanner}>
                <Ionicons name="warning" size={20} color={COLORS.warning} />
                <Text style={[styles.warningText, { color: COLORS.warning }]}>Attention: Teneur elevee en sucre ({product.sugar}g)</Text>
              </View>
            )}
          </Card>

          <MascotAnimated
            mood={product.score >= 7 ? 'happy' : product.score >= 4 ? 'warning' : 'sad'}
            size={100}
          />
          <Text style={[styles.mascotMessage, { color: COLORS.textSecondary }]}>
            {product.score >= 7
              ? 'Excellent choix ! Ce produit est sain.'
              : product.score >= 4
                ? 'Pas mal, mais consomme avec moderation.'
                : 'Attention, ce produit n\'est pas tres sain...'}
          </Text>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.scanAgainButton, { borderColor: COLORS.secondary }]} onPress={handleScanAgain}>
              <Ionicons name="scan" size={20} color={COLORS.secondary} />
              <Text style={[styles.scanAgainText, { color: COLORS.secondary }]}>Scanner un autre</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.addButton, { backgroundColor: COLORS.secondary }]} onPress={handleAddToMeal}>
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Ajouter au repas</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={COLORS.textWhite} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: COLORS.textWhite }]}>Scanner code-barres</Text>
        <View style={{ width: 40 }} />
      </View>

      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      >
        <View style={styles.overlay}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.secondary} />
              <Text style={styles.loadingText}>Recherche du produit...</Text>
            </View>
          ) : (
            <Text style={styles.instructions}>
              Placez le code-barres dans le cadre
            </Text>
          )}
        </View>
      </CameraView>

      <View style={[styles.footer, { backgroundColor: COLORS.cardBackground }]}>
        <TouchableOpacity style={[styles.manualButton, { borderColor: COLORS.secondary }]} onPress={() => Alert.alert('Bientot', 'Saisie manuelle bientot disponible')}>
          <Ionicons name="keypad" size={24} color={COLORS.secondary} />
          <Text style={[styles.manualButtonText, { color: COLORS.secondary }]}>Saisie manuelle</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scanFrame: {
    width: 280,
    height: 150,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#4dd0e1',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  instructions: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: SPACING.lg,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: SPACING.sm,
  },
  footer: {
    padding: SPACING.lg,
  },
  manualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
  },
  manualButtonText: {
    marginLeft: SPACING.sm,
    fontSize: 16,
    fontWeight: '600',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: SPACING.lg,
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 24,
  },
  permissionButton: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.round,
    marginTop: SPACING.xl,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: SPACING.md,
    padding: SPACING.md,
  },
  backButtonText: {
    fontSize: 16,
  },
  productContainer: {
    flex: 1,
    padding: SPACING.md,
    alignItems: 'center',
  },
  productCard: {
    width: '100%',
    marginTop: 60,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productInfo: {
    flex: 1,
  },
  productBrand: {
    fontSize: 14,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  productBarcode: {
    fontSize: 12,
    marginTop: 4,
  },
  scoreBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
  },
  scoreText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  nutritionLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,152,0,0.12)',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
  },
  warningText: {
    marginLeft: SPACING.sm,
    fontSize: 13,
    flex: 1,
  },
  mascotMessage: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 'auto',
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  scanAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
  },
  scanAgainText: {
    marginLeft: SPACING.sm,
    fontSize: 15,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  addButtonText: {
    marginLeft: SPACING.sm,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
