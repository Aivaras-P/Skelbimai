// types/Ad.ts

export type ContactInfo = {
  name?: string;
  phone?: string;
  email?: string;
};

// types/Ad.ts
export type Ad = {
  id: string;
  title: string;
  description: string;
  price: number;
  categories: ('CPU' | 'GPU' | 'Motherboard' | 'RAM' | 'PSU' | 'Case')[];
  images: string[];
  contacts: ContactInfo;
  createdAt: number;
  updatedAt?: number;
  username: string;
};

