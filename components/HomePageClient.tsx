"use client";

import { useEffect, useMemo, useState } from "react";
import { BrandLockup } from "./brand/BrandLockup";
import { AICopilotDemo } from "./sections/AICopilotDemo";
import { Credibility } from "./sections/Credibility";
import { DiagnosticDemo } from "./sections/DiagnosticDemo";
import { FinalCTA } from "./sections/FinalCTA";
import { Hero } from "./sections/Hero";
import { HowItWorks } from "./sections/HowItWorks";
import { PainNarrative } from "./sections/PainNarrative";
import { ROIFrame } from "./sections/ROIFrame";
import { ScenarioThread } from "./sections/ScenarioThread";
import { SiteFooter } from "./sections/SiteFooter";
import { TrustCenter } from "./sections/TrustCenter";
import { ValuePillars } from "./sections/ValuePillars";
import { WaitlistModal } from "./waitlist/WaitlistModal";
import {
  calculateReadinessScore,
  DiagnosticFinding,
  runDiagnostic
} from "../lib/demoEngine";
import {
  calculateSavingsModel,
  DEFAULT_SHARED_SCENARIO,
  SharedScenario
} from "../lib/scenarioModel";
import { WaitlistScenarioSnapshot, WaitlistSource, normalizeSource } from "../lib/waitlist";
import { initCampaign, trackEvent } from "../lib/analytics";

const HASH_ALIASES: Record<string, string> = {
  "how-it-works": "workflow-comparator"
};

