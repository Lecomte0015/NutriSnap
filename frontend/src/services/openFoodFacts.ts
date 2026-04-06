import { Alert } from 'react-native';

const OPEN_FOOD_FACTS_API = 'https://world.openfoodfacts.org/api/v0/product';
const USER_AGENT = 'NutriSnap/1.0.0 (contact@nutrisnap.app)';

export interface ProductData {
  barcode: string;
  name: string;
  brand: string;
  image: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
  fiber: number;
  salt: number;
  score: number;
  nutriscoreGrade: string | null;
  servingSize: string | null;
  ingredients: string | null;
  allergens: string[];
  found: boolean;
}

class OpenFoodFactsService {
  /**
   * Fetch product data from Open Food Facts API
   */
  async getProduct(barcode: string): Promise<ProductData> {
    try {
      const response = await fetch(`${OPEN_FOOD_FACTS_API}/${barcode}.json`, {
        method: 'GET',
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 0 || !data.product) {
        return this.getEmptyProduct(barcode);
      }

      const product = data.product;
      const nutriments = product.nutriments || {};

      return {
        barcode,
        name: product.product_name || product.product_name_fr || 'Produit inconnu',
        brand: product.brands || 'Marque inconnue',
        image: product.image_front_url || product.image_url || null,
        calories: Math.round(nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 0),
        protein: Math.round((nutriments.proteins_100g || nutriments.proteins || 0) * 10) / 10,
        carbs: Math.round((nutriments.carbohydrates_100g || nutriments.carbohydrates || 0) * 10) / 10,
        fat: Math.round((nutriments.fat_100g || nutriments.fat || 0) * 10) / 10,
        sugar: Math.round((nutriments.sugars_100g || nutriments.sugars || 0) * 10) / 10,
        fiber: Math.round((nutriments.fiber_100g || nutriments.fiber || 0) * 10) / 10,
        salt: Math.round((nutriments.salt_100g || nutriments.salt || 0) * 100) / 100,
        score: this.calculateHealthScore(nutriments, product.nutriscore_grade),
        nutriscoreGrade: product.nutriscore_grade || null,
        servingSize: product.serving_size || null,
        ingredients: product.ingredients_text || product.ingredients_text_fr || null,
        allergens: this.parseAllergens(product.allergens_tags || []),
        found: true,
      };
    } catch (error) {
      console.error('Error fetching product:', error);
      return this.getEmptyProduct(barcode);
    }
  }

  /**
   * Calculate a health score from 1-10 based on nutritional values
   */
  private calculateHealthScore(nutriments: any, nutriscoreGrade?: string): number {
    // If nutriscore is available, use it as base
    if (nutriscoreGrade) {
      const nutriscoreMap: Record<string, number> = {
        'a': 9,
        'b': 7,
        'c': 5,
        'd': 3,
        'e': 1,
      };
      return nutriscoreMap[nutriscoreGrade.toLowerCase()] || 5;
    }

    // Calculate score based on nutriments
    let score = 5; // Base score

    const calories = nutriments['energy-kcal_100g'] || 0;
    const sugar = nutriments.sugars_100g || 0;
    const fat = nutriments.fat_100g || 0;
    const saturatedFat = nutriments['saturated-fat_100g'] || 0;
    const salt = nutriments.salt_100g || 0;
    const fiber = nutriments.fiber_100g || 0;
    const protein = nutriments.proteins_100g || 0;

    // Negative factors
    if (calories > 400) score -= 2;
    else if (calories > 200) score -= 1;

    if (sugar > 20) score -= 2;
    else if (sugar > 10) score -= 1;

    if (saturatedFat > 10) score -= 2;
    else if (saturatedFat > 5) score -= 1;

    if (salt > 2) score -= 1;

    // Positive factors
    if (fiber > 5) score += 2;
    else if (fiber > 2) score += 1;

    if (protein > 15) score += 1;

    // Clamp score between 1 and 10
    return Math.max(1, Math.min(10, score));
  }

  /**
   * Parse allergens from Open Food Facts format
   */
  private parseAllergens(allergensTags: string[]): string[] {
    return allergensTags.map(tag => {
      // Remove 'en:' or 'fr:' prefix and format
      const cleaned = tag.replace(/^[a-z]{2}:/, '');
      return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).replace(/-/g, ' ');
    });
  }

  /**
   * Return empty product data when not found
   */
  private getEmptyProduct(barcode: string): ProductData {
    return {
      barcode,
      name: '',
      brand: '',
      image: null,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      sugar: 0,
      fiber: 0,
      salt: 0,
      score: 0,
      nutriscoreGrade: null,
      servingSize: null,
      ingredients: null,
      allergens: [],
      found: false,
    };
  }

  /**
   * Search products by name
   */
  async searchProducts(query: string, page: number = 1): Promise<ProductData[]> {
    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page=${page}&page_size=20`,
        {
          method: 'GET',
          headers: {
            'User-Agent': USER_AGENT,
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.products || data.products.length === 0) {
        return [];
      }

      return data.products.map((product: any) => {
        const nutriments = product.nutriments || {};
        return {
          barcode: product.code || '',
          name: product.product_name || 'Produit inconnu',
          brand: product.brands || '',
          image: product.image_front_small_url || null,
          calories: Math.round(nutriments['energy-kcal_100g'] || 0),
          protein: Math.round((nutriments.proteins_100g || 0) * 10) / 10,
          carbs: Math.round((nutriments.carbohydrates_100g || 0) * 10) / 10,
          fat: Math.round((nutriments.fat_100g || 0) * 10) / 10,
          sugar: Math.round((nutriments.sugars_100g || 0) * 10) / 10,
          fiber: Math.round((nutriments.fiber_100g || 0) * 10) / 10,
          salt: Math.round((nutriments.salt_100g || 0) * 100) / 100,
          score: this.calculateHealthScore(nutriments, product.nutriscore_grade),
          nutriscoreGrade: product.nutriscore_grade || null,
          servingSize: product.serving_size || null,
          ingredients: null,
          allergens: [],
          found: true,
        };
      });
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }
}

export const openFoodFactsService = new OpenFoodFactsService();
export default openFoodFactsService;
