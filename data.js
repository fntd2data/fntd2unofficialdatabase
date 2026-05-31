// Static Decoupled Operational Databank Matrix Array Payload Definition Objects

const DB_RARITIES = {
    "Secret": { color: "linear-gradient(135deg, #d32f2f, #c62828)", index: 1 },
    "Mythic": { color: "linear-gradient(135deg, #ffd54f, #ffb74d)", index: 2 },
    "Epic": { color: "linear-gradient(135deg, #ba68c8, #ab47bc)", index: 4 },
    "Rare": { color: "linear-gradient(135deg, #64b5f6, #42a5f5)", index: 5 },
    "Uncommon": { color: "linear-gradient(135deg, #81c784, #66bb6a)", index: 6 },
};

const DB_ELEMENTS = {
    "Fire": { passiveUnit: "applies burn for 3% per second", passiveEnemy: "-6% damage from burn effects" },
    "Water": { passiveUnit: "+3% range to other units in range", passiveEnemy: "-30% movespeed, immune to slows" },
    "Nature": { passiveUnit: "+1 stock to base", passiveEnemy: "5% regen/s to enemies with a 4stud range" },
    "Neutral": { passiveUnit: "+3% for all stats", passiveEnemy: "take 15% less damage" },
    "Electricity": { passiveUnit: "-2% cooldown to other units in range", passiveEnemy: "15% faster movement speed" },
    "Rust": { passiveUnit: "-3% cooldown, +6% damage", passiveEnemy: "-15% movespeed, +20% hp" },
    "Dark": { passiveUnit: "+3% damage", passiveEnemy: "15% more damage to base" },
    "Light": { passiveUnit: "-3% cooldown", passiveEnemy: "-35% stun duration" }
};

const DB_ENCHANTS = {
    "None": { dmgMod: 1.0, rangeMod: 1.0, cdMod: 1.0 },
};

