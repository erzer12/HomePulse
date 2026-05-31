import React from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS } from '@/constants/colors';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ActionStateCard } from '@/components/triage/ActionStateCard';
import { Users, ClipboardList, History, Plus } from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Mock Active Case
  const activeCase = {
    patientName: 'Rohan',
    state: {
      level: 2 as const,
      label: 'Guided Home Care',
      explanation: 'Manage symptoms at home. Next check-in due in 2h 15m.',
      triggers: ['Fever over 38°C'],
      redFlags: ['Difficulty breathing', 'Confusion'],
      recheckIntervalMinutes: 120,
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen 
        options={{ 
          title: 'HomePulse',
          headerLargeTitle: true,
          headerStyle: { backgroundColor: COLORS.background },
          headerShadowVisible: false,
          headerShown: false, // Using custom header spacing
        }} 
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Hello, Abishek</Text>
          <Text style={styles.welcomeSubtitle}>Your household is ready for care.</Text>
        </View>

        {activeCase ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Case</Text>
              <Pressable onPress={() => router.push('/(tabs)/history')}>
                <Text style={styles.seeAll}>See Journey</Text>
              </Pressable>
            </View>
            <Card variant="elevated" style={styles.activeCaseCard}>
              <View style={styles.patientRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{activeCase.patientName[0]}</Text>
                </View>
                <Text style={styles.patientName}>{activeCase.patientName}</Text>
              </View>
              <ActionStateCard state={activeCase.state} showExplanation={true} />
            </Card>
          </View>
        ) : (
          <Card style={styles.emptyCaseCard}>
            <ClipboardList size={40} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No active health cases.</Text>
            <Button 
              title="Start New Check-in" 
              onPress={() => router.push('/symptom-check/select-symptom')}
              style={styles.emptyButton}
            />
          </Card>
        )}

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <Pressable 
              style={styles.actionTile}
              onPress={() => router.push('/symptom-check/select-symptom')}
            >
              <View style={[styles.iconBox, { backgroundColor: COLORS.state.monitor.surface }]}>
                <Plus color={COLORS.state.monitor.primary} />
              </View>
              <Text style={styles.actionLabel}>New Check</Text>
            </Pressable>

            <Pressable 
              style={styles.actionTile}
              onPress={() => router.push('/caregiver-share/shared-view')}
            >
              <View style={[styles.iconBox, { backgroundColor: COLORS.state.teleconsult.surface }]}>
                <Users color={COLORS.state.teleconsult.primary} />
              </View>
              <Text style={styles.actionLabel}>Share Care</Text>
            </Pressable>

            <Pressable 
              style={styles.actionTile}
              onPress={() => router.push('/onboarding/create-profile')}
            >
              <View style={[styles.iconBox, { backgroundColor: COLORS.state.care.surface }]}>
                <History color={COLORS.state.care.primary} />
              </View>
              <Text style={styles.actionLabel}>Add Profile</Text>
            </Pressable>
          </View>
        </View>

        <Card style={styles.tipCard}>
          <Text style={styles.tipTitle}>Caregiver Tip</Text>
          <Text style={styles.tipText}>
            Keep Rohan hydrated with frequent small sips of water or ORS.
          </Text>
        </Card>
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
    paddingBottom: 100,
  },
  welcomeSection: {
    marginBottom: SPACING.sectionGap,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  section: {
    marginBottom: SPACING.sectionGap,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  activeCaseCard: {
    padding: SPACING.md,
  },
  patientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
  },
  patientName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  emptyCaseCard: {
    alignItems: 'center',
    padding: SPACING.xxxxl,
    marginBottom: SPACING.sectionGap,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  emptyButton: {
    width: 'auto',
    paddingHorizontal: SPACING.xl,
  },
  quickActions: {
    marginBottom: SPACING.sectionGap,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  actionTile: {
    width: '30%',
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    alignItems: 'center',
    elevation: 2,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  tipCard: {
    backgroundColor: COLORS.state.monitor.surface,
    borderColor: 'transparent',
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.state.monitor.text,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 16,
    color: COLORS.state.monitor.text,
    lineHeight: 22,
  }
});
