import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS } from '@/constants/colors';
import { Button } from '@/components/ui/Button';
import { HeartPulse } from 'lucide-react-native';

export default function IndexScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.iconCircle}>
            <HeartPulse size={60} color={COLORS.primary} strokeWidth={2.5} />
          </View>
          <Text style={styles.title}>HomePulse</Text>
          <Text style={styles.subtitle}>Guided reassurance for every home.</Text>
        </View>

        <View style={styles.illustrationPlaceholder}>
          {/* In a real app, this would be a high-quality SVG or PNG illustration */}
          <View style={styles.circleLarge} />
          <View style={styles.circleSmall} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.onboardingText}>
            Prepare your household for safe, confident health monitoring.
          </Text>
          <Button 
            title="Get Started" 
            onPress={() => router.push('/onboarding/create-profile')}
            style={styles.mainButton}
          />
          <Button 
            title="Already have a profile? Log in" 
            variant="outline"
            onPress={() => router.replace('/(tabs)/home')}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: SPACING.screenEdge,
    justifyContent: 'space-between',
    paddingTop: 100,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    // Soft shadow
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.textSecondary,
    marginTop: 8,
    fontWeight: '500',
  },
  illustrationPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleLarge: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.state.monitor.surface,
    opacity: 0.5,
  },
  circleSmall: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.state.care.surface,
    bottom: 20,
    right: '25%',
    opacity: 0.8,
  },
  footer: {
    width: '100%',
  },
  onboardingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xxl,
    paddingHorizontal: SPACING.xl,
  },
  mainButton: {
    marginBottom: SPACING.md,
  }
});
