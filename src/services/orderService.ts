import { getFirestore, collection, doc, addDoc, setDoc, getDoc, getDocs, query, where } from "@react-native-firebase/firestore";
import { OrderType, DriverType, ShippingInfo } from "@/types";

const db = () => getFirestore();

// ─── Submit a new order ───────────────────────────────────────────────────────
export interface NewOrder extends Omit<OrderType, "id"> {}

export async function submitOrder(order: NewOrder): Promise<string> {
  const ref = await addDoc(collection(db(), "orders"), order);
  return ref.id;
}

// ─── Persist last-used shipping address on the user doc ───────────────────────
export async function saveUserShippingOnOrder(
  userKey: string,
  shipping: ShippingInfo
): Promise<void> {
  await setDoc(
    doc(db(), "users", userKey),
    { shippingInfo: shipping, updatedAt: new Date().toISOString() },
    { merge: true }
  );
}

// ─── Fetch orders for a user ──────────────────────────────────────────────────
export async function getUserOrders(email: string): Promise<OrderType[]> {
  const q = query(collection(db(), "orders"), where("customer_email", "==", email));
  const snapshot = await getDocs(q);
  const items: OrderType[] = [];
  snapshot.forEach((d) => items.push({ id: d.id, ...(d.data() as Omit<OrderType, "id">) }));
  items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  return items;
}

// ─── Fetch a single driver by ID ─────────────────────────────────────────────
export async function getDriverById(driverId: string): Promise<DriverType | null> {
  const snap = await getDoc(doc(db(), "drivers", driverId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<DriverType, "id">) };
}
