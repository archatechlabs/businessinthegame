import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore'

// Payment Processing for Streaming Tiers
export async function POST(request: NextRequest) {
  try {
    const { userId, tier, paymentMethod, amount } = await request.json()

    if (!userId || !tier || !paymentMethod || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate tier
    const validTiers = ['premium', 'vip']
    if (!validTiers.includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid streaming tier' },
        { status: 400 }
      )
    }

    // In production, integrate with Stripe, PayPal, or your payment processor
    // For now, we'll simulate a successful payment
    
    const paymentData = {
      userId,
      tier,
      amount,
      paymentMethod,
      status: 'completed', // In production, this would be 'pending' until confirmed
      transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }

    // Save payment record
    const paymentRef = await addDoc(collection(db, 'streamingPayments'), paymentData)

    // Update user's streaming tier
    await updateDoc(doc(db, 'users', userId), {
      streamingTier: tier,
      streamingExpiresAt: paymentData.expiresAt,
      updatedAt: new Date()
    })

    return NextResponse.json({
      success: true,
      paymentId: paymentRef.id,
      transactionId: paymentData.transactionId,
      tier,
      expiresAt: paymentData.expiresAt
    })

  } catch (error) {
    console.error('Error processing streaming payment:', error)
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    )
  }
}

// Get user's streaming status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // In production, fetch from database
    // For now, return mock data
    const streamingStatus = {
      hasStreamingAccess: true,
      tier: 'free',
      expiresAt: null,
      canStream: true
    }

    return NextResponse.json(streamingStatus)

  } catch (error) {
    console.error('Error fetching streaming status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch streaming status' },
      { status: 500 }
    )
  }
}
