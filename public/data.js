const DB_RARITIES = {
    Hero: { color: "linear-gradient(135deg, #877622, #9c831f, #877622)", index: 1 },
    Exclusive: { color: "linear-gradient(135deg, #1e9b84, #1fb3b9, #1e9b84)", index: 2 },
    Apex: { color: "linear-gradient(135deg, #d32f94, #8c28c6)", index: 3 },
    Nightmare: { color: "linear-gradient(135deg, #2d182b, #573b54)", index: 4 },
    Secret: { color: "linear-gradient(135deg, #bb0000, #ff0000)", index: 5 },
    Mythical: { color: "linear-gradient(135deg, #ffd54f, #ffb74d)", index: 6 },
    Epic: { color: "linear-gradient(135deg, #ba68c8, #ab47bc)", index: 7 },
    Rare: { color: "linear-gradient(135deg, #64b5f6, #42a5f5)", index: 8 },
    Uncommon: { color: "linear-gradient(135deg, #81c784, #66bb6a)", index: 9 }
};

const DB_ELEMENTS = {
    Fire: { passiveUnit: "applies burn for 3% per second", passiveEnemy: "-6% damage from burn effects" },
    Water: { passiveUnit: "+3% range to other units in range", passiveEnemy: "-30% movespeed, immune to slows" },
    Nature: { passiveUnit: "+1 stock to base", passiveEnemy: "5% regen/s to enemies with a 4stud range" },
    Neutral: { passiveUnit: "+3% for all stats", passiveEnemy: "take 15% less damage" },
    Electricity: { passiveUnit: "-2% cooldown to other units in range", passiveEnemy: "15% faster movement speed" },
    Rust: { passiveUnit: "-3% cooldown, +6% damage", passiveEnemy: "-15% movespeed, +20% hp" },
    Dark: { passiveUnit: "+3% damage", passiveEnemy: "15% more damage to base" },
    Light: { passiveUnit: "-3% cooldown", passiveEnemy: "-35% stun duration" }
};

const DB_ENCHANTS = {
    None: { dmgMod: 1.0, rangeMod: 1.0, cdMod: 1.0 }
};

