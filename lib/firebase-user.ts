import { User } from "firebase/auth";
import {
  Unsubscribe,
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
  setDoc
} from "firebase/firestore";
import {
  getDownloadURL,
  ref,
  uploadBytes
} from "firebase/storage";
import { firestore, firebaseStorage } from "@/lib/firebase";
import { ChatMessageRecord, GoalRecord, ProjectRecord, PublicUserRecord } from "@/lib/models";
import { normalizeUserRecord, createConversation, createStarterUser } from "@/lib/workspace-user";
import { DomainKey } from "@/lib/types";

type ChatMode = "study-help" | "career-advice" | "project-review" | "exam-strategy";

function randomId() {
  return globalThis.crypto.randomUUID();
}

function getUserRef(userId: string) {
  if (!firestore) {
    throw new Error("Firestore is not configured.");
  }

  return doc(firestore, "users", userId);
}

export async function ensureFirestoreUser(user: User) {
  const userRef = getUserRef(user.uid);
  const snapshot = await getDoc(userRef);

  if (snapshot.exists()) {
    const current = normalizeUserRecord(snapshot.data() as PublicUserRecord);
    if (current.name !== (user.displayName || current.name) || current.email !== (user.email || current.email)) {
      await setDoc(
        userRef,
        {
          ...current,
          name: user.displayName || current.name,
          email: user.email || current.email
        },
        { merge: true }
      );
    }
    return current;
  }

  const starter = createStarterUser({
    id: user.uid,
    name: user.displayName || "Growth OS User",
    email: user.email || `${user.uid}@firebase.local`
  });

  await setDoc(userRef, starter);
  return starter;
}

export function subscribeToWorkspaceUser(userId: string, onData: (user: PublicUserRecord) => void): Unsubscribe {
  return onSnapshot(getUserRef(userId), (snapshot) => {
    if (!snapshot.exists()) {
      return;
    }

    onData(normalizeUserRecord(snapshot.data() as PublicUserRecord));
  });
}

export async function refreshWorkspaceUser(userId: string) {
  const snapshot = await getDoc(getUserRef(userId));
  if (!snapshot.exists()) {
    return null;
  }

  return normalizeUserRecord(snapshot.data() as PublicUserRecord);
}

async function updateWorkspaceUser(userId: string, updater: (user: PublicUserRecord) => PublicUserRecord) {
  if (!firestore) {
    throw new Error("Firestore is not configured.");
  }

  return runTransaction(firestore, async (transaction) => {
    const userRef = getUserRef(userId);
    const snapshot = await transaction.get(userRef);

    if (!snapshot.exists()) {
      throw new Error("Workspace user not found.");
    }

    const current = normalizeUserRecord(snapshot.data() as PublicUserRecord);
    const next = normalizeUserRecord(updater(current));
    transaction.set(userRef, next);
    return next;
  });
}

export async function createGoalInFirestore(userId: string, input: Omit<GoalRecord, "id" | "status">) {
  const nextGoal: GoalRecord = {
    id: randomId(),
    status: "active",
    ...input
  };

  return updateWorkspaceUser(userId, (current) => ({
    ...current,
    activeGoalId: nextGoal.id,
    goals: [...current.goals.map((goal) => ({ ...goal, status: "paused" as const })), nextGoal]
  }));
}

export async function updateGoalInFirestore(userId: string, input: Partial<GoalRecord> & { id: string }) {
  return updateWorkspaceUser(userId, (current) => {
    const currentGoal = current.goals.find((goal) => goal.id === input.id);
    if (!currentGoal) {
      throw new Error("Goal not found.");
    }

    const nextStatus = input.status ?? currentGoal.status;
    const goals = current.goals.map((goal) => {
      if (goal.id !== input.id) {
        return nextStatus === "active" ? { ...goal, status: "paused" as const } : goal;
      }

      return {
        ...goal,
        title: typeof input.title === "string" && input.title.trim() ? input.title.trim() : goal.title,
        domain: input.domain ?? goal.domain,
        targetDate: input.targetDate ?? goal.targetDate,
        hoursPerDay: typeof input.hoursPerDay === "number" ? input.hoursPerDay : goal.hoursPerDay,
        performanceScore: typeof input.performanceScore === "number" ? input.performanceScore : goal.performanceScore,
        status: nextStatus
      };
    });

    return {
      ...current,
      activeGoalId: nextStatus === "active" ? input.id : current.activeGoalId,
      goals
    };
  });
}

