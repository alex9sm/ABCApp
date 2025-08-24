import { Button, Input } from '@rneui/base'
import { useState } from 'react'
import { Alert, AppState, StyleSheet, Text, View } from 'react-native'
import { supabase } from '../utils/supabase'

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})

interface AuthProps {
  onEmailSubmitted: (email: string) => void
}

export default function Auth({ onEmailSubmitted }: AuthProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  async function handleContinue() {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address')
      return
    }

    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address')
      return
    }

    setLoading(true)
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      })

      if (error) {
        Alert.alert('Error', error.message)
      } else {
        onEmailSubmitted(email.trim())
      }
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.subtitle}>Sign in or create an account</Text>
      
      <View style={[styles.verticallySpaced]}>
        <Input
          placeholder="email@address.com"
          containerStyle={styles.inputContainer}
          inputContainerStyle={styles.inputBox}
          inputStyle={styles.inputText}
          placeholderTextColor="#999"
          onChangeText={(text: string) => setEmail(text)}
          value={email}
          autoCapitalize={'none'}
          keyboardType="email-address"
          autoComplete="email"
        />
      </View>
      
      <View style={[styles.verticallySpaced]}>
        <Button 
          title={loading ? "Sending..." : "Continue"} 
          disabled={loading || !email.trim()} 
          onPress={handleContinue}
          buttonStyle={styles.button}
          disabledStyle={styles.button}
          disabledTitleStyle={styles.buttonText}
          titleStyle={styles.buttonText}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: '#012F47',
    flex: 1,
  },
  title: {
    marginTop: 250,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#ccc',
    marginBottom: 40,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  inputContainer: {
    marginBottom: 10,
  },
  inputBox: {
    backgroundColor: '#001E2D',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginHorizontal: 20,
  },
  button: {
    backgroundColor: '#659CBB',
    borderRadius: 8,
    paddingVertical: 16,
    marginHorizontal: 29,
  },
  inputText: {
    color: 'white',
    fontSize: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
})