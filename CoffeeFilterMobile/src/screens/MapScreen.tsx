// src/screens/MapScreen.tsx
import React, { useCallback, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import MapView, { Region } from 'react-native-maps';
import { useShops } from '../../hooks/useShops';
import type { CoffeeShop } from '../lib/types';
import { ShopDetailScreen } from './ShopDetailScreen';
import { ShopMarker } from '../components/ShopMarker';

export function MapScreen() {
  const { shops, loading, error } = useShops();
  const [selectedShop, setSelectedShop] = useState<CoffeeShop | null>(null);
  const [lastViewedShopId, setLastViewedShopId] = useState<number | null>(null);
  const [showCalloutTrigger, setShowCalloutTrigger] = useState(0);
  const [region, setRegion] = useState<Region>({
    latitude: 39.0997,
    longitude: -94.5786,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  const handleCalloutPress = useCallback((shop: CoffeeShop) => {
    setLastViewedShopId(shop.id);
    setSelectedShop(shop);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedShop(null);
    // Increment trigger to cause the callout to show
    setShowCalloutTrigger(prev => prev + 1);
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

  // Show full detail screen if a shop is selected
  if (selectedShop) {
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
            onCalloutPress={() => handleCalloutPress(shop)}
            showCallout={lastViewedShopId === shop.id ? showCalloutTrigger : 0}
          />
        ))}
      </MapView>
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
