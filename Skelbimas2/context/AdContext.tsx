import { getAuth } from 'firebase/auth';
import { collection, deleteDoc, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import React, { createContext, ReactNode, useContext, useEffect, useReducer } from 'react';
import { Alert } from 'react-native';
import { db } from '../db/firebase';
import { Ad } from '../types/Ad';

type State = {
  ads: Ad[];
  isLoading: boolean;
};

type Action =
  | { type: 'LOAD_ADS'; payload: Ad[] }
  | { type: 'ADD_AD'; payload: Ad }
  | { type: 'UPDATE_AD'; payload: Ad }
  | { type: 'DELETE_AD'; payload: string };

type AdContextType = {
  ads: Ad[];
  isLoading: boolean;
  addAd: (adData: Omit<Ad, 'id' | 'createdAt' | 'updatedAt' | 'ownerId'>) => Promise<Ad | null>;
  updateAd: (ad: Ad) => Promise<Ad | null>;
  deleteAd: (id: string) => Promise<void>;
  getAdById: (id: string) => Ad | undefined;
};

const initialState: State = { ads: [], isLoading: true };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOAD_ADS':
      return { ...state, ads: action.payload, isLoading: false };
    case 'ADD_AD':
      return { ...state, ads: [action.payload, ...state.ads] };
    case 'UPDATE_AD':
      return { ...state, ads: state.ads.map((a) => (a.id === action.payload.id ? action.payload : a)) };
    case 'DELETE_AD':
      return { ...state, ads: state.ads.filter((a) => a.id !== action.payload) };
    default:
      return state;
  }
}

const AdContext = createContext<AdContextType | undefined>(undefined);

export const useAdContext = (): AdContextType => {
  const ctx = useContext(AdContext);
  if (!ctx) throw new Error('useAdContext must be used within AdProvider');
  return ctx;
};

export const AdProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const auth = getAuth();

  // Realtime Firestore ads
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'ads'), (snapshot) => {
      const adsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Ad[];

      dispatch({ type: 'LOAD_ADS', payload: adsList });
    });

    return () => unsub();
  }, []);

// generateId patobulintas (unikalesnis)
const generateId = () => Date.now().toString() + '_' + Math.floor(Math.random() * 1000000).toString();

const addAd: AdContextType['addAd'] = async (adData) => {
  const user = auth.currentUser;
  if (!user) {
    Alert.alert('Klaida', 'Privalote būti prisijungę');
    return null;
  }

  const id = generateId();

  const newAd: Ad = {
    id,
    ...adData,
    ownerId: user.uid,
    username: adData.username,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  try {
    // Užrašome dokumentą su mūsų sugeneruotu id (NE addDoc)
    console.log('Creating ad with ownerId:', newAd.ownerId);
    await setDoc(doc(db, 'ads', id), newAd);


    return newAd;
  } catch (err) {
    console.error('addAd error:', err);
    Alert.alert('Klaida', 'Nepavyko sukurti skelbimo.');
    return null;
  }
};


const updateAd: AdContextType['updateAd'] = async (ad) => {
  const user = auth.currentUser;
  console.log('Trying to update ad:', ad.id);
  console.log('Current user uid:', user?.uid);
  console.log('Ad ownerId:', ad.ownerId);

  if (!user) {
    Alert.alert('Klaida', 'Turite būti prisijungę');
    return null;
  }

  if (ad.ownerId !== user.uid) {
    console.warn('Permission denied: user is not the owner');
    Alert.alert('Klaida', 'Negalite redaguoti svetimo skelbimo');
    return null;
  }

  try {
    const updated = { ...ad, updatedAt: Date.now() };
    await updateDoc(doc(db, 'ads', ad.id), updated);
    return updated;
  } catch (err) {
    console.error('Update ad error:', err);
    Alert.alert('Klaida', 'Nepavyko atnaujinti skelbimo.');
    return null;
  }
};

const deleteAd: AdContextType['deleteAd'] = async (id) => {
  const user = auth.currentUser;
  const ad = state.ads.find((a) => a.id === id);

  console.log('Trying to delete ad:', id);
  console.log('Current user uid:', user?.uid);
  console.log('Ad ownerId:', ad?.ownerId);

  if (!user || !ad) {
    Alert.alert('Klaida', 'Negalima ištrinti.');
    return;
  }

  if (ad.ownerId !== user.uid) {
    console.warn('Permission denied: user is not the owner');
    Alert.alert('Klaida', 'Negalite ištrinti svetimo skelbimo');
    return;
  }

  try {
    await deleteDoc(doc(db, 'ads', id));
    console.log('Ad deleted:', id);
  } catch (err) {
    console.error('Delete ad error:', err);
    Alert.alert('Klaida', 'Nepavyko ištrinti skelbimo.');
  }
};


  const getAdById = (id: string) => state.ads.find((a) => a.id === id);

  return (
    <AdContext.Provider
      value={{
        ads: state.ads,
        isLoading: state.isLoading,
        addAd,
        updateAd,
        deleteAd,
        getAdById,
      }}
    >
      {children}
    </AdContext.Provider>
  );
};
