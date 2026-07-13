"use client";

import { useEffect, useCallback, useState, useRef } from "react";

interface ExitConfirmModalProps {
  enabled: boolean;
}

export default function ExitConfirmModal({ enabled }: ExitConfirmModalProps) {
  const [showModal, setShowModal] = useState(false);
  const leavingRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (leavingRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      if (leavingRef.current) return;
      window.history.pushState(null, "", window.location.href);
      setShowModal(true);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [enabled]);

  const handleStay = useCallback(() => {
    setShowModal(false);
  }, []);

  const handleLeave = useCallback(() => {
    leavingRef.current = true;
    setShowModal(false);
    window.history.back();
  }, []);

  if (!showModal) return null;

  return (
    <div className="exit-confirm__overlay" onClick={handleStay}>
      <div className="exit-confirm__modal" onClick={(e) => e.stopPropagation()}>
        <div className="exit-confirm__icon">👋</div>
        <h2 className="exit-confirm__title">Leaving so soon?</h2>
        <p className="exit-confirm__subtitle">
          Your progress is saved, but are you sure you want to quit?
        </p>
        <div className="exit-confirm__actions">
          <button className="exit-confirm__btn exit-confirm__btn--stay" onClick={handleStay}>
            Keep Playing
          </button>
          <button className="exit-confirm__btn exit-confirm__btn--leave" onClick={handleLeave}>
            Quit
          </button>
        </div>
      </div>
    </div>
  );
}
