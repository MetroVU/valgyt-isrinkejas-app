import { NextRequest, NextResponse } from 'next/server';
import { put, del } from '@vercel/blob';

// Session data structure
interface PersonSelection {
  selections: string[];
  submittedAt: number;
}

interface Session {
  code: string;
  person1?: PersonSelection;
  person2?: PersonSelection;
  createdAt: number;
  blobUrl?: string;
  customRestaurants?: unknown[];
}

// Generate a random 6-character code
function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// In-memory URL mapping (will be replaced by actual lookup)
const urlMap = new Map<string, string>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, code, selections, role, customRestaurants } = body;

    console.log('API called with action:', action, 'code:', code);

    if (action === 'create') {
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return NextResponse.json({ success: false, error: 'Missing BLOB_READ_WRITE_TOKEN in environment' }, { status: 500 });
      }
      // Create new session
      const newCode = generateCode();
      const session: Session = {
        code: newCode,
        createdAt: Date.now(),
      };

      const blob = await put(`sessions/${newCode}.json`, JSON.stringify(session), {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
        allowOverwrite: true,
      });

      console.log('Created session, blob URL:', blob.url);

      return NextResponse.json({ 
        success: true, 
        code: newCode,
        blobUrl: blob.url 
      });
    }

    if (action === 'join') {
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return NextResponse.json({ success: false, error: 'Missing BLOB_READ_WRITE_TOKEN in environment' }, { status: 500 });
      }
      // Try to find the session by listing blobs
      const response = await fetch(
        `https://blob.vercel-storage.com?prefix=sessions/${code}.json`,
        {
          headers: {
            Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
          },
        }
      );

      if (!response.ok) {
        console.log('List request failed:', response.status);
        return NextResponse.json({ success: false, error: 'Sesija nerasta' });
      }

      const data = await response.json();
      console.log('List response:', JSON.stringify(data));

      if (!data.blobs || data.blobs.length === 0) {
        return NextResponse.json({ success: false, error: 'Sesija nerasta' });
      }

      // Get the session data
      const blobUrl = data.blobs[0].url;
      const sessionResponse = await fetch(blobUrl);
      const session = await sessionResponse.json();

      return NextResponse.json({ 
        success: true, 
        session,
        blobUrl 
      });
    }

    if (action === 'submit') {
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return NextResponse.json({ success: false, error: 'Missing BLOB_READ_WRITE_TOKEN in environment' }, { status: 500 });
      }
      // First, get the current session
      const listResponse = await fetch(
        `https://blob.vercel-storage.com?prefix=sessions/${code}.json`,
        {
          headers: {
            Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
          },
        }
      );

      if (!listResponse.ok) {
        console.log('List failed on submit:', listResponse.status);
        return NextResponse.json({ success: false, error: 'Sesija nerasta' });
      }

      const listData = await listResponse.json();
      console.log('Submit list response:', JSON.stringify(listData));

      let session: Session;
      let oldBlobUrl: string = '';

      if (listData.blobs && listData.blobs.length > 0) {
        oldBlobUrl = listData.blobs[0].url;
        const sessionResponse = await fetch(oldBlobUrl);
        session = await sessionResponse.json();
      } else {
        return NextResponse.json({ success: false, error: 'Sesija nerasta' });
      }

      // Update session with selections
      if (role === 'person1') {
        session.person1 = {
          selections: selections,
          submittedAt: Date.now(),
        };
      } else {
        session.person2 = {
          selections: selections,
          submittedAt: Date.now(),
        };
      }

      // Add custom restaurants if provided
      if (customRestaurants && customRestaurants.length > 0) {
        session.customRestaurants = [
          ...(session.customRestaurants || []),
          ...customRestaurants,
        ];
      }

      // Overwrite existing blob atomically (no delete to avoid eventual consistency issues)

      const blob = await put(`sessions/${code}.json`, JSON.stringify(session), {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
        allowOverwrite: true,
      });

      console.log('Updated session:', JSON.stringify(session));

      return NextResponse.json({ 
        success: true, 
        session,
        blobUrl: blob.url 
      });
    }

    if (action === 'get') {
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return NextResponse.json({ success: false, error: 'Missing BLOB_READ_WRITE_TOKEN in environment' }, { status: 500 });
      }
      const listResponse = await fetch(
        `https://blob.vercel-storage.com?prefix=sessions/${code}.json`,
        {
          headers: {
            Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
          },
        }
      );

      if (!listResponse.ok) {
        return NextResponse.json({ success: false, error: 'Sesija nerasta' });
      }

      const listData = await listResponse.json();

      if (!listData.blobs || listData.blobs.length === 0) {
        return NextResponse.json({ success: false, error: 'Sesija nerasta' });
      }

      const blobUrl = listData.blobs[0].url;
      const sessionResponse = await fetch(blobUrl);
      const session = await sessionResponse.json();

      return NextResponse.json({ success: true, session });
    }

    if (action === 'delete') {
      const listResponse = await fetch(
        `https://blob.vercel-storage.com?prefix=sessions/${code}.json`,
        {
          headers: {
            Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
          },
        }
      );

      if (listResponse.ok) {
        const listData = await listResponse.json();
        if (listData.blobs && listData.blobs.length > 0) {
          await del(listData.blobs[0].url);
        }
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' });

  } catch (error) {
    console.error('Session API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Server error' 
    });
  }
}
