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

const DB_UNITS = [{
    id: "U001",
    name: "Freddy",
    rarity: "Uncommon",
    class: "Early Game",
    subclasses: ["DPS"],
    synergy: "Any",
    placementCost: 250,
    placementLimit: 5,
    element: "Neutral",
    soulValue: 500,
    value: "N/A",
    demand: "N/A",
    status: "N/A",
    image: "",
    imageSourceUrl: "https://fntd2.com/database/units?=freddy",
    officialPageSlug: "freddy",
    endlessRank: "N/A",
    endlessPlacement: "N/A",
    synergyRank: "N/A",
    synergyPlacement: "N/A",
    obtainabilityRank: "N/A",
    obtainabilityPlacement: "N/A",
    personalRank: { value: "N/A", note: "No explanation provided." },
    overallRank: "N/A",
    computedRank: "High F"
}];

const DB_ENEMIES = [];

const ALL_RANKS = ["S", "A", "B", "C", "D", "F"];
const ALL_CLASSES = [...new Set(DB_UNITS.map((u) => u.class))];
const ALL_SUBCLASSES = [...new Set(DB_UNITS.flatMap((u) => u.subclasses || []))];
const ALL_SYNERGIES = [...new Set(DB_UNITS.map((u) => u.synergy))];

function assignDynamicRankSubTiers() {
    ALL_RANKS.forEach((rank) => {
        const bucket = DB_UNITS
            .filter((unit) => unit.rank === rank || unit.endlessRank === rank)
            .sort((a, b) => (Number(a.rankedId) || 0) - (Number(b.rankedId) || 0));
        const total = bucket.length;
        let slice = Math.floor(total * 0.25);
        if (slice === 0 && total > 0) slice = 1;
        bucket.forEach((unit, index) => {
            if (index < slice) unit.computedRank = `High ${rank}`;
            else if (index >= total - slice && slice > 0) unit.computedRank = `Low ${rank}`;
            else unit.computedRank = `Mid ${rank}`;
        });
    });
}
assignDynamicRankSubTiers();

(function syncStorage() {
    try {
        localStorage.setItem("fntd2_clean_units_sync", JSON.stringify(DB_UNITS));
        window.getCleanDBUnits = () => DB_UNITS;
    } catch (error) {
        console.warn("Could not sync storage.", error);
    }
})();
