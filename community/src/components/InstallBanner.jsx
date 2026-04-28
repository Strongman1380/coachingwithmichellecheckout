import React, { useState, useEffect } from 'react';
import { X, DeviceMobile, ShareNetwork } from '@phosphor-icons/react';
import { cn } from '../lib/utils';

export default function InstallBanner({ canInstall, onInstall }) {
  const [dismissed, setDismissed] = useState(false);
  const [showIOSHelp, setShowIOSHelp] = useState(false);
  const [visitCount, setVisitCount] = useState(0);

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

  useEffect(() => {
    const count = parseInt(localStorage.getItem('sovereign_visits') || '0', 10) + 1;
    localStorage.setItem('sovereign_visits', String(count));
    setVisitCount(count);
  }, []);

  // Don't show if already installed, dismissed, or less than 3 visits
  if (isStandalone || dismissed || visitCount < 3) return null;
  // Don't show if no install prompt and not iOS
  if (!canInstall && !isIOS) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-2xl shadow-black/15 border border-teal/10 p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal flex items-center justify-center flex-shrink-0">
          <DeviceMobile size={22} className="text-white" weight="fill" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-teal-dark">
            Add Sovereign to your home screen
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            Get the full app experience — no app store needed.
          </p>

          {isIOS ? (
            <div className="mt-2">
              <button
                onClick={() => setShowIOSHelp(!showIOSHelp)}
                className="text-xs font-medium text-clay hover:text-clay-light transition-colors"
              >
                {showIOSHelp ? 'Hide instructions' : 'Show me how'}
              </button>
              {showIOSHelp && (
                <div className="mt-2 p-2.5 bg-linen rounded-lg text-xs text-gray-600 space-y-1">
                  <p className="flex items-center gap-1.5">
                    <ShareNetwork size={14} className="text-teal flex-shrink-0" />
                    Tap the <strong>Share</strong> button in Safari
                  </p>
                  <p>Then tap <strong>"Add to Home Screen"</strong></p>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onInstall}
              className="mt-2 px-4 py-1.5 bg-clay text-white text-xs font-medium rounded-full hover:bg-clay-light transition-colors"
            >
              Install App
            </button>
          )}
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
