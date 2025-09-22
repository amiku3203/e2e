"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { decryptNote } from "@/lib/encryption";
import { AlertTriangle, Shield, Eye, Home, Copy } from "lucide-react";
import { toast } from "sonner";

export default function NotePage() {
  const params = useParams();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasBeenRead, setHasBeenRead] = useState(false);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const noteId = params.id as string;
        const encryptionKey = window.location.hash.substring(1); // Remove the # symbol

        if (!encryptionKey) {
          setError("Invalid link: Missing encryption key");
          setIsLoading(false);
          return;
        }

        const response = await fetch(`/api/notes/${noteId}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError("Note not found or has already been read");
          } else {
            setError("Failed to retrieve note");
          }
          
          setIsLoading(false);
          return;
        }

        const { encryptedContent, iv, salt } = await response.json();

        try {
          const decryptedContent = decryptNote(
            encryptedContent,
            encryptionKey,
            iv,
            salt
          );
           
          setContent(decryptedContent);
 setHasBeenRead(true); // show success banner
          toast.success("Note decrypted successfully!", {
            description: "This note has been permanently deleted.",
          });
        } catch (decryptError) {
          setError("Failed to decrypt note: Invalid key or corrupted data");
          toast.error("Decryption failed", {
            description:
              "The encryption key is invalid or the data is corrupted.",
          });
        }
      } catch (error) {
        console.error("Error fetching note:", error);
        setError("Network error: Failed to retrieve note");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNote();
  }, [params.id]);

  const goHome = () => {
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-slate-800/50 border-slate-700 max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400"></div>
              <span className="text-white">Retrieving secure note...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="max-w-md mx-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                <CardTitle className="text-white">Note Not Available</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-300">{error}</p>
              <div className="bg-amber-900/20 border border-amber-700 rounded-lg p-4">
                <p className="text-amber-200 text-sm">
                  <strong>Remember:</strong> Secure notes can only be read once.
                  If this note was already opened, it has been permanently
                  deleted for security.
                </p>
              </div>
              <Button
                onClick={goHome}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Home className="w-4 h-4 mr-2" />
                Create a New Note
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-purple-400 mr-3" />
              <h1 className="text-3xl font-bold text-white">Secure Note</h1>
            </div>
          </div>

          {/* Success Alert */}
          {hasBeenRead && (
            <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-green-400" />
                <p className="text-green-200">
                  <strong>Note successfully decrypted!</strong> This note has
                  been permanently deleted and cannot be accessed again.
                </p>
              </div>
            </div>
          )}

          {/* Note Content */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Your Message</CardTitle>
              <CardDescription className="text-slate-400">
                This note has been decrypted and will never be accessible again.
              </CardDescription>
            </CardHeader>
           <CardContent className="space-y-4">
  <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-6 min-h-[200px] relative">
    <pre className="text-white whitespace-pre-wrap font-sans leading-relaxed">
      {content}
    </pre>

    {/* Copy Button */}
    <Button
      variant="ghost"
      size="icon"
      onClick={() => {
        navigator.clipboard.writeText(content);
        toast.success("Copied to clipboard!", {
          description: "Your note content has been copied.",
        });
      }}
      className="absolute top-3 right-3 text-slate-300 hover:text-white"
    >
      <Copy className="w-5 h-5" />
    </Button>
  </div>

  <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
    <p className="text-red-200 text-sm">
      <strong>🔥 Self-Destructed:</strong> This note has been permanently deleted from our servers and cannot be recovered.
      The link you used is now invalid.
    </p>
  </div>

  <Button
    onClick={goHome}
    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
  >
    <Home className="w-4 h-4 mr-2" />
    Create Another Secure Note
  </Button>
</CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
