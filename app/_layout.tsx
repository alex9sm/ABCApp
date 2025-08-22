import * as Linking from "expo-linking";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { MagicLinkHandler } from "../components/MagicLinkHandler";
import { AuthProvider, useAuth } from "../lib/AuthContext";
import { DeepLinkResult, isMagicLink } from "../lib/supabase";

function AppContent() {
  const [pendingDeepLink, setPendingDeepLink] = useState<string | null>(null);
  const [showMagicLinkHandler, setShowMagicLinkHandler] = useState(false);
  const { user, loading, initialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Handle initial URL if app was opened via deep link
    const handleInitialURL = async () => {
      const url = await Linking.getInitialURL();
      if (url) {
        handleIncomingURL(url);
      }
    };

    // Handle URL changes while app is running
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleIncomingURL(url);
    });

    handleInitialURL();

    return () => {
      subscription?.remove();
    };
  }, []);

  // Handle authentication state changes and routing
  useEffect(() => {
    if (!initialized || loading) return;

    // If user is authenticated and we're not showing the magic link handler
    if (user && !showMagicLinkHandler) {
      // Navigate to main app
      console.log('User authenticated, navigating to dashboard');
      router.replace('/dashboard');
    }
  }, [user, initialized, loading, showMagicLinkHandler, router]);

  const handleIncomingURL = (url: string) => {
    console.log('Incoming URL:', url);
    
    if (isMagicLink(url)) {
      setPendingDeepLink(url);
      setShowMagicLinkHandler(true);
    } else {
      // Handle non-auth deep links here
      console.log('Non-auth deep link received:', url);
    }
  };

  const handleMagicLinkProcessed = (result: DeepLinkResult) => {
    console.log('Magic link processed:', result);
    
    setTimeout(() => {
      setShowMagicLinkHandler(false);
      setPendingDeepLink(null);
      
      if (result.success && result.isAuthLink) {
        // Successfully authenticated via magic link
        console.log('Magic link authentication successful');
        // Navigation will be handled by the useEffect above when user state updates
      } else if (!result.success && result.isAuthLink) {
        // Magic link failed, user will see error in MagicLinkHandler
        console.error('Magic link authentication failed:', result.error);
        // Stay on login page to allow retry
      }
    }, result.success ? 1500 : 3000); // Show success briefly, error longer
  };

  return (
    <>
      <Stack>
        <Stack.Screen 
          name="index" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="dashboard" 
          options={{ headerShown: false }} 
        />
        {/* Add more screens here as your app grows */}
      </Stack>
      
      {/* Magic Link Handler Overlay */}
      {showMagicLinkHandler && pendingDeepLink && (
        <MagicLinkHandler
          url={pendingDeepLink}
          onProcessed={handleMagicLinkProcessed}
        />
      )}
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
