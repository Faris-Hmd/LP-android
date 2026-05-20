import { getAuth } from "@react-native-firebase/auth";
import { getFirestore, collection, getDocs } from "@react-native-firebase/firestore";
import { ProductType } from "@/types";

/**
 * Fetches all products from the Firestore `products` collection.
 * Products are only accessible by authenticated users.
 */
export async function getProducts(): Promise<ProductType[]> {
  const db = getFirestore();
  const snapshot = await getDocs(collection(db, "products"));
  const items: ProductType[] = [];
  snapshot.forEach((doc) => {
    items.push({ id: doc.id, ...(doc.data() as Omit<ProductType, "id">) });
  });
  return items;
}