export function HomePageClient() {
  const [scenario, setScenario] = useState<SharedScenario>(DEFAULT_SHARED_SCENARIO);
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [activeSource, setActiveSource] = useState<WaitlistSource>("hero");
  const [inlineSource, setInlineSource] = useState<WaitlistSource>("footer");
  const [showStickyCta, setShowStickyCta] = useState(false);

  const findings = useMemo<DiagnosticFinding[]>(
    () =>
      runDiagnostic({
        sourceSystems: scenario.sourceSystems,
        plantCount: scenario.plantCount,
        strictness: scenario.strictness / 100,
        validationCadence: scenario.validationCadence
      }),
    [scenario.plantCount, scenario.sourceSystems, scenario.strictness, scenario.validationCadence]
  );

  const highSeverityCount = useMemo(
    () => findings.filter((finding) => finding.severity === "high").length,
    [findings]
  );

  const readinessScore = useMemo(
    () =>
      calculateReadinessScore(
        findings,
        scenario.sourceSystems.length,
        scenario.validationCadence
      ),
    [findings, scenario.sourceSystems.length, scenario.validationCadence]
  );

  const savingsModel = useMemo(() => calculateSavingsModel(scenario), [scenario]);

  const scenarioSnapshot = useMemo<WaitlistScenarioSnapshot>(
    () => ({
      plantCount: scenario.plantCount,
      sourceSystems: scenario.sourceSystems,
      validationCadence: scenario.validationCadence,
      strictness: scenario.strictness,
      highSeverityFindings: highSeverityCount,
      readinessScore,
      projectedAnnualValue: savingsModel.totalSavings,
      projectedMonthlyValue: savingsModel.monthlySavings
    }),
    [
      highSeverityCount,
      readinessScore,
      savingsModel.monthlySavings,
      savingsModel.totalSavings,
      scenario.plantCount,
      scenario.sourceSystems,
      scenario.strictness,
      scenario.validationCadence
    ]
  );

  // Analytics init + UTM capture + source param handling
  useEffect(() => {
    const campaign = initCampaign();
    trackEvent("page_view", { campaign });

    const params = new URLSearchParams(window.location.search);
    const parsedSource = normalizeSource(params.get("source"));

    if (parsedSource) {
      setInlineSource(parsedSource);
      setActiveSource(parsedSource);
    } else if (params.get("utm_source")) {
      setInlineSource("query_param");
      setActiveSource("query_param");
    }
  }, []);

  // Deep-link: scroll to hash target on mount
  useEffect(() => {
    const raw = window.location.hash.replace("#", "");

    if (!raw) {
      return;
    }

    const targetId = HASH_ALIASES[raw] ?? raw;

    // Delay to let layout settle after hydration
    const timer = setTimeout(() => {
      const el = document.getElementById(targetId);

      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 120);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setShowStickyCta(window.scrollY > 1260);
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

  function openWaitlist(source: WaitlistSource) {
    setActiveSource(source);
    setIsWaitlistOpen(true);
    trackEvent("waitlist_open", { source });
  }

  function continueToWaitlist(source: WaitlistSource) {
    setInlineSource(source);
    scrollToSection("final-waitlist");
  }

  function scrollToSection(sectionId: string) {
    const section = document.getElementById(sectionId);

    if (!section) {
      return;
    }

    section.scrollIntoView({ behavior: "smooth", block: "start" });
    trackEvent("section_scroll", { sectionId });

    // Update URL hash without triggering a scroll jump
    const displayHash = Object.entries(HASH_ALIASES).find(
      ([, elementId]) => elementId === sectionId
    )?.[0] ?? sectionId;
    history.replaceState(null, "", `#${displayHash}`);
  }

  function updateScenario(changes: Partial<SharedScenario>) {
    setScenario((current) => ({
      ...current,
      ...changes
    }));
  }

  return (
    <main className="site-shell">
      <header className="top-rail">
        <BrandLockup compact />
        <div className="rail-actions">
          <button type="button" className="text-link" onClick={() => scrollToSection("diagnostic-simulator")}>
            Interactive demo
          </button>
          <button type="button" className="text-link" onClick={() => scrollToSection("workflow-comparator")}>
            Process flow
          </button>
          <button type="button" className="text-link" onClick={() => scrollToSection("trust-center")}>
            Trust & security
          </button>
          <button type="button" className="text-link" onClick={() => scrollToSection("final-waitlist")}>
            Join cohort
          </button>
        </div>
      </header>

      <Hero
        onPrimaryCta={() => openWaitlist("hero")}
        onExploreSimulator={() => scrollToSection("diagnostic-simulator")}
        onChecklistClick={() => trackEvent("checklist_click")}
      />
      <PainNarrative />
      <ScenarioThread
        scenario={scenario}
        readinessScore={readinessScore}
        highSeverityCount={highSeverityCount}
        projectedAnnualValue={savingsModel.totalSavings}
        onJump={scrollToSection}
      />
      <DiagnosticDemo
        scenario={scenario}
        findings={findings}
        onScenarioChange={updateScenario}
        onContinue={() => {
          setInlineSource("diagnostic");
          scrollToSection("ai-copilot-demo");
        }}
      />
      <AICopilotDemo
        scenario={scenario}
        findings={findings}
        readinessScore={readinessScore}
        projectedAnnualValue={savingsModel.totalSavings}
        projectedMonthlyValue={savingsModel.monthlySavings}
      />
      <ValuePillars />
      <HowItWorks
        scenario={scenario}
        findings={findings}
        projectedAnnualValue={savingsModel.totalSavings}
        onJumpToRoi={() => scrollToSection("savings-simulator")}
      />
      <Credibility />
      <TrustCenter onJumpToWaitlist={() => continueToWaitlist("midpage")} />
      <ROIFrame
        scenario={scenario}
        onScenarioChange={updateScenario}
        onContinue={() => continueToWaitlist("midpage")}
      />
      <FinalCTA inlineSource={inlineSource} scenarioSnapshot={scenarioSnapshot} />
      <SiteFooter />

      <button
        type="button"
        className={`sticky-cta${showStickyCta ? " visible" : ""}`}
        onClick={() => openWaitlist("sticky")}
      >
        Request diagnostic for this scenario
      </button>

      <WaitlistModal
        isOpen={isWaitlistOpen}
        source={activeSource}
        scenarioSnapshot={scenarioSnapshot}
        onClose={() => setIsWaitlistOpen(false)}
      />
    </main>
  );
}
