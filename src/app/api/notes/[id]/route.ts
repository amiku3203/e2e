import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Note from '@/models/Note';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Note ID is required' },
        { status: 400 }
      );
    }
    
    // Find and delete the note in one operation (self-destruct)
    const note = await Note.findOneAndDelete({ id });
    
    if (!note) {
      return NextResponse.json(
        { error: 'Note not found or already deleted' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      encryptedContent: note.encryptedContent,
      iv: note.iv,
      salt: note.salt,
      createdAt: note.createdAt
    });
  } catch (error) {
    console.error('Error retrieving note:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve note' },
      { status: 500 }
    );
  }
}
