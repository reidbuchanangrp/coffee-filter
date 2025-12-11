import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { CoffeeShop } from "../lib/types";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { Coffee } from "lucide-react";

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
      <Coffee size={17} color="white" />
    </div>
  );
  return L.divIcon({
    html: iconMarkup,
    className: "coffee-icon",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

interface CoffeeShopMapClientProps {
  coffeeShops: CoffeeShop[];
  selectedShopId: number;
  onMarkerClick: (shop: CoffeeShop) => void;
}

export function CoffeeShopMapClient({
  coffeeShops,
  selectedShopId,
  onMarkerClick,
}: CoffeeShopMapClientProps) {
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
}
