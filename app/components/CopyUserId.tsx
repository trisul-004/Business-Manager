"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";

export default function CopyUserId({ userId }: { userId: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(userId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-[10px] font-mono text-gray-400 hover:text-indigo-600 transition-colors group/copy"
            title="Copy User ID"
        >
            <span className="truncate w-32">{userId}</span>
            {copied ? (
                <Check className="w-3 h-3 text-green-500" />
            ) : (
                <Copy className="w-3 h-3 opacity-0 group-hover/copy:opacity-100 transition-opacity" />
            )}
        </button>
    );
}
