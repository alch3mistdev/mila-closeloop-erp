"use client";

import { useEffect } from "react";
import { WaitlistSource } from "../../lib/waitlist";
import { WaitlistInlineForm } from "./WaitlistInlineForm";

interface WaitlistModalProps {
  isOpen: boolean;
  source: WaitlistSource;
  onClose: () => void;
}

export function WaitlistModal({ isOpen, source, onClose }: WaitlistModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onEscape);

    return () => {
      window.removeEventListener("keydown", onEscape);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <section
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Join waitlist"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close waitlist">
          Close
        </button>
        <WaitlistInlineForm
          key={source}
          source={source}
          formTitle="Request migration diagnostic + early access"
          buttonLabel="Secure my spot"
        />
      </section>
    </div>
  );
}
