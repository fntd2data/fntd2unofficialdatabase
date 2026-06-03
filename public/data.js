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
        endless: ["D", 4, "can work pretty good", "but he cant get enough damage to beat the wave 40 boss"],
        synergyPl: ["B", 2, "TBA"],
        obtainability: ["S", 999],
        class: "Early Game",
        subclasses: ["DPS"],
        personalRank: { value: "F", note: "He is just bad. atleast hes basically free" }
    },
    {
        id: "U002",
        name: "Bonnie",
        rarity: "Uncommon",
        element: "Neutral",
        status: "Stable",
        endless: ["D", 41, "can work pretty good", "but he cant get enough damage to beat the wave 40 boss"],
        synergyPl: ["B", 2, "TBA"],
        obtainability: ["S", 998],
        class: "Early Game",
        subclasses: ["DPS"],
        personalRank: { value: "D", note: "Overall a good starter" }
    },
    {
        id: "U003",
        name: "Chica",
        rarity: "Uncommon",
        element: "Neutral",
        status: "Stable",
        endless: ["F", 32, "can work", "gets replaced with other starters"],
        synergyPl: ["B", 2, "TBA"],
        obtainability: ["S", 997],
        class: "Early Game",
        subclasses: ["DPS"],
        personalRank: { value: "F", note: "I would use her as a last resort" }
    },
    {
        id: "U004",
        name: "Foxy",
        rarity: "Uncommon",
        element: "Neutral",
        status: "Stable",
        endless: ["F", 32, "can work", "gets replaced with other starters"],
        synergyPl: ["B", 2, "TBA"],
        obtainability: ["S", 996],
        class: "Early Game",
        subclasses: ["DPS"],
        personalRank: { value: "F", note: "I would use him as a last resort" }
    },
    {
        id: "U001",
        name: "Freddy with a glock",
        rarity: "Uncommon",
        element: "Neutral",
        status: "Stable",
        endless: ["D", 4, "can work pretty good", "but he cant get enough damage to beat the wave 40 boss"],
        synergyPl: ["B", 2, "TBA"],
        obtainability: ["S", 999],
        class: "Early Game",
        subclasses: ["DPS"],
        personalRank: { value: "F", note: "He is just bad. never though adding a gun would make him equal to his normal version" }
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
