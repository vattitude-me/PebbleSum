"use client";

import { useEffect, useState } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState<"logo" | "mascot" | "done">("logo");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("mascot"), 800);
    const t2 = setTimeout(() => setPhase("done"), 2000);
    const t3 = setTimeout(onComplete, 2500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div className="splash-screen">
      <div className="splash-screen__bg" />
      <div className="splash-screen__content">
        <div className={`splash-screen__logo ${phase !== "logo" ? "splash-screen__logo--up" : ""}`}>
          <img src="/assets/icons/icon-logo-pebblesum.png" alt="PebbleSum" className="splash-screen__logo-img" />
          <h1 className="splash-screen__title">PebbleSum</h1>
          <p className="splash-screen__tagline">Small Steps. Daily Practice. Big Math Success.</p>
        </div>
        {(phase === "mascot" || phase === "done") && (
          <div className="splash-screen__mascot animate-pop-in">
            <img src="/assets/icons/icon-pebble-wave.png" alt="Pebble" className="splash-screen__mascot-img" />
          </div>
        )}
        <div className="splash-screen__loader">
          <div className={`splash-screen__loader-bar ${phase === "done" ? "splash-screen__loader-bar--full" : ""}`} />
        </div>
      </div>
    </div>
  );
}