const DB_UNITS = [
  {
    "id": "U001",
    "name": "Freddy",
    "rarity": "Uncommon",
    "class": "Early Game",
    "subclasses": [
      "DPS"
    ],
    "synergy": "Any",
    "placementCost": 250,
    "placementLimit": 5,
    "obtainments": [
      {
        "source": "Wave 1",
        "chance": 100,
        "method": "Guaranteed"
      },
      {
        "source": "Early Chest",
        "chance": 30,
        "method": "Random Drop"
      }
    ],
    "aliases": [],
    "damage": [
      36.5,
      52.1
    ],
    "range": [
      20.6,
      28.4
    ],
    "cooldown": [
      2.43,
      1.94
    ],
    "element": "Neutral",
    "passives": [
      {
        "name": "Hat Toss",
        "desc": "applies bleed for 1s = 10% of his damage every 5 attacks"
      }
    ],
    "abilities": [],
    "image": "",
    "rank": "F",
    "rankedId": 9800,
    "rankedWave": 33,
    "computedRank": "High F"
  },
  {
    "id": "U002",
    "name": "Bonnie",
    "rarity": "Uncommon",
    "class": "Early Game",
    "subclasses": [
      "DPS"
    ],
    "synergy": "Any",
    "placementCost": 375,
    "placementLimit": 4,
    "obtainments": [
      {
        "source": "Wave 1",
        "chance": 100,
        "method": "Guaranteed"
      },
      {
        "source": "Mid Chest",
        "chance": 20,
        "method": "Random Drop"
      }
    ],
    "aliases": [],
    "damage": [
      27.6,
      35.4
    ],
    "range": [
      25,
      35
    ],
    "cooldown": [
      2.5,
      1.5
    ],
    "element": "Electricity",
    "passives": [
      {
        "name": "Guitar Solo",
        "desc": "every 15 seconds, boosts his stats by 10% for 5s"
      }
    ],
    "abilities": [],
    "image": "",
    "rank": "F",
    "rankedId": 9950,
    "rankedWave": 33,
    "computedRank": "Mid F"
  },
  {
    "id": "U003",
    "name": "Chica",
    "rarity": "Uncommon",
    "class": "Early Game",
    "subclasses": [
      "DPS"
    ],
    "synergy": "Any",
    "placementCost": 300,
    "placementLimit": 4,
    "obtainments": [
      {
        "source": "Wave 1",
        "chance": 100,
        "method": "Guaranteed"
      }
    ],
    "aliases": [],
    "damage": [
      25.3,
      35.4
    ],
    "range": [
      15,
      25
    ],
    "cooldown": [
      2,
      1.5
    ],
    "element": "Fire",
    "passives": [
      {
        "name": "Specialty Cupcake",
        "desc": "every 5 attacks applies burn for 1s = 10% damage"
      }
    ],
    "abilities": [],
    "image": "",
    "rank": "F",
    "rankedId": 9999,
    "rankedWave": 26,
    "computedRank": "Low F"
  },
  {
    "id": "U004",
    "name": "Foxy",
    "rarity": "Uncommon",
    "class": "Early Game",
    "subclasses": [
      "DPS"
    ],
    "synergy": "Any",
    "placementCost": 300,
    "placementLimit": 3,
    "obtainments": [
      {
        "source": "Wave 1",
        "chance": 100,
        "method": "Guaranteed"
      }
    ],
    "aliases": [],
    "damage": [
      25.3,
      35.4
    ],
    "range": [
      11.3,
      16
    ],
    "cooldown": [
      2,
      1.5
    ],
    "element": "Water",
    "passives": [
      {
        "name": "Right Hook",
        "desc": "every 6 attacks deals 25% damage"
      }
    ],
    "abilities": [],
    "image": "",
    "rank": "F",
    "rankedId": 9980,
    "rankedWave": 26,
    "computedRank": "Mid F"
  },
  {
    "id": "U005",
    "name": "Freddy with a Glock",
    "rarity": "Uncommon",
    "class": "Early Game",
    "subclasses": [
      "DPS"
    ],
    "synergy": "Any",
    "placementCost": 250,
    "placementLimit": 2,
    "obtainments": [
      {
        "source": "Wave 1",
        "chance": 50,
        "method": "Random"
      }
    ],
    "aliases": [
      "U001"
    ],
    "damage": [
      36.5,
      52.1
    ],
    "range": [
      20.6,
      28.4
    ],
    "cooldown": [
      2.43,
      1.94
    ],
    "element": "Neutral",
    "passives": [],
    "abilities": [],
    "image": "",
    "rank": "F",
    "rankedId": 9820,
    "rankedWave": 33,
    "computedRank": "Mid F"
  },
  {
    "id": "U006",
    "name": "JJ",
    "rarity": "Rare",
    "class": "Early Game",
    "subclasses": [
      "DPS"
    ],
    "synergy": "Any",
    "placementCost": 500,
    "placementLimit": 3,
    "obtainments": [
      {
        "source": "Legacy",
        "chance": 100,
        "method": "Available from Wave 5"
      }
    ],
    "aliases": [],
    "damage": [
      60.7,
      101.1
    ],
    "range": [
      20,
      30.7
    ],
    "cooldown": [
      1.94,
      1.46
    ],
    "element": "Light",
    "passives": [
      {
        "name": "Megalomaniac",
        "desc": "+0.1% range per enemy killed, capped at 10%"
      }
    ],
    "abilities": [],
    "image": "",
    "rank": "D",
    "rankedId": 9750,
    "rankedWave": 33,
    "computedRank": "Mid D"
  },
  {
    "id": "U007",
    "name": "Paperpals",
    "rarity": "Rare",
    "class": "Early Game",
    "subclasses": [
      "DPS"
    ],
    "synergy": "Any",
    "placementCost": 450,
    "placementLimit": 2,
    "obtainments": [
      {
        "source": "Legacy",
        "chance": 100,
        "method": "Available from Wave 10"
      }
    ],
    "damage": [
      104.1,
      171.1
    ],
    "range": [
      24.8,
      30.9
    ],
    "cooldown": [
      2.43,
      1.94
    ],
    "element": "Neutral",
    "passives": [
      {
        "name": "Paper cuts",
        "desc": "attacks apply bleed for 1s = 5% of their damage"
      }
    ],
    "abilities": [],
    "image": "",
    "rank": "D",
    "rankedId": 9675,
    "rankedWave": 43,
    "computedRank": "High D",
    "aliases": []
  },
  {
    "id": "U008",
    "name": "Hor Hor Freddy",
    "rarity": "Rare",
    "class": "Early Game",
    "subclasses": [
      "DPS"
    ],
    "synergy": "Any",
    "placementCost": 750,
    "placementLimit": 1,
    "obtainments": [
      {
        "source": "Present",
        "chance": 0,
        "method": "April Fools Present"
      }
    ],
    "aliases": [],
    "damage": [
      72.9,
      150.9
    ],
    "range": [
      18.6,
      25.8
    ],
    "cooldown": [
      2.53,
      2.24
    ],
    "element": "Neutral",
    "passives": [
      {
        "name": "Hor Hor",
        "desc": "every 3 attacks i spin and i do like attacks"
      }
    ],
    "abilities": [],
    "image": "",
    "rank": "F",
    "rankedId": 9830,
    "rankedWave": 33
  },
  {
    "id": "U009",
    "name": "Undead Chica",
    "rarity": "Rare",
    "class": "Early Game",
    "subclasses": [
      "DPS"
    ],
    "synergy": "Any",
    "placementCost": 600,
    "placementLimit": 3,
    "obtainments": [
      {
        "source": "Summon",
        "chance": 50,
        "method": "Soul Summon"
      }
    ],
    "aliases": [],
    "damage": [
      269.3,
      358.5
    ],
    "range": [
      0.01,
      0.01
    ],
    "cooldown": [
      2.58,
      2.06
    ],
    "element": "Rust",
    "passives": [
      {
        "name": "Overwhelming Horde",
        "desc": "this unit gains 1% damage per summon on the map (capped at 10%)"
      }
    ],
    "abilities": [],
    "image": "",
    "rank": "D",
    "rankedId": 9790,
    "rankedWave": 33
  }
];

