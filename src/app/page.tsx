'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { encryptNote } from '@/lib/encryption';
import { Copy, Lock, Shield, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function Home() {
  const [content, setContent] = useState('');
  const [shareableLink, setShareableLink] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  const createNote = async () => {
    if (!content.trim()) return;

    setIsCreating(true);
    try {
      // Encrypt the note on the client side
      const { encryptedContent, iv, salt, key } = encryptNote(content);
      
      // Send encrypted data to the server
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          encryptedContent,
          iv,
          salt,
        }),
      });

      if (response.ok) {
        const { id } = await response.json();
        // Include the encryption key in the URL fragment (not sent to server)
        const link = `${window.location.origin}/note/${id}#${key}`;
        setShareableLink(link);
        setContent(''); // Clear the content for security
        toast.success('Secure note created successfully!', {
          description: 'Your encrypted note is ready to share.',
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error('Failed to create note', {
          description: errorData.error || 'Please check your connection and try again.',
        });
      }
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error('Network error', {
        description: 'Unable to connect to the server. Please try again.',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareableLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Link copied to clipboard!', {
        description: 'The secure link is ready to share.',
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy link', {
        description: 'Please copy the link manually.',
      });
    }
  };

  const resetForm = () => {
    setShareableLink('');
    setContent('');
    toast.info('Ready for a new note', {
      description: 'Form has been reset for your next secure message.',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-12 h-12 text-purple-400 mr-3" />
              <h1 className="text-4xl font-bold text-white">SecureNotes</h1>
            </div>
            <p className="text-xl text-slate-300">
              End-to-end encrypted notes that self-destruct after reading
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <div className="flex items-center mb-2">
                  <Lock className="w-5 h-5 text-purple-400 mr-2" />
                  <h3 className="font-semibold text-white">End-to-End Encrypted</h3>
                </div>
                <p className="text-slate-400 text-sm">
                  Your notes are encrypted in your browser before being sent to our servers
                </p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <div className="flex items-center mb-2">
                  <Zap className="w-5 h-5 text-purple-400 mr-2" />
                  <h3 className="font-semibold text-white">Self-Destructing</h3>
                </div>
                <p className="text-slate-400 text-sm">
                  Notes are automatically deleted after being read once
                </p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <div className="flex items-center mb-2">
                  <Shield className="w-5 h-5 text-purple-400 mr-2" />
                  <h3 className="font-semibold text-white">Zero Knowledge</h3>
                </div>
                <p className="text-slate-400 text-sm">
                  We never have access to your unencrypted content
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          {!shareableLink ? (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Create a Secure Note</CardTitle>
                <CardDescription className="text-slate-400">
                  Write your message below. It will be encrypted and can only be read once.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="note-content" className="text-white">Your Message</Label>
                  <Textarea
                    id="note-content"
                    placeholder="Type your secret message here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[200px] bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-purple-400"
                  />
                </div>
                <Button 
                  onClick={createNote}
                  disabled={!content.trim() || isCreating}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isCreating ? 'Creating Secure Note...' : 'Create Secure Note'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Your Secure Note is Ready!</CardTitle>
                <CardDescription className="text-slate-400">
                  Share this link with your recipient. Remember: it can only be opened once!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="shareable-link" className="text-white">Shareable Link</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="shareable-link"
                      value={shareableLink}
                      readOnly
                      className="bg-slate-900/50 border-slate-600 text-white"
                    />
                    <Button
                      onClick={copyToClipboard}
                      variant="outline"
                      className="border-slate-600 text-white hover:bg-slate-700"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                </div>
                <div className="bg-amber-900/20 border border-amber-700 rounded-lg p-4">
                  <p className="text-amber-200 text-sm">
                    <strong>⚠️ Important:</strong> This link will only work once. After someone opens it, 
                    the note will be permanently deleted and cannot be recovered.
                  </p>
                </div>
                <Button 
                  onClick={resetForm}
                  variant="outline"
                  className="w-full border-slate-600 text-white hover:bg-slate-700"
                >
                  Create Another Note
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}