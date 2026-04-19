export function toSentenceCase(input: string): string {
  const trimmedInput = input.trim();
  if (trimmedInput.length === 0) {
    return "";
  }

  const sentences = trimmedInput.split(/(?<=[.!?])\s+/);

  const sentenceCased = sentences.map((sentence) => {
    return sentence.charAt(0).toUpperCase() + sentence.slice(1);
  });

  return sentenceCased.join(" ");
}

export function extractBracketContent(subject: string): string | null {
  const regex = /\[(.*?)\]/;
  const match = regex.exec(subject);
  return match?.[1] ?? "BMAT102L";
}

export function extractWithoutBracketContent(subject: string): string {
  return subject.replace(/\s*\[.*?\]\s*/g, "").trim();
}