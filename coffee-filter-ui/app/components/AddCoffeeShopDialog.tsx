import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { AddressAutocomplete } from "./AddressAutocomplete";
import { WeeklyHoursInput, type WeeklyHours } from "./WeeklyHoursInput";

interface InitialShopData {
  name?: string;
  description?: string;
  machine?: string;
  website?: string;
  instagram?: string;
  image?: string;
  accessibility?: boolean;
  hasWifi?: boolean;
  pourOver?: boolean;
  weeklyHours?: WeeklyHours;
}

interface AddCoffeeShopDialogProps {
  onAdd?: (data: any) => Promise<void>;
  /** Pre-fill form with data (useful for "Add Another Location") */
  initialData?: InitialShopData;
  /** Controlled open state */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Hide the trigger button (for controlled mode) */
  hideTrigger?: boolean;
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

const getInitialFormData = (initialData?: InitialShopData) => ({
  name: initialData?.name || "",
  address: "",
  latitude: "",
  longitude: "",
  image: initialData?.image || "",
  machine: initialData?.machine || "",
  accessibility: initialData?.accessibility || false,
  hasWifi: initialData?.hasWifi || false,
  description: initialData?.description || "",
  weeklyHours: initialData?.weeklyHours || ({} as WeeklyHours),
  website: initialData?.website || "",
  instagram: initialData?.instagram || "",
  pourOver: initialData?.pourOver || false,
});

export function AddCoffeeShopDialog({
  onAdd,
  initialData,
  open: controlledOpen,
  onOpenChange,
  hideTrigger = false,
}: AddCoffeeShopDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  // Support both controlled and uncontrolled modes
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (value: boolean) => {
    if (!isControlled) {
      setInternalOpen(value);
    }
    onOpenChange?.(value);
  };

  const [formData, setFormData] = useState(() =>
    getInitialFormData(initialData)
  );
  const [useManualCoords, setUseManualCoords] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const latitudeInputRef = useRef<HTMLInputElement>(null);

  // Reset form when dialog opens with new initialData
  useEffect(() => {
    if (open) {
      setFormData(getInitialFormData(initialData));
      setUseManualCoords(false);
      setError(null);
    }
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Include coordinates if manually entered
    const submitData = {
      ...formData,
      latitude:
        useManualCoords && formData.latitude
          ? parseFloat(formData.latitude)
          : undefined,
      longitude:
        useManualCoords && formData.longitude
          ? parseFloat(formData.longitude)
          : undefined,
      instagram: formatInstagramUrl(formData.instagram),
    };

    try {
      await onAdd?.(submitData);
      // Only close and reset form on success
      setOpen(false);
      setFormData({
        name: "",
        address: "",
        latitude: "",
        longitude: "",
        image: "",
        machine: "",
        accessibility: false,
        hasWifi: false,
        description: "",
        weeklyHours: {},
        website: "",
        instagram: "",
        pourOver: false,
      });
      setUseManualCoords(false);
    } catch (err) {
      // Keep dialog open and show error
      setError(
        err instanceof Error ? err.message : "Failed to add coffee shop"
      );
      // Enable manual coords and focus latitude input for geocoding errors
      setUseManualCoords(true);
      // Use setTimeout to wait for the input to render before focusing
      setTimeout(() => {
        latitudeInputRef.current?.focus();
      }, 0);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAddingLocation = !!initialData?.name;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!hideTrigger && (
        <DialogTrigger asChild>
          <Button data-testid="button-add-shop" variant="secondary">
            <Plus className="h-4 w-4 mr-2" />
            Add Coffee Shop
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isAddingLocation
              ? `Add Location for ${initialData.name}`
              : "Add New Coffee Shop"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                data-testid="input-shop-name"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="address">Address *</Label>
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
                data-testid="input-shop-address"
              />
              <p className="text-xs text-muted-foreground">
                {formData.latitude && formData.longitude
                  ? "✓ Coordinates auto-filled from selected address"
                  : useManualCoords
                    ? "Using manually entered coordinates"
                    : "Select an address from suggestions or enter coordinates manually"}
              </p>
            </div>

            <div className="flex items-center space-x-2 col-span-2">
              <Switch
                id="manualCoords"
                checked={useManualCoords}
                onCheckedChange={setUseManualCoords}
                data-testid="switch-manual-coords"
              />
              <Label htmlFor="manualCoords" className="cursor-pointer">
                Enter coordinates manually
              </Label>
            </div>

            {useManualCoords && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude *</Label>
                  <Input
                    ref={latitudeInputRef}
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) =>
                      setFormData({ ...formData, latitude: e.target.value })
                    }
                    required={useManualCoords}
                    placeholder="e.g., 39.0558"
                    data-testid="input-latitude"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude *</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) =>
                      setFormData({ ...formData, longitude: e.target.value })
                    }
                    required={useManualCoords}
                    placeholder="e.g., -94.5734"
                    data-testid="input-longitude"
                  />
                </div>
              </>
            )}

            <div className="flex flex-col gap-2">
              <div className="space-y-2 ">
                <Label htmlFor="machine"> Espresso Machine</Label>
                <Input
                  id="machine"
                  value={formData.machine}
                  onChange={(e) =>
                    setFormData({ ...formData, machine: e.target.value })
                  }
                  placeholder="e.g., La Marzocco"
                  data-testid="input-machine"
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="pourOver">Pour Over</Label>
                <Switch
                  id="pourOver"
                  checked={formData.pourOver}
                  onCheckedChange={(checked: boolean) =>
                    setFormData({ ...formData, pourOver: checked })
                  }
                  data-testid="switch-pour-over"
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="accessibility">Accessibility</Label>
                <Switch
                  id="accessibility"
                  checked={formData.accessibility}
                  onCheckedChange={(checked: boolean) =>
                    setFormData({ ...formData, accessibility: checked })
                  }
                  data-testid="switch-accessibility"
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="wifi" className="flex-1">
                  WiFi Available
                </Label>
                <Switch
                  id="wifi"
                  checked={formData.hasWifi}
                  onCheckedChange={(checked: boolean) =>
                    setFormData({ ...formData, hasWifi: checked })
                  }
                  data-testid="switch-wifi"
                />
              </div>
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
              <Label htmlFor="website">Website (optional)</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                placeholder="https://example.com"
                data-testid="input-website"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram (optional)</Label>
              <Input
                id="instagram"
                value={formData.instagram}
                onChange={(e) =>
                  setFormData({ ...formData, instagram: e.target.value })
                }
                placeholder="@username"
                data-testid="input-instagram"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Tell us about this coffee shop..."
                rows={3}
                data-testid="input-description"
                required
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="image">Image URL (optional)</Label>
              <Input
                id="image"
                type="url"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                placeholder="https://example.com/image.jpg"
                data-testid="input-image"
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
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              data-testid="button-submit"
            >
              {isSubmitting ? "Adding..." : "Add Coffee Shop"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
