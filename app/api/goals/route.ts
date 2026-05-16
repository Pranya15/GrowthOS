import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { resolveApiUser } from "@/lib/api-user";
import { publicUser, updateUser } from "@/lib/db";
import { GoalRecord } from "@/lib/models";
import { DomainKey } from "@/lib/types";

function createFallbackGoal(): GoalRecord {
  return {
    id: crypto.randomUUID(),
    title: "New goal",
    domain: "engineering",
    targetDate: "2026-09-30",
    hoursPerDay: 2,
    performanceScore: 70,
    status: "active"
  };
}

async function readJsonBody(request: NextRequest) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const user = await resolveApiUser();
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const body = (await readJsonBody(request)) as Partial<GoalRecord> | null;
  const title = body?.title?.trim();

  if (!title) {
    return NextResponse.json({ error: "Goal title is required." }, { status: 400 });
  }

  const nextGoal: GoalRecord = {
    id: crypto.randomUUID(),
    title,
    domain: (body?.domain as DomainKey | undefined) ?? "engineering",
    targetDate: body?.targetDate ?? "2026-09-30",
    hoursPerDay: typeof body?.hoursPerDay === "number" ? body.hoursPerDay : 2,
    performanceScore: typeof body?.performanceScore === "number" ? body.performanceScore : 70,
    status: "active"
  };

  const updated = await updateUser(user.id, (current) => ({
    ...current,
    activeGoalId: nextGoal.id,
    goals: [...current.goals.map((goal) => ({ ...goal, status: "paused" as const })), nextGoal]
  }));

  return NextResponse.json(updated ? publicUser(updated) : null);
}

export async function PATCH(request: NextRequest) {
  const user = await resolveApiUser();
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const body = (await readJsonBody(request)) as Partial<GoalRecord> & { id?: string } | null;
  if (!body?.id) {
    return NextResponse.json({ error: "Goal id is required." }, { status: 400 });
  }
  const goalId = body.id;

  const currentGoal = user.goals.find((goal) => goal.id === goalId);
  if (!currentGoal) {
    return NextResponse.json({ error: "Goal not found." }, { status: 404 });
  }

  const nextStatus = body.status ?? currentGoal.status;
  const updated = await updateUser(user.id, (current) => {
    const goals = current.goals.map((goal) => {
      if (goal.id !== goalId) {
        return nextStatus === "active" ? { ...goal, status: "paused" as const } : goal;
      }

      return {
        ...goal,
        title: typeof body.title === "string" && body.title.trim() ? body.title.trim() : goal.title,
        domain: (body.domain as DomainKey | undefined) ?? goal.domain,
        targetDate: body.targetDate ?? goal.targetDate,
        hoursPerDay: typeof body.hoursPerDay === "number" ? body.hoursPerDay : goal.hoursPerDay,
        performanceScore: typeof body.performanceScore === "number" ? body.performanceScore : goal.performanceScore,
        status: nextStatus
      };
    });

    return {
      ...current,
      activeGoalId: nextStatus === "active" ? goalId : current.activeGoalId,
      goals
    };
  });

  return NextResponse.json(updated ? publicUser(updated) : null);
}

export async function DELETE(request: NextRequest) {
  const user = await resolveApiUser();
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const goalIdFromQuery = request.nextUrl.searchParams.get("id")?.trim();
  const body = (await readJsonBody(request)) as { id?: string } | null;
  const goalId = goalIdFromQuery || body?.id?.trim();

  if (!goalId) {
    return NextResponse.json({ error: "Goal id is required." }, { status: 400 });
  }

  if (!user.goals.some((goal) => goal.id === goalId)) {
    return NextResponse.json({ error: "Goal not found." }, { status: 404 });
  }

  const updated = await updateUser(user.id, (current) => {
    const remainingGoals = current.goals.filter((goal) => goal.id !== goalId);
    const nextGoals = remainingGoals.length > 0 ? remainingGoals : [createFallbackGoal()];
    const nextActiveGoalId = nextGoals.some((goal) => goal.id === current.activeGoalId) ? current.activeGoalId : nextGoals[0].id;

    return {
      ...current,
      activeGoalId: nextActiveGoalId,
      goals: nextGoals.map((goal) => ({
        ...goal,
        status: goal.id === nextActiveGoalId ? "active" : goal.status === "active" ? "paused" : goal.status
      }))
    };
  });

  return NextResponse.json(updated ? publicUser(updated) : null);
}
