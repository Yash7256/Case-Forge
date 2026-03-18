import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { uploadImage } from "@/lib/api";
import { UploadResponse } from "@/types";

interface UploadZoneProps {
  onUploaded: (payload: UploadResponse) => void;
  onError?: (message: string) => void;
  isUploading?: boolean;
  onUpload?: (file: File) => Promise<UploadResponse>;
}

const ACCEPTED = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

export const UploadZone = ({ onUploaded, onError, isUploading, onUpload }: UploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = async (files?: FileList | null) => {
    if (!files?.length) return;
    const file = files[0];
    if (!ACCEPTED.includes(file.type)) {
      onError?.("Please upload a PNG, JPG, or WEBP image.");
      return;
    }
    try {
      const payload = await (onUpload ? onUpload(file) : uploadImage(file));
      onUploaded(payload);
    } catch (error) {
      onError?.((error as Error).message);
    }
  };

  const onInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    await handleFiles(e.target.files);
  };

  const onDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    await handleFiles(e.dataTransfer.files);
  };

  return (
    <div
      onDragEnter={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      className={cn(
        "group relative flex min-h-[260px] w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-white/70 p-8 text-center shadow-glass transition hover:-translate-y-0.5 hover:shadow-xl",
        isDragging && "border-brand-500 bg-brand-50/60",
        isUploading && "opacity-60"
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600 shadow-inner">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-7 w-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-9 0V3.75m0 12.75 3.75-3.75M12 16.5 8.25 12.75" />
        </svg>
      </div>
      <div>
        <p className="text-lg font-semibold">Drop your design screenshots</p>
        <p className="text-sm text-slate-600">PNG, JPG, or WEBP — we&apos;ll start the interview instantly.</p>
      </div>
      <div className="flex items-center gap-3">
        <Button type="button" variant="primary" loading={isUploading} onClick={() => inputRef.current?.click()}>
          Browse files
        </Button>
        <span className="text-sm text-slate-500">or drag & drop</span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="hidden"
        onChange={onInputChange}
      />
    </div>
  );
};
