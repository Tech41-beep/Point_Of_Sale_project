import { useEffect, useRef, useState } from "react";

const Barcode = ({ onScan }) => {
  const [barcode, setBarcode] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraStarting, setCameraStarting] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const inputRef = useRef(null);
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const scanLockedRef = useRef(false);

  const stopCamera = () => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    const stream = videoRef.current?.srcObject;
    stream?.getTracks().forEach((track) => track.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    scanLockedRef.current = false;
    setCameraOpen(false);
    setCameraStarting(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    inputRef.current?.focus();
    return () => {
      controlsRef.current?.stop();
      const stream = videoRef.current?.srcObject;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const submitBarcode = (value) => {
    const normalizedValue = value.trim();
    if (!normalizedValue) return;
    onScan?.(normalizedValue);
    setBarcode("");
    inputRef.current?.focus();
  };

  const startCamera = async () => {
    if (cameraOpen || cameraStarting) return;
    setCameraError("");
    setCameraOpen(true);
    setCameraStarting(true);
    scanLockedRef.current = false;

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera scanning is not supported by this browser.");
      }

      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      const reader = new BrowserMultiFormatReader();
      controlsRef.current = await reader.decodeFromConstraints(
        { video: { facingMode: { ideal: "environment" } }, audio: false },
        videoRef.current,
        (result) => {
          if (!result || scanLockedRef.current) return;
          scanLockedRef.current = true;
          const value = result.getText();
          stopCamera();
          submitBarcode(value);
        },
      );
      setCameraStarting(false);
    } catch (error) {
      stopCamera();
      if (error?.name === "NotAllowedError") {
        setCameraError("Camera permission was denied. Allow access or enter the barcode manually.");
      } else {
        setCameraError(error?.message || "Unable to open the camera.");
      }
    }
  };

  return (
    <section className="w-full rounded-xl border border-gray-200 bg-white p-4">
      <label htmlFor="barcode-input" className="mb-2 block text-sm font-medium text-gray-700">Scan product</label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="barcode-input"
          ref={inputRef}
          type="text"
          value={barcode}
          onChange={(event) => setBarcode(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              submitBarcode(barcode);
            }
          }}
          placeholder="Scan or enter barcode..."
          className="flex-1 rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          autoComplete="off"
        />
        <button type="button" onClick={() => submitBarcode(barcode)} className="rounded-lg bg-blue-600 px-5 py-3 text-white transition hover:bg-blue-700">Add</button>
        <button type="button" onClick={cameraOpen ? stopCamera : startCamera} disabled={cameraStarting} className="rounded-lg border border-blue-600 px-5 py-3 text-blue-600 transition hover:bg-blue-50 disabled:opacity-60">
          {cameraStarting ? "Opening..." : cameraOpen ? "Close camera" : "Use camera"}
        </button>
      </div>

      <div className={cameraOpen ? "mt-4" : "hidden"}>
        <div className="relative mx-auto max-w-lg overflow-hidden rounded-xl bg-black">
          <video ref={videoRef} className="aspect-video w-full object-cover" muted playsInline />
          <div className="pointer-events-none absolute inset-x-[12%] top-1/2 h-24 -translate-y-1/2 rounded-lg border-2 border-white/80" />
        </div>
        <p className="mt-2 text-center text-xs text-gray-500">Place one barcode inside the frame.</p>
      </div>

      {cameraError && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{cameraError}</p>}
      <p className="mt-2 text-xs text-gray-500">Use a USB scanner, enter a barcode manually, or scan with your camera.</p>
    </section>
  );
};

export default Barcode;
