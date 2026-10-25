import type { BumpkinItem } from "features/game/types/bumpkin";
import type { BumpkinParts } from "lib/utils/tokenUriBuilder";
import type {
  DropItemHalloweenType,
  WeaponId,
  WeaponStatKey,
} from "features/portal/minigame/Types";

export type WearableBuffTarget =
  | {
      type: "weaponStat";
      weapon: WeaponId;
      stat: WeaponStatKey;
    }
  | {
      type: "orbStat";
      stat: DropItemHalloweenType;
    };

export type WearableBuff = {
  target: WearableBuffTarget;
  value: number;
  descriptionKey: string;
};

export const NO_WEARABLE_BUFF_SCORE_MULTIPLIER = 1.1;

export const WEARABLES_TAB_ITEMS: BumpkinItem[] = [
  "Carrot Pitchfork",
  "Handheld Bunny",
  "Bunny Mask",
  "Bunny Pants",
  "Easter Apron",
  "Slime Hat",
  "Slime Wings",
  "Slime Aura",
  "Green Slime Hair",
  "Blue Slime Shirt",
  "Slime Splattered Shirt",
  "Sad Slime Pants",
  "Red Jelly Pants",
  "Yellow Slime Puppet",
  "Blue Jelly Shoes",
  "Sad Slime Slippers",
  "Sad Slime Hat",
  "Slime Wall Background",
  "Rainbow Wings",
  "Butterfly Aura",
  "Paint Splattered Hair",
  "Paint Splattered Shirt",
  "Paint Splattered Overalls",
  "Paint Spray Can",
  "Moonseeker Potion",
  "Frizzy Bob Cut",
  "Two-toned Layered",
  "Halloween Deathscythe",
  "Moonseeker Hand Puppet",
  "Sweet Devil Horns",
  "Trick and Treat",
  "Jack O'Sweets",
  "Frank Onesie",
  "Research Uniform",
  "Sweet Devil Dress",
  "Underworld Stimpack",
  "Sweet Devil Wings",
  "Wisp Aura",
  "Comfy Xmas Sweater",
  "Comfy Xmas Pants",
  "Candy Halbred",
  "Xmas Top Hat",
  "Reindeer Mask",
  "Snowman Mask",
  "Cool Glasses",
  "Cookie Shield",
  "Holiday Feast Background",
  "Cozy Reindeer Onesie",
  "Diamond Snow Aura",
  "Neon Noiz Jacket",
  "404 Chic Top",
  "Neon Noiz Pants",
  "404 Chic Skirt",
  "Admin Fools Tools",
  "Neon Noiz Shoes",
  "404 Chic Boots",
  "Aether Specs",
  "Faulty Barrier Background",
  "Cardboard Wings",
  "Glitch Aura",
  "Pumpkin Head",
  "Sky Tearer Wings",
  "Bat Aura",
  "Vampire Headwear",
  "Butcher Knife",
  "Skeleton Mask",
  "Vampire Breeches",
  "Scary Nights Background",
  "Vampire Garments",
  "Hook and Chain",
  "Vampire Footwear",
  "Skeleton Costume",
];

export const NEW_WEARABLES = new Set<BumpkinItem>([
  "Sky Tearer Wings",
  "Bat Aura",
  "Vampire Headwear",
  "Butcher Knife",
  "Skeleton Mask",
  "Vampire Breeches",
  "Scary Nights Background",
  "Vampire Garments",
  "Hook and Chain",
  "Vampire Footwear",
  "Skeleton Costume",
]);

