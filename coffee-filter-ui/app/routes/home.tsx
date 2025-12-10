import { Coffee } from "lucide-react";
import type { Route } from "./+types/home";
import { CoffeeShopMap } from "../components/CoffeeShopMap";
import type { CoffeeShop } from "../lib/types";
import { getCoffeeShops } from "../lib/api";
import { useEffect, useState } from "react";
import { CoffeeShopDetailPanel } from "../components/CoffeeShopDetailPanel";
import { AddCoffeeShopDialog } from "../components/AddCoffeeShopDialog";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const [selectedShop, setSelectedShop] = useState<CoffeeShop | null>(null);
  const [coffeeShops, setCoffeeShops] = useState<CoffeeShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCoffeeShops = async () => {
    try {
      setLoading(true);
      setError(null);
      const shops = await getCoffeeShops();
      setCoffeeShops(shops);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load coffee shops"
      );
      console.error("Error loading coffee shops:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoffeeShops();
  }, []);

  const handleAddCoffeeShop = async (data: any) => {
    try {
      // Convert form data to proper format
      // If latitude/longitude are provided, use them; otherwise backend will geocode
      const shopData: Omit<CoffeeShop, "id" | "latitude" | "longitude"> & {
        latitude?: number;
        longitude?: number;
      } = {
        name: data.name,
        address: data.address,
        image: data.image || "",
        accessibility: data.accessibility || false,
        hasWifi: data.hasWifi || false,
        description: data.description || "",
        machine: data.machine || "",
        hours: data.hours || "",
        daysOpen: data.daysOpen || [],
        pourOver: data.pourOver || false,
        website: data.website || undefined,
        instagram: data.instagram || undefined,
      };

      // Include manual coordinates if provided
      if (data.latitude !== undefined && !isNaN(data.latitude)) {
        shopData.latitude = data.latitude;
      }
      if (data.longitude !== undefined && !isNaN(data.longitude)) {
        shopData.longitude = data.longitude;
      }

      const { createCoffeeShop } = await import("../lib/api");
      await createCoffeeShop(shopData as Omit<CoffeeShop, "id">);
      // Refresh the list
      await fetchCoffeeShops();
    } catch (err) {
      console.error("Error adding coffee shop:", err);
      alert(err instanceof Error ? err.message : "Failed to add coffee shop");
    }
  };
  return (
    <div className="h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-3 border-b bg-primary">
        <div className="flex items-center gap-2">
          <Coffee className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold font-serif">FilterCoffee</h1>
        </div>
        <div className="flex items-center gap-3">
          <AddCoffeeShopDialog onAdd={handleAddCoffeeShop} />
          {/* <ThemeToggle /> */}
        </div>
      </header>
      <main className="flex-1 relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-50">
            <p className="text-muted-foreground">Loading coffee shops...</p>
          </div>
        )}
        {error && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-destructive text-destructive-foreground px-4 py-2 rounded-md z-50">
            <p>{error}</p>
          </div>
        )}
        <CoffeeShopMap
          coffeeShops={coffeeShops}
          selectedShopId={selectedShop?.id ?? 0}
          onMarkerClick={setSelectedShop}
        />
        {selectedShop && (
          <CoffeeShopDetailPanel
            shop={selectedShop}
            onClose={() => setSelectedShop(null)}
          />
        )}
      </main>
    </div>
  );
}
