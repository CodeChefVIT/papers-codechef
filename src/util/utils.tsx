export function toSentenceCase(input: string): string {
  const trimmedInput = input.trim();
  if (trimmedInput.length === 0) {
    return "";
  }

  const sentences = trimmedInput.split(/(?<=[.!?])\s+/);

  const sentenceCased = sentences.map((sentence) => {
    return sentence.charAt(0).toUpperCase() + sentence.slice(1);
  });

  return sentenceCased.join(" ");
}

export function extractBracketContent(subject: string): string | null {
  const match = subject.match(/\[(.*?)\]/);
  return match?.[1] ? match[1] : "BMAT102L"; //MAKE SURE IT WORKS WHEN URL IS DONE FROM BACKEND
}

export function extractWithoutBracketContent(subject: string): string {
  return subject.replace(/\s*\[.*?\]\s*/g, "").trim();
}

export function capsule(data: string) {
  return (
    <div className=" rounded-md bg-[#7480FF] p-1 px-3 text-sm">{data}</div>
  );
}
export function capsuleGreen(data: string) {
  return (
    <div className=" rounded-md bg-[#3cc923] p-1 px-3 text-sm">{data}</div>
  );
}
