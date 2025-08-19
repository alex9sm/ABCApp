import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, Animated, Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { AuthGuard } from '../components/AuthGuard';
import { useAuth } from '../contexts/AuthContext';

const { width: screenWidth } = Dimensions.get('window');

export default function Index() {
  const { user, signOut } = useAuth();
  const [currentPage, setCurrentPage] = useState('watchlist'); // 'watchlist' or 'search'
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;

  const toggleProfile = () => {
    const toValue = isProfileOpen ? 0 : 1;
    setIsProfileOpen(!isProfileOpen);
    
    Animated.timing(slideAnim, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
                      onPress: async () => {
              await signOut();
              router.replace('../app/(auth)/signin');
            }
        }
      ]
    );
  };

  const exitSearch = () => {
    setCurrentPage('watchlist');
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationX } = event.nativeEvent;
      const shouldSwitch = Math.abs(translationX) > screenWidth * 0.1;

      if (shouldSwitch) {
        if (translationX > 0 && currentPage === 'watchlist') {
          // Swipe right from watchlist to search
          setCurrentPage('search');
        } else if (translationX < 0 && currentPage === 'search') {
          // Swipe left from search to watchlist
          setCurrentPage('watchlist');
        }
      }

      // Reset the translation with timing instead of spring to reduce bounce
      Animated.timing(translateX, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  const renderWatchlistPage = () => (
    <View style={styles.pageContent}>
      <Text style={styles.pageTitle}>Watchlist</Text>
      <Text style={styles.pageSubtitle}>Your saved items will appear here</Text>
    </View>
  );

  const renderSearchPage = () => (
    <TouchableWithoutFeedback onPress={exitSearch}>
      <View style={styles.pageContent}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor="#666"
          />
          <TouchableOpacity style={styles.searchIcon}>
            <Ionicons name="search" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );

  return (
    <AuthGuard>
      <View style={styles.container}>
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
        >
          <Animated.View 
            style={[
              styles.content,
              {
                transform: [{ translateX }]
              }
            ]}
          >
            {currentPage === 'watchlist' ? renderWatchlistPage() : renderSearchPage()}
          </Animated.View>
        </PanGestureHandler>
      
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={() => setCurrentPage('search')}
        >
          <Ionicons 
            name="search" 
            size={30} 
            color={'white'} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => setCurrentPage('watchlist')}
        >
          <Ionicons 
            name="menu" 
            size={30} 
            color={'white'} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.iconButton} onPress={toggleProfile}>
          <Ionicons name="person" size={30} color="white" />
        </TouchableOpacity>
      </View>

      {/* Profile Sliding Tab */}
      <Animated.View 
        style={[
          styles.profileTab,
          {
            transform: [{
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [400, 0],
              })
            }]
          }
        ]}
      >
        <View style={styles.profileHeader}>
          <View style={styles.profileInfo}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color="white" />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.username}>{user?.email?.split('@')[0] || 'User'}</Text>
              <Text style={styles.email}>{user?.email || 'user@example.com'}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={toggleProfile} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.optionsSection}>
          <TouchableOpacity style={styles.optionItem} onPress={handleSignOut}>
            <View style={styles.optionLeft}>
              <Ionicons name="log-out-outline" size={20} color="#ff6b6b" />
              <Text style={[styles.optionText, { color: '#ff6b6b' }]}>Sign Out</Text>
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>
      </View>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#002F47",
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 60,
  },
  pageContent: {
    width: '100%',
    paddingHorizontal: 20,
  },
  pageTitle: {
    color: "white",
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  pageSubtitle: {
    color: "#ccc",
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    marginRight: 10,
  },
  searchIcon: {
    padding: 5,
  },
  bottomBar: {
    backgroundColor: '#780001',
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  iconButton: {
    padding: 10,
  },
  profileTab: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    maxHeight: '70%'
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  userDetails: {
    flex: 1,
  },
  username: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    color: '#ccc',
    fontSize: 14,
  },
  closeButton: {
    padding: 5,
  },
  optionsSection: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 20,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 15,
  },
});
