import { useEffect, useState } from "react";
import type { CoffeeShop } from "../lib/types";

interface CoffeeShopMapProps {
  coffeeShops: CoffeeShop[];
  selectedShopId: number;
  onMarkerClick: (shop: CoffeeShop) => void;
}

export function CoffeeShopMap({
  coffeeShops,
  selectedShopId,
  onMarkerClick,
}: CoffeeShopMapProps) {
  const [MapComponent, setMapComponent] = useState<React.ComponentType<{
    coffeeShops: CoffeeShop[];
    selectedShopId: number;
    onMarkerClick: (shop: CoffeeShop) => void;
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
    />
  );
}
