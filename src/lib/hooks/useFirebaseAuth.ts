import { useState, useEffect } from "react";
import { auth } from "../firebase";
import { User } from "@firebase/auth-types";
import useErrorCheck from "./useErrorCheck";

type AuthUser = {
  uid: string | null;
  email: string | null;
};

const formatAuthUser = (user: User) => ({
  uid: user.uid,
  email: user.email,
});

export default function useFirebaseAuth() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const authStateChanged = async (authState: User | null) => {
    if (!authState) {
      setAuthUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const formattedUser = formatAuthUser(authState);
    setAuthUser(formattedUser);
    setLoading(false);
  };

  const clear = () => {
    setAuthUser(null);
    setLoading(true);
  };

  const signInWithEmailAndPassword = async (email: string, password: string) =>
    await auth.signInWithEmailAndPassword(email, password).catch(useErrorCheck);

  const createUserWithEmailAndPassword = async (
    email: string,
    password: string
  ) =>
    await auth
      .createUserWithEmailAndPassword(email, password)
      .catch(useErrorCheck);

  const signOut = async () =>
    await auth.signOut().then(clear).catch(useErrorCheck);

  const resetPassword = async (email: string) =>
    await auth.sendPasswordResetEmail(email);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(authStateChanged);
    return () => unsubscribe();
  }, []);

  return {
    authUser,
    loading,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    resetPassword,
  };
}
