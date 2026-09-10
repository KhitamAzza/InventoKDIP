import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { Camera, CameraOff, Upload, Search, RefreshCw, CheckCircle2, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import { Equipment } from '../types';
import { getEquipmentBySeries, updateEquipment } from '../firebase';
import { QRCodeDisplay } from './QRCodeDisplay';

interface QRScannerProps {
  onSelectEquipmentForEdit?: (item: Equipment) => void;
  onNavigateToAddWithSeries?: (series: string) => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({
  onSelectEquipmentForEdit,
  onNavigateToAddWithSeries,
}) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedCode, setScannedCode] = useState<string>('');
  const [manualCode, setManualCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchedItem, setSearchedItem] = useState<Equipment | null>(null);
  const [searchNotFound, setSearchNotFound] = useState(false);
  const [updateStatusSuccess, setUpdateStatusSuccess] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera helper
  const stopCamera = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Start camera helper
  const startCamera = async () => {
    setCameraError(null);
    try {
      stopCamera();
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsCameraActive(true);
        requestScan();
      }
    } catch (err: unknown) {
      console.error('Camera access error:', err);
      const errMsg = err instanceof Error ? err.message : 'Unable to access camera';
      setCameraError(
        `${errMsg}. Check camera permissions or use Image Upload / Manual Entry below.`
      );
      setIsCameraActive(false);
    }
  };

  // Continuous frame scan
  const requestScan = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'attemptBoth',
      });

      if (code && code.data) {
        handleCodeDetected(code.data);
        return; // stop scanning after detect
      }
    }

    animationFrameId.current = requestAnimationFrame(requestScan);
  };

  // Handle scanned/found code
  const handleCodeDetected = async (codeText: string) => {
    stopCamera();
    const clean = codeText.trim().toUpperCase();
    setScannedCode(clean);
    await lookupEquipment(clean);
  };

  // Lookup in Firestore
  const lookupEquipment = async (code: string) => {
    setIsLoading(true);
    setSearchNotFound(false);
    setSearchedItem(null);
    setUpdateStatusSuccess(null);

    try {
      const item = await getEquipmentBySeries(code);
      if (item) {
        setSearchedItem(item);
        setSearchNotFound(false);
      } else {
        setSearchNotFound(true);
      }
    } catch (error) {
      console.error('Lookup failed', error);
      setSearchNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Process file upload QR scan
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });

        if (code && code.data) {
          handleCodeDetected(code.data);
        } else {
          setCameraError('No valid QR code detected in the uploaded image. Please try another photo.');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    // Reset file input
    e.target.value = '';
  };

  // Handle quick status update
  const handleQuickStatusChange = async (newStatus: Equipment['status']) => {
    if (!searchedItem?.id) return;
    try {
      setIsLoading(true);
      await updateEquipment(searchedItem.id, { status: newStatus });
      setSearchedItem((prev) => (prev ? { ...prev, status: newStatus } : null));
      setUpdateStatusSuccess(`Equipment status updated to ${newStatus.replace('_', ' ')}`);
      setTimeout(() => setUpdateStatusSuccess(null), 3500);
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div id="qr-scanner-view" className="space-y-6 max-w-4xl mx-auto">
      {/* Header & Description */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Camera className="w-5 h-5 text-indigo-600" />
              Equipment QR Scanner
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Scan the QR code printed on computer lab equipment to retrieve specifications, location, and maintenance records.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isCameraActive ? (
              <button
                id="start-camera-btn"
                type="button"
                onClick={startCamera}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Start Camera Scanner</span>
              </button>
            ) : (
              <button
                id="stop-camera-btn"
                type="button"
                onClick={stopCamera}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <CameraOff className="w-4 h-4" />
                <span>Stop Camera</span>
              </button>
            )}

            <button
              id="upload-image-scan-btn"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Photo</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </div>

        {/* Camera Error Message */}
        {cameraError && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{cameraError}</span>
          </div>
        )}

        {/* Live Camera Viewport */}
        {isCameraActive && (
          <div className="mt-6 relative bg-black rounded-2xl overflow-hidden aspect-video max-h-[380px] flex items-center justify-center border-2 border-indigo-500">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Target Reticle Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-56 h-56 border-2 border-dashed border-indigo-400 rounded-2xl relative">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-white -mt-1 -ml-1 rounded-tl"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-white -mt-1 -mr-1 rounded-tr"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-white -mb-1 -ml-1 rounded-bl"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-white -mb-1 -mr-1 rounded-br"></div>
                <div className="absolute inset-x-0 top-1/2 h-0.5 bg-red-500/60 animate-pulse"></div>
              </div>
            </div>

            <div className="absolute bottom-3 bg-black/70 backdrop-blur-xs text-white text-xs px-3 py-1.5 rounded-full font-medium">
              Point camera at equipment QR code sticker
            </div>
          </div>
        )}

        {/* Manual lookup input for rapid testing */}
        <div className="mt-5 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="manual-series-input"
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && manualCode) lookupEquipment(manualCode);
              }}
              placeholder="Or enter series number (e.g. INV.AE001.260909)"
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>
          <button
            id="manual-search-btn"
            type="button"
            disabled={!manualCode.trim() || isLoading}
            onClick={() => manualCode && lookupEquipment(manualCode)}
            className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Lookup Item</span>
          </button>
        </div>
      </div>

      {/* Result Card: Equipment Found */}
      {searchedItem && (
        <div id="equipment-details-card" className="bg-white p-6 rounded-2xl border border-emerald-200 shadow-sm">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="shrink-0 flex justify-center md:justify-start">
              <QRCodeDisplay
                seriesNumber={searchedItem.seriesNumber}
                equipmentName={searchedItem.name}
                labLocation={searchedItem.labLocation}
                size={160}
              />
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {searchedItem.category}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                        searchedItem.status === 'operational'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : searchedItem.status === 'maintenance_required'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : searchedItem.status === 'under_repair'
                          ? 'bg-orange-50 text-orange-700 border border-orange-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {searchedItem.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mt-1">
                    {searchedItem.name}
                  </h2>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    ID: {searchedItem.id}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-500 font-medium">Acquisition Date</div>
                  <div className="text-sm font-semibold text-slate-800">
                    {searchedItem.acquisitionDate}
                  </div>
                </div>
              </div>

              {/* Status Update banner if triggered */}
              {updateStatusSuccess && (
                <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{updateStatusSuccess}</span>
                </div>
              )}

              {/* Specifications grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-sm">
                <div>
                  <span className="text-xs text-slate-500 block">Brand & Model:</span>
                  <span className="font-semibold text-slate-800">
                    {searchedItem.brand || 'N/A'} {searchedItem.model}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Lab Location:</span>
                  <span className="font-semibold text-slate-800">
                    {searchedItem.labLocation}
                  </span>
                </div>
                {searchedItem.manufacturerSerial && (
                  <div>
                    <span className="text-xs text-slate-500 block">MFR Serial:</span>
                    <span className="font-mono text-xs text-slate-800">
                      {searchedItem.manufacturerSerial}
                    </span>
                  </div>
                )}
                {searchedItem.specifications && (
                  <div className="sm:col-span-2">
                    <span className="text-xs text-slate-500 block">Hardware Specs:</span>
                    <span className="text-xs text-slate-700 font-medium">
                      {searchedItem.specifications}
                    </span>
                  </div>
                )}
                {searchedItem.notes && (
                  <div className="sm:col-span-2">
                    <span className="text-xs text-slate-500 block">Notes:</span>
                    <span className="text-xs text-slate-600">{searchedItem.notes}</span>
                  </div>
                )}
              </div>

              {/* Quick Status Action Controls */}
              <div className="pt-2">
                <span className="text-xs font-medium text-slate-500 block mb-1.5">
                  Update Equipment Status:
                </span>
                <div className="flex flex-wrap gap-2">
                  {(['operational', 'maintenance_required', 'under_repair', 'decommissioned'] as const).map(
                    (st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleQuickStatusChange(st)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer capitalize ${
                          searchedItem.status === st
                            ? 'bg-slate-900 text-white font-semibold'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {st.replace('_', ' ')}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Result: Not Found in Database */}
      {searchNotFound && (
        <div id="equipment-not-found" className="bg-amber-50/70 border border-amber-200 p-6 rounded-2xl text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            No Equipment Found for Series: <span className="font-mono text-amber-800">{scannedCode || manualCode}</span>
          </h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            This QR code is valid format but has not yet been registered into the computer lab equipment database.
          </p>
          {onNavigateToAddWithSeries && (
            <button
              id="register-scanned-code-btn"
              type="button"
              onClick={() => onNavigateToAddWithSeries(scannedCode || manualCode)}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Register This Equipment Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
