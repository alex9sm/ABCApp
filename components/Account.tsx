import { Button, Input } from '@rneui/themed'
import { Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { Alert, StyleSheet, View } from 'react-native'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../utils/supabase'

export default function Account({ session }: { session: Session }) {
  const { signOut } = useAuth()
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState(session?.user?.email || '')
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    setLoading(false)
    setEmail(session?.user?.email || '')
  }, [session?.user?.email])

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const checkEmailExists = async (newEmail: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('email')
        .eq('email', newEmail)
        .neq('id', session?.user?.id)
        .single()
      
      if (error && error.code === 'PGRST116') {
        // No rows returned, email doesn't exist
        return false
      }
      
      if (error) {
        throw error
      }
      
      // Email exists
      return true
    } catch (error) {
      console.error('Error checking email:', error)
      return false
    }
  }

  const updateEmail = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter an email address')
      return
    }

    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address')
      return
    }

    if (email === session?.user?.email) {
      Alert.alert('Info', 'Email is already up to date')
      return
    }

    try {
      setIsUpdating(true)
      
      // Check if email already exists
      const emailExists = await checkEmailExists(email)
      if (emailExists) {
        Alert.alert('Error', 'This email address is already in use by another account')
        return
      }

      // Update auth user email
      const { error: authError } = await supabase.auth.updateUser({
        email: email.trim()
      })

      if (authError) {
        throw authError
      }

      // Update public users table
      const { error: userError } = await supabase
        .from('users')
        .update({ email: email.trim() })
        .eq('id', session?.user?.id)

      if (userError) {
        throw userError
      }

      Alert.alert('Success', 'Email updated successfully! Please check your new email for a confirmation link.')
    } catch (error) {
      console.error('Error updating email:', error)
      if (error instanceof Error) {
        Alert.alert('Error', error.message)
      } else {
        Alert.alert('Error', 'Failed to update email. Please try again.')
      }
      // Reset email to original value on error
      setEmail(session?.user?.email || '')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.inputContainer}>
          <Input 
            label="Email" 
            value={email}
            onChangeText={setEmail}
            disabled={isUpdating}
            containerStyle={styles.inputWrapper}
            inputContainerStyle={styles.inputBox}
            inputStyle={styles.inputText}
            labelStyle={styles.inputLabel}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button 
            title={isUpdating ? "Updating..." : "Update Email"}
            onPress={updateEmail}
            disabled={isUpdating || email === session?.user?.email}
            buttonStyle={[styles.updateButton, (isUpdating || email === session?.user?.email) && styles.disabledButton]}
            titleStyle={styles.buttonText}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button 
            title="Sign Out" 
            onPress={signOut}
            buttonStyle={styles.signOutButton}
            titleStyle={styles.buttonText}
          />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#012F47',
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputWrapper: {
    marginBottom: 0,
  },
  inputBox: {
    backgroundColor: '#001E2D',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#659CBB',
  },
  inputText: {
    color: 'white',
    fontSize: 16,
  },
  inputLabel: {
    color: '#659CBB',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 15,
  },
  updateButton: {
    backgroundColor: '#659CBB',
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 10,
  },
  disabledButton: {
    backgroundColor: '#999',
  },
  signOutButton: {
    backgroundColor: '#C10F1F',
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  mt20: {
    marginTop: 20,
  },
})