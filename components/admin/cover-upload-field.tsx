"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CoverUploadFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

export function CoverUploadField({ value, onChange }: CoverUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async () => {
    const file = fileInputRef.current?.files?.[0];

    if (!file) {
      setError("Choose a file first");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const body = new FormData();
      body.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body,
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string };
        throw new Error(errorData.error ?? "Upload failed");
      }

      const payload = (await response.json()) as { url: string };
      onChange(payload.url);
      fileInputRef.current!.value = "";
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3 rounded-lg border border-[color:var(--border)] p-3">
      <div className="space-y-2">
        <Label htmlFor="cover-upload">Upload cover image</Label>
        <Input id="cover-upload" ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="secondary" onClick={upload} disabled={uploading}>
          {uploading ? "Uploading..." : "Upload image"}
        </Button>

        {value ? (
          <Button type="button" variant="ghost" onClick={() => onChange("")}>
            Remove image
          </Button>
        ) : null}
      </div>

      {error ? <p className="text-sm text-[color:var(--danger)]">{error}</p> : null}

      {value ? (
        <div className="overflow-hidden rounded-md border border-[color:var(--border)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Prompt cover preview" className="h-44 w-full object-cover" loading="lazy" />
        </div>
      ) : null}
    </div>
  );
}
