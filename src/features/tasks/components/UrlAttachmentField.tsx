import { useState } from 'react';
import { LinkIcon, XIcon } from '../../../shared/components/icons';

export interface PendingLink {
  id?: string;
  url: string;
  label?: string;
}

interface UrlAttachmentFieldProps {
  links: PendingLink[];
  onChange: (links: PendingLink[]) => void;
}

export function UrlAttachmentField({ links, onChange }: UrlAttachmentFieldProps) {
  const [url, setUrl] = useState('');

  function addLink() {
    const trimmed = url.trim();
    if (!trimmed) return;
    onChange([...links, { url: trimmed }]);
    setUrl('');
  }

  return (
    <div>
      <div className="flex gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-white/15 bg-white/[0.03] px-3 py-2">
          <LinkIcon className="h-3.5 w-3.5 shrink-0 text-white/40" />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addLink();
              }
            }}
            placeholder="https://…"
            className="min-w-0 flex-1 bg-transparent font-mono text-sm text-white placeholder-white/30 outline-none"
          />
        </div>
        <button
          type="button"
          onClick={addLink}
          className="shrink-0 rounded-lg border border-white/15 px-4 text-sm font-medium text-white/80 transition-colors hover:bg-white/5"
        >
          Add
        </button>
      </div>

      {links.length > 0 && (
        <div className="mt-2 flex flex-col gap-1">
          {links.map((link, i) => (
            <div key={link.id ?? `${link.url}-${i}`} className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-2.5 py-1.5 text-xs">
              <LinkIcon className="h-3 w-3 shrink-0 text-white/40" />
              <span className="flex-1 truncate font-mono text-white/70">{link.label || link.url}</span>
              <button
                type="button"
                onClick={() => onChange(links.filter((_, j) => j !== i))}
                className="shrink-0 text-white/30 hover:text-rose-400"
                aria-label="Retirer ce lien"
              >
                <XIcon className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
