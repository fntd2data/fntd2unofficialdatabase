let currentFiltersState = {
    search: "", sort: "high-low", rarities: [], ranks: [], classes: [], subclasses: [], synergy: "All"
};
let currentTeam = [];

const OFFICIAL_UNIT_IMAGE_URLS = {
    "Freddy": "https://tr.rbxcdn.com/180DAY-63ddb06f42f6d5c85e6cba42eb0f4d5c/420/420/Image/Png/noFilter",
    "Bonnie": "https://tr.rbxcdn.com/180DAY-9a5388aee80fbd8d113bf2d6580d2d79/420/420/Image/Png/noFilter",
    "Chica": "https://tr.rbxcdn.com/180DAY-781dadc7e6f8e096ee439bc9051490c8/420/420/Image/Png/noFilter",
    "Foxy": "https://tr.rbxcdn.com/180DAY-793713dc76ca2a309ed6d6af2ba5ce56/420/420/Image/Png/noFilter",
    "Freddy with a Glock": "https://tr.rbxcdn.com/180DAY-dd332611b0364f89c862be33220e3ec6/420/420/Image/Png/noFilter",
    "JJ": "https://tr.rbxcdn.com/180DAY-199f5546817ec764462d5defb10f3c0d/420/420/Image/Png/noFilter",
    "Paperpals": "https://tr.rbxcdn.com/180DAY-8ed64d4723d9d1fbd1f515a49aa038db/420/420/Image/Png/noFilter",
    "Hor Hor Freddy": "https://tr.rbxcdn.com/180DAY-62126cafe4da164b3c37142593fb8daf/420/420/Image/Png/noFilter",
    "Undead Chica": "https://tr.rbxcdn.com/180DAY-50fb7337f2858ad6ede8cd36f097f5b4/420/420/Image/Png/noFilter",
    "Overwhelming Horde": "https://drive.google.com/thumbnail?id=1oI0h-nH9M8_K4tzGYs-0_Yqn2sZ_V2Uc&sz=w500"
};

const OFFICIAL_UNIT_ASSET_IDS = {
    "Freddy": "89925249660312",
    "Bonnie": "132275351050605",
    "Chica": "108231225322877",
    "Foxy": "97554562118129",
    "Freddy with a Glock": "94326878759349",
    "JJ": "70722815308793",
    "Hor Hor Freddy": "106773907856543",
    "Paperpals": "72400983395431",
    "Undead Chica": "134007034705550"
};

const OFFICIAL_IMAGE_SERVICE_URL = 'https://cold-rice-a39a.callofdutyblackops2prueba.workers.dev';
const OFFICIAL_IMAGE_CACHE = {};
const OFFICIAL_IMAGE_FETCHING = new Set();
const OFFICIAL_DATA_CACHE_KEY = 'fntd2_official_unit_cache_v2';
const CUSTOM_UNITS_KEY = 'fntd2_custom_units_v2';
const DELETED_UNITS_KEY = 'fntd2_deleted_unit_ids_v1';

function getOfficialUnitImageUrl(unit) {
    if (!unit) return '';
    if (unit.officialImageUrl && unit.officialImageUrl.trim()) {
        return unit.officialImageUrl;
    }
    const directUrl = OFFICIAL_UNIT_IMAGE_URLS[unit.name];
    if (directUrl) return directUrl;
    const assetId = unit.officialAssetId || OFFICIAL_UNIT_ASSET_IDS[unit.name];
    if (!assetId) return '';
    if (OFFICIAL_IMAGE_CACHE[assetId]) {
        return OFFICIAL_IMAGE_CACHE[assetId];
    }
    queueOfficialImageFetch(assetId);
    return '';
}

function queueOfficialImageFetch(assetId) {
    if (!assetId || OFFICIAL_IMAGE_FETCHING.has(assetId) || OFFICIAL_IMAGE_CACHE[assetId] !== undefined) return;
    OFFICIAL_IMAGE_FETCHING.add(assetId);
    fetch(`${OFFICIAL_IMAGE_SERVICE_URL}/?assetIds=${assetId}&v=4`)
        .then(response => response.json())
        .then(payload => {
            const imageUrl = payload?.data?.[0]?.imageUrl;
            if (imageUrl) {
                OFFICIAL_IMAGE_CACHE[assetId] = imageUrl;
                updateOfficialImageCards(assetId, imageUrl);
            } else {
                OFFICIAL_IMAGE_CACHE[assetId] = null;
            }
        })
        .catch(() => {
            OFFICIAL_IMAGE_CACHE[assetId] = null;
        })
        .finally(() => {
            OFFICIAL_IMAGE_FETCHING.delete(assetId);
        });
}

function updateOfficialImageCards(assetId, imageUrl) {
    document.querySelectorAll(`[data-unit-asset='${assetId}']`).forEach(card => {
        card.style.backgroundImage = `url('${imageUrl}'), none`;
    });
}

function getUnitImageUrl(unit) {
    const officialImage = getOfficialUnitImageUrl(unit);
    if (officialImage) return officialImage;
    if (unit && unit.image && unit.image.trim() !== "") {
        return unit.image;
    }
    return `images/units/${unit.id}.png`;
}

function getOfficialUnitUrl(unit) {
    if (!unit || !unit.name) return 'https://fntd2.com/database/units';
    if (unit.officialPageSlug) return `https://fntd2.com/database/units?=${unit.officialPageSlug}`;
    const rawSlug = unit.name.trim().toLowerCase();
    const slug = rawSlug
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    return `https://fntd2.com/database/units?=${slug}`;
}

function getSoulValue(unit) {
    const soul = Number(unit?.soulValue ?? unit?.souls ?? 0);
    return Number.isFinite(soul) && soul >= 0 ? soul : 0;
}

function parseOfficialStat(html, label) {
    const safeLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`${safeLabel}\\s*([\\d,.kK+NAna/-]+)`, 'i');
    const match = html.match(regex);
    return match?.[1]?.trim() || '';
}

function parseNumberLike(value) {
    if (!value) return null;
    const normalized = String(value).replace(/,/g, '').toLowerCase();
    if (normalized.includes('k')) {
        const n = parseFloat(normalized.replace(/[^\d.]/g, ''));
        return Number.isFinite(n) ? Math.round(n * 1000) : null;
    }
    const n = parseFloat(normalized.replace(/[^\d.]/g, ''));
    return Number.isFinite(n) ? Math.round(n) : null;
}

function getOfficialDataCache() {
    try {
        return JSON.parse(localStorage.getItem(OFFICIAL_DATA_CACHE_KEY) || '{}');
    } catch (_) {
        return {};
    }
}

function setOfficialDataCache(cache) {
    localStorage.setItem(OFFICIAL_DATA_CACHE_KEY, JSON.stringify(cache));
}

async function fetchOfficialText(url) {
    const res = await fetch(url, { credentials: 'omit' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
}

async function hydrateUnitFromOfficial(unit) {
    const slug = unit.officialPageSlug || unit.name?.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (!slug) return unit;
    const cache = getOfficialDataCache();
    if (cache[slug]) {
        Object.assign(unit, cache[slug]);
        return unit;
    }

    try {
        const [dbHtml, listHtml] = await Promise.all([
            fetchOfficialText(`https://fntd2.com/database/units?=${slug}`),
            fetchOfficialText(`https://fntd2.com/list?id=${slug}`)
        ]);

        const imageMeta = dbHtml.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
            || dbHtml.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
        const placementCost = parseNumberLike(parseOfficialStat(dbHtml, 'Placement Cost'));
        const souls = parseNumberLike(parseOfficialStat(dbHtml, 'Souls')) || parseNumberLike(parseOfficialStat(listHtml, 'CURRENT VALUE'));
        const value = parseOfficialStat(listHtml, 'CURRENT VALUE') || unit.value || 'N/A';
        const demand = parseOfficialStat(listHtml, 'DEMAND') || unit.demand || 'N/A';
        const status = parseOfficialStat(listHtml, 'STATUS') || unit.status || 'N/A';

        const payload = {
            officialPageSlug: slug,
            image: imageMeta?.[1] || unit.image || '',
            imageSourceUrl: `https://fntd2.com/database/units?=${slug}`,
            placementCost: placementCost ?? unit.placementCost ?? 0,
            soulValue: souls ?? unit.soulValue ?? 0,
            value,
            demand,
            status
        };
        Object.assign(unit, payload);
        cache[slug] = payload;
        setOfficialDataCache(cache);
        return unit;
    } catch (error) {
        return unit;
    }
}

async function hydrateUnitsFromOfficialSources() {
    const targets = DB_UNITS.filter(u => !u.image || !u.soulValue || !u.placementCost);
    if (!targets.length) return;
    await Promise.all(targets.slice(0, 30).map(hydrateUnitFromOfficial));
    renderTierlist();
    renderManualBuilderPool();
    renderTeamUnitSelector();
}

function normalizeRankValue(value) {
    if (!value || typeof value !== 'string') return 'N/A';
    const normalized = value.trim().toUpperCase();
    return ['S', 'A', 'B', 'C', 'D', 'F'].includes(normalized) ? normalized : 'N/A';
}

function rankLetterToScore(rank) {
    switch (rank) {
        case 'S': return 1;
        case 'A': return 2;
        case 'B': return 3;
        case 'C': return 4;
        case 'D': return 5;
        case 'F': return 6;
        default: return null;
    }
}

function scoreToRankLetter(score) {
    if (score <= 1.5) return 'S';
    if (score <= 2.5) return 'A';
    if (score <= 3.5) return 'B';
    if (score <= 4.5) return 'C';
    if (score <= 5.5) return 'D';
    return 'F';
}

function computeOverallRank(unit) {
    const values = [
        normalizeRankValue(unit.endlessRank),
        normalizeRankValue(unit.synergyRank),
        normalizeRankValue(unit.obtainabilityRank),
        normalizeRankValue(unit.personalRank?.value)
    ]
        .map(rankLetterToScore)
        .filter(score => score !== null);

    if (values.length === 0) {
        unit.overallRank = 'N/A';
        unit.overallRankScore = null;
        return;
    }

    const average = values.reduce((sum, item) => sum + item, 0) / values.length;
    unit.overallRankScore = Number(average.toFixed(2));
    unit.overallRank = scoreToRankLetter(average);
}

function normalizeUnitData(unit) {
    if (!unit) return;
    unit.endlessRank = normalizeRankValue(unit.endlessRank || unit.rank || 'N/A');
    unit.endlessPlacement = unit.endlessPlacement || unit.rankedId || 'N/A';
    unit.synergyRank = normalizeRankValue(unit.synergyRank || unit.rank || 'N/A');
    unit.synergyPlacement = unit.synergyPlacement || 'N/A';
    unit.obtainabilityRank = normalizeRankValue(unit.obtainabilityRank || unit.rank || 'N/A');
    unit.obtainabilityPlacement = unit.obtainabilityPlacement || 'N/A';

    const personalText = unit.personalRank?.value || unit.personalRank || unit.rank || 'N/A';
    const personalNote = unit.personalRank?.note || unit.personalRankNote || 'No personal note provided.';
    unit.personalRank = {
        value: normalizeRankValue(personalText),
        note: personalNote
    };

    computeOverallRank(unit);
}

function normalizeAllUnitData() {
    if (!Array.isArray(DB_UNITS)) return;
    DB_UNITS.forEach(normalizeUnitData);
}

let teamSlots = Array(6).fill(null);
let activeTeamSlotIndex = null;
let currentTradeTab = 'global';
let tradeOfferUnits = [];
let tradeWantUnits = [];
let tradeSelectorSide = null;
let detailsActiveUnit = null;
let simulatedLevel = 1;
let simulatedEnchant = "None";
let isShinyModeActive = false;
const PAGE_PATH_MAP = {
    "": "page-home",
    "index.html": "page-home",
    "home": "page-home",
    "tierlist": "page-tierlist",
    "generator": "page-generator",
    "codex": "page-codex",
    "profile": "page-profile",
    "team": "page-generator",
    "trade": "page-generator",
    "units": "page-tierlist",
    "database": "page-tierlist",
    "enemies": "page-codex",
    "tos": "page-tos",
    "privacy": "page-privacy"
};
const PAGE_ID_TO_PATH = Object.fromEntries(Object.entries(PAGE_PATH_MAP).map(([path, pageId]) => [pageId, path]));

function getActiveTeam() {
    return teamSlots.filter(Boolean);
}

function syncCurrentTeamWithSlots() {
    currentTeam = getActiveTeam();
}

function clearTeamSlots() {
    teamSlots = Array(6).fill(null);
    syncCurrentTeamWithSlots();
}

function getPageIdFromPath(path) {
    const normalized = path.replace(/\\/g, '/').split('/').filter(Boolean).pop() || '';
    return PAGE_PATH_MAP[normalized] || 'page-home';
}

function updateActiveNav(pageId) {
    document.querySelectorAll('.sidebar .nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-target') === pageId);
    });
}

function navigateToPage(pageId, replace = false) {
    const targetPage = document.getElementById(pageId);
    if (!targetPage) return;
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    targetPage.classList.add('active');
    updateActiveNav(pageId);

    const segment = PAGE_ID_TO_PATH[pageId] || '';
    const url = segment ? `/${segment}` : '/';
    if (replace) {
        history.replaceState({ pageId }, '', url);
    } else {
        history.pushState({ pageId }, '', url);
    }
}

function handleRoute() {
    const pageId = getPageIdFromPath(window.location.pathname);
    navigateToPage(pageId, true);
}

function openTeamUnitSelector(slotIndex) {
    activeTeamSlotIndex = slotIndex;
    const label = document.getElementById('team-selector-slot-label');
    if (label) label.textContent = slotIndex + 1;
    const selector = document.getElementById('team-unit-selector');
    if (selector) {
        selector.classList.remove('hidden');
        selector.classList.add('active-view');
    }
    renderTeamUnitSelector();
}

function closeTeamUnitSelector() {
    activeTeamSlotIndex = null;
    const selector = document.getElementById('team-unit-selector');
    if (selector) {
        selector.classList.remove('active-view');
        selector.classList.add('hidden');
    }
}

function renderTeamSlotGrid() {
    const container = document.getElementById('team-slot-grid');
    if (!container) return;
    container.innerHTML = teamSlots.map((slot, index) => {
        const title = slot ? slot.name : 'Add unit';
        const summary = slot ? `${slot.rarity} · ${slot.class}` : 'Empty slot';
        return `
            <div class="team-slot-card" onclick="openTeamUnitSelector(${index})">
                <div class="slot-index">Slot ${index + 1}</div>
                <div class="slot-title">${title}</div>
                <div class="slot-summary">${summary}</div>
                ${slot ? `<button class="action-btn-secondary small" onclick="event.stopPropagation(); removeTeamMember('${slot.id}')">Remove</button>` : ''}
            </div>
        `;
    }).join('');
}

function renderTeamUnitSelector() {
    const list = document.getElementById('team-selector-list');
    if (!list) return;
    const searchTerm = (document.getElementById('team-selector-search')?.value.trim().toLowerCase() || '');
    const classFilter = document.getElementById('team-selector-class-filter')?.value || 'All';
    const subclassFilter = document.getElementById('team-selector-subclass-filter')?.value || 'All';

    const availableUnits = DB_UNITS.filter(unit => {
        const alreadySelected = teamSlots.some(slot => slot?.id === unit.id);
        const matchesSearch = unit.name.toLowerCase().includes(searchTerm) || unit.id.toLowerCase().includes(searchTerm);
        const matchesClass = classFilter === 'All' || unit.class === classFilter;
        const matchesSubclass = subclassFilter === 'All' || unit.subclasses.includes(subclassFilter);
        return !alreadySelected && matchesSearch && matchesClass && matchesSubclass;
    });

    list.innerHTML = availableUnits.map(unit => {
        const assetId = unit.officialAssetId || OFFICIAL_UNIT_ASSET_IDS[unit.name] || '';
        const assetAttr = assetId ? ` data-unit-asset="${assetId}"` : '';
        return `
        <div class="unit-card-square animate-pop rarity-${unit.rarity.replace(/\s+/g,'-')}" data-unit-id="${unit.id}"${assetAttr} style="background-image: url('${getUnitImageUrl(unit)}'), none;" onclick="setTeamSlotUnit('${unit.id}')">
            <div class="square-title-top">${unit.name}</div>
            <div class="square-cost-bottom">$${unit.placementCost}</div>
            <div class="square-element-icon">${unit.element.substring(0,1).toUpperCase()}</div>
        </div>
    `;
    }).join('');
}

function setTeamSlotUnit(unitId) {
    if (activeTeamSlotIndex === null) return;
    const existingSlot = teamSlots.findIndex(slot => slot?.id === unitId);
    if (existingSlot !== -1) {
        teamSlots[existingSlot] = null;
    }
    const unit = DB_UNITS.find(u => u.id === unitId);
    if (!unit) return;
    teamSlots[activeTeamSlotIndex] = unit;
    syncCurrentTeamWithSlots();
    renderTeamSlotGrid();
    renderGridContainer([], 'generator-grid-container');
    renderManualBuilderPool();
    updateTeamRatingPanel();
    closeTeamUnitSelector();
}

