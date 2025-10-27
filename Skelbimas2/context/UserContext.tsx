// context/UserContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export type User = {
  username: string;
  password: string;
  favorites: string[]; // ad.id sąrašas
};

type UserContextType = {
  currentUser: User | null;
  users: User[];
  isLoading: boolean;
  register: (username: string, password: string, password2: string) => Promise<string | null>;
  login: (username: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  toggleFavorite: (adId: string) => Promise<void>;
  isFavorite: (adId: string) => boolean;
  loadUserFromStorage: () => Promise<void>;
};

const UserContext = createContext<UserContextType>({} as UserContextType);
export const useUserContext = () => useContext(UserContext);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Paleidžiant programą
  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    setIsLoading(true);
    const storedUsers = await AsyncStorage.getItem('users');
    const storedCurrent = await AsyncStorage.getItem('currentUser');
    if (storedUsers) setUsers(JSON.parse(storedUsers));
    if (storedCurrent) setCurrentUser(JSON.parse(storedCurrent));
    setIsLoading(false);
  };

  const saveUsers = async (newUsers: User[]) => {
    setUsers(newUsers);
    await AsyncStorage.setItem('users', JSON.stringify(newUsers));
  };

  const register = async (username: string, password: string, password2: string) => {
    if (!username || !password) return 'Užpildykite visus laukus';
    if (password.length < 5) return 'Slaptažodis turi būti bent 5 simbolių';
    if (password !== password2) return 'Slaptažodžiai nesutampa';
    if (users.some((u) => u.username === username)) return 'Toks vartotojo vardas jau egzistuoja';

    const newUser: User = { username, password, favorites: [] };
    const updated = [...users, newUser];
    await saveUsers(updated);
    await AsyncStorage.setItem('currentUser', JSON.stringify(newUser));
    setCurrentUser(newUser);
    return null;
  };

  const login = async (username: string, password: string) => {
    const user = users.find((u) => u.username === username && u.password === password);
    if (!user) return 'Neteisingas vartotojo vardas arba slaptažodis';
    await AsyncStorage.setItem('currentUser', JSON.stringify(user));
    setCurrentUser(user);
    return null;
  };

  const logout = async () => {
    setCurrentUser(null);
    await AsyncStorage.removeItem('currentUser');
  };

  const toggleFavorite = async (adId: string) => {
    if (!currentUser) return;
    const updatedUser = {
      ...currentUser,
      favorites: currentUser.favorites.includes(adId)
        ? currentUser.favorites.filter((id) => id !== adId)
        : [...currentUser.favorites, adId],
    };
    setCurrentUser(updatedUser);

    const updatedUsers = users.map((u) =>
      u.username === updatedUser.username ? updatedUser : u
    );
    await saveUsers(updatedUsers);
    await AsyncStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };

  const isFavorite = (adId: string) => {
    return currentUser?.favorites?.includes(adId) ?? false;
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        users,
        isLoading,
        register,
        login,
        logout,
        toggleFavorite,
        isFavorite,
        loadUserFromStorage,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
