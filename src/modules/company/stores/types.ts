export interface Store {
  id: string;
  name: string;
  number: string;
  latitude: number | null;
  longitude: number | null;
  location: string;
  address: string;
  active: boolean;
}
export interface StoreInput {
  name: string;
  number: string;
  latitude: string;
  longitude: string;
  address: string;
  active: boolean;
}
export interface StoreLocationOption { value: string; label: string }