export async function deleteGoalInFirestore(userId: string, goalId: string) {
  return updateWorkspaceUser(userId, (current) => {
    const remainingGoals = current.goals.filter((goal) => goal.id !== goalId);
    const nextGoals: GoalRecord[] = remainingGoals.length > 0
      ? remainingGoals
      : [
          {
            id: randomId(),
            title: "New goal",
            domain: "engineering",
            targetDate: "2026-09-30",
            hoursPerDay: 2,
            performanceScore: 70,
            status: "active"
          }
        ];
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
}

export async function createAssetInFirestore(userId: string, input: Omit<ProjectRecord, "id" | "createdAt">) {
  const asset: ProjectRecord = {
    id: randomId(),
    createdAt: new Date().toISOString().slice(0, 10),
    ...input
  };

  return updateWorkspaceUser(userId, (current) => ({
    ...current,
    assets: [asset, ...current.assets]
  }));
}

export async function createReminderInFirestore(userId: string, text: string, dueLabel: string) {
  return updateWorkspaceUser(userId, (current) => ({
    ...current,
    reminders: [
      {
        id: randomId(),
        text,
        dueLabel,
        completed: false
      },
      ...current.reminders
    ]
  }));
}

export async function toggleReminderInFirestore(userId: string, reminderId: string, completed: boolean) {
  return updateWorkspaceUser(userId, (current) => ({
    ...current,
    reminders: current.reminders.map((reminder) =>
      reminder.id === reminderId ? { ...reminder, completed } : reminder
    )
  }));
}

export async function logActivityInFirestore(userId: string, input: { consistency: number; productivity: number; completedTopics: number }) {
  return updateWorkspaceUser(userId, (current) => ({
    ...current,
    activity: [
      ...current.activity,
      {
        id: randomId(),
        date: new Date().toISOString().slice(0, 10),
        consistency: Math.max(0, Math.min(100, Math.round(input.consistency))),
        productivity: Math.max(0, Math.min(100, Math.round(input.productivity))),
        completedTopics: Math.max(0, Math.round(input.completedTopics))
      }
    ]
  }));
}

function truncateTitle(value: string) {
  const clean = value.trim().replace(/\s+/g, " ");
  return clean.length <= 60 ? clean : `${clean.slice(0, 57)}...`;
}

export async function saveChatReplyInFirestore(userId: string, args: {
  prompt: string;
  answer: string;
  domain: DomainKey;
  mode: ChatMode;
  conversationId?: string;
  createNew?: boolean;
}) {
  const createdAt = new Date().toISOString();
  const userMessage: ChatMessageRecord = {
    id: randomId(),
    role: "user",
    content: args.prompt,
    createdAt,
    mode: args.mode
  };
  const assistantMessage: ChatMessageRecord = {
    id: randomId(),
    role: "assistant",
    content: args.answer,
    createdAt: new Date(Date.now() + 1).toISOString(),
    mode: args.mode
  };

  return updateWorkspaceUser(userId, (current) => {
    const existingConversation = args.conversationId
      ? current.chatConversations.find((item) => item.id === args.conversationId)
      : undefined;
    const activeConversation =
      existingConversation ??
      current.chatConversations.find((item) => item.id === current.activeChatId) ??
      current.chatConversations[0];

    const baseConversation =
      args.createNew || !activeConversation
        ? {
            id: randomId(),
            title: truncateTitle(args.prompt),
            domain: args.domain,
            createdAt,
            updatedAt: assistantMessage.createdAt,
            messages: [userMessage, assistantMessage]
          }
        : {
            ...activeConversation,
            title: activeConversation.title === "New chat" ? truncateTitle(args.prompt) : activeConversation.title,
            updatedAt: assistantMessage.createdAt,
            messages: [...activeConversation.messages, userMessage, assistantMessage]
          };

    const remainingConversations = current.chatConversations.filter((item) => item.id !== baseConversation.id);
    const nextConversations = [baseConversation, ...remainingConversations].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));

    return {
      ...current,
      chatConversations: nextConversations,
      chatMessages: baseConversation.messages,
      activeChatId: baseConversation.id
    };
  });
}

export async function clearChatHistoryInFirestore(userId: string, domain: DomainKey) {
  const createdAt = new Date().toISOString();
  const resetConversation = createConversation({
    title: "New chat",
    domain,
    createdAt,
    updatedAt: createdAt,
    messages: [
      {
        id: randomId(),
        role: "assistant",
        content: "History cleared. Start a new conversation whenever you are ready.",
        createdAt
      }
    ]
  });

  return updateWorkspaceUser(userId, (current) => ({
    ...current,
    chatConversations: [resetConversation],
    chatMessages: resetConversation.messages,
    activeChatId: resetConversation.id
  }));
}

export async function uploadAssetToFirebase(userId: string, file: File) {
  if (!firebaseStorage) {
    throw new Error("Firebase Storage is not configured.");
  }

  const storageRef = ref(firebaseStorage, `users/${userId}/assets/${Date.now()}-${file.name}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  return { url, name: file.name };
}
