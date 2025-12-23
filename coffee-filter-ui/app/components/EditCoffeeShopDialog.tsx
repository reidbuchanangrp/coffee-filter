import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { AddressAutocomplete } from "./AddressAutocomplete";
import { WeeklyHoursInput, type WeeklyHours } from "./WeeklyHoursInput";
import type { CoffeeShop } from "../lib/types";

interface EditCoffeeShopDialogProps {
  shop: CoffeeShop;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: number, data: Partial<CoffeeShop>) => Promise<void>;
}

// Convert Instagram username to full URL
function formatInstagramUrl(input: string): string | undefined {
  if (!input) return undefined;
  // If it's already a full URL, return as-is
  if (input.startsWith("http://") || input.startsWith("https://")) {
    return input;
  }
  // Remove @ if present and create full URL
  const username = input.replace(/^@/, "").trim();
  return username ? `https://instagram.com/${username}` : undefined;
}

// Extract username from Instagram URL for display in form
function extractInstagramUsername(url: string): string {
  if (!url) return "";
  // If it's a full URL, extract username
  const match = url.match(/instagram\.com\/([^/?]+)/);
  if (match) {
    return `@${match[1]}`;
  }
  // If it already looks like a username, return as-is
  return url.startsWith("@") ? url : `@${url}`;
}

