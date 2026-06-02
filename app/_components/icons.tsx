/* Outline icon set — Lucide-style, currentColor, rounded.
   Default size h-5/w-5; pass className to override. */

type P = { className?: string };

function svg(children: React.ReactNode) {
  return function Icon({ className = "h-5 w-5" }: P) {
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        {children}
      </svg>
    );
  };
}

export const IconOverview = svg(
  <>
    <rect x="3" y="3" width="7.5" height="7.5" rx="2" />
    <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" />
    <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" />
    <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" />
  </>,
);

export const IconBlocks = svg(
  <>
    <path d="M12 2.5l9 5-9 5-9-5 9-5z" />
    <path d="M3 12l9 5 9-5" />
    <path d="M3 16.5l9 5 9-5" />
  </>,
);

export const IconRegulations = svg(
  <>
    <path d="M12 7v13.5" />
    <path d="M3 5.2C3 4.5 3.6 4 4.3 4H9a3 3 0 0 1 3 3v13.5a3 3 0 0 0-3-2.2H4.3A1.3 1.3 0 0 1 3 17V5.2z" />
    <path d="M21 5.2C21 4.5 20.4 4 19.7 4H15a3 3 0 0 0-3 3v13.5a3 3 0 0 1 3-2.2h4.7A1.3 1.3 0 0 0 21 17V5.2z" />
  </>,
);

export const IconChat = svg(
  <path d="M21 11.4a8.2 8.2 0 0 1-8.5 8.1 8.7 8.7 0 0 1-3.6-.8L3.5 20.5l1.8-5.2a8.2 8.2 0 0 1-.8-3.6A8.2 8.2 0 0 1 12.6 3.4h.4a8.2 8.2 0 0 1 8 8z" />,
);

export const IconArrow = svg(<><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></>);

export const IconSend = svg(<><path d="M12 19V5" /><path d="M5 12l7-7 7 7" /></>);

export const IconSearch = svg(<><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" /></>);

export const IconSpark = svg(
  <path d="M12 3l1.9 4.8a3 3 0 0 0 1.8 1.8L20.5 11.5l-4.8 1.9a3 3 0 0 0-1.8 1.8L12 20l-1.9-4.8a3 3 0 0 0-1.8-1.8L3.5 11.5l4.8-1.9a3 3 0 0 0 1.8-1.8L12 3z" />,
);

export const IconLayers = svg(
  <>
    <path d="M3.5 8.5l8.5 4.5 8.5-4.5L12 4 3.5 8.5z" />
    <path d="M3.5 13.5L12 18l8.5-4.5" />
  </>,
);

export const IconScale = svg(
  <>
    <path d="M12 4v16M7 20h10" />
    <path d="M6 7h12l3 6a3.5 3.5 0 0 1-6 0l3-6M6 7L3 13a3.5 3.5 0 0 0 6 0L6 7z" />
    <path d="M6 7l6-2 6 2" />
  </>,
);

export const IconDoc = svg(
  <>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z" />
    <path d="M14 3v5h5M9 13h6M9 17h6" />
  </>,
);
