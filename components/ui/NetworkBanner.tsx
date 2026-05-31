import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { WifiOff } from 'lucide-react-native';
import { COLORS, SPACING } from '@/constants/colors';

export function NetworkBanner() {
  const netInfo = useNetInfo();

  // Only show if we explicitly know we are disconnected
  if (netInfo.isConnected !== false) return null;

  return (
    <View style={styles.container}>
      <WifiOff size={16} color={COLORS.textSecondary} />
      <Text style={styles.text}>You're offline — core features still work</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E5E5E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: SPACING.sm,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  }
});
