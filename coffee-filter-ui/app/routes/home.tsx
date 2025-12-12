import { Coffee } from "lucide-react";
import type { Route } from "./+types/home";
import { CoffeeShopMap } from "../components/CoffeeShopMap";
import type { CoffeeShop } from "../lib/types";
import { getCoffeeShops, deleteCoffeeShop, updateCoffeeShop } from "../lib/api";
import { useEffect, useState } from "react";
import { CoffeeShopDetailPanel } from "../components/CoffeeShopDetailPanel";
import { AddCoffeeShopDialog } from "../components/AddCoffeeShopDialog";
import { EditCoffeeShopDialog } from "../components/EditCoffeeShopDialog";
import { LoginDialog } from "../components/LoginDialog";
import { useAuth } from "../lib/AuthContext";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "FilterCoffee" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const { isAdmin } = useAuth();
  const [selectedShop, setSelectedShop] = useState<CoffeeShop | null>(null);
  const [coffeeShops, setCoffeeShops] = useState<CoffeeShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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
    // Convert form data to proper format (latitude/longitude will be geocoded by backend)
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
      weeklyHours: data.weeklyHours || {},
      pourOver: data.pourOver || false,
      website: data.website || undefined,
      instagram: data.instagram || undefined,
    };

    const { createCoffeeShop } = await import("../lib/api");
    await createCoffeeShop(shopData as Omit<CoffeeShop, "id">);
    // Refresh the list
    await fetchCoffeeShops();
  };

  const handleDeleteCoffeeShop = async (id: number) => {
    try {
      await deleteCoffeeShop(id);
      setSelectedShop(null);
      await fetchCoffeeShops();
    } catch (err) {
      console.error("Error deleting coffee shop:", err);
      alert(
        err instanceof Error ? err.message : "Failed to delete coffee shop"
      );
      throw err;
    }
  };

  const handleUpdateCoffeeShop = async (
    id: number,
    data: Partial<CoffeeShop>
  ) => {
    try {
      const updatedShop = await updateCoffeeShop(id, data);
      setSelectedShop(updatedShop);
      await fetchCoffeeShops();
    } catch (err) {
      console.error("Error updating coffee shop:", err);
      alert(
        err instanceof Error ? err.message : "Failed to update coffee shop"
      );
      throw err;
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
          {isAdmin && <AddCoffeeShopDialog onAdd={handleAddCoffeeShop} />}
          <LoginDialog />
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
          <>
            <CoffeeShopDetailPanel
              shop={selectedShop}
              onClose={() => setSelectedShop(null)}
              onDelete={isAdmin ? handleDeleteCoffeeShop : undefined}
              onEdit={isAdmin ? () => setIsEditDialogOpen(true) : undefined}
            />
            {isAdmin && (
              <EditCoffeeShopDialog
                shop={selectedShop}
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                onSave={handleUpdateCoffeeShop}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
