import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { handleDeepLink, isMagicLink, DeepLinkResult } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

interface MagicLinkHandlerProps {
  url: string;
  onProcessed: (result: DeepLinkResult) => void;
}

export const MagicLinkHandler: React.FC<MagicLinkHandlerProps> = ({ url, onProcessed }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<DeepLinkResult | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const processLink = async () => {
      if (!url || !isMagicLink(url)) {
        onProcessed({ success: true, isAuthLink: false });
        return;
      }

      setIsProcessing(true);
      
      try {
        const result = await handleDeepLink(url);
        setResult(result);
        onProcessed(result);
      } catch (error: any) {
        const errorResult = {
          success: false,
          error: 'Failed to process magic link',
          isAuthLink: true,
        };
        setResult(errorResult);
        onProcessed(errorResult);
      } finally {
        setIsProcessing(false);
      }
    };

    processLink();
  }, [url, onProcessed]);

  // Don't render anything if not processing a magic link
  if (!url || !isMagicLink(url)) {
    return null;
  }

  // Show processing state
  if (isProcessing) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color="#659CBB" />
          <Text style={styles.processingText}>Signing you in...</Text>
        </View>
      </View>
    );
  }

  // Show error state
  if (result && !result.success && result.isAuthLink) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.errorText}>Authentication Failed</Text>
          <Text style={styles.errorMessage}>
            {result.error || 'The magic link is invalid or has expired.'}
          </Text>
          <Text style={styles.helpText}>
            Please try requesting a new magic link from the login page.
          </Text>
        </View>
      </View>
    );
  }

  // Show success state briefly before navigation
  if (result && result.success && result.isAuthLink && user) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.successText}>Welcome!</Text>
          <Text style={styles.successMessage}>
            You've been successfully signed in.
          </Text>
        </View>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#012F47',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  content: {
    backgroundColor: '#001E2E',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 20,
    minWidth: 280,
  },
  processingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    textAlign: 'center',
  },
  errorText: {
    color: '#F44336',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorMessage: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  helpText: {
    color: '#659CBB',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  successText: {
    color: '#4CAF50',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  successMessage: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
});