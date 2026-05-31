import { Stack } from 'expo-router';

export default function SymptomCheckLayout() {
  return (
    <Stack 
      screenOptions={{ 
        headerShown: false, // Use custom UI headers for a more immersive flow
      }} 
    />
  );
}
