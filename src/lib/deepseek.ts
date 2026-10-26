import type { Ingredient } from '@/db/recipes';
import { getDeepSeekKey } from '@/lib/settings';
import { formatAmount } from '@/lib/units';

// https://api-docs.deepseek.com/ — API zgodne z OpenAI
const ENDPOINT = 'https://api.deepseek.com/chat/completions';
const MODEL = 'deepseek-flash';
const TIMEOUT_MS = 45_000;

/** Brak zapisanego klucza — formularz proponuje wtedy przejście do ustawień. */
export class NoApiKeyError extends Error {
  constructor() {
    super('Brak klucza API DeepSeek.');
  }
}

// format musi pasować do parseInstructions() z lib/instructions.ts
const SYSTEM_PROMPT = `Jesteś redaktorem książki kucharskiej. Przepisz opis przygotowania dania tak, żeby był czytelny i uporządkowany. Pisz po polsku, zwięźle, w trybie rozkazującym.

Zasady:
- Nie dodawaj nowych składników ani kroków, których nie ma w opisie. Możesz doprecyzować oczywiste rzeczy (np. kolejność), ale nie zmieniaj przepisu.
- Odpowiedz samym tekstem przepisu, bez wstępu i podsumowania.
- Używaj tylko tego formatowania:
  "## Nagłówek" — nagłówek sekcji, tylko gdy przepis ma wyraźne części (np. "## Sos", "## Ciasto"),
  "1. Treść kroku" — numerowany krok, jeden krok w jednej linii, numeracja od 1 w każdej sekcji,
  "- Treść" — punkt listy,
  "Wskazówka: treść" — opcjonalna porada, najwyżej jedna lub dwie na końcu.
- Żadnego innego markdownu: bez pogrubień, gwiazdek, tabel i emoji.`;

type Input = { title: string; ingredients: Ingredient[]; instructions: string };

/** Przepisuje surowy opis przygotowania na uporządkowane kroki. */
export async function rewriteInstructions({ title, ingredients, instructions }: Input): Promise<string> {
  const key = await getDeepSeekKey();
  if (!key) throw new NoApiKeyError();

  const ingredientList = ingredients
    .map((i) => `- ${i.name}${formatAmount(i.quantity, i.unit) ? ` (${formatAmount(i.quantity, i.unit)})` : ''}`)
    .join('\n');
  const userMessage = [
    `Danie: ${title || 'bez nazwy'}`,
    ingredientList && `Składniki:\n${ingredientList}`,
    `Opis przygotowania:\n${instructions}`,
  ]
    .filter(Boolean)
    .join('\n\n');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.3,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
      }),
      signal: controller.signal,
    });
  } catch {
    if (controller.signal.aborted) throw new Error('DeepSeek nie odpowiedział na czas. Spróbuj ponownie.');
    throw new Error('Brak połączenia z DeepSeek. Sprawdź internet.');
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 401) throw new Error('Nieprawidłowy klucz API. Sprawdź go w ustawieniach.');
  if (response.status === 402) throw new Error('Brak środków na koncie DeepSeek.');
  if (!response.ok) throw new Error(`DeepSeek zwrócił błąd ${response.status}: ${await response.text()}`);

  const data = await response.json();
  const text: string | undefined = data?.choices?.[0]?.message?.content;
  if (!text?.trim()) throw new Error('DeepSeek zwrócił pustą odpowiedź.');
  return text.trim();
}