function switchTradeTab(mode) {
    currentTradeTab = mode;
    document.querySelectorAll('.trade-tab').forEach(btn => btn.classList.toggle('active', btn.id === `trade-tab-${mode}`));
    document.getElementById('trade-global-panel').classList.toggle('hidden', mode !== 'global');
    document.getElementById('trade-your-panel').classList.toggle('hidden', mode !== 'your');
    document.getElementById('trade-create-panel').classList.toggle('hidden', mode !== 'create');
    if (mode === 'global' || mode === 'your') {
        renderTradeOffers();
    }
}

function getFirstEmptySlotIndex() {
    const firstEmpty = teamSlots.findIndex(slot => !slot);
    return firstEmpty === -1 ? teamSlots.length - 1 : firstEmpty;
}

function openTradeUnitSelector(side) {
    tradeSelectorSide = side;
    const sideLabel = document.getElementById('trade-selector-side-label');
    if (sideLabel) sideLabel.textContent = side === 'offer' ? 'your offer' : 'their offer';
    const selector = document.getElementById('trade-unit-selector');
    if (selector) {
        selector.classList.remove('hidden');
        selector.classList.add('active-view');
    }
    renderTradeUnitSelector();
}

function closeTradeUnitSelector() {
    tradeSelectorSide = null;
    const selector = document.getElementById('trade-unit-selector');
    if (selector) {
        selector.classList.remove('active-view');
        selector.classList.add('hidden');
    }
}

function renderTradeUnitSelector() {
    const list = document.getElementById('trade-selector-list');
    if (!list) return;
    const searchTerm = (document.getElementById('trade-selector-search')?.value.trim().toLowerCase() || '');
    const classFilter = document.getElementById('trade-selector-class-filter')?.value || 'All';
    const subclassFilter = document.getElementById('trade-selector-subclass-filter')?.value || 'All';

    const allSelectedIds = new Set([...tradeOfferUnits, ...tradeWantUnits].map(u => u.id));

    const availableUnits = DB_UNITS.filter(unit => {
        const alreadySelected = allSelectedIds.has(unit.id);
        const matchesSearch = unit.name.toLowerCase().includes(searchTerm) || unit.id.toLowerCase().includes(searchTerm);
        const matchesClass = classFilter === 'All' || unit.class === classFilter;
        const matchesSubclass = subclassFilter === 'All' || unit.subclasses.includes(subclassFilter);
        return !alreadySelected && matchesSearch && matchesClass && matchesSubclass;
    });

    list.innerHTML = availableUnits.map(unit => {
        const assetId = unit.officialAssetId || OFFICIAL_UNIT_ASSET_IDS[unit.name] || '';
        const assetAttr = assetId ? ` data-unit-asset="${assetId}"` : '';
        return `
        <div class="unit-card-square animate-pop rarity-${unit.rarity.replace(/\s+/g,'-')}" data-unit-id="${unit.id}"${assetAttr} style="background-image: url('${getUnitImageUrl(unit)}'), none;" onclick="selectTradeUnit('${unit.id}')">
            <div class="square-title-top">${unit.name}</div>
            <div class="square-cost-bottom">$${unit.placementCost}</div>
            <div class="square-element-icon">${unit.element.substring(0,1).toUpperCase()}</div>
        </div>
    `;
    }).join('');
}

function selectTradeUnit(unitId) {
    const unit = DB_UNITS.find(u => u.id === unitId);
    if (!unit || !tradeSelectorSide) return;
    const targetList = tradeSelectorSide === 'offer' ? tradeOfferUnits : tradeWantUnits;
    const alreadyExists = targetList.some(item => item.id === unitId);
    if (alreadyExists) return;
    targetList.push(unit);
    renderTradeCreateSelections();
    closeTradeUnitSelector();
}

function removeTradeCreateUnit(side, unitId) {
    const targetList = side === 'offer' ? tradeOfferUnits : tradeWantUnits;
    const index = targetList.findIndex(item => item.id === unitId);
    if (index !== -1) {
        targetList.splice(index, 1);
    }
    renderTradeCreateSelections();
}

function renderTradeCreateSelections() {
    const offerContainer = document.getElementById('trade-offer-units');
    const wantContainer = document.getElementById('trade-want-units');
    if (offerContainer) {
        offerContainer.innerHTML = tradeOfferUnits.length ? tradeOfferUnits.map(unit => `
            <div class="trade-unit-chip">
                ${unit.name}
                <button onclick="removeTradeCreateUnit('offer', '${unit.id}')">×</button>
            </div>
        `).join('') : '<div class="trade-chip-empty">No units selected</div>';
    }
    if (wantContainer) {
        wantContainer.innerHTML = tradeWantUnits.length ? tradeWantUnits.map(unit => `
            <div class="trade-unit-chip">
                ${unit.name}
                <button onclick="removeTradeCreateUnit('want', '${unit.id}')">×</button>
            </div>
        `).join('') : '<div class="trade-chip-empty">No units selected</div>';
    }
}

function resetTradeCreateForm() {
    tradeOfferUnits = [];
    tradeWantUnits = [];
    if (document.getElementById('trade-offer-souls')) document.getElementById('trade-offer-souls').value = '0';
    if (document.getElementById('trade-want-souls')) document.getElementById('trade-want-souls').value = '0';
    renderTradeCreateSelections();
}

function migrateObtainmentsFormat() {
    DB_UNITS.forEach(unit => {
            if (typeof unit.obtainments === 'string') {
            unit.obtainments = [
                { source: "Legacy", chance: 100, method: unit.obtainments }
            ];
        }

        if (!unit.aliases) {
            unit.aliases = [];
        }
        if (!unit.fanmadeBuffs) {
            unit.fanmadeBuffs = [];
        }
        if (!unit.subUnits) {
            unit.subUnits = [];
        }
    });
}


 
function getDeletedUnitIds() {
    try {
        const stored = JSON.parse(localStorage.getItem(DELETED_UNITS_KEY) || '[]');
        return Array.isArray(stored) ? new Set(stored) : new Set();
    } catch (_) {
        return new Set();
    }
}

function saveDeletedUnitIds(idsSet) {
    localStorage.setItem(DELETED_UNITS_KEY, JSON.stringify(Array.from(idsSet)));
}

function saveCustomUnitsToStorage() {
    const customUnits = DB_UNITS.filter(unit => unit.isCustom === true);
    localStorage.setItem(CUSTOM_UNITS_KEY, JSON.stringify(customUnits));
    localStorage.removeItem('fntd2_custom_units');
}

function applyDeletedUnitsFilter() {
    const deletedIds = getDeletedUnitIds();
    for (let i = DB_UNITS.length - 1; i >= 0; i -= 1) {
        if (deletedIds.has(DB_UNITS[i].id)) {
            DB_UNITS.splice(i, 1);
        }
    }
}

function loadCustomUnitsFromStorage() {
    let customUnits = [];
    try {
        customUnits = JSON.parse(localStorage.getItem(CUSTOM_UNITS_KEY) || '[]');
    } catch (_) {
        customUnits = [];
    }

    if (!Array.isArray(customUnits) || !customUnits.length) {
        localStorage.removeItem('fntd2_custom_units');
    }

    customUnits.forEach(unit => {
        const existingIndex = DB_UNITS.findIndex(u => u.id === unit.id);
        const normalized = { ...unit, isCustom: true };
        if (existingIndex >= 0) DB_UNITS[existingIndex] = normalized;
        else DB_UNITS.push(normalized);
    });

    applyDeletedUnitsFilter();
}

function regenerateComputedRanks() {
    ALL_RANKS.forEach(rankKey => {
        const bucket = DB_UNITS.filter(u => u.rank === rankKey);
        if (bucket.length === 0) return;
        bucket.sort((a, b) => (Number(a.rankedId) || 0) - (Number(b.rankedId) || 0));
        const total = bucket.length;
        const slice = Math.max(1, Math.floor(total * 0.33));

        bucket.forEach((unit, idx) => {
            if (!unit.rank) return;
            if (idx < slice) unit.computedRank = `High ${rankKey}`;
            else if (idx >= total - slice) unit.computedRank = `Low ${rankKey}`;
            else unit.computedRank = `Mid ${rankKey}`;
        });
    });
}

function getAdminDraftKey(unitId) {
    return unitId ? `fntd2_admin_unit_draft_${unitId}` : 'fntd2_admin_unit_draft_new';
}

function saveAdminUnitDraft(unitId, draftData) {
    localStorage.setItem(getAdminDraftKey(unitId), JSON.stringify(draftData));
}

function loadAdminUnitDraft(unitId) {
    try {
        return JSON.parse(localStorage.getItem(getAdminDraftKey(unitId)) || 'null');
    } catch (error) {
        return null;
    }
}

function clearAdminUnitDraft(unitId) {
    localStorage.removeItem(getAdminDraftKey(unitId));
}

