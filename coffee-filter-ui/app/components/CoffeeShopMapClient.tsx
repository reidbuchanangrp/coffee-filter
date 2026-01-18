import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import type { CoffeeShop } from "../lib/types";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState, memo, useMemo } from "react";
import { isCurrentlyOpen } from "./WeeklyHoursInput";

// Memoized popup content - calculates isCurrentlyOpen once per shop
const PopupContent = memo(function PopupContent({
  shop,
}: {
  shop: CoffeeShop;
}) {
  const isOpen = useMemo(
    () => isCurrentlyOpen(shop.weeklyHours || {}),
    [shop.weeklyHours]
  );

  return (
    <div>
      <div className="flex justify-between items-center">
        <h2 className="text-md font-semibold">{shop.name}</h2>
        <span
          style={{
            display: "inline-block",
            padding: "2px 8px",
            borderRadius: "9999px",
            fontSize: "12px",
            fontWeight: 500,
            backgroundColor: isOpen ? "#dcfce7" : "#f3f4f6",
            color: isOpen ? "#166534" : "#6b7280",
          }}
        >
          {isOpen ? "Open" : "Closed"}
        </span>
      </div>
      <p>{shop.address}</p>
    </div>
  );
});

// Pre-create all icon variants once at module load (avoids renderToStaticMarkup on every render)
const coffeeIconHtml = (isSelected: boolean) => `
  <div style="
    background: ${isSelected ? "#d97706" : "#c2410c"};
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  ">
    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/>
      <path d="M6 2v2"/>
    </svg>
  </div>
`;

const starredIconHtml = (isSelected: boolean) => `
  <div style="
    background: ${isSelected ? "#eab308" : "#f59e0b"};
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px solid #fef3c7;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    position: relative;
  ">
    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/>
      <path d="M6 2v2"/>
    </svg>
    <span style="position: absolute; top: -6px; right: -6px; font-size: 14px;">⭐</span>
  </div>
`;

// Pre-create all 4 icon variants (regular/starred × selected/unselected)
const coffeeIcon = L.divIcon({
  html: coffeeIconHtml(false),
  className: "coffee-icon",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const coffeeIconSelected = L.divIcon({
  html: coffeeIconHtml(true),
  className: "coffee-icon coffee-icon-selected",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const starredIcon = L.divIcon({
  html: starredIconHtml(false),
  className: "starred-coffee-icon",
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const starredIconSelected = L.divIcon({
  html: starredIconHtml(true),
  className: "starred-coffee-icon starred-coffee-icon-selected",
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

// Helper to get the right pre-created icon
const getIcon = (starred: boolean, isSelected: boolean) => {
  if (starred) {
    return isSelected ? starredIconSelected : starredIcon;
  }
  return isSelected ? coffeeIconSelected : coffeeIcon;
};

// Custom cluster icon that shows count in a circle
// Checks if any marker within the cluster is starred
const createClusterIcon = (cluster: {
  getChildCount: () => number;
  getAllChildMarkers: () => L.Marker[];
}) => {
  const count = cluster.getChildCount();
  const childMarkers = cluster.getAllChildMarkers();
  const hasStarred = childMarkers.some(
    (marker) => (marker.options as any).shopStarred === true
  );

  return L.divIcon({
    html: `<div style="
      background: ${hasStarred ? "#eab308" : "#c2410c"};
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid ${hasStarred ? "#fef3c7" : "white"};
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

// Pulsing user location icon
const userLocationIcon = L.divIcon({
  html: `
    <div class="user-location-marker">
      <div class="user-location-pulse"></div>
      <div class="user-location-dot"></div>
    </div>
  `,
  className: "user-location-icon",
  iconSize: L.point(24, 24),
  iconAnchor: L.point(12, 12),
});

// helper function to get the center of the map
function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

// Component to track map view changes and save to URL
function MapViewTracker({
  onViewChange,
}: {
  onViewChange?: (lat: number, lng: number, zoom: number) => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (!onViewChange) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const handleMoveEnd = () => {
      // Debounce to avoid too many URL updates
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const center = map.getCenter();
        const zoom = map.getZoom();
        onViewChange(center.lat, center.lng, zoom);
      }, 500);
    };

    map.on("moveend", handleMoveEnd);

    return () => {
      clearTimeout(timeoutId);
      map.off("moveend", handleMoveEnd);
    };
  }, [map, onViewChange]);

  return null;
}

interface CoffeeShopMapClientProps {
  coffeeShops: CoffeeShop[];
  selectedShopId: number;
  onMarkerClick: (shop: CoffeeShop) => void;
  searchCenter?: [number, number] | null;
  initialView?: { lat: number; lng: number; zoom: number } | null;
  onViewChange?: (lat: number, lng: number, zoom: number) => void;
  selectedShopCenter?: [number, number];
}

export function CoffeeShopMapClient({
  coffeeShops,
  selectedShopId,
  onMarkerClick,
  searchCenter,
  initialView,
  onViewChange,
  selectedShopCenter,
}: CoffeeShopMapClientProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  // Request user's location on mount (only if no initialView and no selected shop)
  useEffect(() => {
    if (initialView || selectedShopCenter) return; // Skip geolocation if we have a saved view or selected shop
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
  }, [initialView, selectedShopCenter]);

  // Priority: URL saved view > selected shop > user location > first coffee shop > default (Kansas City)
  const center: [number, number] = initialView
    ? [initialView.lat, initialView.lng]
    : selectedShopCenter
      ? selectedShopCenter
      : userLocation
        ? userLocation
        : coffeeShops.length > 0
          ? [coffeeShops[0].latitude, coffeeShops[0].longitude]
          : [39.0997, -94.5786];
  const zoom = initialView?.zoom ?? 14; // Use zoom 14 for selected shop for better detail

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="h-full w-full"
      scrollWheelZoom={true}
      zoomControl={true}
    >
      <MapViewTracker onViewChange={onViewChange} />
      {searchCenter && <RecenterMap center={searchCenter} />}
      {/* Only recenter to user location if no saved view, no search, and no selected shop */}
      {!searchCenter && !initialView && !selectedShopCenter && userLocation && (
        <RecenterMap center={userLocation} />
      )}
      {userLocation && (
        <Marker
          position={userLocation}
          icon={userLocationIcon}
          zIndexOffset={1000}
        />
      )}
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
            icon={getIcon(shop.starred ?? false, shop.id === selectedShopId)}
            zIndexOffset={shop.starred ? 100 : 0}
            // @ts-expect-error - custom property for cluster icon detection
            shopStarred={shop.starred ?? false}
            eventHandlers={{
              click: () => {
                onMarkerClick?.(shop);
              },
            }}
          >
            <Popup>
              <PopupContent shop={shop} />
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
