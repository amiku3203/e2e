import mongoose from 'mongoose';

export interface INote {
  _id?: string;
  id: string;
  encryptedContent: string;
  iv: string;
  salt: string;
  createdAt: Date;
  expiresAt?: Date;
}

const NoteSchema = new mongoose.Schema<INote>({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  encryptedContent: {
    type: String,
    required: true
  },
  iv: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-delete after being read (TTL index)
NoteSchema.index({ "expiresAt": 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.Note || mongoose.model<INote>('Note', NoteSchema);
