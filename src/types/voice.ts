// Voice Intelligence Types
export interface VoiceSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  status: 'idle' | 'listening' | 'processing' | 'completed' | 'error';
  transcript: string;
  confidence: number;
  generatedCards: IntelligenceCard[];
  metadata: VoiceSessionMetadata;
}

export interface VoiceSessionMetadata {
  audioQuality: 'poor' | 'fair' | 'good' | 'excellent';
  processingTime: number;
  speechDuration: number;
  wordsPerMinute: number;
  backgroundNoise: 'low' | 'medium' | 'high';
}

export interface IntelligenceCard {
  id: string;
  title: string;
  description: string;
  category: 'market' | 'customer' | 'competitive' | 'research' | 'general' | 'development' | 'strategy';
  content: string;
  confidence: number;
  timestamp: Date;
  source: 'voice';
  type?: 'feature' | 'strategy' | 'url_analysis' | 'intelligence';
  metadata?: {
    originalTranscript?: string;
    originalCommand?: string;
    processingMethod?: 'realtime' | 'batch';
    aiModel?: string;
    commandType?: string;
    url?: string;
  };
}

export interface VoiceTranscription {
  text: string;
  confidence: number;
  timestamp: Date;
  isFinal: boolean;
  wordTimings?: WordTiming[];
}

export interface WordTiming {
  word: string;
  startTime: number;
  endTime: number;
  confidence: number;
}

export interface VoiceError {
  code: 'PERMISSION_DENIED' | 'NETWORK_ERROR' | 'PROCESSING_ERROR' | 'TIMEOUT' | 'UNSUPPORTED_BROWSER';
  message: string;
  details?: any;
}

export interface VoiceConfig {
  language: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  serviceType: 'browser' | 'elevenlabs';
}

export interface ElevenLabsVoiceConfig {
  apiKey: string;
  agentId: string;
  conversationId: string;
  voiceSettings: {
    stability: number;
    similarityBoost: number;
    style: number;
    useSpeakerBoost: boolean;
  };
}

export interface VoiceAnalytics {
  sessionId: string;
  duration: number;
  wordsSpoken: number;
  cardsGenerated: number;
  averageConfidence: number;
  processingTime: number;
  userSatisfaction?: number;
}