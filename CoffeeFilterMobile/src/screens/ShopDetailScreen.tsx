// src/screens/ShopDetailScreen.tsx
import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Platform,
  Share,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { CoffeeShop } from '../lib/types';
import { DAYS_OF_WEEK } from '../lib/types';
import { isCurrentlyOpen, formatTime, ensureHttps } from '../lib/utils';

const PLACEHOLDER_IMAGE = 'https://placehold.co/400x400/e2e8f0/64748b?text=☕';

interface Props {
  shop: CoffeeShop;
  onClose: () => void;
  onDelete?: (id: number) => Promise<void>;
  onEdit?: () => void;
  isAdmin?: boolean;
}

export function ShopDetailScreen({ shop, onClose, onDelete, onEdit, isAdmin }: Props) {
  const isOpen = useMemo(
    () => isCurrentlyOpen(shop.weeklyHours || {}),
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

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${shop.name} at ${shop.address}`,
        title: shop.name,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleWebsite = () => {
    if (shop.website) {
      Linking.openURL(ensureHttps(shop.website));
    }
  };

  const handleInstagram = () => {
    if (shop.instagram) {
      Linking.openURL(ensureHttps(shop.instagram));
    }
  };

  const todayName = new Date()
    .toLocaleDateString('en-US', { weekday: 'long' })
    .toLowerCase();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Details</Text>
        <View style={styles.headerActions}>
          {isAdmin && onEdit && (
            <TouchableOpacity onPress={onEdit} style={styles.headerButton}>
              <Ionicons name="pencil" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <Image
          source={{ uri: shop.image || PLACEHOLDER_IMAGE }}
          style={styles.heroImage}
        />

        {/* Featured badge */}
        {shop.starred && (
          <View style={styles.featuredBadge}>
            <Ionicons name="star" size={14} color="#eab308" />
            <Text style={styles.featuredText}>Featured Shop</Text>
          </View>
        )}

        {/* Main content */}
        <View style={styles.content}>
          {/* Name + Status */}
          <View style={styles.titleRow}>
            <Text style={styles.name}>{shop.name}</Text>
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
          </View>

          {/* Address */}
          <TouchableOpacity style={styles.addressRow} onPress={handleDirections}>
            <Ionicons name="location-outline" size={18} color="#666" />
            <Text style={styles.address}>{shop.address}</Text>
            <Ionicons name="chevron-forward" size={16} color="#ccc" />
          </TouchableOpacity>

          {/* Features Card */}
          <FeaturesCard shop={shop} />

          {/* About */}
          {shop.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.description}>{shop.description}</Text>
            </View>
          )}

          {/* Hours */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="time-outline" size={18} color="#c2410c" />
              <Text style={styles.sectionTitle}>Hours</Text>
            </View>
            <View style={styles.hoursContainer}>
              {DAYS_OF_WEEK.map((day) => {
                const hours = shop.weeklyHours?.[day];
                const isToday = day === todayName;
                return (
                  <View
                    key={day}
                    style={[styles.hoursRow, isToday && styles.todayRow]}
                  >
                    <Text
                      style={[styles.dayName, isToday && styles.todayText]}
                    >
                      {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                    </Text>
                    <Text
                      style={[styles.hoursText, isToday && styles.todayText]}
                    >
                      {hours
                        ? `${formatTime(hours.open)} - ${formatTime(hours.close)}`
                        : 'Closed'}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Links */}
          {(shop.website || shop.instagram) && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="link-outline" size={18} color="#c2410c" />
                <Text style={styles.sectionTitle}>Links</Text>
              </View>
              <View style={styles.linksRow}>
                {shop.website && (
                  <TouchableOpacity
                    style={styles.linkButton}
                    onPress={handleWebsite}
                  >
                    <Ionicons name="globe-outline" size={18} color="#c2410c" />
                    <Text style={styles.linkText}>Website</Text>
                  </TouchableOpacity>
                )}
                {shop.instagram && (
                  <TouchableOpacity
                    style={styles.linkButton}
                    onPress={handleInstagram}
                  >
                    <Ionicons name="logo-instagram" size={18} color="#c2410c" />
                    <Text style={styles.linkText}>Instagram</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Spacer for bottom buttons */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Bottom action bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleDirections}>
          <Ionicons name="navigate" size={20} color="white" />
          <Text style={styles.primaryButtonText}>Get Directions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={20} color="#c2410c" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Features card with 2x2 grid layout
function FeaturesCard({ shop }: { shop: CoffeeShop }) {
  const { width } = useWindowDimensions();
  // Card padding (16) * 2 + content padding (16) * 2 + gap (10)
  const itemWidth = (width - 32 - 32 - 10) / 2;

  const features = [
    { icon: 'cafe' as const, label: 'Pour Over', available: shop.pourOver },
    { icon: 'wifi' as const, label: 'WiFi', available: shop.hasWifi },
    { icon: 'accessibility' as const, label: 'Accessible', available: shop.accessibility },
    { icon: 'cog' as const, label: shop.machine || 'Unknown', available: !!shop.machine, isText: true },
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Features</Text>
      <View style={styles.featuresGrid}>
        {features.map((feature, index) => (
          <View
            key={index}
            style={[
              styles.featureItem,
              { width: itemWidth },
              !feature.available && styles.featureUnavailable,
            ]}
          >
            <Ionicons
              name={feature.icon}
              size={20}
              color={feature.available ? '#c2410c' : '#ccc'}
            />
            <Text
              style={[
                feature.isText ? styles.featureTextLabel : styles.featureLabel,
                !feature.available && styles.featureLabelUnavailable,
              ]}
              numberOfLines={1}
            >
              {feature.label}
            </Text>
            {!feature.isText && (
              <Ionicons
                name={feature.available ? 'checkmark-circle' : 'close-circle'}
                size={16}
                color={feature.available ? '#22c55e' : '#ccc'}
              />
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  heroImage: {
    width: '100%',
    height: 240,
    backgroundColor: '#e2e8f0',
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fef3c7',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: -20,
    marginLeft: 16,
  },
  featuredText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400e',
  },
  content: {
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginLeft: 12,
  },
  openBadge: {
    backgroundColor: '#dcfce7',
  },
  closedBadge: {
    backgroundColor: '#f3f4f6',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  openText: {
    color: '#166534',
  },
  closedText: {
    color: '#6b7280',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  address: {
    fontSize: 15,
    color: '#666',
    flex: 1,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff7ed',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    width: '50%', // Two items per row with gap
    minHeight: 44,
  },
  featureUnavailable: {
    backgroundColor: '#f9fafb',
  },
  featureLabel: {
    fontSize: 13,
    color: '#1a1a1a',
  },
  featureTextLabel: {
    fontSize: 13,
    color: '#1a1a1a',
    maxWidth: 100,
  },
  featureLabelUnavailable: {
    color: '#9ca3af',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  description: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 22,
  },
  hoursContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  todayRow: {
    backgroundColor: '#fff7ed',
    marginHorizontal: -12,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  dayName: {
    fontSize: 14,
    color: '#666',
    width: 40,
  },
  hoursText: {
    fontSize: 14,
    color: '#1a1a1a',
  },
  todayText: {
    fontWeight: '600',
    color: '#c2410c',
  },
  linksRow: {
    flexDirection: 'row',
    gap: 12,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  linkText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#c2410c',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingBottom: 32,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#c2410c',
    paddingVertical: 14,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff7ed',
    paddingHorizontal: 16,
    borderRadius: 12,
  },
});
