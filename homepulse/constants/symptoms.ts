import type { SymptomCategory } from '../types/triage';

export interface SymptomDefinition {
  category: SymptomCategory;
  label: string;
  labelHi: string;
  iconName: string;
  color: string;
  followUpQuestions: string[];
}

export const SYMPTOMS: SymptomDefinition[] = [
  {
    category: 'fever',
    label: 'Fever',
    labelHi: 'बुखार',
    iconName: 'thermometer',
    color: '#DC2626',
    followUpQuestions: [
      'How long has the fever been present?',
      'What is the temperature reading? (if thermometer available)',
      'Has the fever been going up or staying the same?',
      'Is the person drinking fluids?',
    ],
  },
  {
    category: 'respiratory',
    label: 'Breathing',
    labelHi: 'सांस',
    iconName: 'wind',
    color: '#2563EB',
    followUpQuestions: [
      'Is there difficulty breathing or shortness of breath?',
      'Is there a cough? Is it dry or productive?',
      'Can the person speak in full sentences?',
    ],
  },
  {
    category: 'gastrointestinal',
    label: 'Stomach / Vomiting',
    labelHi: 'पेट / उल्टी',
    iconName: 'activity',
    color: '#D97706',
    followUpQuestions: [
      'Is there vomiting? How many times in the last 6 hours?',
      'Is there diarrhea?',
      'Is the person able to keep fluids down?',
    ],
  },
  {
    category: 'dehydration',
    label: 'Dehydration',
    labelHi: 'निर्जलीकरण',
    iconName: 'droplets',
    color: '#7C3AED',
    followUpQuestions: [
      'Has the person urinated in the last 8 hours?',
      'Are the lips and mouth dry?',
      'Is the person drinking fluids?',
    ],
  },
  {
    category: 'neurological',
    label: 'Confusion / Seizure',
    labelHi: 'भ्रम / दौरा',
    iconName: 'brain',
    color: '#DC2626',
    followUpQuestions: [
      'Is the person confused or not responding normally?',
      'Has there been any seizure or convulsion?',
      'Is the person able to recognize family members?',
    ],
  },
  {
    category: 'pain',
    label: 'Pain',
    labelHi: 'दर्द',
    iconName: 'zap',
    color: '#EA580C',
    followUpQuestions: [
      'Where is the pain located?',
      'How severe is the pain (1–10)?',
      'Is it chest pain or abdominal pain?',
    ],
  },
  {
    category: 'weakness',
    label: 'Weakness / Fatigue',
    labelHi: 'कमज़ोरी',
    iconName: 'battery-low',
    color: '#6B7280',
    followUpQuestions: [
      'Is the person able to stand and walk?',
      'How long has the weakness been present?',
      'Is this worse than usual for this person?',
    ],
  },
];

export const SYMPTOM_BY_CATEGORY = Object.fromEntries(SYMPTOMS.map((s) => [s.category, s])) as Record<
  SymptomCategory,
  SymptomDefinition
>;
