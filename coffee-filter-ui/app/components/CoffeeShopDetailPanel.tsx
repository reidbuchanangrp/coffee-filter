import {
  X,
  Wifi,
  Coffee,
  Cog,
  Clock,
  MapPin,
  Globe,
  Accessibility,
  Check,
  Trash2,
  Pencil,
  Copy,
  Star,
} from "lucide-react";
import { useState, useMemo } from "react";
import { SiInstagram } from "react-icons/si";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import type { CoffeeShop } from "../lib/types";
import { isCurrentlyOpen } from "./WeeklyHoursInput";

interface CoffeeShopDetailPanelProps {
  shop: CoffeeShop;
  onClose: () => void;
  onDelete?: (id: number) => void;
  onEdit?: () => void;
  onAddLocation?: () => void;
}

// Ensure URL has protocol prefix
function ensureHttps(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `https://${url}`;
}

export function CoffeeShopDetailPanel({
  shop,
  onClose,
  onDelete,
  onEdit,
  onAddLocation,
}: CoffeeShopDetailPanelProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOpen = useMemo(
    () => isCurrentlyOpen(shop.weeklyHours || {}),
    [shop.weeklyHours]
  );

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete?.(shop.id);
      onClose();
    } catch (error) {
      console.error("Failed to delete shop:", error);
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed top-0 right-0 h-full w-full md:w-[440px] bg-background border-l shadow-xl z-1000 overflow-y-auto"
      data-testid="panel-shop-detail"
    >
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b p-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Coffee Shop Details</h2>
        {shop.starred && (
          <Badge
            variant="default"
            className="bg-yellow-500 hover:bg-yellow-500 animate-pulse"
          >
            <Star className="h-4 w-4" />
            Featured Shop
          </Badge>
        )}
        <div className="flex items-center gap-1">
          {onAddLocation && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onAddLocation}
              title="Add another location"
              data-testid="button-add-location"
            >
              <Copy className="h-4 w-4" />
            </Button>
          )}
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              data-testid="button-edit-shop"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            data-testid="button-close-panel"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <div className="flex items-center justify-between gap-3 mb-2">
            <h1
              className="text-2xl font-semibold font-serif"
              data-testid="text-shop-name"
            >
              {shop.name}
            </h1>
            <Badge
              variant={isOpen ? "default" : "secondary"}
              className={`shrink-0 ${
                isOpen
                  ? "bg-green-500 hover:bg-green-500 animate-pulse"
                  : "bg-muted text-muted-foreground"
              }`}
              data-testid="badge-open-status"
            >
              {isOpen ? "Open" : "Closed"}
            </Badge>
          </div>
          <p className="text-muted-foreground flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
            <span data-testid="text-shop-address">{shop.address}</span>
          </p>
        </div>

        <Card className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <Cog className="h-4 w-4 text-primary" />
                <span className="font-medium">Espresso Machine</span>
              </div>
              <p className="text-sm text-muted-foreground pl-6">
                {shop.machine ? shop.machine : "Unknown"}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <Coffee className="h-4 w-4 text-primary" />
                <span className="font-medium">Pour Over</span>
              </div>
              <p className="text-sm text-muted-foreground pl-6">
                {shop.pourOver ? "Available" : "Not available"}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <Wifi
                  className={`h-4 w-4 ${shop.accessibility ? "text-primary" : "text-muted-foreground"}`}
                />
                <span className="font-medium">WiFi</span>
              </div>
              <p className="text-sm text-muted-foreground pl-6">
                {shop.hasWifi ? "Available" : "Not available"}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <Accessibility
                  className={`h-4 w-4 ${shop.accessibility ? "text-primary" : "text-muted-foreground"}`}
                />
                <span className="font-medium">Accessibility</span>
              </div>
              <p
                className={`text-sm text-muted-foreground ${shop.accessibility ? "" : "pl-6"}`}
              >
                {shop.accessibility ? (
                  <span className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    Wheelchair
                  </span>
                ) : (
                  "Not available"
                )}
              </p>
            </div>
          </div>
        </Card>

        <div>
          <h3 className="font-semibold mb-2">About</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {shop.description}
          </p>
        </div>

        <div>
          <div className="flex items-center gap-2 text-sm font-medium mb-3">
            <Clock className="h-4 w-4 text-primary" />
            <span>Hours</span>
          </div>
          <div className="space-y-1 pl-6">
            {[
              "monday",
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
              "saturday",
              "sunday",
            ].map((day) => {
              const dayHours =
                shop.weeklyHours?.[day as keyof typeof shop.weeklyHours];
              const isToday =
                new Date()
                  .toLocaleDateString("en-US", { weekday: "long" })
                  .toLowerCase() === day;
              return (
                <div
                  key={day}
                  className={`flex justify-between text-sm ${
                    isToday
                      ? "font-medium text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  <span className="capitalize">{day.slice(0, 3)}</span>
                  <span>
                    {dayHours
                      ? `${dayHours.open} - ${dayHours.close}`
                      : "Closed"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {(shop.website || shop.instagram) && (
          <div>
            <div className="flex items-center gap-2 text-sm font-medium mb-3">
              <Globe className="h-4 w-4 text-primary" />
              <span>Links</span>
            </div>
            <div className="flex flex-wrap gap-2 pl-6">
              {shop.website && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  data-testid="link-website"
                >
                  <a
                    href={ensureHttps(shop.website)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Website
                  </a>
                </Button>
              )}
              {shop.instagram && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  data-testid="link-instagram"
                >
                  <a
                    href={ensureHttps(shop.instagram)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="mr-2 inline-flex">
                      <SiInstagram size={16} />
                    </span>
                    Instagram
                  </a>
                </Button>
              )}
            </div>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm font-medium mb-2">
          <img
            src={shop.image || ""}
            alt={shop.name}
            width={500}
            height={500}
            className="w-full h-full object-cover rounded-md"
          />
        </div>

        <div className="flex gap-3">
          <Button
            className="flex-1"
            asChild
            data-testid="button-get-directions"
          >
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${shop.latitude},${shop.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Get Directions
            </a>
          </Button>
        </div>

        {onDelete && (
          <div className="border-t pt-4 mt-4">
            {!showDeleteConfirm ? (
              <Button
                variant="outline"
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setShowDeleteConfirm(true)}
                data-testid="button-delete-shop"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Coffee Shop
              </Button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground text-center">
                  Are you sure you want to delete <strong>{shop.name}</strong>?
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    data-testid="button-cancel-delete"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    data-testid="button-confirm-delete"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
