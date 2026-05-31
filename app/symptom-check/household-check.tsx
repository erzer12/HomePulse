import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS } from '@/constants/colors';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Thermometer, Activity, Car, Moon, Pill, MapPin } from 'lucide-react-native';

interface ReadinessRowProps {
  label: string;
  icon: React.ReactNode;
  available: boolean;
}

function ReadinessRow({ label, icon, available }: ReadinessRowProps) {
  return (
    <View style={styles.row}>
      <View style={[styles.iconBox, { backgroundColor: available ? COLORS.state.monitor.surface : COLORS.disabledBG }]}>
        {icon}
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={[styles.statusBadge, { backgroundColor: available ? COLORS.state.monitor.primary : COLORS.disabledText }]}>
        <Text style={styles.statusText}>{available ? 'YES' : 'NO'}</Text>
      </View>
    </View>
  );
}

export default function HouseholdCheckScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // Mock readiness data (normally from useHouseholdStore)
  const [readiness] = useState({
    thermometer: true,
    oximeter: false,
    transport: true,
    caregiver: true,
    medicine: true,
    distance: '1.5 km',
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen 
        options={{ 
          title: 'Household Check',
          headerStyle: { backgroundColor: COLORS.background },
          headerShadowVisible: false,
        }} 
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Quick Check</Text>
          <Text style={styles.subtitle}>
            Are these resources still correct? We use this to adjust our advice.
          </Text>
        </View>

        <Card variant="elevated" style={styles.checklistCard}>
          <ReadinessRow 
            label="Working Thermometer" 
            icon={<Thermometer size={20} color={readiness.thermometer ? COLORS.primary : COLORS.textSecondary} />}
            available={readiness.thermometer}
          />
          <ReadinessRow 
            label="Pulse Oximeter" 
            icon={<Activity size={20} color={readiness.oximeter ? COLORS.primary : COLORS.textSecondary} />}
            available={readiness.oximeter}
          />
          <ReadinessRow 
            label="Reliable Transport" 
            icon={<Car size={20} color={readiness.transport ? COLORS.primary : COLORS.textSecondary} />}
            available={readiness.transport}
          />
          <ReadinessRow 
            label="Overnight Help" 
            icon={<Moon size={20} color={readiness.caregiver ? COLORS.primary : COLORS.textSecondary} />}
            available={readiness.caregiver}
          />
          <ReadinessRow 
            label="Basic Meds Stocked" 
            icon={<Pill size={20} color={readiness.medicine ? COLORS.primary : COLORS.textSecondary} />}
            available={readiness.medicine}
          />
          <View style={[styles.row, styles.noBorder]}>
            <View style={styles.iconBox}><MapPin size={20} color={COLORS.primary} /></View>
            <Text style={styles.rowLabel}>Pharmacy Distance</Text>
            <Text style={styles.distanceValue}>{readiness.distance}</Text>
          </View>
        </Card>

        <View style={styles.footer}>
          <Button 
            title="All Correct — Analyze Results" 
            onPress={() => router.push('/result/action-state')}
          />
          <Button 
            title="Update Resources" 
            variant="outline"
            onPress={() => router.push('/onboarding/household-setup')}
            style={styles.updateButton}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.screenEdge,
    paddingBottom: 40,
  },
  header: {
    marginBottom: SPACING.sectionGap,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 8,
    lineHeight: 22,
  },
  checklistCard: {
    padding: 0,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  rowLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  distanceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  footer: {
    marginTop: SPACING.xl,
  },
  updateButton: {
    marginTop: SPACING.md,
    borderStyle: 'dashed',
  }
});