const DB_ENEMIES = [
    { name: "Endo Crawler", hp: 450, speed: "Fast", traits: "Flips pathways unpredictably", introWave: 5 },
    { name: "Balloon Smasher", hp: 2800, speed: "Slow", traits: "Stuns closest row on death", introWave: 15 },
    { name: "Phantom Overlord", hp: 14500, speed: "Normal", traits: "Immune to baseline freeze properties", introWave: 30 },
    { name: "Springlock Titan", hp: 95000, speed: "Very Slow", traits: "Boss entity. Regenerates 2% armor per tick loop", introWave: 50 }
];

const ALL_RANKS = ["S", "A", "B", "C", "D", "F"];
const ALL_CLASSES = [...new Set(DB_UNITS.map(u => u.class))];
const ALL_SUBCLASSES = [...new Set(DB_UNITS.flatMap(u => u.subclasses))];
const ALL_SYNERGIES = [...new Set(DB_UNITS.map(u => u.synergy))];

function assignDynamicRankSubTiers() {
    ALL_RANKS.forEach(rk => {
        let bucket = DB_UNITS.filter(u => u.rank === rk);
        bucket.sort((a, b) => a.rankedId - b.rankedId);
        
        let total = bucket.length;
        let slice = Math.floor(total * 0.25);
        if (slice === 0 && total > 0) slice = 1;

        bucket.forEach((unit, idx) => {
            if (idx < slice) unit.computedRank = `High ${rk}`;
            else if (idx >= total - slice && slice > 0) unit.computedRank = `Low ${rk}`;
            else unit.computedRank = `Mid ${rk}`;
        });
    });
}
assignDynamicRankSubTiers();