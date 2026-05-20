import { getAuth, onAuthStateChanged, signInWithCredential, GoogleAuthProvider, signOut, FirebaseAuthTypes } from "@react-native-firebase/auth";
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";

// ─── Configuration ─────────────────────────────────────────────────────────
GoogleSignin.configure({
  webClientId: "170352568774-r20qmi9gtdnb8fb7fjauh55c5t0ejd1q.apps.googleusercontent.com",
  offlineAccess: true,
});

// ─── Get the currently signed-in user (sync) ─────────────────────────────────
export function getCurrentUser(): FirebaseAuthTypes.User | null {
  return getAuth().currentUser;
}

// ─── Subscribe to auth state changes ─────────────────────────────────────────
export function subscribeToAuthChanges(
  callback: (user: FirebaseAuthTypes.User | null) => void
): () => void {
  return onAuthStateChanged(getAuth(), callback);
}

// ─── Google Sign-In flow ──────────────────────────────────────────────────────
export async function signInWithGoogle(): Promise<void> {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const signInResult = await GoogleSignin.signIn();
  const idToken = signInResult.data?.idToken;
  if (!idToken) throw new Error("لم يتم استقبال رمز Google ID token");
  const credential = GoogleAuthProvider.credential(idToken);
  await signInWithCredential(getAuth(), credential);
}

// ─── Sign out ─────────────────────────────────────────────────────────────────
export async function signOutUser(): Promise<void> {
  await signOut(getAuth());
}

// Re-export statusCodes for convenience inside screens
export { statusCodes };
