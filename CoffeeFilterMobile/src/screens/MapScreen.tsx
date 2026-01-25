// src/screens/MapScreen.tsx
import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import MapView, { Region } from 'react-native-maps';
import { useShops } from '../../hooks/useShops';
import type { CoffeeShop } from '../lib/types';
import { ShopPreviewCard } from '../components/ShopPreviewCard';
import { ShopDetailScreen } from './ShopDetailScreen';
import { ShopMarker } from '../components/ShopMarker';

// BEST PRACTICE: Build lookup Map for O(1) access (same as web!)
function useShopById(shops: CoffeeShop[]) {
  return useMemo(
    () => new Map(shops.map((shop) => [shop.id, shop])),
    [shops]
  );
}

export function MapScreen() {
  const { shops, loading, error, refetch } = useShops();
  const [selectedShopId, setSelectedShopId] = useState<number | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [region, setRegion] = useState<Region>({
    latitude: 39.0997,
    longitude: -94.5786,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  const shopById = useShopById(shops);
  const selectedShop = selectedShopId ? shopById.get(selectedShopId) : null;

  // BEST PRACTICE: useCallback for handlers passed to children
  const handleMarkerPress = useCallback((shop: CoffeeShop) => {
    setSelectedShopId(shop.id);
    // Center map on selected shop
    setRegion((prev) => ({
      ...prev,
      latitude: shop.latitude,
      longitude: shop.longitude,
    }));
  }, []);

  const handleClosePreview = useCallback(() => {
    setSelectedShopId(null);
  }, []);

  const handleViewDetails = useCallback(() => {
    setShowDetail(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setShowDetail(false);
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#c2410c" />
        <Text style={styles.loadingText}>Loading coffee shops...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // Show full detail screen if selected
  if (showDetail && selectedShop) {
    return (
      <ShopDetailScreen
        shop={selectedShop}
        onClose={handleCloseDetail}
      />
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {shops.map((shop) => (
          <ShopMarker
            key={shop.id}
            shop={shop}
            isSelected={selectedShopId === shop.id}
            onPress={() => handleMarkerPress(shop)}
          />
        ))}
      </MapView>

      {selectedShop && (
        <ShopPreviewCard
          shop={selectedShop}
          onClose={handleClosePreview}
          onViewDetails={handleViewDetails}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
