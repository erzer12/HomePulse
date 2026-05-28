import type { Patient } from '../types/patient';

const seededPatients: Patient[] = [
  { id: 'p1', name: 'Asha', age_group: 'child', chronic_conditions: [] },
  { id: 'p2', name: 'Rohan', age_group: 'adult', chronic_conditions: ['asthma'] },
  { id: 'p3', name: 'Maya', age_group: 'elderly', chronic_conditions: ['hypertension'] },
  { id: 'p4', name: 'Kabir', age_group: 'infant', age_months: 4, chronic_conditions: [] },
  { id: 'p5', name: 'Nina', age_group: 'child', chronic_conditions: ['allergy'] },
];

console.log('Seeded WHO IMCI test profiles:', seededPatients.length);
