import { Ionicons } from '@expo/vector-icons'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import MenuScreen from './MenuScreen'
import ProfileScreen from './ProfileScreen'
import SearchScreen from './SearchScreen'

const Tab = createBottomTabNavigator()

export default function MainTabs() {
  return (
    <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap

            if (route.name === 'Search') {
              iconName = focused ? 'search' : 'search-outline'
            } else if (route.name === 'Menu') {
              iconName = focused ? 'menu' : 'menu-outline'
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline'
            } else {
              iconName = 'help-outline'
            }

            return <Ionicons name={iconName} size={size} color={color} />
          },
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: '#D8D8D8',
          tabBarStyle: {
            backgroundColor: '#001E2D',
            borderTopWidth: 1,
            borderTopColor: '#001E2D',
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Search" component={SearchScreen} />
        <Tab.Screen name="Menu" component={MenuScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
  )
}