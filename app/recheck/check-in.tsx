import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TextInput } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS } from '@/constants/colors';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Thermometer, Droplet, Activity } from 'lucide-react-native';

export default function CheckInScreen() {
  const router = useRouter();
  const [temp, setTemp] = useState('38.2');

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Condition Recheck',
          headerStyle: { backgroundColor: COLORS.background },
          headerShadowVisible: false,
        }} 
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Update Rohan's Status</Text>
          <Text style={styles.subtitle}>Let's see if the symptoms have changed.</Text>
        </View>

        <Card variant="elevated" style={styles.vitalCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: COLORS.state.urgent.surface }]}>
              <Thermometer color={COLORS.state.urgent.primary} />
            </View>
            <Text style={styles.label}>Current Temperature</Text>
          </View>
          <View style={styles.inputRow}>
            <TextInput 
              style={styles.tempInput}
              value={temp}
              onChangeText={setTemp}
              keyboardType="decimal-pad"
            />
            <Text style={styles.unit}>°C</Text>
          </View>
        </Card>

        <Card style={styles.choiceCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: COLORS.state.monitor.surface }]}>
              <Droplet color={COLORS.state.monitor.primary} />
            </View>
            <Text style={styles.label}>Hydration Level</Text>
          </View>
          <View style={styles.optionGrid}>
            {['Normal', 'Reduced', 'Poor'].map((level) => (
              <Button 
                key={level}
                title={level} 
                variant={level === 'Normal' ? 'primary' : 'outline'}
                size="normal"
                style={styles.optionButton}
                fullWidth={false}
              />
            ))}
          </View>
        </Card>

        <Card style={styles.choiceCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: COLORS.state.teleconsult.surface }]}>
              <Activity color={COLORS.state.teleconsult.primary} />
            </View>
            <Text style={styles.label}>Alertness</Text>
          </View>
          <View style={styles.optionGrid}>
            {['Alert', 'Sleepy', 'Drowsy'].map((level) => (
              <Button 
                key={level}
                title={level} 
                variant={level === 'Alert' ? 'primary' : 'outline'}
                size="normal"
                style={styles.optionButton}
                fullWidth={false}
              />
            ))}
          </View>
        </Card>

        <View style={styles.footer}>
          <Button 
            title="Analyze Update" 
            onPress={() => router.push('/result/action-state')}
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
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  vitalCard: {
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  label: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tempInput: {
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  unit: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginLeft: 8,
    marginTop: 12,
  },
  choiceCard: {
    marginBottom: SPACING.lg,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    minWidth: '30%',
    height: 48,
  },
  footer: {
    marginTop: SPACING.xl,
  }
});
