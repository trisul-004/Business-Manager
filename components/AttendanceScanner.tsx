'use client';

import { useEffect, useRef, useState } from 'react';
import { loadFaceApiModels, getFaceApi } from '@/utils/faceApi';
import { markAttendance } from '@/actions/attendance';

interface Employee {
    id: string;
    name: string;
    faceDescriptor: string | null;
}

interface AttendanceScannerProps {
    siteId: string;
    employees: Employee[];
}

export default function AttendanceScanner({ siteId, employees }: AttendanceScannerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [status, setStatus] = useState('Loading models...');
    const [lastMarked, setLastMarked] = useState<string | null>(null);
    const matcherRef = useRef<any>(null); // faceapi.FaceMatcher
    const scanningRef = useRef(false);

    useEffect(() => {
        const init = async () => {
            const faceapi = await getFaceApi();
            if (!faceapi) {
                setStatus('Failed to load FaceAPI.');
                return;
            }

            const loaded = await loadFaceApiModels();
            if (!loaded) {
                setStatus('Failed to load detection models.');
                return;
            }

            // Prepare Matcher
            const labeledDescriptors = employees
                .filter(e => e.faceDescriptor)
                .map(e => {
                    try {
                        const descriptor = new Float32Array(JSON.parse(e.faceDescriptor!));
                        return new faceapi.LabeledFaceDescriptors(e.id, [descriptor]);
                    } catch (err) {
                        console.error("Invalid descriptor for", e.name);
                        return null;
                    }
                })
                .filter(d => d !== null);

            if (labeledDescriptors.length === 0) {
                setStatus('No employees with registered faces found.');
                return; // Can still start camera but won't match anything
            }

            matcherRef.current = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
            setStatus('Ready. Starting camera...');
            startVideo();
        };

        init();

        return () => stopVideo();
    }, [employees]);

    const startVideo = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                // Wait for play
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current?.play();
                    startScanning();
                };
            }
        } catch (err) {
            console.error(err);
            setStatus('Camera permission denied.');
        }
    };

    const stopVideo = () => {
        scanningRef.current = false;
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(t => t.stop());
            videoRef.current.srcObject = null;
        }
    };

    const startScanning = async () => {
        if (!videoRef.current || !canvasRef.current || !matcherRef.current) return;
        scanningRef.current = true;
        setStatus('Scanning...');

        const faceapi = await getFaceApi();
        if (!faceapi) return;

        const loop = async () => {
            if (!scanningRef.current || !videoRef.current) return;

            if (videoRef.current.paused || videoRef.current.ended) {
                return setTimeout(loop, 100);
            }

            const detection = await faceapi.detectSingleFace(videoRef.current)
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (detection) {
                const bestMatch = matcherRef.current.findBestMatch(detection.descriptor);

                if (bestMatch.label !== 'unknown') {
                    const employeeId = bestMatch.label;
                    const employee = employees.find(e => e.id === employeeId);

                    if (employee) {
                        setStatus(`Detected: ${employee.name} (${Math.round((1 - bestMatch.distance) * 100)}%)`);

                        // Auto-mark attendance if not recently marked (simple debounce)
                        // Ideally checking against server state or local "marked this session" list
                        // For now, we assume if we see them, we try to mark "present"

                        // We don't want to spam the server call, so check state
                        // However, 'lastMarked' state update might be slow in loop.
                        // Use a timestamp check or something?
                        // For simplicity, let's just show success message for now in status.

                        // To actually mark:
                        await handleMarkAttendance(employeeId, employee.name);
                    }
                } else {
                    setStatus('Face detected but not recognized.');
                }
            } else {
                setStatus('Scanning...');
            }

            setTimeout(loop, 500); // 2 FPS check
        };

        loop();
    };

    const handleMarkAttendance = async (employeeId: string, name: string) => {
        // Simple memory debounce
        if (lastMarked === employeeId) return;

        setLastMarked(employeeId);
        setStatus(`Marking attendance for ${name}...`);

        // Call server action
        const formData = new FormData();
        formData.append('employeeId', employeeId);
        formData.append('siteId', siteId);
        formData.append('status', 'present');

        try {
            await markAttendance(formData);
            setStatus(`✅ Marked Present: ${name}. Ready for next person...`);
            // Reset last marked after 5 seconds to allow re-scan if needed? 
            // Or keep it to prevent duplicates today.
            setTimeout(() => setLastMarked(null), 10000);
        } catch (e) {
            console.error(e);
            setStatus(`Error marking ${name}`);
            setStatus(`Error marking ${name}`);
            setLastMarked(null);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="flex flex-col items-center bg-black rounded-xl overflow-hidden shadow-2xl w-full max-w-2xl">
                <div className="relative w-full aspect-video bg-gray-900">
                    <video
                        ref={videoRef}
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

                    {/* Overlay UI */}
                    <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                        <p className="text-white text-center font-semibold text-lg animate-pulse">
                            {status}
                        </p>
                    </div>
                </div>
            </div>

            <button
                onClick={() => window.history.back()}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-2"
            >
                <span>⏹</span> Stop Scanner
            </button>
        </div>
    );
}
