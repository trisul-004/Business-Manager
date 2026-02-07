'use client';

import { useState } from 'react';
import { Package, Construction, Trash2, ExternalLink, Box, Tag, Calendar, Info } from 'lucide-react';
import { deleteAsset } from '@/actions/assets';

interface Asset {
    id: string;
    siteId: string;
    name: string;
    type: string;
    quantity: string | null;
    description: string | null;
    imageUrl: string | null;
    createdAt: Date;
}

interface AssetListProps {
    assets: Asset[];
    siteId: string;
}

export default function AssetList({ assets, siteId }: AssetListProps) {
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const handleDelete = async (assetId: string) => {
        if (!confirm("Are you sure you want to remove this asset?")) return;

        setIsDeleting(assetId);
        try {
            const result = await deleteAsset(assetId, siteId);
            if (!result.success) {
                alert(result.error);
            }
        } catch (error) {
            alert("Failed to delete asset.");
        } finally {
            setIsDeleting(null);
        }
    };

    if (assets.length === 0) {
        return (
            <div className="bg-white p-20 rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center text-center">
                <div className="p-4 bg-gray-50 rounded-full mb-4">
                    <Box className="w-12 h-12 text-gray-300" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">Inventory is Empty</h3>
                <p className="text-gray-500 max-w-sm">No materials or machinery have been added to this site yet.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assets.map((asset) => (
                <div key={asset.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                    {asset.imageUrl ? (
                        <div className="aspect-video relative group">
                            <img src={asset.imageUrl} alt={asset.name} className="w-full h-full object-cover" />
                            <div className="absolute top-4 left-4">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm border backdrop-blur-md ${asset.type === 'machinery'
                                        ? 'bg-orange-50/80 text-orange-700 border-orange-100'
                                        : 'bg-blue-50/80 text-blue-700 border-blue-100'
                                    }`}>
                                    {asset.type === 'machinery' ? <Construction className="w-3 h-3" /> : <Package className="w-3 h-3" />}
                                    {asset.type}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className={`aspect-video flex items-center justify-center ${asset.type === 'machinery' ? 'bg-orange-50' : 'bg-blue-50'}`}>
                            {asset.type === 'machinery'
                                ? <Construction className="w-16 h-16 text-orange-200" />
                                : <Package className="w-16 h-16 text-blue-200" />
                            }
                        </div>
                    )}

                    <div className="p-6 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 mb-1 leading-tight">{asset.name}</h3>
                                {asset.quantity && (
                                    <div className="flex items-center gap-1.5 text-indigo-600 font-bold text-sm">
                                        <Tag className="w-3.5 h-3.5" />
                                        {asset.quantity}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => handleDelete(asset.id)}
                                disabled={isDeleting === asset.id}
                                className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                title="Delete Asset"
                            >
                                <Trash2 className={`w-5 h-5 ${isDeleting === asset.id ? 'animate-pulse' : ''}`} />
                            </button>
                        </div>

                        {asset.description && (
                            <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100/50 flex gap-3 items-start">
                                <Info className="w-4 h-4 text-gray-400 mt-0.5" />
                                <p className="text-sm text-gray-600 font-medium leading-relaxed">{asset.description}</p>
                            </div>
                        )}

                        <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                Added {new Date(asset.createdAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1 group cursor-default">
                                ID: {asset.id.slice(0, 8)}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
