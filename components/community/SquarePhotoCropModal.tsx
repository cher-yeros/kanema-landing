"use client";

import "react-easy-crop/react-easy-crop.css";
import "./square-photo-crop-modal.css";
import { useCallback, useEffect, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { createPortal } from "react-dom";

type SquarePhotoCropModalProps = {
  open: boolean;
  imageSrc: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: (croppedAreaPixels: Area) => void;
};

export function SquarePhotoCropModal({
  open,
  imageSrc,
  loading = false,
  onCancel,
  onConfirm,
}: SquarePhotoCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  useEffect(() => {
    if (!open) return;
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  }, [open, imageSrc]);

  const onCropComplete = useCallback((_area: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  if (!open) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      <div
        className="modal-backdrop fade show square-photo-crop-dialog__backdrop"
        onClick={loading ? undefined : onCancel}
        aria-hidden
      />
      <div
        className="modal fade show d-block square-photo-crop-dialog"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="squarePhotoCropTitle"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content shadow">
            <div className="modal-header border-0 pb-0">
              <h2 className="modal-title h5" id="squarePhotoCropTitle">
                Crop profile photo
              </h2>
              <button
                type="button"
                className="btn-close btn-close-white"
                aria-label="Close"
                onClick={onCancel}
                disabled={loading}
              />
            </div>
            <div className="modal-body pt-2">
              <p className="small text-muted mb-3">
                Drag to reposition and use the slider to zoom. Your photo will
                be saved as a square.
              </p>
              <div className="position-relative overflow-hidden square-photo-crop-dialog__crop-stage">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="rect"
                  showGrid={false}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>
              <label
                htmlFor="avatar-crop-zoom"
                className="form-label small mt-3 mb-1"
              >
                Zoom
              </label>
              <input
                id="avatar-crop-zoom"
                type="range"
                className="form-range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                disabled={loading}
                onChange={(e) => setZoom(Number(e.target.value))}
              />
            </div>
            <div className="modal-footer border-0 pt-0 gap-2">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-accent"
                disabled={loading || !croppedAreaPixels}
                onClick={() => {
                  if (croppedAreaPixels) onConfirm(croppedAreaPixels);
                }}
              >
                {loading ? "Uploading…" : "Use photo"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
