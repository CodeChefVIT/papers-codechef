import UpcomingSlot from "@/db/upcoming-slot";
import UpcomingSubject from "@/db/upcoming-paper";
import UpcomingSchedule from "@/db/upcoming-schedule";
import CourseCount from "@/db/course";
import slotToSubjectsData from "@/data/slot_to_subjects.json";
import { getTodayDateInIST, isAtOrAfterCutoffInIST } from "@/lib/utils/time";

const slotToSubjectsMap = slotToSubjectsData as Record<string, string[]>;
const SLOT_ORDER = ["A", "B", "C", "D", "E", "F", "G"] as const;
type SlotKey = (typeof SLOT_ORDER)[number];

function isSlotKey(value: string): value is SlotKey {
  return SLOT_ORDER.includes(value as SlotKey);
}

function getSelectedGroupKeys(slot: SlotKey): SlotKey[] {
  const index = SLOT_ORDER.indexOf(slot);
  if (index === -1) return [];
  const current = SLOT_ORDER[index];
  if (!current) return [];
  if (current === "G") return ["G"];
  const next = SLOT_ORDER[index + 1];
  return next ? [current, next] : [current];
}

export async function checkAndSyncUpcomingSlots(): Promise<void> {
  const today = getTodayDateInIST();
  if (!today) return;

  const currentSlotDoc = await UpcomingSlot.findOne();
  if (currentSlotDoc?.lastSyncedDate === today) {
    return; // Already synced today! Fast return.
  }

  // Read syncMode ("CAT" or "FAT") set once on UpcomingSlot
  const syncMode = currentSlotDoc?.syncMode ?? "CAT";
  if (!isAtOrAfterCutoffInIST(syncMode)) return;

  const scheduleDoc = await UpcomingSchedule.findOne(
    { date: today },
    { _id: 0, slot: 1 },
  ).lean<{ slot: string } | null>();

  // 1. Try date schedule slot first
  // 2. Fallback to active slot in UpcomingSlot (if no date is found in upcomingschedules)
  const scheduledSlotRaw = scheduleDoc?.slot ?? currentSlotDoc?.slot;
  if (!scheduledSlotRaw || !isSlotKey(scheduledSlotRaw)) return;
  const scheduledSlot = scheduledSlotRaw;

  const selectedGroupKeys = getSelectedGroupKeys(scheduledSlot);
  if (selectedGroupKeys.length === 0) return;

  const selectionLimit =
    selectedGroupKeys.length === 1 && selectedGroupKeys[0] === "G" ? 16 : 8;
  const targetUniqueCount = selectionLimit * selectedGroupKeys.length;

  const candidateSubjects = new Set<string>();
  for (const groupKey of selectedGroupKeys) {
    const subSlots = [`${groupKey}1`, `${groupKey}2`];
    for (const subSlot of subSlots) {
      const subjects = slotToSubjectsMap[subSlot] || [];
      for (const subject of subjects) {
        candidateSubjects.add(subject);
      }
    }
  }

  const frequencyRows = await CourseCount.find(
    {},
    { _id: 0, name: 1, count: 1 },
  ).lean<Array<{ name: string; count: number }>>();

  const countMap = new Map<string, number>();
  for (const row of frequencyRows) {
    countMap.set(row.name, row.count);
  }

  const ranked = Array.from(candidateSubjects)
    .map((subject) => ({
      subject,
      count: countMap.get(subject) ?? 0,
      slots: Object.entries(slotToSubjectsMap)
        .filter(([, subjects]) => subjects.includes(subject))
        .map(([token]) => token),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, targetUniqueCount);

  await UpcomingSlot.findOneAndUpdate(
    {},
    { $set: { slot: scheduledSlot, lastSyncedDate: today } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  await UpcomingSubject.deleteMany({});
  if (ranked.length > 0) {
    await UpcomingSubject.insertMany(
      ranked.map((item) => ({
        subject: item.subject,
        slots: item.slots,
      })),
    );
  }
}
