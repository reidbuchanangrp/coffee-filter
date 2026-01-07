import { Coffee } from "lucide-react";
import type { Route } from "./+types/home";
import { CoffeeShopMap } from "../components/CoffeeShopMap";
import type { CoffeeShop } from "../lib/types";
import { getCoffeeShops, deleteCoffeeShop, updateCoffeeShop } from "../lib/api";
import { useEffect, useState, useCallback } from "react";
import { CoffeeShopDetailPanel } from "../components/CoffeeShopDetailPanel";
import { AddCoffeeShopDialog } from "../components/AddCoffeeShopDialog";
import { EditCoffeeShopDialog } from "../components/EditCoffeeShopDialog";
import { useAuth } from "../lib/AuthContext";
import { HamburgerMenu } from "../components/HamburgerMenu";
import { LocationSearch } from "../components/LocationSearch";
import { CFLogo } from "../components/CFLogo";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { isCurrentlyOpen } from "~/components/WeeklyHoursInput";
import { useSearchParams } from "react-router";

// Create URL-friendly slug from shop name and ID (ID ensures uniqueness)
function createSlug(id: number, name: string): string {
  const nameSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${id}-${nameSlug}`;
}

// Extract shop ID from slug (format: "123-shop-name")
function getIdFromSlug(slug: string): number | null {
  const match = slug.match(/^(\d+)-/);
  return match ? parseInt(match[1], 10) : null;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "CoffeeFilter - Find Great Coffee Shops Near You" },
    {
      name: "description",
      content:
        "Discover local coffee shops with pour-over, WiFi, accessibility info, and hours. Find your perfect spot for great coffee.",
    },
    { property: "og:title", content: "CoffeeFilter - Find Great Coffee Shops" },
    {
      property: "og:description",
      content:
        "Discover local coffee shops with detailed info on amenities, hours, and more.",
    },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
    {
      name: "twitter:title",
      content: "CoffeeFilter - Find Great Coffee Shops",
    },
    {
      name: "twitter:description",
      content:
        "Discover local coffee shops with pour-over, WiFi, accessibility info, and hours.",
    },
  ];
}

export default function Home() {
  const { isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedShop, setSelectedShop] = useState<CoffeeShop | null>(null);
  const [coffeeShops, setCoffeeShops] = useState<CoffeeShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddLocationDialogOpen, setIsAddLocationDialogOpen] = useState(false);
  const [addLocationInitialData, setAddLocationInitialData] = useState<
    Partial<CoffeeShop> | undefined
  >(undefined);
  const [searchCenter, setSearchCenter] = useState<[number, number] | null>(
    null
  );

  // Update URL when shop is selected
  const handleSelectShop = useCallback(
    (shop: CoffeeShop | null) => {
      setSelectedShop(shop);
      if (shop) {
        const slug = createSlug(shop.id, shop.name);
        setSearchParams({ shop: slug });
      } else {
        setSearchParams({});
      }
    },
    [setSearchParams]
  );

  // Handle browser back/forward navigation via search params
  useEffect(() => {
    const slug = searchParams.get("shop");
    if (slug && coffeeShops.length > 0) {
      const shopId = getIdFromSlug(slug);
      const shop = shopId !== null 
        ? coffeeShops.find((s) => s.id === shopId)
        : null;
      setSelectedShop(shop || null);
    } else if (!slug) {
      setSelectedShop(null);
    }
  }, [searchParams, coffeeShops]);

  const fetchCoffeeShops = async () => {
    try {
      setLoading(true);
      setError(null);
      const shops = await getCoffeeShops();
      setCoffeeShops(shops);

      // Restore shop from URL after loading
      const slug = searchParams.get("shop");
      if (slug) {
        const shopId = getIdFromSlug(slug);
        const shop = shopId !== null 
          ? shops.find((s) => s.id === shopId)
          : null;
        if (shop) {
          setSelectedShop(shop);
        }
      }
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
    // Convert form data to proper format
    // If latitude/longitude are provided (manually entered), use them; otherwise backend will geocode
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
      starred: data.starred || false,
      // Pass through manually entered coordinates if provided
      latitude: data.latitude,
      longitude: data.longitude,
    };

    const { createCoffeeShop } = await import("../lib/api");
    await createCoffeeShop(shopData as Omit<CoffeeShop, "id">);
    // Refresh the list
    await fetchCoffeeShops();
  };

  const handleDeleteCoffeeShop = async (id: number) => {
    try {
      await deleteCoffeeShop(id);
      handleSelectShop(null);
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

  const handleAddLocation = (shop: CoffeeShop) => {
    // Pre-fill with shared brand info, but clear location-specific data
    setAddLocationInitialData({
      name: shop.name,
      description: shop.description,
      machine: shop.machine,
      website: shop.website,
      instagram: shop.instagram,
      image: shop.image,
      accessibility: shop.accessibility,
      hasWifi: shop.hasWifi,
      pourOver: shop.pourOver,
      weeklyHours: shop.weeklyHours,
    });
    setIsAddLocationDialogOpen(true);
  };

  const filterShopsByOpen = (shops: CoffeeShop[]) => {
    return shops.filter((shop) => isCurrentlyOpen(shop.weeklyHours || {}));
  };

  return (
    <div className="h-screen flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b bg-primary gap-2">
        <div className="flex items-center gap-2">
          <HamburgerMenu />
          {/* Mobile: CF logo */}
          <CFLogo className="sm:hidden" size={32} />
          {/* Desktop: Coffee icon + text */}
          <Coffee className="h-6 w-6 text-primary hidden sm:block" />
          <h1 className="text-xl font-semibold font-serif hidden sm:block">
            CoffeeFilter
          </h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Label
            htmlFor="isOpen"
            className="cursor-pointer font-bold font-serif"
          >
            <span className="sm:hidden">Open</span>
            <span className="hidden sm:inline">Show only open cafes</span>
          </Label>
          <Switch
            id="isOpen"
            checked={isOpen}
            onCheckedChange={setIsOpen}
            data-testid="switch-is-open"
            isOpen={true}
          />

          <LocationSearch
            onLocationSelect={(lat, lng) => setSearchCenter([lat, lng])}
          />
          {isAdmin && <AddCoffeeShopDialog onAdd={handleAddCoffeeShop} />}
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
          coffeeShops={isOpen ? filterShopsByOpen(coffeeShops) : coffeeShops}
          selectedShopId={selectedShop?.id ?? 0}
          onMarkerClick={handleSelectShop}
          searchCenter={searchCenter}
        />
        {selectedShop && (
          <>
            <CoffeeShopDetailPanel
              shop={selectedShop}
              onClose={() => handleSelectShop(null)}
              onDelete={isAdmin ? handleDeleteCoffeeShop : undefined}
              onEdit={isAdmin ? () => setIsEditDialogOpen(true) : undefined}
              onAddLocation={
                isAdmin ? () => handleAddLocation(selectedShop) : undefined
              }
            />
            {isAdmin && (
              <>
                <EditCoffeeShopDialog
                  shop={selectedShop}
                  open={isEditDialogOpen}
                  onOpenChange={setIsEditDialogOpen}
                  onSave={handleUpdateCoffeeShop}
                />
                <AddCoffeeShopDialog
                  onAdd={handleAddCoffeeShop}
                  initialData={addLocationInitialData}
                  open={isAddLocationDialogOpen}
                  onOpenChange={setIsAddLocationDialogOpen}
                  hideTrigger
                />
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