export function EditCoffeeShopDialog({
  shop,
  open,
  onOpenChange,
  onSave,
}: EditCoffeeShopDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    latitude: "",
    longitude: "",
    image: "",
    machine: "",
    accessibility: false,
    hasWifi: false,
    description: "",
    weeklyHours: {} as WeeklyHours,
    website: "",
    instagram: "",
    pourOver: false,
    starred: false,
  });
  const [useManualCoords, setUseManualCoords] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form data when shop changes or dialog opens
  useEffect(() => {
    if (open && shop) {
      setFormData({
        name: shop.name,
        address: shop.address,
        latitude: shop.latitude.toString(),
        longitude: shop.longitude.toString(),
        image: shop.image || "",
        machine: shop.machine || "",
        accessibility: shop.accessibility,
        hasWifi: shop.hasWifi,
        description: shop.description || "",
        weeklyHours: shop.weeklyHours || {},
        website: shop.website || "",
        instagram: extractInstagramUsername(shop.instagram || ""),
        pourOver: shop.pourOver,
        starred: shop.starred || false,
      });
      setUseManualCoords(false);
      setError(null);
    }
  }, [open, shop]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const updateData: Partial<CoffeeShop> = {
        name: formData.name,
        address: formData.address,
        image: formData.image || undefined,
        machine: formData.machine,
        accessibility: formData.accessibility,
        hasWifi: formData.hasWifi,
        description: formData.description,
        weeklyHours: formData.weeklyHours,
        website: formData.website || undefined,
        instagram: formatInstagramUrl(formData.instagram),
        pourOver: formData.pourOver,
        starred: formData.starred,
      };

      // Include coordinates if manually changed
      if (useManualCoords && formData.latitude && formData.longitude) {
        updateData.latitude = parseFloat(formData.latitude);
        updateData.longitude = parseFloat(formData.longitude);
      }

      await onSave(shop.id, updateData);
      onOpenChange(false);
    } catch (err) {
      console.error("Error saving coffee shop:", err);
      setError(
        err instanceof Error ? err.message : "Failed to save coffee shop"
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Coffee Shop</DialogTitle>
          <DialogDescription className="sr-only">
            Update the details of this coffee shop
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                data-testid="edit-input-shop-name"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-address">Address *</Label>
              <AddressAutocomplete
                value={formData.address}
                onChange={(address) => setFormData({ ...formData, address })}
                onSelect={(address, lat, lng) => {
                  setFormData({
                    ...formData,
                    address,
                    latitude: lat.toString(),
                    longitude: lng.toString(),
                  });
                  setUseManualCoords(true);
                }}
                required
                placeholder="Start typing an address..."
                data-testid="edit-input-shop-address"
              />
              <p className="text-xs text-muted-foreground">
                {useManualCoords
                  ? "✓ Address/coordinates updated"
                  : "Select a new address to update coordinates"}
              </p>
            </div>

            <div className="flex items-center space-x-2 col-span-2">
              <Switch
                id="edit-manualCoords"
                checked={useManualCoords}
                onCheckedChange={setUseManualCoords}
                data-testid="edit-switch-manual-coords"
              />
              <Label htmlFor="edit-manualCoords" className="cursor-pointer">
                Update coordinates manually
              </Label>
            </div>

            {useManualCoords && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="edit-latitude">Latitude *</Label>
                  <Input
                    id="edit-latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) =>
                      setFormData({ ...formData, latitude: e.target.value })
                    }
                    required={useManualCoords}
                    placeholder="e.g., 39.0558"
                    data-testid="edit-input-latitude"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-longitude">Longitude *</Label>
                  <Input
                    id="edit-longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) =>
                      setFormData({ ...formData, longitude: e.target.value })
                    }
                    required={useManualCoords}
                    placeholder="e.g., -94.5734"
                    data-testid="edit-input-longitude"
                  />
                </div>
              </>
            )}

            <div className="flex flex-col gap-2">
              <div className="space-y-2">
                <Label htmlFor="edit-machine">Espresso Machine</Label>
                <Input
                  id="edit-machine"
                  value={formData.machine}
                  onChange={(e) =>
                    setFormData({ ...formData, machine: e.target.value })
                  }
                  placeholder="e.g., La Marzocco"
                  data-testid="edit-input-machine"
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="edit-pourOver">Pour Over</Label>
                <Switch
                  id="edit-pourOver"
                  checked={formData.pourOver}
                  onCheckedChange={(checked: boolean) =>
                    setFormData({ ...formData, pourOver: checked })
                  }
                  data-testid="edit-switch-pour-over"
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="edit-accessibility">Accessibility</Label>
                <Switch
                  id="edit-accessibility"
                  checked={formData.accessibility}
                  onCheckedChange={(checked: boolean) =>
                    setFormData({ ...formData, accessibility: checked })
                  }
                  data-testid="edit-switch-accessibility"
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="edit-wifi" className="flex-1">
                  WiFi Available
                </Label>
                <Switch
                  id="edit-wifi"
                  checked={formData.hasWifi}
                  onCheckedChange={(checked: boolean) =>
                    setFormData({ ...formData, hasWifi: checked })
                  }
                  data-testid="edit-switch-wifi"
                />
              </div>
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="edit-starred" className="flex items-center gap-2">
                <span>⭐</span> Featured Shop
              </Label>
              <Switch
                id="edit-starred"
                checked={formData.starred}
                onCheckedChange={(checked: boolean) =>
                  setFormData({ ...formData, starred: checked })
                }
                data-testid="edit-switch-starred"
              />
            </div>

            <div className="col-span-2">
              <WeeklyHoursInput
                value={formData.weeklyHours}
                onChange={(weeklyHours) =>
                  setFormData({ ...formData, weeklyHours })
                }
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-website">Website (optional)</Label>
              <Input
                id="edit-website"
                type="url"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                placeholder="https://example.com"
                data-testid="edit-input-website"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-instagram">Instagram (optional)</Label>
              <Input
                id="edit-instagram"
                value={formData.instagram}
                onChange={(e) =>
                  setFormData({ ...formData, instagram: e.target.value })
                }
                placeholder="@username"
                data-testid="edit-input-instagram"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Tell us about this coffee shop..."
                rows={3}
                data-testid="edit-input-description"
                required
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-image">Image URL (optional)</Label>
              <Input
                id="edit-image"
                type="url"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                placeholder="https://example.com/image.jpg"
                data-testid="edit-input-image"
              />
              {formData.image && (
                <div className="mt-2">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="max-h-32 rounded-md object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                    onLoad={(e) => {
                      (e.target as HTMLImageElement).style.display = "block";
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
              data-testid="edit-button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              data-testid="edit-button-submit"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