export const WEARABLE_BUFFS: Partial<Record<BumpkinItem, WearableBuff>> = {
  "Slime Aura": {
    target: {
      type: "weaponStat",
      weapon: "mossGround",
      stat: "statusDurationMs",
    },
    value: 150,
    descriptionKey: "minigame.wearables.buff.slimeAura",
  },
  "Butterfly Aura": {
    target: { type: "weaponStat", weapon: "flyStorm", stat: "homingSpeed" },
    value: 45,
    descriptionKey: "minigame.wearables.buff.butterflyAura",
  },
  "Wisp Aura": {
    target: { type: "weaponStat", weapon: "poisonVial", stat: "damage" },
    value: 0.85,
    descriptionKey: "minigame.wearables.buff.wispAura",
  },
  "Diamond Snow Aura": {
    target: { type: "weaponStat", weapon: "frostChain", stat: "knockback" },
    value: 25,
    descriptionKey: "minigame.wearables.buff.diamondSnowAura",
  },
  "Glitch Aura": {
    target: { type: "weaponStat", weapon: "bloodKnife", stat: "bounceCount" },
    value: 2,
    descriptionKey: "minigame.wearables.buff.glitchAura",
  },
  "Underworld Stimpack": {
    target: { type: "weaponStat", weapon: "bloodScythe", stat: "cooldownMs" },
    value: -40,
    descriptionKey: "minigame.AbilityDescription",
  },
  "Slime Wings": {
    target: {
      type: "weaponStat",
      weapon: "mossGround",
      stat: "statusDurationMs",
    },
    value: 150,
    descriptionKey: "minigame.wearables.buff.slimeWings",
  },
  "Rainbow Wings": {
    target: { type: "weaponStat", weapon: "darknessBook", stat: "pierce" },
    value: 1,
    descriptionKey: "minigame.wearables.buff.rainbowWings",
  },
  "Sweet Devil Wings": {
    target: { type: "weaponStat", weapon: "frozenSkull", stat: "damage" },
    value: 0.15,
    descriptionKey: "minigame.wearables.buff.sweetDevilWings",
  },
  "Cardboard Wings": {
    target: { type: "weaponStat", weapon: "bloodKnife", stat: "cooldownMs" },
    value: -30,
    descriptionKey: "minigame.wearables.buff.cardboardWings",
  },
  "Slime Wall Background": {
    target: {
      type: "weaponStat",
      weapon: "banishedJackOLantern",
      stat: "pierce",
    },
    value: 5,
    descriptionKey: "minigame.wearables.buff.slimeWallBackground",
  },
  "Holiday Feast Background": {
    target: { type: "weaponStat", weapon: "bloodScythe", stat: "range" },
    value: 4,
    descriptionKey: "minigame.wearables.buff.holidayFeastBackground",
  },
  "Faulty Barrier Background": {
    target: { type: "weaponStat", weapon: "poisonVial", stat: "cooldownMs" },
    value: -40,
    descriptionKey: "minigame.wearables.buff.faultyBarrierBackground",
  },
  "Carrot Pitchfork": {
    target: {
      type: "weaponStat",
      weapon: "poisonVial",
      stat: "projectileSpeed",
    },
    value: 45,
    descriptionKey: "minigame.wearables.buff.carrotPitchfork",
  },
  "Handheld Bunny": {
    target: { type: "weaponStat", weapon: "cursedCoffin", stat: "cooldownMs" },
    value: -60,
    descriptionKey: "minigame.wearables.buff.handheldBunny",
  },
  "Bunny Mask": {
    target: { type: "weaponStat", weapon: "bloodKnife", stat: "cooldownMs" },
    value: -30,
    descriptionKey: "minigame.wearables.buff.bunnyMask",
  },
  "Bunny Pants": {
    target: { type: "weaponStat", weapon: "flyStorm", stat: "hitCooldownMs" },
    value: -20,
    descriptionKey: "minigame.wearables.buff.bunnyPants",
  },
  "Easter Apron": {
    target: { type: "weaponStat", weapon: "poisonVial", stat: "damage" },
    value: 0.85,
    descriptionKey: "minigame.wearables.buff.easterApron",
  },
  "Slime Hat": {
    target: { type: "weaponStat", weapon: "mossGround", stat: "areaRadius" },
    value: 4,
    descriptionKey: "minigame.wearables.buff.slimeHat",
  },
  "Green Slime Hair": {
    target: { type: "weaponStat", weapon: "darknessBook", stat: "damage" },
    value: 0.3,
    descriptionKey: "minigame.wearables.buff.greenSlimeHair",
  },
  "Blue Slime Shirt": {
    target: { type: "weaponStat", weapon: "darknessBook", stat: "pierce" },
    value: 1,
    descriptionKey: "minigame.wearables.buff.blueSlimeShirt",
  },
  "Slime Splattered Shirt": {
    target: { type: "weaponStat", weapon: "mossGround", stat: "dotDamage" },
    value: 0.6,
    descriptionKey: "minigame.wearables.buff.slimeSplatteredShirt",
  },
  "Sad Slime Pants": {
    target: { type: "weaponStat", weapon: "mossGround", stat: "dotTickMs" },
    value: -20,
    descriptionKey: "minigame.wearables.buff.sadSlimePants",
  },
  "Yellow Slime Puppet": {
    target: { type: "weaponStat", weapon: "flyStorm", stat: "range" },
    value: 20,
    descriptionKey: "minigame.wearables.buff.yellowSlimePuppet",
  },
  "Sad Slime Hat": {
    target: { type: "weaponStat", weapon: "bloodKnife", stat: "bounceCount" },
    value: 2,
    descriptionKey: "minigame.wearables.buff.sadSlimeHat",
  },
  "Red Jelly Pants": {
    target: { type: "weaponStat", weapon: "crimsonVial", stat: "dotDamage" },
    value: 0.55,
    descriptionKey: "minigame.wearables.buff.redJellyPants",
  },
  "Blue Jelly Shoes": {
    target: {
      type: "weaponStat",
      weapon: "frostFlower",
      stat: "projectileSpeed",
    },
    value: 60,
    descriptionKey: "minigame.wearables.buff.blueJellyShoes",
  },
  "Sad Slime Slippers": {
    target: { type: "weaponStat", weapon: "darknessBook", stat: "cooldownMs" },
    value: -20,
    descriptionKey: "minigame.wearables.buff.sadSlimeSlippers",
  },
  "Paint Splattered Hair": {
    target: {
      type: "weaponStat",
      weapon: "bloodKnife",
      stat: "projectileSpeed",
    },
    value: 60,
    descriptionKey: "minigame.wearables.buff.paintSplatteredHair",
  },
  "Paint Splattered Shirt": {
    target: { type: "weaponStat", weapon: "poisonVial", stat: "areaRadius" },
    value: 4,
    descriptionKey: "minigame.wearables.buff.paintSplatteredShirt",
  },
  "Paint Splattered Overalls": {
    target: { type: "weaponStat", weapon: "frostFlower", stat: "cooldownMs" },
    value: -20,
    descriptionKey: "minigame.wearables.buff.paintSplatteredOveralls",
  },
  "Paint Spray Can": {
    target: { type: "weaponStat", weapon: "darknessBook", stat: "damage" },
    value: 0.3,
    descriptionKey: "minigame.wearables.buff.paintSprayCan",
  },
  "Moonseeker Potion": {
    target: { type: "weaponStat", weapon: "flyStorm", stat: "damage" },
    value: 0.15,
    descriptionKey: "minigame.wearables.buff.moonseekerPotion",
  },
  "Moonseeker Hand Puppet": {
    target: { type: "weaponStat", weapon: "cursedCoffin", stat: "damage" },
    value: 0.3,
    descriptionKey: "minigame.wearables.buff.moonseekerHandPuppet",
  },
  "Halloween Deathscythe": {
    target: { type: "weaponStat", weapon: "bloodScythe", stat: "range" },
    value: 4,
    descriptionKey: "minigame.wearables.buff.halloweenDeathscythe",
  },
  "Sweet Devil Horns": {
    target: { type: "weaponStat", weapon: "bloodScythe", stat: "damage" },
    value: 0.85,
    descriptionKey: "minigame.wearables.buff.sweetDevilHorns",
  },
  "Sweet Devil Dress": {
    target: { type: "weaponStat", weapon: "crimsonVial", stat: "dotDamage" },
    value: 0.55,
    descriptionKey: "minigame.wearables.buff.sweetDevilDress",
  },
  "Trick and Treat": {
    target: { type: "weaponStat", weapon: "crimsonVial", stat: "cooldownMs" },
    value: -60,
    descriptionKey: "minigame.wearables.buff.trickAndTreat",
  },
  "Jack O'Sweets": {
    target: {
      type: "weaponStat",
      weapon: "banishedJackOLantern",
      stat: "size",
    },
    value: 0.2,
    descriptionKey: "minigame.wearables.buff.jackOSweets",
  },
  "Frank Onesie": {
    target: { type: "weaponStat", weapon: "cursedCoffin", stat: "areaRadius" },
    value: 8,
    descriptionKey: "minigame.wearables.buff.frankOnesie",
  },
  "Comfy Xmas Sweater": {
    target: { type: "weaponStat", weapon: "frostChain", stat: "range" },
    value: 7,
    descriptionKey: "minigame.wearables.buff.comfyXmasSweater",
  },
  "Comfy Xmas Pants": {
    target: { type: "weaponStat", weapon: "frostChain", stat: "damage" },
    value: 2.45,
    descriptionKey: "minigame.wearables.buff.comfyXmasPants",
  },
  "Candy Halbred": {
    target: {
      type: "weaponStat",
      weapon: "banishedJackOLantern",
      stat: "pierce",
    },
    value: 5,
    descriptionKey: "minigame.wearables.buff.candyHalbred",
  },
  "Xmas Top Hat": {
    target: {
      type: "weaponStat",
      weapon: "crimsonVial",
      stat: "statusDurationMs",
    },
    value: 250,
    descriptionKey: "minigame.wearables.buff.xmasTopHat",
  },
  "Reindeer Mask": {
    target: {
      type: "weaponStat",
      weapon: "banishedJackOLantern",
      stat: "size",
    },
    value: 0.2,
    descriptionKey: "minigame.wearables.buff.reindeerMask",
  },
  "Snowman Mask": {
    target: { type: "weaponStat", weapon: "frostChain", stat: "cooldownMs" },
    value: -40,
    descriptionKey: "minigame.wearables.buff.snowmanMask",
  },
  "Cozy Reindeer Onesie": {
    target: { type: "weaponStat", weapon: "frostChain", stat: "damage" },
    value: 2.45,
    descriptionKey: "minigame.wearables.buff.cozyReindeerOnesie",
  },
  "Neon Noiz Jacket": {
    target: { type: "weaponStat", weapon: "flyStorm", stat: "damage" },
    value: 0.15,
    descriptionKey: "minigame.wearables.buff.neonNoizJacket",
  },
  "404 Chic Top": {
    target: {
      type: "weaponStat",
      weapon: "banishedJackOLantern",
      stat: "damage",
    },
    value: 1,
    descriptionKey: "minigame.wearables.buff.404ChicTop",
  },
  "Pumpkin Head": {
    target: {
      type: "weaponStat",
      weapon: "cursedCoffin",
      stat: "projectileSpeed",
    },
    value: 40,
    descriptionKey: "minigame.wearables.buff.pumpkinHead",
  },
  "Neon Noiz Pants": {
    target: { type: "weaponStat", weapon: "frozenSkull", stat: "damage" },
    value: 0.15,
    descriptionKey: "minigame.wearables.buff.neonNoizPants",
  },
  "404 Chic Skirt": {
    target: {
      type: "weaponStat",
      weapon: "frostFlower",
      stat: "projectileSpeed",
    },
    value: 60,
    descriptionKey: "minigame.wearables.buff.404ChicSkirt",
  },
  "Neon Noiz Shoes": {
    target: { type: "weaponStat", weapon: "flyStorm", stat: "hitCooldownMs" },
    value: -20,
    descriptionKey: "minigame.wearables.buff.neonNoizShoes",
  },
  "404 Chic Boots": {
    target: { type: "weaponStat", weapon: "bloodScythe", stat: "cooldownMs" },
    value: -40,
    descriptionKey: "minigame.wearables.buff.404ChicBoots",
  },
  "Frizzy Bob Cut": {
    target: { type: "weaponStat", weapon: "frozenSkull", stat: "orbitRadius" },
    value: 4,
    descriptionKey: "minigame.wearables.buff.frizzyBobCut",
  },
  "Two-toned Layered": {
    target: { type: "weaponStat", weapon: "frostFlower", stat: "cooldownMs" },
    value: -20,
    descriptionKey: "minigame.wearables.buff.twoTonedLayered",
  },
  "Research Uniform": {
    target: {
      type: "weaponStat",
      weapon: "crimsonVial",
      stat: "statusDurationMs",
    },
    value: 250,
    descriptionKey: "minigame.wearables.buff.researchUniform",
  },
  "Cool Glasses": {
    target: { type: "weaponStat", weapon: "frozenSkull", stat: "damage" },
    value: 0.15,
    descriptionKey: "minigame.wearables.buff.coolGlasses",
  },
  "Cookie Shield": {
    target: {
      type: "weaponStat",
      weapon: "frozenSkull",
      stat: "hitCooldownMs",
    },
    value: -10,
    descriptionKey: "minigame.wearables.buff.cookieShield",
  },
  "Admin Fools Tools": {
    target: { type: "weaponStat", weapon: "cursedCoffin", stat: "cooldownMs" },
    value: -60,
    descriptionKey: "minigame.wearables.buff.adminFoolsTools",
  },
  "Aether Specs": {
    target: { type: "weaponStat", weapon: "frostFlower", stat: "cooldownMs" },
    value: -20,
    descriptionKey: "minigame.wearables.buff.aetherSpecs",
  },
  "Hook and Chain": {
    target: { type: "weaponStat", weapon: "frostChain", stat: "range" },
    value: 7,
    descriptionKey: "minigame.wearables.buff.hookAndChain",
  },
  "Skeleton Costume": {
    target: { type: "weaponStat", weapon: "cursedCoffin", stat: "areaRadius" },
    value: 8,
    descriptionKey: "minigame.wearables.buff.skeletonCostume",
  },
  "Vampire Garments": {
    target: { type: "weaponStat", weapon: "crimsonVial", stat: "dotDamage" },
    value: 0.55,
    descriptionKey: "minigame.wearables.buff.vampireGarments",
  },
  "Skeleton Mask": {
    target: {
      type: "weaponStat",
      weapon: "frozenSkull",
      stat: "hitCooldownMs",
    },
    value: -10,
    descriptionKey: "minigame.wearables.buff.skeletonMask",
  },
  "Vampire Headwear": {
    target: { type: "weaponStat", weapon: "bloodScythe", stat: "damage" },
    value: 0.85,
    descriptionKey: "minigame.wearables.buff.vampireHeadwear",
  },
  "Bat Aura": {
    target: { type: "weaponStat", weapon: "darknessBook", stat: "cooldownMs" },
    value: -20,
    descriptionKey: "minigame.wearables.buff.batAura",
  },
  "Sky Tearer Wings": {
    target: { type: "weaponStat", weapon: "poisonVial", stat: "cooldownMs" },
    value: -40,
    descriptionKey: "minigame.wearables.buff.skyTearerWings",
  },
  "Butcher Knife": {
    target: { type: "weaponStat", weapon: "bloodKnife", stat: "damage" },
    value: 0.6,
    descriptionKey: "minigame.wearables.buff.butcherKnife",
  },
  "Vampire Breeches": {
    target: { type: "weaponStat", weapon: "frostFlower", stat: "damage" },
    value: 0.25,
    descriptionKey: "minigame.wearables.buff.vampireBreeches",
  },
  "Vampire Footwear": {
    target: { type: "weaponStat", weapon: "mossGround", stat: "cooldownMs" },
    value: -50,
    descriptionKey: "minigame.wearables.buff.vampireFootwear",
  },
  "Scary Nights Background": {
    target: {
      type: "weaponStat",
      weapon: "banishedJackOLantern",
      stat: "cooldownMs",
    },
    value: -50,
    descriptionKey: "minigame.wearables.buff.scaryNightsBackground",
  },
};

export const getActiveWearableBuffs = (
  activeWearables?: BumpkinParts,
): WearableBuff[] => {
  if (!activeWearables) return [];

  return Object.values(activeWearables).flatMap((wearable) => {
    if (!wearable) return [];

    const buff = WEARABLE_BUFFS[wearable];

    return buff ? [buff] : [];
  });
};

export const getWearableBuffDescriptionKey = (wearable?: BumpkinItem) => {
  if (!wearable) return undefined;

  return WEARABLE_BUFFS[wearable]?.descriptionKey;
};
