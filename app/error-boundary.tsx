import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, ScrollView, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { RefreshCw, Home, AlertTriangle } from 'lucide-react-native';

interface Props {
  children: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorCount: number;
}

const IFRAME_ID = 'rork-web-preview';

const webTargetOrigins = [
  "http://localhost:3000",
  "https://rorkai.com",
  "https://rork.app",
];    

function serializeError(error: any): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return 'Unknown error';
  }
}

function sendErrorToIframeParent(error: any, errorInfo?: any) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const serializedError = serializeError(error);
    
    const errorMessage = {
      type: 'ERROR',
      error: {
        message: serializedError,
        stack: error?.stack,
        componentStack: errorInfo?.componentStack,
        timestamp: new Date().toISOString(),
      },
      iframeId: IFRAME_ID,
    };

    try {
      const targetOrigin = webTargetOrigins.includes(document.referrer) 
        ? document.referrer 
        : '*';
      
      window.parent.postMessage(errorMessage, targetOrigin);
    } catch (postMessageError) {
      console.error('Failed to send error to parent:', postMessageError);
    }
  }
}

if (Platform.OS === 'web' && typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (event) {
      event.preventDefault();
      const error = event.error || event.message || 'Unknown error';
      sendErrorToIframeParent(error);
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    if (event) {
      event.preventDefault();
      const error = event.reason || 'Unhandled Promise rejection';
      sendErrorToIframeParent(error);
    }
  });

  const originalConsoleError = console.error;
  console.error = (...args) => {
    const error = args.length === 1 ? args[0] : args.join(' ');
    sendErrorToIframeParent(error);
    originalConsoleError.apply(console, args);
  };
}

// Custom error fallback component
const ErrorFallback = ({ error, resetError }: { error: Error | null, resetError: () => void }) => {
  const router = useRouter();
  const [showDetails, setShowDetails] = useState(false);
  
  const handleGoHome = () => {
    resetError();
    router.replace('/');
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <AlertTriangle size={48} color="#F44336" style={styles.icon} />
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.subtitle}>
          {error?.message || 'An unexpected error occurred'}
        </Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={resetError}>
            <RefreshCw size={18} color="#FFFFFF" />
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.button, styles.homeButton]} onPress={handleGoHome}>
            <Home size={18} color="#FFFFFF" />
            <Text style={styles.buttonText}>Go Home</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.detailsToggle}
          onPress={() => setShowDetails(!showDetails)}
        >
          <Text style={styles.detailsToggleText}>
            {showDetails ? 'Hide Details' : 'Show Details'}
          </Text>
        </TouchableOpacity>
        
        {showDetails && (
          <ScrollView style={styles.detailsContainer}>
            <Text style={styles.detailsText}>{error?.stack}</Text>
          </ScrollView>
        )}
      </View>
    </View>
  );
};

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorCount: 0
    };
    
    this.resetError = this.resetError.bind(this);
  }

  static getDerivedStateFromError(error: Error) {
    return (prevState: State) => ({
      hasError: true, 
      error,
      errorCount: prevState.errorCount + 1
    });
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to external service
    sendErrorToIframeParent(error, errorInfo);
    
    // Store error info for potential display
    this.setState({ errorInfo });
    
    // Save error to persistent storage for analytics
    this.persistError(error, errorInfo);
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }
  
  // Save error to AsyncStorage for later analysis
  persistError(error: Error, errorInfo: React.ErrorInfo) {
    try {
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
      };
      
      AsyncStorage.getItem('@error_logs').then(existingLogs => {
        const logs = existingLogs ? JSON.parse(existingLogs) : [];
        logs.push(errorData);
        // Keep only the last 10 errors
        const trimmedLogs = logs.slice(-10);
        AsyncStorage.setItem('@error_logs', JSON.stringify(trimmedLogs));
      });
    } catch (e) {
      // Silently fail if we can't persist the error
      console.error('Failed to persist error:', e);
    }
  }
  
  // Reset the error state to recover
  resetError() {
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null
    });
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Use default error fallback
      return <ErrorFallback error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    maxWidth: '80%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
    gap: 12,
  },
  button: {
    backgroundColor: '#7B5CFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    gap: 8,
  },
  homeButton: {
    backgroundColor: '#5E45CC',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  detailsToggle: {
    marginTop: 16,
    padding: 8,
  },
  detailsToggleText: {
    color: '#7B5CFF',
    fontSize: 14,
    fontWeight: '500',
  },
  detailsContainer: {
    maxHeight: 200,
    width: '100%',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  detailsText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#333',
  },
});

