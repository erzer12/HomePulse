import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TextInput, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS } from '@/constants/colors';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const AGE_GROUPS = [
  { id: 'infant', label: 'Infant', range: '0-1 yr' },
  { id: 'child', label: 'Child', range: '1-12 yrs' },
  { id: 'adult', label: 'Adult', range: '13-65 yrs' },
  { id: 'elderly', label: 'Elderly', range: '65+ yrs' },
];

const CONDITIONS = ['Diabetes', 'Hypertension', 'Asthma', 'Pregnancy', 'None'];

export default function CreateProfileScreen() {
  const router = useRouter();
  const [selectedAge, setSelectedAge] = useState('child');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);

  const toggleCondition = (condition: string) => {
    if (condition === 'None') {
      setSelectedConditions(['None']);
    } else {
      setSelectedConditions(prev => {
        const filtered = prev.filter(c => c !== 'None');
        return filtered.includes(condition) 
          ? filtered.filter(c => c !== condition) 
          : [...filtered, condition];
      });
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Step 1 of 2',
          headerStyle: { backgroundColor: COLORS.background },
          headerShadowVisible: false,
        }} 
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Patient Profile</Text>
          <Text style={styles.subtitle}>Tell us about the person you are caring for.</Text>
        </View>

        <Card variant="elevated" style={styles.formCard}>
          <Text style={styles.label}>Who are you caring for?</Text>
          <TextInput 
            style={styles.input}
            placeholder="Enter name"
            placeholderTextColor={COLORS.textSecondary}
          />
        </Card>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Age Group</Text>
          <View style={styles.ageGrid}>
            {AGE_GROUPS.map((group) => (
              <Pressable 
                key={group.id}
                onPress={() => setSelectedAge(group.id)}
                style={[
                  styles.ageTile,
                  selectedAge === group.id && styles.selectedTile
                ]}
              >
                <Text style={[styles.ageLabel, selectedAge === group.id && styles.selectedText]}>
                  {group.label}
                </Text>
                <Text style={[styles.ageRange, selectedAge === group.id && styles.selectedRange]}>
                  {group.range}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Card variant="elevated" style={styles.formCard}>
          <Text style={styles.label}>Known Medical Conditions</Text>
          <View style={styles.chipGrid}>
            {CONDITIONS.map((c) => (
              <Pressable 
                key={c}
                onPress={() => toggleCondition(c)}
                style={[
                  styles.chip,
                  selectedConditions.includes(c) && styles.selectedChip
                ]}
              >
                <Text style={[styles.chipText, selectedConditions.includes(c) && styles.selectedText]}>
                  {c}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.label, styles.mt]}>Allergies</Text>
          <TextInput 
            style={styles.input}
            placeholder="e.g. Penicillin, Peanuts"
            placeholderTextColor={COLORS.textSecondary}
          />
        </Card>

        <Card variant="elevated" style={styles.formCard}>
          <Text style={styles.label}>Emergency Contact</Text>
          <TextInput 
            style={styles.input}
            placeholder="Contact Name"
            placeholderTextColor={COLORS.textSecondary}
          />
          <TextInput 
            style={[styles.input, styles.mtSmall]}
            placeholder="Phone Number"
            keyboardType="phone-pad"
            placeholderTextColor={COLORS.textSecondary}
          />
        </Card>

        <View style={styles.footer}>
          <Button 
            title="Save & Continue" 
            onPress={() => router.push('/onboarding/household-setup')}
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
    marginTop: 4,
  },
  formCard: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    fontSize: 16,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  section: {
    marginBottom: SPACING.sectionGap,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  ageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  ageTile: {
    width: '48%',
    backgroundColor: COLORS.surfaceElevated,
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    elevation: 2,
  },
  selectedTile: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.state.monitor.surface,
  },
  ageLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  ageRange: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  selectedText: {
    color: COLORS.primary,
  },
  selectedRange: {
    color: COLORS.primary,
    opacity: 0.8,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedChip: {
    backgroundColor: COLORS.state.monitor.surface,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  mt: {
    marginTop: SPACING.xl,
  },
  mtSmall: {
    marginTop: SPACING.md,
  },
  footer: {
    marginTop: SPACING.xl,
  }
});
