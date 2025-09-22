import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore'

export async function POST(request: NextRequest) {
  try {
    console.log('🗑️ Starting to clear all streams...')
    
    // Get all streams
    const streamsSnapshot = await getDocs(collection(db, 'streams'))
    console.log(`📋 Found ${streamsSnapshot.docs.length} streams to delete`)
    
    // Delete all streams
    const deletePromises = streamsSnapshot.docs.map(async (streamDoc) => {
      console.log(`🗑️ Deleting stream: ${streamDoc.id}`)
      await deleteDoc(doc(db, 'streams', streamDoc.id))
    })
    
    await Promise.all(deletePromises)
    console.log('✅ All streams deleted successfully!')
    
    return NextResponse.json({ 
      success: true, 
      message: `Deleted ${streamsSnapshot.docs.length} streams`,
      deletedCount: streamsSnapshot.docs.length
    })
    
  } catch (error) {
    console.error('❌ Error clearing streams:', error)
    return NextResponse.json(
      { 
        error: 'Failed to clear streams', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