const DB_UNITS = [
    {
        id: "U001",
        name: "Freddy",
        rarity: "Uncommon",
        element: "Neutral",
        status: "Stable",
        endless: ["C", 3, "Essential early defense", "Low cost allows rapid setup"],
        synergyPl: ["C", 2, "Works with almost any neutral setup"],
        obtainability: ["C", 4],
        class: "Early Game",
        subclasses: ["DPS"],
        personalRank: { value: "B", note: "Solid early game defender with low cost." }
    },
    {
        id: "U002",
        name: "Bonnie",
        rarity: "Rare",
        element: "Dark",
        status: "Rising",
        endless: ["B", 6, "Excellent wave clear", "Provides massive early DPS spike"],
        synergyPl: ["B", 4, "Strong in dark-focused teams"],
        obtainability: ["B", 8],
        class: "Early Game",
        subclasses: ["DPS", "Support"],
        personalRank: { value: "B", note: "Amazing DPS capabilities alongside supportive aura." }
    },
    {
        id: "U003",
        name: "Chica",
        rarity: "Rare",
        element: "Nature",
        status: "Stable",
        endless: ["B", 9, "Sustainable healing for mid-game transitions"],
        synergyPl: ["B", 6, "Essential for Nature health pools"],
        obtainability: ["B", 12],
        class: "Mid Game",
        subclasses: ["Healer"],
        personalRank: { value: "B", note: "Decent healer, especially useful on tough maps." }
    },
    {
        id: "U004",
        name: "Foxy",
        rarity: "Epic",
        element: "Electricity",
        status: "Stable",
        endless: ["A", 12, "Top-tier speed scaling", "Crucial for fast-moving boss waves"],
        synergyPl: ["A", 8, "Dominates in rush-down setups"],
        obtainability: ["A", 16],
        class: "Mid Game",
        subclasses: ["DPS", "Speed"],
        personalRank: { value: "A", note: "Incredible attack speed scaling! Must have for endless tours." }
    },
    {
        id: "U005",
        name: "Freddy with a Glock",
        rarity: "Secret",
        element: "Dark",
        placementCost: 2000,
        placementLimit: 1,
        status: "Rising",
        endless: ["S", 15],
        synergyPl: ["S", 10],
        obtainability: ["S", 20],
        class: "End Game",
        subclasses: ["DPS"],
        personalRank: { value: "S", note: "Absolute beast. Ultimate end game DPS that takes out boss waves." }
    },
    {
        id: "U006",
        name: "JJ",
        rarity: "Rare",
        element: "Electricity",
        status: "Stable",
        endless: ["B", 18, "Disrupts early enemy flow", "Cheap stun/slow utility"],
        synergyPl: ["B", 12],
        obtainability: ["B", 24],
        class: "Early Game",
        subclasses: ["Support"],
        personalRank: { value: "B", note: "Useful utility on early wave structures." }
    },
    {
        id: "U007",
        name: "Paperpals",
        rarity: "Mythical",
        element: "Nature",
        status: "Stable",
        endless: ["A", 21, "Massive range buff radius", "Links multiple mid-game defenders"],
        synergyPl: ["A", 14, "Essential for Nature health pools"],
        obtainability: ["A", 28],
        class: "Mid Game",
        subclasses: ["Support"],
        personalRank: { value: "A", note: "Great synergy support buff matrix." }
    },
    {
        id: "U008",
        name: "Hor Hor Freddy",
        rarity: "Mythical",
        element: "Fire",
        status: "Rising",
        endless: ["A", 24, "Lingering burn patches", "Great for corridor defense"],
        synergyPl: ["A", 16],
        obtainability: ["A", 32],
        class: "End Game",
        subclasses: ["DPS"],
        personalRank: { value: "A", note: "Huge single-hit fire output." }
    },
    {
        id: "U009",
        name: "Undead Chica",
        rarity: "Epic",
        element: "Rust",
        status: "Stable",
        endless: ["B", 27, "High armor reduction on hit", "Softens up huge tanks"],
        synergyPl: ["B", 18],
        obtainability: ["B", 36],
        class: "Mid Game",
        subclasses: ["DPS"],
        personalRank: { value: "B", note: "Stat reductions are helpful vs high-armor enemies." }
    },
    {
        id: "U010",
        name: "Gilded Freddy",
        rarity: "Secret",
        element: "Light",
        status: "Rising",
        canon: false,
        endless: ["S", 2, "Unrivaled gold scaling", "Constructs provide infinite stall"],
        synergyPl: ["S", 2],
        obtainability: ["S", 40],
        class: "End Game",
        subclasses: ["DPS"],
        personalRank: { value: "S", note: "Summons gilded constructs that melt waves instantly." }
    },
    {
        id: "U011",
        name: "Springtrap",
        rarity: "Mythical",
        element: "Fire",
        status: "Stable",
        endless: ["A", 5, "Continuous fire spray", "Static defense king"],
        synergyPl: ["A", 4],
        obtainability: ["A", 44],
        class: "End Game",
        subclasses: ["DPS"],
        personalRank: { value: "A", note: "Passive burning aura and high single-target scaling." }
    },
    {
        id: "U012",
        name: "Golden Freddy",
        rarity: "Mythical",
        element: "Light",
        status: "Rising",
        endless: ["S", 8, "High frequency stuns", "Stops boss movement dead"],
        synergyPl: ["S", 3],
        obtainability: ["S", 48],
        class: "Mid Game",
        subclasses: ["Support"],
        personalRank: { value: "S", note: "Locks down enemies with high-priority stun triggers." }
    },
    {
        id: "U013",
        name: "Shadow Bonnie",
        rarity: "Epic",
        element: "Dark",
        status: "Stable",
        endless: ["A", 11, "Global speed debuff aura", "Increases team reaction window"],
        synergyPl: ["A", 5],
        obtainability: ["A", 52],
        class: "Mid Game",
        subclasses: ["DPS", "Support"],
        personalRank: { value: "A", note: "Creates deep shadows that debuff enemy standard speed." }
    },
    {
        id: "U014",
        name: "Toy Freddy",
        rarity: "Rare",
        element: "Neutral",
        status: "Stable",
        endless: ["B", 14, "Robust early health check", "Stays relevant until late-mid game"],
        synergyPl: ["B", 20],
        obtainability: ["B", 56],
        class: "Early Game",
        subclasses: ["DPS"],
        personalRank: { value: "B", note: "Very steady DPS with comfortable initial path costs." }
    },
    {
        id: "U015",
        name: "Toy Chica",
        rarity: "Rare",
        element: "Nature",
        status: "Stable",
        endless: ["B", 17, "Area denial via vines", "Clusters enemies for AoE DPS"],
        synergyPl: ["B", 22],
        obtainability: ["B", 60],
        class: "Early Game",
        subclasses: ["Support"],
        personalRank: { value: "B", note: "Provides range boosts to early deployment arrays." }
    },
    {
        id: "U016",
        name: "Toy Bonnie",
        rarity: "Rare",
        element: "Electricity",
        status: "Stable",
        endless: ["B", 20, "High impact electrical pulses"],
        synergyPl: ["B", 24],
        obtainability: ["B", 64],
        class: "Early Game",
        subclasses: ["DPS", "Speed"],
        personalRank: { value: "B", note: "Fast charge bursts perfect for running targets." }
    },
    {
        id: "U017",
        name: "Marionette",
        rarity: "Epic",
        element: "Light",
        placementCost: 800,
        placementLimit: 3,
        status: "Stable",
        endless: ["A", 23],
        synergyPl: ["A", 26],
        obtainability: ["A", 68],
        class: "Mid Game",
        subclasses: ["Support"],
        personalRank: { value: "A", note: "Maintains strong music box aura that slows massive bosses." }
    },
    {
        id: "U018",
        name: "Balloon Boy",
        rarity: "Uncommon",
        element: "Nature",
        status: "Stable",
        endless: ["C", 26, "Incredibly funny", "Disables regular targets temporarily"],
        synergyPl: ["C", 28],
        obtainability: ["C", 72],
        class: "Early Game",
        subclasses: ["Support"],
        personalRank: { value: "C", note: "Incredibly funny, disables regular targets temporarily." }
    },
    {
        id: "U019",
        name: "Withered Foxy",
        rarity: "Epic",
        element: "Electricity",
        status: "Rising",
        endless: ["A", 29, "Charges with intense initial strike speed"],
        synergyPl: ["A", 30],
        obtainability: ["A", 76],
        class: "Mid Game",
        subclasses: ["DPS", "Speed"],
        personalRank: { value: "A", note: "Charges across the maps with intense initial strike speed." }
    },
    {
        id: "U020",
        name: "Circus Baby",
        rarity: "Mythical",
        element: "Rust",
        status: "Stable",
        endless: ["S", 32, "Giant mechanical claw damage sweep"],
        synergyPl: ["S", 32],
        obtainability: ["S", 80],
        class: "End Game",
        subclasses: ["DPS"],
        personalRank: { value: "S", note: "Giant mechanical claw damage sweep." }
    }
];

const DB_ENEMIES = [];

const ALL_RANKS = ["S", "A", "B", "C", "D", "F"];
const ALL_CLASSES = [...new Set(DB_UNITS.map((u) => u.class))];
const ALL_SUBCLASSES = [...new Set(DB_UNITS.flatMap((u) => u.subclasses || []))];
const ALL_SYNERGIES = [...new Set(DB_UNITS.map((u) => u.synergy))];

(function syncStorage() {
    try {
        localStorage.setItem("fntd2_clean_units_sync", JSON.stringify(DB_UNITS));
        window.getCleanDBUnits = () => DB_UNITS;
    } catch (error) {
        console.warn("Could not sync storage.", error);
    }
})();
