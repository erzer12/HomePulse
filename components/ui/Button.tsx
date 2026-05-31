import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { COLORS, SPACING, RADIUS } from '@/constants/colors';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'urgent' | 'outline';
  size?: 'normal' | 'large';
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function Button({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'large',
  fullWidth = true,
  style 
}: ButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return { backgroundColor: COLORS.state.care.primary };
      case 'urgent':
        return { backgroundColor: COLORS.state.urgent.primary };
      case 'outline':
        return { 
          backgroundColor: 'transparent', 
          borderWidth: 2, 
          borderColor: COLORS.border 
        };
      default:
        return { backgroundColor: COLORS.primary };
    }
  };

  const getTextStyle = (): TextStyle => ({
    color: variant === 'outline' ? COLORS.textPrimary : '#FFFFFF',
    fontSize: size === 'large' ? 18 : 16,
    fontWeight: '600',
    textAlign: 'center',
  });

  return (
    <Pressable 
      onPress={onPress} 
      style={({ pressed }) => [
        styles.base,
        getVariantStyles(),
        size === 'large' && styles.large,
        fullWidth && styles.fullWidth,
        pressed && styles.pressed,
        style
      ]}
    >
      <Text style={getTextStyle()}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.xl,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  large: {
    height: 60, // Tappable 60px height as per design system
  },
  fullWidth: {
    width: '100%',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ translateY: 1 }], // Tactile push feedback
  },
});
