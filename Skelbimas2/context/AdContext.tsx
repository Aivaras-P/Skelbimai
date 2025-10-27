import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useEffect, useReducer } from 'react';
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
  addAd: (ad: Omit<Ad, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Ad>;
  updateAd: (ad: Ad) => Promise<Ad>;
  deleteAd: (id: string) => Promise<void>;
  getAdById: (id: string) => Ad | undefined;
};

const STORAGE_KEY = '@ads_v1';
const initialState: State = { ads: [], isLoading: true };


function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOAD_ADS':
      return { ...state, ads: action.payload, isLoading: false };
    case 'ADD_AD':
      return { ...state, ads: [action.payload, ...state.ads] };
    case 'UPDATE_AD':
      return {
        ...state,
        ads: state.ads.map((a) =>
          a.id === action.payload.id ? action.payload : a
        ),
      };
    case 'DELETE_AD':
      return { ...state, ads: state.ads.filter((a) => a.id !== action.payload) };
    default:
      return state;
  }
}

const AdContext = createContext<AdContextType | undefined>(undefined);

export const AdProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const parsed: Ad[] = raw ? JSON.parse(raw) : [];
        dispatch({ type: 'LOAD_ADS', payload: parsed });
      } catch (e) {
        console.error('Error loading ads:', e);
        dispatch({ type: 'LOAD_ADS', payload: [] });
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.ads));
      } catch (e) {
        console.error('Error saving ads:', e);
      }
    })();
  }, [state.ads]);

  const addAd: AdContextType['addAd'] = async (adData) => {
    const newAd: Ad = {
      ...adData,
      id: Date.now().toString(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    dispatch({ type: 'ADD_AD', payload: newAd });
    return newAd;
  };

  const updateAd: AdContextType['updateAd'] = async (ad) => {
    const updated = { ...ad, updatedAt: Date.now() };
    dispatch({ type: 'UPDATE_AD', payload: updated });
    return updated;
  };

  const deleteAd: AdContextType['deleteAd'] = async (id) => {
    dispatch({ type: 'DELETE_AD', payload: id });
  };

  const getAdById: AdContextType['getAdById'] = (id) =>
    state.ads.find((a) => a.id === id);

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

export const useAdContext = (): AdContextType => {
  const ctx = React.useContext(AdContext);
  if (!ctx) throw new Error('useAdContext must be used within AdProvider');
  return ctx;
};
