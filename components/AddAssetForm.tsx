'use client';

import { useState, useRef } from 'react';
import { Camera, Package, Construction, Save, X, RotateCcw, Image as ImageIcon } from 'lucide-react';
import { createAsset } from '@/actions/assets';

interface AddAssetFormProps {
    siteId: string;
}

export default function AddAssetForm({ siteId }: AddAssetFormProps) {
    const [name, setName] = useState('');
    const [type, setType] = useState<'material' | 'machinery'>('material');
    const [quantity, setQuantity] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const startCamera = async () => {
        setIsCameraOpen(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Camera error:", err);
            alert("Could not access camera.");
            setIsCameraOpen(false);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setIsCameraOpen(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            if (context) {
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;
                context.drawImage(videoRef.current, 0, 0);
                const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.7);
                setImageUrl(dataUrl);
                stopCamera();
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('name', name);
        formData.append('type', type);
        formData.append('siteId', siteId);
        formData.append('quantity', quantity);
        formData.append('description', description);
        if (imageUrl) formData.append('imageUrl', imageUrl);

        try {
            const result = await createAsset(formData);
            if (result.success) {
                setName('');
                setQuantity('');
                setDescription('');
                setImageUrl(null);
                alert("Asset added successfully!");
            } else {
                alert(result.error);
            }
        } catch (error) {
            alert("Failed to add asset.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <Package className="w-6 h-6 text-indigo-600" />
                Add New Asset
            </h2>

            <div className="space-y-6">
                <div className="flex gap-4 p-1 bg-gray-100 rounded-2xl">
                    <button
                        type="button"
                        onClick={() => setType('material')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${type === 'material' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Package className="w-4 h-4" />
                        Material
                    </button>
                    <button
                        type="button"
                        onClick={() => setType('machinery')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${type === 'machinery' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Construction className="w-4 h-4" />
                        Machinery
                    </button>
                </div>

                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Asset Name</label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={type === 'material' ? 'e.g. Cement, Bricks' : 'e.g. Concrete Mixer, Drill'}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all font-bold"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Quantity/Units</label>
                        <input
                            type="text"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            placeholder="e.g. 50 bags, 2 units"
                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all font-bold"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add some details about the asset..."
                        rows={3}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all font-bold resize-none"
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Asset Photo</label>

                    {!imageUrl && !isCameraOpen && (
                        <button
                            type="button"
                            onClick={startCamera}
                            className="w-full py-10 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group"
                        >
                            <div className="p-4 bg-gray-50 rounded-full group-hover:bg-white shadow-sm transition-all text-gray-300 group-hover:text-indigo-600">
                                <Camera className="w-8 h-8" />
                            </div>
                            <span className="font-bold">Take Description Photo</span>
                        </button>
                    )}

                    {isCameraOpen && (
                        <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center shadow-2xl">
                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                            <div className="absolute bottom-4 inset-x-0 flex justify-center gap-4">
                                <button
                                    type="button"
                                    onClick={capturePhoto}
                                    className="p-4 bg-white text-indigo-600 rounded-full shadow-lg h-16 w-16 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform border-4 border-indigo-100"
                                >
                                    <div className="w-full h-full rounded-full border-2 border-indigo-600 flex items-center justify-center">
                                        <div className="w-8 h-8 rounded-full bg-indigo-600" />
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    onClick={stopCamera}
                                    className="p-4 bg-black/50 text-white rounded-full backdrop-blur-md hover:bg-black/80 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    )}

                    {imageUrl && (
                        <div className="relative group rounded-2xl overflow-hidden shadow-md">
                            <img src={imageUrl} alt="Asset preview" className="w-full aspect-video object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                                <button
                                    type="button"
                                    onClick={startCamera}
                                    className="p-3 bg-white text-indigo-600 rounded-xl shadow-lg flex items-center gap-2 font-bold transform -translate-y-2 group-hover:translate-y-0 transition-transform"
                                >
                                    <RotateCcw className="w-5 h-5" />
                                    Retake
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setImageUrl(null)}
                                    className="p-3 bg-red-600 text-white rounded-xl shadow-lg flex items-center gap-2 font-bold transform translate-y-2 group-hover:translate-y-0 transition-transform"
                                >
                                    <X className="w-5 h-5" />
                                    Remove
                                </button>
                            </div>
                        </div>
                    )}
                    <canvas ref={canvasRef} className="hidden" />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting || !name}
                    className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:shadow-indigo-200 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                    {isSubmitting ? 'Processing...' : (
                        <>
                            <Save className="w-5 h-5" />
                            Save Asset
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
