import db from "@/data/app-db.json";
import { PublicUserRecord, UserRecord } from "@/lib/models";

function toPublicUser(user: UserRecord): PublicUserRecord {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    activeGoalId: user.activeGoalId,
    streak: user.streak,
    level: user.level,
    weakAreas: user.weakAreas,
    goals: user.goals,
    assets: user.assets,
    reminders: user.reminders,
    activity: user.activity,
    achievements: user.achievements,
    chatMessages: user.chatMessages,
    chatConversations: user.chatConversations,
    activeChatId: user.activeChatId
  };
}

const fallbackUser = db.users[0] as UserRecord;

export const staticUser = toPublicUser(fallbackUser);
