import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { COLORS, RADIUS, SPACING } from '@/constants/colors';
import { Clock } from 'lucide-react-native';

interface RecheckTimerProps {
  minutes: number;
  label?: string;
  variant?: 'monitor' | 'care' | 'urgent';
}

export function RecheckTimer({ 
  minutes, 
  label = 'Next Recheck', 
  variant = 'care' 
}: RecheckTimerProps) {
  const getTheme = () => {
    switch (variant) {
      case 'monitor': return COLORS.state.monitor;
      case 'urgent': return COLORS.state.urgent;
      default: return COLORS.state.care;
    }
  };

  const theme = getTheme();
  
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  const timeStr = hours > 0 
    ? `${hours}h ${remainingMins}m` 
    : `${remainingMins}m`;

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <View style={styles.iconContainer}>
        <Clock size={24} color={theme.text} strokeWidth={2.5} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
        <Text style={[styles.time, { color: theme.text }]}>{timeStr}</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressBar, { backgroundColor: theme.primary, width: '65%' }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    marginRight: SPACING.md,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    opacity: 0.7,
  },
  time: {
    fontSize: 24,
    fontWeight: '800',
  },
  progressTrack: {
    width: 60,
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  }
});