function applyConfigBindings() {
    document.title = CONFIG.getText('APP_NAME');

    if (CONFIG.BACKGROUND_ASSETS) {
        const root = document.documentElement;
        // Background Asset Paths
        if (CONFIG.BACKGROUND_ASSETS.CACTUS_LEFT) root.style.setProperty('--cactus-left-img', `url('${CONFIG.BACKGROUND_ASSETS.CACTUS_LEFT}')`);
        if (CONFIG.BACKGROUND_ASSETS.CACTUS_RIGHT) root.style.setProperty('--cactus-right-img', `url('${CONFIG.BACKGROUND_ASSETS.CACTUS_RIGHT}')`);
        if (CONFIG.BACKGROUND_ASSETS.HOUSE_1) root.style.setProperty('--house1-img', `url('${CONFIG.BACKGROUND_ASSETS.HOUSE_1}')`);
        if (CONFIG.BACKGROUND_ASSETS.HOUSE_2) root.style.setProperty('--house2-img', `url('${CONFIG.BACKGROUND_ASSETS.HOUSE_2}')`);
        if (CONFIG.BACKGROUND_ASSETS.JUMPING_CUBE) root.style.setProperty('--jumping-cube-img', `url('${CONFIG.BACKGROUND_ASSETS.JUMPING_CUBE}')`);
        
        // Animation & Position Properties
        if (CONFIG.BACKGROUND_ASSETS.JUMPING_SPEED) {
            root.style.setProperty('--jumping-speed', CONFIG.BACKGROUND_ASSETS.JUMPING_SPEED);
            root.style.setProperty('--tumbleweed-speed', CONFIG.BACKGROUND_ASSETS.JUMPING_SPEED);
        }
        if (CONFIG.BACKGROUND_ASSETS.JUMP_HEIGHT) root.style.setProperty('--jump-height', CONFIG.BACKGROUND_ASSETS.JUMP_HEIGHT);
        
        // Sky & Sunset Colors
        if (CONFIG.BACKGROUND_ASSETS.SKY_COLOR) root.style.setProperty('--sky-color', CONFIG.BACKGROUND_ASSETS.SKY_COLOR);
        if (CONFIG.BACKGROUND_ASSETS.SKY_GRADIENT_START) root.style.setProperty('--sky-gradient-start', CONFIG.BACKGROUND_ASSETS.SKY_GRADIENT_START);
        if (CONFIG.BACKGROUND_ASSETS.SKY_GRADIENT_END) root.style.setProperty('--sky-gradient-end', CONFIG.BACKGROUND_ASSETS.SKY_GRADIENT_END);
        
        // Sun Configuration
        if (CONFIG.BACKGROUND_ASSETS.SUN_COLOR) root.style.setProperty('--sun-color', CONFIG.BACKGROUND_ASSETS.SUN_COLOR);
        if (CONFIG.BACKGROUND_ASSETS.SUN_SIZE) root.style.setProperty('--sun-size', CONFIG.BACKGROUND_ASSETS.SUN_SIZE);
        if (CONFIG.BACKGROUND_ASSETS.SUN_POSITION_BOTTOM) root.style.setProperty('--sun-position-bottom', CONFIG.BACKGROUND_ASSETS.SUN_POSITION_BOTTOM);
        if (CONFIG.BACKGROUND_ASSETS.SUN_POSITION_LEFT) root.style.setProperty('--sun-position-left', CONFIG.BACKGROUND_ASSETS.SUN_POSITION_LEFT);
        if (CONFIG.BACKGROUND_ASSETS.SUN_BLUR_GLOW) root.style.setProperty('--sun-blur-glow', CONFIG.BACKGROUND_ASSETS.SUN_BLUR_GLOW);
        if (CONFIG.BACKGROUND_ASSETS.SUN_ANIMATION_SPEED) root.style.setProperty('--sun-animation-speed', CONFIG.BACKGROUND_ASSETS.SUN_ANIMATION_SPEED);
        
        // Ground & Terrain
        if (CONFIG.BACKGROUND_ASSETS.GROUND_COLOR) root.style.setProperty('--ground-color', CONFIG.BACKGROUND_ASSETS.GROUND_COLOR);
        if (CONFIG.BACKGROUND_ASSETS.GROUND_HEIGHT) root.style.setProperty('--ground-height', CONFIG.BACKGROUND_ASSETS.GROUND_HEIGHT);
        if (CONFIG.BACKGROUND_ASSETS.GROUND_BORDER_COLOR) root.style.setProperty('--ground-border-color', CONFIG.BACKGROUND_ASSETS.GROUND_BORDER_COLOR);
        
        // Element Position Overrides
        if (CONFIG.BACKGROUND_ASSETS.CACTUS_LEFT_BOTTOM) root.style.setProperty('--cactus-left-bottom', CONFIG.BACKGROUND_ASSETS.CACTUS_LEFT_BOTTOM);
        if (CONFIG.BACKGROUND_ASSETS.CACTUS_LEFT_2_BOTTOM) root.style.setProperty('--cactus-left-2-bottom', CONFIG.BACKGROUND_ASSETS.CACTUS_LEFT_2_BOTTOM);
        if (CONFIG.BACKGROUND_ASSETS.CACTUS_RIGHT_BOTTOM) root.style.setProperty('--cactus-right-bottom', CONFIG.BACKGROUND_ASSETS.CACTUS_RIGHT_BOTTOM);
        if (CONFIG.BACKGROUND_ASSETS.CACTUS_RIGHT_2_BOTTOM) root.style.setProperty('--cactus-right-2-bottom', CONFIG.BACKGROUND_ASSETS.CACTUS_RIGHT_2_BOTTOM);
        if (CONFIG.BACKGROUND_ASSETS.HOUSE_1_BOTTOM) root.style.setProperty('--house-1-bottom', CONFIG.BACKGROUND_ASSETS.HOUSE_1_BOTTOM);
        if (CONFIG.BACKGROUND_ASSETS.HOUSE_2_BOTTOM) root.style.setProperty('--house-2-bottom', CONFIG.BACKGROUND_ASSETS.HOUSE_2_BOTTOM);
        if (CONFIG.BACKGROUND_ASSETS.TUMBLEWEED_BOTTOM) root.style.setProperty('--tumbleweed-bottom', CONFIG.BACKGROUND_ASSETS.TUMBLEWEED_BOTTOM);
    }

    document.querySelectorAll('[data-config-text]').forEach(element => {
        const configKey = element.dataset.configText;
        if (!configKey) return;
        const text = CONFIG.getText(configKey);
        if (text && text !== configKey) {
            element.textContent = text;
        }
    });

    document.querySelectorAll('[data-config-placeholder]').forEach(element => {
        const configKey = element.dataset.configPlaceholder;
        if (!configKey) return;
        const text = CONFIG.getText(configKey);
        if (text && text !== configKey) {
            element.placeholder = text;
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    migrateObtainmentsFormat();
    normalizeAllUnitData();
    loadCustomUnitsFromStorage();
    regenerateComputedRanks();
    applyConfigBindings();
    initViewRoutingNavs();
    initProfileAndTrading();
    buildFilterCheckboxLayouts();
    renderTierlist();
    renderEnemyCodex();
    renderManualBuilderPool();
    renderTeamSlotGrid();
    switchTeamCreatorTab('generate');
    initSystemModalEvents();
    restoreVisualSettings();
    initBulletHoleFx();
    hydrateUnitsFromOfficialSources();
    handleRoute();
    window.addEventListener('popstate', handleRoute);
    initWelcomeModal();
});

 
function initViewRoutingNavs() {
    document.querySelectorAll('.sidebar .nav-btn').forEach(btn => {
        btn.addEventListener('click', (event) => {
            event.preventDefault();
            const target = btn.getAttribute('data-target');
            if (target) {
                navigateToPage(target);
            }
        });
    });
}

function switchView(targetPageId) {
    document.querySelectorAll('.sidebar .nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    document.getElementById(targetPageId).classList.add('active');
    const sideBtn = document.querySelector(`.sidebar .nav-btn[data-target="${targetPageId}"]`);
    if(sideBtn) sideBtn.classList.add('active');
}

function getSavedProfile() {
    try {
        return JSON.parse(localStorage.getItem('fntd2_profile') || 'null');
    } catch (err) {
        return null;
    }
}

function saveProfile(profile) {
    localStorage.setItem('fntd2_profile', JSON.stringify(profile));
}

function clearProfile() {
    localStorage.removeItem('fntd2_profile');
}

function parseAuthRedirect() {
    const params = new URLSearchParams(window.location.search);
    const authToken = params.get('auth_token') || params.get('token');
    const robloxId = params.get('robloxId') || params.get('roblox_id');
    const robloxName = params.get('robloxName') || params.get('roblox_name');
    if (authToken && (robloxId || robloxName)) {
        const profile = {
            token: authToken,
            robloxId: robloxId || 'unknown',
            robloxName: robloxName || 'unknown',
            createdAt: new Date().toISOString(),
        };
        saveProfile(profile);
        params.delete('auth_token');
        params.delete('token');
        params.delete('robloxId');
        params.delete('roblox_id');
        params.delete('robloxName');
        params.delete('roblox_name');
        const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
        window.history.replaceState({}, '', newUrl);
        return profile;
    }
    return getSavedProfile();
}

function openRobloxAuth() {
    const oauthUrl = CONFIG.LINKS.ROBLOX_OAUTH_URL || 'https://your-cloudflare-domain.com/auth/roblox';
    const redirect = encodeURIComponent(window.location.origin + window.location.pathname);
    window.location.href = `${oauthUrl}?redirect_uri=${redirect}`;
}

function logoutProfile() {
    clearProfile();
    renderProfileState();
    updateTradingAuthUI();
    renderTradeOffers();
}

function renderProfileState() {
    const profile = getSavedProfile();
    const profileCard = document.getElementById('profile-card');
    const loginButton = document.getElementById('profile-login-button');
    const logoutButton = document.getElementById('profile-logout-button');

    if (!profile) {
        profileCard.innerHTML = `<div class="profile-block"><p>${CONFIG.getText('PROFILE.NOT_LOGGED_IN')}</p></div>`;
        loginButton.style.display = 'inline-flex';
        logoutButton.style.display = 'none';
        return;
    }

    const userName = profile.robloxName || 'Roblox User';
    profileCard.innerHTML = `
        <div class="profile-block">
            <div class="profile-header"><h3>${CONFIG.getText('PROFILE.WELCOME_BACK').replace('{name}', userName)}</h3></div>
            <div class="profile-detail-row"><span>${CONFIG.getText('PROFILE.PROFILE_USERNAME')}</span><strong>${userName}</strong></div>
            <div class="profile-detail-row"><span>${CONFIG.getText('PROFILE.PROFILE_USER_ID')}</span><strong>${profile.robloxId || 'unknown'}</strong></div>
            <div class="profile-detail-row"><span>${CONFIG.getText('PROFILE.PROFILE_SESSION')}</span><strong>${profile.token ? profile.token.substring(0, 16) + '...' : 'n/a'}</strong></div>
        </div>
    `;
    loginButton.style.display = 'none';
    logoutButton.style.display = 'inline-flex';
}

function loadTradeOffers() {
    try {
        return JSON.parse(localStorage.getItem('fntd2_trade_offers') || '[]');
    } catch (err) {
        return [];
    }
}

function saveTradeOffers(offers) {
    localStorage.setItem('fntd2_trade_offers', JSON.stringify(offers));
}

function populateTradeUnitSelect() {
    const select = document.getElementById('trade-unit-select');
    if (!select) return;
    select.innerHTML = DB_UNITS.map(unit => `<option value="${unit.id}">${unit.name} (${unit.id})</option>`).join('');
}

function updateTradingAuthUI() {
    const profile = getSavedProfile();
    const warning = document.getElementById('trade-auth-warning');
    const createButton = document.getElementById('trade-submit-button');
    const offerButton = document.getElementById('trade-add-offer-unit-button');
    const wantButton = document.getElementById('trade-add-want-unit-button');
    const tradeWrapper = document.getElementById('trade-form-wrapper');
    if (!warning) return;
    if (!profile) {
        warning.className = 'trade-notice-card warning';
        warning.textContent = CONFIG.getText('TRADING.LOGIN_PROMPT');
        if (createButton) createButton.disabled = true;
        if (offerButton) offerButton.disabled = true;
        if (wantButton) wantButton.disabled = true;
        if (tradeWrapper) {
            tradeWrapper.style.pointerEvents = 'none';
            tradeWrapper.style.opacity = '0.6';
        }
        return;
    }
    warning.className = 'trade-notice-card success';
    warning.textContent = `${profile.robloxName || 'Roblox User'} is logged in.`;
    if (createButton) createButton.disabled = false;
    if (offerButton) offerButton.disabled = false;
    if (wantButton) wantButton.disabled = false;
    if (tradeWrapper) {
        tradeWrapper.style.pointerEvents = 'auto';
        tradeWrapper.style.opacity = '1';
    }
}

function formatTradeUnitList(units) {
    if (!units || !units.length) {
        return `<div class="trade-empty-state">${CONFIG.getText('TRADING.NO_UNITS_SELECTED')}</div>`;
    }
    return units.map(unit => `
        <div class="trade-unit-chip">
            ${unit.name}
        </div>
    `).join('');
}

function renderTradeOfferCard(offer, index, profile) {
    const canDelete = profile && profile.robloxId === offer.ownerId;
    const deleteButton = canDelete ? `<button class="action-btn-secondary small" onclick="removeTradeOffer(${index})">${CONFIG.getText('TRADING.OFFER_DELETE')}</button>` : '';
    const offerUnitsHtml = offer.offerUnits && offer.offerUnits.length
        ? offer.offerUnits.map(unit => `<span class="trade-unit-chip">${unit.name}</span>`).join('')
        : `<span class="trade-chip-empty">${CONFIG.getText('TRADING.NO_UNITS_SELECTED')}</span>`;
    const wantUnitsHtml = offer.wantUnits && offer.wantUnits.length
        ? offer.wantUnits.map(unit => `<span class="trade-unit-chip">${unit.name}</span>`).join('')
        : `<span class="trade-chip-empty">${CONFIG.getText('TRADING.NO_UNITS_SELECTED')}</span>`;
    return `
        <div class="trade-offer-card">
            <div class="trade-card-row"><strong>${CONFIG.getText('TRADING.OFFER_OWNER')}</strong><span>${offer.ownerName}</span></div>
            <div class="trade-card-row"><strong>${CONFIG.getText('TRADING.OFFER_YOUR_OFFER')}</strong><span>${offerUnitsHtml}${offer.offerSouls ? `<div class="trade-souls-tag">+ ${offer.offerSouls} souls</div>` : ''}</span></div>
            <div class="trade-card-row"><strong>${CONFIG.getText('TRADING.OFFER_THEIR_OFFER')}</strong><span>${wantUnitsHtml}${offer.wantSouls ? `<div class="trade-souls-tag">+ ${offer.wantSouls} souls</div>` : ''}</span></div>
            <div class="trade-card-footer"><small>${new Date(offer.createdAt).toLocaleString()}</small>${deleteButton}</div>
        </div>
    `;
}

function renderTradeOffers() {
    const globalOfferList = document.getElementById('trade-global-offers');
    const yourOfferList = document.getElementById('trade-your-offers');
    if (!globalOfferList || !yourOfferList) return;

    const offers = loadTradeOffers();
    const profile = getSavedProfile();

    if (offers.length === 0) {
        globalOfferList.innerHTML = `<div class="trade-empty-state">${CONFIG.getText('TRADING.NO_OFFERS')}</div>`;
    } else {
        globalOfferList.innerHTML = offers.map((offer, index) => renderTradeOfferCard(offer, index, profile)).join('');
    }

    const yourOffers = offers
        .map((offer, index) => ({ offer, index }))
        .filter(item => profile && item.offer.ownerId === profile.robloxId)
        .map(item => renderTradeOfferCard(item.offer, item.index, profile));

    yourOfferList.innerHTML = yourOffers.length ? yourOffers.join('') : `<div class="trade-empty-state">${CONFIG.getText('TRADING.NO_OFFERS')}</div>`;
}

function removeTradeOffer(index) {
    const profile = getSavedProfile();
    const offers = loadTradeOffers();
    const offer = offers[index];
    if (!profile || !offer || offer.ownerId !== profile.robloxId) {
        return;
    }
    offers.splice(index, 1);
    saveTradeOffers(offers);
    renderTradeOffers();
}

function createTradeOffer() {
    const profile = getSavedProfile();
    if (!profile) {
        alert(CONFIG.getText('TRADING.TRADE_CREATION_ERROR'));
        return;
    }

    if (!tradeOfferUnits.length && !tradeWantUnits.length) {
        alert(CONFIG.getText('TRADING.TRADE_CREATION_ERROR'));
        return;
    }

    const offerSouls = parseInt(document.getElementById('trade-offer-souls')?.value, 10) || 0;
    const wantSouls = parseInt(document.getElementById('trade-want-souls')?.value, 10) || 0;

    const newOffer = {
        offerUnits: tradeOfferUnits.map(unit => ({ id: unit.id, name: unit.name })),
        wantUnits: tradeWantUnits.map(unit => ({ id: unit.id, name: unit.name })),
        offerSouls,
        wantSouls,
        ownerId: profile.robloxId,
        ownerName: profile.robloxName,
        createdAt: new Date().toISOString(),
    };

    const offers = loadTradeOffers();
    offers.unshift(newOffer);
    saveTradeOffers(offers);
    renderTradeOffers();
    resetTradeCreateForm();
    alert(CONFIG.getText('TRADING.TRADE_CREATED'));

    const apiUrl = CONFIG.LINKS.TRADE_API_URL;
    if (apiUrl && apiUrl.includes('http')) {
        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${profile.token}`,
            },
            body: JSON.stringify(newOffer),
        }).catch(() => {
            // Leave local store as fallback if API call is unavailable.
        });
    }
}

function initProfileAndTrading() {
    parseAuthRedirect();
    renderProfileState();
    renderTradeCreateSelections();
    updateTradingAuthUI();
    renderTradeOffers();
}

 
function buildFilterCheckboxLayouts() {
    const rBox = document.getElementById('finder-rarities-box');
    if (rBox) {
        Object.keys(DB_RARITIES).forEach(r => {
            rBox.innerHTML += `<label><input type="checkbox" value="${r}" class="rarity-cb" checked onchange="syncFilterState()"> ${r}</label>`;
        });
    }

    const rkBox = document.getElementById('finder-ranks-box');
    if (rkBox) {
        ALL_RANKS.forEach(rk => {
            ['High', 'Mid', 'Low'].forEach(prefix => {
                const labelStr = `${prefix} ${rk}`;
                rkBox.innerHTML += `<label><input type="checkbox" value="${labelStr}" class="rank-cb" checked onchange="syncFilterState()"> ${labelStr}</label>`;
            });
        });
    }

    const cBox = document.getElementById('finder-classes-box');
    if (cBox) {
        ALL_CLASSES.forEach(c => {
            cBox.innerHTML += `<label><input type="checkbox" value="${c}" class="class-cb" checked onchange="syncFilterState()"> ${c}</label>`;
        });
    }

    const sBox = document.getElementById('finder-subclasses-box');
    if (sBox) {
        ALL_SUBCLASSES.forEach(s => {
            sBox.innerHTML += `<label><input type="checkbox" value="${s}" class="subclass-cb" checked onchange="syncFilterState()"> ${s}</label>`;
        });
    }

    const synDropdown = document.getElementById('finder-synergy-dropdown');
    if (synDropdown) {
        ALL_SYNERGIES.forEach(syn => {
            synDropdown.innerHTML += `<option value="${syn}">${syn}</option>`;
        });
    }

    const genClsBox = document.getElementById('gen-classes-box');
    if (genClsBox) {
        ALL_CLASSES.forEach(c => {
            genClsBox.innerHTML += `<label><input type="checkbox" value="${c}" class="gen-class-cb" checked> ${c}</label>`;
        });
    }
    const genSubBox = document.getElementById('gen-subclasses-box');
    if (genSubBox) {
        ALL_SUBCLASSES.forEach(s => {
            genSubBox.innerHTML += `<label><input type="checkbox" value="${s}" class="gen-subclass-cb" checked> ${s}</label>`;
        });
    }

    const builderClassFilter = document.getElementById('team-builder-class-filter');
    if (builderClassFilter) {
        ALL_CLASSES.forEach(c => {
            builderClassFilter.innerHTML += `<option value="${c}">${c}</option>`;
        });
    }
    const builderSubclassFilter = document.getElementById('team-builder-subclass-filter');
    if (builderSubclassFilter) {
        ALL_SUBCLASSES.forEach(s => {
            builderSubclassFilter.innerHTML += `<option value="${s}">${s}</option>`;
        });
    }

    const selectorClassFilter = document.getElementById('team-selector-class-filter');
    if (selectorClassFilter) {
        ALL_CLASSES.forEach(c => {
            selectorClassFilter.innerHTML += `<option value="${c}">${c}</option>`;
        });
    }
    const selectorSubclassFilter = document.getElementById('team-selector-subclass-filter');
    if (selectorSubclassFilter) {
        ALL_SUBCLASSES.forEach(s => {
            selectorSubclassFilter.innerHTML += `<option value="${s}">${s}</option>`;
        });
    }

    const tEl = document.getElementById('tier-filter-element');
    if (tEl) {
        Object.keys(DB_ELEMENTS).forEach(e => tEl.innerHTML += `<option value="${e}">${e}</option>`);
    }
    const tCl = document.getElementById('tier-filter-class');
    if (tCl) {
        tCl.innerHTML = `<option value="All">All Classes</option>`;
        ALL_CLASSES.forEach(c => tCl.innerHTML += `<option value="${c}">${c}</option>`);
        tCl.value = 'All';
        tCl.addEventListener('change', () => {
            updateTierlistSubclassOptions();
            renderTierlist();
        });
    }
    const tSb = document.getElementById('tier-filter-subclass');
    if (tSb) {
        updateTierlistSubclassOptions();
    }

    const genElementFilter = document.getElementById('gen-element-filter');
    if (genElementFilter) {
        Object.keys(DB_ELEMENTS).forEach(element => {
            genElementFilter.innerHTML += `<option value="${element}">${element}</option>`;
        });
    }

    syncFilterState();
}

function updateTierlistSubclassOptions() {
    const tCl = document.getElementById('tier-filter-class');
    const tSb = document.getElementById('tier-filter-subclass');
    if (!tCl || !tSb) return;
    const classValue = tCl.value;
    const source = classValue === 'All' ? DB_UNITS : DB_UNITS.filter(u => u.class === classValue);
    const subclassSet = new Set(source.flatMap(u => u.subclasses || []));
    tSb.innerHTML = '<option value="All">All Subclasses</option>';
    Array.from(subclassSet).forEach(sub => {
        tSb.innerHTML += `<option value="${sub}">${sub}</option>`;
    });
    if (!Array.from(subclassSet).includes(tSb.value)) {
        tSb.value = 'All';
    }
}

function getTierlistDescriptor(classValue, subclassValue, rankType, rankValue) {
    const rankTypeText = rankType === 'All' ? 'all rank categories' : `${rankType} rank values`;
    const rankValueText = rankValue === 'All' ? 'all ranks' : `${rankValue}-ranked units only`;
    const classText = classValue ? `${classValue} units are grouped by position in the game and power curve.` : 'Select a class to narrow results.';
    const subclassText = subclassValue ? `${subclassValue} units are the subtype shown for this filter.` : 'Select a subclass to apply the filter.';

    return [
        `Showing ${rankValueText} for ${classValue} / ${subclassValue}.`,
        `${classText}`,
        `${subclassText}`,
        `This view compares ${rankTypeText} in the selected unit group. S is the strongest tier, A is excellent, B is solid, C is situational, and D / F are for niche or challenge builds.`,
        `Click any card to open the official FNTD2 database page in a new tab.`
    ];
}

function updateTierlistExplanationText(classValue, subclassValue, rankType, rankValue) {
    const panel = document.querySelector('.tierlist-note-panel');
    if (!panel) return;
    const lines = classValue && subclassValue
        ? getTierlistDescriptor(classValue, subclassValue, rankType, rankValue)
        : ['Pick a class and subclass to review ranks and placements for that unit group.'];
    panel.innerHTML = lines.map(line => `<p>${line}</p>`).join('');
}

function syncFilterState() {
    currentFiltersState.rarities = Array.from(document.querySelectorAll('.rarity-cb:checked')).map(cb => cb.value);
    currentFiltersState.ranks = Array.from(document.querySelectorAll('.rank-cb:checked')).map(cb => cb.value);
    currentFiltersState.classes = Array.from(document.querySelectorAll('.class-cb:checked')).map(cb => cb.value);
    currentFiltersState.subclasses = Array.from(document.querySelectorAll('.subclass-cb:checked')).map(cb => cb.value);
    currentFiltersState.sort = document.getElementById('sort-rarity')?.value || 'high-low';
    currentFiltersState.synergy = document.getElementById('finder-synergy-dropdown')?.value || 'All';
    currentFiltersState.search = document.getElementById('search-id')?.value.trim().toLowerCase() || '';
}

function applyFinderFilters() {
    syncFilterState();

    let output = DB_UNITS.filter(u => {
        const matchSearch = u.id.toLowerCase().includes(currentFiltersState.search) || u.name.toLowerCase().includes(currentFiltersState.search);
        const matchRarity = currentFiltersState.rarities.includes(u.rarity);
        const matchRank = currentFiltersState.ranks.includes(u.computedRank);
        const matchClass = currentFiltersState.classes.includes(u.class);
        const matchSubclass = u.subclasses.some(sub => currentFiltersState.subclasses.includes(sub));
        const matchSynergy = currentFiltersState.synergy === "All" || u.synergy === currentFiltersState.synergy;

        return matchSearch && matchRarity && matchRank && matchClass && matchSubclass && matchSynergy;
    });

    output.sort((a, b) => {
        let weightA = DB_RARITIES[a.rarity]?.index || 99;
        let weightB = DB_RARITIES[b.rarity]?.index || 99;
        return currentFiltersState.sort === 'high-low' ? weightA - weightB : weightB - weightA;
    });

    renderGridContainer(output, 'finder-grid-container');
}

function clearAllFilters() {
    document.querySelectorAll('.filters-sidebar input[type="checkbox"]').forEach(cb => cb.checked = true);
    const searchField = document.getElementById('search-id');
    if (searchField) searchField.value = "";
    const synergyDropdown = document.getElementById('finder-synergy-dropdown');
    if (synergyDropdown) synergyDropdown.value = "All";
    const sortDropdown = document.getElementById('sort-rarity');
    if (sortDropdown) sortDropdown.value = "high-low";
    applyFinderFilters();
}

function renderGridContainer(units, containerId, emptyNotice = null) {
    const grid = document.getElementById(containerId);
    if (!grid) return;
    grid.innerHTML = "";

    if (!units || units.length === 0) {
        const message = emptyNotice || CONFIG.getText('FINDER.NO_RESULTS');
        grid.innerHTML = `<div style="color:var(--text-body-muted); padding:20px; font-size:14px;">${message}</div>`;
        return;
    }

    units.forEach(unit => {
        const card = document.createElement('div');
        card.className = 'unit-card-square animate-pop rarity-' + (unit.rarity || '').replace(/\s+/g,'-');
        card.dataset.unitId = unit.id;
        const assetId = unit.officialAssetId || OFFICIAL_UNIT_ASSET_IDS[unit.name];
        if (assetId) card.dataset.unitAsset = assetId;
        
        const rarityMeta = DB_RARITIES[unit.rarity];
        if (rarityMeta && rarityMeta.color.includes('gradient')) {
            card.style.borderImage = `${rarityMeta.color} 1`;
            card.style.borderColor = 'transparent';
        } else if(rarityMeta) {
            card.style.borderColor = rarityMeta.color;
            card.style.borderImage = 'none';
        }

        card.style.backgroundImage = `url('${getUnitImageUrl(unit)}'), none`;

        card.innerHTML = `
            <div class="square-title-top">${unit.name}</div>
            <div class="square-cost-bottom">$${unit.placementCost}</div>
            <div class="square-element-icon">${unit.element.substring(0,1).toUpperCase()}</div>
        `;

        card.style.cursor = 'pointer';
        card.addEventListener('mouseenter', (e) => triggerTooltipShow(unit, e));
        card.addEventListener('mousemove', triggerTooltipMove);
        card.addEventListener('mouseleave', triggerTooltipHide);
        card.addEventListener('click', () => openOfficialUnitPage(unit));

        grid.appendChild(card);
    });
}

function openOfficialUnitPage(unit) {
    const url = getOfficialUnitUrl(unit);
    window.open(url, '_blank', 'noopener');
}

function clearGridContainer(containerId, message = '') {
    const grid = document.getElementById(containerId);
    if (!grid) return;
    grid.innerHTML = `<div style="color:var(--text-body-muted); padding:20px; font-size:14px;">${message || CONFIG.getText('FINDER.NO_RESULTS')}</div>`;
}

const tooltipNode = document.getElementById('hud-tooltip');

function triggerTooltipShow(unit, event) {
    const endlessRank = unit.endlessRank || 'N/A';
    const endlessPlacement = unit.endlessPlacement || 'N/A';
    const synergyRank = unit.synergyRank || 'N/A';
    const synergyPlacement = unit.synergyPlacement || 'N/A';
    const obtainabilityRank = unit.obtainabilityRank || 'N/A';
    const obtainabilityPlacement = unit.obtainabilityPlacement || 'N/A';
    const personalRankValue = unit.personalRank?.value || 'N/A';
    const overallRank = unit.overallRank || 'N/A';

    const soulValue = getSoulValue(unit);
    const html = `
        <div class="tt-line tt-title"><span>${unit.name}</span><span>${unit.id}</span></div>
        <div class="tt-line"><span style="color:var(--text-body-muted)">Endless Rank:</span><span style="color:var(--color-accent-blue); font-weight:700;">${endlessRank}</span></div>
        <div class="tt-line"><span style="color:var(--text-body-muted)">Placement:</span><span>#${endlessPlacement}</span></div>
        <div class="tt-line"><span style="color:var(--text-body-muted)">Synergy Rank:</span><span>${synergyRank}</span></div>
        <div class="tt-line"><span style="color:var(--text-body-muted)">Placement:</span><span>#${synergyPlacement}</span></div>
        <div class="tt-line"><span style="color:var(--text-body-muted)">Obtainability Rank:</span><span>${obtainabilityRank}</span></div>
        <div class="tt-line"><span style="color:var(--text-body-muted)">Placement:</span><span>#${obtainabilityPlacement}</span></div>
        <div class="tt-line"><span style="color:var(--text-body-muted)">Personal Rank:</span><span>${personalRankValue}</span></div>
        <div class="tt-line"><span style="color:var(--text-body-muted)">Overall Rank:</span><span>${overallRank}</span></div>
        <div class="tt-line"><span style="color:var(--text-body-muted)">Souls:</span><strong>${soulValue.toLocaleString()}</strong></div>
        <div class="tt-line"><span style="color:var(--text-body-muted)">Value:</span><span>${unit.value || 'N/A'}</span></div>
    `;

    tooltipNode.innerHTML = html;
    tooltipNode.style.display = 'block';
    tooltipNode.classList.remove('hidden-node');
}

function triggerTooltipMove(e) {
    tooltipNode.style.left = (e.clientX + 16) + 'px';
    tooltipNode.style.top = (e.clientY + 16) + 'px';
}

function triggerTooltipHide() {
    tooltipNode.classList.add('hidden-node');
    tooltipNode.style.display = 'none';
}

function toggleShinyState() {
    isShinyModeActive = document.getElementById('toggle-shiny').checked;
    isShinyModeActive ? document.body.classList.add('shiny-active-frame') : document.body.classList.remove('shiny-active-frame');
}

function toggleCostVisibility() {
    document.getElementById('toggle-cost-view').checked ? document.body.classList.remove('hide-placement-costs') : document.body.classList.add('hide-placement-costs');
}

 
function renderTierlist() {
    const container = document.getElementById('tierlist-rows-wrapper');
    container.innerHTML = "";

    const elFilter = document.getElementById('tier-filter-element')?.value || 'All';
    const clFilter = document.getElementById('tier-filter-class')?.value || '';
    const subFilter = document.getElementById('tier-filter-subclass')?.value || '';
    const rankType = document.getElementById('tier-filter-ranktype')?.value || 'All';
    const rankValue = document.getElementById('tier-filter-rankvalue')?.value || 'All';
    const soulMin = Number(document.getElementById('tier-filter-soul-min')?.value || 0);
    const soulMaxRaw = Number(document.getElementById('tier-filter-soul-max')?.value || 0);
    const hasSoulMax = soulMaxRaw > 0;

    const getRankValue = (unit) => {
        switch (rankType) {
            case 'Endless': return unit.endlessRank;
            case 'Personal': return unit.personalRank?.value;
            case 'Synergy': return unit.synergyRank;
            case 'Obtainability': return unit.obtainabilityRank;
            case 'Overall': return unit.overallRank;
            default: return null;
        }
    };

    ALL_RANKS.forEach(tier => {
        let matchingTierUnits = DB_UNITS.filter(u => {
            const baseTier = normalizeRankValue(u.rank || u.endlessRank || u.overallRank);
            if (baseTier !== tier) return false;
            if (elFilter !== "All" && u.element !== elFilter) return false;
            if (clFilter && clFilter !== "All" && u.class !== clFilter) return false;
            if (subFilter && subFilter !== "All" && !u.subclasses.includes(subFilter)) return false;
            if (rankType !== 'All') {
                const compareRank = getRankValue(u) || 'N/A';
                if (rankValue !== 'All' && compareRank !== rankValue) return false;
            }
            const soulValue = getSoulValue(u);
            if (soulValue < soulMin) return false;
            if (hasSoulMax && soulValue > soulMaxRaw) return false;
            return true;
        });

        matchingTierUnits.sort((a, b) => (Number(a.endlessPlacement) || 0) - (Number(b.endlessPlacement) || 0));
        if (matchingTierUnits.length === 0) return;

        const rowNode = document.createElement('div');
        rowNode.className = 'tier-strip-row animate-pop';
        rowNode.innerHTML = `
            <div class="tier-strip-badge t-label-${tier}">${tier}</div>
            <div class="tier-strip-body" id="tier-body-target-${tier}"></div>
        `;
        container.appendChild(rowNode);
        renderGridContainer(matchingTierUnits, `tier-body-target-${tier}`);
    });

    if (!container.children.length) {
        container.innerHTML = `<div style="color:var(--text-body-muted); padding:20px; font-size:14px;">No ranked units match your filters. Try widening class/subclass or soul range.</div>`;
    }
    updateTierlistExplanationText(clFilter, subFilter, rankType, rankValue);
}

 
function renderEnemyCodex() {
    const container = document.getElementById('codex-grid-container');
    const query = document.getElementById('enemy-search-id').value.trim().toLowerCase();
    container.innerHTML = "";

    let filteredEnemies = DB_ENEMIES.filter(e => e.name.toLowerCase().includes(query) || e.traits.toLowerCase().includes(query));

    if(filteredEnemies.length === 0) {
        container.innerHTML = `<div style="color:var(--text-body-muted); padding:20px;">${CONFIG.getText('CODEX.NO_RESULTS')}</div>`;
        return;
    }

    filteredEnemies.forEach(enemy => {
        container.innerHTML += `
            <div class="enemy-card animate-pop">
                <h3>${enemy.name}</h3>
                <div class="enemy-stat-row"><span class="enemy-stat-label">Health Pool:</span><span class="enemy-stat-value">${enemy.hp.toLocaleString()}</span></div>
                <div class="enemy-stat-row"><span class="enemy-stat-label">Speed Parameter:</span><span class="enemy-stat-value">${enemy.speed}</span></div>
                <div class="enemy-stat-row"><span class="enemy-stat-label">Intro Wave:</span><span class="enemy-stat-value">Wave ${enemy.introWave}</span></div>
                <div style="margin-top:10px; font-size:12px; color:var(--text-body-main); line-height:1.4;"><strong>Traits:</strong> ${enemy.traits}</div>
            </div>
        `;
    });
}

 
function visualizeSpecificUnitSubpage(unit) {
    openOfficialUnitPage(unit);
}

function openUnitDetailsById(unitId) {
    const unit = DB_UNITS.find(u => u.id === unitId);
    if (!unit) {
        alert(`Unit with ID "${unitId}" could not be found.`);
        return;
    }
    detailsActiveUnit = unit;
    simulatedLevel = 1;
    simulatedEnchant = "None";
    switchView('page-details');
    executeDetailsDisplayDraw();
}

function executeDetailsDisplayDraw() {
    const target = document.getElementById('details-view-injector');
    const unit = detailsActiveUnit;
    if(!unit) return;

    const elementMeta = DB_ELEMENTS[unit.element] || { passiveUnit: "Unknown", passiveEnemy: "Unknown" };
    let rarityMeta = DB_RARITIES[unit.rarity];
    let frameBorderStyle = rarityMeta?.color.includes('gradient') ? `border-image: ${rarityMeta.color} 1; border-color: transparent;` : `border-color: ${rarityMeta?.color || '#555'};`;

    const statsTabContent = `
        <div class="specs-block-card">
            <h4>${CONFIG.getText('DETAILS.CALCULATOR_TITLE')}</h4>
            <div class="interactive-calc-wrapper">
                <div class="calc-control-node">
                    <label for="detail-level-input">${CONFIG.getText('DETAILS.LEVEL_LABEL')}</label>
                    <input type="number" id="detail-level-input" min="1" max="60" value="${simulatedLevel}" oninput="triggerLiveCalculationsRun()">
                </div>
                <div class="calc-control-node">
                    <label for="detail-enchant-dropdown">${CONFIG.getText('DETAILS.ENCHANT_LABEL')}</label>
                    <select id="detail-enchant-dropdown" onchange="triggerLiveCalculationsRun()">
                        <option value="None">None</option>
                        <option value="Sharpened">Sharpened (+15% Damage)</option>
                        <option value="Grounded">Grounded (+20% Range, +5% CD)</option>
                        <option value="Hyperclocked">Hyperclocked (-20% CD, -5% DMG)</option>
                        <option value="Godly">Godly (+45% DMG, +15% RNG, -10% CD)</option>
                    </select>
                </div>
            </div>
            <div class="stat-numeric-flexrow">
                <div class="stat-metric-pill"><div class="stat-metric-label">${CONFIG.getText('DETAILS.STAT_MIN_DMG')}</div><div class="stat-metric-val" id="calc-min-dmg">0</div></div>
                <div class="stat-metric-pill"><div class="stat-metric-label">${CONFIG.getText('DETAILS.STAT_MAX_DMG')}</div><div class="stat-metric-val" id="calc-max-dmg">0</div></div>
                <div class="stat-metric-pill"><div class="stat-metric-label">${CONFIG.getText('DETAILS.STAT_RANGE')}</div><div class="stat-metric-val" id="calc-range">0</div></div>
                <div class="stat-metric-pill"><div class="stat-metric-label">${CONFIG.getText('DETAILS.STAT_COOLDOWN')}</div><div class="stat-metric-val" id="calc-cooldown">0s</div></div>
                <div class="stat-metric-pill"><div class="stat-metric-label">${CONFIG.getText('DETAILS.STAT_DPS')}</div><div class="stat-metric-val" id="calc-dps" style="color:var(--color-accent-blue);">0/s</div></div>
            </div>
        </div>
    `;

    const passivesBlock = (unit.passives || []).map(p => `
            <div style="background: var(--bg-input-field); padding: 12px; border-radius: var(--global-radius); border: 1px solid var(--border-matrix); margin-bottom: 8px;">
            <div style="font-weight:700; color:var(--text-heading); font-size:13.5px; margin-bottom:2px;">${p.name}</div>
            <div style="font-size:13px; color:var(--text-body-main); line-height:1.4;">${p.desc}</div>
        </div>
    `).join('') || `<div style="color:var(--text-body-muted); font-size:13px;">${CONFIG.getText('DETAILS.NO_PASSIVES')}</div>`;

    const abilitiesBlock = (unit.abilities || []).map(a => `
        <div style="background:var(--bg-input-field); padding:12px; border-radius:var(--global-radius); border:1px solid var(--border-matrix); margin-bottom:8px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                <strong style="color:var(--text-heading); font-size:13.5px;">${a.name}</strong>
                <span style="color:#ef4444; font-size:12px; font-weight:700;">CD: ${a.cooldown ?? 'N/A'}s</span>
            </div>
            <div style="font-size:13px; color:var(--text-body-main); line-height:1.4;">${a.desc}</div>
        </div>
    `).join('') || `<div style="color:var(--text-body-muted); font-size:13px;">${CONFIG.getText('DETAILS.NO_ABILITIES')}</div>`;

    const passivesAbilitiesTabContent = `
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
            <div class="specs-block-card" style="margin:0;">
                <h4>${CONFIG.getText('DETAILS.PASSIVES_TITLE')}</h4>
                ${passivesBlock}
            </div>
            <div class="specs-block-card" style="margin:0;">
                <h4>${CONFIG.getText('DETAILS.ABILITIES_TITLE')}</h4>
                ${abilitiesBlock}
            </div>
        </div>
    `;

    const rankedTabContent = `
        <div class="specs-block-card">
            <h4>${CONFIG.getText('DETAILS.RANKED_TAB')}</h4>
            <div style="display:flex; flex-direction:column; gap:12px;">
                <div><span style="color:var(--text-body-muted); font-size:13px;">${CONFIG.getText('DETAILS.TIER_PLACEMENT')}</span> <strong style="color:#ffb74d; font-size:14px; margin-left:6px;">${unit.computedRank} (#${unit.rankedId})</strong></div>
                <div><span style="color:var(--text-body-muted); font-size:13px;">${CONFIG.getText('DETAILS.ENDLESS_WAVE_CAP')}</span> <span id="detail-wave-score-pill" style="font-size:16px; margin-left:6px; font-weight:bold;">${unit.rankedWave}</span></div>
            </div>
        </div>
        <div class="specs-block-card">
            <h4>${CONFIG.getText('DETAILS.ELEMENT_TITLE')} ${unit.element}</h4>
            <div style="font-size:13.5px; line-height:1.5;">
                <div><strong style="color:var(--color-currency-green);">${CONFIG.getText('DETAILS.UNIT_EFFECT')}</strong> ${elementMeta.passiveUnit}</div>
                <div style="margin-top:6px;"><strong style="color:#ef4444;">${CONFIG.getText('DETAILS.TARGET_MODIFIER')}</strong> ${elementMeta.passiveEnemy}</div>
            </div>
        </div>
    `;

    const obtainmentTabContent = `
        <div class="specs-block-card">
            <h4>${CONFIG.getText('DETAILS.OBTAINMENT_LABEL')}</h4>
            ${formatObtainments(unit.obtainments)}
        </div>
    `;

    const aliasesTabContent = `
        <div class="specs-block-card">
            <h4>${CONFIG.getText('DETAILS.ALIASES_LABEL')}</h4>
            ${formatAliases(unit.aliases || [], unit.id)}
        </div>
    `;

    const sourcesTabContent = `${obtainmentTabContent}${aliasesTabContent}`;

    const fanmadeBuffsTabContent = `
        <div class="specs-block-card">
            <h4>${CONFIG.getText('DETAILS.FANMADE_BUFFS_TITLE')}</h4>
            ${unit.fanmadeBuffs && unit.fanmadeBuffs.length ? unit.fanmadeBuffs.map(buff => `
                <div style="margin-bottom: 10px; padding: 10px; background: var(--bg-input-field); border-radius: var(--global-radius); border: 1px solid var(--border-matrix);">
                    <div style="font-weight: 700; color: var(--text-heading); font-size: 13px;">${buff.name}</div>
                    <div style="font-size: 13px; color: var(--text-body-main); line-height: 1.4;">${buff.desc}</div>
                </div>
            `).join('') : `<div style="color: var(--text-body-muted); font-size: 13px;">No fanmade buffs registered for this unit.</div>`}
        </div>
    `;

    const profileAssetId = unit.officialAssetId || OFFICIAL_UNIT_ASSET_IDS[unit.name] || '';
    const assetAttribute = profileAssetId ? ` data-unit-asset="${profileAssetId}"` : '';
    target.innerHTML = `
        <div class="profile-layout-grid animate-pop">
            <div>
                <div class="profile-summary-box">
                    <div class="profile-avatar-frame"${assetAttribute} style="${frameBorderStyle} background-image: url('${getUnitImageUrl(unit)}'), none;"></div>
                    <h2 style="color:var(--text-heading); margin-bottom:4px;">${unit.name}</h2>
                    <p style="color:var(--text-body-muted); font-size:13px; font-weight:600; text-transform:uppercase; margin-bottom:16px;">${unit.rarity} | ID: ${unit.id}</p>
                    
                    <div style="text-align:left; background:var(--bg-input-field); padding:12px; border-radius:var(--global-radius); border:1px solid var(--border-matrix); margin-bottom:12px;">
                        <div style="font-size:13px; margin-bottom:6px;"><span style="color:var(--text-body-muted);">${CONFIG.getText('DETAILS.CLASS_LABEL')}</span> <strong style="color:var(--text-heading);">${unit.class}</strong></div>
                        <div style="font-size:13px; margin-bottom:6px;"><span style="color:var(--text-body-muted);">${CONFIG.getText('DETAILS.SUBCLASSES_LABEL')}</span> <strong style="color:var(--text-heading);">${unit.subclasses.join(', ')}</strong></div>
                        <div style="font-size:13px;"><span style="color:var(--text-body-muted);">${CONFIG.getText('DETAILS.SYNERGY_LABEL')}</span> <strong style="color:var(--text-heading);">${unit.synergy}</strong></div>
                    </div>

                    <div style="text-align:left; background:var(--bg-input-field); padding:12px; border-radius:var(--global-radius); border:1px solid var(--border-matrix);">
                        <div style="font-size:13px; margin-bottom:6px;"><span style="color:var(--text-body-muted);">${CONFIG.getText('DETAILS.PLACEMENT_LIMIT')}</span> <strong style="color:var(--text-heading); font-size:14px;">${unit.placementLimit || 5} max</strong></div>
                        <div style="font-size:13px;"><span style="color:var(--text-body-muted);">${CONFIG.getText('DETAILS.PLACEMENT_COST')}</span> <strong style="color:var(--text-heading); font-size:14px;">${unit.placementCost}</strong></div>
                    </div>
                </div>
            </div>

            <div class="profile-specs-sheet">
                <!-- Tab Navigation -->
                <div style="display: flex; gap: 8px; margin-bottom: 16px; border-bottom: 2px solid var(--border-matrix); flex-wrap: wrap;">
                    <button data-detail-tab="stats" class="detail-tab-btn active" onclick="switchDetailTab('stats')">${CONFIG.getText('DETAILS.STATS_TAB')}</button>
                    <button data-detail-tab="passives" class="detail-tab-btn" onclick="switchDetailTab('passives')">${CONFIG.getText('DETAILS.PASSIVES_TAB')}</button>
                    <button data-detail-tab="sources" class="detail-tab-btn" onclick="switchDetailTab('sources')">${CONFIG.getText('DETAILS.SOURCES_TAB')}</button>
                    <button data-detail-tab="fanmade" class="detail-tab-btn" onclick="switchDetailTab('fanmade')">${CONFIG.getText('DETAILS.FANMADE_BUFFS_TAB')}</button>
                </div>

                <!-- Tab Contents -->
                <div data-detail-content="stats" style="display: block;">${statsTabContent}${rankedTabContent}</div>
                <div data-detail-content="passives" style="display: none;">${passivesAbilitiesTabContent}</div>
                <div data-detail-content="sources" style="display: none;">${sourcesTabContent}</div>
                <div data-detail-content="fanmade" style="display: none;">${fanmadeBuffsTabContent}</div>
            </div>
        </div>
    `;

    const wavePill = document.getElementById('detail-wave-score-pill');
    if (wavePill) {
        if (unit.rankedWave < CONFIG.GAME_BALANCE.WAVE_THRESHOLDS.LOW_THRESHOLD) wavePill.className = "wave-score-low";
        else if (unit.rankedWave > CONFIG.GAME_BALANCE.WAVE_THRESHOLDS.HIGH_THRESHOLD) wavePill.className = "wave-score-high";
        else wavePill.className = "wave-score-mid";
    }

    triggerLiveCalculationsRun();
}

function triggerLiveCalculationsRun() {
    const unit = detailsActiveUnit;
    if(!unit) return;

    let lvlInput = document.getElementById('detail-level-input');
    let lvl = parseInt(lvlInput.value) || 1;
    if(lvl < CONFIG.GAME_BALANCE.LEVEL_MIN) { lvl = CONFIG.GAME_BALANCE.LEVEL_MIN; lvlInput.value = CONFIG.GAME_BALANCE.LEVEL_MIN; }
    if(lvl > CONFIG.GAME_BALANCE.LEVEL_MAX) { lvl = CONFIG.GAME_BALANCE.LEVEL_MAX; lvlInput.value = CONFIG.GAME_BALANCE.LEVEL_MAX; }
    
    simulatedLevel = lvl;
    simulatedEnchant = document.getElementById('detail-enchant-dropdown').value;

    let levelStatScaler = 1 + ((lvl - 1) * CONFIG.GAME_BALANCE.LEVEL_SCALING.DAMAGE_MULTIPLIER); 
    let levelRangeScaler = 1 + ((lvl - 1) * CONFIG.GAME_BALANCE.LEVEL_SCALING.RANGE_MULTIPLIER); 
    let levelCooldownContractor = 1 - ((lvl - 1) * CONFIG.GAME_BALANCE.LEVEL_SCALING.COOLDOWN_DIVISOR); 

    const enchantMod = CONFIG.getEnchant(simulatedEnchant);

    const [baseMinDmg, baseMaxDmg] = unit.damage || [0, 0];
    const [baseRange] = unit.range || [0];
    const [baseCooldown] = unit.cooldown || [0];

    let finalMinDmg = Math.round(baseMinDmg * levelStatScaler * enchantMod.DMG_MOD);
    let finalMaxDmg = Math.round(baseMaxDmg * levelStatScaler * enchantMod.DMG_MOD);
    let finalRange = parseFloat((baseRange * levelRangeScaler * enchantMod.RANGE_MOD).toFixed(1));
    let finalCd = parseFloat((baseCooldown * levelCooldownContractor * enchantMod.CD_MOD).toFixed(2));
    if (isNaN(finalCd) || finalCd < 0.1) finalCd = 0.1;

    let computedDps = finalCd > 0 ? Math.round(finalMaxDmg / finalCd) : 0;

    document.getElementById('calc-min-dmg').innerText = finalMinDmg;
    document.getElementById('calc-max-dmg').innerText = finalMaxDmg;
    document.getElementById('calc-range').innerText = finalRange;
    document.getElementById('calc-cooldown').innerText = finalCd + "s";
    document.getElementById('calc-dps').innerText = computedDps + "/s";
}

function returnToCatalog() { switchView('page-tierlist'); }

 
function switchTeamCreatorTab(mode) {
    document.getElementById('team-tab-generate').classList.toggle('active', mode === 'generate');
    document.getElementById('team-tab-rate').classList.toggle('active', mode === 'rate');
    document.getElementById('team-generator-panel').style.display = mode === 'generate' ? 'block' : 'none';
    document.getElementById('team-rating-panel').style.display = mode === 'rate' ? 'block' : 'none';
    if (mode === 'rate') {
        updateTeamRatingPanel();
    }
}

function generateCreatorSquad() {
    const checkedClasses = Array.from(document.querySelectorAll('.gen-class-cb:checked')).map(cb => cb.value);
    const checkedSubclasses = Array.from(document.querySelectorAll('.gen-subclass-cb:checked')).map(cb => cb.value);
    const soulMin = Number(document.getElementById('gen-soul-min')?.value || 0);
    const soulMax = Number(document.getElementById('gen-soul-max')?.value || 0);
    const elementFilter = document.getElementById('gen-element-filter')?.value || 'All';

    let subsetPool = DB_UNITS.filter(u => {
        const soulValue = getSoulValue(u);
        const matchClass = checkedClasses.includes(u.class);
        const matchSubclass = u.subclasses.some(s => checkedSubclasses.includes(s));
        const matchElement = elementFilter === 'All' || u.element === elementFilter;
        const matchMin = soulValue >= soulMin;
        const matchMax = soulMax > 0 ? soulValue <= soulMax : true;
        return matchClass && matchSubclass && matchElement && matchMin && matchMax;
    });
    if (subsetPool.length === 0) {
        clearTeamSlots();
        renderGridContainer([], 'generator-grid-container');
        renderTeamSlotGrid();
        renderManualBuilderPool();
        updateTeamRatingPanel();
        return;
    }

    let compiledSquad = [];
    function fetchRandomTargetNode(filterFn) {
        let validOptions = subsetPool.filter(u => filterFn(u) && !compiledSquad.includes(u));
        if (validOptions.length === 0) return null;
        return validOptions[Math.floor(Math.random() * validOptions.length)];
    }

    ['Early Game', 'Mid Game', 'End Game'].forEach(requiredClass => {
        const node = fetchRandomTargetNode(u => u.class === requiredClass);
        if (node) compiledSquad.push(node);
    });

    while (compiledSquad.length < CONFIG.GAME_BALANCE.TEAM.MAX_SIZE) {
        let remaining = subsetPool.filter(u => !compiledSquad.includes(u));
        if (remaining.length === 0) break;
        compiledSquad.push(remaining[Math.floor(Math.random() * remaining.length)]);
    }

    teamSlots = compiledSquad.concat(Array(6 - compiledSquad.length).fill(null));
    syncCurrentTeamWithSlots();
    renderGridContainer(currentTeam, 'generator-grid-container');
    renderTeamSlotGrid();
    renderManualBuilderPool();
    updateTeamRatingPanel();
}

function addTeamMember(unitId, slotIndex = null) {
    if (getActiveTeam().length >= CONFIG.GAME_BALANCE.TEAM.MAX_SIZE) return;
    const existingIndex = teamSlots.findIndex(slot => slot?.id === unitId);
    if (existingIndex !== -1) return;
    const unit = DB_UNITS.find(u => u.id === unitId);
    if (!unit) return;

    if (slotIndex === null) {
        slotIndex = teamSlots.findIndex(slot => !slot);
    }
    if (slotIndex === -1) return;

    teamSlots[slotIndex] = unit;
    syncCurrentTeamWithSlots();
    renderGridContainer([], 'generator-grid-container');
    renderTeamSlotGrid();
    renderManualBuilderPool();
    updateTeamRatingPanel();
}

function removeTeamMember(unitId) {
    const slotIndex = teamSlots.findIndex(slot => slot?.id === unitId);
    if (slotIndex !== -1) {
        teamSlots[slotIndex] = null;
    }
    syncCurrentTeamWithSlots();
    renderGridContainer([], 'generator-grid-container');
    renderTeamSlotGrid();
    renderManualBuilderPool();
    updateTeamRatingPanel();
}

function clearCurrentTeam() {
    clearTeamSlots();
    renderGridContainer([], 'generator-grid-container');
    renderTeamSlotGrid();
    renderManualBuilderPool();
    updateTeamRatingPanel();
}

function renderManualBuilderPool() {
    const poolContainer = document.getElementById('team-builder-pool');
    if (!poolContainer) return;

    const classSelect = document.getElementById('team-builder-class-filter');
    const subclassSelect = document.getElementById('team-builder-subclass-filter');
    if (classSelect && classSelect.options.length === 1) {
        const classes = [...new Set(DB_UNITS.map(u => u.class).filter(Boolean))].sort();
        classes.forEach(className => {
            const option = document.createElement('option');
            option.value = className;
            option.textContent = className;
            classSelect.appendChild(option);
        });
    }
    if (subclassSelect && subclassSelect.options.length === 1) {
        const subclasses = [...new Set(DB_UNITS.flatMap(u => u.subclasses || []))].sort();
        subclasses.forEach(subName => {
            const option = document.createElement('option');
            option.value = subName;
            option.textContent = subName;
            subclassSelect.appendChild(option);
        });
    }

    const searchTerm = (document.getElementById('team-builder-search')?.value.trim().toLowerCase() || '');
    const classFilter = classSelect?.value || 'All';
    const subclassFilter = subclassSelect?.value || 'All';
    const soulMin = Number(document.getElementById('team-builder-soul-min')?.value || 0);
    const soulMax = Number(document.getElementById('team-builder-soul-max')?.value || 0);

    const availableUnits = DB_UNITS.filter(unit => {
        const isSelected = teamSlots.some(slot => slot?.id === unit.id);
        const matchSearch = unit.name.toLowerCase().includes(searchTerm) || unit.id.toLowerCase().includes(searchTerm);
        const matchClass = classFilter === 'All' || unit.class === classFilter;
        const matchSubclass = subclassFilter === 'All' || unit.subclasses.includes(subclassFilter);
        const soulValue = getSoulValue(unit);
        const matchSoulMin = soulValue >= soulMin;
        const matchSoulMax = soulMax > 0 ? soulValue <= soulMax : true;
        return !isSelected && matchSearch && matchClass && matchSubclass && matchSoulMin && matchSoulMax;
    });

    poolContainer.innerHTML = '';
    if (availableUnits.length === 0) {
        poolContainer.innerHTML = `<div style="color:var(--text-body-muted); padding:18px; font-size:13px;">${CONFIG.getText('GENERATOR.RATING_EMPTY')}</div>`;
        return;
    }

    availableUnits.forEach(unit => {
        const card = document.createElement('div');
        card.className = 'unit-card-square animate-pop rarity-' + (unit.rarity || '').replace(/\s+/g,'-');
        const assetId = unit.officialAssetId || OFFICIAL_UNIT_ASSET_IDS[unit.name];
        if (assetId) card.dataset.unitAsset = assetId;
        const rarityMeta = DB_RARITIES[unit.rarity];
        card.style.backgroundImage = `url('${getUnitImageUrl(unit)}'), none`;
        if (rarityMeta && rarityMeta.color.includes('gradient')) {
            card.style.borderImage = `${rarityMeta.color} 1`;
            card.style.borderColor = 'transparent';
        } else if (rarityMeta) {
            card.style.borderColor = rarityMeta.color;
            card.style.borderImage = 'none';
        }
        card.innerHTML = `
            <div class="square-title-top">${unit.name}</div>
            <div class="square-cost-bottom">$${unit.placementCost}</div>
            <div class="square-element-icon">${unit.element.substring(0,1).toUpperCase()}</div>
        `;
        card.addEventListener('click', () => addTeamMember(unit.id));
        poolContainer.appendChild(card);
    });
}

function updateTeamRatingPanel() {
    const overviewNode = document.getElementById('team-rating-overview');
    const detailsNode = document.getElementById('team-rating-details');
    const issuesNode = document.getElementById('team-rating-issues');
    const teamGrid = document.getElementById('team-rating-team-grid');

    const activeTeam = getActiveTeam();
    if (!activeTeam.length) {
        overviewNode.innerHTML = `<p>${CONFIG.getText('GENERATOR.RATING_EMPTY')}</p>`;
        detailsNode.innerHTML = '';
        issuesNode.innerHTML = '';
        teamGrid.innerHTML = '';
        return;
    }

    teamGrid.innerHTML = '';
    activeTeam.forEach(unit => {
        const card = document.createElement('div');
        card.className = 'unit-card-square animate-pop rarity-' + (unit.rarity || '').replace(/\s+/g,'-');
        const assetId = unit.officialAssetId || OFFICIAL_UNIT_ASSET_IDS[unit.name];
        if (assetId) card.dataset.unitAsset = assetId;
        const rarityMeta = DB_RARITIES[unit.rarity];
        card.style.backgroundImage = `url('${getUnitImageUrl(unit)}'), none`;
        if (rarityMeta && rarityMeta.color.includes('gradient')) {
            card.style.borderImage = `${rarityMeta.color} 1`;
            card.style.borderColor = 'transparent';
        } else if (rarityMeta) {
            card.style.borderColor = rarityMeta.color;
            card.style.borderImage = 'none';
        }
        card.innerHTML = `
            <div class="square-title-top">${unit.name}</div>
            <div class="square-cost-bottom">$${unit.placementCost}</div>
            <div class="square-element-icon">${unit.element.substring(0,1).toUpperCase()}</div>
        `;

        const removeBtn = document.createElement('button');
        removeBtn.className = 'team-remove-btn';
        removeBtn.textContent = CONFIG.getText('GENERATOR.REMOVE_TEAM_MEMBER');
        removeBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            removeTeamMember(unit.id);
        });

        card.appendChild(removeBtn);
        teamGrid.appendChild(card);
    });

    const summary = getTeamRating(activeTeam);
    overviewNode.innerHTML = `
        <div class="rating-heading">${summary.label}</div>
        <div class="rating-score">${summary.score}/5</div>
    `;
    detailsNode.innerHTML = `
        <div class="rating-detail-row"><span>Team Size:</span><span>${activeTeam.length}/6</span></div>
        <div class="rating-detail-row"><span>Class Coverage:</span><span>${summary.coverageText}</span></div>
        <div class="rating-detail-row"><span>Synergy Variety:</span><span>${summary.synergyText}</span></div>
        <div class="rating-detail-row"><span>Budget Estimate:</span><span>$${summary.totalCost}</span></div>
    `;
    issuesNode.innerHTML = summary.issues.map(item => `<li>${item}</li>`).join('');
}

function getTeamRating(team) {
    const normalizedTeam = team.filter(Boolean);
    const classes = [...new Set(normalizedTeam.map(u => u.class))];
    const synergies = {};
    let totalCost = 0;

    normalizedTeam.forEach(u => {
        totalCost += parseInt(u.placementCost, 10) || 0;
        synergies[u.synergy] = (synergies[u.synergy] || 0) + 1;
    });

    const missingClasses = ['Early Game', 'Mid Game', 'End Game'].filter(c => !classes.includes(c));
    const synergyCount = Object.keys(synergies).length;

    let score = 0;
    if (normalizedTeam.length >= 5) score += 2;
    else if (normalizedTeam.length >= 4) score += 1;
    if (missingClasses.length === 0) score += 1;
    if (synergyCount >= 3) score += 1;
    if (totalCost <= (18 * normalizedTeam.length)) score += 1;

    const label = score >= 4 ? 'Strong Team' : score === 3 ? 'Balanced Team' : 'Needs Work';
    const coverageText = classes.length > 0 ? classes.join(', ') : 'None';
    const synergyText = `${synergyCount} synergy groups`;

    const issues = [];
    if (team.length < CONFIG.GAME_BALANCE.TEAM.MAX_SIZE) {
        issues.push('Team is not full; aim for 6 units.');
    }
    if (missingClasses.length) {
        issues.push(`Missing core coverage: ${missingClasses.join(', ')}.`);
    }
    if (synergyCount <= 1) {
        issues.push('Team has low synergy variety; diversify unit synergies.');
    }
    if (totalCost > (18 * team.length)) {
        issues.push('Team cost is on the high side; watch placement budget.');
    }
    if (!issues.length) {
        issues.push('Team looks balanced and ready for most encounters.');
    }

    return {
        score,
        label,
        totalCost,
        coverageText,
        synergyText,
        issues,
    };
}

 
const overlayNode = document.getElementById('settings-overlay');
function openSettingsModal() { overlayNode.classList.add('active-view'); }
function closeSettingsModal() { overlayNode.classList.remove('active-view'); }

function applyVisualSettings() {
    const ambient = document.getElementById('setting-ambient-anim')?.checked ?? true;
    const cardGlow = document.getElementById('setting-card-glow')?.checked ?? true;
    const dust = document.getElementById('setting-dust')?.checked ?? true;
    const bulletHoles = document.getElementById('setting-bulletholes')?.checked ?? true;

    document.body.classList.toggle('effects-reduced', !ambient);
    document.body.classList.toggle('no-card-glow', !cardGlow);
    document.body.classList.toggle('no-dust', !dust);
    document.body.classList.toggle('no-bulletholes', !bulletHoles);

    localStorage.setItem('fntd2_visual_settings', JSON.stringify({ ambient, cardGlow, dust, bulletHoles }));
}

function restoreVisualSettings() {
    try {
        const stored = JSON.parse(localStorage.getItem('fntd2_visual_settings') || '{}');
        if (typeof stored.ambient === 'boolean' && document.getElementById('setting-ambient-anim')) {
            document.getElementById('setting-ambient-anim').checked = stored.ambient;
        }
        if (typeof stored.cardGlow === 'boolean' && document.getElementById('setting-card-glow')) {
            document.getElementById('setting-card-glow').checked = stored.cardGlow;
        }
        if (typeof stored.dust === 'boolean' && document.getElementById('setting-dust')) {
            document.getElementById('setting-dust').checked = stored.dust;
        }
        if (typeof stored.bulletHoles === 'boolean' && document.getElementById('setting-bulletholes')) {
            document.getElementById('setting-bulletholes').checked = stored.bulletHoles;
        }
    } catch (error) {
        console.warn('Failed to restore visual settings', error);
    }
    applyVisualSettings();
}

 
const unitCreatorOverlay = document.getElementById('unit-creator-overlay');
function openUnitCreator() { 
    unitCreatorOverlay.style.display = 'flex'; 
    unitCreatorOverlay.style.alignItems = 'center';
    unitCreatorOverlay.style.justifyContent = 'center';
    switchAdminTab('units');
}
function closeUnitCreator() { unitCreatorOverlay.style.display = 'none'; }

function switchAdminTab(tabName) {
    document.getElementById('admin-tab-units')?.classList.toggle('active', tabName === 'units');
    document.getElementById('admin-tab-elements')?.classList.toggle('active', tabName === 'elements');
    document.getElementById('admin-tab-enchants')?.classList.toggle('active', tabName === 'enchants');
    document.getElementById('admin-panel-units')?.classList.toggle('hidden', tabName !== 'units');
    document.getElementById('admin-panel-elements')?.classList.toggle('hidden', tabName !== 'elements');
    document.getElementById('admin-panel-enchants')?.classList.toggle('hidden', tabName !== 'enchants');
}

function submitUnitCreation(e) {
    e.preventDefault();
    const activeAdminTab = document.getElementById('admin-tab-units')?.classList.contains('active') ? 'units'
        : document.getElementById('admin-tab-elements')?.classList.contains('active') ? 'elements'
            : 'enchants';

    if (activeAdminTab === 'elements') {
        const elementName = document.getElementById('creator-element-name')?.value?.trim();
        if (!elementName) {
            alert('Element name is required.');
            return;
        }
        DB_ELEMENTS[elementName] = {
            passiveUnit: document.getElementById('creator-element-unit-passive')?.value?.trim() || 'N/A',
            passiveEnemy: document.getElementById('creator-element-enemy-passive')?.value?.trim() || 'N/A'
        };
        alert(`Element "${elementName}" saved.`);
        return;
    }

    if (activeAdminTab === 'enchants') {
        const enchantName = document.getElementById('creator-enchant-name')?.value?.trim();
        if (!enchantName) {
            alert('Enchant name is required.');
            return;
        }
        DB_ENCHANTS[enchantName] = {
            dmgMod: Number(document.getElementById('creator-enchant-dmg')?.value || 1),
            rangeMod: Number(document.getElementById('creator-enchant-range')?.value || 1),
            cdMod: Number(document.getElementById('creator-enchant-cd')?.value || 1)
        };
        alert(`Enchant "${enchantName}" saved.`);
        return;
    }

    const unitName = document.getElementById('creator-name').value.trim();
    const unitId = document.getElementById('creator-id').value.trim();
    if (!unitName || !unitId) {
        alert('Unit name and ID are required.');
        return;
    }
    const unitSlug = unitName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const newUnit = {
        id: unitId,
        name: unitName,
        rarity: document.getElementById('creator-rarity').value,
        class: document.getElementById('creator-class').value,
        placementCost: parseInt(document.getElementById('creator-cost').value),
        soulValue: parseInt(document.getElementById('creator-souls').value || '0', 10),
        placementLimit: parseInt(document.getElementById('creator-limit').value),
        obtainments: document.getElementById('creator-obtainment').value,
        element: document.getElementById('creator-element').value,
        synergy: 'Custom',
        subclasses: [],
        damage: [1, 2],
        range: [1, 2],
        cooldown: [1, 2],
        passives: [],
        abilities: [],
        rank: 'N/A',
        rankedId: 'custom',
        imageSourceUrl: `https://fntd2.com/database/units?=${unitSlug}`,
        officialPageSlug: unitSlug,
        isCustom: true
    };
    
    DB_UNITS.push(newUnit);
    const deletedIds = getDeletedUnitIds();
    if (deletedIds.has(newUnit.id)) {
        deletedIds.delete(newUnit.id);
        saveDeletedUnitIds(deletedIds);
    }
    saveCustomUnitsToStorage();
    hydrateUnitFromOfficial(newUnit).then(() => {
        saveCustomUnitsToStorage();
        renderTierlist();
    });
    document.getElementById('unit-creator-form').reset();
    closeUnitCreator();
    applyFinderFilters();
    alert(`Unit "${newUnit.name}" created successfully.`);
}

function initSystemModalEvents() {
    overlayNode.addEventListener('click', (e) => {
        if(e.target === overlayNode) closeSettingsModal();
    });
    document.addEventListener('keydown', (e) => {
        if(e.key === 'Escape' && overlayNode.classList.contains('active-view')) {
            closeSettingsModal();
        }
    });
    document.addEventListener('keydown', (e) => {
        if(e.key === 'Escape' && unitCreatorOverlay.style.display === 'flex') {
            closeUnitCreator();
        }
    });
    
    toggleInterfaceTheme('dark'); 
}

function toggleInterfaceTheme(targetMode) {
    document.documentElement.setAttribute('data-theme', targetMode);
    document.querySelectorAll('.theme-switch-segmented-control button').forEach(btn => btn.classList.remove('active'));
    const activeButton = document.getElementById(`theme-${targetMode}-btn`);
    if (activeButton) activeButton.classList.add('active');
}

function changeSystemAnimationSpeed(sliderValue) {
    const doc = document.documentElement;
    document.querySelectorAll('.speed-labels-ticks span').forEach(s => s.classList.remove('active'));

    if(sliderValue == 1) {
        doc.style.setProperty('--anim-speed-factor', CONFIG.TIMINGS.ANIMATION_SPEEDS.SLOW);
        document.getElementById('tick-slow').classList.add('active');
    } else if(sliderValue == 2) {
        doc.style.setProperty('--anim-speed-factor', CONFIG.TIMINGS.ANIMATION_SPEEDS.NORMAL);
        document.getElementById('tick-normal').classList.add('active');
    } else if(sliderValue == 3) {
        doc.style.setProperty('--anim-speed-factor', CONFIG.TIMINGS.ANIMATION_SPEEDS.FAST);
        document.getElementById('tick-fast').classList.add('active');
    }
}

 
function initWelcomeModal() {
    if (CONFIG.FEATURE_FLAGS.SHOW_WELCOME_MODAL && !localStorage.getItem('fntd2_welcome_shown')) {
        document.getElementById('welcome-overlay').style.display = 'flex';
    }
}

function closeWelcomeModal() {
    const overlay = document.getElementById('welcome-overlay');
    if (overlay) {
        overlay.style.display = 'none';
        localStorage.setItem('fntd2_welcome_shown', 'true');
    }
}

function initBulletHoleFx() {
    const layer = document.getElementById('bullet-hole-layer');
    if (!layer) return;
    document.addEventListener('click', (event) => {
        if (document.body.classList.contains('no-bulletholes')) return;
        const hole = document.createElement('div');
        hole.className = 'bullet-hole';
        hole.style.left = `${event.clientX}px`;
        hole.style.top = `${event.clientY}px`;
        layer.appendChild(hole);
        setTimeout(() => hole.remove(), 1050);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const welcomeOverlay = document.getElementById('welcome-overlay');
    if (welcomeOverlay) {
        welcomeOverlay.addEventListener('click', (e) => {
            if (e.target === welcomeOverlay) closeWelcomeModal();
        });
    }
});

let adminPanelActive = false;
const ADMIN_PASSWORD = CONFIG.getText('ADMIN.PASSWORD_VALUE');

function initAdminPanel() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'F3' || e.key === 'f3') {
            e.preventDefault();
            toggleAdminPanel();
        }
    });
}

function toggleAdminPanel() {
    if (!document.getElementById('admin-panel-overlay')) {
        createAdminPanelUI();
    }
    const overlay = document.getElementById('admin-panel-overlay');
    adminPanelActive = !adminPanelActive;
    overlay.style.display = adminPanelActive ? 'flex' : 'none';
    if (adminPanelActive) {
        document.getElementById('admin-password-input').focus();
    }
}

function createAdminPanelUI() {
    const overlay = document.createElement('div');
    overlay.id = 'admin-panel-overlay';
    overlay.style.cssText = `
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.7);
        z-index: 10000;
        align-items: center;
        justify-content: center;
        flex-direction: column;
    `;
    
    const panel = document.createElement('div');
    panel.id = 'admin-panel-content';
    panel.style.cssText = `
        background: var(--bg-card-panel);
        border: 2px solid var(--color-accent-blue);
        border-radius: var(--global-radius);
        padding: 24px;
        width: 90%;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        color: var(--text-heading);
    `;
    
    panel.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="margin: 0; color: var(--color-accent-blue);">${CONFIG.getText('ADMIN.PANEL_TITLE')}</h3>
            <button onclick="toggleAdminPanel()" style="background: transparent; border: none; color: var(--text-body-main); font-size: 20px; cursor: pointer;">×</button>
        </div>
        <div id="admin-auth-section">
            <input type="password" id="admin-password-input" placeholder="${CONFIG.getText('ADMIN.PASSWORD_PLACEHOLDER')}" style="width: 100%; padding: 8px; margin-bottom: 8px; background: var(--bg-input-field); border: 1px solid var(--border-matrix); border-radius: 4px; color: var(--text-heading);">
            <button onclick="verifyAdminPassword()" style="width: 100%; padding: 8px; background: var(--color-accent-blue); border: none; border-radius: 4px; color: white; cursor: pointer; font-weight: bold;">${CONFIG.getText('ADMIN.UNLOCK_BUTTON')}</button>
        </div>
        <div id="admin-content-section" style="display: none;">
            <div style="display:flex; gap:8px; margin-bottom:12px;">
                <button onclick="openAdminUnitForm()" style="flex:1; padding: 10px; background: var(--color-accent-blue); border: none; border-radius: 4px; color: white; cursor: pointer; font-weight: bold;">${CONFIG.getText('ADMIN.ADD_UNIT_BUTTON')}</button>
                <button onclick="exportUnits()" style="padding: 10px; background: var(--color-accent-blue-hover); border: none; border-radius: 4px; color: white; cursor: pointer; font-weight: bold;">${CONFIG.getText('ADMIN.EXPORT_DATA')}</button>
                <button onclick="document.getElementById('admin-import-file').click()" style="padding: 10px; background: var(--text-body-muted); border: none; border-radius: 4px; color: white; cursor: pointer; font-weight: bold;">${CONFIG.getText('ADMIN.IMPORT_DATA')}</button>
            </div>
            <input id="admin-import-file" type="file" accept="application/json" style="display:none" onchange="handleImportFile(this.files)">
            <div style="font-size:12px; color:var(--text-body-muted); margin-bottom:8px;">${CONFIG.getText('ADMIN.REPOSITORY_NOTE')}</div>
            <div style="display:flex; gap:8px; margin-bottom:12px;">
                <button onclick="generateDataJSSnippet()" style="flex:1; padding: 8px; background: var(--color-accent-blue); border: none; border-radius: 4px; color: white; cursor: pointer; font-weight: bold;">📋 ${CONFIG.getText('ADMIN.GENERATE_DATA_JS')}</button>
            </div>
            <div id="admin-units-list" style="border-top: 1px solid var(--border-matrix); padding-top: 12px;"></div>
        </div>
    `;
    
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
}

function verifyAdminPassword() {
    const password = document.getElementById('admin-password-input').value;
    if (password === ADMIN_PASSWORD) {
        document.getElementById('admin-auth-section').style.display = 'none';
        document.getElementById('admin-content-section').style.display = 'block';
        loadAdminUnitsList();
    } else {
        alert(CONFIG.getText('ADMIN.INVALID_PASSWORD'));
        document.getElementById('admin-password-input').value = '';
    }
}

function loadAdminUnitsList() {
    const listDiv = document.getElementById('admin-units-list');
    listDiv.innerHTML = '';
    DB_UNITS.forEach(unit => {
        const unitRow = document.createElement('div');
        unitRow.style.cssText = `
            padding: 10px;
            border: 1px solid var(--border-matrix);
            border-radius: 4px;
            margin-bottom: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        unitRow.innerHTML = `
            <div>
                <strong>${unit.name}</strong><br>
                <span style="font-size: 12px; color: var(--text-body-muted);">${unit.id} | ${unit.rarity}</span>
            </div>
            <div style="display: flex; gap: 6px;">
                <button onclick="editAdminUnit('${unit.id}')" style="padding: 6px 10px; background: #558b55; border: none; border-radius: 3px; color: white; cursor: pointer; font-size: 12px;">✏️ ${CONFIG.getText('ADMIN.EDIT_UNIT_BUTTON')}</button>
                <button onclick="deleteAdminUnit('${unit.id}')" style="padding: 6px 10px; background: #d32f2f; border: none; border-radius: 3px; color: white; cursor: pointer; font-size: 12px;">🗑️ ${CONFIG.getText('ADMIN.DELETE_UNIT_BUTTON')}</button>
            </div>
        `;
        listDiv.appendChild(unitRow);
    });
}

