'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  X, 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Square,
  Loader2,
  Edit3
} from 'lucide-react'

interface VoiceEditModalProps {
  isOpen: boolean
  onClose: () => void
  onEditPage: (transcript: string) => void
  isProcessing?: boolean
}

export default function VoiceEditModal({ 
  isOpen, 
  onClose, 
  onEditPage, 
  isProcessing = false 
}: VoiceEditModalProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [isTranscribing, setIsTranscribing] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const chunksRef = useRef<Blob[]>([])
  
  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setIsRecording(false)
      setIsPlaying(false)
      setTranscript('')
      setAudioUrl(null)
      setRecordingTime(0)
      setIsTranscribing(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isOpen])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' })
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)
        
        // Start transcription
        setIsTranscribing(true)
        try {
          await transcribeAudio(audioBlob)
        } catch (error) {
          console.error('Transcription failed:', error)
          setTranscript('Transcription failed. Please try recording again.')
        } finally {
          setIsTranscribing(false)
        }
        
        // Stop all tracks to free up the microphone
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Could not access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const playAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const transcribeAudio = async (audioBlob: Blob) => {
    const formData = new FormData()
    formData.append('audio', audioBlob, 'recording.wav')

    const response = await fetch('/api/voice/transcribe-simple', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('Transcription failed')
    }

    const data = await response.json()
    setTranscript(data.transcript || 'No speech detected.')
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleEditPage = () => {
    if (transcript.trim()) {
      onEditPage(transcript)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Voice Edit</h2>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Recording Controls */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-4">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  disabled={isTranscribing || isProcessing}
                  className="flex items-center justify-center w-16 h-16 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  title="Start recording"
                >
                  <Mic className="w-8 h-8" />
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="flex items-center justify-center w-16 h-16 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors animate-pulse"
                  title="Stop recording"
                >
                  <Square className="w-8 h-8" />
                </button>
              )}
              
              {audioUrl && (
                <button
                  onClick={playAudio}
                  disabled={isRecording || isTranscribing || isProcessing}
                  className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  title={isPlaying ? "Pause playback" : "Play recording"}
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </button>
              )}
            </div>

            {/* Recording Timer */}
            {isRecording && (
              <div className="text-lg font-mono text-red-600">
                Recording: {formatTime(recordingTime)}
              </div>
            )}

            {/* Status Messages */}
            {isTranscribing && (
              <div className="flex items-center justify-center space-x-2 text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Transcribing audio...</span>
              </div>
            )}
          </div>

          {/* Audio Element */}
          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          )}

          {/* Transcript */}
          {transcript && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-900">Transcript</h3>
              <div className="bg-gray-50 rounded-lg p-4 min-h-[120px] max-h-[300px] overflow-y-auto">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {transcript}
                </p>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Instructions:</strong> Click record and speak about the changes you want to make to this page. 
              The transcript will be analyzed and used to intelligently update the relevant fields based on your voice input.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleEditPage}
            disabled={!transcript.trim() || isRecording || isTranscribing || isProcessing}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4" />
                <span>Edit Page</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}