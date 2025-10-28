import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";
import { db } from "../db/firebase";

export type User = {
  uid: string;
  username: string;
  email: string;
  favorites: string[];
};

type UserContextType = {
  currentUser: User | null;
  isLoading: boolean;
  register: (email: string, username: string, password: string) => Promise<string | null>;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  toggleFavorite: (adId: string) => Promise<void>;
  isFavorite: (adId: string) => boolean;
};

const UserContext = createContext<UserContextType>({} as UserContextType);
export const useUserContext = () => useContext(UserContext);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = getAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🔄 Stebime ar pakeitėsi login būsena
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const ref = doc(db, "users", firebaseUser.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setCurrentUser(snap.data() as User);
        }
      } else {
        setCurrentUser(null);
      }

      setIsLoading(false);
    });

    return () => unsub();
  }, []);

  const register = async (email: string, username: string, password: string) => {
    if (!email || !username || !password) return "Užpildykite visus laukus";
    if (password.length < 5) return "Slaptažodis turi būti bent 5 simboliai";

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const user: User = {
        uid: cred.user.uid,
        email,
        username,
        favorites: [],
      };

      await setDoc(doc(db, "users", user.uid), user);
      setCurrentUser(user);
      return null;
    } catch (err: any) {
      return err.message;
    }
  };

const login = async (email: string, password: string) => {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const snap = await getDoc(doc(db, "users", cred.user.uid));

    if (snap.exists()) {
      setCurrentUser(snap.data() as User);
      return null;
    } else {
      return "Vartotojo duomenys nerasti Firestore";
    }
  } catch (err: any) {
    console.log(err);
    return "Prisijungimo klaida";
  }
};


  const logout = async () => {
    await signOut(auth);
  };

  const toggleFavorite = async (adId: string) => {
    if (!currentUser) return;
    const updatedFavorites = currentUser.favorites.includes(adId)
      ? currentUser.favorites.filter((id) => id !== adId)
      : [...currentUser.favorites, adId];

    await updateDoc(doc(db, "users", currentUser.uid), {
      favorites: updatedFavorites,
    });

    setCurrentUser({ ...currentUser, favorites: updatedFavorites });
  };

  const isFavorite = (adId: string) =>
    currentUser?.favorites.includes(adId) ?? false;

  return (
    <UserContext.Provider
      value={{
        currentUser,
        isLoading,
        register,
        login,
        logout,
        toggleFavorite,
        isFavorite,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
