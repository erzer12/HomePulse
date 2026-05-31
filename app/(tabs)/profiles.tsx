import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, LayoutAnimation, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS } from '@/constants/colors';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MotionView } from '@/components/ui/MotionView';
import { DURATION } from '@/constants/motion';
import { ChevronDown, ChevronUp, CircleDot, Activity, Clock } from 'lucide-react-native';

const MOCK_PROFILES = [
  {
    id: '1',
    name: 'Rohan',
    age: 'Child (8 yrs)',
    conditions: ['Asthma'],
    activeCase: true,
    lastCheck: '2 hours ago',
    stateLevel: 2,
  },
  {
    id: '2',
    name: 'Meera',
    age: 'Infant (10 months)',
    conditions: ['None'],
    activeCase: false,
    lastCheck: 'Yesterday',
    stateLevel: 1,
  },
];

export default function ProfilesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Family Profiles</Text>
          <Text style={styles.subtitle}>Manage details for everyone you care for.</Text>
        </View>

        <View style={styles.list}>
          {MOCK_PROFILES.map((profile, index) => {
            const isExpanded = expandedId === profile.id;
            
            return (
              <MotionView 
                key={profile.id} 
                delay={index * DURATION.stagger}
              >
                <Card variant="elevated" style={styles.profileCard}>
                  <Pressable 
                    style={styles.profilePressable}
                    onPress={() => toggleExpand(profile.id)}
                  >
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{profile.name[0]}</Text>
                      {profile.activeCase && (
                        <View style={styles.activeIndicator}>
                          <CircleDot size={12} color={COLORS.state.care.primary} fill={COLORS.state.care.primary} />
                        </View>
                      )}
                    </View>

                    <View style={styles.info}>
                      <Text style={styles.name}>{profile.name}</Text>
                      <Text style={styles.details}>{profile.age}</Text>
                    </View>

                    {isExpanded ? (
                      <ChevronUp size={20} color={COLORS.primary} />
                    ) : (
                      <ChevronDown size={20} color={COLORS.textSecondary} />
                    )}
                  </Pressable>

                  {isExpanded && (
                    <View style={styles.expandedContent}>
                      <View style={styles.divider} />
                      
                      <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                          <Activity size={16} color={COLORS.textSecondary} />
                          <Text style={styles.metaText}>
                            {profile.conditions.length > 0 && profile.conditions[0] !== 'None' 
                              ? profile.conditions.join(', ') 
                              : 'No chronic conditions'}
                          </Text>
                        </View>
                        <View style={styles.metaItem}>
                          <Clock size={16} color={COLORS.textSecondary} />
                          <Text style={styles.metaText}>Last check: {profile.lastCheck}</Text>
                        </View>
                      </View>

                      <View style={styles.actionRow}>
                        <Button 
                          title="Start Check" 
                          size="normal"
                          onPress={() => router.push('/symptom-check/select-symptom')}
                          style={styles.actionButton}
                        />
                        <Button 
                          title="Edit Profile" 
                          variant="outline"
                          size="normal"
                          onPress={() => {}}
                          style={styles.actionButton}
                        />
                      </View>
                    </View>
                  )}
                </Card>
              </MotionView>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Button 
            title="Add New Profile" 
            variant="outline"
            onPress={() => router.push('/onboarding/create-profile')}
            style={styles.addButton}
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
    paddingBottom: 100,
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
  list: {
    marginBottom: SPACING.sectionGap,
  },
  profileCard: {
    padding: 0,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  profilePressable: {
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.state.monitor.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.state.monitor.text,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 2,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  details: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  expandedContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  metaRow: {
    marginBottom: SPACING.lg,
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  actionButton: {
    flex: 1,
    height: 48,
  },
  footer: {
    marginTop: SPACING.md,
  },
  addButton: {
    borderStyle: 'dashed',
    height: 60,
  }
});
