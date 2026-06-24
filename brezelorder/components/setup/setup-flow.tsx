"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type SetupStep = {
  icon: LucideIcon;
  time: string;
  title: string;
  body: string;
  href: string;
  cta: string;
};

type SetupContent = {
  progressLabel: string;
  progressComplete: string;
  progressPending: string;
  stepLabel: string;
  currentStepTitle: string;
  completeStep: string;
  nextStep: string;
  finishedTitle: string;
  finishedBody: string;
  restart: string;
  openSection: string;
  steps: SetupStep[];
};

const STORAGE_KEY = "brezel-setup-flow";

function normalizeStepIndexes(values: number[] | undefined, length: number) {
  if (!values?.length) return [];

  return [...new Set(values.filter((value) => Number.isInteger(value) && value >= 0 && value < length))].sort(
    (a, b) => a - b
  );
}

function getFirstIncompleteStep(completedSteps: number[], length: number) {
  for (let index = 0; index < length; index += 1) {
    if (!completedSteps.includes(index)) return index;
  }

  return Math.max(0, length - 1);
}

export function SetupFlow({
  content,
  serverCompletedSteps = []
}: {
  content: SetupContent;
  serverCompletedSteps?: number[];
}) {
  const totalSteps = content.steps.length;
  const normalizedServerCompletedSteps = useMemo(
    () => normalizeStepIndexes(serverCompletedSteps, totalSteps),
    [serverCompletedSteps, totalSteps]
  );
  const [currentStep, setCurrentStep] = useState(
    getFirstIncompleteStep(normalizedServerCompletedSteps, totalSteps)
  );
  const [localCompletedSteps, setLocalCompletedSteps] = useState<number[]>([]);

  const mergedCompletedSteps = useMemo(
    () => normalizeStepIndexes([...localCompletedSteps, ...normalizedServerCompletedSteps], totalSteps),
    [localCompletedSteps, normalizedServerCompletedSteps, totalSteps]
  );

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setLocalCompletedSteps([]);
        setCurrentStep(getFirstIncompleteStep(normalizedServerCompletedSteps, totalSteps));
        return;
      }

      const parsed = JSON.parse(raw) as {
        currentStep?: number;
        completedSteps?: number[];
      };

      const nextLocalCompletedSteps = normalizeStepIndexes(parsed.completedSteps, totalSteps);
      const nextMergedCompletedSteps = normalizeStepIndexes(
        [...nextLocalCompletedSteps, ...normalizedServerCompletedSteps],
        totalSteps
      );

      setLocalCompletedSteps(nextLocalCompletedSteps);

      if (typeof parsed.currentStep === "number") {
        const safeCurrentStep = Math.max(0, Math.min(totalSteps - 1, parsed.currentStep));
        setCurrentStep(
          nextMergedCompletedSteps.includes(safeCurrentStep) && nextMergedCompletedSteps.length < totalSteps
            ? getFirstIncompleteStep(nextMergedCompletedSteps, totalSteps)
            : safeCurrentStep
        );
        return;
      }

      setCurrentStep(getFirstIncompleteStep(nextMergedCompletedSteps, totalSteps));
    } catch {
      setLocalCompletedSteps([]);
      setCurrentStep(getFirstIncompleteStep(normalizedServerCompletedSteps, totalSteps));
    }
  }, [normalizedServerCompletedSteps, totalSteps]);

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        currentStep,
        completedSteps: localCompletedSteps
      })
    );
  }, [currentStep, localCompletedSteps]);

  useEffect(() => {
    if (totalSteps === 0 || mergedCompletedSteps.length >= totalSteps) return;
    if (!mergedCompletedSteps.includes(currentStep)) return;

    const nextStep = getFirstIncompleteStep(mergedCompletedSteps, totalSteps);
    if (nextStep !== currentStep) {
      setCurrentStep(nextStep);
    }
  }, [currentStep, mergedCompletedSteps, totalSteps]);

  const completedCount = mergedCompletedSteps.length;
  const progress = useMemo(() => {
    if (totalSteps === 0) return 0;
    return Math.round((completedCount / totalSteps) * 100);
  }, [completedCount, totalSteps]);

  const activeStep = content.steps[currentStep];
  const isLastStep = currentStep === totalSteps - 1;
  const allDone = completedCount === totalSteps;

  function markStepComplete(stepIndex: number) {
    setLocalCompletedSteps((previous) => {
      if (previous.includes(stepIndex) || normalizedServerCompletedSteps.includes(stepIndex)) {
        return previous;
      }

      return [...previous, stepIndex].sort((a, b) => a - b);
    });

    if (stepIndex < totalSteps - 1) {
      const nextCompletedSteps = normalizeStepIndexes(
        [...mergedCompletedSteps, stepIndex],
        totalSteps
      );
      setCurrentStep(getFirstIncompleteStep(nextCompletedSteps, totalSteps));
    }
  }

  function resetFlow() {
    setLocalCompletedSteps([]);
    setCurrentStep(getFirstIncompleteStep(normalizedServerCompletedSteps, totalSteps));
  }

  return (
    <div className="mt-12 grid gap-6 xl:grid-cols-[0.95fr_1.25fr]">
      <aside className="rounded-[2rem] border border-[rgba(64,61,57,0.12)] bg-white/78 p-5 shadow-[0_24px_70px_rgba(37,36,34,0.08)] md:p-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-accent)]">
              {content.progressLabel}
            </p>
            <p className="mt-3 text-3xl font-semibold text-[var(--brand-ink)]">{progress}%</p>
          </div>
          <div className="text-right text-sm text-[var(--brand-muted)]">
            <p>{content.progressComplete.replace("{count}", String(completedCount))}</p>
            <p>{content.progressPending.replace("{count}", String(totalSteps - completedCount))}</p>
          </div>
        </div>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-[rgba(64,61,57,0.08)]">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,var(--brand-lilac),var(--brand-coral))] transition-[width] duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-6 space-y-3">
          {content.steps.map((step, index) => {
            const Icon = step.icon;
            const completed = mergedCompletedSteps.includes(index);
            const active = currentStep === index;

            return (
              <button
                key={step.title}
                type="button"
                onClick={() => setCurrentStep(index)}
                className={`w-full rounded-[1.5rem] border px-4 py-4 text-left transition ${
                  active
                    ? "border-[rgba(235,94,40,0.18)] bg-[rgba(255,252,242,0.95)] shadow-[0_16px_40px_rgba(37,36,34,0.08)]"
                    : "border-[rgba(64,61,57,0.1)] bg-white/70 hover:bg-white"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                      completed
                        ? "bg-[rgba(39,174,96,0.14)] text-[#279a5c]"
                        : active
                          ? "bg-[rgba(204,182,255,0.22)] text-[var(--brand-coral)]"
                          : "bg-[rgba(64,61,57,0.06)] text-[var(--brand-muted)]"
                    }`}
                  >
                    {completed ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-accent)]">
                        {content.stepLabel} {index + 1}
                      </span>
                      <span className="text-xs text-[var(--brand-muted)]">{step.time}</span>
                    </div>
                    <p className="mt-1 text-base font-semibold text-[var(--brand-ink)]">{step.title}</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--brand-muted)]">{step.body}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      <section className="rounded-[2rem] border border-[rgba(64,61,57,0.12)] bg-[var(--brand-panel)] p-6 shadow-[0_24px_70px_rgba(37,36,34,0.08)] md:p-8">
        {!allDone && activeStep ? (
          <>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-accent)]">
              {content.currentStepTitle}
            </p>
            <div className="mt-4 flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.5rem] bg-[rgba(204,182,255,0.18)] text-[var(--brand-coral)]">
                <activeStep.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--brand-muted)]">
                  {content.stepLabel} {currentStep + 1} · {activeStep.time}
                </p>
                <h2 className="mt-1 text-3xl font-semibold text-[var(--brand-ink)]">{activeStep.title}</h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--brand-muted)]">
                  {activeStep.body}
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-[1.75rem] border border-[rgba(64,61,57,0.1)] bg-white/80 p-5">
              <p className="text-sm font-semibold text-[var(--brand-ink)]">{content.openSection}</p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Link href={activeStep.href}>
                  <Button className="w-full rounded-full bg-[var(--brand-accent)] px-6 text-white hover:bg-[#d75424] sm:w-auto">
                    {activeStep.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                {!mergedCompletedSteps.includes(currentStep) ? (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => markStepComplete(currentStep)}
                    className="w-full rounded-full border-[rgba(64,61,57,0.12)] bg-white px-6 text-[var(--brand-ink)] hover:bg-[var(--brand-bg)] sm:w-auto"
                  >
                    {content.completeStep}
                  </Button>
                ) : !isLastStep ? (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setCurrentStep(getFirstIncompleteStep(mergedCompletedSteps, totalSteps))}
                    className="w-full rounded-full border-[rgba(64,61,57,0.12)] bg-white px-6 text-[var(--brand-ink)] hover:bg-[var(--brand-bg)] sm:w-auto"
                  >
                    {content.nextStep}
                  </Button>
                ) : null}
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-accent)]">
                {content.progressLabel}
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-[var(--brand-ink)]">{content.finishedTitle}</h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--brand-muted)]">
                {content.finishedBody}
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/admin">
                <Button className="w-full rounded-full bg-[var(--brand-accent)] px-6 text-white hover:bg-[#d75424] sm:w-auto">
                  {content.openSection}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button
                type="button"
                variant="secondary"
                onClick={resetFlow}
                className="w-full rounded-full border-[rgba(64,61,57,0.12)] bg-white px-6 text-[var(--brand-ink)] hover:bg-[var(--brand-bg)] sm:w-auto"
              >
                {content.restart}
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
