import { Button } from '@rneui/base'
import { useRef, useState } from 'react'
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native'
import { supabase } from '../utils/supabase'

interface OTPVerificationProps {
  email: string
  onGoBack: () => void
}

export default function OTPVerification({ email, onGoBack }: OTPVerificationProps) {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const inputRefs = useRef<(TextInput | null)[]>([])

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code]
    newCode[index] = text

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    setCode(newCode)
  }

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerifyCode = async () => {
    const otpCode = code.join('')
    
    if (otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit code')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: 'email'
      })

      if (error) {
        Alert.alert('Error', error.message)
        setCode(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
      }
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.')
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    setResendLoading(true)

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
        Alert.alert('Success', 'A new code has been sent to your email')
        setCode(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
      }
    } catch {
      Alert.alert('Error', 'Failed to resend code. Please try again.')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Verification Code</Text>
      <Text style={styles.subtitle}>
        We&apos;ve sent a 6-digit code to{'\n'}
        <Text style={styles.email}>{email}</Text>
      </Text>

      <View style={styles.codeContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              inputRefs.current[index] = ref
            }}
            style={styles.codeInput}
            value={digit}
            onChangeText={(text) => handleCodeChange(text.slice(-1), index)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
            keyboardType="numeric"
            maxLength={1}
            textAlign="center"
            autoFocus={index === 0}
          />
        ))}
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
          title={loading ? "Verifying..." : "Verify Code"}
          disabled={loading || code.join('').length !== 6}
          onPress={handleVerifyCode}
          buttonStyle={styles.verifyButton}
          disabledStyle={styles.verifyButton}
          disabledTitleStyle={styles.buttonText}
          titleStyle={styles.buttonText}
        />
      </View>

      <View style={styles.verticallySpaced}>
        <Button
          title={resendLoading ? "Sending..." : "Resend Code"}
          type="outline"
          disabled={resendLoading}
          onPress={handleResendCode}
          buttonStyle={styles.resendButton}
          titleStyle={styles.resendButtonText}
        />
      </View>

      <View style={styles.verticallySpaced}>
        <Button
          title="Back"
          type="clear"
          onPress={onGoBack}
          titleStyle={styles.backButtonText}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    paddingBottom: 300,
    backgroundColor: '#012F47',
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 180,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#E0E0E0',
    marginBottom: 30,
    lineHeight: 22,
  },
  email: {
    fontWeight: 'bold',
    color: 'white',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  codeInput: {
    width: 45,
    height: 50,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    fontSize: 20,
    fontWeight: 'bold',
    backgroundColor: '#001E2D',
    color: 'white',
    textAlign: 'center',
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
  verifyButton: {
    backgroundColor: '#659CBB',
    borderRadius: 8,
    paddingVertical: 16,
    marginHorizontal: 29,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  resendButton: {
    borderColor: '#659CBB',
    borderWidth: 2,
    borderRadius: 8,
    paddingVertical: 16,
    marginHorizontal: 29,
    backgroundColor: 'transparent',
  },
  resendButtonText: {
    color: '#659CBB',
    fontSize: 16,
  },
  backButtonText: {
    color: '#659CBB',
    fontSize: 16,
  },
})