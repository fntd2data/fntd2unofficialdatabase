let currentFiltersState = {
    search: "", sort: "high-low", rarities: [], ranks: [], classes: [], subclasses: [], synergy: "All"
};
let currentTeam = [];
let detailsActiveUnit = null;
let simulatedLevel = 1;
let simulatedEnchant = "None";
let isShinyModeActive = false;
 
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
    });
}


 
function saveCustomUnitsToStorage() {
    localStorage.setItem('fntd2_custom_units', JSON.stringify(DB_UNITS));
}

function loadCustomUnitsFromStorage() {
    const customUnits = JSON.parse(localStorage.getItem('fntd2_custom_units') || '[]');
    customUnits.forEach(unit => {
        const existingIndex = DB_UNITS.findIndex(u => u.id === unit.id);
        if (existingIndex >= 0) {
            DB_UNITS[existingIndex] = unit;
        } else {
            DB_UNITS.push(unit);
        }
    });
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
    loadCustomUnitsFromStorage();
    regenerateComputedRanks();
    applyConfigBindings();
    initViewRoutingNavs();
    buildFilterCheckboxLayouts();
    applyFinderFilters();
    renderTierlist();
    renderEnemyCodex();
    renderManualBuilderPool();
    initSystemModalEvents();
    initWelcomeModal();
});

 
function initViewRoutingNavs() {
    document.querySelectorAll('.sidebar .nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.sidebar .nav-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            
            btn.classList.add('active');
            const target = btn.getAttribute('data-target');
            document.getElementById(target).classList.add('active');
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

 
function buildFilterCheckboxLayouts() {
    const rBox = document.getElementById('finder-rarities-box');
    Object.keys(DB_RARITIES).forEach(r => {
        rBox.innerHTML += `<label><input type="checkbox" value="${r}" class="rarity-cb" checked onchange="syncFilterState()"> ${r}</label>`;
    });

    const rkBox = document.getElementById('finder-ranks-box');
    ALL_RANKS.forEach(rk => {
        ['High', 'Mid', 'Low'].forEach(prefix => {
            const labelStr = `${prefix} ${rk}`;
            rkBox.innerHTML += `<label><input type="checkbox" value="${labelStr}" class="rank-cb" checked onchange="syncFilterState()"> ${labelStr}</label>`;
        });
    });

    const cBox = document.getElementById('finder-classes-box');
    ALL_CLASSES.forEach(c => {
        cBox.innerHTML += `<label><input type="checkbox" value="${c}" class="class-cb" checked onchange="syncFilterState()"> ${c}</label>`;
    });

    const sBox = document.getElementById('finder-subclasses-box');
    ALL_SUBCLASSES.forEach(s => {
        sBox.innerHTML += `<label><input type="checkbox" value="${s}" class="subclass-cb" checked onchange="syncFilterState()"> ${s}</label>`;
    });

    const synDropdown = document.getElementById('finder-synergy-dropdown');
    ALL_SYNERGIES.forEach(syn => {
        synDropdown.innerHTML += `<option value="${syn}">${syn}</option>`;
    });

    const genClsBox = document.getElementById('gen-classes-box');
    ALL_CLASSES.forEach(c => {
        genClsBox.innerHTML += `<label><input type="checkbox" value="${c}" class="gen-class-cb" checked> ${c}</label>`;
    });
    const genSubBox = document.getElementById('gen-subclasses-box');
    ALL_SUBCLASSES.forEach(s => {
        genSubBox.innerHTML += `<label><input type="checkbox" value="${s}" class="gen-subclass-cb" checked> ${s}</label>`;
    });

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

    const tEl = document.getElementById('tier-filter-element');
    Object.keys(DB_ELEMENTS).forEach(e => tEl.innerHTML += `<option value="${e}">${e}</option>`);
    const tCl = document.getElementById('tier-filter-class');
    ALL_CLASSES.forEach(c => tCl.innerHTML += `<option value="${c}">${c}</option>`);
    const tSb = document.getElementById('tier-filter-subclass');
    ALL_SUBCLASSES.forEach(s => tSb.innerHTML += `<option value="${s}">${s}</option>`);

    syncFilterState();
}

function syncFilterState() {
    currentFiltersState.rarities = Array.from(document.querySelectorAll('.rarity-cb:checked')).map(cb => cb.value);
    currentFiltersState.ranks = Array.from(document.querySelectorAll('.rank-cb:checked')).map(cb => cb.value);
    currentFiltersState.classes = Array.from(document.querySelectorAll('.class-cb:checked')).map(cb => cb.value);
    currentFiltersState.subclasses = Array.from(document.querySelectorAll('.subclass-cb:checked')).map(cb => cb.value);
    currentFiltersState.sort = document.getElementById('sort-rarity').value;
    currentFiltersState.synergy = document.getElementById('finder-synergy-dropdown').value;
    currentFiltersState.search = document.getElementById('search-id').value.trim().toLowerCase();
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
    document.getElementById('search-id').value = "";
    document.getElementById('finder-synergy-dropdown').value = "All";
    document.getElementById('sort-rarity').value = "high-low";
    applyFinderFilters();
}

function renderGridContainer(units, containerId) {
    const grid = document.getElementById(containerId);
    grid.innerHTML = "";

    if(units.length === 0) {
        grid.innerHTML = `<div style="color:var(--text-body-muted); padding:20px; font-size:14px;">${CONFIG.getText('FINDER.NO_RESULTS')}</div>`;
        return;
    }

    units.forEach(unit => {
        const card = document.createElement('div');
        card.className = 'unit-card-square animate-pop';
        
        const rarityMeta = DB_RARITIES[unit.rarity];
        if (rarityMeta && rarityMeta.color.includes('gradient')) {
            card.style.borderImage = `${rarityMeta.color} 1`;
            card.style.borderColor = 'transparent';
        } else if(rarityMeta) {
            card.style.borderColor = rarityMeta.color;
            card.style.borderImage = 'none';
        }

        if (unit.image) card.style.backgroundImage = `url('${unit.image}')`;

        card.innerHTML = `
            <div class="square-title-top">${unit.name}</div>
            <div class="square-cost-bottom">$${unit.placementCost}</div>
            <div class="square-element-icon">${unit.element.substring(0,1).toUpperCase()}</div>
        `;

        card.addEventListener('mouseenter', (e) => triggerTooltipShow(unit, e));
        card.addEventListener('mousemove', triggerTooltipMove);
        card.addEventListener('mouseleave', triggerTooltipHide);
        card.addEventListener('click', () => visualizeSpecificUnitSubpage(unit));

        grid.appendChild(card);
    });
}

 
const tooltipNode = document.getElementById('hud-tooltip');

function triggerTooltipShow(unit, event) {
    const displayRankOnHover = document.getElementById('toggle-hover-rank').checked;
    let waveStyleClass = "wave-score-mid";
    if (unit.rankedWave < CONFIG.GAME_BALANCE.WAVE_THRESHOLDS.LOW_THRESHOLD) waveStyleClass = "wave-score-low";
    else if (unit.rankedWave > CONFIG.GAME_BALANCE.WAVE_THRESHOLDS.HIGH_THRESHOLD) waveStyleClass = "wave-score-high";

    let html = `
        <div class="tt-line tt-title"><span>${unit.name}</span><span>${unit.id}</span></div>
        <div class="tt-line"><span style="color:var(--text-body-muted)">DPS (Max):</span><span style="color:var(--color-accent-blue); font-weight:700;">${Math.round(unit.damage[1] / unit.cooldown[1])}/s</span></div>
        <div class="tt-line"><span style="color:var(--text-body-muted)">Damage:</span><span>${unit.damage[0]} - ${unit.damage[1]}</span></div>
        <div class="tt-line"><span style="color:var(--text-body-muted)">Range:</span><span>${unit.range[0]} - ${unit.range[1]}</span></div>
        <div class="tt-line"><span style="color:var(--text-body-muted)">Cooldown:</span><span>${unit.cooldown[0]}s - ${unit.cooldown[1]}s</span></div>
    `;

    if (displayRankOnHover) {
        html += `
            <div style="height:1px; background:var(--border-matrix); margin:6px 0;"></div>
            <div class="tt-line"><span style="color:var(--text-body-muted)">Tier Rank:</span><span style="color:#fbbf24; font-weight:bold;">${unit.computedRank || (unit.rank ? `Mid ${unit.rank}` : 'Unranked')}</span></div>
            <div class="tt-line"><span style="color:var(--text-body-muted)">Ranked ID:</span><span>#${unit.rankedId || 'N/A'}</span></div>
            <div class="tt-line"><span style="color:var(--text-body-muted)">Endless Wave:</span><span class="${waveStyleClass}">${unit.rankedWave ?? 'N/A'}</span></div>
        `;
    }

    tooltipNode.innerHTML = html;
    tooltipNode.classList.remove('hidden-node');
}

function triggerTooltipMove(e) {
    tooltipNode.style.left = (e.clientX + 16) + 'px';
    tooltipNode.style.top = (e.clientY + 16) + 'px';
}

function triggerTooltipHide() { tooltipNode.classList.add('hidden-node'); }

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

    const elFilter = document.getElementById('tier-filter-element').value;
    const clFilter = document.getElementById('tier-filter-class').value;
    const subFilter = document.getElementById('tier-filter-subclass').value;

    ALL_RANKS.forEach(tier => {
        let matchingTierUnits = DB_UNITS.filter(u => {
            if (u.rank !== tier) return false;
            if (elFilter !== "All" && u.element !== elFilter) return false;
            if (clFilter !== "All" && u.class !== clFilter) return false;
            if (subFilter !== "All" && !u.subclasses.includes(subFilter)) return false;
            return true;
        });

        matchingTierUnits.sort((a, b) => a.rankedId - b.rankedId);
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

    const passivesBlock = unit.passives.map(p => `
            <div style="background: var(--bg-input-field); padding: 12px; border-radius: var(--global-radius); border: 1px solid var(--border-matrix); margin-bottom: 8px;">
            <div style="font-weight:700; color:var(--text-heading); font-size:13.5px; margin-bottom:2px;">${p.name}</div>
            <div style="font-size:13px; color:var(--text-body-main); line-height:1.4;">${p.desc}</div>
        </div>
    `).join('') || `<div style="color:var(--text-body-muted); font-size:13px;">${CONFIG.getText('DETAILS.NO_PASSIVES')}</div>`;

    const abilitiesBlock = unit.abilities.map(a => `
        <div style="background:var(--bg-input-field); padding:12px; border-radius:var(--global-radius); border:1px solid var(--border-matrix); margin-bottom:8px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                <strong style="color:var(--text-heading); font-size:13.5px;">${a.name}</strong>
                <span style="color:#ef4444; font-size:12px; font-weight:700;">CD: ${a.cooldown}s</span>
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

    target.innerHTML = `
        <div class="profile-layout-grid animate-pop">
            <div>
                <div class="profile-summary-box">
                    <div class="profile-avatar-frame" style="${frameBorderStyle} background-image: url('${unit.image}')"></div>
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
                    <button data-detail-tab="stats" class="active" onclick="switchDetailTab('stats')" style="padding: 10px 16px; background: transparent; border: none; color: var(--text-heading); cursor: pointer; font-weight: 600; border-bottom: 3px solid transparent; margin-bottom: -2px; transition: all var(--anim-speed-factor);" onmouseover="this.style.color = 'var(--color-accent-blue)';" onmouseout="this.style.color = 'var(--text-heading)';">${CONFIG.getText('DETAILS.STATS_TAB')}</button>
                    <button data-detail-tab="passives" onclick="switchDetailTab('passives')" style="padding: 10px 16px; background: transparent; border: none; color: var(--text-body-main); cursor: pointer; font-weight: 600; border-bottom: 3px solid transparent; margin-bottom: -2px; transition: all var(--anim-speed-factor);" onmouseover="this.style.color = 'var(--color-accent-blue)';" onmouseout="this.style.color = 'var(--text-body-main)';">${CONFIG.getText('DETAILS.PASSIVES_TAB')}</button>
                    <button data-detail-tab="ranked" onclick="switchDetailTab('ranked')" style="padding: 10px 16px; background: transparent; border: none; color: var(--text-body-main); cursor: pointer; font-weight: 600; border-bottom: 3px solid transparent; margin-bottom: -2px; transition: all var(--anim-speed-factor);" onmouseover="this.style.color = 'var(--color-accent-blue)';" onmouseout="this.style.color = 'var(--text-body-main)';">${CONFIG.getText('DETAILS.RANKED_TAB')}</button>
                    <button data-detail-tab="obtainments" onclick="switchDetailTab('obtainments')" style="padding: 10px 16px; background: transparent; border: none; color: var(--text-body-main); cursor: pointer; font-weight: 600; border-bottom: 3px solid transparent; margin-bottom: -2px; transition: all var(--anim-speed-factor);" onmouseover="this.style.color = 'var(--color-accent-blue)';" onmouseout="this.style.color = 'var(--text-body-main)';">${CONFIG.getText('DETAILS.OBTAINMENT_TAB')}</button>
                    <button data-detail-tab="aliases" onclick="switchDetailTab('aliases')" style="padding: 10px 16px; background: transparent; border: none; color: var(--text-body-main); cursor: pointer; font-weight: 600; border-bottom: 3px solid transparent; margin-bottom: -2px; transition: all var(--anim-speed-factor);" onmouseover="this.style.color = 'var(--color-accent-blue)';" onmouseout="this.style.color = 'var(--text-body-main)';">${CONFIG.getText('DETAILS.ALIAS_TAB')}</button>
                </div>

                <!-- Tab Contents -->
                <div data-detail-content="stats" style="display: block;">${statsTabContent}</div>
                <div data-detail-content="passives" style="display: none;">${passivesAbilitiesTabContent}</div>
                <div data-detail-content="ranked" style="display: none;">${rankedTabContent}</div>
                <div data-detail-content="obtainments" style="display: none;">${obtainmentTabContent}</div>
                <div data-detail-content="aliases" style="display: none;">${aliasesTabContent}</div>
            </div>
        </div>
    `;

    const wavePill = document.getElementById('detail-wave-score-pill');
    if(unit.rankedWave < CONFIG.GAME_BALANCE.WAVE_THRESHOLDS.LOW_THRESHOLD) wavePill.className = "wave-score-low";
    else if(unit.rankedWave > CONFIG.GAME_BALANCE.WAVE_THRESHOLDS.HIGH_THRESHOLD) wavePill.className = "wave-score-high";
    else wavePill.className = "wave-score-mid";

    triggerLiveCalculationsRun();

    document.querySelectorAll('[data-detail-tab]').forEach(btn => {
        btn.style.borderBottomColor = 'transparent';
        btn.style.color = 'var(--text-body-main)';
        if (btn.getAttribute('data-detail-tab') === 'stats') {
            btn.style.borderBottomColor = 'var(--color-accent-blue)';
            btn.style.color = 'var(--text-heading)';
        }
    });
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

    let finalMinDmg = Math.round(unit.damage[0] * levelStatScaler * enchantMod.DMG_MOD);
    let finalMaxDmg = Math.round(unit.damage[1] * levelStatScaler * enchantMod.DMG_MOD);
    let finalRange = parseFloat((unit.range[0] * levelRangeScaler * enchantMod.RANGE_MOD).toFixed(1));
    let finalCd = parseFloat((unit.cooldown[0] * levelCooldownContractor * enchantMod.CD_MOD).toFixed(2));
    if(finalCd < 0.1) finalCd = 0.1; 

    let computedDps = Math.round(finalMaxDmg / finalCd);

    document.getElementById('calc-min-dmg').innerText = finalMinDmg;
    document.getElementById('calc-max-dmg').innerText = finalMaxDmg;
    document.getElementById('calc-range').innerText = finalRange;
    document.getElementById('calc-cooldown').innerText = finalCd + "s";
    document.getElementById('calc-dps').innerText = computedDps + "/s";
}

function returnToCatalog() { switchView('page-finder'); }

 
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

    let subsetPool = DB_UNITS.filter(u => checkedClasses.includes(u.class) && u.subclasses.some(s => checkedSubclasses.includes(s)));
    if (subsetPool.length === 0) {
        currentTeam = [];
        renderGridContainer([], 'generator-grid-container');
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

    currentTeam = compiledSquad;
    renderGridContainer(currentTeam, 'generator-grid-container');
    renderManualBuilderPool();
    updateTeamRatingPanel();
}

function addTeamMember(unitId) {
    if (currentTeam.length >= CONFIG.GAME_BALANCE.TEAM.MAX_SIZE) return;
    const existing = currentTeam.some(item => item.id === unitId);
    if (existing) return;
    const unit = DB_UNITS.find(u => u.id === unitId);
    if (!unit) return;
    currentTeam.push(unit);
    renderManualBuilderPool();
    updateTeamRatingPanel();
}

function removeTeamMember(unitId) {
    currentTeam = currentTeam.filter(u => u.id !== unitId);
    renderManualBuilderPool();
    updateTeamRatingPanel();
}

function clearCurrentTeam() {
    currentTeam = [];
    renderManualBuilderPool();
    updateTeamRatingPanel();
}

function renderManualBuilderPool() {
    const poolContainer = document.getElementById('team-builder-pool');
    if (!poolContainer) return;

    const searchTerm = (document.getElementById('team-builder-search')?.value.trim().toLowerCase() || '');
    const classFilter = document.getElementById('team-builder-class-filter')?.value || 'All';
    const subclassFilter = document.getElementById('team-builder-subclass-filter')?.value || 'All';

    const availableUnits = DB_UNITS.filter(unit => {
        const isSelected = currentTeam.some(member => member.id === unit.id);
        const matchSearch = unit.name.toLowerCase().includes(searchTerm) || unit.id.toLowerCase().includes(searchTerm);
        const matchClass = classFilter === 'All' || unit.class === classFilter;
        const matchSubclass = subclassFilter === 'All' || unit.subclasses.includes(subclassFilter);
        return !isSelected && matchSearch && matchClass && matchSubclass;
    });

    poolContainer.innerHTML = '';
    if (availableUnits.length === 0) {
        poolContainer.innerHTML = `<div style="color:var(--text-body-muted); padding:18px; font-size:13px;">${CONFIG.getText('GENERATOR.RATING_EMPTY')}</div>`;
        return;
    }

    availableUnits.forEach(unit => {
        const card = document.createElement('div');
        card.className = 'unit-card-square animate-pop';
        const rarityMeta = DB_RARITIES[unit.rarity];
        if (unit.image) card.style.backgroundImage = `url('${unit.image}')`;
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

    if (!currentTeam || currentTeam.length === 0) {
        overviewNode.innerHTML = `<p>${CONFIG.getText('GENERATOR.RATING_EMPTY')}</p>`;
        detailsNode.innerHTML = '';
        issuesNode.innerHTML = '';
        teamGrid.innerHTML = '';
        return;
    }

    teamGrid.innerHTML = '';
    currentTeam.forEach(unit => {
        const card = document.createElement('div');
        card.className = 'unit-card-square animate-pop';
        const rarityMeta = DB_RARITIES[unit.rarity];
        if (unit.image) card.style.backgroundImage = `url('${unit.image}')`;
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

    const summary = getTeamRating(currentTeam);
    overviewNode.innerHTML = `
        <div class="rating-heading">${summary.label}</div>
        <div class="rating-score">${summary.score}/5</div>
    `;
    detailsNode.innerHTML = `
        <div class="rating-detail-row"><span>Team Size:</span><span>${currentTeam.length}/6</span></div>
        <div class="rating-detail-row"><span>Class Coverage:</span><span>${summary.coverageText}</span></div>
        <div class="rating-detail-row"><span>Synergy Variety:</span><span>${summary.synergyText}</span></div>
        <div class="rating-detail-row"><span>Budget Estimate:</span><span>$${summary.totalCost}</span></div>
    `;
    issuesNode.innerHTML = summary.issues.map(item => `<li>${item}</li>`).join('');
}

function getTeamRating(team) {
    const classes = [...new Set(team.map(u => u.class))];
    const synergies = {};
    let totalCost = 0;

    team.forEach(u => {
        totalCost += parseInt(u.placementCost, 10) || 0;
        synergies[u.synergy] = (synergies[u.synergy] || 0) + 1;
    });

    const missingClasses = ['Early Game', 'Mid Game', 'End Game'].filter(c => !classes.includes(c));
    const synergyCount = Object.keys(synergies).length;

    let score = 0;
    if (team.length >= 5) score += 2;
    else if (team.length >= 4) score += 1;
    if (missingClasses.length === 0) score += 1;
    if (synergyCount >= 3) score += 1;
    if (totalCost <= (18 * team.length)) score += 1;

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

 
const unitCreatorOverlay = document.getElementById('unit-creator-overlay');
function openUnitCreator() { 
    unitCreatorOverlay.style.display = 'flex'; 
    unitCreatorOverlay.style.alignItems = 'center';
    unitCreatorOverlay.style.justifyContent = 'center';
}
function closeUnitCreator() { unitCreatorOverlay.style.display = 'none'; }

function submitUnitCreation(e) {
    e.preventDefault();
    const newUnit = {
        id: document.getElementById('creator-id').value,
        name: document.getElementById('creator-name').value,
        rarity: document.getElementById('creator-rarity').value,
        class: document.getElementById('creator-class').value,
        placementCost: parseInt(document.getElementById('creator-cost').value),
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
        rankedId: 'custom'
    };
    
    DB_UNITS.push(newUnit);
    saveCustomUnitToStorage(newUnit);
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
            DB_UNITS[idx] = newUnit;
        }
    } else {
        
        DB_UNITS.push(newUnit);
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
        DB_UNITS = DB_UNITS.filter(u => u.id !== unitId);
        saveCustomUnitsToStorage();
        loadAdminUnitsList();
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