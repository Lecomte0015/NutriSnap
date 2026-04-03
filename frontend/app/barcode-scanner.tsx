import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Vibration,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../src/constants/colors';
import { Card, MascotAnimated } from '../src/components';
import i18n from '../src/i18n';

// Mock product database - In production, use Open Food Facts API or similar
const MOCK_PRODUCTS: Record<string, any> = {
  '3017620422003': {
    name: 'Nutella 400g',
    brand: 'Ferrero',
    calories: 539,
    protein: 6.3,
    carbs: 57.5,
    fat: 30.9,
    sugar: 56.3,
    fiber: 0,
    score: 2,
    image: 'https://images.openfoodfacts.org/images/products/301/762/042/2003/front_fr.400.jpg',
  },
  '3175680011480': {
    name: 'Eau minerale Evian 1.5L',
    brand: 'Evian',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    sugar: 0,
    fiber: 0,
    score: 10,
    image: null,
  },
  '7622210449283': {
    name: 'Oreo Original',
    brand: 'Oreo',
    calories: 480,
    protein: 4.5,
    carbs: 69,
    fat: 20,
    sugar: 38,
    fiber: 2,
    score: 3,
    image: null,
  },
};

export default function BarcodeScannerScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const t = i18n.t.bind(i18n);

  const handleBarcodeScanned = async ({ type, data }: BarcodeScanningResult) => {
    if (scanned) return;
    
    setScanned(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Vibration.vibrate(100);

    console.log('Barcode scanned:', type, data);

    // Look up product
    const foundProduct = MOCK_PRODUCTS[data];

    if (foundProduct) {
      setProduct({ ...foundProduct, barcode: data });
    } else {
      // In production, call Open Food Facts API
      Alert.alert(
        'Produit non trouve',
        `Code-barres: ${data}\n\nCe produit n\'est pas encore dans notre base de donnees. Voulez-vous l\'ajouter ?`,
        [
          { text: 'Non', onPress: () => setScanned(false) },
          { text: 'Oui', onPress: () => handleAddProduct(data) },
        ]
      );
    }
  };

  const handleAddProduct = (barcode: string) => {
    // In production, open a form to add the product
    Alert.alert('Bientot disponible', 'L\'ajout de produits sera disponible dans une prochaine mise a jour.');
    setScanned(false);
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
        <View style={styles.permissionContainer}>
          <MascotAnimated mood="sad" size={120} />
          <Text style={styles.permissionTitle}>Acces camera requis</Text>
          <Text style={styles.permissionText}>
            Pour scanner les codes-barres, nous avons besoin d'acceder a votre camera.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Autoriser la camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Produit trouve</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.productContainer}>
          <Card style={styles.productCard}>
            <View style={styles.productHeader}>
              <View style={styles.productInfo}>
                <Text style={styles.productBrand}>{product.brand}</Text>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productBarcode}>Code: {product.barcode}</Text>
              </View>
              <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(product.score) }]}>
                <Text style={styles.scoreText}>{product.score}/10</Text>
              </View>
            </View>

            <View style={styles.nutritionGrid}>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{product.calories}</Text>
                <Text style={styles.nutritionLabel}>Calories</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{product.protein}g</Text>
                <Text style={styles.nutritionLabel}>Proteines</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{product.carbs}g</Text>
                <Text style={styles.nutritionLabel}>Glucides</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{product.fat}g</Text>
                <Text style={styles.nutritionLabel}>Lipides</Text>
              </View>
            </View>

            {product.sugar > 20 && (
              <View style={styles.warningBanner}>
                <Ionicons name="warning" size={20} color={COLORS.warning} />
                <Text style={styles.warningText}>Attention: Teneur elevee en sucre ({product.sugar}g)</Text>
              </View>
            )}
          </Card>

          <MascotAnimated 
            mood={product.score >= 7 ? 'happy' : product.score >= 4 ? 'warning' : 'sad'} 
            size={100} 
          />
          <Text style={styles.mascotMessage}>
            {product.score >= 7 
              ? 'Excellent choix ! Ce produit est sain.' 
              : product.score >= 4 
                ? 'Pas mal, mais consomme avec moderation.' 
                : 'Attention, ce produit n\'est pas tres sain...'}
          </Text>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.scanAgainButton} onPress={handleScanAgain}>
              <Ionicons name="scan" size={20} color={COLORS.secondary} />
              <Text style={styles.scanAgainText}>Scanner un autre</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addButton} onPress={handleAddToMeal}>
              <Ionicons name="add" size={20} color={COLORS.textWhite} />
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
          <Text style={styles.instructions}>
            Placez le code-barres dans le cadre
          </Text>
        </View>
      </CameraView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.manualButton} onPress={() => Alert.alert('Bientot', 'Saisie manuelle bientot disponible')}>
          <Ionicons name="keypad" size={24} color={COLORS.secondary} />
          <Text style={styles.manualButtonText}>Saisie manuelle</Text>
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
    color: COLORS.textPrimary,
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
    borderColor: COLORS.secondary,
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
    color: COLORS.textWhite,
    fontSize: 16,
    marginTop: SPACING.lg,
    textAlign: 'center',
  },
  footer: {
    padding: SPACING.lg,
    backgroundColor: COLORS.cardBackground,
  },
  manualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  manualButtonText: {
    marginLeft: SPACING.sm,
    color: COLORS.secondary,
    fontSize: 16,
    fontWeight: '600',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.background,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
  },
  permissionText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.round,
    marginTop: SPACING.xl,
  },
  permissionButtonText: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: SPACING.md,
    padding: SPACING.md,
  },
  backButtonText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  productContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    color: COLORS.textSecondary,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  productBarcode: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
  },
  scoreBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
  },
  scoreText: {
    color: COLORS.textWhite,
    fontWeight: 'bold',
    fontSize: 14,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  nutritionLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '20',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
  },
  warningText: {
    marginLeft: SPACING.sm,
    color: COLORS.warning,
    fontSize: 13,
    flex: 1,
  },
  mascotMessage: {
    fontSize: 15,
    color: COLORS.textSecondary,
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
    borderColor: COLORS.secondary,
  },
  scanAgainText: {
    marginLeft: SPACING.sm,
    color: COLORS.secondary,
    fontSize: 15,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  addButtonText: {
    marginLeft: SPACING.sm,
    color: COLORS.textWhite,
    fontSize: 15,
    fontWeight: '600',
  },
});
