interface BrandLockupProps {
  compact?: boolean;
}

export function BrandLockup({ compact = false }: BrandLockupProps) {
  return (
    <div className={`brand-lockup${compact ? " compact" : ""}`} aria-label="CloseLoop brand">
      <svg
        className="brand-mark"
        viewBox="0 0 44 44"
        role="img"
        aria-label="CloseLoop logo"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="2" y="2" width="40" height="40" rx="12" fill="#f7f3ea" stroke="#c9b9a5" />
        <path
          d="M10 16h8c3.8 0 6.9 3.1 6.9 6.9v0.2c0 3.8-3.1 6.9-6.9 6.9H10V16z"
          fill="#005e66"
        />
        <path
          d="M34 28h-8c-3.8 0-6.9-3.1-6.9-6.9v-0.2c0-3.8 3.1-6.9 6.9-6.9H34v14z"
          fill="#e84e1b"
        />
        <circle cx="32.2" cy="22" r="2.4" fill="#f7f3ea" />
      </svg>
      <div className="brand-wording">
        <p className="brand-name">CloseLoop</p>
        {!compact ? <p className="brand-descriptor">Migration Integrity Platform</p> : null}
      </div>
    </div>
  );
}
