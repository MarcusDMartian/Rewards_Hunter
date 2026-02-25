// ============================================
// usePageTitle — Dynamic document.title per page
// ============================================

import { useEffect } from 'react';

const BASE_TITLE = 'Reward Hunter';

export default function usePageTitle(title?: string) {
    useEffect(() => {
        document.title = title ? `${title} — ${BASE_TITLE}` : BASE_TITLE;
        return () => { document.title = BASE_TITLE; };
    }, [title]);
}
