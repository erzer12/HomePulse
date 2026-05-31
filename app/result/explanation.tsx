import React from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Share2, Printer, Search, Lightbulb, Home, AlertTriangle, ChevronLeft } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS } from '@/constants/colors';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

// --- Mock Data ---
const MOCK_REASONING = {
  state: { level: 2, label: 'Guided Home Care', theme: COLORS.state.care },
  assessment: [
    { label: 'Temperature', value: '39.2°C', status: 'high' },
    { label: 'Hydration', value: 'Normal', status: 'good' },
    { label: 'Alertness', value: 'Slightly lethargic', status: 'warning' },
    { label: 'Breathing', value: 'Normal', status: 'good' },
  ],
  reasoning: "The high temperature combined with the duration of the fever suggests active management is needed. While Rohan is currently hydrated, the lethargy requires consistent monitoring to ensure the body is managing the infection effectively.",
  careSteps: [
    "Give paracetamol at correct dose for age (every 4-6 hours)",
    "Offer frequent small sips of fluids (water or ORS)",
    "Keep the room well-ventilated and cool",
    "Dress in lightweight, breathable clothing",
  ],
  triggers: [
    "Temperature rises above 40°C",
    "Breathing becomes fast or difficult",
    "He becomes difficult to wake up",
    "Vomiting prevents fluid intake",
  ]
};

export default function ExplanationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen 
        options={{ 
          title: 'Clinical Reasoning',
          headerStyle: { backgroundColor: COLORS.background },
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.headerIcon}>
              <ChevronLeft color={COLORS.textPrimary} size={28} />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable style={styles.headerIcon}>
              <Share2 color={COLORS.primary} size={24} />
            </Pressable>
          )
        }} 
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Status Summary */}
        <View style={[styles.statusBanner, { backgroundColor: MOCK_REASONING.state.theme.surface }]}>
          <View style={[styles.statusDot, { backgroundColor: MOCK_REASONING.state.theme.primary }]} />
          <Text style={[styles.statusText, { color: MOCK_REASONING.state.theme.text }]}>
            {MOCK_REASONING.state.label} (Level {MOCK_REASONING.state.level})
          </Text>
        </View>

        {/* Section 1: What we assessed */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Search size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>What we assessed</Text>
          </View>
          <Card variant="elevated" style={styles.contentCard}>
            {MOCK_REASONING.assessment.map((item, i) => (
              <View key={i} style={[styles.assessmentRow, i === 0 && styles.noBorder]}>
                <Text style={styles.assessmentLabel}>{item.label}</Text>
                <Text style={[styles.assessmentValue, item.status === 'high' && styles.textUrgent]}>
                  {item.value}
                </Text>
              </View>
            ))}
          </Card>
        </View>

        {/* Section 2: Why this recommendation */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Lightbulb size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Why this recommendation</Text>
          </View>
          <Card variant="elevated" style={styles.contentCard}>
            <Text style={styles.reasoningText}>{MOCK_REASONING.reasoning}</Text>
          </Card>
        </View>

        {/* Section 3: Home Care Steps */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Home size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Home Care Steps</Text>
          </View>
          <Card variant="elevated" style={styles.contentCard}>
            {MOCK_REASONING.careSteps.map((step, i) => (
              <View key={i} style={styles.listRow}>
                <View style={styles.listNumber}>
                  <Text style={styles.listNumberText}>{i + 1}</Text>
                </View>
                <Text style={styles.listText}>{step}</Text>
              </View>
            ))}
          </Card>
        </View>

        {/* Section 4: When to seek higher care */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AlertTriangle size={20} color={COLORS.state.urgent.primary} />
            <Text style={[styles.sectionTitle, { color: COLORS.state.urgent.primary }]}>
              When to seek higher care
            </Text>
          </View>
          <Card style={[styles.contentCard, styles.urgentCard]}>
            {MOCK_REASONING.triggers.map((trigger, i) => (
              <View key={i} style={styles.triggerRow}>
                <View style={styles.triggerDot} />
                <Text style={styles.triggerText}>{trigger}</Text>
              </View>
            ))}
          </Card>
        </View>

        <View style={styles.footer}>
          <Button 
            title="Print Summary" 
            variant="outline" 
            style={styles.printButton}
            onPress={() => {}}
          />
          <Text style={styles.disclaimer}>
            This clinical reasoning is based on the information provided and standard triage protocols. Always trust your intuition and seek care if you are worried.
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
  headerIcon: {
    padding: 8,
  },
  scrollContent: {
    padding: SPACING.screenEdge,
    paddingBottom: 40,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.sectionGap,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.sm,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: SPACING.sectionGap,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingLeft: SPACING.xs,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  contentCard: {
    padding: SPACING.lg,
  },
  noBorder: {
    borderTopWidth: 0,
  },
  assessmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  assessmentLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  assessmentValue: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  textUrgent: {
    color: COLORS.state.urgent.primary,
  },
  reasoningText: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.textPrimary,
  },
  listRow: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  listNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.state.monitor.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    marginTop: 2,
  },
  listNumberText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.state.monitor.text,
  },
  listText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    color: COLORS.textPrimary,
  },
  urgentCard: {
    backgroundColor: COLORS.state.urgent.surface,
    borderColor: 'transparent',
  },
  triggerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  triggerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.state.urgent.primary,
    marginRight: SPACING.md,
  },
  triggerText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.state.urgent.text,
  },
  footer: {
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  printButton: {
    width: '100%',
    marginBottom: SPACING.lg,
  },
  disclaimer: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    fontStyle: 'italic',
  }
});
