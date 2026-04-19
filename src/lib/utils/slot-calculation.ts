export function calculateCorrespondingSlots(currentSlot: string): string[] {
  const nextSlot = String.fromCharCode(currentSlot.charCodeAt(0) + 1);
  
  return [
    currentSlot + "1",
    currentSlot + "2", 
    nextSlot + "1",
    nextSlot + "2",
  ];
}