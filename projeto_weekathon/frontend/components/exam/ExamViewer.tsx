"use client";

import { useState } from "react";
import { ZoomIn, ZoomOut, RotateCw, Maximize2 } from "lucide-react";

interface Props {
  imageUrl?: string;
  patientName?: string;
  examType?: string;
}

export default function ExamViewer({ imageUrl, patientName, examType }: Props) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));
  const handleRotate = () => setRotation((r) => (r + 90) % 360);

  const fullImageUrl = imageUrl ?? null;

  const showImage = fullImageUrl && !imgError;

  return (
    <>
      <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-700 shadow-lg">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
          <div className="text-xs text-gray-400">
            {patientName && <span className="font-medium text-gray-200">{patientName}</span>}
            {examType && <span className="ml-2 text-gray-500">{examType}</span>}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleZoomOut}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title="Reduzir"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-400 w-10 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title="Ampliar"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleRotate}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors ml-1"
              title="Girar 90°"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsFullscreen(true)}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title="Tela cheia"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Visor */}
        <div className="relative overflow-hidden bg-black" style={{ height: "480px" }}>
          {showImage ? (
            <div
              className="absolute inset-0 flex items-center justify-center transition-transform duration-150"
              style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={fullImageUrl}
                alt={`Exame ${examType ?? ""} — ${patientName ?? ""}`}
                className="max-w-full max-h-full object-contain"
                style={{ filter: "brightness(1.05) contrast(1.15) grayscale(1)" }}
                onError={() => setImgError(true)}
              />
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600">
              <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-3">
                <ZoomIn className="w-8 h-8 opacity-30" />
              </div>
              <p className="text-sm">Imagem não disponível</p>
              <p className="text-xs mt-1 opacity-60">Arquivo pode estar sendo processado</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal tela cheia */}
      {isFullscreen && showImage && (
        <div
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          onClick={() => setIsFullscreen(false)}
        >
          <button
            className="absolute top-4 right-4 text-white bg-gray-800 rounded-lg p-2 hover:bg-gray-700"
            onClick={(e) => { e.stopPropagation(); setIsFullscreen(false); }}
          >
            Fechar ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fullImageUrl}
            alt="Exame em tela cheia"
            className="max-w-full max-h-full object-contain"
            style={{ transform: `rotate(${rotation}deg)`, filter: "brightness(1.05) contrast(1.15) grayscale(1)" }}
            crossOrigin="anonymous"
          />
        </div>
      )}
    </>
  );
}
