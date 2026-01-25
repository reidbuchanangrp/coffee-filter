// src/components/ShopList.tsx
import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { ShopCard } from './ShopCard';
import type { CoffeeShop } from '../lib/types';

interface Props {
  shops: CoffeeShop[];
  onShopPress: (shop: CoffeeShop) => void;
}

export function ShopList({ shops, onShopPress }: Props) {
  // BEST PRACTICE: useCallback to prevent re-renders
  const renderItem = useCallback(
    ({ item }: { item: CoffeeShop }) => (
      <ShopCard shop={item} onPress={() => onShopPress(item)} />
    ),
    [onShopPress]
  );

  const keyExtractor = useCallback(
    (item: CoffeeShop) => item.id.toString(),
    []
  );

  return (
    <View style={styles.container}>
      <FlashList
        data={shops}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
});
