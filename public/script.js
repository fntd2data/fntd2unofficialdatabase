let currentFiltersState = {
    search: "", sort: "high-low", rarities: [], ranks: [], classes: [], subclasses: [], synergy: "All"
};
let currentTeam = [];

const UNIT_NAME_ALIASES = {
    "marionette": "puppet",
    "puppet": "marionette"
};

const OFFICIAL_IMAGE_SERVICE_URL = 'https://cold-rice-a39a.callofdutyblackops2prueba.workers.dev';
let OFFICIAL_IMAGE_CACHE = {};
try {
    OFFICIAL_IMAGE_CACHE = JSON.parse(localStorage.getItem('fntd2_official_image_cache_v2') || '{}');
} catch (e) {
    OFFICIAL_IMAGE_CACHE = {};
}
const OFFICIAL_IMAGE_FETCHING = new Set();
const OFFICIAL_DATA_CACHE_KEY = 'fntd2_official_unit_cache_v2';
const CUSTOM_UNITS_KEY = 'fntd2_custom_units_v2';
const DELETED_UNITS_KEY = 'fntd2_deleted_unit_ids_v1';

function getOfficialUnitImageUrl(unit) {
    if (!unit) return '';
    
    if (unit.officialImageUrl && unit.officialImageUrl.trim()) {
        return unit.officialImageUrl;
    }
    
    // Check if we have an asset ID
    let assetId = unit.officialAssetId;
    if (assetId) {
        if (OFFICIAL_IMAGE_CACHE[assetId]) return OFFICIAL_IMAGE_CACHE[assetId];
        queueOfficialImageFetch(assetId);
    }
    
    return '';
}

function queueOfficialImageFetch(assetId) {
    if (!assetId || OFFICIAL_IMAGE_FETCHING.has(assetId) || OFFICIAL_IMAGE_CACHE[assetId] !== undefined) return;
    OFFICIAL_IMAGE_FETCHING.add(assetId);
    
    const targetUrl = `${OFFICIAL_IMAGE_SERVICE_URL}/?assetIds=${assetId}&v=4`;
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(targetUrl)}`;
    
    fetch(proxyUrl)
        .then(response => response.json())
        .then(payload => {
            const imageUrl = payload?.data?.[0]?.imageUrl;
            if (imageUrl) {
                OFFICIAL_IMAGE_CACHE[assetId] = imageUrl;
                try {
                    localStorage.setItem('fntd2_official_image_cache_v2', JSON.stringify(OFFICIAL_IMAGE_CACHE));
                } catch (_) {}
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
        const unitId = card.dataset.unitId;
        if (unitId) {
            const unit = DB_UNITS.find(u => u.id === unitId);
            if (unit) {
                applyRarityCardStyle(card, unit);
                return;
            }
        }
        card.style.backgroundImage = `url('${imageUrl}')`;
    });
}

function getUnitImageUrl(unit) {
    if (!unit) return '';
    
    // 1. Check direct official URL / overrides / assetId
    const officialImage = getOfficialUnitImageUrl(unit);
    if (officialImage && officialImage !== '') return officialImage;
    
    // 2. Check fetched online image
    if (unit.image && unit.image.trim() !== '') {
        // If it's a raw roblox asset ID from wiki_data, convert to thumbnail URL
        if (unit.image.includes('rbxassetid://')) {
            const assetId = unit.image.replace('rbxassetid://', '').trim();
            if (assetId) {
                if (OFFICIAL_IMAGE_CACHE[assetId]) return OFFICIAL_IMAGE_CACHE[assetId];
                queueOfficialImageFetch(assetId);
                return `https://iili.io/qftJu7p.png`;
            }
        }
        
        // If it's a Google Drive ID, let's format it with dimensions for embedding
        const trimmed = unit.image.trim();
        if (trimmed.length === 33 || (!trimmed.startsWith('http') && trimmed !== '')) {
            return `https://drive.google.com/thumbnail?id=${trimmed}&sz=w500`;
        }
        
        // Otherwise, it is a fully formed URL
        return trimmed;
    }
    
    // 3. Fallback dynamically to a predictable local or clean vector icon placeholder instead of a broken page URL
    return `https://iili.io/qftJu7p.png`;
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

function parseOfficialStat(html, label) {
    const safeLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`${safeLabel}\\s*([\\d,.kK+NAna/-]+)`, 'i');
    const match = html.match(regex);
    return match?.[1]?.trim() || '';
}

function parseNumberLike(value) {
    if (!value) return null;
    const cleanStr = String(value).trim().toLowerCase();
    if (cleanStr === 'n/a') return null;

    const parsePart = (part) => {
        const cleaned = part.replace(/[^0-9.k]/g, '');
        const hasK = cleaned.includes('k');
        const numPart = parseFloat(cleaned.replace('k', ''));
        if (isNaN(numPart)) return null;
        return hasK ? numPart * 1000 : numPart;
    };

    if (cleanStr.includes('-')) {
        const parts = cleanStr.split('-');
        const val1 = parsePart(parts[0]);
        const val2 = parsePart(parts[1]);
        if (val1 !== null && val2 !== null) {
            return Math.round((val1 + val2) / 2);
        } else if (val1 !== null) {
            return Math.round(val1);
        } else if (val2 !== null) {
            return Math.round(val2);
        }
    }

    const singleVal = parsePart(cleanStr);
    return singleVal !== null ? Math.round(singleVal) : null;
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
    if (!url) return null;
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
    try {
        const res = await fetch(proxyUrl);
        if (!res.ok) return null;
        return await res.text();
    } catch (e) {
        console.warn("Proxy fetch failed:", e);
        return null;
    }
}

