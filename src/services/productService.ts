import { ProductType } from "@/types";
import {
  collection,
  getDocs,
  getFirestore,
} from "@react-native-firebase/firestore";

let cachedProducts: ProductType[] | null = null;

/**
 * Fetches all products from the Firestore `products` collection.
 * Products are only accessible by authenticated users.
 */
export async function getProducts(forceRefresh = false): Promise<ProductType[]> {
  if (cachedProducts && !forceRefresh) {
    return cachedProducts;
  }
  const db = getFirestore();
  const snapshot = await getDocs(collection(db, "products"));
  const items: ProductType[] = [];
  snapshot.forEach((doc) => {
    items.push({ id: doc.id, ...(doc.data() as Omit<ProductType, "id">) });
  });
  cachedProducts = items;
  return items;
}

/**
 * Clears the product memory cache (useful upon sign-out).
 */
export function clearProductCache(): void {
  cachedProducts = null;
}

/**
 * Synchronously retrieves a product from the memory cache by ID.
 */
export function getCachedProductById(id: string): ProductType | undefined {
  if (!cachedProducts) return undefined;
  return cachedProducts.find((p) => p.id === id);
}


