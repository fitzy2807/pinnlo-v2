import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: NextRequest) {
  console.log('=== Simple Voice Transcription API Called ===')
  
  try {
    // Get the audio file from form data
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    
    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }
    
    console.log('Audio file received:', {
      name: audioFile.name,
      size: audioFile.size,
      type: audioFile.type
    })
    
    // Convert File to the format OpenAI expects
    const arrayBuffer = await audioFile.arrayBuffer()
    const audioBuffer = Buffer.from(arrayBuffer)
    
    // Create a File-like object for OpenAI
    const audioForOpenAI = new File([audioBuffer], audioFile.name, {
      type: audioFile.type || 'audio/wav'
    })
    
    // Transcribe using OpenAI Whisper
    console.log('Starting transcription with OpenAI Whisper...')
    const transcription = await openai.audio.transcriptions.create({
      file: audioForOpenAI,
      model: 'whisper-1',
      language: 'en',
      response_format: 'text'
    })
    
    console.log('Transcription completed:', {
      length: transcription.length,
      preview: transcription.substring(0, 100) + '...'
    })
    
    return NextResponse.json({
      success: true,
      transcript: transcription
    })
    
  } catch (error: any) {
    console.error('Voice transcription error:', error)
    
    let errorMessage = 'Transcription failed'
    if (error.message?.includes('audio')) {
      errorMessage = 'Invalid audio format. Please try recording again.'
    } else if (error.message?.includes('quota')) {
      errorMessage = 'API quota exceeded. Please try again later.'
    } else if (error.message?.includes('network')) {
      errorMessage = 'Network error. Please check your connection and try again.'
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}