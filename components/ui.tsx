import clsx from "clsx";
import Link from "next/link";
import { DomainBlueprint, ProgressSnapshot, ScheduleItem } from "@/lib/types";

export function Shell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={clsx("section-shell hover-lift", className)}>{children}</div>;
}

export function SectionTitle({
  eyebrow,
  title,
  copy
}: {
  eyebrow: string;
  title: string;
  copy: string;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-pulse">{eyebrow}</p>
      <div className="space-y-2">
        <h2 className="display-title text-2xl font-semibold tracking-tight text-ink sm:text-3xl md:text-4xl">{title}</h2>
        <p className="max-w-3xl text-base leading-7 text-slate-300">{copy}</p>
      </div>
    </div>
  );
}

export function DomainPill({ label, tagline }: { label: string; tagline: string }) {
  return (
    <div className="soft-card hover-lift rounded-3xl p-5">
      <h3 className="text-lg font-semibold text-ink">{label}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{tagline}</p>
    </div>
  );
}

export function ProgressCard({ progress }: { progress: ProgressSnapshot }) {
  const metrics = [
    { label: "Consistency", value: progress.consistency },
    { label: "Productivity", value: progress.productivity },
    { label: "Topic Completion", value: progress.completedTopics * 4 }
  ];

  return (
    <Shell className="p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Progress Pulse</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-100">You are leveling up steadily</h3>
        </div>
        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-left shadow-glow sm:text-right">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Current streak</p>
          <p className="text-3xl font-semibold text-slate-100">{progress.streak}d</p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="space-y-2">
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span>{metric.label}</span>
              <span>{metric.value}%</span>
            </div>
            <div className="h-3 rounded-full bg-slate-800">
              <div className="metric-bar h-3 rounded-full" style={{ width: `${metric.value}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {progress.weakAreas.map((item) => (
          <div key={item} className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-slate-200">
            {item}
          </div>
        ))}
      </div>
    </Shell>
  );
}

export function ScheduleCard({ schedule }: { schedule: ScheduleItem[] }) {
  return (
    <Shell className="p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Planner</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-100">Daily and weekly execution map</h3>
        </div>
        <Link
          href="/dashboard"
          className="rounded-full border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-pulse hover:text-pulse"
        >
          Open dashboard
        </Link>
      </div>
      <div className="mt-6 grid gap-3">
        {schedule.map((item) => (
          <div key={item.day} className="soft-card grid gap-3 rounded-2xl px-4 py-4 md:grid-cols-[minmax(0,70px)_minmax(0,1fr)_auto_auto] md:items-start">
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">{item.day}</div>
            <div className="min-w-0 break-words text-sm font-medium leading-6 text-slate-100">{item.focus}</div>
            <div className="text-sm text-slate-300 md:text-right">{item.duration}</div>
            <div className="rounded-full bg-slate-800 px-3 py-1 text-center text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300 md:self-start">
              {item.taskType}
            </div>
          </div>
        ))}
      </div>
    </Shell>
  );
}

export function RoadmapPanel({ blueprint }: { blueprint: DomainBlueprint }) {
  return (
    <Shell className="p-5 sm:p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Roadmap</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-100">{blueprint.label}</h3>
          <p className="mt-2 max-w-2xl break-words text-sm leading-6 text-slate-300">{blueprint.tagline}</p>
        </div>
        <div className="min-w-0 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-white md:max-w-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-white/70">Outcome focus</p>
          <p className="mt-1 break-words font-medium">{blueprint.portfolioIdeas[0]}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {blueprint.roadmap.map((phase) => (
          <div key={phase.title} className="soft-card min-w-0 rounded-3xl p-4 sm:p-5">
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <h4 className="min-w-0 break-words text-lg font-semibold text-slate-100">{phase.title}</h4>
              <span className="self-start rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 sm:shrink-0">
                {phase.duration}
              </span>
            </div>
            <div className="mt-4 min-w-0 space-y-2 text-sm leading-6 text-slate-300">
              {phase.outcomes.map((outcome) => (
                <p key={outcome} className="break-words">
                  {outcome}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Shell>
  );
}

export function ResourceTable({ blueprint }: { blueprint: DomainBlueprint }) {
  return (
    <Shell>
      <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Curated Resources</p>
        <h3 className="mt-2 text-2xl font-semibold text-slate-100">Best next material for this domain</h3>
      </div>
      <div className="grid gap-px bg-slate-200">
        {blueprint.resources.map((resource) => (
          <a
            key={resource.title}
            href={resource.link}
            target="_blank"
            rel="noreferrer"
            className="grid gap-3 bg-slate-950/40 px-5 py-5 transition hover:bg-slate-900/80 sm:px-6 md:grid-cols-[minmax(0,1.4fr)_auto_auto]"
          >
            <div>
              <p className="font-semibold text-slate-100">{resource.title}</p>
              <p className="mt-1 text-sm text-slate-300">{blueprint.label}</p>
            </div>
            <div className="text-sm text-slate-300">{resource.type}</div>
            <div className="text-sm font-medium text-cyan-300">{resource.price}</div>
          </a>
        ))}
      </div>
    </Shell>
  );
}

export function PortfolioPanel({ blueprint }: { blueprint: DomainBlueprint }) {
  return (
    <Shell className="p-5 sm:p-6">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Portfolio Vault</p>
      <h3 className="mt-2 text-2xl font-semibold text-slate-100">Projects, certificates, notes, and proof of work</h3>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {blueprint.portfolioIdeas.map((idea, index) => (
          <div key={idea} className="soft-card rounded-3xl p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Artifact {index + 1}</p>
            <h4 className="mt-3 text-lg font-semibold text-slate-100">{idea}</h4>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Store files, certificate links, GitHub URLs, notes, and outcome summaries in one trackable place.
            </p>
          </div>
        ))}
      </div>
    </Shell>
  );
}

export function MentorPanel() {
  return (
    <Shell className="p-5 sm:p-6">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">AI Mentor</p>
      <h3 className="mt-2 text-2xl font-semibold text-slate-100">Ask doubts, get next steps, and stay on track</h3>
      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="rounded-3xl bg-ink p-5 text-white shadow-glow">
          <p className="text-sm uppercase tracking-[0.18em] text-white/70">Mentor response sample</p>
          <p className="mt-4 text-base leading-7">
            Your learning speed is strong, but your revision discipline is slipping. Compress your weekly roadmap by 15%, add two review loops,
            and publish one visible artifact before starting a new course.
          </p>
        </div>
        <div className="soft-card rounded-3xl p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Mentor capabilities</p>
          <div className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
            <p>Doubt solving with domain-specific guidance</p>
            <p>Career path recommendations and transition advice</p>
            <p>Adaptive roadmap changes based on performance</p>
            <p>Reminder prompts for deadlines, revisions, and missed sessions</p>
          </div>
        </div>
      </div>
    </Shell>
  );
}
