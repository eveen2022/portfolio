"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, Loader2, Crop } from "lucide-react";
import { Label, Input } from "@/components/admin/form";
import { ImageCropModal } from "@/components/admin/ImageCropModal";
import { getCroppedImageBlob, type CropPixels } from "@/lib/cropImage";

export function ImageUpload({
  label,
  category,
  nameHint,
  value,
  onChange,
  aspect = 16 / 9,
}: {
  label: string;
  category: "projects" | "blog" | "experience" | "site";
  nameHint: string;
  value: string;
  onChange: (path: string) => void;
  aspect?: number;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File | Blob, extensionHint: string) {
    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file, `upload.${extensionHint}`);
      formData.append("category", category);
      formData.append("nameHint", nameHint || "image");

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Upload failed");
      }

      const data = await response.json();
      onChange(data.path);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // SVGs are vector — cropping would rasterize them, so skip straight to upload.
    if (file.type === "image/svg+xml") {
      uploadFile(file, "svg");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleCropConfirm(cropPixels: CropPixels) {
    if (!cropSrc) return;
    try {
      const blob = await getCroppedImageBlob(cropSrc, cropPixels);
      setCropSrc(null);
      await uploadFile(blob, "png");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to crop image");
      setCropSrc(null);
    }
  }

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-start gap-4">
        <div className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-secondary">
          {value && value.startsWith("/") ? (
            <Image src={value} alt="" fill className="object-cover" />
          ) : (
            <Upload className="size-5 text-muted" />
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Loader2 className="size-5 animate-spin text-white" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
            onChange={handleFileChange}
            className="block w-full text-sm text-foreground-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:opacity-90"
          />
          <p className="mt-1 flex items-center gap-1 text-xs text-muted">
            <Crop className="size-3" /> You&apos;ll be able to crop after selecting an image
          </p>
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="/images/..."
            className="mt-2"
          />
          {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
      </div>

      {cropSrc && (
        <ImageCropModal
          imageSrc={cropSrc}
          aspect={aspect}
          onCancel={() => setCropSrc(null)}
          onConfirm={handleCropConfirm}
        />
      )}
    </div>
  );
}
