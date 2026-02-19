"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BrandLockup } from "./brand/BrandLockup";
import { AICopilotDemo } from "./sections/AICopilotDemo";
import { Credibility } from "./sections/Credibility";
import { DiagnosticDemo } from "./sections/DiagnosticDemo";
import { FinalCTA } from "./sections/FinalCTA";
import { Hero } from "./sections/Hero";
import { HowItWorks } from "./sections/HowItWorks";
import { PainNarrative } from "./sections/PainNarrative";
import { ROIFrame } from "./sections/ROIFrame";
import { ValuePillars } from "./sections/ValuePillars";
import { WaitlistModal } from "./waitlist/WaitlistModal";
import { WaitlistSource, normalizeSource } from "../lib/waitlist";

export function HomePageClient() {
  const searchParams = useSearchParams();
  const querySource = useMemo(() => normalizeSource(searchParams.get("source")), [searchParams]);

  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [activeSource, setActiveSource] = useState<WaitlistSource>("hero");
  const [showStickyCta, setShowStickyCta] = useState(false);
  const [hasPromptedFromQuery, setHasPromptedFromQuery] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShowStickyCta(window.scrollY > 1180);
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

  function scrollToSection(sectionId: string) {
    const section = document.getElementById(sectionId);

    if (!section) {
      return;
    }

    section.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main className="site-shell">
      <header className="top-rail">
        <BrandLockup compact />
        <div className="rail-actions">
          <button type="button" className="text-link" onClick={() => scrollToSection("ai-copilot-demo")}>
            Try AI copilot
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => openWaitlist("sticky")}>
            Join waitlist
          </button>
        </div>
      </header>

      <Hero
        onPrimaryCta={() => openWaitlist("hero")}
        onExploreSimulator={() => scrollToSection("diagnostic-simulator")}
      />
      <PainNarrative />
      <DiagnosticDemo onCta={() => openWaitlist("diagnostic")} />
      <AICopilotDemo />
      <ValuePillars />
      <HowItWorks />
      <Credibility />
      <ROIFrame onCta={() => openWaitlist("midpage")} />
      <FinalCTA inlineSource={querySource ?? "footer"} />

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
