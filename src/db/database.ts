import Dexie, { Table } from 'dexie';

// Define interfaces for our database tables
export interface WardrobeItem {
  id?: number;
  name: string;
  category: string;
  description?: string;
  originalImage: string; // Base64 encoded image data
  packshotImage?: string; // Base64 encoded packshot image data
  tokensUsed: number; // Track tokens used for this item
  createdAt: Date;
}

export interface ProfilePhoto {
  id?: number;
  type: 'face' | 'torso' | 'full-body';
  image: string; // Base64 encoded image data
  createdAt: Date;
}

export interface Composition {
  id?: number;
  name: string;
  profilePhotoId: number;
  wardrobeItemId: number;
  resultImage: string; // Base64 encoded image data or URL
  createdAt: Date;
}

// Define our database class
class AppDatabase extends Dexie {
  wardrobeItems!: Table<WardrobeItem, number>;
  profilePhotos!: Table<ProfilePhoto, number>;
  compositions!: Table<Composition, number>;

  constructor() {
    super('AIVirtualTryOnDB');
    
    this.version(1).stores({
      wardrobeItems: '++id, category, createdAt',
      profilePhotos: '++id, type, createdAt',
      compositions: '++id, profilePhotoId, wardrobeItemId, createdAt'
    });
  }
}

// Create a singleton instance of the database
export const db = new AppDatabase();

// Export some helper functions
export async function addWardrobeItem(item: Omit<WardrobeItem, 'id' | 'createdAt'>): Promise<number> {
  return await db.wardrobeItems.add({
    ...item,
    tokensUsed: 1, // Initial token cost for first generation
    createdAt: new Date()
  });
}

export async function updateWardrobeItem(id: number, updates: Partial<WardrobeItem>): Promise<number> {
  return await db.wardrobeItems.update(id, updates);
}

export async function deleteWardrobeItem(id: number): Promise<void> {
  await db.wardrobeItems.delete(id);
}

export async function getWardrobeItems(): Promise<WardrobeItem[]> {
  return await db.wardrobeItems.orderBy('createdAt').reverse().toArray();
}

export async function addProfilePhoto(photo: Omit<ProfilePhoto, 'id' | 'createdAt'>): Promise<number> {
  return await db.profilePhotos.add({
    ...photo,
    createdAt: new Date()
  });
}

export async function getProfilePhotos(): Promise<ProfilePhoto[]> {
  return await db.profilePhotos.orderBy('createdAt').reverse().toArray();
}

export async function deleteProfilePhoto(id: number): Promise<void> {
  await db.profilePhotos.delete(id);
}

export async function addComposition(composition: Omit<Composition, 'id' | 'createdAt'>): Promise<number> {
  return await db.compositions.add({
    ...composition,
    createdAt: new Date()
  });
}

export async function getCompositions(): Promise<Composition[]> {
  return await db.compositions.orderBy('createdAt').reverse().toArray();
}

export async function deleteComposition(id: number): Promise<void> {
  await db.compositions.delete(id);
}