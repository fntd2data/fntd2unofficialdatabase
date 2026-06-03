const CONFIG = {
  TEXTS: {
    APP_NAME: "FNTD2 Unofficial Tierlist",
    LOGO_TEXT: "FNTD2 Tierlist",

    PAGE_TITLES: {
      HOME: "FNTD2 Databoard",
      FINDER: "Unit Registry",
      TIERLIST: "Ranked (tierlist)",
      GENERATOR: "Team Generation",
      TRADING: "Trading Hub",
      PROFILE: "Sheriff's Badge",
      DETAILS: "Unit Specification",
    },

    NAV_BUTTONS: {
      HOME: "Dashboard",
      FINDER: "Unit Search",
      TIERLIST: "Ranked",
      GENERATOR: "Team Generation",
      TRADING: "Trading",
      PROFILE: "Profile",
      SETTINGS: "Settings",
    },

    HOME: {
      TITLE: "Welcome, to FNTD2 Ranked (formerly fntd data)!",
      HERO_TAG: "Info",
      HERO_SUBTITLE: "a website made for ranks and team generation",
      STAT_UNITS: "Total Units",
      STAT_META: "Latest Version",
      PORTAL_TITLE: "Directs",
      PORTAL_WEB: "Official Website",
      PORTAL_DISCORD: "Official Discord",
      OP_HEADER: "Navigation",
      DB_DESC: "A tierlist with multiple ranks",
      SQUAD_DESC: "Create and rate your teams",
      NEWS_TITLE: "Latest Updates",
    },

    FINDER: {
      SEARCH_PLACEHOLDER: "Filter by name, ID, or element...",
      FILTERS_LABEL: "Filter Search",
      RARITY_LABEL: "Rarity",
      RANK_LABEL: "Rank",
      CLASS_LABEL: "Class",
      SUBCLASS_LABEL: "Subclass",
      SYNERGY_LABEL: "Synergy",
      SYNERGY_ALL: "All Synergy",
      APPLY_FILTERS: "Apply Search",
      CLEAR_FILTERS: "Reset",
      NO_RESULTS: "No units.",
      SHINY_MODE: "Toggle Shiny",
      SHOW_RANK: "Show Ranks",
      SHOW_COST: "Cost Visibility",
      SORT_LABEL: "Order:",
      SORT_HIGH_TO_LOW: "Rarity (High-Low)",
      SORT_LOW_TO_HIGH: "Rarity (Low-High)",
    },

    GENERATOR: {
      TITLE: "Generation",
      PREFERENCES_LABEL: "Pref",
      ALLOW_CLASSES: "Allowed classes",
      ALLOW_SUBCLASSES: "Allowed subclasses",
      GENERATE_TEAM: "Generate",
      GENERATED_SQUAD: "Generated",
      MANUAL_SELECTION: "Manual builder",
      YOUR_SQUAD: "Your Squad:",
      TAB_GENERATE: "Build",
      TAB_RATE: "Evaluate",
      RATING_TITLE: "Team-o-rater",
      RATING_OVERVIEW: "Deployment Viability",
      RATING_MISSING: "Flaws",
      RATE_BUTTON: "Rate",
      RATING_NOTE: "Rate your team and get some tips",
      RATING_EMPTY: "Build a team or generate one to begin",
      SELECTED_TEAM: "Selected units",
      MANUAL_BUILDER: "Unit search",
      CLEAR_TEAM: "Skip Team",
      BUILDER_SEARCH_PLACEHOLDER: "Search...",
      BUILDER_FILTER_CLASS: "Class Filter",
      BUILDER_FILTER_SUBCLASS: "Subclass Filter",
      ADD_TEAM_MEMBER: "Add",
      REMOVE_TEAM_MEMBER: "Remove",
    },

    TRADING: {
      TITLE: "Trade Post",
      LOGIN_PROMPT: "Secure your badge to begin posting commercial trade offers.",
      LOGIN_BUTTON: "Auth with Roblox",
      LOGOUT_BUTTON: "Sign Out",
      TRADE_FORM_TITLE: "Post New Offer",
      UNIT_SELECT_LABEL: "Target Asset",
      SOULS_LABEL: "Soul Compensation",
      TRADE_TYPE_LABEL: "Contract Type",
      TRADE_TYPE_OFFER: "Supply",
      TRADE_TYPE_LF: "Demand",
      WANTED_LABEL: "Requested Assets",
      ADD_OFFER_BUTTON: "Finalize Posting",
      NO_OFFERS: "The trade board is currently empty. Be the first to post a contract.",
      OFFER_OWNER: "Trader",
      OFFER_TYPE: "Intent",
      OFFER_UNIT: "Unit",
      OFFER_SOULS: "Souls",
      OFFER_WANTED: "Exchange",
      OFFER_STATUS: "Verify",
      OFFER_DELETE: "Revoke",
      OFFER_YOUR_OFFER: "Your Posting",
      OFFER_THEIR_OFFER: "Global Feed",
      NO_UNITS_SELECTED: "No units targeted.",
      TRADE_CREATED: "Contract successfully archived to the global feed.",
      TRADE_CREATION_ERROR: "Authentication failure. Badge required.",
      TRADE_SUBMIT_PLACEHOLDER: "Specify exact exchange conditions...",
    },

    PROFILE: {
      TITLE: "Sheriff's Badge",
      WELCOME_BACK: "Welcome back, {name}",
      NOT_LOGGED_IN: "Authorized access only. Connect your credentials to manage records.",
      CONNECT_BUTTON: "Connect Roblox Badge",
      PROFILE_USER_ID: "RBLX ID:",
      PROFILE_USERNAME: "Callsign:",
      PROFILE_SESSION: "Key Token:",
      LOGOUT_BUTTON: "Relinquish Badge",
      LOGIN_HELP: "Secure authentication enables cross-portal trade coordination.",
    },

    SETTINGS: {
      TITLE: "System Config",
      THEME_LABEL: "Element theme",
      THEME_DARK: "Neutral",
      THEME_LIGHT: "Light",
      THEME_GREEN: "Nature",
      THEME_BLUE: "Water",
      THEME_RED: "Fire",
      THEME_PURPLE: "Dark",
      ANIMATION_LABEL: "Animation",
      SLOW: "Slow (and steady)",
      NORMAL: "Normal",
      FAST: "Zooom",
      COMPACT_MODE_LABEL: "Efficient Interface",
      DEFAULT_FILTERS: "Persistence Settings",
      DISPLAY_SETTINGS: "Visual Interface",
      SAVE_SETTINGS: "Save",
    },

    TIERLIST: {
      TITLE: "Ranked Tiers",
      FILTER_ELEMENT: "Elements",
      FILTER_CLASS: "Class",
      FILTER_SUBCLASS: "Subclass",
      DESCRIPTION: "Manual ranks for each unit (use Endless for the best tierlist)",
      EXPLAIN_LINE_1: "Endless ranks serve as raw power",
      EXPLAIN_LINE_2: "Support units will be put aside with other units",
      EXPLAIN_LINE_3: "Heroes will be mixed with other high rank units of their element",
      EXPLAIN_LINE_4: "Early game units wont get any money at the start",
      EXPLAIN_LINE_5: "Mid game and Late game units will get enough money for one placement at wave 1",
    },

    ADMIN: {
      PANEL_TITLE: "Unit Registry Console",
      PASSWORD_PLACEHOLDER: "Access Key",
      PASSWORD_VALUE: "fntd2eco",
      UNLOCK_BUTTON: "Authorize",
      ADD_UNIT_BUTTON: "Register Unit",
      EDIT_UNIT_BUTTON: "Modify",
      DELETE_UNIT_BUTTON: "Expunge",
      SAVE_UNIT: "Commit",
      CANCEL: "Abort",
      FORM_ID: "Registry ID",
      FORM_NAME: "Entity Name",
      FORM_RARITY: "Rarity Grade",
      FORM_CLASS: "Combat Class",
      FORM_SUBCLASS: "Role Spec",
      FORM_SYNERGY: "Synergy Link",
      FORM_COST: "Deployment Cost",
      FORM_LIMIT: "Deployment Limit",
      FORM_ELEMENT: "Element",
      FORM_DAMAGE_MIN: "Min output",
      FORM_DAMAGE_MAX: "Max output",
      FORM_RANGE_MIN: "Min span",
      FORM_RANGE_MAX: "Max span",
      FORM_CD_MIN: "Min trigger",
      FORM_CD_MAX: "Max trigger",
      FORM_RANK: "Tier Rank",
      FORM_RANKED_ID: "Meta ID",
      FORM_RANKED_WAVE: "Peak Wave",
      FORM_FANMADE_BUFFS: "Dev Patches",
      FORM_SUBUNITS: "Sub-Entities",
      EXPORT_DATA: "Backup",
      IMPORT_DATA: "Synchronize",
      GENERATE_DATA_JS: "Build Registry File",
      REPOSITORY_NOTE: "Push updates directly to active cloud repository:",
      SUCCESS_MESSAGE: "Record successfully committed to the database.",
      ERROR_MESSAGE: "Authority failure: Check console logs.",
      INVALID_PASSWORD: "Unauthorized key. Recalibrate and try again.",
    },

    DETAILS: {
      RETURN_BUTTON: "← Back to Registry",
      STATS_TAB: "Combat Specs",
      PASSIVES_TAB: "Modifications",
      SOURCES_TAB: "Metadata",
      RANKED_TAB: "Meta Status",
      OBTAINMENT_TAB: "Procurement",
      ALIAS_TAB: "Variants",
      FANMADE_BUFFS_TAB: "Proposed Buffs",
      SUBUNITS_TAB: "Recursive Units",
      DESCRIPTION_TITLE: "Executive Summary",
      FANMADE_BUFFS_TITLE: "Proposed Balancing",
      SUBUNITS_TITLE: "Entity Variants",
      CALCULATOR_TITLE: "Simulation Panel",
      LEVEL_LABEL: "Intensity (1-60)",
      ENCHANT_LABEL: "Enchant Modification",
      STAT_MIN_DMG: "BASE MIN DMG",
      STAT_MAX_DMG: "BASE MAX DMG",
      STAT_RANGE: "OPERATIONAL RANGE",
      STAT_COOLDOWN: "TRIGGER INTERVAL",
      STAT_DPS: "CALCULATED DPS",
      
      RANK_TITLE: "Meta ID:",
      TIER_PLACEMENT: "Tier Standings:",
      ENDLESS_WAVE_CAP: "Wave Intensity Cap:",
      
      ELEMENT_TITLE: "Elemental Properties:",
      UNIT_EFFECT: "Primary Effect:",
      TARGET_MODIFIER: "Bias Modifier:",
      
      PASSIVES_TITLE: "Innate Modifiers",
      ABILITIES_TITLE: "Active Systems",
      NO_PASSIVES: "No modifications active.",
      NO_ABILITIES: "No logical systems found.",
      
      PLACEMENT_LIMIT: "Deployment Cap:",
      PLACEMENT_COST: "Initial Investment:",
      OBTAINMENT_LABEL: "Procurement Matrix",
      OBTAINMENT_TABLE_HEADER: "acquisition methods",
      OBTAINMENT_SOURCE: "Primary Origin",
      OBTAINMENT_CHANCE: "Probability",
      OBTAINMENT_METHOD: "Sub-Channel",
      ALIASES_LABEL: "Linked Entities",
      ALIAS_NAVIGATE: "Target Info",
      
      CLASS_LABEL: "Battle Class:",
      SUBCLASSES_LABEL: "Specializations:",
      SYNERGY_LABEL: "Synergy Affinity:",
    },

    TOOLTIPS: {
      DPS_MAX: "Peak DPS:",
      DAMAGE: "Damage Span:",
      RANGE: "Range Span:",
      COOLDOWN: "CD Span:",
      TIER_RANK: "Meta Tier:",
      RANKED_ID: "Registry ID:",
      ENDLESS_WAVE: "Peak Performance:",
      PLACEMENT_LIMIT: "Unit Cap:",
      PLACEMENT_COST: "Deployment Cost:",
    },

    WELCOME: {
      TITLE: "FNTD2 Unofficial Database",
      SUBTITLE: "a website made by me! ECO!",
      INTRO_TEXT: "this website is not official and not made by hyper studios, please visit fntd2.com for the official website",
      FEATURES_TITLE: "Functions",
      FEATURE_1: "UnitDex - a scrapped function, replaced with an automated fntd2.com checker",
      FEATURE_2: "Tierlist - the main function",
      FEATURE_3: "Team Builder - try our feature thats still W.I.P",
      FEATURE_4: "Dashboard - here it begins",
      CTA_BUTTON: "Lets go",
      SKIP_BUTTON: "Bye Bye",
    },

    MESSAGES: {
      UNIT_CREATED: "REGISTRY: NEW ENTRY",
      UNIT_UPDATED: "REGISTRY: UPDATE COMPLETE",
      UNIT_DELETED: "REGISTRY: ENTRY EXPUNGED",
      LOAD_ERROR: "Failed to establish link with primary database.",
      SAVE_ERROR: "Database write error. Check permissions.",
    },
  },

  COLORS: {
    DARK: {
      BG_WORKSPACE: "#1b0d05", 
      BG_CARD_PANEL: "#2c2c2c",
      BG_INPUT_FIELD: "#121212",
      BORDER_MATRIX: "#3d1c00",
      TEXT_HEADING: "#ffb74d",
      TEXT_BODY_MAIN: "#ffffff",
      TEXT_BODY_MUTED: "#aaaaaa",
      COLOR_ACCENT_BLUE: "#d2691e",
      COLOR_ACCENT_BLUE_HOVER: "#cd853f",
      COLOR_CURRENCY_GREEN: "#ffc4a3",
    },

    LIGHT: {
      BG_WORKSPACE: "#f5e6d3", 
      BG_CARD_PANEL: "#ffffff",
      BG_INPUT_FIELD: "#f9f0e6",
      BORDER_MATRIX: "#d4a373",
      TEXT_HEADING: "#2c1b0e",
      TEXT_BODY_MAIN: "#4a3b2e",
      TEXT_BODY_MUTED: "#8b7e74",
      COLOR_ACCENT_BLUE: "#bc6c25",
      COLOR_ACCENT_BLUE_HOVER: "#9e5a1e",
      COLOR_CURRENCY_GREEN: "#606c38",
    },

    RARITIES: {
      HERO: "linear-gradient(135deg, #877622, #9c831f, #877622)",
      EXCLUSIVE: "linear-gradient(135deg, #1e9b84, #1fb3b9, #1e9b84)",
      APEX: "linear-gradient(135deg, #d32f94, #8c28c6)",
      NIGHTMARE: "linear-gradient(135deg, #2d182b, #573b54)",
      SECRET: "linear-gradient(135deg, #bb0000, #ff0000)",
      MYTHICAL: "linear-gradient(135deg, #ffd54f, #ffb74d)",
      EPIC: "linear-gradient(135deg, #ba68c8, #ab47bc)",
      RARE: "linear-gradient(135deg, #64b5f6, #42a5f5)",
      UNCOMMON: "linear-gradient(135deg, #81c784, #66bb6a)",
    },

    TIERS: {
      S: "#ff3d00",
      A: "#ff9100",
      B: "#ffea00",
      C: "#00e676",
      D: "#2979ff",
      E: "#651fff",
      F: "#d500f9",
    },

    WAVE_SCORES: {
      LOW: "#f44336",
      MID: "#ffeb3b",
      HIGH: "#4caf50",
    },

    SHINY_GRADIENT: [
      "#f44336",
      "#ff9800",
      "#ffeb3b",
      "#4caf50",
      "#2196f3",
      "#9c27b0",
    ],

    DISCORD_PRIMARY: "#5865F2",
    DISCORD_SECONDARY: "#23272A",
    ACCENT_GOLD: "#ffcc80",
  },

  TIMINGS: {
    ANIMATION_SPEEDS: {
      SLOW: "1.2s",
      NORMAL: "0.45s",
      FAST: "0.15s",
    },
    POP_IN_DELAY: "0.06s",
    HOVER_TRANSITION: "0.25s",
    MODAL_TRANSITION: "0.35s",
    SHINY_CYCLE_DURATION: "5s",
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
      LOW_THRESHOLD: 75,
      HIGH_THRESHOLD: 120,
    },
    TEAM: {
      MAX_SIZE: 6,
      EARLY_GAME_SLOTS: 1,
      MID_GAME_SLOTS: 1,
      LATE_GAME_SLOTS: 1,
      FLEX_SLOTS: 3,
    },
    RANK_DISTRIBUTION: {
      HIGH_PERCENTILE: 0.2,
      LOW_PERCENTILE: 0.8,
    },
    ENCHANTS: {
      NONE: { NAME: "Unenchated", DMG_MOD: 1.0, RANGE_MOD: 1.0, CD_MOD: 1.0 },
      SHARPENED: { NAME: "Sharpened", DESC: "+18% Damage", DMG_MOD: 1.18, RANGE_MOD: 1.0, CD_MOD: 1.0 },
      GROUNDED: { NAME: "Grounded", DESC: "+25% Range, +8% CD", DMG_MOD: 1.0, RANGE_MOD: 1.25, CD_MOD: 1.08 },
      HYPERCLOCKED: { NAME: "Hyperclocked", DESC: "-22% CD, -8% DMG", DMG_MOD: 0.92, RANGE_MOD: 1.0, CD_MOD: 0.78 },
      GODLY: { NAME: "Godly", DESC: "+50% DMG, +20% RNG, -12% CD", DMG_MOD: 1.5, RANGE_MOD: 1.2, CD_MOD: 0.88 },
    },
  },

  UI_SIZES: {
    BORDER_RADIUS: "6px", 
    UNIT_CARD_WIDTH: "135px",
    UNIT_CARD_HEIGHT: "135px",
    FONT_SIZES: {
      TITLE_LARGE: "32px",
      TITLE_MEDIUM: "26px",
      TITLE_SMALL: "18px",
      BODY_LARGE: "15px",
      BODY_MEDIUM: "14px",
      BODY_SMALL: "12.5px",
      LABEL_SMALL: "11px",
      LABEL_TINY: "9.5px",
    },

    SPACING: {
      XS: "5px",
      SM: "10px",
      MD: "15px",
      LG: "20px",
      XL: "25px",
      XXL: "30px",
      XXXL: "40px",
    },

    LOGO: {
      FONT_SIZE: "26px",
      LETTER_SPACING: "2px",
      FONT_WEIGHT: "800",
    },

    SIDEBAR_WIDTH: "280px",
    FILTER_SIDEBAR_WIDTH: "320px",
    CONTENT_PADDING: "36px",
  },

  FEATURE_FLAGS: {
    SHOW_WELCOME_MODAL: true,
    ENABLE_SHINY_MODE: true,
    ENABLE_COST_VISIBILITY_TOGGLE: true,
    ENABLE_RANK_HOVER: true,
    ENABLE_TEAM_GENERATOR: true,
    ENABLE_ENEMY_CODEX: false, 
    ENABLE_TIERLIST_FILTERS: true,
    ENABLE_UNIT_CREATOR: true,
    ENABLE_FANMADE_FEATURES: true,
    ENABLE_SUBUNIT_RELATIONS: true,
    ENABLE_COMPACT_MODE: true,
    ENABLE_TOOLTIPS: true,
  },

  LINKS: {
    FNTD2_DISCORD: "https://discord.gg/fntd2",
    FNTD2_DB_DISCORD: "https://discord.gg/fntd2db",
    PRODUCTION_DOMAIN: "fntd2data.dev",
    MIRROR_DOMAIN: "backup.fntd2db.xyz",
    STAGING_DOMAIN: "test.fntd2db.app",
    ROBLOX_OAUTH_URL: "https://api.fntddata.com/auth/roblox",
    TRADE_API_URL: "https://api.fntddata.com/api/trades",
  },

  FILTER_DESCRIPTIONS: {
    RANK_TYPE: {
      "Endless": "Ranks are based off of the highest wave reached by units in endless 5 (raw power)",
      "Synergy": "To be added,",
      "Obtainability": "Ranks are based off of how easy it is to obtain the unit",
      "Personal": "My personal rank and why",
      "Overall": "Average ranks of the 3 other categories, it is recommended to use Endless for the actual tierlist"
    },
    CLASSES: {
      "Early Game": "Units are ranked off of their performance at the start",
      "Mid Game": "Units are ranked off of their performance at the start",
      "End Game": "Units are ranked off of their performance at the start of the match"
    }
  },

  SETTINGS_OPTIONS: {
    THEME: true,
    ANIMATION_SPEED: true,
    COMPACT_MODE: true,
    SHOW_ELEMENT_IDS: true,
    TOOLTIPS: true,
  },

  BACKGROUND_ASSETS: {
    SKY_COLOR: "#1b0d05", 
    SKY_GRADIENT_START: "#3d1c00", 
    SKY_GRADIENT_END: "#1b0d05", 
    
    SUN_COLOR: "#ff7b00", 
    SUN_SIZE: "450px",
    SUN_POSITION_BOTTOM: "5%", 
    SUN_POSITION_LEFT: "50%", 
    SUN_BLUR_GLOW: "200px",
    SUN_ANIMATION_SPEED: "20s",
    
    GROUND_COLOR: "#2c1b0e",
    GROUND_HEIGHT: "35%",
    GROUND_BORDER_COLOR: "#1b0d05", 
    
    CACTUS_COLOR: "#4a5d23", 
    CACTUS_DARK_COLOR: "#1e2a0f", 
    HOUSE_COLOR: "#3d2b1f", 
    HOUSE_DARK_COLOR: "#1b120c", 
    HOUSE_ROOF_COLOR: "#5c2b0e", 
    HOUSE_ROOF_DARK: "#3d1c00", 
    TUMBLEWEED_COLOR: "#8b7e74", 
    TUMBLEWEED_DARK: "#3d1c00", 
    
    JUMPING_SPEED: "25s",
    JUMP_HEIGHT: "-120px",
    WIND_GUST_DURATION: "4s",
    
    CACTUS_LEFT_BOTTOM: "22%",
    CACTUS_LEFT_2_BOTTOM: "24%",
    CACTUS_RIGHT_BOTTOM: "21%",
    CACTUS_RIGHT_2_BOTTOM: "23%",
    HOUSE_1_BOTTOM: "25%",
    HOUSE_2_BOTTOM: "24%",
    TUMBLEWEED_BOTTOM: "21%",
  },

  getText(path) {
    const keys = path.split(".");
    let value = this.TEXTS;
    for (const key of keys) {
      if (!value) break;
      value = value[key];
    }
    return value || path;
  },

  getColor(path) {
    if (path.includes(".")) {
      const keys = path.split(".");
      let value = this.COLORS;
      for (const key of keys) {
        if (!value) break;
        value = value[key];
      }
      return value || "#555";
    }
    return this.COLORS[path] || "#555";
  },

  getRarityColor(rarityName) {
    if (!rarityName) return "#555";
    const rarityKey = rarityName.toUpperCase().replace(" ", "_");
    return this.COLORS.RARITIES[rarityKey] || "#555";
  },

  getTierColor(tierRank) {
    if (!tierRank) return "#555";
    return this.COLORS.TIERS[tierRank.charAt(0).toUpperCase()] || "#555";
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
    if (!enchantName) return this.GAME_BALANCE.ENCHANTS.NONE;
    const enchantKey = enchantName.toUpperCase();
    return this.GAME_BALANCE.ENCHANTS[enchantKey] || this.GAME_BALANCE.ENCHANTS.NONE;
  },
};
