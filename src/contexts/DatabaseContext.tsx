import React, { createContext, useContext, ReactNode } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  db, 
  WardrobeItem, 
  ProfilePhoto, 
  Composition,
  addWardrobeItem,
  updateWardrobeItem,
  deleteWardrobeItem,
  getWardrobeItems,
  addProfilePhoto,
  deleteProfilePhoto,
  getProfilePhotos,
  addComposition,
  getCompositions,
  deleteComposition
} from '../db/database';

interface DatabaseContextType {
  wardrobeItems: WardrobeItem[] | undefined;
  profilePhotos: ProfilePhoto[] | undefined;
  compositions: Composition[] | undefined;
  addWardrobeItem: typeof addWardrobeItem;
  updateWardrobeItem: typeof updateWardrobeItem;
  deleteWardrobeItem: typeof deleteWardrobeItem;
  deleteComposition: typeof deleteComposition;
  deleteComposition: typeof deleteComposition;
  addProfilePhoto: typeof addProfilePhoto;
  deleteProfilePhoto: typeof deleteProfilePhoto;
  addComposition: typeof addComposition;
  isLoading: boolean;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const wardrobeItems = useLiveQuery(() => getWardrobeItems());
  const profilePhotos = useLiveQuery(() => getProfilePhotos());
  const compositions = useLiveQuery(() => getCompositions());
  
  const isLoading = 
    wardrobeItems === undefined || 
    profilePhotos === undefined || 
    compositions === undefined;

  const value = {
    wardrobeItems,
    profilePhotos,
    compositions,
    addWardrobeItem,
    updateWardrobeItem,
    deleteWardrobeItem,
    deleteComposition,
    addProfilePhoto,
    deleteProfilePhoto,
    addComposition,
    isLoading
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}