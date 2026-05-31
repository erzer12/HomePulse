import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, RADIUS, SPACING } from '@/constants/colors';
import * as LucideIcons from 'lucide-react-native';

interface SymptomIconProps {
  label: string;
  iconName: string;
  onPress?: () => void;
  selected?: boolean;
}

export function SymptomIcon({ label, iconName, onPress, selected }: SymptomIconProps) {
  // Dynamically resolve icon from lucide-react-native
  const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Activity;

  return (
    <Pressable 
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        selected && styles.selected,
        pressed && styles.pressed
      ]}
    >
      <View style={[styles.iconContainer, selected && styles.selectedIconContainer]}>
        <IconComponent 
          size={32} 
          strokeWidth={2.5} 
          color={selected ? '#FFFFFF' : COLORS.primary} 
        />
      </View>
      <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '30%', // Grid-friendly
    aspectRatio: 1,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    // Soft shadow
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.state.monitor.surface,
  },
  pressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
  iconContainer: {
    marginBottom: SPACING.sm,
  },
  selectedIconContainer: {
    backgroundColor: COLORS.primary,
    padding: 8,
    borderRadius: RADIUS.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  selectedLabel: {
    color: COLORS.primary,
  }
});