function openAdminUnitForm(unitId = null) {
    const unit = unitId ? DB_UNITS.find(u => u.id === unitId) : null;
    const isEdit = !!unit;
    const draftData = loadAdminUnitDraft(unitId);
    
    const formOverlay = document.createElement('div');
    formOverlay.id = 'unit-form-overlay';
    formOverlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.7); display: flex; align-items: center; justify-content: center; z-index: 10001; overflow-y: auto;';
    
    const formContainer = document.createElement('div');
    formContainer.style.cssText = 'background: var(--bg-card-panel); padding: 20px; border-radius: 8px; max-width: 500px; width: 90%; max-height: 90vh; overflow-y: auto; border: 1px solid var(--border-matrix);';
    
    const title = document.createElement('h3');
    title.textContent = isEdit ? CONFIG.getText('ADMIN.EDIT_UNIT_BUTTON') + ': ' + unit.name : CONFIG.getText('ADMIN.ADD_UNIT_BUTTON');
    title.style.cssText = 'color: var(--text-heading); margin-bottom: 15px; margin-top: 0;';
    formContainer.appendChild(title);
    
    
    const fields = [
        { label: CONFIG.getText('ADMIN.FORM_ID'), key: 'id', type: 'text', required: true, disabled: isEdit },
        { label: CONFIG.getText('ADMIN.FORM_NAME'), key: 'name', type: 'text', required: true },
        { label: CONFIG.getText('ADMIN.FORM_RARITY'), key: 'rarity', type: 'select', required: true, options: Object.keys(DB_RARITIES) },
        { label: CONFIG.getText('ADMIN.FORM_CLASS'), key: 'class', type: 'text', required: true },
        { label: CONFIG.getText('ADMIN.FORM_SYNERGY'), key: 'synergy', type: 'text', required: true },
        { label: CONFIG.getText('ADMIN.FORM_ELEMENT'), key: 'element', type: 'select', required: true, options: Object.keys(DB_ELEMENTS) },
        { label: CONFIG.getText('ADMIN.FORM_COST'), key: 'placementCost', type: 'number', required: true },
        { label: CONFIG.getText('ADMIN.FORM_LIMIT'), key: 'placementLimit', type: 'number', required: true },
        { label: CONFIG.getText('ADMIN.FORM_DAMAGE_MIN'), key: 'dmg_min', type: 'number', required: true },
        { label: CONFIG.getText('ADMIN.FORM_DAMAGE_MAX'), key: 'dmg_max', type: 'number', required: true },
        { label: CONFIG.getText('ADMIN.FORM_RANGE_MIN'), key: 'range_min', type: 'number', required: true },
        { label: CONFIG.getText('ADMIN.FORM_RANGE_MAX'), key: 'range_max', type: 'number', required: true },
        { label: CONFIG.getText('ADMIN.FORM_CD_MIN'), key: 'cd_min', type: 'number', required: true },
        { label: CONFIG.getText('ADMIN.FORM_CD_MAX'), key: 'cd_max', type: 'number', required: true },
        { label: CONFIG.getText('ADMIN.FORM_RANK'), key: 'rank', type: 'text', required: false },
        { label: CONFIG.getText('ADMIN.FORM_RANKED_ID'), key: 'rankedId', type: 'number', required: false },
        { label: CONFIG.getText('ADMIN.FORM_RANKED_WAVE'), key: 'rankedWave', type: 'number', required: false },
    ];
    
    const formData = {};
    
    
    fields.forEach(field => {
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'margin-bottom: 12px;';
        
        const label = document.createElement('label');
        label.textContent = field.label + (field.required ? ' *' : '');
        label.style.cssText = 'display: block; color: var(--text-body-main); font-size: 12px; font-weight: bold; margin-bottom: 4px;';
        wrapper.appendChild(label);
        
        let input;
        if (field.type === 'select') {
            input = document.createElement('select');
            field.options.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt;
                option.textContent = opt;
                input.appendChild(option);
            });
        } else {
            input = document.createElement('input');
            input.type = field.type;
        }
        
        input.style.cssText = 'width: 100%; padding: 6px; background: var(--bg-input-field); color: var(--text-body-main); border: 1px solid var(--border-matrix); border-radius: 3px; box-sizing: border-box;';
        if (field.disabled) input.disabled = true;

        let initialValue = '';
        if (draftData && draftData[field.key] !== undefined && draftData[field.key] !== null) {
            initialValue = draftData[field.key];
        } else if (isEdit) {
            if (field.key === 'id') initialValue = unit.id;
            else if (field.key === 'name') initialValue = unit.name;
            else if (field.key === 'rarity') initialValue = unit.rarity;
            else if (field.key === 'class') initialValue = unit.class;
            else if (field.key === 'synergy') initialValue = unit.synergy;
            else if (field.key === 'element') initialValue = unit.element;
            else if (field.key === 'placementCost') initialValue = unit.placementCost;
            else if (field.key === 'placementLimit') initialValue = unit.placementLimit;
            else if (field.key === 'dmg_min') initialValue = unit.damage?.[0] ?? '';
            else if (field.key === 'dmg_max') initialValue = unit.damage?.[1] ?? '';
            else if (field.key === 'range_min') initialValue = unit.range?.[0] ?? '';
            else if (field.key === 'range_max') initialValue = unit.range?.[1] ?? '';
            else if (field.key === 'cd_min') initialValue = unit.cooldown?.[0] ?? '';
            else if (field.key === 'cd_max') initialValue = unit.cooldown?.[1] ?? '';
            else if (field.key === 'rank') initialValue = unit.rank ?? '';
            else if (field.key === 'rankedId') initialValue = unit.rankedId ?? '';
            else if (field.key === 'rankedWave') initialValue = unit.rankedWave ?? '';
        }
        if (initialValue !== undefined && initialValue !== null) {
            input.value = initialValue;
        }
        
        
        if (field.key === 'id' && !isEdit) {
            const idWrapper = document.createElement('div');
            idWrapper.style.cssText = 'display:flex; gap:8px;';
            input.style.cssText = 'flex:1; padding: 6px; background: var(--bg-input-field); color: var(--text-body-main); border: 1px solid var(--border-matrix); border-radius: 3px; box-sizing: border-box;';
            const idGenerateBtn = document.createElement('button');
            idGenerateBtn.type = 'button';
            idGenerateBtn.textContent = 'Gen';
            idGenerateBtn.style.cssText = 'padding:6px 8px; background: var(--color-accent-blue-hover); color: white; border: none; border-radius: 3px; cursor: pointer; font-size:12px; font-weight:bold;';
            idGenerateBtn.onclick = () => {
                const newId = generateUniqueId();
                input.value = newId;
                formData.id = newId;
            };
            idWrapper.appendChild(input);
            idWrapper.appendChild(idGenerateBtn);
            wrapper.appendChild(idWrapper);
            formContainer.appendChild(wrapper);
            
            
            formData.id = draftData?.id || '';
            input.addEventListener('input', (e) => {
                formData.id = e.target.value;
                saveAdminUnitDraft(unitId, formData);
            });
            return;
        }
        
