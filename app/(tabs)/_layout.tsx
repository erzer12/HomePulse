import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name='home' options={{ title: 'Home' }} />
      <Tabs.Screen name='profiles' options={{ title: 'Profiles' }} />
      <Tabs.Screen name='history' options={{ title: 'History' }} />
    </Tabs>
  );
}
