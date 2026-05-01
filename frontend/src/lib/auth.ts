import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "./firebase";

export type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
};

function toAuthUser(u: User | null): AuthUser | null {
  if (!u) return null;
  return { uid: u.uid, email: u.email, displayName: u.displayName };
}

export function subscribeAuth(callback: (user: AuthUser | null) => void): () => void {
  const auth = getFirebaseAuth();
  return onAuthStateChanged(auth, (u) => callback(toAuthUser(u)));
}

export async function signUpEmail(email: string, password: string): Promise<AuthUser> {
  const auth = getFirebaseAuth();
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  return toAuthUser(user)!;
}

export async function signInEmail(email: string, password: string): Promise<AuthUser> {
  const auth = getFirebaseAuth();
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return toAuthUser(user)!;
}

export async function signInGoogle(): Promise<AuthUser> {
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  const { user } = await signInWithPopup(auth, provider);
  return toAuthUser(user)!;
}

export async function signOutUser(): Promise<void> {
  const auth = getFirebaseAuth();
  await signOut(auth);
}

export async function getIdToken(forceRefresh = false): Promise<string | null> {
  const auth = getFirebaseAuth();
  const u = auth.currentUser;
  if (!u) return null;
  return u.getIdToken(forceRefresh);
}
