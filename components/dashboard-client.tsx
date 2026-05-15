"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { isAbortLikeError, toClientErrorMessage } from "@/lib/client-errors";
import { domainBlueprints, getBlueprint } from "@/lib/data";
import { PublicUserRecord } from "@/lib/models";
import { DomainKey } from "@/lib/types";

interface AdaptiveResponse {
  domain: string;
  intensity: string;
  supportMode: string;
  roadmap: Array<{
    title: string;
    duration: string;
    outcomes: string[];
    checkpoint: string;
  }>;
  recommendations: string[];
}

interface ResourceRecommendation {
  summary: string;
  recommendedResources: Array<{
    title: string;
    reason: string;
    link: string;
  }>;
}

interface PlannerResponse {
  schedule: Array<{
    day: string;
    focus: string;
    duration: string;
    taskType: string;
    week: number;
    milestone: string;
  }>;
  reminders: string[];
  weeklyBreakdown: Array<{
    week: number;
    title: string;
    objective: string;
    notes: string[];
    project: string;
    links: Array<{
      title: string;
      platform: string;
      kind: string;
      link: string;
    }>;
  }>;
}

type DashboardTab = "overview" | "roadmaps" | "planner" | "resources" | "vault" | "assistant";

const dashboardTabs: Array<{ id: DashboardTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "roadmaps", label: "Roadmaps" },
  { id: "planner", label: "Planner" },
  { id: "resources", label: "Resources" },
  { id: "vault", label: "Vault" },
  { id: "assistant", label: "Assistant" }
];

const LazyChatbotPanel = dynamic(() => import("@/components/chatbot-panel").then((mod) => mod.ChatbotPanel), {
  ssr: false,
  loading: () => <div className="rounded-3xl bg-slate-50 p-5 text-sm text-slate-600">Loading assistant...</div>
});

