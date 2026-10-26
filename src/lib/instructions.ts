export type InstructionBlock =
  | { type: 'heading' | 'bullet' | 'tip' | 'paragraph'; text: string }
  | { type: 'step'; text: string; number: number };

/**
 * Dzieli opis przygotowania na bloki do wyświetlenia. Format (generowany przez AI, ale można pisać ręcznie):
 * "## Nagłówek", "1. krok", "- punkt", "Wskazówka: …". Pozostałe linie to zwykłe akapity,
 * więc stare opisy wyglądają jak wcześniej.
 */
export function parseInstructions(text: string): InstructionBlock[] {
  const blocks: InstructionBlock[] = [];
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line) continue;

    let m: RegExpMatchArray | null;
    if ((m = line.match(/^#{1,6}\s+(.+)$/))) blocks.push({ type: 'heading', text: m[1] });
    else if ((m = line.match(/^(\d+)[.)]\s+(.+)$/))) blocks.push({ type: 'step', number: Number(m[1]), text: m[2] });
    else if ((m = line.match(/^[-•*]\s+(.+)$/))) blocks.push({ type: 'bullet', text: m[1] });
    else if ((m = line.match(/^(?:wskaz[óo]wka|porada):\s*(.+)$/i))) blocks.push({ type: 'tip', text: m[1] });
    else blocks.push({ type: 'paragraph', text: line });
  }
  // AI czasem dokleja pogrubienia mimo zakazu
  return blocks.map((b) => ({ ...b, text: b.text.replace(/\*\*(.+?)\*\*/g, '$1') }));
}