input.addEventListener('input', (e) => {
                formData[field.key] = field.type === 'number' ? parseFloat(e.target.value) : e.target.value;
                saveAdminUnitDraft(unitId, formData);
            });
        
        
        if (draftData && draftData[field.key] !== undefined) {
            formData[field.key] = draftData[field.key];
        } else if (isEdit) {
            if (field.key === 'id') formData[field.key] = unit.id;
            else if (field.key === 'name') formData[field.key] = unit.name;
            else if (field.key === 'rarity') formData[field.key] = unit.rarity;
            else if (field.key === 'class') formData[field.key] = unit.class;
            else if (field.key === 'synergy') formData[field.key] = unit.synergy;
            else if (field.key === 'element') formData[field.key] = unit.element;
            else if (field.key === 'placementCost') formData[field.key] = unit.placementCost;
            else if (field.key === 'placementLimit') formData[field.key] = unit.placementLimit;
            else if (field.key === 'dmg_min') formData[field.key] = unit.damage?.[0] ?? '';
            else if (field.key === 'dmg_max') formData[field.key] = unit.damage?.[1] ?? '';
            else if (field.key === 'range_min') formData[field.key] = unit.range?.[0] ?? '';
            else if (field.key === 'range_max') formData[field.key] = unit.range?.[1] ?? '';
            else if (field.key === 'cd_min') formData[field.key] = unit.cooldown?.[0] ?? '';
            else if (field.key === 'cd_max') formData[field.key] = unit.cooldown?.[1] ?? '';
            else if (field.key === 'rank') formData[field.key] = unit.rank ?? '';
            else if (field.key === 'rankedId') formData[field.key] = unit.rankedId ?? '';
            else if (field.key === 'rankedWave') formData[field.key] = unit.rankedWave ?? '';
            else formData[field.key] = unit[field.key] !== undefined ? unit[field.key] : '';
        } else {
            formData[field.key] = input.value || '';
        }
        
        wrapper.appendChild(input);
        formContainer.appendChild(wrapper);
    });
    
    
    const subclassWrapper = document.createElement('div');
    subclassWrapper.style.cssText = 'margin-bottom: 12px;';
    const subclassLabel = document.createElement('label');
    subclassLabel.textContent = 'Subclasses (comma-separated)';
    subclassLabel.style.cssText = 'display: block; color: var(--text-body-main); font-size: 12px; font-weight: bold; margin-bottom: 4px;';
    const subclassInput = document.createElement('input');
    subclassInput.type = 'text';
    subclassInput.placeholder = 'DPS,Healer,Support';
    subclassInput.style.cssText = 'width: 100%; padding: 6px; background: var(--bg-input-field); color: var(--text-body-main); border: 1px solid var(--border-matrix); border-radius: 3px; box-sizing: border-box;';
    subclassInput.value = draftData?.subclasses?.join(', ') ?? (isEdit ? unit.subclasses.join(', ') : '');
    subclassInput.addEventListener('input', (e) => {
        formData.subclasses = e.target.value.split(',').map(s => s.trim()).filter(s => s);
        saveAdminUnitDraft(unitId, formData);
    });
    formData.subclasses = draftData?.subclasses ?? (isEdit ? unit.subclasses : []);
    subclassWrapper.appendChild(subclassLabel);
    subclassWrapper.appendChild(subclassInput);
    formContainer.appendChild(subclassWrapper);
    
    
    const obtainWrapper = document.createElement('div');
    obtainWrapper.style.cssText = 'margin-bottom: 12px; padding: 10px; background: var(--bg-input-field); border-radius: 4px;';
    const obtainLabel = document.createElement('label');
    obtainLabel.textContent = 'Obtainments (one per line: source|chance|method)';
    obtainLabel.style.cssText = 'display: block; color: var(--text-body-main); font-size: 12px; font-weight: bold; margin-bottom: 4px;';
    const obtainInput = document.createElement('textarea');
    obtainInput.style.cssText = 'width: 100%; padding: 6px; background: var(--bg-card-panel); color: var(--text-body-main); border: 1px solid var(--border-matrix); border-radius: 3px; box-sizing: border-box; font-family: monospace; font-size: 11px; height: 80px;';
    obtainInput.placeholder = 'Wave 1|100|Guaranteed\nChest|50|Random Drop';
    obtainInput.value = draftData?.obtainments ? draftData.obtainments.map(o => `${o.source}|${o.chance}|${o.method}`).join('\n') : (isEdit && unit.obtainments ? unit.obtainments.map(o => `${o.source}|${o.chance}|${o.method}`).join('\n') : '');
    obtainInput.addEventListener('input', (e) => {
        const lines = e.target.value.split('\n').filter(line => line.trim());
        formData.obtainments = lines.map(line => {
            const [source, chance, method] = line.split('|').map(s => s.trim());
            return { source, chance: parseInt(chance) || 0, method };
        });
        saveAdminUnitDraft(unitId, formData);
    });
    formData.obtainments = draftData?.obtainments ?? (isEdit && unit.obtainments ? unit.obtainments : []);
    obtainWrapper.appendChild(obtainLabel);
    obtainWrapper.appendChild(obtainInput);
    formContainer.appendChild(obtainWrapper);
    
    
    const aliasWrapper = document.createElement('div');
    aliasWrapper.style.cssText = 'margin-bottom: 12px;';
    const aliasLabel = document.createElement('label');
    aliasLabel.textContent = 'Aliases (comma-separated unit IDs)';
    aliasLabel.style.cssText = 'display: block; color: var(--text-body-main); font-size: 12px; font-weight: bold; margin-bottom: 4px;';
    const aliasInput = document.createElement('input');
    aliasInput.type = 'text';
    aliasInput.placeholder = 'U001,U002,U003';
    aliasInput.style.cssText = 'width: 100%; padding: 6px; background: var(--bg-input-field); color: var(--text-body-main); border: 1px solid var(--border-matrix); border-radius: 3px; box-sizing: border-box;';
    aliasInput.value = draftData?.aliases?.join(', ') ?? (isEdit && unit.aliases ? unit.aliases.join(', ') : '');
    aliasInput.addEventListener('input', (e) => {
        formData.aliases = e.target.value.split(',').map(s => s.trim()).filter(s => s);
        saveAdminUnitDraft(unitId, formData);
    });
    formData.aliases = draftData?.aliases ?? (isEdit && unit.aliases ? unit.aliases : []);
    aliasWrapper.appendChild(aliasLabel);
    aliasWrapper.appendChild(aliasInput);
    formContainer.appendChild(aliasWrapper);

    const fanmadeWrapper = document.createElement('div');
    fanmadeWrapper.style.cssText = 'margin-bottom: 12px; padding: 10px; background: var(--bg-input-field); border-radius: 4px;';
    const fanmadeLabel = document.createElement('label');
    fanmadeLabel.textContent = CONFIG.getText('ADMIN.FORM_FANMADE_BUFFS') + ' (one per line: name|description)';
    fanmadeLabel.style.cssText = 'display: block; color: var(--text-body-main); font-size: 12px; font-weight: bold; margin-bottom: 4px;';
    const fanmadeInput = document.createElement('textarea');
    fanmadeInput.style.cssText = 'width: 100%; padding: 6px; background: var(--bg-card-panel); color: var(--text-body-main); border: 1px solid var(--border-matrix); border-radius: 3px; box-sizing: border-box; font-family: monospace; font-size: 11px; height: 80px;';
    fanmadeInput.placeholder = 'Strength Boost|+15% damage when attacking single target\nSpeed Buff|+10% attack speed after 5 hits';
    fanmadeInput.value = draftData?.fanmadeBuffs ? draftData.fanmadeBuffs.map(p => `${p.name}|${p.desc}`).join('\n') : (isEdit && unit.fanmadeBuffs ? unit.fanmadeBuffs.map(p => `${p.name}|${p.desc}`).join('\n') : '');
    fanmadeInput.addEventListener('input', (e) => {
        const lines = e.target.value.split('\n').filter(l => l.trim());
        formData.fanmadeBuffs = lines.map(l => {
            const [name, desc] = l.split('|').map(s => s.trim());
            return { name, desc: desc || '' };
        });
        saveAdminUnitDraft(unitId, formData);
    });
    formData.fanmadeBuffs = draftData?.fanmadeBuffs ?? (isEdit && unit.fanmadeBuffs ? unit.fanmadeBuffs : []);
    fanmadeWrapper.appendChild(fanmadeLabel);
    fanmadeWrapper.appendChild(fanmadeInput);
    formContainer.appendChild(fanmadeWrapper);

    const subunitsWrapper = document.createElement('div');
    subunitsWrapper.style.cssText = 'margin-bottom: 12px; padding: 10px; background: var(--bg-input-field); border-radius: 4px;';
    const subunitsLabel = document.createElement('label');
    subunitsLabel.textContent = CONFIG.getText('ADMIN.FORM_SUBUNITS') + ' (one per line: unitId|note)';
    subunitsLabel.style.cssText = 'display: block; color: var(--text-body-main); font-size: 12px; font-weight: bold; margin-bottom: 4px;';
    const subunitsInput = document.createElement('textarea');
    subunitsInput.style.cssText = 'width: 100%; padding: 6px; background: var(--bg-card-panel); color: var(--text-body-main); border: 1px solid var(--border-matrix); border-radius: 3px; box-sizing: border-box; font-family: monospace; font-size: 11px; height: 80px;';
    subunitsInput.placeholder = 'U012|Remake with artillery charge\nU045|Unofficial support variant';
    subunitsInput.value = draftData?.subUnits ? draftData.subUnits.map(item => `${item.id}|${item.note || ''}`).join('\n') : (isEdit && unit.subUnits ? unit.subUnits.map(item => `${item.id}|${item.note || ''}`).join('\n') : '');
    subunitsInput.addEventListener('input', (e) => {
        const lines = e.target.value.split('\n').filter(l => l.trim());
        formData.subUnits = lines.map(l => {
            const [id, note] = l.split('|').map(s => s.trim());
            return { id, note: note || '' };
        });
        saveAdminUnitDraft(unitId, formData);
    });
    formData.subUnits = draftData?.subUnits ?? (isEdit && unit.subUnits ? unit.subUnits : []);
    subunitsWrapper.appendChild(subunitsLabel);
    subunitsWrapper.appendChild(subunitsInput);
    formContainer.appendChild(subunitsWrapper);

    const passivesWrapper = document.createElement('div');
    passivesWrapper.style.cssText = 'margin-bottom: 12px; padding: 10px; background: var(--bg-input-field); border-radius: 4px;';
    const passivesLabel = document.createElement('label');
    passivesLabel.textContent = 'Passives (one per line: name|description)';
    passivesLabel.style.cssText = 'display: block; color: var(--text-body-main); font-size: 12px; font-weight: bold; margin-bottom: 4px;';
    const passivesInput = document.createElement('textarea');
    passivesInput.style.cssText = 'width: 100%; padding: 6px; background: var(--bg-card-panel); color: var(--text-body-main); border: 1px solid var(--border-matrix); border-radius: 3px; box-sizing: border-box; font-family: monospace; font-size: 11px; height: 80px;';
    passivesInput.placeholder = 'Hat Toss|applies bleed for 1s\nSpecialty Cupcake|burn on 5th attack';
    passivesInput.value = draftData?.passives ? draftData.passives.map(p => `${p.name}|${p.desc}`).join('\n') : (isEdit && unit.passives ? unit.passives.map(p => `${p.name}|${p.desc}`).join('\n') : '');
    passivesInput.addEventListener('input', (e) => {
        const lines = e.target.value.split('\n').filter(l => l.trim());
        formData.passives = lines.map(l => {
            const [name, desc] = l.split('|').map(s => s.trim());
            return { name, desc };
        });
        saveAdminUnitDraft(unitId, formData);
    });
    formData.passives = draftData?.passives ?? (isEdit && unit.passives ? unit.passives : []);
    passivesWrapper.appendChild(passivesLabel);
    passivesWrapper.appendChild(passivesInput);
    formContainer.appendChild(passivesWrapper);

    
    const abilitiesWrapper = document.createElement('div');
    abilitiesWrapper.style.cssText = 'margin-bottom: 12px; padding: 10px; background: var(--bg-input-field); border-radius: 4px;';
    const abilitiesLabel = document.createElement('label');
    abilitiesLabel.textContent = 'Abilities (one per line: name|description)';
    abilitiesLabel.style.cssText = 'display: block; color: var(--text-body-main); font-size: 12px; font-weight: bold; margin-bottom: 4px;';
    const abilitiesInput = document.createElement('textarea');
    abilitiesInput.style.cssText = 'width: 100%; padding: 6px; background: var(--bg-card-panel); color: var(--text-body-main); border: 1px solid var(--border-matrix); border-radius: 3px; box-sizing: border-box; font-family: monospace; font-size: 11px; height: 80px;';
    abilitiesInput.placeholder = 'Glock Shot|High damage single target\nHeal Wave|Heals allies in range';
    abilitiesInput.value = draftData?.abilities ? draftData.abilities.map(p => `${p.name}|${p.desc}`).join('\n') : (isEdit && unit.abilities ? unit.abilities.map(p => `${p.name}|${p.desc}`).join('\n') : '');
    abilitiesInput.addEventListener('input', (e) => {
        const lines = e.target.value.split('\n').filter(l => l.trim());
        formData.abilities = lines.map(l => {
            const [name, desc] = l.split('|').map(s => s.trim());
            return { name, desc };
        });
        saveAdminUnitDraft(unitId, formData);
    });
    formData.abilities = draftData?.abilities ?? (isEdit && unit.abilities ? unit.abilities : []);
    abilitiesWrapper.appendChild(abilitiesLabel);
    abilitiesWrapper.appendChild(abilitiesInput);
    formContainer.appendChild(abilitiesWrapper);
    
    
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = 'display: flex; gap: 10px; margin-top: 15px;';
    
    const saveBtn = document.createElement('button');
    saveBtn.textContent = isEdit ? CONFIG.getText('ADMIN.SAVE_UNIT') : CONFIG.getText('ADMIN.ADD_UNIT_BUTTON');
    saveBtn.style.cssText = 'flex: 1; padding: 10px; background: var(--color-accent-blue); color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;';
    saveBtn.onclick = () => {
        submitUnitForm(formData, isEdit, formOverlay, unitId);
    };
    
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = CONFIG.getText('ADMIN.CANCEL');
    cancelBtn.style.cssText = 'flex: 1; padding: 10px; background: var(--text-body-muted); color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;';
    cancelBtn.onclick = () => {
        formOverlay.remove();
    };
    
    buttonContainer.appendChild(saveBtn);
    buttonContainer.appendChild(cancelBtn);
    formContainer.appendChild(buttonContainer);
    
    formOverlay.appendChild(formContainer);
    document.body.appendChild(formOverlay);
    
    formOverlay.addEventListener('click', (e) => {
        if (e.target === formOverlay) formOverlay.remove();
    });
}

