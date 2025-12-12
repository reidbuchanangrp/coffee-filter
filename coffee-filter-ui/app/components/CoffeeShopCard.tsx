import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "../components/ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import type { CoffeeShop } from "../lib/types";
import { Wifi, Zap, Users, MapPin } from "lucide-react";

interface CoffeeShopCardProps {
  shop: CoffeeShop;
  onViewDetails?: () => void;
}

export function CoffeeShopCard({ shop, onViewDetails }: CoffeeShopCardProps) {
  return (
    <Card
      className="overflow-hidden hover-elevate"
      data-testid={`card-shop-${shop.id}`}
    >
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={shop.image}
          alt={shop.name}
          className="h-full w-full object-cover"
        />
      </div>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3
              className="font-semibold text-lg truncate"
              data-testid={`text-shop-name-${shop.id}`}
            >
              {shop.name}
            </h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{shop.address}</span>
            </p>
          </div>
          {/* <Badge variant="secondary" className="shrink-0">
            {shop.hours}
          </Badge> */}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pb-3">
        <div className="flex flex-wrap gap-2">
          {/* <Badge variant="outline" className="text-xs">
            {shop.daysOpen.join(", ")}
          </Badge> */}
          <Badge variant="outline" className="text-xs">
            {shop.description}
          </Badge>
        </div>
        <div className="flex gap-3 text-xs text-muted-foreground">
          <div
            className="flex items-center gap-1"
            data-testid={`icon-wifi-${shop.id}`}
          >
            <Wifi
              className={`h-3 w-3 ${shop.hasWifi ? "text-primary" : "opacity-30"}`}
            />
            <span>WiFi</span>
          </div>
          <div
            className="flex items-center gap-1"
            data-testid={`icon-power-${shop.id}`}
          >
            <Zap
              className={`h-3 w-3 ${shop.accessibility ? "text-primary" : "opacity-30"}`}
            />
            <span>Power</span>
          </div>
          <div
            className="flex items-center gap-1"
            data-testid={`icon-seating-${shop.id}`}
          >
            <Users className="h-3 w-3" />
            <span>{shop.description}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          className="w-full"
          onClick={onViewDetails}
          data-testid={`button-view-details-${shop.id}`}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
