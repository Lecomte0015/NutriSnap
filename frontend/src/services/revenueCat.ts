import Purchases, { 
  PurchasesPackage, 
  CustomerInfo,
  PurchasesOfferings,
  PURCHASES_ERROR_CODE
} from 'react-native-purchases';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// RevenueCat API Key
const REVENUECAT_API_KEY = 'sk_ZzZcZxFSbwPmdyzLRvOCHzzCmvKsw';

// Entitlement identifier - corresponds to your RevenueCat entitlement
const PREMIUM_ENTITLEMENT = 'NutriSnap Pro';

class RevenueCatService {
  private isInitialized = false;

  async initialize(userId?: string): Promise<void> {
    if (this.isInitialized) return;

    try {
      await Purchases.configure({ apiKey: REVENUECAT_API_KEY });

      if (userId) {
        await Purchases.logIn(userId);
      }

      this.isInitialized = true;
      console.log('RevenueCat initialized successfully');
    } catch (error) {
      console.error('Error initializing RevenueCat:', error);
    }
  }

  async getOfferings(): Promise<PurchasesOfferings | null> {
    try {
      const offerings = await Purchases.getOfferings();
      return offerings;
    } catch (error) {
      console.error('Error fetching offerings:', error);
      return null;
    }
  }

  async purchasePackage(pkg: PurchasesPackage): Promise<boolean> {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      return this.checkPremiumStatus(customerInfo);
    } catch (error: any) {
      if (error.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
        console.log('Purchase cancelled by user');
      } else {
        console.error('Error purchasing package:', error);
        Alert.alert(
          'Erreur d\'achat',
          'Une erreur est survenue lors de l\'achat. Veuillez reessayer.'
        );
      }
      return false;
    }
  }

  async restorePurchases(): Promise<boolean> {
    try {
      const customerInfo = await Purchases.restorePurchases();
      const isPremium = this.checkPremiumStatus(customerInfo);
      
      if (isPremium) {
        Alert.alert('Succes', 'Vos achats ont ete restaures !');
      } else {
        Alert.alert('Information', 'Aucun achat a restaurer.');
      }
      
      return isPremium;
    } catch (error) {
      console.error('Error restoring purchases:', error);
      Alert.alert('Erreur', 'Impossible de restaurer vos achats.');
      return false;
    }
  }

  async checkPremiumStatus(customerInfo?: CustomerInfo): Promise<boolean> {
    try {
      const info = customerInfo || await Purchases.getCustomerInfo();
      const isPremium = info.entitlements.active[PREMIUM_ENTITLEMENT] !== undefined;
      
      // Cache premium status
      await AsyncStorage.setItem('isPremium', isPremium.toString());
      
      return isPremium;
    } catch (error) {
      console.error('Error checking premium status:', error);
      // Return cached value if available
      const cached = await AsyncStorage.getItem('isPremium');
      return cached === 'true';
    }
  }

  async getCustomerInfo(): Promise<CustomerInfo | null> {
    try {
      return await Purchases.getCustomerInfo();
    } catch (error) {
      console.error('Error getting customer info:', error);
      return null;
    }
  }

  async logIn(userId: string): Promise<void> {
    try {
      await Purchases.logIn(userId);
    } catch (error) {
      console.error('Error logging in to RevenueCat:', error);
    }
  }

  async logOut(): Promise<void> {
    try {
      await Purchases.logOut();
    } catch (error) {
      console.error('Error logging out from RevenueCat:', error);
    }
  }

  getEntitlementId(): string {
    return PREMIUM_ENTITLEMENT;
  }
}

export const revenueCatService = new RevenueCatService();
export default revenueCatService;
