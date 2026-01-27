export interface DayHours {
  open: string;
  close: string;
}

export interface WeeklyHours {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
}

export interface CoffeeShop {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  image: string | null;
  accessibility: boolean;
  hasWifi: boolean;
  description: string;
  machine: string;
  weeklyHours: WeeklyHours;
  pourOver: boolean;
  website?: string | null;
  instagram?: string | null;
  starred: boolean;
}
