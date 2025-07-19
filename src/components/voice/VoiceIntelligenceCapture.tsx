'use client';

import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Square, Volume2, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useVoiceCapture } from '@/hooks/useVoiceCapture';
import { VoiceSession, IntelligenceCard } from '@/types/voice';

interface VoiceIntelligenceCaptureProps {
  onClose: () => void;
  onCardGenerated?: (card: IntelligenceCard) => void;
}

export default function VoiceIntelligenceCapture({ onClose, onCardGenerated }: VoiceIntelligenceCaptureProps) {
  const {
    session,
    isListening,
    isProcessing,
    currentTranscript,
    error,
    startListening,
    stopListening,
    clearSession
  } = useVoiceCapture();

  const [showResults, setShowResults] = useState(false);

  // Show results when cards are generated
  useEffect(() => {
    if (session?.generatedCards && session.generatedCards.length > 0) {
      setShowResults(true);
      session.generatedCards.forEach(card => {
        onCardGenerated?.(card);
      });
    }
  }, [session?.generatedCards, onCardGenerated]);

  const handleStartListening = async () => {
    await startListening();
  };

  const handleStopListening = () => {
    stopListening();
  };

  const handleClose = () => {
    if (isListening) {
      stopListening();
    }
    clearSession();
    onClose();
  };

  const handleTryAgain = () => {
    clearSession();
    setShowResults(false);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'market': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'customer': return 'bg-green-50 text-green-700 border-green-200';
      case 'competitive': return 'bg-red-50 text-red-700 border-red-200';
      case 'research': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'development': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'strategy': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getCommandTypeIcon = (type: string) => {
    switch (type) {
      case 'feature': return '🔧';
      case 'strategy': return '🎯';
      case 'url_analysis': return '🔍';
      case 'intelligence': return '💡';
      default: return '📝';
    }
  };

  const getCommandTypeColor = (type: string) => {
    switch (type) {
      case 'feature': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'strategy': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'url_analysis': return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'intelligence': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <Mic className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Voice Intelligence Capture</h2>
                <p className="text-teal-100 text-sm">Speak your insights and we'll create intelligence cards</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div>
                <p className="text-red-800 font-medium">Error: {error.message}</p>
                <p className="text-red-600 text-sm">Please try again or check your microphone permissions.</p>
              </div>
            </div>
          )}

          {/* Results View */}
          {showResults && session?.generatedCards && session.generatedCards.length > 0 ? (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center space-x-2 text-green-600 mb-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Intelligence Cards Generated!</span>
                </div>
                <p className="text-gray-600 text-sm">
                  Created {session.generatedCards.length} intelligence card{session.generatedCards.length !== 1 ? 's' : ''} from your voice input
                </p>
              </div>

              {/* Generated Cards */}
              <div className="space-y-4">
                {session.generatedCards.map((card, index) => (
                  <div key={card.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(card.category)}`}>
                          {card.category}
                        </span>
                        {card.metadata?.commandType && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCommandTypeColor(card.metadata.commandType)}`}>
                            {getCommandTypeIcon(card.metadata.commandType)} {card.metadata.commandType}
                          </span>
                        )}
                        <span className="text-sm text-gray-500">
                          {Math.round(card.confidence * 100)}% confidence
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {card.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-2">{card.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {typeof card.description === 'string' 
                        ? card.description 
                        : card.description?.objective || 'No description available'}
                    </p>
                    
                    <div className="bg-gray-50 rounded-md p-3">
                      <p className="text-sm text-gray-700 leading-relaxed">{card.content}</p>
                    </div>
                    
                    {card.metadata?.originalCommand && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          <span className="font-medium">Original command:</span> "{card.metadata.originalCommand}"
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleTryAgain}
                  className="px-6 py-2 text-teal-600 border border-teal-600 rounded-lg hover:bg-teal-50 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={handleClose}
                  className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Voice Capture Interface */
            <div className="space-y-6">
              {/* Voice Controls */}
              <div className="text-center">
                <div className="mb-6">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 ${
                    isListening ? 'bg-red-500 animate-pulse' : 'bg-teal-500 hover:bg-teal-600'
                  }`}>
                    {isListening ? (
                      <MicOff className="w-8 h-8 text-white" />
                    ) : (
                      <Mic className="w-8 h-8 text-white" />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {!isListening && !isProcessing && (
                    <button
                      onClick={handleStartListening}
                      className="px-8 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                    >
                      Start Recording
                    </button>
                  )}
                  
                  {isListening && (
                    <button
                      onClick={handleStopListening}
                      className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      Stop Recording
                    </button>
                  )}
                  
                  {isProcessing && (
                    <div className="flex items-center justify-center space-x-2 text-teal-600">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="font-medium">Processing your voice...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Display */}
              <div className="text-center">
                {isListening && (
                  <div className="inline-flex items-center space-x-2 text-green-600 mb-2">
                    <Volume2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Listening...</span>
                  </div>
                )}
                
                {session?.status === 'processing' && (
                  <div className="inline-flex items-center space-x-2 text-blue-600 mb-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-medium">Processing...</span>
                  </div>
                )}
              </div>

              {/* Live Transcription */}
              {(currentTranscript || session?.transcript) && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Live Transcription:</h3>
                  <div className="bg-white rounded-md p-3 border border-gray-200">
                    <p className="text-gray-800 leading-relaxed">
                      {currentTranscript || session?.transcript}
                      {isListening && <span className="animate-pulse">|</span>}
                    </p>
                  </div>
                  {session?.confidence && (
                    <div className="mt-2 text-xs text-gray-500">
                      Confidence: {Math.round(session.confidence * 100)}%
                    </div>
                  )}
                </div>
              )}

              {/* Instructions */}
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <h3 className="text-sm font-medium text-blue-800 mb-2">How to use:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Click "Start Recording" and speak your intelligence insights</li>
                  <li>• Talk about market trends, customer feedback, or competitive insights</li>
                  <li>• Click "Stop Recording" when you're done</li>
                  <li>• AI will process your voice and create intelligence cards</li>
                </ul>
              </div>

              {/* Voice Commands */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-purple-800 mb-2">Voice Commands:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div className="bg-white rounded-md p-2 border border-purple-200">
                      <p className="text-xs font-medium text-purple-700">Feature Cards:</p>
                      <p className="text-xs text-purple-600">"Turn this into a feature card"</p>
                      <p className="text-xs text-purple-600">"Create a feature for..."</p>
                    </div>
                    <div className="bg-white rounded-md p-2 border border-purple-200">
                      <p className="text-xs font-medium text-purple-700">Strategy Cards:</p>
                      <p className="text-xs text-purple-600">"Turn this into a strategy"</p>
                      <p className="text-xs text-purple-600">"Create a strategy card"</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-white rounded-md p-2 border border-purple-200">
                      <p className="text-xs font-medium text-purple-700">URL Analysis:</p>
                      <p className="text-xs text-purple-600">"Analyze this URL"</p>
                      <p className="text-xs text-purple-600">"Check this website"</p>
                    </div>
                    <div className="bg-white rounded-md p-2 border border-purple-200">
                      <p className="text-xs font-medium text-purple-700">Intelligence Cards:</p>
                      <p className="text-xs text-purple-600">"Intelligence card"</p>
                      <p className="text-xs text-purple-600">"Market intelligence"</p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-purple-600 mt-2 text-center">
                  💡 Try saying: "Turn this into a feature card: Users need better search functionality"
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}