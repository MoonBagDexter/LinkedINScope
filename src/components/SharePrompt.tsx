interface SharePromptProps {
  jobTitle: string;
  employerName: string;
  coinPhrase?: string;
  contractAddress?: string;
  onClose: () => void;
}

export function SharePrompt({ jobTitle, employerName, coinPhrase, contractAddress, onClose }: SharePromptProps) {
  const tweetText = `I just applied to ${jobTitle} at ${employerName} using $LinkedInScope${coinPhrase ? ` — ${coinPhrase}` : ''}${contractAddress ? `\n\nCA: ${contractAddress}` : ''}\n\n@LinkedInScope`;

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-cream rounded-2xl p-6 w-full max-w-md shadow-2xl border border-cream-border text-center" onClick={e => e.stopPropagation()}>
        <div className="text-4xl mb-3">🎉</div>
        <h2 className="text-xl font-bold text-text-primary mb-2">You're officially applied!</h2>
        <p className="text-sm text-text-secondary mb-6">
          Let the world know you're grinding. Share on X and flex on the timeline.
        </p>

        <a
          href={tweetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-black text-white font-bold text-lg animate-pulse hover:scale-105 transition-transform"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Share on X
        </a>

        <button onClick={onClose} className="block mx-auto mt-4 text-sm text-text-muted hover:text-text-secondary">
          Maybe later
        </button>
      </div>
    </div>
  );
}
