// src/components/ShopCard.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { CoffeeShop } from '../lib/types';
import { isCurrentlyOpen } from '../lib/utils';

const PLACEHOLDER_IMAGE = 'https://placehold.co/150x150/e2e8f0/64748b?text=☕';

interface Props {
  shop: CoffeeShop;
  onPress: () => void;
}

export function ShopCard({ shop, onPress }: Props) {
  const isOpen = useMemo(
    () => isCurrentlyOpen(shop.weeklyHours || {}),
    [shop.weeklyHours]
  );

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <Image
        source={{ uri: shop.image || PLACEHOLDER_IMAGE }}
        style={styles.image}
      />

      <View style={styles.content}>
        {/* Header row: name + starred */}
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>
            {shop.name}
          </Text>
          {shop.starred && (
            <Ionicons name="star" size={16} color="#eab308" />
          )}
        </View>

        {/* Address */}
        <Text style={styles.address} numberOfLines={1}>
          {shop.address}
        </Text>

        {/* Status + features row */}
        <View style={styles.bottomRow}>
          <View
            style={[
              styles.statusBadge,
              isOpen ? styles.openBadge : styles.closedBadge,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isOpen ? styles.openText : styles.closedText,
              ]}
            >
              {isOpen ? 'Open' : 'Closed'}
            </Text>
          </View>

          <View style={styles.features}>
            {shop.hasWifi && (
              <Ionicons name="wifi" size={14} color="#888" />
            )}
            {shop.pourOver && (
              <Ionicons name="cafe" size={14} color="#888" />
            )}
            {shop.accessibility && (
              <Ionicons name="accessibility" size={14} color="#888" />
            )}
          </View>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: '#e2e8f0',
  },
  content: {
    flex: 1,
    marginLeft: 12,
    gap: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  address: {
    fontSize: 13,
    color: '#666',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  openBadge: {
    backgroundColor: '#dcfce7',
  },
  closedBadge: {
    backgroundColor: '#f3f4f6',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  openText: {
    color: '#166534',
  },
  closedText: {
    color: '#6b7280',
  },
  features: {
    flexDirection: 'row',
    gap: 8,
  },
});