function submitUnitForm(formData, isEdit, formOverlay, unitId) {
    
    const required = ['id', 'name', 'rarity', 'class', 'synergy', 'element', 'placementCost', 'placementLimit', 'dmg_min', 'dmg_max', 'range_min', 'range_max', 'cd_min', 'cd_max'];
    for (let field of required) {
        if (!formData[field]) {
            alert('Missing required field: ' + field);
            return;
        }
    }
    
    
    const newUnit = {
        id: formData.id,
        name: formData.name,
        rarity: formData.rarity,
        class: formData.class,
        subclasses: formData.subclasses || [],
        synergy: formData.synergy,
        placementCost: formData.placementCost,
        placementLimit: formData.placementLimit,
        obtainments: formData.obtainments || [],
        aliases: formData.aliases || [],
        fanmadeBuffs: formData.fanmadeBuffs || [],
        subUnits: formData.subUnits || [],
        damage: [formData.dmg_min, formData.dmg_max],
        range: [formData.range_min, formData.range_max],
        cooldown: [formData.cd_min, formData.cd_max],
        element: formData.element,
        passives: formData.passives || [],
        abilities: formData.abilities || [],
        image: '',
        rank: formData.rank || 'F',
        rankedId: formData.rankedId || 0,
        rankedWave: formData.rankedWave || 0
    };
    
    if (isEdit) {
        
        const idx = DB_UNITS.findIndex(u => u.id === newUnit.id);
        if (idx >= 0) {
            DB_UNITS[idx] = { ...newUnit, isCustom: DB_UNITS[idx].isCustom !== false };
        }
    } else {
        DB_UNITS.push({ ...newUnit, isCustom: true });
    }
    const deletedIds = getDeletedUnitIds();
    if (deletedIds.has(newUnit.id)) {
        deletedIds.delete(newUnit.id);
        saveDeletedUnitIds(deletedIds);
    }
    
    
    saveCustomUnitsToStorage();
    clearAdminUnitDraft(unitId);
    
    alert(CONFIG.getText('ADMIN.SUCCESS_MESSAGE'));
    formOverlay.remove();
    loadAdminUnitsList();
}

