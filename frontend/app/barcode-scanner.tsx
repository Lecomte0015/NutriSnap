import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Vibration,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../src/constants/colors';
import { Card, MascotAnimated } from '../src/components';
import i18n from '../src/i18n';
import openFoodFactsService, { ProductData } from '../src/services/openFoodFacts';

export default function BarcodeScannerScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<ProductData | null>(null);
  const t = i18n.t.bind(i18n);

  const handleBarcodeScanned = async ({ type, data }: BarcodeScanningResult) => {
    if (scanned || loading) return;
    
    setScanned(true);
    setLoading(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Vibration.vibrate(100);

    console.log('Barcode scanned:', type, data);

    try {
      // Call Open Food Facts API
      const productData = await openFoodFactsService.getProduct(data);

      if (productData.found) {
        setProduct(productData);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert(
          'Produit non trouve',
          `Code-barres: ${data}\n\nCe produit n'est pas encore dans la base Open Food Facts.`,
          [
            { text: 'Scanner un autre', onPress: () => {
              setScanned(false);
              setLoading(false);
            }},
            { text: 'Ajouter manuellement', onPress: () => handleAddProduct(data) },
          ]
        );
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      Alert.alert(
        'Erreur',
        'Impossible de recuperer les informations du produit. Verifiez votre connexion internet.',
        [{ text: 'OK', onPress: () => {
          setScanned(false);
          setLoading(false);
        }}]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = (barcode: string) => {
    Alert.alert(
      'Contribution Open Food Facts',
      'Vous pouvez ajouter ce produit sur openfoodfacts.org pour enrichir la base de donnees communautaire !',
      [{ text: 'Compris', onPress: () => {
        setScanned(false);
        setLoading(false);
      }}]
    );
  };

  const handleAddToMeal = async () => {
    if (!product) return;

    // Navigate back with product data
    router.back();
    // Show success message with product details
    Alert.alert(
      'Produit ajoute',
      `${product.name} (${product.brand})\n\nCalories: ${product.calories} kcal\nProteines: ${product.protein}g\nGlucides: ${product.carbs}g\nLipides: ${product.fat}g`
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

  const getNutriscoreColor = (grade: string | null) => {
    if (!grade) return COLORS.textSecondary;
    const colors: Record<string, string> = {
      'a': '#038141',
      'b': '#85BB2F',
      'c': '#FECB02',
      'd': '#EE8100',
      'e': '#E63E11',
    };
    return colors[grade.toLowerCase()] || COLORS.textSecondary;
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

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.secondary} />
          <Text style={styles.loadingText}>Recherche du produit...</Text>
          <MascotAnimated mood="thinking" size={100} />
        </View>
      </SafeAreaView>
    );
  }

  if (product) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
        <View style={[styles.header, { position: 'relative', top: 0 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Produit trouve</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.productContainer}>
          <Card style={styles.productCard}>
            {/* Product image */}
            {product.image && (
              <View style={styles.productImageContainer}>
                <Image 
                  source={{ uri: product.image }} 
                  style={styles.productImage}
                  resizeMode="contain"
                />
              </View>
            )}

            <View style={styles.productHeader}>
              <View style={styles.productInfo}>
                <Text style={styles.productBrand}>{product.brand}</Text>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productBarcode}>Code: {product.barcode}</Text>
                {product.servingSize && (
                  <Text style={styles.servingSize}>Portion: {product.servingSize}</Text>
                )}
              </View>
              <View style={styles.scoreContainer}>
                <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(product.score) }]}>
                  <Text style={styles.scoreText}>{product.score}/10</Text>
                </View>
                {product.nutriscoreGrade && (
                  <View style={[styles.nutriscore, { backgroundColor: getNutriscoreColor(product.nutriscoreGrade) }]}>
                    <Text style={styles.nutriscoreText}>
                      {product.nutriscoreGrade.toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Main nutrition grid */}
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

            {/* Secondary nutrition info */}
            <View style={styles.secondaryNutrition}>
              <View style={styles.secondaryItem}>
                <Text style={styles.secondaryLabel}>Sucres</Text>
                <Text style={styles.secondaryValue}>{product.sugar}g</Text>
              </View>
              <View style={styles.secondaryItem}>
                <Text style={styles.secondaryLabel}>Fibres</Text>
                <Text style={styles.secondaryValue}>{product.fiber}g</Text>
              </View>
              <View style={styles.secondaryItem}>
                <Text style={styles.secondaryLabel}>Sel</Text>
                <Text style={styles.secondaryValue}>{product.salt}g</Text>
              </View>
            </View>

            {/* Allergens */}
            {product.allergens && product.allergens.length > 0 && (
              <View style={styles.allergensContainer}>
                <View style={styles.allergensHeader}>
                  <Ionicons name="alert-circle" size={18} color={COLORS.error} />
                  <Text style={styles.allergensTitle}>Allergenes</Text>
                </View>
                <Text style={styles.allergensList}>
                  {product.allergens.join(', ')}
                </Text>
              </View>
            )}

            {/* Sugar warning */}
            {product.sugar > 20 && (
              <View style={styles.warningBanner}>
                <Ionicons name="warning" size={20} color={COLORS.warning} />
                <Text style={styles.warningText}>Attention: Teneur elevee en sucre ({product.sugar}g)</Text>
              </View>
            )}
          </Card>

          <MascotAnimated 
            mood={product.score >= 7 ? 'happy' : product.score >= 4 ? 'warning' : 'sad'} 
            size={80} 
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
    marginTop: SPACING.md,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    fontSize: 18,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  productImageContainer: {
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: BORDER_RADIUS.md,
  },
  servingSize: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
    fontStyle: 'italic',
  },
  scoreContainer: {
    alignItems: 'flex-end',
    gap: SPACING.xs,
  },
  nutriscore: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    minWidth: 30,
    alignItems: 'center',
  },
  nutriscoreText: {
    color: COLORS.textWhite,
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryNutrition: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  secondaryItem: {
    alignItems: 'center',
  },
  secondaryLabel: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  secondaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  allergensContainer: {
    backgroundColor: COLORS.error + '10',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
  },
  allergensHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  allergensTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.error,
    marginLeft: SPACING.xs,
  },
  allergensList: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 22,
  },
});
