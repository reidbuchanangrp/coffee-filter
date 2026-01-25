// src/components/ShopMarker.tsx
import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import type { CoffeeShop } from '../lib/types';

interface Props {
  shop: CoffeeShop;
  isSelected: boolean;
  onPress: () => void;
}

// Custom marker component - memoized to prevent unnecessary re-renders
export const ShopMarker = memo(function ShopMarker({
  shop,
  isSelected,
  onPress,
}: Props) {
  const markerColor = shop.starred ? '#eab308' : '#c2410c';
  const selectedColor = shop.starred ? '#ca8a04' : '#9a3412';

  return (
    <Marker
      coordinate={{
        latitude: shop.latitude,
        longitude: shop.longitude,
      }}
      title={shop.name}
      description={shop.address}
      onPress={onPress}
      tracksViewChanges={false}
    >
      <View
        style={[
          styles.markerContainer,
          {
            backgroundColor: isSelected ? selectedColor : markerColor,
            transform: [{ scale: isSelected ? 1.2 : 1 }],
          },
          shop.starred && styles.starredMarker,
        ]}
      >
        <Ionicons
          name="cafe"
          size={shop.starred ? 18 : 16}
          color="white"
        />
        {shop.starred && (
          <View style={styles.starIndicator}>
            <Ionicons name="star" size={10} color="#eab308" />
          </View>
        )}
      </View>
    </Marker>
  );
});

const styles = StyleSheet.create({
  markerContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  starredMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#fef3c7',
  },
  starIndicator: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 2,
  },
});
