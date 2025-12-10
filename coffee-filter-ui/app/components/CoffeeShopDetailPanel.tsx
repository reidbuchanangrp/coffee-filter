import {
  X,
  Wifi,
  Zap,
  Users,
  Coffee,
  Cog,
  Clock,
  MapPin,
  Globe,
  Calendar,
  Accessibility,
  Check,
} from "lucide-react";
import { SiInstagram } from "react-icons/si";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import type { CoffeeShop } from "../lib/types";

interface CoffeeShopDetailPanelProps {
  shop: CoffeeShop;
  onClose: () => void;
}

export function CoffeeShopDetailPanel({
  shop,
  onClose,
}: CoffeeShopDetailPanelProps) {
  return (
    <div
      className="fixed top-0 right-0 h-full w-full md:w-[440px] bg-background border-l shadow-xl z-1000 overflow-y-auto"
      data-testid="panel-shop-detail"
    >
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b p-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Coffee Shop Details</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          data-testid="button-close-panel"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <div className="flex items-start justify-between gap-3 mb-2">
            <h1
              className="text-2xl font-semibold font-serif"
              data-testid="text-shop-name"
            >
              {shop.name}
            </h1>
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
                {shop.machine}
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
              <p className="text-sm text-muted-foreground ">
                {shop.accessibility ? (
                  <span className="flex items-center gap-2">
                    {" "}
                    <Check className="h-4 w-4 text-primary" /> Wheelchair ramp
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
          <div className="flex items-center gap-2 text-sm font-medium mb-2">
            <Clock className="h-4 w-4 text-primary" />
            <span>Hours</span>
          </div>
          <p className="text-sm text-muted-foreground pl-6">{shop.hours}</p>
        </div>

        <div>
          <div className="flex items-center gap-2 text-sm font-medium mb-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span>Days Open</span>
          </div>
          <div className="flex flex-wrap gap-2 pl-6">
            {[...shop.daysOpen]
              .sort((a, b) => {
                const dayOrder = [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ];
                return dayOrder.indexOf(a) - dayOrder.indexOf(b);
              })
              .map((day) => (
                <Badge key={day} variant="secondary" className="text-xs">
                  {day.slice(0, 3)}
                </Badge>
              ))}
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
                    href={shop.website}
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
                    href={shop.instagram}
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

        <div className="flex gap-3">
          <Button className="flex-1" data-testid="button-get-directions">
            <MapPin className="h-4 w-4 mr-2" />
            Get Directions
          </Button>
        </div>
      </div>
    </div>
  );
}
