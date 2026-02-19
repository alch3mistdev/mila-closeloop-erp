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

  useEffect(() => {
    const parsedSource = normalizeSource(new URLSearchParams(window.location.search).get("source"));

    if (!parsedSource) {
      return;
    }

    setInlineSource(parsedSource);
    setActiveSource(parsedSource);
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
            Tune scenario
          </button>
          <button type="button" className="text-link" onClick={() => scrollToSection("ai-copilot-demo")}>
            Try AI copilot
          </button>
          <button type="button" className="text-link" onClick={() => scrollToSection("final-waitlist")}>
            View waitlist
          </button>
        </div>
      </header>

      <Hero
        onPrimaryCta={() => openWaitlist("hero")}
        onExploreSimulator={() => scrollToSection("diagnostic-simulator")}
      />
      <ScenarioThread
        scenario={scenario}
        readinessScore={readinessScore}
        highSeverityCount={highSeverityCount}
        projectedAnnualValue={savingsModel.totalSavings}
        onJump={scrollToSection}
      />
      <PainNarrative />
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
      <HowItWorks />
      <Credibility />
      <ROIFrame
        scenario={scenario}
        onScenarioChange={updateScenario}
        onContinue={() => continueToWaitlist("midpage")}
      />
      <FinalCTA inlineSource={inlineSource} scenarioSnapshot={scenarioSnapshot} />

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
