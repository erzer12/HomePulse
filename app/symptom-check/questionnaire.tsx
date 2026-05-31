import React, { useState, useMemo, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, TextInput, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, ChevronLeft, Check } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS } from '@/constants/colors';
import { DURATION, EASING } from '@/constants/motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';

// --- Fever Question Set (Mock based on Spec) ---
const FEVER_QUESTIONS = [
  { id: 'fever_duration', text: 'How long has the fever been present?', hint: 'Count from the very first time you noticed the heat.', type: 'choice', options: [{ label: 'Less than 2 days', value: '<2d' }, { label: '2 to 5 days', value: '2-5d' }, { label: 'More than 5 days', value: '>5d' }] },
  { id: 'has_thermometer', text: 'Do you have a digital thermometer?', hint: 'A thermometer helps us give much more accurate advice.', type: 'boolean' },
  { id: 'temp_reading', text: 'What is the temperature reading?', hint: 'Use the thermometer under the arm or in the mouth.', type: 'numeric', unit: '°C' },
  { id: 'is_drinking', text: 'Is Rohan drinking fluids normally?', hint: 'Offer a few sips of water to check.', type: 'choice', options: [{ label: 'Yes, normally', value: 'yes' }, { label: 'Less than usual', value: 'less' }, { label: 'No, not at all', value: 'no' }] },
  { id: 'breathing_diff', text: 'Is there any difficulty breathing?', hint: 'Look at his chest — is it moving faster than usual?', type: 'boolean' },
  { id: 'alertness', text: 'How alert is Rohan right now?', hint: 'Try calling his name or touching his shoulder.', type: 'choice', options: [{ label: 'Fully Alert', value: 'alert' }, { label: 'Sleepy / Drowsy', value: 'drowsy' }, { label: 'Confused', value: 'confused' }, { label: 'Unresponsive', value: 'unresponsive' }] },
];

