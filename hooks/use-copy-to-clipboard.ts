'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';

export function useCopyToClipboard() {
	const [copiedText, setCopiedText] = useState<string | null>(null);

	const copy = useCallback(async (text: string, label?: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopiedText(text);
			toast.success(label ? `Copied ${label}` : 'Copied to clipboard');
			setTimeout(() => setCopiedText(null), 2000);
		} catch {
			toast.error('Failed to copy to clipboard');
		}
	}, []);

	return { copiedText, copy };
}
