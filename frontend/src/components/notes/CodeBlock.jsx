import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

const CodeBlock = ({ code, language = 'python', title }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-forest-dark/30 bg-forest-dark text-ivory my-4 shadow-sm">
      {/* Code Window Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-forest-deep/80 border-b border-forest-border/40 text-xs text-sage">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400/80 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80 inline-block"></span>
          </div>
          <span className="font-mono text-[11px] font-semibold text-ivory/90 ml-2">
            {title || `${language}.py`}
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-forest/60 hover:bg-forest text-xs text-sage hover:text-white transition-all"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Snippet */}
      <pre className="p-4 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed text-sage-light bg-forest-dark/95">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;
