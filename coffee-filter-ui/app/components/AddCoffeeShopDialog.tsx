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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { useState } from "react";

interface AddCoffeeShopDialogProps {
  onAdd?: (data: any) => void;
}

export function AddCoffeeShopDialog({ onAdd }: AddCoffeeShopDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    latitude: "",
    longitude: "",
    machine: "",
    accessibility: false,
    hasWifi: false,
    description: "",
    hours: "",
    daysOpen: [] as string[],
    website: "",
    instagram: "",
    pourOver: false,
  });
  const [useManualCoords, setUseManualCoords] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Include coordinates if manually entered
    const submitData = {
      ...formData,
      latitude: useManualCoords && formData.latitude ? parseFloat(formData.latitude) : undefined,
      longitude: useManualCoords && formData.longitude ? parseFloat(formData.longitude) : undefined,
    };
    onAdd?.(submitData);
    setOpen(false);
    setFormData({
      name: "",
      address: "",
      latitude: "",
      longitude: "",
      machine: "",
      accessibility: false,
      hasWifi: false,
      description: "",
      hours: "",
      daysOpen: [],
      website: "",
      instagram: "",
      pourOver: false,
    });
    setUseManualCoords(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-add-shop" variant="secondary">
          <Plus className="h-4 w-4 mr-2" />
          Add Coffee Shop
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Coffee Shop</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
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
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                required
                placeholder="e.g., 4141 Troost Ave, Kansas City, MO 64110"
                data-testid="input-shop-address"
              />
              <p className="text-xs text-muted-foreground">
                {useManualCoords 
                  ? "Using manually entered coordinates" 
                  : "Coordinates will be automatically determined from the address"}
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

            <div className="space-y-2 col-span-2">
              <Label htmlFor="hours">Hours</Label>
              <Input
                id="hours"
                value={formData.hours}
                onChange={(e) =>
                  setFormData({ ...formData, hours: e.target.value })
                }
                placeholder="e.g., 7am - 6pm daily"
                data-testid="input-hours"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Days Open</Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={day}
                      checked={formData.daysOpen.includes(day)}
                      onCheckedChange={(checked: boolean) => {
                        const newDays = checked
                          ? [...formData.daysOpen, day]
                          : formData.daysOpen.filter((d) => d !== day);
                        setFormData({ ...formData, daysOpen: newDays });
                      }}
                      data-testid={`checkbox-${day.toLowerCase()}`}
                    />
                    <Label
                      htmlFor={day}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {day}
                    </Label>
                  </div>
                ))}
              </div>
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
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button type="submit" data-testid="button-submit">
              Add Coffee Shop
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
