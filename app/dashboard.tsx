import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../lib/AuthContext';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to ABCApp!</Text>
      
      <View style={styles.userInfo}>
        <Text style={styles.userLabel}>Signed in as:</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      <Text style={styles.subtitle}>
        You've successfully authenticated via magic link.
      </Text>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#012F47',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  userInfo: {
    marginBottom: 30,
    alignItems: 'center',
  },
  userLabel: {
    fontSize: 16,
    color: '#659CBB',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#659CBB',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  signOutButton: {
    backgroundColor: '#780001',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  signOutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});