export default function QuestionnaireScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [inputValue, setInputValue] = useState('');
  
  // Animation state
  const contentFade = useRef(new Animated.Value(1)).current;

  const currentQuestion = FEVER_QUESTIONS[currentIndex];
  const progress = (currentIndex + 1) / FEVER_QUESTIONS.length;

  const transitionToNext = (nextIndex: number) => {
    // Phase 1: Fade out
    Animated.timing(contentFade, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      // Phase 2: Update state
      setCurrentIndex(nextIndex);
      setInputValue('');
      
      // Phase 3: Fade back in
      Animated.timing(contentFade, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleNext = () => {
    if (currentIndex < FEVER_QUESTIONS.length - 1) {
      transitionToNext(currentIndex + 1);
    } else {
      router.push('/symptom-check/household-check');
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      transitionToNext(currentIndex - 1);
    } else {
      router.back();
    }
  };

  const saveAnswer = (value: any) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
    if (currentQuestion.type !== 'numeric') {
      setTimeout(handleNext, 300);
    }
  };

  const isAnswered = answers[currentQuestion.id] !== undefined || inputValue !== '';

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.iconButton}>
          <X color={COLORS.textPrimary} size={24} />
        </Pressable>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>Step {currentIndex + 1} of {FEVER_QUESTIONS.length}</Text>
          <ProgressBar progress={progress} color={COLORS.primary} style={styles.progressBar} />
        </View>
        <Pressable onPress={handleBack} style={styles.iconButton}>
          <ChevronLeft color={COLORS.textPrimary} size={24} />
        </Pressable>
      </View>

      <Animated.ScrollView 
        style={{ opacity: contentFade, transform: [{ translateY: contentFade.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }}
        contentContainerStyle={styles.scrollContent} 
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.questionSection}>
          <Text style={styles.questionText}>{currentQuestion.text}</Text>
          {currentQuestion.hint && <Text style={styles.hintText}>{currentQuestion.hint}</Text>}
        </View>

        <View style={styles.inputSection}>
          {currentQuestion.type === 'boolean' && (
            <View style={styles.booleanContainer}>
              <Pressable onPress={() => saveAnswer(true)} style={[styles.booleanButton, answers[currentQuestion.id] === true && styles.booleanActive]}>
                <Text style={[styles.booleanLabel, answers[currentQuestion.id] === true && styles.textWhite]}>YES</Text>
              </Pressable>
              <Pressable onPress={() => saveAnswer(false)} style={[styles.booleanButton, answers[currentQuestion.id] === false && styles.booleanNoActive]}>
                <Text style={[styles.booleanLabel, answers[currentQuestion.id] === false && styles.textWhite]}>NO</Text>
              </Pressable>
            </View>
          )}

          {currentQuestion.type === 'choice' && (
            <View style={styles.choiceContainer}>
              {currentQuestion.options?.map((opt) => (
                <Pressable key={opt.value} onPress={() => saveAnswer(opt.value)} style={[styles.choiceItem, answers[currentQuestion.id] === opt.value && styles.choiceActive]}>
                  <Text style={[styles.choiceLabel, answers[currentQuestion.id] === opt.value && styles.textPrimary]}>{opt.label}</Text>
                  {answers[currentQuestion.id] === opt.value && <Check size={20} color={COLORS.primary} />}
                </Pressable>
              ))}
            </View>
          )}

          {currentQuestion.type === 'numeric' && (
            <View style={styles.numericContainer}>
              <Card variant="elevated" style={styles.numericDisplay}>
                <TextInput style={styles.numericInput} value={inputValue} onChangeText={setInputValue} placeholder="0.0" keyboardType="decimal-pad" autoFocus />
                <Text style={styles.unitText}>{currentQuestion.unit}</Text>
              </Card>
              <Text style={styles.numericHint}>Enter reading from your device</Text>
            </View>
          )}
        </View>
      </Animated.ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + SPACING.lg }]}>
        <Button 
          title={currentIndex === FEVER_QUESTIONS.length - 1 ? "Finish Assessment" : "Next Question"} 
          onPress={handleNext}
          disabled={!isAnswered && currentQuestion.type === 'numeric'}
        />
        <Pressable onPress={handleBack} style={styles.prevLink}>
          <Text style={styles.prevLinkText}>Previous Question</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  iconButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  progressContainer: { flex: 1, alignItems: 'center', paddingHorizontal: SPACING.xl },
  progressText: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary, textTransform: 'uppercase', marginBottom: 4 },
  progressBar: { height: 6, width: '100%' },
  scrollContent: { padding: SPACING.screenEdge, paddingBottom: 120 },
  questionSection: { marginTop: SPACING.xl, marginBottom: SPACING.xxxl },
  questionText: { fontSize: 28, fontWeight: '800', color: COLORS.textPrimary, lineHeight: 36 },
  hintText: { fontSize: 16, color: COLORS.textSecondary, marginTop: SPACING.md, lineHeight: 22 },
  inputSection: { flex: 1 },
  booleanContainer: { gap: SPACING.md },
  booleanButton: { height: 70, backgroundColor: COLORS.surfaceElevated, borderRadius: RADIUS.xl, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.border },
  booleanActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  booleanNoActive: { backgroundColor: COLORS.textSecondary, borderColor: COLORS.textSecondary },
  booleanLabel: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },
  textWhite: { color: '#FFFFFF' },
  choiceContainer: { gap: SPACING.md },
  choiceItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.xl, backgroundColor: COLORS.surfaceElevated, borderRadius: RADIUS.xl, borderWidth: 2, borderColor: 'transparent', elevation: 2 },
  choiceActive: { borderColor: COLORS.primary, backgroundColor: COLORS.state.monitor.surface },
  choiceLabel: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  textPrimary: { color: COLORS.primary },
  numericContainer: { alignItems: 'center' },
  numericDisplay: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.xxxl, width: '100%', marginBottom: SPACING.lg },
  numericInput: { fontSize: 56, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center' },
  unitText: { fontSize: 24, fontWeight: '600', color: COLORS.textSecondary, marginLeft: 8, marginTop: 16 },
  numericHint: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.background, padding: SPACING.screenEdge, borderTopWidth: 1, borderTopColor: COLORS.border },
  prevLink: { marginTop: SPACING.lg, alignItems: 'center' },
  prevLinkText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, textDecorationLine: 'underline' },
});
