const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

async function clearAllStreams() {
  try {
    console.log('🔥 Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('📋 Fetching all streams...');
    const streamsSnapshot = await getDocs(collection(db, 'streams'));
    
    console.log(`🗑️ Found ${streamsSnapshot.docs.length} streams to delete`);
    
    const deletePromises = streamsSnapshot.docs.map(async (streamDoc) => {
      console.log(`🗑️ Deleting stream: ${streamDoc.id}`);
      await deleteDoc(doc(db, 'streams', streamDoc.id));
    });
    
    await Promise.all(deletePromises);
    console.log('✅ All streams deleted successfully!');
    
  } catch (error) {
    console.error('❌ Error clearing streams:', error);
  }
}

clearAllStreams();
