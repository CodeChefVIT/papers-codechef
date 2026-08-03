export function getTodayDateInIST(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) return "";
  return `${year}-${month}-${day}`;
}

export function isAtOrAfterCutoffInIST(examType: "CAT" | "FAT" = "CAT"): boolean {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const hour = parts.find((part) => part.type === "hour")?.value;
  const minute = parts.find((part) => part.type === "minute")?.value;

  if (!hour || !minute) return false;
  const hourNumber = Number.parseInt(hour, 10);
  const minuteNumber = Number.parseInt(minute, 10);
  if (Number.isNaN(hourNumber) || Number.isNaN(minuteNumber)) return false;

  if (examType === "FAT") {
    // Trigger after 9:30 AM IST for FAT exams
    return hourNumber > 9 || (hourNumber === 9 && minuteNumber >= 30);
  }

  // Trigger after 2:00 PM IST (14:00) for CAT exams (default)
  return hourNumber > 14 || (hourNumber === 14 && minuteNumber >= 0);
}

export function isAtOrAfterTwoPMInIST(): boolean {
  return isAtOrAfterCutoffInIST("CAT");
}
