import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth } from "../lib/AuthContext";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  const { signInWithMagicLink, user, loading } = useAuth();
  const router = useRouter();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user && !loading) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignUp = async () => {
    if (!email.trim()) {
      setMessage({ text: "Please enter your email address", type: 'error' });
      return;
    }

    if (!isValidEmail(email)) {
      setMessage({ text: "Please enter a valid email address", type: 'error' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const { error } = await signInWithMagicLink(email.trim());
      
      if (error) {
        setMessage({ text: error.message || "Failed to send magic link", type: 'error' });
      } else {
        setMessage({ 
          text: "Check your email for a magic link to sign in!", 
          type: 'success' 
        });
        setEmail("");
      }
    } catch (error) {
      setMessage({ text: "An unexpected error occurred", type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account or Sign In</Text>
      
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#659CBB"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isLoading}
        />
        
        {message && (
          <View style={[styles.messageContainer, message.type === 'error' ? styles.errorMessage : styles.successMessage]}>
            <Text style={styles.messageText}>{message.text}</Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={[styles.signUpButton, isLoading && styles.disabledButton]} 
          onPress={handleSignUp}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.signUpButtonText}>Continue</Text>
          )}
        </TouchableOpacity>
        
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#012F47",
  },
  title: {
    textAlign: "center",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 40,
    color: "#FFFFFF",
  },
  form: {
    width: "100%",
    maxWidth: 400,
  },
  input: {
    backgroundColor: "#001E2E",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    color: "#FFFFFF",
  },
  messageContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  successMessage: {
    backgroundColor: "#1B5E20",
    borderColor: "#4CAF50",
    borderWidth: 1,
  },
  errorMessage: {
    backgroundColor: "#B71C1C",
    borderColor: "#F44336",
    borderWidth: 1,
  },
  messageText: {
    color: "#FFFFFF",
    fontSize: 14,
    textAlign: "center",
  },
  signUpButton: {
    backgroundColor: "#780001",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: "#4A0001",
    opacity: 0.7,
  },
  signUpButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  signInLink: {
    marginTop: 20,
    alignItems: "center",
  },
  signInLinkText: {
    color: "#659CBB",
    fontSize: 16,
  },
});
