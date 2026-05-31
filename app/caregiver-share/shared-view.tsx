import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS } from '@/constants/colors';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ActionStateCard } from '@/components/triage/ActionStateCard';
import { TaskList } from '@/components/caregiver/TaskList';

// Mock data based on the Google Stitch design
const MOCK_STATE = {
  level: 2,
  label: 'Guided Home Care',
  explanation: 'Symptoms require active management. Follow the care instructions below.',
};

const MOCK_TASKS = [
  { id: '1', title: 'Check temperature in 30 minutes', done: false },
  { id: '2', title: 'Offer fluids (ORS or water) every 20 minutes', done: false },
  { id: '3', title: 'Prepare transport just in case', done: false },
];

export default function SharedViewScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen 
        options={{ 
          headerShown: true, 
          title: 'Shared Monitoring View',
          headerStyle: { backgroundColor: COLORS.background },
          headerTitleStyle: { color: COLORS.textPrimary, fontWeight: '700' },
        }} 
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Patient Summary Card */}
        <Card variant="elevated" style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Patient: Child</Text>
          <Text style={styles.summaryTimestamp}>Last updated: 12 mins ago</Text>
        </Card>

        <View style={styles.section}>
          <ActionStateCard state={MOCK_STATE} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assigned Tasks</Text>
          <TaskList tasks={MOCK_TASKS} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.disclaimer}>
            This is a shared view. All medical decisions remain with the primary caregiver.
          </Text>
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
  summaryCard: {
    marginBottom: SPACING.sectionGap,
  },
  summaryLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  summaryTimestamp: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  section: {
    marginBottom: SPACING.sectionGap,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  footer: {
    marginTop: SPACING.xl,
    paddingTop: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  disclaimer: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
