import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Camera, Upload, Trash2, User } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Compresses any image File/Blob/Canvas into a lightweight JPEG data URL
 * (max 360x360, ~15-35 KB) to save database storage.
 */
async function compressImageSource(imgElement, maxDim = 360, quality = 0.72) {
  const canvas = document.createElement('canvas');
  let { width, height } = imgElement;
  if (width > height) {
    if (width > maxDim) {
      height = Math.round((height * maxDim) / width);
      width = maxDim;
    }
  } else {
    if (height > maxDim) {
      width = Math.round((width * maxDim) / height);
      height = maxDim;
    }
  }
  canvas.width = Math.max(1, width);
  canvas.height = Math.max(1, height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', quality);
}

export default function PhotoUploader({ value, onChange, label = 'Profile Photo (Optional)' }) {
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [isCamOpen, setIsCamOpen] = useState(false);
  const [camError, setCamError] = useState('');
  const [capturedPreview, setCapturedPreview] = useState('');

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = async () => {
        try {
          const compressed = await compressImageSource(img);
          onChange(compressed);
        } catch {
          toast.error('Failed to process image');
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const openCamera = async () => {
    setCamError('');
    setCapturedPreview('');
    setIsCamOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 100);
    } catch {
      setCamError('Camera access denied or unavailable. Please allow camera permission or use Upload File.');
    }
  };

  const handleCapture = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = video.videoWidth || 480;
    tempCanvas.height = video.videoHeight || 480;
    tempCanvas.getContext('2d').drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);

    const img = new Image();
    img.onload = async () => {
      const compressed = await compressImageSource(img);
      setCapturedPreview(compressed);
    };
    img.src = tempCanvas.toDataURL('image/jpeg', 0.9);
  };

  const handleUseCaptured = () => {
    if (capturedPreview) {
      onChange(capturedPreview);
    }
    stopCamera();
    setIsCamOpen(false);
  };

  const closeCam = (open) => {
    if (!open) stopCamera();
    setIsCamOpen(open);
  };

  const approxKb = value ? Math.round((value.length * 3) / 4 / 1024) : 0;

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap items-center gap-3">
        <div className="h-16 w-16 rounded-full border border-border bg-muted/40 overflow-hidden flex items-center justify-center shrink-0">
          {value ? (
            <img src={value} alt="Preview" className="h-full w-full object-cover" />
          ) : (
            <User className="h-7 w-7 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="gap-1.5"
          >
            <Upload className="h-3.5 w-3.5" /> Upload File
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openCamera}
            className="gap-1.5"
          >
            <Camera className="h-3.5 w-3.5" /> Take Photo
          </Button>
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange('')}
              className="text-red-500 hover:text-red-600 gap-1"
            >
              <Trash2 className="h-3.5 w-3.5" /> Remove
            </Button>
          )}
          {value && (
            <span className="text-[11px] text-emerald-500">Compressed ({approxKb} KB)</span>
          )}
        </div>
      </div>

      <Dialog open={isCamOpen} onOpenChange={closeCam}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Take Photo (Camera)</DialogTitle>
          </DialogHeader>
          {camError ? (
            <p className="text-sm text-red-500 py-4">{camError}</p>
          ) : (
            <div className="space-y-3">
              <div className="rounded-md overflow-hidden bg-black aspect-video flex items-center justify-center">
                {capturedPreview ? (
                  <img src={capturedPreview} alt="Captured" className="h-full w-full object-contain" />
                ) : (
                  <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
                )}
              </div>
              <div className="flex justify-end gap-2">
                {capturedPreview ? (
                  <>
                    <Button type="button" variant="outline" onClick={() => setCapturedPreview('')}>
                      Retake
                    </Button>
                    <Button type="button" onClick={handleUseCaptured} className="bg-red-600 hover:bg-red-700 text-white">
                      Use Photo
                    </Button>
                  </>
                ) : (
                  <Button type="button" onClick={handleCapture} className="bg-red-600 hover:bg-red-700 text-white gap-1.5">
                    <Camera className="h-4 w-4" /> Capture
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
