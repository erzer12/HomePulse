import { Tabs } from 'expo-router';
import { Pressable } from 'react-native';
import { Home, Users, History } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.surfaceElevated,
          borderTopColor: COLORS.border,
          height: 70, // Increased height
          paddingBottom: 12, // More bottom padding for labels
          paddingTop: 8,
        },
        tabBarButton: (props) => (
          <Pressable 
            {...props} 
            android_ripple={null} // Remove the old splash effect
            style={({ pressed }) => [
              props.style,
              { opacity: pressed ? 0.7 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }
            ]}
          />
        ),
        headerShown: false,
      }}
    >
      <Tabs.Screen 
        name='home' 
        options={{ 
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }} 
      />
      <Tabs.Screen 
        name='profiles' 
        options={{ 
          title: 'Profiles',
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
        }} 
      />
      <Tabs.Screen 
        name='history' 
        options={{ 
          title: 'History',
          tabBarIcon: ({ color, size }) => <History color={color} size={size} />,
        }} 
      />
    </Tabs>
  );
}
