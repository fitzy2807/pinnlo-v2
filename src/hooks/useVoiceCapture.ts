'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { VoiceSession, VoiceTranscription, VoiceError, VoiceConfig, IntelligenceCard } from '@/types/voice';
import { v4 as uuidv4 } from 'uuid';

interface UseVoiceCaptureReturn {
  session: VoiceSession | null;
  isListening: boolean;
  isProcessing: boolean;
  currentTranscript: string;
  error: VoiceError | null;
  startListening: () => Promise<void>;
  stopListening: () => void;
  clearSession: () => void;
  processVoiceInput: (transcript: string) => Promise<void>;
}

export const useVoiceCapture = (config: Partial<VoiceConfig> = {}): UseVoiceCaptureReturn => {
  const [session, setSession] = useState<VoiceSession | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [error, setError] = useState<VoiceError | null>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const defaultConfig: VoiceConfig = {
    language: 'en-US',
    continuous: true,
    interimResults: true,
    maxAlternatives: 1,
    serviceType: 'browser',
    ...config
  };

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = defaultConfig.continuous;
        recognitionRef.current.interimResults = defaultConfig.interimResults;
        recognitionRef.current.lang = defaultConfig.language;
        recognitionRef.current.maxAlternatives = defaultConfig.maxAlternatives;
      }
    }
  }, []);

  // Create new voice session
  const createSession = useCallback((): VoiceSession => {
    return {
      id: uuidv4(),
      startTime: new Date(),
      status: 'idle',
      transcript: '',
      confidence: 0,
      generatedCards: [],
      metadata: {
        audioQuality: 'good',
        processingTime: 0,
        speechDuration: 0,
        wordsPerMinute: 0,
        backgroundNoise: 'low'
      }
    };
  }, []);

  // Process voice input and generate intelligence cards
  const processVoiceInput = useCallback(async (transcript: string) => {
    if (!transcript.trim()) return;

    setIsProcessing(true);
    setError(null);
    
    const processingStart = Date.now();

    try {
      // Call MCP server for voice intelligence processing
      const response = await fetch('/api/voice/process-intelligence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript,
          sessionId: session?.id,
          metadata: {
            timestamp: new Date().toISOString(),
            processingMethod: 'realtime'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Processing failed: ${response.status}`);
      }

      const result = await response.json();
      const processingTime = Date.now() - processingStart;

      // Create intelligence cards from processed result
      const cards: IntelligenceCard[] = result.cards?.map((card: any) => ({
        id: uuidv4(),
        title: card.title || 'Voice Intelligence',
        description: card.description || 'Generated from voice input',
        category: card.category || 'general',
        content: card.content || transcript,
        confidence: card.confidence || 0.8,
        timestamp: new Date(),
        source: 'voice' as const,
        metadata: {
          originalTranscript: transcript,
          processingMethod: 'realtime' as const,
          aiModel: result.model || 'gpt-4o-mini'
        }
      })) || [];

      // Update session with generated cards
      setSession(prev => {
        if (!prev) return null;
        return {
          ...prev,
          status: 'completed',
          generatedCards: cards,
          metadata: {
            ...prev.metadata,
            processingTime
          }
        };
      });

    } catch (err) {
      console.error('Voice processing error:', err);
      setError({
        code: 'PROCESSING_ERROR',
        message: 'Failed to process voice input',
        details: err
      });
      
      setSession(prev => {
        if (!prev) return null;
        return { ...prev, status: 'error' };
      });
    } finally {
      setIsProcessing(false);
    }
  }, [session?.id]);

  // Start listening
  const startListening = useCallback(async () => {
    if (!recognitionRef.current) {
      setError({
        code: 'UNSUPPORTED_BROWSER',
        message: 'Speech recognition not supported in this browser'
      });
      return;
    }

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create new session
      const newSession = createSession();
      setSession(newSession);
      setError(null);
      setCurrentTranscript('');
      
      // Set up recognition event handlers
      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setSession(prev => prev ? { ...prev, status: 'listening' } : null);
      };

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence;

          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const fullTranscript = finalTranscript || interimTranscript;
        setCurrentTranscript(fullTranscript);
        
        // Update session transcript
        setSession(prev => {
          if (!prev) return null;
          return {
            ...prev,
            transcript: fullTranscript,
            confidence: event.results[0]?.[0]?.confidence || 0
          };
        });

        // Auto-process after a pause (if we have final results)
        if (finalTranscript && timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        if (finalTranscript) {
          timeoutRef.current = setTimeout(() => {
            processVoiceInput(fullTranscript);
          }, 2000); // Process after 2 seconds of silence
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setError({
          code: event.error === 'not-allowed' ? 'PERMISSION_DENIED' : 'NETWORK_ERROR',
          message: `Speech recognition error: ${event.error}`
        });
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setSession(prev => {
          if (!prev) return null;
          return { ...prev, status: 'processing', endTime: new Date() };
        });
      };

      // Start recognition
      recognitionRef.current.start();

    } catch (err) {
      console.error('Microphone access error:', err);
      setError({
        code: 'PERMISSION_DENIED',
        message: 'Microphone access denied'
      });
    }
  }, [createSession, processVoiceInput]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setIsListening(false);
    
    // Process the current transcript if we have one
    if (currentTranscript.trim()) {
      processVoiceInput(currentTranscript);
    }
  }, [isListening, currentTranscript, processVoiceInput]);

  // Clear session
  const clearSession = useCallback(() => {
    if (isListening) {
      stopListening();
    }
    
    setSession(null);
    setCurrentTranscript('');
    setError(null);
    setIsProcessing(false);
  }, [isListening, stopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    session,
    isListening,
    isProcessing,
    currentTranscript,
    error,
    startListening,
    stopListening,
    clearSession,
    processVoiceInput
  };
};