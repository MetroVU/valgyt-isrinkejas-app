import { NextRequest, NextResponse } from 'next/server';

// In-memory store for sessions (works locally and on Vercel serverless)
// Note: On Vercel, sessions will persist during warm lambda instances
// For production with multiple users, use Vercel Blob by setting BLOB_READ_WRITE_TOKEN
const sessions = new Map<string, any>();

// Generate a random 6-character code
function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Check if Blob is configured
const useBlobStorage = () => {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
};

// Blob storage functions (only used if configured)
async function blobPut(key: string, data: any) {
  const { put } = await import('@vercel/blob');
  const result = await put(key, JSON.stringify(data), {
    access: 'public',
    addRandomSuffix: false,
  });
  console.log('Blob put result:', result.url);
  return result;
}

async function blobGet(key: string) {
  try {
    const { list } = await import('@vercel/blob');
    const { blobs } = await list({ prefix: key });
    
    console.log('Blob list result for', key, ':', blobs.length, 'blobs found');
    
    if (blobs.length === 0) return null;
    
    const response = await fetch(blobs[0].url, { cache: 'no-store' });
    if (!response.ok) {
      console.log('Blob fetch failed:', response.status);
      return null;
    }
    
    return response.json();
  } catch (error) {
    console.error('blobGet error:', error);
    return null;
  }
}

async function blobDelete(key: string) {
  const { del, list } = await import('@vercel/blob');
  const { blobs } = await list({ prefix: key });
  
  if (blobs.length > 0) {
    await del(blobs[0].url);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, code, person, selections, customRestaurants } = body;
    const useBlob = useBlobStorage();
    
    console.log('API called:', { action, code, person, useBlob });

    if (action === 'create') {
      const sessionCode = generateCode();
      const sessionData = {
        code: sessionCode,
        createdAt: Date.now(),
        person1: null,
        person2: null,
        customRestaurants: [],
      };

      if (useBlob) {
        try {
          await blobPut(`sessions/${sessionCode}.json`, sessionData);
          console.log('Session created in blob:', sessionCode);
        } catch (blobError) {
          console.error('Blob put error:', blobError);
          throw blobError;
        }
      } else {
        sessions.set(sessionCode, sessionData);
        console.log('Session created in memory:', sessionCode);
      }

      return NextResponse.json({ success: true, code: sessionCode });
    }

    if (action === 'join' || action === 'get') {
      let sessionData = null;
      
      if (useBlob) {
        sessionData = await blobGet(`sessions/${code}.json`);
      } else {
        sessionData = sessions.get(code);
      }
      
      if (!sessionData) {
        return NextResponse.json({ success: false, error: 'Session not found' });
      }
      
      if (action === 'join') {
        return NextResponse.json({ success: true, exists: true });
      }
      
      return NextResponse.json({ success: true, session: sessionData });
    }

    if (action === 'submit') {
      let sessionData = null;
      
      console.log('Submit action for code:', code, 'person:', person);
      
      if (useBlob) {
        try {
          sessionData = await blobGet(`sessions/${code}.json`);
          console.log('Got session from blob:', sessionData ? 'found' : 'not found');
        } catch (getError) {
          console.error('Blob get error:', getError);
          return NextResponse.json({ success: false, error: 'Failed to get session' });
        }
      } else {
        sessionData = sessions.get(code);
        console.log('Got session from memory:', sessionData ? 'found' : 'not found');
      }
      
      if (!sessionData) {
        console.log('Session not found for code:', code);
        return NextResponse.json({ success: false, error: 'Session not found' });
      }

      // Update the appropriate person's selections
      if (person === 1) {
        sessionData.person1 = {
          selections,
          submittedAt: Date.now(),
        };
        if (customRestaurants && customRestaurants.length > 0) {
          sessionData.customRestaurants = [
            ...(sessionData.customRestaurants || []),
            ...customRestaurants.filter((cr: any) => 
              !sessionData.customRestaurants?.some((existing: any) => existing.id === cr.id)
            ),
          ];
        }
      } else {
        sessionData.person2 = {
          selections,
          submittedAt: Date.now(),
        };
        if (customRestaurants && customRestaurants.length > 0) {
          sessionData.customRestaurants = [
            ...(sessionData.customRestaurants || []),
            ...customRestaurants.filter((cr: any) => 
              !sessionData.customRestaurants?.some((existing: any) => existing.id === cr.id)
            ),
          ];
        }
      }

      // Save updated session
      if (useBlob) {
        try {
          await blobPut(`sessions/${code}.json`, sessionData);
          console.log('Session saved to blob');
        } catch (putError) {
          console.error('Blob put error on submit:', putError);
          return NextResponse.json({ success: false, error: 'Failed to save session' });
        }
      } else {
        sessions.set(code, sessionData);
        console.log('Session saved to memory');
      }

      return NextResponse.json({ success: true });
    }

    if (action === 'delete') {
      if (useBlob) {
        await blobDelete(`sessions/${code}.json`);
      } else {
        sessions.delete(code);
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' });
  } catch (error) {
    console.error('Session API error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
