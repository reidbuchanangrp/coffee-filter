import { useEffect, useState } from "react";
import type { CoffeeShop } from "../lib/types";

interface CoffeeShopMapProps {
  coffeeShops: CoffeeShop[];
  selectedShopId: number;
  onMarkerClick: (shop: CoffeeShop) => void;
  searchCenter?: [number, number] | null;
  isOpen?: boolean;
  initialView?: { lat: number; lng: number; zoom: number } | null;
  onViewChange?: (lat: number, lng: number, zoom: number) => void;
  selectedShopCenter?: [number, number];
}

export function CoffeeShopMap({
  coffeeShops,
  selectedShopId,
  onMarkerClick,
  searchCenter,
  isOpen,
  initialView,
  onViewChange,
  selectedShopCenter,
}: CoffeeShopMapProps) {
  const [MapComponent, setMapComponent] = useState<React.ComponentType<{
    coffeeShops: CoffeeShop[];
    selectedShopId: number;
    onMarkerClick: (shop: CoffeeShop) => void;
    searchCenter?: [number, number] | null;
    isOpen?: boolean;
    initialView?: { lat: number; lng: number; zoom: number } | null;
    onViewChange?: (lat: number, lng: number, zoom: number) => void;
    selectedShopCenter?: [number, number];
  }> | null>(null);

  useEffect(() => {
    // Dynamically import the map component only on the client
    import("../components/CoffeeShopMapClient").then((mod) => {
      setMapComponent(() => mod.CoffeeShopMapClient);
    });
  }, []);

  if (!MapComponent) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-muted">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  return (
    <MapComponent
      coffeeShops={coffeeShops}
      selectedShopId={selectedShopId}
      onMarkerClick={onMarkerClick}
      searchCenter={searchCenter}
      isOpen={isOpen}
      initialView={initialView}
      onViewChange={onViewChange}
      selectedShopCenter={selectedShopCenter}
    />
  );
}
