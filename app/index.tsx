import { useState, useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import Auth from '../components/Auth'
import OTPVerification from '../components/OTPVerification'
import MainTabs from '../components/MainTabs'
import ZipCodeLookup from '../components/ZipCodeLookup'
import { AuthProvider, useAuth } from '../contexts/AuthContext'
import { supabase } from '../utils/supabase'

function AuthFlow() {
  const { session, loading } = useAuth()
  const [currentStep, setCurrentStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [userHasHomeStore, setUserHasHomeStore] = useState<boolean | null>(null)
  const [checkingHomeStore, setCheckingHomeStore] = useState(false)

  const handleEmailSubmitted = (submittedEmail: string) => {
    setEmail(submittedEmail)
    setCurrentStep('otp')
  }

  const handleGoBack = () => {
    setCurrentStep('email')
  }

  const handleStoreSelected = async (storeId: string) => {
    if (!session?.user) return
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ home_store_id: storeId })
        .eq('id', session.user.id)
      
      if (!error) {
        setUserHasHomeStore(true)
      }
    } catch (error) {
      console.error('Error updating home store:', error)
    }
  }

  useEffect(() => {
    const checkUserHomeStore = async () => {
      if (session?.user && userHasHomeStore === null && !checkingHomeStore) {
        setCheckingHomeStore(true)
        try {
          const { data, error } = await supabase
            .from('users')
            .select('home_store_id')
            .eq('id', session.user.id)
            .single()
          
          if (!error && data) {
            const hasValidHomeStore = data.home_store_id && data.home_store_id !== '000'
            setUserHasHomeStore(hasValidHomeStore)
          }
        } catch (error) {
          console.error('Error checking home store:', error)
          setUserHasHomeStore(false)
        } finally {
          setCheckingHomeStore(false)
        }
      }
    }

    checkUserHomeStore()
  }, [session])

  if (loading || checkingHomeStore) {
    return <View style={styles.container} />
  }

  if (session && session.user) {
    if (userHasHomeStore === false) {
      return <ZipCodeLookup onStoreSelected={handleStoreSelected} />
    }
    return <MainTabs />
  }

  return (
    <View style={styles.container}>
      {currentStep === 'email' ? (
        <Auth onEmailSubmitted={handleEmailSubmitted} />
      ) : (
        <OTPVerification email={email} onGoBack={handleGoBack} />
      )}
    </View>
  )
}

export default function Index() {
  return (
    <AuthProvider>
      <AuthFlow />
    </AuthProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
