import { useEffect, useState } from "react";
import type { CoffeeShop } from "../lib/types";

interface CoffeeShopMapProps {
  coffeeShops: CoffeeShop[];
  selectedShopId: number;
  onMarkerClick: (shop: CoffeeShop) => void;
}

// Client-only map component to avoid SSR issues with Leaflet
export function CoffeeShopMap({
  coffeeShops,
  selectedShopId,
  onMarkerClick,
}: CoffeeShopMapProps) {
  const [MapComponent, setMapComponent] =
    useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    // Dynamically import Leaflet only on the client
    const loadMap = async () => {
      const [
        { MapContainer, TileLayer, Marker, Popup },
        L,
        { renderToStaticMarkup },
        { Coffee },
      ] = await Promise.all([
        import("react-leaflet"),
        import("leaflet"),
        import("react-dom/server"),
        import("lucide-react"),
      ]);

      // Import CSS
      await import("leaflet/dist/leaflet.css");

      const createCoffeeIcon = (isSelected: boolean) => {
        const iconMarkup = renderToStaticMarkup(
          <div
            style={{
              background: isSelected ? "#d97706" : "#c2410c",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid white",
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            <Coffee size={16} color="white" />
          </div>
        );
        return L.default.divIcon({
          html: iconMarkup,
          className: "coffee-icon",
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });
      };

      // Create the actual map component
      const LeafletMap = () => {
        const center: [number, number] =
          coffeeShops.length > 0
            ? [coffeeShops[0].latitude, coffeeShops[0].longitude]
            : [39.0997, -94.5786];
        const zoom = 12;

        return (
          <MapContainer
            center={center}
            zoom={zoom}
            className="h-full w-full"
            scrollWheelZoom={true}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            {coffeeShops.map((shop) => (
              <Marker
                key={shop.id}
                position={[shop.latitude, shop.longitude]}
                icon={createCoffeeIcon(shop.id === selectedShopId)}
                eventHandlers={{
                  click: () => {
                    onMarkerClick?.(shop);
                  },
                }}
              >
                <Popup>
                  <div>
                    <h2 className="text-md font-semibold">{shop?.name}</h2>
                    <p>{shop.address}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        );
      };

      setMapComponent(() => LeafletMap);
    };

    loadMap();
  }, [coffeeShops, selectedShopId, onMarkerClick]);

  if (!MapComponent) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  return <MapComponent />;
}
