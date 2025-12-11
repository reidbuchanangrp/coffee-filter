import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import type { CoffeeShop } from "../lib/types";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { Coffee } from "lucide-react";
import { useEffect, useState } from "react";

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

// Custom cluster icon that shows count in a circle
const createClusterIcon = (cluster: L.MarkerCluster) => {
  const count = cluster.getChildCount();
  return L.divIcon({
    html: `<div style="
      background: #c2410c;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      color: white;
      font-weight: bold;
      font-size: 14px;
    ">${count}</div>`,
    className: "coffee-cluster-icon",
    iconSize: L.point(40, 40),
    iconAnchor: L.point(20, 20),
  });
};

// helper function to get the center of the map
function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

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
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  // Request user's location on mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([
            position.coords.latitude,
            position.coords.longitude,
          ]);
        },
        (error) => {
          console.log("Geolocation denied or unavailable:", error.message);
        }
      );
    }
  }, []);
  // Priority: user location > first coffee shop > default (Kansas City)
  const center: [number, number] = userLocation
    ? userLocation
    : coffeeShops.length > 0
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
      {userLocation && <RecenterMap center={userLocation} />}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <MarkerClusterGroup
        iconCreateFunction={createClusterIcon}
        maxClusterRadius={50}
        spiderfyOnMaxZoom={true}
        showCoverageOnHover={false}
      >
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
      </MarkerClusterGroup>
    </MapContainer>
  );
}
