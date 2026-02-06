import { useEffect, useRef, useState } from 'react';
import { loadFaceApiModels, detectFace, getFaceApi } from '@/utils/faceApi';

interface FaceRegistrationProps {
    onDescriptorGenerated: (descriptor: string) => void;
}

export default function FaceRegistration({ onDescriptorGenerated }: FaceRegistrationProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [detecting, setDetecting] = useState(false);
    const [status, setStatus] = useState<string>('Loading models...');
    const [descriptor, setDescriptor] = useState<Float32Array | null>(null);

    useEffect(() => {
        async function init() {
            const loaded = await loadFaceApiModels();
            if (loaded) {
                setIsModelLoaded(true);
                setStatus('Ready to scan. Please center your face.');
                startVideo();
            } else {
                setStatus('Failed to load Face Recognition models.');
            }
        }
        init();

        return () => {
            stopVideo();
        };
    }, []);

    const startVideo = async () => {
        try {
            const currentStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(currentStream);
            if (videoRef.current) {
                videoRef.current.srcObject = currentStream;
            }
        } catch (err) {
            console.error("Camera error:", err);
            setStatus('Could not access camera.');
        }
    };

    const stopVideo = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const handleCapture = async () => {
        if (!videoRef.current || !canvasRef.current || !isModelLoaded) return;

        setDetecting(true);
        setStatus('Detecting face...');

        try {
            const faceapi = await getFaceApi();
            if (!faceapi) return;

            const detection = await detectFace(videoRef.current);

            if (detection) {
                // Generated descriptor is a Float32Array (128)
                const desc = detection.descriptor;
                setDescriptor(desc);

                // Convert to JSON string for storage
                const descString = JSON.stringify(Array.from(desc));
                onDescriptorGenerated(descString);

                setStatus('Face registered successfully!');
                stopVideo();
            } else {
                setStatus('No face detected. Please try again.');
            }
        } catch (e) {
            console.error(e);
            setStatus('Error during detection.');
        } finally {
            setDetecting(false);
        }
    };

    const handleRetake = () => {
        setDescriptor(null);
        onDescriptorGenerated('');
        startVideo();
        setStatus('Ready to scan. Please center your face.');
    };

    return (
        <div className="flex flex-col items-center gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Face Registration</h3>

            <div className="relative overflow-hidden rounded-md bg-black w-[320px] h-[240px]">
                {!descriptor ? (
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
                        <span className="text-4xl">✅</span>
                    </div>
                )}

                {/* Helper canvas for internal FaceAPI usage/debug */}
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
            </div>

            <div className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 min-h-[1.5rem]">
                {status}
            </div>

            <div className="flex gap-3">
                {!descriptor ? (
                    <button
                        type="button"
                        onClick={handleCapture}
                        disabled={!isModelLoaded || detecting}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {detecting ? 'Scanning...' : 'Capture Face'}
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={handleRetake}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-gray-900 dark:text-white rounded transition-colors"
                    >
                        Retake Photo
                    </button>
                )}
            </div>
        </div>
    );
}