async function hydrateUnitFromOfficial(unit) {
    if (!unit || !unit.name) return unit;
    
    // Automation: Always ensure image is predicted if nothing else exists
    if (!unit.image || unit.image === "") {
        unit.image = getUnitImageUrl(unit);
    }

    const url = getOfficialUnitUrl(unit);
    try {
        const html = await fetchOfficialText(url);
        if (!html) return unit;
        
        const costStr = parseOfficialStat(html, "Placement Price") || parseOfficialStat(html, "Cost");
        const limitStr = parseOfficialStat(html, "Max Placed") || parseOfficialStat(html, "Limit");
        
        if (costStr) {
            const parsedCost = parseNumberLike(costStr);
            if (parsedCost !== null) unit.placementCost = parsedCost;
        }
        if (limitStr) {
            const parsedLimit = parseInt(limitStr.replace(/[^\d]/g, ''), 10);
            if (!isNaN(parsedLimit)) unit.placementLimit = parsedLimit;
        }

        const rarityMatch = html.match(/Rarity<\/div>\s*<div[^>]*>([^<]+)<\/div>/i);
        if (rarityMatch) unit.rarity = rarityMatch[1].trim();

        const elementMatch = html.match(/Element<\/div>\s*<div[^>]*>([^<]+)<\/div>/i);
        if (elementMatch) unit.element = elementMatch[1].trim();

        const assetMatch = html.match(/rbxassetid:\/\/(\d+)/i);
        if (assetMatch) {
            unit.officialAssetId = assetMatch[1];
            queueOfficialImageFetch(unit.officialAssetId);
        } else {
            // Try to find a meta image or main img tag if it's not a roblox asset
            const metaImgMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
            if (metaImgMatch) {
                unit.officialImageUrl = metaImgMatch[1];
            } else {
                const mainImgMatch = html.match(/src=["']([^"']+\/(?:units|database|assets)[^"']+\.(?:png|webp|jpg))["']/i);
                if (mainImgMatch) {
                    unit.officialImageUrl = mainImgMatch[1];
                }
            }
        }
        
        normalizeUnitData(unit);
    } catch (e) {
        console.warn(`Auto-hydration failed for ${unit.name}:`, e);
    }
    return unit;
}

// Add auto-detection logic to the creator form
document.getElementById('creator-name')?.addEventListener('blur', async (e) => {
    const name = e.target.value.trim();
    if (!name) return;
    
    // 1. Look for existing unit in DB first
    const existing = DB_UNITS.find(u => u.name.toLowerCase() === name.toLowerCase());
    if (existing) {
        document.getElementById('creator-cost').value = existing.placementCost;
        document.getElementById('creator-limit').value = existing.placementLimit;
        document.getElementById('creator-element').value = existing.element;
        document.getElementById('creator-rarity').value = existing.rarity;
        return;
    }

    // 2. Otherwise try to hydrate from official DB (Automatic detection!)
    const tempUnit = { name: name };
    await hydrateUnitFromOfficial(tempUnit);
    
    if (tempUnit.placementCost) document.getElementById('creator-cost').value = tempUnit.placementCost;
    if (tempUnit.placementLimit) document.getElementById('creator-limit').value = tempUnit.placementLimit;
    if (tempUnit.element) document.getElementById('creator-element').value = tempUnit.element;
    if (tempUnit.rarity) document.getElementById('creator-rarity').value = tempUnit.rarity;
});

function getBestUnitMatch(variantName) {
    if (!variantName) return null;
    
    const sanitize = (s) => s.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanVariant = sanitize(variantName);
    
    // First, check for exact sanitized match
    let exactUnit = null;
    DB_UNITS.forEach(u => {
        const uSanitized = sanitize(u.name);
        const alias = UNIT_NAME_ALIASES[u.name.toLowerCase()];
        const aliasSanitized = alias ? sanitize(alias) : '';
        
        if (cleanVariant === uSanitized || (aliasSanitized && cleanVariant === aliasSanitized)) {
            exactUnit = u;
        }
    });
    if (exactUnit) return exactUnit;

    // Substring matching, prioritizing the longest matched name
    let bestUnit = null;
    let maxLength = 0;
    DB_UNITS.forEach(u => {
        const uSanitized = sanitize(u.name);
        const alias = UNIT_NAME_ALIASES[u.name.toLowerCase()];
        const aliasSanitized = alias ? sanitize(alias) : '';

        let isMatch = false;
        let matchLength = 0;

        if (cleanVariant.includes(uSanitized) || uSanitized.includes(cleanVariant)) {
            isMatch = true;
            matchLength = uSanitized.length;
        } else if (aliasSanitized && (cleanVariant.includes(aliasSanitized) || aliasSanitized.includes(cleanVariant))) {
            isMatch = true;
            matchLength = aliasSanitized.length;
        }

        if (isMatch) {
            if (matchLength > maxLength) {
                maxLength = matchLength;
                bestUnit = u;
            }
        }
    });

    return bestUnit;
}

// Global modal state tracker
let selectedDetailUnit = null;

function openUnitDetailModal(unit) {
    if (!unit) return;
    selectedDetailUnit = unit;
    
    document.getElementById('detail-unit-name').textContent = unit.name;
    
    const imgNode = document.getElementById('detail-unit-image');
    const assetId = unit.officialAssetId || '';
    if (assetId) {
        imgNode.setAttribute('data-unit-asset', assetId);
    } else {
        imgNode.removeAttribute('data-unit-asset');
    }
    imgNode.style.backgroundImage = `url('${getUnitImageUrl(unit)}')`;
    
    // Setup variant picker options
    const picker = document.getElementById('detail-variant-picker');
    picker.innerHTML = '';
    if (unit.allVariants && unit.allVariants.length > 1) {
        unit.allVariants.forEach((v, index) => {
            const option = document.createElement('option');
            option.value = index;
            // Format nice human option names, e.g. standard vs cosmetics
            const cleanVal = '';
            option.textContent = `${v.name}${cleanVal}`;
            if (v.name === unit.activeVariantName) {
                option.selected = true;
            }
            picker.appendChild(option);
        });
        picker.parentElement.style.display = 'block';
    } else {
        picker.parentElement.style.display = 'none';
    }
    
    renderDetailStatsList(unit);
    
    document.getElementById('unit-detail-overlay').style.display = 'flex';
}

function renderDetailStatsList(unit) {
    const list = document.getElementById('detail-stats-list');
    const canonStatus = unit.canon === false 
        ? `<span style="color:#ffd700; font-weight:bold; letter-spacing:0.5px;">Unofficial Fan Concept</span>` 
        : `Official FNTD2 Unit`;
    
    list.innerHTML = `
        <div class="tt-line"><span style="color:var(--text-body-muted)">Type:</span><strong>${canonStatus}</strong></div>
        <div class="tt-line"><span style="color:var(--text-body-muted)">Rarity:</span><span style="font-weight:700;" class="t-badge rarity-${(unit.rarity || '').replace(/\s+/g,'-')}">${unit.rarity || 'Common'}</span></div>
        <div class="tt-line"><span style="color:var(--text-body-muted)">Element:</span><strong>${unit.element || 'Neutral'}</strong></div>
        <div class="tt-line"><span style="color:var(--text-body-muted)">Placement Cost:</span><strong>$${unit.placementCost || 0}</strong></div>
        <div class="tt-line"><span style="color:var(--text-body-muted)">Placement Limit:</span><strong>${unit.placementLimit || 5}</strong></div>
        <div class="tt-line"><span style="color:var(--text-body-muted)">Trend Status:</span><span style="font-weight:700;">${unit.status || 'Stable'}</span></div>
        
        <div style="border-top: 1px solid var(--border-matrix); margin: 8px 0; padding-top: 8px;"></div>
        
        <div class="tt-line"><span style="color:var(--text-body-muted)">Endless Rank:</span><span style="color:var(--color-accent-blue); font-weight:700;">${unit.endlessRank || 'N/A'}</span></div>
        <div class="tt-line tt-placement"><span style="color:var(--text-body-muted)">Placement:</span><span>#${unit.endlessPlacement || 'N/A'}</span></div>
        
        <div class="tt-line"><span style="color:var(--text-body-muted)">Synergy Rank:</span><span>${unit.synergyRank || 'N/A'}</span></div>
        <div class="tt-line tt-placement"><span style="color:var(--text-body-muted)">Placement:</span><span>#${unit.synergyPlacement || 'N/A'}</span></div>
        
        <div class="tt-line"><span style="color:var(--text-body-muted)">Obtainability Rank:</span><span>${unit.obtainabilityRank || 'N/A'}</span></div>
        <div class="tt-line tt-placement"><span style="color:var(--text-body-muted)">Placement:</span><span>#${unit.obtainabilityPlacement || 'N/A'}</span></div>
        
        <div class="tt-line"><span style="color:var(--text-body-muted)">Overall Rank:</span><span>${unit.overallRank || 'N/A'}</span></div>
    `;
}

function applySelectedVariant() {
    if (!selectedDetailUnit || !selectedDetailUnit.allVariants) return;
    const index = parseInt(document.getElementById('detail-variant-picker').value, 10);
    const v = selectedDetailUnit.allVariants[index];
    if (!v) return;
    
    // Mutate state with selected cosmetic variant details
    selectedDetailUnit.activeVariantName = v.name;
    selectedDetailUnit.placementCost = v.placementCost;
    selectedDetailUnit.placementLimit = v.placementLimit;
    selectedDetailUnit.rarity = v.rarity;
    selectedDetailUnit.element = v.element;
    selectedDetailUnit.synergy = v.element;
    selectedDetailUnit.status = v.status;
    selectedDetailUnit.officialAssetId = v.officialAssetId || '';
    if (v.image) {
        selectedDetailUnit.image = v.image;
    } else {
        selectedDetailUnit.image = '';
    }
    
    // Save to localStorage so chosen cosmetic preferences persist across sessions and exports
    const savedSelections = JSON.parse(localStorage.getItem('fntd2_selected_variants') || '{}');
    savedSelections[selectedDetailUnit.id] = v.name;
    localStorage.setItem('fntd2_selected_variants', JSON.stringify(savedSelections));
    
    // Instantly update visual nodes
    const imgNode = document.getElementById('detail-unit-image');
    if (selectedDetailUnit.officialAssetId) {
        imgNode.setAttribute('data-unit-asset', selectedDetailUnit.officialAssetId);
    } else {
        imgNode.removeAttribute('data-unit-asset');
    }
    imgNode.style.backgroundImage = `url('${getUnitImageUrl(selectedDetailUnit)}')`;
    renderDetailStatsList(selectedDetailUnit);
    
    renderTierlist();
    renderManualBuilderPool();
    renderTeamUnitSelector();
    renderTradeUnitSelector();
    renderTeamSlotGrid();
    updateTeamRatingPanel();
}

function closeUnitDetailModal() {
    document.getElementById('unit-detail-overlay').style.display = 'none';
    selectedDetailUnit = null;
}

function visitDetailOfficialPage() {
    if (!selectedDetailUnit) return;
    const url = getOfficialUnitUrl(selectedDetailUnit);
    window.open(url, '_blank', 'noopener');
}

async function hydrateUnitsFromOfficialSources() {
    // Render initially using current high-contrast local dataset
    renderTierlist();
    renderManualBuilderPool();
    renderTeamUnitSelector();
    renderTradeUnitSelector();

    try {
        console.log("Synchronising database with live fntd2.com datasets via full-stack proxies...");
        const [allUnitsRaw, wikiDataRaw] = await Promise.all([
            fetchOfficialText("https://fntd2.com/all_units.json"),
            fetchOfficialText("https://fntd2.com/wiki_data.json")
        ]);

        const allUnitsMap = JSON.parse(allUnitsRaw);
        const wikiDataMap = JSON.parse(wikiDataRaw);

        const allUnitsArray = Object.values(allUnitsMap || {});
        let wikiUnitsArray = [];
        if (wikiDataMap && wikiDataMap.data) {
            wikiUnitsArray = typeof wikiDataMap.data === "object" ? Object.values(wikiDataMap.data) : wikiDataMap.data;
        }

        // Initialize empty variants list for each unit
        DB_UNITS.forEach(localUnit => {
            localUnit.allVariants = [{
                name: localUnit.name,
                rarity: localUnit.rarity || 'Common',
                placementCost: localUnit.placementCost || 0,
                placementLimit: localUnit.placementLimit || 5,
                element: localUnit.element || 'Neutral',
                status: localUnit.status || 'Stable',
                image: localUnit.image || '',
                officialAssetId: '',
                isBase: true
            }];
        });

        // Merge all matching units and cosmetics from wiki_data.json
        wikiUnitsArray.forEach(wikiItem => {
            if (!wikiItem.name) return;
            if (wikiItem.rarity === 'Cosmetic' || wikiItem.rarity === 'Item' || wikiItem.rarity === 'Skin') return;
            const bestUnit = getBestUnitMatch(wikiItem.name);
            if (bestUnit) {
                const placementPrice = wikiItem.placementPrice || (wikiItem.baseStats?.placementPrice || 0);
                const placementLimit = wikiItem.maxPlaced || 5;
                const rarity = wikiItem.rarity || 'Common';
                const el = wikiItem.element || 'Neutral';
                let assetId = '';
                if (wikiItem.image && typeof wikiItem.image === 'string') {
                    const match = wikiItem.image.match(/rbxassetid:\/\/(\d+)/i);
                    if (match) assetId = match[1];
                }

                let v = bestUnit.allVariants.find(x => {
                    const xL = x.name.toLowerCase();
                    const wikiL = wikiItem.name.toLowerCase();
                    return xL === wikiL || (UNIT_NAME_ALIASES[xL] === wikiL);
                });
                if (!v) {
                    const isBase = wikiItem.name.toLowerCase() === bestUnit.name.toLowerCase() || 
                        (UNIT_NAME_ALIASES[bestUnit.name.toLowerCase()] === wikiItem.name.toLowerCase());
                    v = {
                        name: wikiItem.name,
                        rarity: rarity,
                        placementCost: placementPrice,
                        placementLimit: placementLimit,
                        element: el,
                        status: 'Stable',
                        image: wikiItem.image || '',
                        officialAssetId: assetId,
                        isBase: isBase
                    };
                    bestUnit.allVariants.push(v);
                } else {
                    v.rarity = rarity;
                    v.placementCost = placementPrice;
                    v.placementLimit = placementLimit;
                    v.element = el;
                    if (wikiItem.image) v.image = wikiItem.image;
                    if (assetId) v.officialAssetId = assetId;
                }
            }
        });

        // Merge all matching units and cosmetics from all_units.json
        allUnitsArray.forEach(valItem => {
            if (!valItem.baseText) return;
            if (valItem.rarity === 'Cosmetic' || valItem.rarity === 'Item' || valItem.rarity === 'Skin') return;
            const bestUnit = getBestUnitMatch(valItem.baseText);
            if (bestUnit && valItem.variants && Array.isArray(valItem.variants)) {
                valItem.variants.forEach(variantData => {
                    const status = variantData.state || 'Stable';
                    const img = variantData.image ? "https://drive.google.com/thumbnail?id=" + variantData.image : '';
                    const variantName = variantData.name || valItem.baseText;

                    let v = bestUnit.allVariants.find(x => {
                        const xL = x.name.toLowerCase();
                        const varNameL = variantName.toLowerCase();
                        return xL === varNameL || (UNIT_NAME_ALIASES[xL] === varNameL);
                    });
                    if (!v) {
                        const isBase = variantName.toLowerCase() === bestUnit.name.toLowerCase() || 
                            (UNIT_NAME_ALIASES[bestUnit.name.toLowerCase()] === variantName.toLowerCase());
                        v = {
                            name: variantName,
                            rarity: 'Common',
                            placementCost: 0,
                            placementLimit: 5,
                            element: 'Neutral',
                            status: status,
                            image: img,
                            officialAssetId: '',
                            isBase: isBase
                        };
                        bestUnit.allVariants.push(v);
                    } else {
                        v.status = status;
                        if (img) v.image = img;
                    }
                });
            }
        });

        // Restore active selection from localStorage and apply
        const savedSelections = JSON.parse(localStorage.getItem('fntd2_selected_variants') || '{}');
        DB_UNITS.forEach(localUnit => {
            let activeVariant = localUnit.allVariants?.find(v => v.isBase) || localUnit.allVariants?.[0];
            const savedName = savedSelections[localUnit.id];
            if (savedName && localUnit.allVariants) {
                const found = localUnit.allVariants.find(v => v.name === savedName);
                if (found) {
                    activeVariant = found;
                }
            }

            if (activeVariant) {
                localUnit.activeVariantName = activeVariant.name;
                localUnit.placementCost = activeVariant.placementCost;
                localUnit.placementLimit = activeVariant.placementLimit;
                localUnit.rarity = activeVariant.rarity;
                localUnit.element = activeVariant.element;
                localUnit.synergy = activeVariant.element;
                localUnit.status = activeVariant.status;
                localUnit.officialAssetId = activeVariant.officialAssetId || '';
                if (activeVariant.image) {
                    localUnit.image = activeVariant.image;
                }
            }
        });

        if (typeof assignDynamicRankSubTiers === "function") {
            assignDynamicRankSubTiers();
        }

        console.log("Database synchronisation complete! Rerendering system visual modules.");
        renderTierlist();
        renderManualBuilderPool();
        renderTeamUnitSelector();
        renderTradeUnitSelector();
    } catch (e) {
        console.warn("Could not synchronize live data. Using shipped static local database.", e);
    }
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
    // If a manual overall rank is provided via creator or DB, we trust it primarily
    if (unit.manualOverallRank) {
        unit.overallRank = normalizeRankValue(unit.manualOverallRank);
        return;
    }

    const values = [
        normalizeRankValue(unit.endlessRank),
        normalizeRankValue(unit.obtainabilityRank),
        normalizeRankValue(unit.personalRank?.value)
    ]
        .map(rankLetterToScore)
        .filter(score => score !== null);

    if (values.length === 0) {
        unit.overallRank = unit.overallRank || 'N/A';
        return;
    }

    const average = values.reduce((sum, item) => sum + item, 0) / values.length;
    unit.overallRank = scoreToRankLetter(average);
}

function normalizeUnitData(unit) {
    if (!unit) return;
    
    // Automation: Standardize rarity names (e.g., Mythic -> Mythical)
    if (unit.rarity === "Mythic") unit.rarity = "Mythical";

    // Automation: Derived stats based on Rarity if missing or for consistency
    const rarityStats = {
        'Hero': { cost: 5000, limit: 1 },
        'Exclusive': { cost: 4000, limit: 1 },
        'Apex': { cost: 3000, limit: 1 },
        'Nightmare': { cost: 2500, limit: 1 },
        'Secret': { cost: 2000, limit: 1 },
        'Mythical': { cost: 1500, limit: 2 },
        'Epic': { cost: 800, limit: 3 },
        'Rare': { cost: 400, limit: 4 },
        'Uncommon': { cost: 250, limit: 5 }
    };

    if (unit.rarity && rarityStats[unit.rarity]) {
        unit.placementCost = unit.placementCost || rarityStats[unit.rarity].cost;
        unit.placementLimit = unit.placementLimit || rarityStats[unit.rarity].limit;
    }

    // Automation: Element / Synergy fallback
    unit.element = unit.element || unit.synergy || 'Neutral';
    unit.synergy = unit.element; // Sync them for UI consistency

    // Handle new structured placements: [Rank, Score, ...Descriptions]
    if (Array.isArray(unit.endless)) {
        unit.endlessRank = unit.endless[0];
        unit.endlessPlacement = unit.endless[1];
        unit.endlessDesc = unit.endless.slice(2).join(", ");
    }
    if (Array.isArray(unit.synergyPl)) {
        unit.synergyRank = unit.synergyPl[0];
        unit.synergyPlacement = unit.synergyPl[1];
        unit.synergyDesc = unit.synergyPl.slice(2).join(", ");
    }
    if (Array.isArray(unit.obtainability)) {
        unit.obtainabilityRank = unit.obtainability[0];
        unit.obtainabilityPlacement = unit.obtainability[1];
        unit.obtainabilityDesc = unit.obtainability.slice(2).join(", ");
    }

    // Auto-generate official page slug if missing
    if (unit.name && !unit.officialPageSlug) {
        unit.officialPageSlug = unit.name.trim().toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    unit.endlessRank = normalizeRankValue(unit.endlessRank || 'N/A');
    unit.endlessPlacement = unit.endlessPlacement || '0';
    unit.synergyRank = normalizeRankValue(unit.synergyRank || 'N/A');
    unit.synergyPlacement = unit.synergyPlacement || 'N/A';
    unit.obtainabilityRank = normalizeRankValue(unit.obtainabilityRank || 'N/A');
    unit.obtainabilityPlacement = unit.obtainabilityPlacement || 'N/A';

    const personalText = unit.personalRank?.value || unit.personalRank || 'N/A';
    const personalNote = unit.personalRank?.note || unit.personalRankNote || 'No personal note provided.';
    unit.personalRank = {
        value: normalizeRankValue(personalText),
        note: personalNote
    };

    computeOverallRank(unit);
}

function normalizeAllUnitData() {
    if (!Array.isArray(DB_UNITS)) return;

    // Run basic normalization and overall rank calculations
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
    "home": "page-home",
    "tierlist": "page-tierlist",
    "generator": "page-generator",
    "profile": "page-profile",
    "team": "page-generator",
    "trade": "page-generator",
    "units": "page-tierlist",
    "database": "page-tierlist",
    "tos": "page-tos",
    "privacy": "page-privacy"
};
const PAGE_ID_TO_PATH = {
    "page-home": "home",
    "page-tierlist": "tierlist",
    "page-generator": "generator",
    "page-profile": "profile",
    "page-tos": "tos",
    "page-privacy": "privacy"
};

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

    const segment = PAGE_ID_TO_PATH[pageId] || "home";
    const hash = `#${segment}`;
    if (replace) {
        history.replaceState({ pageId }, '', hash);
    } else {
        history.pushState({ pageId }, '', hash);
    }
}

function handleRoute() {
    const hashStr = window.location.hash.replace(/^#/, '');
    const pageId = PAGE_PATH_MAP[hashStr] || 'page-home';
    navigateToPage(pageId, true);
}

function openTeamUnitSelector(slotIndex) {
    activeTeamSlotIndex = slotIndex;
    const label = document.getElementById('team-selector-slot-label');
    if (label) label.textContent = slotIndex + 1;
    const selector = document.getElementById('team-unit-selector');
    if (selector) {
        selector.style.display = 'flex';
    }
    renderTeamUnitSelector();
}

function closeTeamUnitSelector() {
    activeTeamSlotIndex = null;
    const selector = document.getElementById('team-unit-selector');
    if (selector) {
        selector.style.display = 'none';
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

    const hideNonCanon = document.getElementById('setting-hide-non-canon')?.checked ?? false;
    const availableUnits = DB_UNITS.filter(unit => {
        if (hideNonCanon && unit.canon === false) return false;
        const alreadySelected = teamSlots.some(slot => slot?.id === unit.id);
        const matchesSearch = unit.name.toLowerCase().includes(searchTerm) || unit.id.toLowerCase().includes(searchTerm);
        const matchesClass = classFilter === 'All' || unit.class === classFilter;
        const subclasses = Array.isArray(unit.subclasses) ? unit.subclasses : [];
        const matchesSubclass = subclassFilter === 'All' || subclasses.includes(subclassFilter);
        return !alreadySelected && matchesSearch && matchesClass && matchesSubclass;
    });

    list.innerHTML = '';
    if (availableUnits.length === 0) {
        list.innerHTML = `<div style="color:var(--text-body-muted); padding:18px; font-size:13px;">No matching units found.</div>`;
        return;
    }

    availableUnits.forEach(unit => {
        const card = document.createElement('div');
        card.className = 'unit-card-square animate-pop rarity-' + (unit.rarity || '').replace(/\s+/g,'-');
        card.dataset.unitId = unit.id;
        const assetId = unit.officialAssetId;
        if (assetId) card.dataset.unitAsset = assetId;
        
        applyRarityCardStyle(card, unit);

        const decorationUrl = `/images/decorations/${unit.name.toLowerCase().replace(/\s+/g, '_')}.png`;
        card.innerHTML = `
            <div class="square-title-top">${unit.name}</div>
            <div class="square-cost-bottom">$${unit.placementCost}</div>
            <div class="square-element-icon">${unit.element.substring(0,1).toUpperCase()}</div>
            <div class="unit-decoration-layer" style="background-image: url('${decorationUrl}'), url('/images/decorations/${unit.name.toLowerCase().replace(/\s+/g, '-')}.png');"></div>
        `;
        card.addEventListener('click', () => setTeamSlotUnit(unit.id));
        list.appendChild(card);
    });
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
    renderGridContainer(currentTeam, 'generator-grid-container');
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
        selector.style.display = 'flex';
    }
    renderTradeUnitSelector();
}

function closeTradeUnitSelector() {
    tradeSelectorSide = null;
    const selector = document.getElementById('trade-unit-selector');
    if (selector) {
        selector.style.display = 'none';
    }
}

function renderTradeUnitSelector() {
    const list = document.getElementById('trade-selector-list');
    if (!list) return;
    const searchTerm = (document.getElementById('trade-selector-search')?.value.trim().toLowerCase() || '');
    const classFilter = document.getElementById('trade-selector-class-filter')?.value || 'All';
    const subclassFilter = document.getElementById('trade-selector-subclass-filter')?.value || 'All';

    const allSelectedIds = new Set([...tradeOfferUnits, ...tradeWantUnits].map(u => u.id));

    const hideNonCanon = document.getElementById('setting-hide-non-canon')?.checked ?? false;
    const availableUnits = DB_UNITS.filter(unit => {
        if (hideNonCanon && unit.canon === false) return false;
        const alreadySelected = allSelectedIds.has(unit.id);
        const matchesSearch = unit.name.toLowerCase().includes(searchTerm) || unit.id.toLowerCase().includes(searchTerm);
        const matchesClass = classFilter === 'All' || unit.class === classFilter;
        const subclasses = Array.isArray(unit.subclasses) ? unit.subclasses : [];
        const matchesSubclass = subclassFilter === 'All' || subclasses.includes(subclassFilter);
        return !alreadySelected && matchesSearch && matchesClass && matchesSubclass;
    });

    list.innerHTML = '';
    if (availableUnits.length === 0) {
        list.innerHTML = `<div style="color:var(--text-body-muted); padding:18px; font-size:13px;">No matching units found.</div>`;
        return;
    }

    availableUnits.forEach(unit => {
        const card = document.createElement('div');
        card.className = 'unit-card-square animate-pop rarity-' + (unit.rarity || '').replace(/\s+/g,'-');
        card.dataset.unitId = unit.id;
        const assetId = unit.officialAssetId;
        if (assetId) card.dataset.unitAsset = assetId;
        
        applyRarityCardStyle(card, unit);

        const decorationUrl = `/images/decorations/${unit.name.toLowerCase().replace(/\s+/g, '_')}.png`;
        card.innerHTML = `
            <div class="square-title-top">${unit.name}</div>
            <div class="square-cost-bottom">$${unit.placementCost}</div>
            <div class="square-element-icon">${unit.element.substring(0,1).toUpperCase()}</div>
            <div class="unit-decoration-layer" style="background-image: url('${decorationUrl}'), url('/images/decorations/${unit.name.toLowerCase().replace(/\s+/g, '-')}.png');"></div>
        `;
        card.addEventListener('click', () => selectTradeUnit(unit.id));
        list.appendChild(card);
    });
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
    renderTradeCreateSelections();
}

function migrateObtainmentsFormat() {
    DB_UNITS.forEach(unit => {
        if (typeof unit.obtainments === 'string') {
            unit.obtainments = [
                { source: "Legacy", chance: 100, method: unit.obtainments }
            ];
        }
        if (!unit.aliases) unit.aliases = [];
        if (!unit.fanmadeBuffs) unit.fanmadeBuffs = [];
        if (!unit.subUnits) unit.subUnits = [];
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
        const bucket = DB_UNITS.filter(u => u.rank === rankKey || u.endlessRank === rankKey);
        if (bucket.length === 0) return;
        bucket.sort((a, b) => (Number(a.rankedId) || 0) - (Number(b.rankedId) || 0));
        const total = bucket.length;
        const slice = Math.max(1, Math.floor(total * 0.33));

        bucket.forEach((unit, idx) => {
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
        if (CONFIG.BACKGROUND_ASSETS.CACTUS_LEFT) root.style.setProperty('--cactus-left-img', `url('${CONFIG.BACKGROUND_ASSETS.CACTUS_LEFT}')`);
        if (CONFIG.BACKGROUND_ASSETS.CACTUS_RIGHT) root.style.setProperty('--cactus-right-img', `url('${CONFIG.BACKGROUND_ASSETS.CACTUS_RIGHT}')`);
        if (CONFIG.BACKGROUND_ASSETS.HOUSE_1) root.style.setProperty('--house1-img', `url('${CONFIG.BACKGROUND_ASSETS.HOUSE_1}')`);
        if (CONFIG.BACKGROUND_ASSETS.HOUSE_2) root.style.setProperty('--house2-img', `url('${CONFIG.BACKGROUND_ASSETS.HOUSE_2}')`);
        if (CONFIG.BACKGROUND_ASSETS.JUMPING_CUBE) root.style.setProperty('--jumping-cube-img', `url('${CONFIG.BACKGROUND_ASSETS.JUMPING_CUBE}')`);
        
        if (CONFIG.BACKGROUND_ASSETS.JUMPING_SPEED) {
            root.style.setProperty('--jumping-speed', CONFIG.BACKGROUND_ASSETS.JUMPING_SPEED);
            root.style.setProperty('--tumbleweed-speed', CONFIG.BACKGROUND_ASSETS.JUMPING_SPEED);
        }
        if (CONFIG.BACKGROUND_ASSETS.JUMP_HEIGHT) root.style.setProperty('--jump-height', CONFIG.BACKGROUND_ASSETS.JUMP_HEIGHT);
        
        if (CONFIG.BACKGROUND_ASSETS.SKY_COLOR) root.style.setProperty('--sky-color', CONFIG.BACKGROUND_ASSETS.SKY_COLOR);
        if (CONFIG.BACKGROUND_ASSETS.SKY_GRADIENT_START) root.style.setProperty('--sky-gradient-start', CONFIG.BACKGROUND_ASSETS.SKY_GRADIENT_START);
        if (CONFIG.BACKGROUND_ASSETS.SKY_GRADIENT_END) root.style.setProperty('--sky-gradient-end', CONFIG.BACKGROUND_ASSETS.SKY_GRADIENT_END);
        
        if (CONFIG.BACKGROUND_ASSETS.SUN_COLOR) root.style.setProperty('--sun-color', CONFIG.BACKGROUND_ASSETS.SUN_COLOR);
        if (CONFIG.BACKGROUND_ASSETS.SUN_SIZE) root.style.setProperty('--sun-size', CONFIG.BACKGROUND_ASSETS.SUN_SIZE);
        if (CONFIG.BACKGROUND_ASSETS.SUN_POSITION_BOTTOM) root.style.setProperty('--sun-position-bottom', CONFIG.BACKGROUND_ASSETS.SUN_POSITION_BOTTOM);
        if (CONFIG.BACKGROUND_ASSETS.SUN_POSITION_LEFT) root.style.setProperty('--sun-position-left', CONFIG.BACKGROUND_ASSETS.SUN_POSITION_LEFT);
        if (CONFIG.BACKGROUND_ASSETS.SUN_BLUR_GLOW) root.style.setProperty('--sun-blur-glow', CONFIG.BACKGROUND_ASSETS.SUN_BLUR_GLOW);
        if (CONFIG.BACKGROUND_ASSETS.SUN_ANIMATION_SPEED) root.style.setProperty('--sun-animation-speed', CONFIG.BACKGROUND_ASSETS.SUN_ANIMATION_SPEED);
        
        if (CONFIG.BACKGROUND_ASSETS.GROUND_COLOR) root.style.setProperty('--ground-color', CONFIG.BACKGROUND_ASSETS.GROUND_COLOR);
        if (CONFIG.BACKGROUND_ASSETS.GROUND_HEIGHT) root.style.setProperty('--ground-height', CONFIG.BACKGROUND_ASSETS.GROUND_HEIGHT);
        if (CONFIG.BACKGROUND_ASSETS.GROUND_BORDER_COLOR) root.style.setProperty('--ground-border-color', CONFIG.BACKGROUND_ASSETS.GROUND_BORDER_COLOR);
        
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
    renderManualBuilderPool();
    renderTeamSlotGrid();
    switchTeamCreatorTab('generate');
    initSystemModalEvents();
    restoreVisualSettings();
    initBulletHoleFx();
    hydrateUnitsFromOfficialSources();
    handleRoute();
    
    // Update dashboard metrics
    const unitCountEl = document.getElementById('dashboard-unit-count');
    if (unitCountEl) unitCountEl.textContent = DB_UNITS.length;

    window.addEventListener('hashchange', handleRoute);
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
    navigateToPage(targetPageId);
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
    const oauthUrl = CONFIG.LINKS.ROBLOX_OAUTH_URL || 'https://api.fntddata.com/auth/roblox';
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
            <div class="trade-card-row"><strong>${CONFIG.getText('TRADING.OFFER_YOUR_OFFER')}</strong><span>${offerUnitsHtml}</span></div>
            <div class="trade-card-row"><strong>${CONFIG.getText('TRADING.OFFER_THEIR_OFFER')}</strong><span>${wantUnitsHtml}</span></div>
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

    const offerSouls = 0;
    const wantSouls = 0;

    const newOffer = {
        offerUnits: tradeOfferUnits.map(unit => ({ id: unit.id, name: unit.name })),
        wantUnits: tradeWantUnits.map(unit => ({ id: unit.id, name: unit.name })),
        offerSouls: 0,
        wantSouls: 0,
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

    const tradeClassFilter = document.getElementById('trade-selector-class-filter');
    if (tradeClassFilter) {
        ALL_CLASSES.forEach(c => {
            tradeClassFilter.innerHTML += `<option value="${c}">${c}</option>`;
        });
    }
    const tradeSubclassFilter = document.getElementById('trade-selector-subclass-filter');
    if (tradeSubclassFilter) {
        ALL_SUBCLASSES.forEach(s => {
            tradeSubclassFilter.innerHTML += `<option value="${s}">${s}</option>`;
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
    const subclassSet = new Set(source.flatMap(u => {
        const subList = Array.isArray(u.subclasses) ? u.subclasses : [];
        return subList;
    }));
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
    
    let description = CONFIG.FILTER_DESCRIPTIONS.RANK_TYPE[rankType] || `Showing units ranked by **${rankType}**.`;
    
    const lines = [
        description,
        `Sorting within rows: Higher Endless Score = Better placement.`,
        `Click any card to open the unit's master specification record.`
    ];
    
    if (classValue && classValue !== 'All') {
        const classDesc = CONFIG.FILTER_DESCRIPTIONS.CLASSES[classValue];
        if (classDesc) lines.push(`**${classValue}**: ${classDesc}`);
    }
    
    panel.innerHTML = lines.map(line => `<p style="margin-bottom:6px; opacity:0.9;">${line.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-heading)">$1</strong>')}</p>`).join('');
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

function applyRarityCardStyle(card, unit) {
    const rarityMeta = DB_RARITIES[unit.rarity];
    const imageUrl = getUnitImageUrl(unit);
    
    card.style.border = '';
    card.style.background = '';
    card.style.borderImage = '';
    card.style.boxShadow = '';
    
    // Determine the base background
    let bgLayer = '';
    if (imageUrl && !imageUrl.includes('qftJu7p.png')) {
        bgLayer = `linear-gradient(rgba(27, 13, 5, 0.45), rgba(27, 13, 5, 0.45)) padding-box, url('${imageUrl}') center/cover no-repeat padding-box`;
    } else {
        bgLayer = `linear-gradient(rgba(44, 44, 44, 0.8), rgba(22, 22, 22, 0.9)) padding-box`;
    }

    if (unit.canon === false) {
        card.style.border = '2px dashed #ffd700';
        card.style.boxShadow = '0 0 10px rgba(255, 215, 0, 0.45)';
        card.style.background = bgLayer;
    } else if (rarityMeta) {
        if (rarityMeta.color.includes('gradient')) {
            // Apply the gradient as both the border and a subtle underlying background layer
            card.style.border = '2px solid transparent';
            card.style.background = `${bgLayer}, ${rarityMeta.color} border-box`;
            card.style.boxShadow = `inset 0 0 20px rgba(255,255,255,0.05), 0 0 8px ${rarityMeta.color.split(',')[1].trim()}44`;
        } else {
            card.style.border = `2px solid ${rarityMeta.color}`;
            card.style.background = bgLayer;
            card.style.boxShadow = `0 0 5px ${rarityMeta.color}33`;
        }
    } else {
        card.style.border = '2px solid rgba(255,255,255,0.18)';
        card.style.background = bgLayer;
    }
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
        const assetId = unit.officialAssetId;
        if (assetId) card.dataset.unitAsset = assetId;
        
        applyRarityCardStyle(card, unit);

        const decorationUrl = `/images/decorations/${unit.name.toLowerCase().replace(/\s+/g, '_')}.png`;
        card.innerHTML = `
            <div class="square-title-top">${unit.name}</div>
            <div class="square-cost-bottom">$${unit.placementCost}</div>
            <div class="square-element-icon">${unit.element.substring(0,1).toUpperCase()}</div>
            <div class="unit-decoration-layer" style="background-image: url('${decorationUrl}'), url('/images/decorations/${unit.name.toLowerCase().replace(/\s+/g, '-')}.png');"></div>
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
    if (!unit) return;
    const url = getOfficialUnitUrl(unit);
    window.open(url, '_blank', 'noopener');
}

const tooltipNode = document.getElementById('hud-tooltip');

function triggerTooltipShow(unit, event) {
    if (window.matchMedia("(max-width: 720px)").matches) return; 
    
    const endlessRank = unit.endlessRank || 'N/A';
    const endlessScore = unit.endlessPlacement || '0';
    const synergyRank = unit.synergyRank || 'N/A';
    const synergyPlacement = unit.synergyPlacement || 'N/A';
    const obtainabilityRank = unit.obtainabilityRank || 'N/A';
    const obtainabilityPlacement = unit.obtainabilityPlacement || 'N/A';
    const personalRankValue = unit.personalRank?.value || 'N/A';
    const personalReasoning = unit.personalRank?.note || unit.personalRankNote || 'No reasoning provided.';
    const overallRank = unit.overallRank || 'N/A';
    const html = `
        <div class="tt-header" style="border-bottom: 2px solid var(--border-matrix); margin-bottom: 10px; padding-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-family:var(--silkscreen-font); font-size:16px; color:#fff;">${unit.name} ${unit.canon === false ? '<span style="color:#ffd700; font-size:9px; font-weight:bold; background:rgba(255,215,0,0.12); padding:1.5px 4.5px; border-radius:3px; border:1px solid rgba(255,215,0,0.25); text-wrap:nowrap; vertical-align:middle; margin-left:4px;">CONCEPT</span>' : ''}</span>
            <span style="font-size:10px; opacity:0.5; font-family:var(--font-mono);">${unit.id || ''}</span>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
            <div class="tt-stat-box" style="background:rgba(255,255,255,0.05); padding:6px; border-radius:4px;">
                <div style="font-size:10px; color:var(--text-body-muted); text-transform:uppercase;">Endless</div>
                <div style="font-size:14px;"><strong style="color:var(--color-accent-blue)">${endlessRank}</strong> <span style="font-size:10px; opacity:0.7;">Sc: ${endlessScore}</span></div>
                ${unit.endlessDesc ? `<div style="font-size:9px; opacity:0.6; line-height:1.2; margin-top:3px;">${unit.endlessDesc}</div>` : ''}
            </div>
            <div class="tt-stat-box" style="background:rgba(255,255,255,0.05); padding:6px; border-radius:4px;">
                <div style="font-size:10px; color:var(--text-body-muted); text-transform:uppercase;">Synergy</div>
                <div style="font-size:14px;"><strong style="color:#ff7eb6">${synergyRank}</strong> <span style="font-size:10px; opacity:0.7;">#${synergyPlacement}</span></div>
                ${unit.synergyDesc ? `<div style="font-size:9px; opacity:0.6; line-height:1.2; margin-top:3px;">${unit.synergyDesc}</div>` : ''}
            </div>
            <div class="tt-stat-box" style="background:rgba(255,255,255,0.05); padding:6px; border-radius:4px;">
                <div style="font-size:10px; color:var(--text-body-muted); text-transform:uppercase;">Obtain</div>
                <div style="font-size:14px;"><strong style="color:#8df6ff">${obtainabilityRank}</strong> <span style="font-size:10px; opacity:0.7;">#${obtainabilityPlacement}</span></div>
                ${unit.obtainabilityDesc ? `<div style="font-size:9px; opacity:0.6; line-height:1.2; margin-top:3px;">${unit.obtainabilityDesc}</div>` : ''}
            </div>
            <div class="tt-stat-box" style="background:rgba(255,255,255,0.05); padding:6px; border-radius:4px;">
                <div style="font-size:10px; color:var(--text-body-muted); text-transform:uppercase;">Personal</div>
                <div style="font-size:14px;"><strong style="color:#fff">${personalRankValue}</strong></div>
            </div>
        </div>
        
        <div style="background:rgba(0,0,0,0.2); padding:8px; border-radius:4px; margin-bottom:10px; border-left: 2px solid var(--color-accent-orange);">
            <div style="font-size:10px; color:var(--text-body-muted); margin-bottom:2px;">REASONING:</div>
            <div style="font-size:11px; line-height:1.4; opacity:0.9;">${personalReasoning}</div>
        </div>
        
        <div style="display:flex; justify-content:space-between; align-items:center; border-top: 1px solid var(--border-matrix); padding-top: 8px;">
            <span style="color:var(--text-body-muted); font-size:11px; font-weight:700;">OVERALL RANK:</span>
            <span style="color:#ffd68d; font-size:24px; font-weight:900; text-shadow: 0 0 10px rgba(255,214,141,0.3);">${overallRank}</span>
        </div>
    `;

    tooltipNode.innerHTML = html;
    tooltipNode.style.display = 'block';
    tooltipNode.classList.remove('hidden-node');
}

function triggerTooltipMove(e) {
    const tooltipWidth = tooltipNode.offsetWidth || 240;
    const tooltipHeight = tooltipNode.offsetHeight || 180;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = e.clientX + 16;
    let y = e.clientY + 16;

    if (x + tooltipWidth > viewportWidth) {
        x = e.clientX - tooltipWidth - 16;
    }
    if (y + tooltipHeight > viewportHeight) {
        y = e.clientY - tooltipHeight - 16;
    }

    x = Math.max(8, x);
    y = Math.max(8, y);

    tooltipNode.style.left = x + 'px';
    tooltipNode.style.top = y + 'px';
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
    if (!container) return;
    container.innerHTML = "";

    const elFilter = document.getElementById('tier-filter-element')?.value || 'All';
    const clFilter = document.getElementById('tier-filter-class')?.value || 'All';
    const subFilter = document.getElementById('tier-filter-subclass')?.value || 'All';
    const rankType = document.getElementById('tier-filter-ranktype')?.value || 'Overall';
    const rankValue = document.getElementById('tier-filter-rankvalue')?.value || 'All';
    const rarityFilter = document.getElementById('tier-filter-rarity')?.value || 'All';

    const getTargetRank = (u) => {
        if (rankType === 'Personal') return u.personalRank?.value || 'N/A';
        if (rankType === 'Endless') return u.endlessRank || 'N/A';
        if (rankType === 'Synergy') return u.synergyRank || 'N/A';
        if (rankType === 'Obtainability') return u.obtainabilityRank || 'N/A';
        return u.overallRank || 'N/A';
    };

    ALL_RANKS.forEach(tier => {
        if (rankValue !== "All" && tier !== rankValue) return;

        let matchingTierUnits = DB_UNITS.filter(u => {
            const hideNonCanon = document.getElementById('setting-hide-non-canon')?.checked ?? false;
            if (hideNonCanon && u.canon === false) return false;

            const activeRank = getTargetRank(u);
            const baseTier = normalizeRankValue(activeRank);
            if (baseTier !== tier) return false;
            
            if (elFilter !== "All" && u.element !== elFilter) return false;
            if (clFilter && clFilter !== "All" && u.class !== clFilter) return false;
            const subclasses = Array.isArray(u.subclasses) ? u.subclasses : [];
            if (subFilter && subFilter !== "All" && !subclasses.includes(subFilter)) return false;
            if (rarityFilter !== "All" && u.rarity !== rarityFilter) return false;
            
            return true;
        });

        // Sorting: Higher Endless Score = Better
        matchingTierUnits.sort((a, b) => (Number(b.endlessPlacement) || 0) - (Number(a.endlessPlacement) || 0));
        
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
        container.innerHTML = `<div style="color:var(--text-body-muted); padding:20px; font-size:14px;">No units match your selected rank type and value.</div>`;
    }
    updateTierlistExplanationText(clFilter, subFilter, rankType, rankValue);
}

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
    const elementFilter = document.getElementById('gen-element-filter')?.value || 'All';
    const rarityFilter = document.getElementById('gen-rarity-filter')?.value || 'All';
    const statusFilter = document.getElementById('gen-status-filter')?.value || 'All';

    let pool = DB_UNITS.filter(u => {
        const matchClass = checkedClasses.includes(u.class);
        const subclasses = Array.isArray(u.subclasses) ? u.subclasses : [];
        const matchSubclass = subclasses.some(s => checkedSubclasses.includes(s));
        const matchElement = elementFilter === 'All' || u.element === elementFilter;
        const matchRarity = rarityFilter === 'All' || u.rarity === rarityFilter;
        const matchStatus = statusFilter === 'All' || u.status === statusFilter;
        return matchClass && matchSubclass && matchElement && matchRarity && matchStatus;
    });

    if (pool.length === 0) {
        clearTeamSlots();
        renderGridContainer([], 'generator-grid-container');
        renderTeamSlotGrid();
        renderManualBuilderPool();
        updateTeamRatingPanel();
        return;
    }

    // Advanced Scoring for Generator
    const rankWeights = { 'S': 100, 'A': 80, 'B': 60, 'C': 40, 'D': 20, 'F': 10 };
    const scarcityWeights = { 
        'Hero': 2.0, 'Exclusive': 1.8, 'Apex': 1.6, 'Nightmare': 1.5, 
        'Secret': 1.4, 'Mythical': 1.3, 'Epic': 1.2, 'Rare': 1.1, 'Uncommon': 1.0 
    };

    const scoredPool = pool.map(u => {
        const rankScore = rankWeights[u.overallRank] || 10;
        const multiplier = scarcityWeights[u.rarity] || 1.0;
        return { unit: u, totalScore: rankScore * multiplier };
    }).sort((a, b) => b.totalScore - a.totalScore);

    let compiledSquad = [];
    const usedSubclasses = new Set();
    const targetSize = CONFIG.GAME_BALANCE.TEAM.MAX_SIZE;

    // Phase 1: High quality variety selection
    for (const entry of scoredPool) {
        if (compiledSquad.length >= targetSize) break;
        const u = entry.unit;
        
        // Strategy: Prioritize elite units but try to cover different subclasses
        const hasNewSubclass = u.subclasses.some(s => !usedSubclasses.has(s));
        if (hasNewSubclass || compiledSquad.length < 2) {
            compiledSquad.push(u);
            u.subclasses.forEach(s => usedSubclasses.add(s));
        }
    }

    // Phase 2: Fill remaining with top scorers
    for (const entry of scoredPool) {
        if (compiledSquad.length >= targetSize) break;
        if (!compiledSquad.find(x => x.id === entry.unit.id)) {
            compiledSquad.push(entry.unit);
        }
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
    const hideNonCanon = document.getElementById('setting-hide-non-canon')?.checked ?? false;

    const availableUnits = DB_UNITS.filter(unit => {
        if (hideNonCanon && unit.canon === false) return false;
        const isSelected = teamSlots.some(slot => slot?.id === unit.id);
        const matchesSearch = unit.name.toLowerCase().includes(searchTerm) || unit.id.toLowerCase().includes(searchTerm);
        const matchesClass = classFilter === 'All' || unit.class === classFilter;
        const subclasses = Array.isArray(unit.subclasses) ? unit.subclasses : [];
        const matchesSubclass = subclassFilter === 'All' || subclasses.includes(subclassFilter);
        return !isSelected && matchesSearch && matchesClass && matchesSubclass;
    });

    poolContainer.innerHTML = '';
    if (availableUnits.length === 0) {
        poolContainer.innerHTML = `<div style="color:var(--text-body-muted); padding:18px; font-size:13px;">No matching units can be added to your team.</div>`;
        return;
    }

    availableUnits.forEach(unit => {
        const card = document.createElement('div');
        card.className = 'unit-card-square animate-pop rarity-' + (unit.rarity || '').replace(/\s+/g,'-');
        const assetId = unit.officialAssetId;
        if (assetId) card.dataset.unitAsset = assetId;
        
        applyRarityCardStyle(card, unit);

        const decorationUrl = `/images/decorations/${unit.name.toLowerCase().replace(/\s+/g, '_')}.png`;
        card.innerHTML = `
            <div class="square-title-top">${unit.name}</div>
            <div class="square-cost-bottom">$${unit.placementCost}</div>
            <div class="square-element-icon">${unit.element.substring(0,1).toUpperCase()}</div>
            <div class="unit-decoration-layer" style="background-image: url('${decorationUrl}'), url('/images/decorations/${unit.name.toLowerCase().replace(/\s+/g, '-')}.png');"></div>
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
        const assetId = unit.officialAssetId;
        if (assetId) card.dataset.unitAsset = assetId;
        
        applyRarityCardStyle(card, unit);

        const decorationUrl = `/images/decorations/${unit.name.toLowerCase().replace(/\s+/g, '_')}.png`;
        card.innerHTML = `
            <div class="square-title-top">${unit.name}</div>
            <div class="square-cost-bottom">$${unit.placementCost}</div>
            <div class="square-element-icon">${unit.element.substring(0,1).toUpperCase()}</div>
            <div class="unit-decoration-layer" style="background-image: url('${decorationUrl}'), url('/images/decorations/${unit.name.toLowerCase().replace(/\s+/g, '-')}.png');"></div>
        `;

        const removeBtn = document.createElement('button');
        removeBtn.className = 'team-remove-btn';
        removeBtn.textContent = 'Remove';
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
    if (totalCost <= (1800 * normalizedTeam.length)) score += 1;

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
    if (totalCost > (1800 * team.length)) {
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
function openSettingsModal() { overlayNode.style.display = 'flex'; }
function closeSettingsModal() { overlayNode.style.display = 'none'; }

function applyVisualSettings() {
    const ambient = document.getElementById('setting-ambient-anim')?.checked ?? true;
    const cardGlow = document.getElementById('setting-card-glow')?.checked ?? true;
    const dust = document.getElementById('setting-dust')?.checked ?? true;
    const bulletHoles = document.getElementById('setting-bulletholes')?.checked ?? true;
    const hideNonCanon = document.getElementById('setting-hide-non-canon')?.checked ?? false;

    document.body.classList.toggle('effects-reduced', !ambient);
    document.body.classList.toggle('no-card-glow', !cardGlow);
    document.body.classList.toggle('no-dust', !dust);
    document.body.classList.toggle('no-bulletholes', !bulletHoles);

    localStorage.setItem('fntd2_visual_settings', JSON.stringify({ ambient, cardGlow, dust, bulletHoles, hideNonCanon }));

    // Rerender all active list managers to apply the canon database filters immediately
    if (typeof renderTierlist === "function") renderTierlist();
    if (typeof renderManualBuilderPool === "function") renderManualBuilderPool();
    if (typeof renderTeamUnitSelector === "function") renderTeamUnitSelector();
    if (typeof renderTradeUnitSelector === "function") renderTradeUnitSelector();
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
        if (typeof stored.hideNonCanon === 'boolean' && document.getElementById('setting-hide-non-canon')) {
            document.getElementById('setting-hide-non-canon').checked = stored.hideNonCanon;
        }
    } catch (error) {
        console.warn('Failed to restore visual settings', error);
    }
    applyVisualSettings();
}

const unitCreatorOverlay = document.getElementById('unit-creator-overlay');
function openUnitCreator() { 
    unitCreatorOverlay.style.display = 'flex'; 
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
        placementCost: parseInt(document.getElementById('creator-cost').value, 10) || 0,
        placementLimit: parseInt(document.getElementById('creator-limit').value, 10) || 5,
        obtainments: document.getElementById('creator-obtainment').value,
        endlessRank: document.getElementById('creator-endless-rank').value,
        endlessPlacement: document.getElementById('creator-endless-placement').value || '0',
        obtainabilityRank: document.getElementById('creator-obtain-rank').value,
        obtainabilityPlacement: document.getElementById('creator-obtain-placement').value || '0',
        manualOverallRank: document.getElementById('creator-overall-rank').value,
        personalRank: {
            value: document.getElementById('creator-personal-rank').value,
            note: document.getElementById('creator-reasoning').value || 'No personal reasoning provided.'
        },
        personalRankNote: document.getElementById('creator-reasoning').value || 'No personal reasoning provided.',
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
        normalizeAllUnitData();
        renderTierlist();
    });
    document.getElementById('unit-creator-form').reset();
    closeUnitCreator();
    normalizeAllUnitData();
    renderTierlist();
    renderManualBuilderPool();
    alert(`Unit "${newUnit.name}" created successfully.`);
}

function initSystemModalEvents() {
    overlayNode.addEventListener('click', (e) => {
        if(e.target === overlayNode) closeSettingsModal();
    });
    document.addEventListener('keydown', (e) => {
        if(e.key === 'Escape' && overlayNode.style.display !== 'none') {
            closeSettingsModal();
        }
    });
    document.addEventListener('keydown', (e) => {
        if(e.key === 'Escape' && unitCreatorOverlay.style.display !== 'none') {
            closeUnitCreator();
        }
    });
    
    toggleInterfaceTheme('dark'); 
}

function toggleInterfaceTheme(targetMode) {
    document.documentElement.setAttribute('data-theme', targetMode);
    document.querySelectorAll('.theme-switch-segmented-control button').forEach(btn => btn.classList.remove('active'));
    const activeButton = document.getElementById(`theme-${targetMode}-btn`);
    if (activeButton) activeButton.add ? activeButton.add('active') : activeButton.classList.add('active');
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

let audioCtx = null;
function playTacticalClick() {
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        const now = audioCtx.currentTime;

        const sampleRate = audioCtx.sampleRate;
        const bufferSize = sampleRate * 0.12;
        const buffer = audioCtx.createBuffer(1, bufferSize, sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noiseSource = audioCtx.createBufferSource();
        noiseSource.buffer = buffer;

        const noiseFilter = audioCtx.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.setValueAtTime(3200, now);
        noiseFilter.frequency.exponentialRampToValueAtTime(1500, now + 0.08);
        noiseFilter.Q.setValueAtTime(2.0, now);

        const noiseGain = audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0.18, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        noiseSource.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(audioCtx.destination);

        const lowOsc = audioCtx.createOscillator();
        const lowGain = audioCtx.createGain();
        lowOsc.type = 'triangle';
        lowOsc.frequency.setValueAtTime(180, now);
        lowOsc.frequency.exponentialRampToValueAtTime(45, now + 0.06);

        lowGain.gain.setValueAtTime(0.22, now);
        lowGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        lowOsc.connect(lowGain);
        lowGain.connect(audioCtx.destination);

        const clickOsc = audioCtx.createOscillator();
        const clickGain = audioCtx.createGain();
        clickOsc.type = 'sine';
        clickOsc.frequency.setValueAtTime(850, now);
        clickOsc.frequency.linearRampToValueAtTime(2200, now + 0.02);

        clickGain.gain.setValueAtTime(0.08, now);
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

        clickOsc.connect(clickGain);
        clickGain.connect(audioCtx.destination);

        noiseSource.start(now);
        lowOsc.start(now);
        clickOsc.start(now);

        noiseSource.stop(now + 0.12);
        lowOsc.stop(now + 0.12);
        clickOsc.stop(now + 0.12);
    } catch (err) {
        // Silently capture any blocked browser audio audio autoplay constraints
    }
}

function initBulletHoleFx() {
    const layer = document.getElementById('bullet-hole-layer');
    if (!layer) return;
    document.addEventListener('click', (event) => {
        // Harmoniously play tactical USP-S click sound on any user action
        playTacticalClick();

        if (document.body.classList.contains('no-bulletholes')) return;
        
        // Prevent background bullet holes when clicking inputs, buttons, select dropdowns or selectors
        if (event.target.closest('button, input, select, textarea, a, .nav-btn, .unit-card-square, #settings-overlay')) {
            return;
        }

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
