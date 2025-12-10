export interface CoffeeShop {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  image: string;
  accessibility: boolean;
  hasWifi: boolean;
  description: string;
  machine: string;
  hours: string;
  daysOpen: string[];
  pourOver: boolean;
  website?: string;
  instagram?: string;
}
