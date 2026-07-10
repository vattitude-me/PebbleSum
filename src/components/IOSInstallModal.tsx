"use client";

import React from "react";

interface IOSInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function IOSInstallModal({ isOpen, onClose }: IOSInstallModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center animate-fade-in backdrop-blur-xs">
      <div 
        className="w-full max-w-md overflow-hidden rounded-t-3xl bg-white shadow-2xl transition-all sm:rounded-3xl animate-slide-up"
        role="dialog"
        aria-modal="true"
      >
        {/* Header with beautiful gradient */}
        <div className="bg-gradient-to-r from-[#6c5ce7] to-[#764ba2] px-6 py-5 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 active:scale-95 transition-all"
            aria-label="Close modal"
          >
            ✕
          </button>
          <div className="flex items-center gap-3">
            <span className="text-3xl">📲</span>
            <div>
              <h3 className="text-lg font-extrabold tracking-tight font-sans">Install PebbleSum on iOS</h3>
              <p className="text-xs text-white/80 font-medium mt-0.5">Play offline and get full screen practice!</p>
            </div>
          </div>
        </div>

        {/* Content / Instructions */}
        <div className="px-6 py-6 space-y-5 bg-[#fef9f0] text-[#2d1b69]">
          <p className="text-sm font-semibold text-center text-[#6c5ce7]/90 bg-[#6c5ce7]/5 py-2 px-3 rounded-xl border border-[#6c5ce7]/10">
            Add PebbleSum to your Home Screen in 3 easy steps:
          </p>

          <div className="space-y-4">
            {/* Step 1 */}
            <div className="flex items-start gap-4 bg-white p-3 rounded-2xl shadow-sm border border-purple-100">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#6c5ce7] text-white text-xs font-black">
                1
              </span>
              <p className="text-sm font-medium leading-relaxed">
                Tap the <span className="inline-flex items-center justify-center p-1 bg-gray-100 rounded-md mx-1 border border-gray-200">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15M9 12l3-3m0 0 3 3m-3-3v12" />
                  </svg>
                </span> <strong>Share</strong> button in the Safari navigation bar.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-4 bg-white p-3 rounded-2xl shadow-sm border border-purple-100">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#6c5ce7] text-white text-xs font-black">
                2
              </span>
              <p className="text-sm font-medium leading-relaxed">
                Scroll down or swipe the options, then select <strong>Add to Home Screen</strong> <span className="inline-flex items-center justify-center p-1 bg-gray-100 rounded-md mx-1 border border-gray-200">
                  <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </span>.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-4 bg-white p-3 rounded-2xl shadow-sm border border-purple-100">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#6c5ce7] text-white text-xs font-black">
                3
              </span>
              <p className="text-sm font-medium leading-relaxed">
                Tap <strong>Add</strong> in the top-right corner to finish installation.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white px-6 py-4 flex justify-center border-t border-purple-50">
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#6c5ce7] hover:bg-[#5b4ec2] text-white rounded-2xl font-bold shadow-md hover:shadow-lg transition-all text-sm active:scale-[0.98]"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
