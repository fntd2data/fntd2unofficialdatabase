const CONFIG = {
  TEXTS: {
    APP_NAME: "FNTD2 Unofficial Database",
    LOGO_TEXT: "FNTD2 Unofficial DB",

    PAGE_TITLES: {
      HOME: "Welcome Back!",
      FINDER: "Unit-Finder",
      TIERLIST: "Ranked-Tiers",
      GENERATOR: "Team Creator",
      CODEX: "Enemy Codex",
      TRADING: "Trading Hub",
      PROFILE: "Pro-file",
      DETAILS: "Unit Details",
    },

    NAV_BUTTONS: {
      HOME: "Database Home",
      FINDER: "Unit-Finder",
      TIERLIST: "Ranked-Tiers",
      GENERATOR: "Team Creator",
      CODEX: "Enemy Codex",
      TRADING: "Trading",
      PROFILE: "Pro-file",
      SETTINGS: "Settings",
    },

    HOME: {
      TITLE: "Welcome to the FNTD2 database",
      COMMUNITY_CARD_HEADER: "Discord",
      COMMUNITY_CARD_DESC: "join the official fntd2 discord server, or the db server that does not exist!",
      COMMUNITY_OFFICIAL_LINK: "FNTD2 Discord",
      COMMUNITY_DB_LINK: "FNTD2 DB Discord",
      QUICK_LINKS_HEADER: "Links",
      QUICK_LINKS_DESC: "Useful project links.",
      DOMAIN_MAIN: "Github",
      DOMAIN_BACKUP: "Vercel",
      DOMAIN_DEV: "Netlify",
      UPDATES_HEADER: "Updates",
      EXPLORE_HEADER: "Database - Navigation",
      EXPLORE_DESC: "things you might want to explore",
      EXPLORE_BROWSE: "Unit Files",
      EXPLORE_TIERS: "Ranked Tierlist",
      EXPLORE_SQUAD: "Team Creator",
    },

    FINDER: {
      SEARCH_PLACEHOLDER: "Search units by name or ID...",
      FILTERS_LABEL: "Filters",
      RARITY_LABEL: "Rarity",
      RANK_LABEL: "Rank",
      CLASS_LABEL: "Class",
      SUBCLASS_LABEL: "Subclass",
      SYNERGY_LABEL: "Best Synergy Match",
      SYNERGY_ALL: "All Synergies",
      APPLY_FILTERS: "Apply Filters",
      CLEAR_FILTERS: "Clear Filters",
      NO_RESULTS: "No matching units found.",
      SHINY_MODE: "Shiny mode",
      SHOW_RANK: "Show Ranked (hover)",
      SHOW_COST: "Show Placement Cost",
      SORT_LABEL: "Sort:",
      SORT_HIGH_TO_LOW: "Highest Rarity First",
      SORT_LOW_TO_HIGH: "Lowest Rarity First",
    },

    GENERATOR: {
      TITLE: "Team Creator",
      PREFERENCES_LABEL: "Creator Settings",
      ALLOW_CLASSES: "Allowed Classes",
      ALLOW_SUBCLASSES: "Allowed Subclasses",
      GENERATE_TEAM: "Build Team",
      YOUR_SQUAD: "Your Squad:",
      TAB_GENERATE: "Generate Team",
      TAB_RATE: "Rate Team",
      RATING_TITLE: "Team Evaluation",
      RATING_OVERVIEW: "Overall Rating",
      RATING_MISSING: "What Your Team Needs",
      RATE_BUTTON: "Evaluate Team",
      RATING_NOTE: "Generate a team first, then switch to rating to see the analysis.",
      RATING_EMPTY: "No team generated yet. Use the generator tab to create a squad.",
      SELECTED_TEAM: "Current Squad",
      MANUAL_BUILDER: "Manual Builder",
      CLEAR_TEAM: "Clear Team",
      BUILDER_SEARCH_PLACEHOLDER: "Search units to add...",
      BUILDER_FILTER_CLASS: "Class",
      BUILDER_FILTER_SUBCLASS: "Subclass",
      ADD_TEAM_MEMBER: "Add",
      REMOVE_TEAM_MEMBER: "Remove",
    },

    CODEX: {
      TITLE: "Enemy Codex",
      SEARCH_PLACEHOLDER: "Search enemies...",
      NO_RESULTS: "No matching enemies found.",
      HEALTH_LABEL: "Health Pool:",
      SPEED_LABEL: "Movespeed:",
      WAVE_LABEL: "Type:",
      TRAITS_LABEL: "Traits:",
    },

    TRADING: {
      TITLE: "Trading Hub",
      LOGIN_PROMPT: "You must sign into your Pro-file to create trade offers.",
      LOGIN_BUTTON: "Login with Roblox",
      LOGOUT_BUTTON: "Logout",
      TRADE_FORM_TITLE: "Create a Trade Offer",
      UNIT_SELECT_LABEL: "Choose Unit",
      SOULS_LABEL: "Souls Offered",
      TRADE_TYPE_LABEL: "Trade Type",
      TRADE_TYPE_OFFER: "Offering",
      TRADE_TYPE_LF: "Looking For",
      WANTED_LABEL: "What I Want",
      ADD_OFFER_BUTTON: "Create Offer",
      NO_OFFERS: "No trade offers yet. Create the first offer once you are logged in.",
      OFFER_OWNER: "Owner",
      OFFER_TYPE: "Type",
      OFFER_UNIT: "Unit",
      OFFER_SOULS: "Souls",
      OFFER_WANTED: "Wanted",
      OFFER_STATUS: "Status",
      OFFER_DELETE: "Remove",
      OFFER_YOUR_OFFER: "Your Offer",
      OFFER_THEIR_OFFER: "Their Offer",
      NO_UNITS_SELECTED: "No units selected.",
      TRADE_CREATED: "Trade offer created.",
      TRADE_CREATION_ERROR: "You must be logged in to create a trade.",
      TRADE_SUBMIT_PLACEHOLDER: "Describe what you want for this unit...",
    },

    PROFILE: {
      TITLE: "Pro-file",
      WELCOME_BACK: "Welcome back, {name}",
      NOT_LOGGED_IN: "You are not logged in. Connect your Roblox account to access trading features.",
      CONNECT_BUTTON: "Connect Roblox Account",
      PROFILE_USER_ID: "Roblox ID:",
      PROFILE_USERNAME: "Username:",
      PROFILE_SESSION: "Session Token:",
      LOGOUT_BUTTON: "Sign Out",
      LOGIN_HELP: "Use your Pro-file login to post and manage trade offers.",
    },

    DETAILS: {
      RETURN_BUTTON: "← Return to Unit Finder",
      STATS_TAB: "Stats",
      PASSIVES_TAB: "Passives & Abilities",
      RANKED_TAB: "Ranked Info",
      OBTAINMENT_TAB: "Obtainment",
      ALIAS_TAB: "Aliases",
      
      CALCULATOR_TITLE: "Unit Calculator",
      LEVEL_LABEL: "Level (1 - 60)",
      ENCHANT_LABEL: "Enchant Type",
      STAT_MIN_DMG: "MIN DAMAGE",
      STAT_MAX_DMG: "MAX DAMAGE",
      STAT_RANGE: "RANGE",
      STAT_COOLDOWN: "COOLDOWN",
      STAT_DPS: "RDPS (rounded damage/s)",
      
      RANK_TITLE: "Rank Id:",
      TIER_PLACEMENT: "Tier Placement:",
      ENDLESS_WAVE_CAP: "Endless Wave Cap:",
      
      ELEMENT_TITLE: "Elemental Properties:",
      UNIT_EFFECT: "Unit Effect:",
      TARGET_MODIFIER: "Target Modifier:",
      
      PASSIVES_TITLE: "Passives Matrix",
      ABILITIES_TITLE: "Ability System",
      NO_PASSIVES: "No passives registered.",
      NO_ABILITIES: "No abilities registered.",
      
      PLACEMENT_LIMIT: "Placement Limit:",
      PLACEMENT_COST: "Cost:",
      OBTAINMENT_LABEL: "Obtainment Sources",
      OBTAINMENT_TABLE_HEADER: "ways to obtain",
      OBTAINMENT_SOURCE: "Source",
      OBTAINMENT_CHANCE: "Chance",
      OBTAINMENT_METHOD: "Sub-Source",
      ALIASES_LABEL: "Alias Units",
      ALIAS_NAVIGATE: "View Unit",
      
      CLASS_LABEL: "Class:",
      SUBCLASSES_LABEL: "Subclasses:",
      SYNERGY_LABEL: "Synergy:",
    },

    SETTINGS: {
      TITLE: "Settings",
      THEME_LABEL: "Interface Theme",
      THEME_DARK: "Dark Operations",
      THEME_LIGHT: "Light Operations",
      THEME_GREEN: "Green Circuit",
      THEME_BLUE: "Blue Nebula",
      THEME_RED: "Red Reactor",
      THEME_PURPLE: "Purple Pulse",
      ANIMATION_LABEL: "System Animation Speeds",
      SLOW: "Slow",
      NORMAL: "Normal",
      FAST: "Fast",
      COMPACT_MODE_LABEL: "Minimal Mode",
      DEFAULT_FILTERS: "Default Filters",
      DISPLAY_SETTINGS: "Display Settings",
      SAVE_SETTINGS: "Save",
    },

    TIERLIST: {
      TITLE: "Ranked-Tiers",
      FILTER_ELEMENT: "All Elements",
      FILTER_CLASS: "All Classes",
      FILTER_SUBCLASS: "All Subclasses",
      DESCRIPTION: "A tier list ranking units based on performance.",
      EXPLAIN_LINE_1: "Units are ranked based on their performance in Endless mode.",
      EXPLAIN_LINE_2: "Boosters are ranked by how they improve Mid A units.",
      EXPLAIN_LINE_3: "Heroes are ranked by synergy with other units of the same element.",
      EXPLAIN_LINE_4: "Units under 1k cash receive no rewards.",
      EXPLAIN_LINE_5: "Units over 1k cash receive rewards based on placement cost.",
    },

    ADMIN: {
      PANEL_TITLE: "U.N.I.T Manager",
      PASSWORD_PLACEHOLDER: "Terminal",
      PASSWORD_VALUE: "fntd2eco",
      UNLOCK_BUTTON: "Enter",
      ADD_UNIT_BUTTON: "Create New Unit",
      EDIT_UNIT_BUTTON: "Edit",
      DELETE_UNIT_BUTTON: "Salvage",
      SAVE_UNIT: "Save",
      CANCEL: "Cancel",
      FORM_ID: "Unit ID",
      FORM_NAME: "Unit Name",
      FORM_RARITY: "Rarity",
      FORM_CLASS: "Class",
      FORM_SUBCLASS: "Subclasses",
      FORM_SYNERGY: "Synergy",
      FORM_COST: "Placement Cost",
      FORM_LIMIT: "Placement Limit",
      FORM_ELEMENT: "Element",
      FORM_DAMAGE_MIN: "Min Damage",
      FORM_DAMAGE_MAX: "Max Damage",
      FORM_RANGE_MIN: "Min Range",
      FORM_RANGE_MAX: "Max Range",
      FORM_CD_MIN: "Min Cooldown",
      FORM_CD_MAX: "Max Cooldown",
      FORM_RANK: "Rank",
      FORM_RANKED_ID: "Ranked ID",
      FORM_RANKED_WAVE: "Ranked Wave",
      EXPORT_DATA: "Export",
      IMPORT_DATA: "Import",
      GENERATE_DATA_JS: "Generate data.js",
      REPOSITORY_NOTE: "Or save units to your repository:",
      SUCCESS_MESSAGE: "Unit saved successfully",
      ERROR_MESSAGE: "An error occurred",
      INVALID_PASSWORD: "Incorrect password, try again.",
    },

    TOOLTIPS: {
      DPS_MAX: "DPS (Max):",
      DAMAGE: "Damage:",
      RANGE: "Range:",
      COOLDOWN: "Cooldown:",
      TIER_RANK: "Tier:",
      RANKED_ID: "Ranked ID:",
      ENDLESS_WAVE: "Ranked Wave:",
      PLACEMENT_LIMIT: "Limit:",
      PLACEMENT_COST: "Cost:",
    },

    WELCOME: {
      TITLE: "Welcome to FNTD2 Unofficial Database",
      SUBTITLE: "a site made by a Tester, for people to learn more about units. fastest updated site",
      INTRO_TEXT: "this is a fanmade project, its not made by a big team or fntd2 devs, use their site fntd2.com for more accurate results",
      FEATURES_TITLE: "Functions",
      FEATURE_1: "Unit Finder - Browse units",
      FEATURE_2: "Ranked-Tiers - See how units perform in their base form (calculated by wave)",
      FEATURE_3: "Team Creator - Generate squads and rate them for balance.",
      FEATURE_4: "Enemy Codex - Enemy information",
      CTA_BUTTON: "Get started",
      SKIP_BUTTON: "Skip",
    },

    MESSAGES: {
      UNIT_CREATED: "U.N.I.T: Creation",
      UNIT_UPDATED: "U.N.I.T: Updated",
      UNIT_DELETED: "U.N.I.T: Deleted",
      LOAD_ERROR: "Error loading data.",
      SAVE_ERROR: "Error saving data.",
    },
  },

  COLORS: {
    DARK: {
      BG_WORKSPACE: "#0a0f0d",
      BG_CARD_PANEL: "#0f1612",
      BG_INPUT_FIELD: "#141a16",
      BORDER_MATRIX: "#1a2420",
      TEXT_HEADING: "#e8f5e9",
      TEXT_BODY_MAIN: "#c8e6c9",
      TEXT_BODY_MUTED: "#80a080",
      COLOR_ACCENT_BLUE: "#66bb6a",
      COLOR_ACCENT_BLUE_HOVER: "#4caf50",
      COLOR_CURRENCY_GREEN: "#81c784",
    },

    LIGHT: {
      BG_WORKSPACE: "#f1f5f1",
      BG_CARD_PANEL: "#ffffff",
      BG_INPUT_FIELD: "#f5f9f5",
      BORDER_MATRIX: "#c8d9c8",
      TEXT_HEADING: "#1b5e20",
      TEXT_BODY_MAIN: "#2e7d32",
      TEXT_BODY_MUTED: "#558b55",
      COLOR_ACCENT_BLUE: "#2e7d32",
      COLOR_ACCENT_BLUE_HOVER: "#1b5e20",
      COLOR_CURRENCY_GREEN: "#388e3c",
    },

    RARITIES: {
      SECRET: "linear-gradient(135deg, #d32f2f, #c62828)",
      MYTHIC: "linear-gradient(135deg, #ffd54f, #ffb74d)",
      EPIC: "linear-gradient(135deg, #ba68c8, #ab47bc)",
      RARE: "linear-gradient(135deg, #64b5f6, #42a5f5)",
      UNCOMMON: "linear-gradient(135deg, #81c784, #66bb6a)",
    },

    TIERS: {
      S: "#e53935",
      A: "#fb8c00",
      B: "#fdd835",
      C: "#7cb342",
      D: "#5dade2",
      E: "#85c1e2",
      F: "#ce93d8",
    },

    WAVE_SCORES: {
      LOW: "#ef5350",
      MID: "#ffca28",
      HIGH: "#66bb6a",
    },

    SHINY_GRADIENT: [
      "#e53935",
      "#fb8c00",
      "#fdd835",
      "#66bb6a",
      "#42a5f5",
      "#ba68c8",
    ],

    DISCORD_PRIMARY: "#5865F2",
    DISCORD_SECONDARY: "#23272A",
    ACCENT_GOLD: "#ffb74d",
  },

  TIMINGS: {
    ANIMATION_SPEEDS: {
      SLOW: "1.1s",
      NORMAL: "0.4s",
      FAST: "0.1s",
    },
    POP_IN_DELAY: "0.05s",
    HOVER_TRANSITION: "0.2s",
    MODAL_TRANSITION: "0.3s",
    SHINY_CYCLE_DURATION: "4s",
    SHINY_CYCLE_TIMING: "linear",
  },

  GAME_BALANCE: {
    LEVEL_MIN: 1,
    LEVEL_MAX: 60,
    LEVEL_SCALING: {
      DAMAGE_MULTIPLIER: 0.02,
      RANGE_MULTIPLIER: 0.005,
      COOLDOWN_DIVISOR: 0.002,
    },
    WAVE_THRESHOLDS: {
      LOW_THRESHOLD: 70,
      HIGH_THRESHOLD: 110,
    },
    TEAM: {
      MAX_SIZE: 6,
      EARLY_GAME_SLOTS: 1,
      MID_GAME_SLOTS: 1,
      LATE_GAME_SLOTS: 1,
      FLEX_SLOTS: 3,
    },
    RANK_DISTRIBUTION: {
      HIGH_PERCENTILE: 0.25,
      LOW_PERCENTILE: 0.75,
    },
    ENCHANTS: {
      NONE: { NAME: "None", DMG_MOD: 1.0, RANGE_MOD: 1.0, CD_MOD: 1.0 },
      SHARPENED: { NAME: "Sharpened", DESC: "+15% Damage", DMG_MOD: 1.15, RANGE_MOD: 1.0, CD_MOD: 1.0 },
      GROUNDED: { NAME: "Grounded", DESC: "+20% Range, +5% CD", DMG_MOD: 1.0, RANGE_MOD: 1.2, CD_MOD: 1.05 },
      HYPERCLOCKED: { NAME: "Hyperclocked", DESC: "-20% CD, -5% DMG", DMG_MOD: 0.95, RANGE_MOD: 1.0, CD_MOD: 0.8 },
      GODLY: { NAME: "Godly", DESC: "+45% DMG, +15% RNG, -10% CD", DMG_MOD: 1.45, RANGE_MOD: 1.15, CD_MOD: 0.9 },
    },
  },

  UI_SIZES: {
    BORDER_RADIUS: "8px",
    UNIT_CARD_WIDTH: "130px",
    UNIT_CARD_HEIGHT: "130px",
    FONT_SIZES: {
      TITLE_LARGE: "28px",
      TITLE_MEDIUM: "24px",
      TITLE_SMALL: "16px",
      BODY_LARGE: "14px",
      BODY_MEDIUM: "13px",
      BODY_SMALL: "12px",
      LABEL_SMALL: "11.5px",
      LABEL_TINY: "9px",
    },

    SPACING: {
      XS: "4px",
      SM: "8px",
      MD: "12px",
      LG: "16px",
      XL: "20px",
      XXL: "24px",
      XXXL: "32px",
    },

    LOGO: {
      FONT_SIZE: "24px",
      LETTER_SPACING: "1.5px",
      FONT_WEIGHT: "700",
    },

    SIDEBAR_WIDTH: "260px",
    FILTER_SIDEBAR_WIDTH: "300px",
    CONTENT_PADDING: "32px",
  },

  FEATURE_FLAGS: {
    SHOW_WELCOME_MODAL: true,
    ENABLE_SHINY_MODE: true,
    ENABLE_COST_VISIBILITY_TOGGLE: true,
    ENABLE_RANK_HOVER: true,
    ENABLE_TEAM_GENERATOR: true,
    ENABLE_ENEMY_CODEX: true,
    ENABLE_TIERLIST_FILTERS: true,
    ENABLE_UNIT_CREATOR: true,
    ENABLE_COMPACT_MODE: true,
    ENABLE_TOOLTIPS: true,
  },

  LINKS: {
    FNTD2_DISCORD: "https://discord.gg/fntd2",
    FNTD2_DB_DISCORD: "https://discord.gg/fntd2db",
    PRODUCTION_DOMAIN: "fntd2data.github.io",
    MIRROR_DOMAIN: "backup.fntd2db.net",
    STAGING_DOMAIN: "dev.fntd2db.xyz",
    ROBLOX_OAUTH_URL: "https://api.fntddata.com/auth/roblox",
    TRADE_API_URL: "https://api.fntddata.com/api/trades",
  },

  SETTINGS_OPTIONS: {
    THEME: true,
    ANIMATION_SPEED: true,
    COMPACT_MODE: true,
    SHOW_ELEMENT_IDS: true,
    TOOLTIPS: true,
  },

  getText(path) {
    const keys = path.split(".");
    let value = this.TEXTS;
      for (const key of keys) {
      value = value[key];
      if (!value) return path;
    }
    return value;
  },

  getColor(path) {
    if (path.includes(".")) {
      const keys = path.split(".");
      let value = this.COLORS;
      for (const key of keys) {
        value = value[key];
        if (!value) return "#555";
      }
      return value;
    }
    return this.COLORS[path] || "#555";
  },

  getRarityColor(rarityName) {
    const rarityKey = rarityName.toUpperCase();
    return this.COLORS.RARITIES[rarityKey] || "#555";
  },

  getTierColor(tierRank) {
    return this.COLORS.TIERS[tierRank] || "#555";
  },

  getWaveScoreColor(waveValue) {
    if (waveValue < this.GAME_BALANCE.WAVE_THRESHOLDS.LOW_THRESHOLD) {
      return this.COLORS.WAVE_SCORES.LOW;
    } else if (waveValue > this.GAME_BALANCE.WAVE_THRESHOLDS.HIGH_THRESHOLD) {
      return this.COLORS.WAVE_SCORES.HIGH;
    }
    return this.COLORS.WAVE_SCORES.MID;
  },

  getEnchant(enchantName) {
    const enchantKey = enchantName.toUpperCase();
    return this.GAME_BALANCE.ENCHANTS[enchantKey] || this.GAME_BALANCE.ENCHANTS.NONE;
  },
};