function editAdminUnit(unitId) {
    openAdminUnitForm(unitId);
}

function deleteAdminUnit(unitId) {
    if (confirm('Delete unit ' + unitId + '?')) {
        const idx = DB_UNITS.findIndex(u => u.id === unitId);
        if (idx >= 0) DB_UNITS.splice(idx, 1);
        const deletedIds = getDeletedUnitIds();
        deletedIds.add(unitId);
        saveDeletedUnitIds(deletedIds);
        saveCustomUnitsToStorage();
        loadAdminUnitsList();
        renderTierlist();
        renderManualBuilderPool();
        renderTeamUnitSelector();
        alert(CONFIG.getText('MESSAGES.UNIT_DELETED') || 'Unit deleted');
    }
}

 

function generateUniqueId() {
    
    const existingIds = DB_UNITS
        .map(u => u.id)
        .filter(id => /^U\d+$/.test(id))
        .map(id => parseInt(id.substring(1)))
        .sort((a, b) => a - b);
    
    const nextNum = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
    return 'U' + String(nextNum).padStart(3, '0');
}

function exportUnits() {
    const dataStr = JSON.stringify(DB_UNITS, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'fntd2_units_export.json';
    link.click();
    URL.revokeObjectURL(url);
    alert('Units exported to fntd2_units_export.json');
}

function handleImportFile(files) {
    if (files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedUnits = JSON.parse(e.target.result);
            if (!Array.isArray(importedUnits)) {
                alert('Invalid file: must contain array of units');
                return;
            }
            
            
            importedUnits.forEach(importedUnit => {
                const existingIndex = DB_UNITS.findIndex(u => u.id === importedUnit.id);
                if (existingIndex >= 0) {
                    DB_UNITS[existingIndex] = importedUnit;
                } else {
                    DB_UNITS.push(importedUnit);
                }
            });
            
            saveCustomUnitsToStorage();
            loadAdminUnitsList();
            alert('Imported ' + importedUnits.length + ' units successfully');
        } catch (err) {
            alert('Error parsing JSON: ' + err.message);
        }
    };
    reader.readAsText(file);
}

