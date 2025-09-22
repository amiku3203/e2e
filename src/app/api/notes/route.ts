import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import dbConnect from '@/lib/mongodb';
import Note from '@/models/Note';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { encryptedContent, iv, salt } = await request.json();
    
    if (!encryptedContent || !iv || !salt) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const noteId = nanoid(21); // Generate unique ID for the note
    
    const note = new Note({
      id: noteId,
      encryptedContent,
      iv,
      salt,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now as fallback
    });
    
    await note.save();
    
    return NextResponse.json({ id: noteId }, { status: 201 });
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    );
  }
}
