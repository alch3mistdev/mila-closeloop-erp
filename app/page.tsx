"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Credibility } from "../components/sections/Credibility";
import { DiagnosticDemo } from "../components/sections/DiagnosticDemo";
import { FinalCTA } from "../components/sections/FinalCTA";
import { Hero } from "../components/sections/Hero";
import { HowItWorks } from "../components/sections/HowItWorks";
import { PainNarrative } from "../components/sections/PainNarrative";
import { ROIFrame } from "../components/sections/ROIFrame";
import { ValuePillars } from "../components/sections/ValuePillars";
import { WaitlistModal } from "../components/waitlist/WaitlistModal";
import { WaitlistSource, normalizeSource } from "../lib/waitlist";

export default function HomePage() {
  const searchParams = useSearchParams();
  const querySource = useMemo(() => normalizeSource(searchParams.get("source")), [searchParams]);

  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [activeSource, setActiveSource] = useState<WaitlistSource>("hero");
  const [showStickyCta, setShowStickyCta] = useState(false);
  const [hasPromptedFromQuery, setHasPromptedFromQuery] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShowStickyCta(window.scrollY > 560);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    document.querySelectorAll("[data-reveal='true']").forEach((element) => {
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!querySource || hasPromptedFromQuery) {
      return;
    }

    const timer = window.setTimeout(() => {
      setActiveSource(querySource);
      setIsWaitlistOpen(true);
      setHasPromptedFromQuery(true);
    }, 650);

    return () => window.clearTimeout(timer);
  }, [hasPromptedFromQuery, querySource]);

  function openWaitlist(source: WaitlistSource) {
    setActiveSource(source);
    setIsWaitlistOpen(true);
  }

  return (
    <main className="site-shell">
      <header className="top-rail">
        <p className="brand-wordmark">ERP Migration Validation Engine</p>
        <button type="button" className="btn btn-secondary" onClick={() => openWaitlist("sticky")}>
          Join waitlist
        </button>
      </header>

      <Hero onPrimaryCta={() => openWaitlist("hero")} onSecondaryCta={() => openWaitlist("hero")} />
      <PainNarrative onCta={() => openWaitlist("midpage")} />
      <DiagnosticDemo onCta={() => openWaitlist("diagnostic")} />
      <ValuePillars />
      <HowItWorks onCta={() => openWaitlist("midpage")} />
      <Credibility onCta={() => openWaitlist("midpage")} />
      <ROIFrame onCta={() => openWaitlist("midpage")} />
      <FinalCTA inlineSource={querySource ?? "footer"} onOpenModal={() => openWaitlist("footer")} />

      <button
        type="button"
        className={`sticky-cta${showStickyCta ? " visible" : ""}`}
        onClick={() => openWaitlist("sticky")}
      >
        Request migration diagnostic
      </button>

      <WaitlistModal
        isOpen={isWaitlistOpen}
        source={activeSource}
        onClose={() => setIsWaitlistOpen(false)}
      />
    </main>
  );
}
