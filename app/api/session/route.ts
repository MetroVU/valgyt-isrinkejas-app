import { put, head, del } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

// Generate a random 6-character code
function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No confusing characters
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, code, person, selections, customRestaurants } = body;

    if (action === 'create') {
      // Create new session
      const sessionCode = generateCode();
      const sessionData = {
        code: sessionCode,
        createdAt: Date.now(),
        person1: null,
        person2: null,
        customRestaurants: [],
      };

      await put(`sessions/${sessionCode}.json`, JSON.stringify(sessionData), {
        access: 'public',
        addRandomSuffix: false,
      });

      return NextResponse.json({ success: true, code: sessionCode });
    }

    if (action === 'join') {
      // Check if session exists
      try {
        const blob = await head(`sessions/${code}.json`);
        if (blob) {
          return NextResponse.json({ success: true, exists: true });
        }
      } catch {
        return NextResponse.json({ success: false, error: 'Session not found' });
      }
    }

    if (action === 'submit') {
      // Submit selections for a person
      const blobUrl = `${process.env.BLOB_URL || 'https://blob.vercel-storage.com'}/sessions/${code}.json`;
      
      // Fetch current session data
      const response = await fetch(blobUrl, { cache: 'no-store' });
      if (!response.ok) {
        return NextResponse.json({ success: false, error: 'Session not found' });
      }
      
      const sessionData = await response.json();
      
      // Update the appropriate person's selections
      if (person === 1) {
        sessionData.person1 = {
          selections,
          submittedAt: Date.now(),
        };
        // Add custom restaurants if provided
        if (customRestaurants && customRestaurants.length > 0) {
          sessionData.customRestaurants = [
            ...sessionData.customRestaurants,
            ...customRestaurants.filter((cr: any) => 
              !sessionData.customRestaurants.some((existing: any) => existing.id === cr.id)
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
            ...sessionData.customRestaurants,
            ...customRestaurants.filter((cr: any) => 
              !sessionData.customRestaurants.some((existing: any) => existing.id === cr.id)
            ),
          ];
        }
      }

      // Save updated session
      await put(`sessions/${code}.json`, JSON.stringify(sessionData), {
        access: 'public',
        addRandomSuffix: false,
      });

      return NextResponse.json({ success: true });
    }

    if (action === 'get') {
      // Get session data
      const blobUrl = `${process.env.BLOB_URL || 'https://blob.vercel-storage.com'}/sessions/${code}.json`;
      
      const response = await fetch(blobUrl, { cache: 'no-store' });
      if (!response.ok) {
        return NextResponse.json({ success: false, error: 'Session not found' });
      }
      
      const sessionData = await response.json();
      return NextResponse.json({ success: true, session: sessionData });
    }

    if (action === 'delete') {
      // Delete session
      try {
        await del(`sessions/${code}.json`);
        return NextResponse.json({ success: true });
      } catch {
        return NextResponse.json({ success: false, error: 'Failed to delete' });
      }
    }

    return NextResponse.json({ success: false, error: 'Invalid action' });
  } catch (error) {
    console.error('Session API error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
