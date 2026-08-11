"use client";

import { useState, useCallback } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { X, ZoomIn, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { CropPixels } from "@/lib/cropImage";

export function ImageCropModal({
  imageSrc,
  aspect,
  onCancel,
  onConfirm,
}: {
  imageSrc: string;
  aspect: number;
  onCancel: () => void;
  onConfirm: (crop: CropPixels) => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const handleCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
      <div className="glass glass-strong glass-sheen relative flex w-full max-w-lg flex-col gap-4 rounded-3xl p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            Crop image
          </h3>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="flex size-8 items-center justify-center rounded-full text-muted hover:bg-foreground/5"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="relative h-72 w-full overflow-hidden rounded-2xl bg-neutral-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
        </div>

        <div className="flex items-center gap-3 px-1">
          <ZoomIn className="size-4 shrink-0 text-muted" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-accent"
            aria-label="Zoom"
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!croppedAreaPixels}
            onClick={() => croppedAreaPixels && onConfirm(croppedAreaPixels)}
          >
            <Check className="size-4" /> Apply crop
          </Button>
        </div>
      </div>
    </div>
  );
}