function generateDataJSSnippet() {
    const snippet = 'const DB_UNITS = ' + JSON.stringify(DB_UNITS, null, 2) + ';';
    
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:10002;';
    
    const content = document.createElement('div');
    content.style.cssText = 'background: var(--bg-card-panel); padding: 20px; border-radius: 8px; max-width: 600px; max-height: 80vh; overflow-y: auto; border: 1px solid var(--border-matrix);';
    
    const title = document.createElement('h3');
    title.textContent = 'Copy data.js Snippet';
    title.style.cssText = 'color: var(--text-heading); margin: 0 0 10px 0;';
    content.appendChild(title);
    
    const description = document.createElement('p');
    description.textContent = 'Copy the code below and paste it into your data.js file:';
    description.style.cssText = 'color: var(--text-body-main); font-size: 12px; margin: 0 0 10px 0;';
    content.appendChild(description);
    
    const codeBlock = document.createElement('textarea');
    codeBlock.value = snippet;
    codeBlock.readOnly = true;
    codeBlock.style.cssText = 'width: 100%; height: 300px; padding: 10px; background: var(--bg-input-field); color: var(--text-body-main); border: 1px solid var(--border-matrix); border-radius: 3px; font-family: monospace; font-size: 11px; box-sizing: border-box;';
    content.appendChild(codeBlock);
    
    const btnContainer = document.createElement('div');
    btnContainer.style.cssText = 'display: flex; gap: 10px; margin-top: 10px;';
    
    const copyBtn = document.createElement('button');
    copyBtn.textContent = '📋 Copy to Clipboard';
    copyBtn.style.cssText = 'flex:1; padding: 8px; background: var(--color-accent-blue); color: white; border: none; border-radius: 3px; cursor: pointer; font-weight: bold;';
    copyBtn.onclick = () => {
        navigator.clipboard.writeText(snippet).then(() => {
            alert('Copied to clipboard!');
            modal.remove();
        });
    };
    btnContainer.appendChild(copyBtn);
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.style.cssText = 'flex:1; padding: 8px; background: var(--text-body-muted); color: white; border: none; border-radius: 3px; cursor: pointer; font-weight: bold;';
    closeBtn.onclick = () => modal.remove();
    btnContainer.appendChild(closeBtn);
    
    content.appendChild(btnContainer);
    modal.appendChild(content);
    document.body.appendChild(modal);
}

 

let currentDetailTab = 'stats';

function switchDetailTab(tabName) {
    currentDetailTab = tabName;
    const tabs = document.querySelectorAll('[data-detail-tab]');
    const contents = document.querySelectorAll('[data-detail-content]');
    
    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.style.display = 'none');
    
    document.querySelector(`[data-detail-tab="${tabName}"]`)?.classList.add('active');
    document.querySelector(`[data-detail-content="${tabName}"]`).style.display = 'block';
}

function formatObtainments(obtainmentsData) {
    
    if (typeof obtainmentsData === 'string') {
        return `<div style="font-size:13px; color:var(--text-heading);">${obtainmentsData}</div>`;
    }
    
    if (!Array.isArray(obtainmentsData) || obtainmentsData.length === 0) {
        return `<div style="color:var(--text-body-muted); font-size:13px;">No obtainment data.</div>`;
    }
    
    const sorted = [...obtainmentsData].sort((a, b) => b.chance - a.chance);
    let html = `<table style="width:100%; border-collapse: collapse; font-size:13px;">
        <thead>
            <tr style="border-bottom: 2px solid var(--border-matrix);">
                <th style="text-align:left; padding:8px; color:var(--text-body-muted);">Source</th>
                <th style="text-align:center; padding:8px; color:var(--text-body-muted);">Chance</th>
                <th style="text-align:left; padding:8px; color:var(--text-body-muted);">Method</th>
            </tr>
        </thead>
        <tbody>`;
    
    sorted.forEach(obt => {
        html += `<tr style="border-bottom: 1px solid var(--border-matrix);">
            <td style="padding:8px;">${obt.source}</td>
            <td style="text-align:center; padding:8px; color:var(--color-accent-blue); font-weight:bold;">${obt.chance}%</td>
            <td style="padding:8px;">${obt.method}</td>
        </tr>`;
    });
    
    html += `</tbody></table>`;
    return html;
}

function formatAliases(aliases, currentUnitId) {
    if (!Array.isArray(aliases) || aliases.length === 0) {
        return `<div style="color:var(--text-body-muted); font-size:13px;">No aliases available.</div>`;
    }
    
    let html = `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px;">`;
    
    aliases.forEach(aliasId => {
        const aliasUnit = DB_UNITS.find(u => u.id === aliasId);
        if (aliasUnit) {
            html += `<button onclick="visualizeSpecificUnitSubpage(DB_UNITS.find(u => u.id === '${aliasId}'))" style="
                padding: 10px;
                background: var(--bg-input-field);
                border: 1px solid var(--color-accent-blue);
                border-radius: 4px;
                color: var(--text-heading);
                cursor: pointer;
                font-weight: 600;
                text-align: center;
                transition: all var(--anim-speed-factor);
            " onmouseover="this.style.background = var(--color-accent-blue); this.style.color = 'white';" onmouseout="this.style.background = 'var(--bg-input-field)'; this.style.color = 'var(--text-heading)';">
                🔗 ${aliasUnit.name}
            </button>`;
        }
    });
    
    html += `</div>`;
    return html;
}

document.addEventListener('DOMContentLoaded', () => {
    initAdminPanel();
    if (typeof loadCustomUnitsFromStorage === 'function') {
    }
});