function toTitleCase(value: string) {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

function StatCard({
  label,
  value,
  detail,
  valueClassName = "text-3xl font-semibold"
}: {
  label: string;
  value: string;
  detail: string;
  valueClassName?: string;
}) {
  return (
    <div className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className={`mt-3 min-w-0 break-words tracking-tight text-ink [overflow-wrap:anywhere] ${valueClassName}`}>{value}</p>
      <p className="mt-2 break-words text-sm leading-6 text-slate-600">{detail}</p>
    </div>
  );
}

function TabButton({
  active,
  label,
  onClick
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
        active ? "bg-ink text-white shadow-glow" : "bg-white text-slate-600 hover:bg-slate-100"
      }`}
    >
      {label}
    </button>
  );
}

function RingChart({
  label,
  value,
  total = 100,
  tone,
  helper
}: {
  label: string;
  value: number;
  total?: number;
  tone: string;
  helper: string;
}) {
  const percent = total === 0 ? 0 : Math.max(0, Math.min(100, Math.round((value / total) * 100)));

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 self-start items-center justify-center rounded-3xl px-5 py-4 shadow-sm sm:min-w-[6rem]" style={{ background: `${tone}1A` }}>
          <div className="text-3xl font-semibold leading-none text-ink">{value}</div>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">{percent}% signal</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">{helper}</p>
        </div>
      </div>
    </div>
  );
}

function TrendBars({
  title,
  values,
  labels,
  tone,
  helper
}: {
  title: string;
  values: number[];
  labels: string[];
  tone: string;
  helper: string;
}) {
  const safeValues = values.length ? values : [0, 0, 0, 0, 0, 0];
  const max = Math.max(...safeValues, 1);

  return (
    <div className="flex h-full min-w-0 flex-col rounded-3xl border border-slate-200 bg-white p-5">
      <div className="flex min-h-[7rem] flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{title}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{helper}</p>
        </div>
        <span className="self-start rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-600">
          {safeValues[safeValues.length - 1] ?? 0}
        </span>
      </div>
      <div className="mt-5 flex-1 overflow-x-auto pb-1">
        <div className="grid min-w-[16rem] grid-cols-6 items-end gap-2 sm:min-w-[18rem]">
        {safeValues.map((value, index) => (
          <div key={`${title}-${labels[index] ?? "point"}-${index}`} className="flex min-w-0 flex-col items-center gap-2">
            <span className="w-full truncate text-center text-xs font-semibold tabular-nums text-slate-600">{value}</span>
            <div className="flex h-24 w-full items-end rounded-2xl bg-slate-100 px-1.5 pb-1.5 sm:h-28">
              <div
                className="w-full rounded-xl"
                style={{
                  height: `${Math.max(18, (value / max) * 100)}%`,
                  background: tone
                }}
              />
            </div>
            <span className="w-full truncate text-center text-xs tabular-nums text-slate-500">{labels[index] ?? `D${index + 1}`}</span>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}

function BarChart({
  title,
  items,
  tone,
  helper
}: {
  title: string;
  items: Array<{ label: string; value: number }>;
  tone: string;
  helper: string;
}) {
  const safeItems = items.length ? items : [{ label: "None", value: 0 }];
  const max = Math.max(...safeItems.map((item) => item.value), 1);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{helper}</p>
      <div className="mt-5 grid gap-4">
        {safeItems.map((item) => (
          <div key={`${title}-${item.label}`} className="grid gap-2">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>{item.label}</span>
              <span>{item.value}</span>
            </div>
            <div className="h-3 rounded-full bg-slate-100">
              <div className="h-3 rounded-full" style={{ width: `${(item.value / max) * 100}%`, background: tone }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InsightCard({
  title,
  value,
  detail,
  tone,
  titleClassName,
  valueClassName,
  detailClassName,
}: {
  title: string;
  value: string;
  detail: string;
  tone: string;
  titleClassName?: string;
  valueClassName?: string;
  detailClassName?: string;
}) {
  return (
    <div className={`relative isolate min-w-0 overflow-hidden rounded-3xl p-5 ${tone}`}>
      <div className="relative z-10">
        <p className={`text-xs uppercase tracking-[0.18em] ${titleClassName ?? "opacity-100"}`}>{title}</p>
        <p className={`mt-3 min-w-0 break-words text-2xl font-semibold tracking-tight [overflow-wrap:anywhere] ${valueClassName ?? "opacity-100"}`}>{value}</p>
        <p className={`mt-2 break-words text-sm leading-6 ${detailClassName ?? "opacity-100"}`}>{detail}</p>
      </div>
    </div>
  );
}

export function DashboardClient({ initialUser }: { initialUser: PublicUserRecord }) {
  const router = useRouter();
  const [user, setUser] = useState(initialUser);
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoggingActivity, setIsLoggingActivity] = useState(false);
  const [isSavingRoadmap, setIsSavingRoadmap] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const activeGoal = useMemo(
    () => user.goals.find((goal) => goal.id === user.activeGoalId) ?? user.goals[0],
    [user.activeGoalId, user.goals]
  );
  const [selectedGoalId, setSelectedGoalId] = useState(activeGoal?.id ?? "");
  const selectedGoal = useMemo(
    () => user.goals.find((goal) => goal.id === selectedGoalId) ?? activeGoal,
    [activeGoal, selectedGoalId, user.goals]
  );
  const [selectedDomain, setSelectedDomain] = useState<DomainKey>(selectedGoal?.domain ?? "engineering");
  const [hoursPerDay, setHoursPerDay] = useState(selectedGoal?.hoursPerDay ?? 2);
  const [performanceScore, setPerformanceScore] = useState(selectedGoal?.performanceScore ?? 70);
  const [goalTitle, setGoalTitle] = useState(selectedGoal?.title ?? "");
  const [targetDate, setTargetDate] = useState(selectedGoal?.targetDate ?? "2026-09-30");
  const [adaptivePlan, setAdaptivePlan] = useState<AdaptiveResponse | null>(null);
  const [resourcePlan, setResourcePlan] = useState<ResourceRecommendation | null>(null);
  const [planner, setPlanner] = useState<PlannerResponse | null>(null);
  const [expandedWeek, setExpandedWeek] = useState<number>(1);
  const [assetTitle, setAssetTitle] = useState("");
  const [assetType, setAssetType] = useState<"project" | "certificate" | "note" | "github" | "link">("project");
  const [assetLink, setAssetLink] = useState("");
  const [assetSummary, setAssetSummary] = useState("");
  const [assetUploadUrl, setAssetUploadUrl] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [reminderText, setReminderText] = useState("");
  const [reminderDueLabel, setReminderDueLabel] = useState("Tomorrow");
  const [isInsightsLoading, setIsInsightsLoading] = useState(false);
  const deferredGoalTitle = useDeferredValue(goalTitle);
  const insightCacheRef = useRef({
    roadmap: new Map<string, AdaptiveResponse>(),
    resources: new Map<string, ResourceRecommendation>(),
    planner: new Map<string, PlannerResponse>()
  });

  useEffect(() => {
    if (!selectedGoalId && activeGoal?.id) {
      setSelectedGoalId(activeGoal.id);
    }
  }, [activeGoal?.id, selectedGoalId]);

  useEffect(() => {
    setSelectedDomain(selectedGoal?.domain ?? "engineering");
    setHoursPerDay(selectedGoal?.hoursPerDay ?? 2);
    setPerformanceScore(selectedGoal?.performanceScore ?? 70);
    setGoalTitle(selectedGoal?.title ?? "");
    setTargetDate(selectedGoal?.targetDate ?? "2026-09-30");
  }, [selectedGoal]);

  const roadmapRequestKey = useMemo(
    () => JSON.stringify({ domain: selectedDomain, hoursPerDay, performanceScore }),
    [selectedDomain, hoursPerDay, performanceScore]
  );
  const plannerRequestKey = useMemo(() => JSON.stringify({ domain: selectedDomain, hoursPerDay }), [selectedDomain, hoursPerDay]);
  const resourceRequestKey = useMemo(
    () => JSON.stringify({ domain: selectedDomain, goal: deferredGoalTitle.trim() || "Career growth" }),
    [deferredGoalTitle, selectedDomain]
  );

  useEffect(() => {
    const controller = new AbortController();
    const cache = insightCacheRef.current;
    if (!["roadmaps", "planner", "resources"].includes(activeTab)) {
      return () => controller.abort();
    }

    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          setIsInsightsLoading(true);

          if (activeTab === "roadmaps") {
            const cachedRoadmap = cache.roadmap.get(roadmapRequestKey);
            if (cachedRoadmap) {
              startTransition(() => setAdaptivePlan(cachedRoadmap));
              return;
            }

            const response = await fetch("/api/roadmap", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              signal: controller.signal,
              body: JSON.stringify({ domain: selectedDomain, hoursPerDay, performanceScore })
            });

            if (!response.ok) {
              setActionMessage("Could not load the latest roadmap insights.");
              return;
            }

            const roadmapData = (await response.json()) as AdaptiveResponse;
            cache.roadmap.set(roadmapRequestKey, roadmapData);
            startTransition(() => setAdaptivePlan(roadmapData));
            return;
          }

          if (activeTab === "planner") {
            const cachedPlanner = cache.planner.get(plannerRequestKey);
            if (cachedPlanner) {
              startTransition(() => {
                setPlanner(cachedPlanner);
                setExpandedWeek(cachedPlanner.weeklyBreakdown[0]?.week ?? 1);
              });
              return;
            }

            const response = await fetch("/api/planner", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              signal: controller.signal,
              body: JSON.stringify({ domain: selectedDomain, hoursPerDay, availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] })
            });

            if (!response.ok) {
              setActionMessage("Could not load the latest roadmap insights.");
              return;
            }

            const plannerData = (await response.json()) as PlannerResponse;
            cache.planner.set(plannerRequestKey, plannerData);
            startTransition(() => {
              setPlanner(plannerData);
              setExpandedWeek(plannerData.weeklyBreakdown[0]?.week ?? 1);
            });
            return;
          }

          const cachedResources = cache.resources.get(resourceRequestKey);
          if (cachedResources) {
            startTransition(() => setResourcePlan(cachedResources));
            return;
          }

          const response = await fetch("/api/resources", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({ domain: selectedDomain, goal: deferredGoalTitle.trim() || "Career growth" })
          });

          if (!response.ok) {
            setActionMessage("Could not load the latest roadmap insights.");
            return;
          }

          const resourceData = (await response.json()) as ResourceRecommendation;
          cache.resources.set(resourceRequestKey, resourceData);
          startTransition(() => setResourcePlan(resourceData));
        } catch (error) {
          if (!isAbortLikeError(error)) {
            setActionMessage(toClientErrorMessage(error, "Could not load the latest roadmap insights."));
          }
        } finally {
          setIsInsightsLoading(false);
        }
      })();
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [activeTab, deferredGoalTitle, hoursPerDay, performanceScore, plannerRequestKey, resourceRequestKey, roadmapRequestKey, selectedDomain]);

  const refreshUser = useCallback(async () => {
    setIsRefreshing(true);
    setActionMessage("");
    try {
      const response = await fetch("/api/user", { cache: "no-store" });
      if (!response.ok) {
        setActionMessage("Refresh failed.");
        return;
      }
      setUser((await response.json()) as PublicUserRecord);
      setActionMessage("Workspace refreshed.");
    } catch (error) {
      setActionMessage(toClientErrorMessage(error, "Refresh failed."));
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const createGoal = useCallback(async () => {
    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: goalTitle,
          domain: selectedDomain,
          targetDate,
          hoursPerDay,
          performanceScore
        })
      });

      if (!response.ok) {
        setActionMessage("Could not create the roadmap.");
        return;
      }

      const updated = (await response.json()) as PublicUserRecord;
      setUser(updated);
      setSelectedGoalId(updated.activeGoalId);
      setActiveTab("roadmaps");
    } catch (error) {
      setActionMessage(toClientErrorMessage(error, "Could not create the roadmap."));
    }
  }, [goalTitle, hoursPerDay, performanceScore, selectedDomain, targetDate]);

  const saveGoalTuning = useCallback(async () => {
    if (!selectedGoal) {
      return;
    }

    setIsSavingRoadmap(true);
    setActionMessage("");
    try {
      const response = await fetch("/api/goals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedGoal.id,
          title: goalTitle,
          domain: selectedDomain,
          targetDate,
          performanceScore,
          hoursPerDay,
          status: "active"
        })
      });

      if (response.ok) {
        const updated = (await response.json()) as PublicUserRecord;
        setUser(updated);
        setSelectedGoalId(updated.activeGoalId || selectedGoal.id);
        setActionMessage("Selected roadmap updated.");
      } else {
        setActionMessage("Roadmap update failed.");
      }
    } catch (error) {
      setActionMessage(toClientErrorMessage(error, "Roadmap update failed."));
    } finally {
      setIsSavingRoadmap(false);
    }
  }, [goalTitle, hoursPerDay, performanceScore, selectedDomain, selectedGoal, targetDate]);

  const deleteGoal = useCallback(async (id: string) => {
    try {
      const response = await fetch("/api/goals", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });

      if (!response.ok) {
        setActionMessage("Could not delete the roadmap.");
        return;
      }

      const updated = (await response.json()) as PublicUserRecord;
      setUser(updated);
      setSelectedGoalId(updated.activeGoalId || updated.goals[0]?.id || "");
    } catch (error) {
      setActionMessage(toClientErrorMessage(error, "Could not delete the roadmap."));
    }
  }, []);

  const activateGoal = useCallback(async (id: string) => {
    const goal = user.goals.find((item) => item.id === id);
    if (!goal) {
      return;
    }

    try {
      const response = await fetch("/api/goals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: goal.id,
          performanceScore: goal.performanceScore,
          hoursPerDay: goal.hoursPerDay,
          status: "active"
        })
      });

      if (!response.ok) {
        setActionMessage("Could not switch the active roadmap.");
        return;
      }

      const updated = (await response.json()) as PublicUserRecord;
      setUser(updated);
      setSelectedGoalId(goal.id);
    } catch (error) {
      setActionMessage(toClientErrorMessage(error, "Could not switch the active roadmap."));
    }
  }, [user.goals]);

  const createAsset = useCallback(async () => {
    try {
      const response = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: assetTitle,
          type: assetType,
          link: assetUploadUrl || assetLink,
          summary: assetSummary
        })
      });

      if (!response.ok) {
        setUploadMessage("Could not save the asset.");
        return;
      }

      setUser((await response.json()) as PublicUserRecord);
      setAssetTitle("");
      setAssetLink("");
      setAssetSummary("");
      setAssetUploadUrl("");
      setUploadMessage("");
    } catch (error) {
      setUploadMessage(toClientErrorMessage(error, "Could not save the asset."));
    }
  }, [assetLink, assetSummary, assetTitle, assetType, assetUploadUrl]);

  const uploadAssetFile = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        setUploadMessage("Upload failed.");
        return;
      }

      const data = (await response.json()) as { url: string; name: string };
      setAssetUploadUrl(data.url);
      setAssetLink(data.url);
      setUploadMessage(`Uploaded ${data.name}`);
    } catch (error) {
      setUploadMessage(toClientErrorMessage(error, "Upload failed."));
    }
  }, []);

  const createReminder = useCallback(async () => {
    try {
      const response = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: reminderText,
          dueLabel: reminderDueLabel
        })
      });

      if (!response.ok) {
        setActionMessage("Could not add the reminder.");
        return;
      }

      setUser((await response.json()) as PublicUserRecord);
      setReminderText("");
    } catch (error) {
      setActionMessage(toClientErrorMessage(error, "Could not add the reminder."));
    }
  }, [reminderDueLabel, reminderText]);

  const toggleReminder = useCallback(async (id: string, completed: boolean) => {
    try {
      const response = await fetch("/api/reminders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, completed })
      });

      if (!response.ok) {
        setActionMessage("Could not update the reminder.");
        return;
      }

      setUser((await response.json()) as PublicUserRecord);
    } catch (error) {
      setActionMessage(toClientErrorMessage(error, "Could not update the reminder."));
    }
  }, []);

  const logActivity = useCallback(async () => {
    const latest = user.activity[user.activity.length - 1];
    setIsLoggingActivity(true);
    setActionMessage("");
    try {
      const response = await fetch("/api/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consistency: Math.min(100, (latest?.consistency ?? 60) + 3),
          productivity: Math.min(100, (latest?.productivity ?? 60) + 2),
          completedTopics: (latest?.completedTopics ?? 0) + 1
        })
      });

      if (response.ok) {
        setUser((await response.json()) as PublicUserRecord);
        setActionMessage("Productive session logged.");
      } else {
        setActionMessage("Could not log the session.");
      }
    } catch (error) {
      setActionMessage(toClientErrorMessage(error, "Could not log the session."));
    } finally {
      setIsLoggingActivity(false);
    }
  }, [user.activity]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/auth");
    }
  }, [router]);

  const blueprint = useMemo(() => getBlueprint(selectedDomain), [selectedDomain]);
  const activity = useMemo(() => user.activity.slice(-6), [user.activity]);
  const consistencyValues = useMemo(() => activity.map((item) => item.consistency), [activity]);
  const productivityValues = useMemo(() => activity.map((item) => item.productivity), [activity]);
  const activityLabels = useMemo(() => activity.map((item) => item.date.slice(5)), [activity]);
  const activeRoadmapCount = useMemo(() => user.goals.filter((goal) => goal.status === "active").length, [user.goals]);
  const completionSignal = useMemo(() => Math.min(100, Math.round((performanceScore + user.level * 5 + user.streak) / 3)), [performanceScore, user.level, user.streak]);
  const weeklyFocus = useMemo(
    () => planner?.weeklyBreakdown.find((item) => item.week === expandedWeek) ?? planner?.weeklyBreakdown[0],
    [expandedWeek, planner]
  );
  const domainRecommendations = useMemo(() => adaptivePlan?.recommendations ?? [], [adaptivePlan]);
  const roadmapMix = useMemo(
    () =>
      domainBlueprints
        .map((domain) => ({
          label: domain.label.split(" ").slice(0, 2).join(" "),
          value: user.goals.filter((goal) => goal.domain === domain.key).length
        }))
        .filter((item) => item.value > 0)
        .slice(0, 4),
    [user.goals]
  );

  return (
    <div className="space-y-6">
      <section className="section-shell p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-pulse">Welcome back</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{user.name}&apos;s personal growth operating system</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
              Switch sections from the top bar instead of scrolling through one long page. Your roadmap, planner, resources, vault, and assistant stay in the same workspace.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button onClick={refreshUser} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>
            <button onClick={logout} className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">
              Logout
            </button>
          </div>
        </div>
        {actionMessage ? <p className="mt-4 text-sm text-cyan-300">{actionMessage}</p> : null}
      </section>

      <section className="sticky top-3 z-20 rounded-[2rem] border border-slate-200 bg-mist/95 px-3 py-3 md:bg-mist/90 md:backdrop-blur">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {dashboardTabs.map((tab) => (
            <TabButton key={tab.id} active={activeTab === tab.id} label={tab.label} onClick={() => setActiveTab(tab.id)} />
          ))}
        </div>
      </section>

      {activeTab === "overview" ? (
        <section className="grid gap-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Active roadmaps" value={String(activeRoadmapCount)} detail="Tracks currently in motion across your workspace." />
            <StatCard label="Streak" value={`${user.streak}d`} detail="Daily continuity across study and build sessions." />
            <StatCard label="Level" value={String(user.level)} detail="Current growth level from logged activity." />
            <StatCard label="Assets" value={String(user.assets.length)} detail="Saved work, notes, certificates, and visible proof." />
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
              <RingChart label="Streak signal" value={user.streak} total={30} tone="#38bdf8" helper="Measured against a 30-day consistency cycle." />
              <RingChart label="Level signal" value={user.level} total={20} tone="#0f766e" helper="Current level compared against the next 20-level band." />
              <TrendBars
                title="Consistency trend"
                values={consistencyValues}
                labels={activityLabels}
                tone="linear-gradient(180deg, #38bdf8 0%, #0ea5e9 100%)"
                helper="Last sessions show whether the study routine is tightening or slipping."
              />
              <TrendBars
                title="Productivity trend"
                values={productivityValues}
                labels={activityLabels}
                tone="linear-gradient(180deg, #34d399 0%, #10b981 100%)"
                helper="Session output across the latest logged work blocks."
              />
            </div>

            <div className="grid gap-6">
              <BarChart
                title="Roadmap distribution"
                items={roadmapMix}
                tone="#0f172a"
                helper="How your active and paused work is currently spread across domains."
              />
              <div className="grid gap-4">
                <InsightCard
                  title="Roadmap health"
                  value={`${completionSignal}%`}
                  detail={`Signal built from streak, level, and current score for ${blueprint.label}.`}
                  tone="bg-sky-50 text-sky-900"
                />
                <InsightCard
                  title="Current best-fit track"
                  value={blueprint.careerTracks[0]}
                  detail="Primary direction suggested from the selected roadmap."
                  tone="bg-emerald-50 text-emerald-900"
                />
                <InsightCard
                  title="Next proof of work"
                  value={blueprint.portfolioIdeas[0]}
                  detail="Best artifact to build next for a visible public signal."
                  tone="bg-cyan-50 text-cyan-900"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <div className="section-shell p-5 sm:p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Focus reading</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">{weeklyFocus?.title ?? "Current weekly focus"}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {weeklyFocus?.objective ?? "Open the planner tab to inspect week-by-week notes, project work, and linked resources."}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <button onClick={() => setActiveTab("planner")} className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white">
                  Open planner
                </button>
                <button onClick={logActivity} className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700">
                  {isLoggingActivity ? "Logging..." : "Log productive session"}
                </button>
              </div>
            </div>

            <div className="section-shell p-5 sm:p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Weak areas</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">What needs recovery attention</h3>
              <div className="mt-5 flex flex-wrap gap-3">
                {user.weakAreas.map((item) => (
                  <span key={item} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {activeTab === "roadmaps" ? (
        <section className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <div className="section-shell p-5 sm:p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Roadmap control</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Create, switch, and tune roadmap tracks</h3>
            <div className="mt-6 space-y-4">
              {selectedGoal ? (
                <div className="rounded-3xl border border-slate-200 bg-white px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Selected roadmap</p>
                  <p className="mt-2 break-words text-sm font-semibold text-ink">{selectedGoal.title}</p>
                </div>
              ) : null}
              <input
                value={goalTitle}
                onChange={(event) => setGoalTitle(event.target.value)}
                placeholder="What do you want to learn or achieve?"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-pulse"
              />
              <div className="grid gap-4 md:grid-cols-2">
                <select
                  value={selectedDomain}
                  onChange={(event) => setSelectedDomain(event.target.value as DomainKey)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-pulse"
                >
                  {domainBlueprints.map((domain) => (
                    <option key={domain.key} value={domain.key}>
                      {domain.label}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(event) => setTargetDate(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-pulse"
                />
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-ink">{blueprint.label}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{blueprint.tagline}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-700">
                  <span>Available time per day</span>
                  <span>{hoursPerDay.toFixed(1)} hrs</span>
                </div>
                <input type="range" min="0.5" max="6" step="0.5" value={hoursPerDay} onChange={(event) => setHoursPerDay(Number(event.target.value))} className="w-full accent-pulse" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-700">
                  <span>Performance score</span>
                  <span>{performanceScore}%</span>
                </div>
                <input type="range" min="35" max="100" step="1" value={performanceScore} onChange={(event) => setPerformanceScore(Number(event.target.value))} className="w-full accent-glow" />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <button onClick={createGoal} className="w-full whitespace-nowrap rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white sm:w-auto">
                  Add roadmap
                </button>
                <button onClick={saveGoalTuning} className="w-full whitespace-nowrap rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 sm:w-auto">
                  {isSavingRoadmap ? "Updating roadmap..." : "Update selected roadmap"}
                </button>
                {selectedGoal ? (
                  <button
                    onClick={() => deleteGoal(selectedGoal.id)}
                    className="w-full whitespace-nowrap rounded-full border border-rose-200 bg-white px-5 py-3 text-sm font-semibold text-rose-700 sm:w-auto"
                  >
                    Delete selected roadmap
                  </button>
                ) : null}
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              {user.goals.map((goal) => (
                <div
                  key={goal.id}
                  className={`min-w-0 rounded-3xl border px-4 py-4 ${
                    goal.id === selectedGoalId ? "border-pulse bg-sky-50" : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <button onClick={() => setSelectedGoalId(goal.id)} className="min-w-0 flex-1 text-left">
                      <h4 className="break-words font-semibold text-ink">{goal.title}</h4>
                      <div className="mt-3 flex min-w-0 flex-wrap gap-2 text-xs font-medium text-slate-600">
                        <span className="rounded-full bg-slate-100 px-3 py-1">{getBlueprint(goal.domain).label}</span>
                        <span className="rounded-full bg-slate-100 px-3 py-1">{goal.hoursPerDay} hrs/day</span>
                        <span className="rounded-full bg-slate-100 px-3 py-1">Score {goal.performanceScore}</span>
                      </div>
                    </button>
                    <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-600">{goal.status}</span>
                      <button
                        onClick={() => activateGoal(goal.id)}
                        className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-700"
                      >
                        Use
                      </button>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-rose-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="section-shell p-5 sm:p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Adaptive roadmap</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">AI-adjusted plan for {blueprint.label}</h3>
            {adaptivePlan ? (
              <div className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <StatCard
                    label="Intensity"
                    value={toTitleCase(adaptivePlan.intensity)}
                    detail="Derived from available hours per day."
                    valueClassName="text-2xl font-medium"
                  />
                  <StatCard
                    label="Support"
                    value={toTitleCase(adaptivePlan.supportMode)}
                    detail="Changes revision and checkpoint behavior."
                    valueClassName="text-2xl font-medium"
                  />
                  <StatCard label="Track" value={adaptivePlan.domain} detail="Current active domain blueprint." valueClassName="text-2xl font-medium leading-snug" />
                </div>
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Roadmap guidance</p>
                  <div className="mt-3 grid gap-2 text-sm leading-6 text-slate-700">
                    {domainRecommendations.map((item) => (
                      <p key={item}>{item}</p>
                    ))}
                  </div>
                </div>
                <div className="grid gap-4">
                  {adaptivePlan.roadmap.map((phase) => (
                    <div key={phase.title} className="min-w-0 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <h4 className="min-w-0 break-words text-lg font-semibold text-ink">{phase.title}</h4>
                        <span className="self-start rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 sm:shrink-0">{phase.duration}</span>
                      </div>
                      <div className="mt-3 min-w-0 space-y-2 text-sm leading-6 text-slate-700">
                        {phase.outcomes.map((outcome) => (
                          <p key={outcome} className="break-words">
                            {outcome}
                          </p>
                        ))}
                      </div>
                      <p className="mt-4 break-words rounded-2xl bg-white px-3 py-2 text-sm text-slate-700">{phase.checkpoint}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-3xl bg-slate-50 p-5 text-slate-600">{isInsightsLoading ? "Generating roadmap..." : "Open this tab to load the latest roadmap insights."}</div>
            )}
          </div>
        </section>
      ) : null}

      {activeTab === "planner" ? (
        <section className="section-shell p-5 sm:p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Planner engine</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Weekly study pages, daily schedule, and milestone checkpoints</h3>
          {planner ? (
            <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
              <div>
                <div className="grid gap-3">
                  {planner.schedule.map((item) => (
                    <div key={`${item.day}-${item.focus}`} className="grid gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 sm:grid-cols-[minmax(0,70px)_minmax(0,1fr)] md:grid-cols-[minmax(0,70px)_minmax(0,1fr)_auto_auto] md:items-start">
                      <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">{item.day}</div>
                      <div className="min-w-0">
                        <div className="break-words text-sm font-medium leading-6 text-ink">{item.focus}</div>
                        <p className="mt-1 text-sm text-slate-500">{item.milestone}</p>
                      </div>
                      <div className="text-sm text-slate-600 md:text-right">{item.duration}</div>
                      <div className="rounded-full bg-mist px-3 py-1 text-center text-xs font-semibold uppercase tracking-[0.16em] text-slate-700 md:self-start">{item.taskType}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Planner reminders</p>
                  <div className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                    {planner.reminders.map((item) => (
                      <p key={item}>{item}</p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {planner.weeklyBreakdown.map((week) => {
                  const isOpen = expandedWeek === week.week;
                  return (
                    <div key={week.week} className="rounded-3xl border border-slate-200 bg-white">
                      <button onClick={() => setExpandedWeek(isOpen ? 0 : week.week)} className="flex w-full flex-col gap-4 px-5 py-5 text-left sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Week {week.week}</p>
                          <h4 className="mt-2 text-lg font-semibold text-ink">{week.title}</h4>
                          <p className="mt-2 text-sm leading-6 text-slate-600">{week.objective}</p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-600">
                          {isOpen ? "Open" : "View"}
                        </span>
                      </button>
                      {isOpen ? (
                        <div className="border-t border-slate-200 px-5 py-5">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-3xl bg-slate-50 p-4">
                              <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Notes</p>
                              <div className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                                {week.notes.map((note) => (
                                  <p key={note}>{note}</p>
                                ))}
                              </div>
                            </div>
                            <div className="rounded-3xl bg-cyan-50 p-4">
                              <p className="text-sm uppercase tracking-[0.18em] text-cyan-700">Project</p>
                              <p className="mt-3 text-sm leading-6 text-cyan-900">{week.project}</p>
                            </div>
                          </div>
                          <div className="mt-4 space-y-3">
                            {week.links.map((resource) => (
                              <a
                                key={`${week.week}-${resource.title}`}
                                href={resource.link}
                                target="_blank"
                                rel="noreferrer"
                                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 px-4 py-4 transition hover:border-pulse"
                              >
                                <div>
                                  <p className="font-medium text-ink">{resource.title}</p>
                                  <p className="mt-1 text-sm text-slate-600">
                                    {resource.platform} | {resource.kind}
                                  </p>
                                </div>
                                <span className="rounded-full bg-mist px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-700">Open link</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-3xl bg-slate-50 p-5 text-slate-600">{isInsightsLoading ? "Generating schedule..." : "Open this tab to generate the current schedule."}</div>
          )}
        </section>
      ) : null}

      {activeTab === "resources" ? (
        <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div className="section-shell p-5 sm:p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Resource intelligence</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Curated learning stack for the current goal</h3>
            {resourcePlan ? (
              <div className="mt-6 space-y-4">
                <div className="rounded-3xl bg-slate-50 p-5 text-sm leading-7 text-slate-700">{resourcePlan.summary}</div>
                {resourcePlan.recommendedResources.map((resource) => (
                  <a key={resource.title} href={resource.link} target="_blank" rel="noreferrer" className="block rounded-3xl border border-slate-200 bg-white p-5 transition hover:border-pulse">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h4 className="text-lg font-semibold text-ink">{resource.title}</h4>
                      <span className="rounded-full bg-mist px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-700">Recommended</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{resource.reason}</p>
                  </a>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-3xl bg-slate-50 p-5 text-slate-600">{isInsightsLoading ? "Ranking resources for this goal..." : "Open this tab to rank resources for the current goal."}</div>
            )}
          </div>

          <div className="section-shell self-start p-5 sm:p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Direction snapshot</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Why this track fits the current roadmap</h3>
            <div className="mt-5 grid gap-3 sm:gap-4">
              <InsightCard
                title="Current domain"
                value={blueprint.label}
                detail="The resource system is ranking material against this selected roadmap."
                tone="bg-cyan-900"
                titleClassName="text-cyan-100"
                valueClassName="text-white"
                detailClassName="text-cyan-100"
              />
              <InsightCard title="Target artifact" value={blueprint.portfolioIdeas[0]} detail="Use the vault tab to store this as visible proof once shipped." tone="bg-cyan-50 text-cyan-900" />
              <InsightCard title="Career direction" value={blueprint.careerTracks[0]} detail="Primary route implied by the current domain blueprint." tone="bg-emerald-50 text-emerald-900" />
            </div>
          </div>
        </section>
      ) : null}

      {activeTab === "vault" ? (
        <section className="grid gap-6 xl:grid-cols-2">
          <div className="section-shell p-5 sm:p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Portfolio vault</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Projects, certificates, notes, GitHub links, and work evidence</h3>
            <div className="mt-6 grid gap-3">
              <input value={assetTitle} onChange={(event) => setAssetTitle(event.target.value)} placeholder="Asset title" className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-pulse" />
              <div className="grid gap-3 md:grid-cols-[160px_1fr]">
                <select value={assetType} onChange={(event) => setAssetType(event.target.value as typeof assetType)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-pulse">
                  <option value="project">Project</option>
                  <option value="certificate">Certificate</option>
                  <option value="note">Note</option>
                  <option value="github">GitHub</option>
                  <option value="link">Link</option>
                </select>
                <input value={assetLink} onChange={(event) => setAssetLink(event.target.value)} placeholder="URL" className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-pulse" />
              </div>
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4">
                <label className="block text-sm font-medium text-slate-700">Upload certificate, PDF, or note file</label>
                <input
                  type="file"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      uploadAssetFile(file).catch(() => setUploadMessage("Upload failed."));
                    }
                  }}
                  className="mt-3 block w-full text-sm text-slate-600"
                />
                {uploadMessage ? <p className="mt-2 text-sm text-slate-600">{uploadMessage}</p> : null}
              </div>
              <textarea value={assetSummary} onChange={(event) => setAssetSummary(event.target.value)} rows={4} placeholder="Summary" className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-pulse" />
              <button onClick={createAsset} className="w-fit rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white">
                Add asset
              </button>
            </div>
            <div className="mt-6 grid gap-3">
              {user.assets.map((asset) => (
                <a key={asset.id} href={asset.link} target="_blank" rel="noreferrer" className="rounded-3xl border border-slate-200 bg-white p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h4 className="font-semibold text-ink">{asset.title}</h4>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-600">{asset.type}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{asset.summary}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.15em] text-slate-400">{asset.createdAt}</p>
                </a>
              ))}
            </div>
          </div>

          <div className="section-shell p-5 sm:p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Reminders and rewards</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Deadlines, revision loops, streaks, badges, and wins</h3>
            <div className="mt-6 grid gap-3">
              <input value={reminderText} onChange={(event) => setReminderText(event.target.value)} placeholder="Reminder text" className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-pulse" />
              <input value={reminderDueLabel} onChange={(event) => setReminderDueLabel(event.target.value)} placeholder="When" className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-pulse" />
              <button onClick={createReminder} className="w-fit rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white">
                Add reminder
              </button>
            </div>

            <div className="mt-6 grid gap-3">
              {user.reminders.map((reminder) => (
                <button
                  key={reminder.id}
                  onClick={() => toggleReminder(reminder.id, !reminder.completed)}
                  className={`rounded-3xl border p-4 text-left ${reminder.completed ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white"}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-medium text-ink">{reminder.text}</p>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-600">{reminder.dueLabel}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{reminder.completed ? "Completed" : "Pending"}</p>
                </button>
              ))}
            </div>

            <div className="mt-6 grid gap-3">
              {user.achievements.map((achievement) => (
                <div key={achievement.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h4 className="font-semibold text-ink">{achievement.title}</h4>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-600">Unlocked</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{achievement.detail}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.15em] text-slate-400">{achievement.unlockedAt}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {activeTab === "assistant" ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 px-1">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Workspace assistant</p>
              <p className="mt-1 text-sm text-slate-600">The chatbot now lives in its own tab instead of sitting at the bottom of the page.</p>
            </div>
            <Link href="/chatbot" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
              Open full chatbot
            </Link>
          </div>
          <LazyChatbotPanel user={user} selectedDomain={selectedDomain} onUserUpdate={setUser} compact />
        </section>
      ) : null}
    </div>
  );
}
