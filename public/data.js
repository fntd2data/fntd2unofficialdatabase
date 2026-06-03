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
        endless: ["D", 42],
        obtainability: ["S", 999],
        class: "Early Game",
        subclasses: ["DPS"],
        personalRank: { value: "F", note: "Surprisingly high damage" }
    },
    {
        id: "U002",
        name: "Bonnie",
        rarity: "Uncommon",
        element: "Neutral",
        status: "Stable",
        endless: ["D", 41],
        obtainability: ["S", 998],
        class: "Early Game",
        subclasses: ["DPS"],
        personalRank: { value: "D", note: "Self boost + high dps, you cant get a better uncommon then this" }
    },
    {
        id: "U003",
        name: "Chica",
        rarity: "Uncommon",
        element: "Neutral",
        status: "Stable",
        endless: ["F", 32],
        obtainability: ["S", 997],
        class: "Early Game",
        subclasses: ["DPS"],
        personalRank: { value: "F", note: "Same damage as bonnie but she just sucks" }
    },
    {
        id: "U004",
        name: "Foxy",
        rarity: "Uncommon",
        element: "Neutral",
        status: "Stable",
        endless: ["F", 32],
        obtainability: ["S", 996],
        class: "Early Game",
        subclasses: ["DPS"],
        personalRank: { value: "F", note: "Same damage as bonnie but even worse then chica??" }
    },
    {
        id: "U005",
        name: "Freddy with a glock",
        rarity: "Uncommon",
        element: "Neutral",
        status: "Stable",
        endless: ["D", 42],
        obtainability: ["S", 999],
        class: "Early Game",
        subclasses: ["DPS"],
        personalRank: { value: "F", note: "Just freddy." }
    },

    {
        id: "U006",
        name: "Undead Chica",
        rarity: "Rare",
        element: "Rust",
        status: "Stable",
        endless: ["C", 53, "due to a bug, her summons hit bosses"],
        obtainability: ["B", 999],
        class: "Early Game",
        subclasses: ["Summon"],
        personalRank: { value: "B", note: "Consistent mid hp summons" }
    },
    {
        id: "U007",
        name: "JJ",
        rarity: "Rare",
        element: "Rust",
        status: "Stable",
        endless: ["B", 63, "these results shocked me"],
        obtainability: ["S", 899],
        class: "Early Game",
        subclasses: ["DPS"],
        personalRank: { value: "B", note: "Higher dps + horde control" }
    },
    {
        id: "U008",
        name: "PaperPals",
        rarity: "Rare",
        element: "Rust",
        status: "Stable",
        endless: ["A", 83, "without kaboom byte they suck"],
        obtainability: ["S", 898],
        class: "Early Game",
        subclasses: ["DPS"],
        personalRank: { value: "A", note: "high dps with circle aoe, go for this as your first starter" }
    },
    {
        id: "U009",
        name: "Bidybabs",
        rarity: "Rare",
        element: "Rust",
        status: "Stable",
        endless: ["F", 2, "without kaboom byte they suck"],
        obtainability: ["A", 798],
        class: "Early Game",
        subclasses: ["DPS"],
        personalRank: { value: "C", note: "i believe they can be decent with bytes" }
    },
    {
        id: "U010",
        name: "Nightmare Freddy",
        rarity: "Rare",
        element: "Rust",
        status: "Stable",
        endless: ["F", 2, "without kaboom he sucks"],
        obtainability: ["A", 798],
        class: "Early Game",
        subclasses: ["DPS"],
        personalRank: { value: "C", note: "same like bidybabs, without bytes he will suck" }
    },
    {
        id: "U011",
        name: "Hor Hor Freddy",
        rarity: "Rare",
        element: "Rust",
        status: "Stable",
        endless: ["F", 3, "wow."],
        obtainability: ["F", "cant get him without trading or april fools present"],
        class: "Early Game",
        subclasses: ["DPS"],
        personalRank: { value: "D", note: "can be good, but just sucks at the start of the match, especially on endless 5" }
    },
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
