import type en from "./dictionary.json";
import type minigame from "features/portal/minigame/i18n/dictionaryMinigame.json";

type DictionaryTranslationKeys = keyof typeof en;

// Minigame terms live in their own dictionary with project-agnostic keys and
// are exposed under the fixed "minigame." namespace (see language.ts).
export const MINIGAME_TRANSLATION_NAMESPACE = "minigame";

type MinigameTranslationKeys =
  `${typeof MINIGAME_TRANSLATION_NAMESPACE}.${Extract<keyof typeof minigame, string>}`;

export type TranslationKeys =
  DictionaryTranslationKeys | MinigameTranslationKeys;
