import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json({ 
      status: 'Voice API test working',
      openaiConfigured: !!process.env.OPENAI_API_KEY
    })
  } catch (error: any) {
    console.error('Voice test error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function POST() {
  try {
    return NextResponse.json({ 
      status: 'Voice API POST test working',
      openaiConfigured: !!process.env.OPENAI_API_KEY
    })
  } catch (error: any) {
    console.error('Voice test error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}