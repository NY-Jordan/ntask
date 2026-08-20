import { useState } from 'react';
import { LinkIcon } from '../../../shared/components/icons';

function faviconUrl(url: string): string | null {
  try {
    const { hostname } = new URL(url);
    return `https://www.google.com/s2/favicons?sz=64&domain=${hostname}`;
  } catch {
    return null;
  }
}

export function LinkFavicon({ url, className = 'h-4 w-4' }: { url: string; className?: string }) {
  const src = faviconUrl(url);
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <LinkIcon className={`${className} text-white/40`} />;
  }

  return (
    <img
      src={src}
      alt=""
      className={`${className} shrink-0 rounded-sm`}
      onError={() => setFailed(true)}
    />
  );
}
