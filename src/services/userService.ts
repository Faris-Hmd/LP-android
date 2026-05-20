import { getFirestore, doc, setDoc, getDoc, getDocs, collection, query, where } from "@react-native-firebase/firestore";
import { UserProfile } from "@/types";

const db = () => getFirestore();

// ─── Fetch user profile ───────────────────────────────────────────────────────
export async function getUserProfile(userKey: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db(), "users", userKey));
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

// ─── Save / merge user profile ────────────────────────────────────────────────
export async function saveUserProfile(
  userKey: string,
  data: Partial<UserProfile>
): Promise<void> {
  await setDoc(doc(db(), "users", userKey), { ...data, updatedAt: new Date().toISOString() }, { merge: true });
}

// ─── Count total orders for a user ───────────────────────────────────────────
export async function getUserOrderCount(email: string): Promise<number> {
  const q = query(collection(db(), "orders"), where("customer_email", "==", email));
  const snap = await getDocs(q);
  return snap.size;
}
