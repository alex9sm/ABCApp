import { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import Auth from '../components/Auth'
import OTPVerification from '../components/OTPVerification'
import MainTabs from '../components/MainTabs'
import { AuthProvider, useAuth } from '../contexts/AuthContext'

function AuthFlow() {
  const { session, loading } = useAuth()
  const [currentStep, setCurrentStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')

  const handleEmailSubmitted = (submittedEmail: string) => {
    setEmail(submittedEmail)
    setCurrentStep('otp')
  }

  const handleGoBack = () => {
    setCurrentStep('email')
  }

  if (loading) {
    return <View style={styles.container} />
  }

  if (session && session.user) {
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
