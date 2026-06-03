const DB_RARITIES = {
    Secret: { color: "linear-gradient(135deg, #d32f2f, #c62828)", index: 1 },
    Mythic: { color: "linear-gradient(135deg, #ffd54f, #ffb74d)", index: 2 },
    Epic: { color: "linear-gradient(135deg, #ba68c8, #ab47bc)", index: 4 },
    Rare: { color: "linear-gradient(135deg, #64b5f6, #42a5f5)", index: 5 },
    Uncommon: { color: "linear-gradient(135deg, #81c784, #66bb6a)", index: 6 }
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
        class: "Early Game",
        subclasses: ["DPS"],
        synergy: "Neutral",
        element: "Neutral",
        placementCost: 250,
        placementLimit: 5,
        status: "Stable",
        image: "",
        endlessPlacement: "3",
        synergyPlacement: "2",
        obtainabilityPlacement: "4",
        personalRank: {
            value: "B",
            note: "Solid early game defender with low cost."
        }
    },
    {
        id: "U002",
        name: "Bonnie",
        rarity: "Rare",
        class: "Early Game",
        subclasses: ["DPS", "Support"],
        synergy: "Dark",
        element: "Dark",
        placementCost: 350,
        placementLimit: 5,
        status: "Rising",
        image: "",
        endlessPlacement: "6",
        synergyPlacement: "4",
        obtainabilityPlacement: "8",
        personalRank: {
            value: "B",
            note: "Amazing DPS capabilities alongside supportive aura."
        }
    },
    {
        id: "U003",
        name: "Chica",
        rarity: "Rare",
        class: "Mid Game",
        subclasses: ["Healer"],
        synergy: "Nature",
        element: "Nature",
        placementCost: 400,
        placementLimit: 4,
        status: "Stable",
        image: "",
        endlessPlacement: "9",
        synergyPlacement: "6",
        obtainabilityPlacement: "12",
        personalRank: {
            value: "B",
            note: "Decent healer, especially useful on tough maps."
        }
    },
    {
        id: "U004",
        name: "Foxy",
        rarity: "Epic",
        class: "Mid Game",
        subclasses: ["DPS", "Speed"],
        synergy: "Electricity",
        element: "Electricity",
        placementCost: 650,
        placementLimit: 3,
        status: "Stable",
        image: "",
        endlessPlacement: "12",
        synergyPlacement: "8",
        obtainabilityPlacement: "16",
        personalRank: {
            value: "A",
            note: "Incredible attack speed scaling! Must have for endless tours."
        }
    },
    {
        id: "U005",
        name: "Freddy with a Glock",
        rarity: "Secret",
        class: "End Game",
        subclasses: ["DPS"],
        synergy: "Dark",
        element: "Dark",
        placementCost: 1500,
        placementLimit: 2,
        status: "Rising",
        image: "",
        endlessPlacement: "15",
        synergyPlacement: "10",
        obtainabilityPlacement: "20",
        personalRank: {
            value: "S",
            note: "Absolute beast. Ultimate end game DPS that takes out boss waves."
        }
    },
    {
        id: "U006",
        name: "JJ",
        rarity: "Rare",
        class: "Early Game",
        subclasses: ["Support"],
        synergy: "Electricity",
        element: "Electricity",
        placementCost: 300,
        placementLimit: 4,
        status: "Stable",
        image: "",
        endlessPlacement: "18",
        synergyPlacement: "12",
        obtainabilityPlacement: "24",
        personalRank: {
            value: "B",
            note: "Useful utility on early wave structures."
        }
    },
    {
        id: "U007",
        name: "Paperpals",
        rarity: "Mythic",
        class: "Mid Game",
        subclasses: ["Support"],
        synergy: "Nature",
        element: "Nature",
        placementCost: 800,
        placementLimit: 2,
        status: "Stable",
        image: "",
        endlessPlacement: "21",
        synergyPlacement: "14",
        obtainabilityPlacement: "28",
        personalRank: {
            value: "A",
            note: "Great synergy support buff matrix."
        }
    },
    {
        id: "U008",
        name: "Hor Hor Freddy",
        rarity: "Mythic",
        class: "End Game",
        subclasses: ["DPS"],
        synergy: "Fire",
        element: "Fire",
        placementCost: 1200,
        placementLimit: 3,
        status: "Rising",
        image: "",
        endlessPlacement: "24",
        synergyPlacement: "16",
        obtainabilityPlacement: "32",
        personalRank: {
            value: "A",
            note: "Huge single-hit fire output."
        }
    },
    {
        id: "U009",
        name: "Undead Chica",
        rarity: "Epic",
        class: "Mid Game",
        subclasses: ["DPS"],
        synergy: "Rust",
        element: "Rust",
        placementCost: 550,
        placementLimit: 5,
        status: "Stable",
        image: "",
        endlessPlacement: "27",
        synergyPlacement: "18",
        obtainabilityPlacement: "36",
        personalRank: {
            value: "B",
            note: "Stat reductions are helpful vs high-armor enemies."
        }
    },
    {
        id: "U010",
        name: "Gilded Freddy",
        canon: false,
        rarity: "Secret",
        class: "End Game",
        subclasses: ["DPS"],
        synergy: "Light",
        element: "Light",
        placementCost: 1700,
        placementLimit: 1,
        status: "Rising",
        image: "",
        endlessPlacement: "2",
        synergyPlacement: "2",
        obtainabilityPlacement: "40",
        personalRank: {
            value: "S",
            note: "Summons gilded constructs that melt waves instantly."
        }
    },
    {
        id: "U011",
        name: "Springtrap",
        rarity: "Mythic",
        class: "End Game",
        subclasses: ["DPS"],
        synergy: "Fire",
        element: "Fire",
        placementCost: 1400,
        placementLimit: 2,
        status: "Stable",
        image: "",
        endlessPlacement: "5",
        synergyPlacement: "4",
        obtainabilityPlacement: "44",
        personalRank: {
            value: "A",
            note: "Passive burning aura and high single-target scaling."
        }
    },
    {
        id: "U012",
        name: "Golden Freddy",
        rarity: "Mythic",
        class: "Mid Game",
        subclasses: ["Support"],
        synergy: "Light",
        element: "Light",
        placementCost: 1100,
        placementLimit: 2,
        status: "Rising",
        image: "",
        endlessPlacement: "8",
        synergyPlacement: "3",
        obtainabilityPlacement: "48",
        personalRank: {
            value: "S",
            note: "Locks down enemies with high-priority stun triggers."
        }
    },
    {
        id: "U013",
        name: "Shadow Bonnie",
        rarity: "Epic",
        class: "Mid Game",
        subclasses: ["DPS", "Support"],
        synergy: "Dark",
        element: "Dark",
        placementCost: 850,
        placementLimit: 3,
        status: "Stable",
        image: "",
        endlessPlacement: "11",
        synergyPlacement: "5",
        obtainabilityPlacement: "52",
        personalRank: {
            value: "A",
            note: "Creates deep shadows that debuff enemy standard speed."
        }
    },
    {
        id: "U014",
        name: "Toy Freddy",
        rarity: "Rare",
        class: "Early Game",
        subclasses: ["DPS"],
        synergy: "Neutral",
        element: "Neutral",
        placementCost: 300,
        placementLimit: 5,
        status: "Stable",
        image: "",
        endlessPlacement: "14",
        synergyPlacement: "20",
        obtainabilityPlacement: "56",
        personalRank: {
            value: "B",
            note: "Very steady DPS with comfortable initial path costs."
        }
    },
    {
        id: "U015",
        name: "Toy Chica",
        rarity: "Rare",
        class: "Early Game",
        subclasses: ["Support"],
        synergy: "Nature",
        element: "Nature",
        placementCost: 280,
        placementLimit: 4,
        status: "Stable",
        image: "",
        endlessPlacement: "17",
        synergyPlacement: "22",
        obtainabilityPlacement: "60",
        personalRank: {
            value: "B",
            note: "Provides range boosts to early deployment arrays."
        }
    },
    {
        id: "U016",
        name: "Toy Bonnie",
        rarity: "Rare",
        class: "Early Game",
        subclasses: ["DPS", "Speed"],
        synergy: "Electricity",
        element: "Electricity",
        placementCost: 320,
        placementLimit: 5,
        status: "Stable",
        image: "",
        endlessPlacement: "20",
        synergyPlacement: "24",
        obtainabilityPlacement: "64",
        personalRank: {
            value: "B",
            note: "Fast charge bursts perfect for running targets."
        }
    },
    {
        id: "U017",
        name: "Marionette",
        rarity: "Epic",
        class: "Mid Game",
        subclasses: ["Support"],
        synergy: "Light",
        element: "Light",
        placementCost: 900,
        placementLimit: 4,
        status: "Stable",
        image: "",
        endlessPlacement: "23",
        synergyPlacement: "26",
        obtainabilityPlacement: "68",
        personalRank: {
            value: "A",
            note: "Maintains strong music box aura that slows massive bosses."
        }
    },
    {
        id: "U018",
        name: "Balloon Boy",
        rarity: "Uncommon",
        class: "Early Game",
        subclasses: ["Support"],
        synergy: "Nature",
        element: "Nature",
        placementCost: 200,
        placementLimit: 4,
        status: "Stable",
        image: "",
        endlessPlacement: "26",
        synergyPlacement: "28",
        obtainabilityPlacement: "72",
        personalRank: {
            value: "C",
            note: "Incredibly funny, disables regular targets temporarily."
        }
    },
    {
        id: "U019",
        name: "Withered Foxy",
        rarity: "Epic",
        class: "Mid Game",
        subclasses: ["DPS", "Speed"],
        synergy: "Electricity",
        element: "Electricity",
        placementCost: 750,
        placementLimit: 4,
        status: "Rising",
        image: "",
        endlessPlacement: "29",
        synergyPlacement: "30",
        obtainabilityPlacement: "76",
        personalRank: {
            value: "A",
            note: "Charges across the maps with intense initial strike speed."
        }
    },
    {
        id: "U020",
        name: "Circus Baby",
        rarity: "Mythic",
        class: "End Game",
        subclasses: ["DPS"],
        synergy: "Rust",
        element: "Rust",
        placementCost: 1300,
        placementLimit: 3,
        status: "Stable",
        image: "",
        endlessPlacement: "32",
        synergyPlacement: "32",
        obtainabilityPlacement: "80",
        personalRank: {
            value: "S",
            note: "Giant mechanical claw damage sweep."
        }
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
