// src/components/ShopMarker.tsx
import React, { memo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker, Callout, MapMarker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import type { CoffeeShop } from '../lib/types';
import { isCurrentlyOpen, getTodayHours } from '../lib/utils';

interface Props {
  shop: CoffeeShop;
  onCalloutPress: () => void;
  showCallout?: number; // Trigger counter - when > 0, show callout
}

// Custom marker component - memoized to prevent unnecessary re-renders
export const ShopMarker = memo(function ShopMarker({
  shop,
  onCalloutPress,
  showCallout,
}: Props) {
  const markerRef = useRef<MapMarker>(null);
  const markerColor = shop.starred ? '#eab308' : '#c2410c';
  const isOpen = isCurrentlyOpen(shop.weeklyHours || {});
  const todayHours = getTodayHours(shop.weeklyHours || {});

  // Show callout programmatically when returning from detail view
  useEffect(() => {
    if (showCallout && showCallout > 0 && markerRef.current) {
      // Small delay to ensure the map is fully rendered
      const timeout = setTimeout(() => {
        markerRef.current?.showCallout();
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [showCallout]);

  return (
    <Marker
      ref={markerRef}
      coordinate={{
        latitude: shop.latitude,
        longitude: shop.longitude,
      }}
      tracksViewChanges={false}
    >
      <View
        style={[
          styles.markerContainer,
          { backgroundColor: markerColor },
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
      <Callout tooltip onPress={onCalloutPress}>
        <View style={styles.calloutContainer}>
          <View style={styles.callout}>
            <View style={styles.calloutContent}>
              <View style={styles.calloutHeader}>
                <Text style={styles.calloutTitle} numberOfLines={1}>{shop.name}</Text>
                {shop.starred && (
                  <View style={styles.calloutStar}>
                    <Ionicons name="star" size={12} color="#eab308" />
                  </View>
                )}
              </View>
              <Text style={styles.calloutAddress} numberOfLines={2}>{shop.address}</Text>
              <View style={styles.calloutStatus}>
                <View style={[styles.statusDot, isOpen ? styles.openDot : styles.closedDot]} />
                <Text style={[styles.statusText, isOpen ? styles.openText : styles.closedText]}>
                  {isOpen ? 'Open' : 'Closed'}
                </Text>
                <Text style={styles.calloutHours}>{todayHours}</Text>
              </View>
              <Text style={styles.calloutHint}>Tap for details</Text>
            </View>
          </View>
          {/* Arrow pointing down to marker */}
          <View style={styles.calloutArrow} />
        </View>
      </Callout>
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
  calloutContainer: {
    alignItems: 'center',
  },
  callout: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 14,
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  calloutContent: {
    flex: 1,
  },
  calloutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  calloutStar: {
    backgroundColor: '#fef3c7',
    padding: 4,
    borderRadius: 10,
    marginLeft: 8,
  },
  calloutAddress: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
  calloutStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  openDot: {
    backgroundColor: '#22c55e',
  },
  closedDot: {
    backgroundColor: '#9ca3af',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    marginRight: 8,
  },
  openText: {
    color: '#166534',
  },
  closedText: {
    color: '#6b7280',
  },
  calloutHours: {
    fontSize: 12,
    color: '#666',
  },
  calloutHint: {
    fontSize: 13,
    color: '#c2410c',
    fontWeight: '600',
    textAlign: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  calloutArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'white',
    marginTop: -1,
  },
});
