/**
 * EvidenceUpload — Upload images, video, audio, and documents as complaint evidence.
 */

import { useState, useRef } from "react";
import { useUploadAttachment } from "@/api/queries";
import { cn } from "@/lib/utils";

interface EvidenceUploadProps {
  complaintId: string;
}

interface FilePreview {
  file: File;
  preview: string;
  type: "image" | "video" | "audio" | "document";
}

export const ACCEPTED_TYPES: Record<string, string> = {
  "image/*": "Images",
  "video/*": "Videos",
  "audio/*": "Audio",
  ".pdf,.doc,.docx": "Documents",
};

const MAX_FILE_SIZE_MB = 25;

export default function EvidenceUpload({ complaintId }: EvidenceUploadProps) {
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadAttachment = useUploadAttachment();

  const getFileType = (file: File): FilePreview["type"] => {
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("video/")) return "video";
    if (file.type.startsWith("audio/")) return "audio";
    return "document";
  };

  const addFiles = (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const validFiles = fileArray.filter(
      (f) => f.size <= MAX_FILE_SIZE_MB * 1024 * 1024,
    );

    const previews: FilePreview[] = validFiles.map((file) => ({
      file,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
      type: getFileType(file),
    }));

    setFiles((prev) => [...prev, ...previews]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    for (const fp of files) {
      try {
        await uploadAttachment.mutateAsync({
          complaintId,
          file: fp.file,
        });
      } catch {
        // TODO: Handle upload error per file
      }
    }
    setFiles([]);
  };

  return (
    <div className="space-y-4" id="evidence-upload">
      {/* Drop Zone */}
      <div
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer",
          dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-primary/50",
        )}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => { e.preventDefault(); setDragActive(false); addFiles(e.dataTransfer.files); }}
        onClick={() => fileInputRef.current?.click()}
        id="evidence-dropzone"
      >
        <div className="text-4xl mb-3">📎</div>
        <p className="font-medium">Drop files here or click to browse</p>
        <p className="text-sm text-muted-foreground mt-1">
          Images, videos, audio, documents — Max {MAX_FILE_SIZE_MB}MB each
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
          id="evidence-file-input"
        />
      </div>

      {/* File Previews */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((fp, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 border rounded-lg bg-card"
            >
              {fp.type === "image" && fp.preview ? (
                <img src={fp.preview} alt="" className="w-12 h-12 rounded object-cover" />
              ) : (
                <div className="w-12 h-12 rounded bg-muted flex items-center justify-center text-xl">
                  {fp.type === "video" ? "🎥" : fp.type === "audio" ? "🎵" : "📄"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{fp.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(fp.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="text-destructive hover:text-destructive/80 transition"
                id={`remove-file-${index}`}
              >
                ✕
              </button>
            </div>
          ))}
          <button
            onClick={handleUpload}
            disabled={uploadAttachment.isPending}
            className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
            id="upload-evidence-btn"
          >
            {uploadAttachment.isPending ? "Uploading..." : `Upload ${files.length} file(s)`}
          </button>
        </div>
      )}
    </div>
  );
}
