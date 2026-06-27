"use client";

import { useEffect, useState } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setDone(true), 1800);
    const t2 = setTimeout(onComplete, 2500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onComplete]);

  return (
    <div className="splash-screen">
      <div className="splash-screen__bg">
        <div className="splash-screen__content">
          <div className="splash-screen__loader">
            <div className={`splash-screen__loader-bar ${done ? "splash-screen__loader-bar--full" : ""}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
