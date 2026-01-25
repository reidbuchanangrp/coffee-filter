// src/components/ShopPreviewCard.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { CoffeeShop } from '../lib/types';
import { isCurrentlyOpen, getTodayHours } from '../lib/utils';

const PLACEHOLDER_IMAGE = 'https://placehold.co/150x150/e2e8f0/64748b?text=☕';

interface Props {
  shop: CoffeeShop;
  onClose: () => void;
  onViewDetails?: () => void;
}

export function ShopPreviewCard({ shop, onClose, onViewDetails }: Props) {
  const isOpen = useMemo(
    () => isCurrentlyOpen(shop.weeklyHours || {}),
    [shop.weeklyHours]
  );

  const todayHours = useMemo(
    () => getTodayHours(shop.weeklyHours || {}),
    [shop.weeklyHours]
  );

  const handleDirections = () => {
    const { latitude, longitude } = shop;
    const label = encodeURIComponent(shop.name);
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}(${label})`,
    });
    if (url) {
      Linking.openURL(url);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={onClose}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="close" size={24} color="#666" />
      </TouchableOpacity>

      <View style={styles.content}>
        <Image
          source={{ uri: shop.image || PLACEHOLDER_IMAGE }}
          style={styles.image}
        />
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{shop.name}</Text>
            {shop.starred && (
              <View style={styles.starBadge}>
                <Ionicons name="star" size={12} color="#eab308" />
              </View>
            )}
          </View>
          <Text style={styles.address} numberOfLines={1}>{shop.address}</Text>

          {/* Open/Closed status */}
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, isOpen ? styles.openBadge : styles.closedBadge]}>
              <Text style={[styles.statusText, isOpen ? styles.openText : styles.closedText]}>
                {isOpen ? 'Open' : 'Closed'}
              </Text>
            </View>
            <Text style={styles.hours}>{todayHours}</Text>
          </View>

          {/* Feature badges */}
          <View style={styles.badges}>
            {shop.hasWifi && (
              <View style={styles.badge}>
                <Ionicons name="wifi" size={12} color="#666" />
              </View>
            )}
            {shop.pourOver && (
              <View style={styles.badge}>
                <Ionicons name="cafe" size={12} color="#666" />
              </View>
            )}
            {shop.accessibility && (
              <View style={styles.badge}>
                <Ionicons name="accessibility" size={12} color="#666" />
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={onViewDetails}>
          <Ionicons name="information-circle-outline" size={20} color="#c2410c" />
          <Text style={styles.actionText}>Details</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleDirections}>
          <Ionicons name="navigate-outline" size={20} color="#c2410c" />
          <Text style={styles.actionText}>Directions</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
    padding: 4,
  },
  content: {
    flexDirection: 'row',
    gap: 12,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
  },
  info: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 32, // Leave space for close button
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    flexShrink: 1, // Allow name to shrink, not push star into close button
  },
  starBadge: {
    backgroundColor: '#fef3c7',
    padding: 4,
    borderRadius: 12,
  },
  address: {
    fontSize: 14,
    color: '#666',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  openBadge: {
    backgroundColor: '#dcfce7',
  },
  closedBadge: {
    backgroundColor: '#f3f4f6',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  openText: {
    color: '#166534',
  },
  closedText: {
    color: '#6b7280',
  },
  hours: {
    fontSize: 12,
    color: '#666',
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  badge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#fff7ed',
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionText: {
    color: '#c2410c',
    fontWeight: '600',
    fontSize: 14,
  },
});
