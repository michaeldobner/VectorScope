// Lenses of a report: security and crisis, politics, or both. Kept apart from the store so it can be tested.
import { isPoliticsRelated } from "./actors";
import { isCrisisRelated, type Entities } from "./entities";
import { isBroad, sourceById } from "./sources";
import type { Item, Lens } from "./types";

// Something happened: an attack, a blast, a death, an arrest, a crash, a quake. A report that is both political and
// about a crisis counts for security only with such an event: "Trump wants a new president for Ukraine" is politics,
// "Drone strike on Kyiv, Zelensky speaks" is security.
const EVENT =
  /(?<![\p{L}])(attack\p{L}*|strikes?|struck|explosions?|blasts?|shelling|bomb\p{L}*|shot|shooting|killed|dead|deaths?|wounded|injured|casualt\p{L}*|hostages?|arrest\p{L}*|detained|crash\p{L}*|shot down|intercept\p{L}*|earthquake|tsunami|fire|evacuat\p{L}*|sabotage|raid|getötet|tote|toter|verletzt\p{L}*|festgenommen|festnahme|verhaftet|abgeschossen|abgefangen|brand|feuer|absturz|abgestürzt|erdbeben|evakuier\p{L}*|geisel\p{L}*)(?![\p{L}])/iu;
// Stems for compounds and bent words: Drohnenangriff, Raketenbeschuss, взрыва, обстрелял.
const EVENT_STEM =
  /(angriff|beschuss|explosion|anschlag|einschlag|взрыв|обстрел|атак|удар|погиб|ранен|пострада|сбит|задержан|пожар|теракт|вибух|обстріл|загин|поранен)/i;

type LensItem = {
  lens?: Partial<Record<Lens, true>>;
  title?: string;
  text?: string;
};

/** The one lens a report counts for in a story: its only lens, or for a report in both, security only with an event. */
const mainOf = new WeakMap<object, Lens | null>();
export function mainLens(item: LensItem): Lens | null {
  const known = mainOf.get(item);
  if (known !== undefined) return known;
  const sec = !!item.lens?.security;
  const pol = !!item.lens?.politics;
  let main: Lens | null = sec ? "security" : pol ? "politics" : null;
  if (sec && pol) {
    const text = `${item.title ?? ""}\n${item.text ?? ""}`;
    main = EVENT.test(text) || EVENT_STEM.test(text) ? "security" : "politics";
  }
  mainOf.set(item, main);
  return main;
}

/**
 * A story belongs to the lens most of its reports count for, on a tie to both. It is shown in the other lens too
 * only if more than a third of its reports count for that one: one report on the war does not turn a quarrel about
 * a prize into security, one statement does not turn an attack into politics.
 */
export function storyInLens(items: LensItem[], lens: Lens): boolean {
  let mine = 0;
  let other = 0;
  for (const i of items) {
    const m = mainLens(i);
    if (m === lens) mine++;
    else if (m) other++;
  }
  return mine > 0 && (mine >= other || mine > (mine + other) / 3);
}

/**
 * The lenses of a report. Security: sources with a broad remit count only with security and crisis topics,
 * no book prizes, no celebrities. Politics: politics sources, or a known actor or political vocabulary.
 * A report in neither lens is dropped.
 */
export function lensesOf(
  item: Item,
  text: string,
  entities: Entities,
): Partial<Record<Lens, true>> {
  const src = sourceById(item.sourceId);
  const out: Partial<Record<Lens, true>> = {};
  if (!isBroad(src) || isCrisisRelated(text, entities)) out.security = true;
  if (
    item.channel !== "sensor" &&
    (src?.category === "politics" ||
      isPoliticsRelated(text, entities.actors) ||
      entities.members.length > 0)
  )
    out.politics = true;
  return out;
}
