'use client';

import { ChevronLeft, Calendar as CalendarIcon, ScanFace, RefreshCw } from "lucide-react";
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
    const [status, setStatus] = useState('Initializing AI...');
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isAIReady, setIsAIReady] = useState(false);
    const lastMarkedRef = useRef<string | null>(null);
    const matcherRef = useRef<any>(null); // faceapi.FaceMatcher
    const scanningRef = useRef(false);

    // 1. Initialize AI Models & Matcher
    useEffect(() => {
        let isMounted = true;
        const initAI = async () => {
            console.log("Scanner: Starting AI initialization...");
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

            if (!isMounted) return;

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
                console.warn("Scanner: No employee descriptors found");
                setStatus('No employee faces registered.');
            } else {
                matcherRef.current = new faceapi.FaceMatcher(labeledDescriptors, 0.4);
                console.log("Scanner: AI Matcher ready");
                setIsAIReady(true);
            }
        };

        initAI();
        return () => { isMounted = false; };
    }, [employees]);

    // 2. Manage Camera Stream
    useEffect(() => {
        startVideo();
        return () => stopVideo();
    }, [facingMode]);

    // 3. Start scanning only when BOTH AI and Camera are ready
    useEffect(() => {
        if (isAIReady && stream && videoRef.current) {
            console.log("Scanner: Both AI and Camera ready. Starting loop...");
            startScanning();
        }
    }, [isAIReady, stream]);

    const startVideo = async () => {
        stopVideo();
        console.log("Scanner: Requesting camera access...");
        try {
            const currentStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: facingMode }
            });
            console.log("Scanner: Camera access granted");
            setStream(currentStream);
            if (videoRef.current) {
                videoRef.current.srcObject = currentStream;
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current?.play().catch(e => console.error("Video play failed:", e));
                };
            }
        } catch (err) {
            console.error("Camera error:", err);
            setStatus('Could not access camera.');
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
        if (scanningRef.current) return; // Prevent multiple concurrent loops

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
                const confidence = Math.round((1 - bestMatch.distance) * 100);

                if (bestMatch.label !== 'unknown') {
                    const employeeId = bestMatch.label;
                    const employee = employees.find(e => e.id === employeeId);

                    if (employee) {
                        if (confidence > 70) {
                            setStatus(`✅ High Confidence: ${employee.name} (${confidence}%)`);
                        } else {
                            setStatus(`🔍 Verifying: ${employee.name} (${confidence}%)`);
                        }

                        // Auto-mark attendance
                        await handleMarkAttendance(employeeId, employee.name);
                    }
                } else {
                    setStatus(`❓ Not Recognized (${confidence}%)`);
                }
            } else {
                setStatus('Scanning...');
            }

            setTimeout(loop, 500); // 2 FPS check
        };

        loop();
    };

    const handleMarkAttendance = async (employeeId: string, name: string) => {
        // Immediate debounce using Ref
        if (lastMarkedRef.current === employeeId) return;

        lastMarkedRef.current = employeeId;
        setStatus(`Matching ${name}...`);

        // Call server action
        const formData = new FormData();
        formData.append('employeeId', employeeId);
        formData.append('siteId', siteId);
        formData.append('status', 'checked-in');

        try {
            const result = await markAttendance(formData);
            if (result?.success) {
                const actionType = result.type === 'in' ? 'Checked In' : 'Checked Out';
                const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                setStatus(`✅ ${actionType} at ${now}: ${name}. Ready for next person...`);
            } else if (result?.error) {
                setStatus(`ℹ️ ${name}: ${result.error}`);
            }

            // Reset last marked after 30 seconds to allow re-scan or next person
            setTimeout(() => {
                if (lastMarkedRef.current === employeeId) {
                    lastMarkedRef.current = null;
                }
            }, 30000);
        } catch (e) {
            console.error(e);
            setStatus(`Error marking ${name}`);
            lastMarkedRef.current = null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-4 z-50">
            <div className="relative w-full max-w-lg aspect-[3/4] sm:aspect-video bg-gray-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10">
                <video
                    ref={videoRef}
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

                {/* Status Overlay */}
                <div className="absolute top-6 inset-x-6 flex flex-col gap-3">
                    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-center">
                        <p className="text-white font-black text-sm uppercase tracking-widest animate-pulse">
                            {status}
                        </p>
                    </div>
                </div>

                {/* Camera Switch Button */}
                <button
                    onClick={() => setFacingMode(prev => prev === 'user' ? 'environment' : 'user')}
                    className="absolute top-6 right-6 p-4 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl text-white hover:bg-white/20 transition-all active:scale-90 z-10"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>

                {/* Target Frame UI */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-64 h-64 border-2 border-indigo-500/50 rounded-3xl relative">
                        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-indigo-500 rounded-tl-lg"></div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-indigo-500 rounded-tr-lg"></div>
                        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-indigo-500 rounded-bl-lg"></div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-indigo-500 rounded-br-lg"></div>
                    </div>
                </div>
            </div>

            <button
                onClick={() => window.history.back()}
                className="mt-8 px-10 py-5 bg-white/10 backdrop-blur-xl border border-white/20 text-white font-black uppercase tracking-widest rounded-3xl hover:bg-white/20 transition-all active:scale-95 flex items-center gap-3"
            >
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                Stop Scanning
            </button>
        </div>
    );
}
