// Anti-Gambling Shield - Background Service Worker v1.1

// Verified working blocklist URL (StevenBlack's consolidated gambling list)
const BLOCKLIST_URL = 'https://raw.githubusercontent.com/StevenBlack/hosts/master/alternates/gambling/hosts';
// Fallback: nicehash list
const BLOCKLIST_FALLBACK = 'https://raw.githubusercontent.com/nicehash/blocklists/master/gambling.txt';
const UPDATE_INTERVAL_HOURS = 168; // weekly
const MAX_RULES = 4800; // safe buffer under Chrome's 5000 dynamic rule limit

// Built-in list — BUILTIN_DOMAINS are always applied first (highest priority)
// Includes explicit www. variants for the most commonly visited sites
const BUILTIN_DOMAINS = [
  // Major US Sportsbooks + www variants
  'fanduel.com', 'www.fanduel.com', 'sports.fanduel.com', 'account.fanduel.com',
  'draftkings.com', 'www.draftkings.com', 'sportsbook.draftkings.com',
  'betmgm.com', 'www.betmgm.com',
  'caesarssportsbook.com', 'www.caesarssportsbook.com',
  'pointsbet.com', 'www.pointsbet.com',
  'barstoolsportsbook.com', 'www.barstoolsportsbook.com',
  'foxbet.com', 'www.foxbet.com',
  'wynnbet.com', 'www.wynnbet.com',
  'betrivers.com', 'www.betrivers.com',
  'unibet.com', 'www.unibet.com',
  'bovada.lv', 'www.bovada.lv',
  'betonline.ag', 'www.betonline.ag', 'betonline1.ag', 'betonline2.ag',
  'betonline3.ag', 'betonline4.ag', 'betonline5.ag', 'betonline6.ag',
  'mybookie.ag', 'www.mybookie.ag',
  'xbet.ag', 'www.xbet.ag',
  'sportsbetting.ag', 'www.sportsbetting.ag',
  'heritage.ag', 'jazzbet.com', 'betanysports.eu', 'intertops.eu',
  'betterthisway.com',
  // DFS Platforms + www variants
  'prizepicks.com', 'www.prizepicks.com', 'app.prizepicks.com',
  'underdogfantasy.com', 'www.underdogfantasy.com', 'underdog.com',
  'sleeper.app', 'www.sleeper.app',
  'betr.app', 'betrapp.com',
  'parlayplay.io', 'thrillzz.com', 'boomfantasy.com',
  'superdraft.com', 'victiv.com', 'fantasy6.com',
  'playerr.com', 'chalkline.com', 'premierbet.com',
  // International Books
  'bet365.com', 'www.bet365.com',
  'betway.com', 'www.betway.com',
  'betfair.com', 'www.betfair.com',
  'williamhill.com', 'www.williamhill.com',
  'ladbrokes.com', 'www.ladbrokes.com',
  'coral.co.uk', 'www.coral.co.uk',
  'paddypower.com', 'www.paddypower.com',
  'skybet.com', 'www.skybet.com',
  'betvictor.com', 'marathonbet.com', 'betsson.com',
  'bwin.com', 'www.bwin.com',
  'unibet.co.uk', '888sport.com', 'sportingbet.com',
  'pinnacle.com', 'www.pinnacle.com',
  'sbobet.com', 'maxbet.com', '1xbet.com', 'melbet.com',
  // Online Casinos
  'pokerstars.com', 'www.pokerstars.com',
  '888casino.com', 'www.888casino.com',
  'casumo.com', 'leovegas.com', 'mrgreen.com',
  'jackpotcity.com', 'spinpalace.com', 'royalpanda.com',
  'casinoeuro.com', 'betsafe.com', 'rizk.com', 'guts.com',
  'videoslots.com', 'casinocruise.com', 'netbet.co.uk',
  'bethard.com', 'redbet.com', 'highroller.com', 'playzee.com',
  // Crypto Betting
  'stake.com', 'www.stake.com',
  'roobet.com', 'www.roobet.com',
  'cloudbet.com', 'sportsbet.io', 'fortunejack.com',
  'bitcasino.io', 'betchain.com', 'fairspin.io',
  'trustdice.win', 'bc.game', 'bitstarz.com', 'mbit.casino',
  '1xbit.com', 'betflip.io', 'crypto.games', 'winz.io',
  // Newer/niche sites likely to miss community lists
  'fliff.com', 'www.fliff.com',
  'novig.com', 'www.novig.com',
  'rebet.com', 'www.rebet.com',
  'kalshi.com', 'www.kalshi.com',
  'prophet.gg', 'sporttrade.com',
  // Horse Racing
  'twinspires.com', 'tvg.com', 'nyrabets.com', 'xpressbet.com',
  'equibase.com', 'betamerica.com', 'brisnet.com',
  'racinguk.com', 'attheraces.com', 'tote.co.uk',
  // Poker
  'pokerstars.net', 'partypoker.com', 'ggpoker.com',
  '888poker.com', 'wsop.com', 'bravo.poker',
  'ignitioncasino.eu', 'americascardroom.eu', 'blackchippoker.eu',
  // Lottery
  'jackpot.com', 'thelotter.com', 'lottoland.com',
  'pchlotto.com', 'wintrillions.com', 'lottokings.com',
  'lottery.com', 'lottofy.com', 'lottomania.com', 'lottosend.com',
  // Bingo & Slots
  'tombola.co.uk', 'sunbingo.co.uk', 'cosmicslots.com',
  'dazzlecasino.com', 'barbadosbingo.com', 'pocketwin.co.uk',
  'slingo.com', 'mrmega.com', 'foxy-bingo.co.uk', 'wink-bingo.com',
  // Additional
  'smarkets.com', 'matchbook.com', 'spreadex.com', 'stanjames.com',
  'totalbet.com', 'nordicbet.com', 'expekt.com', 'sportpesa.com',
  'betking.com', 'nairabet.com', 'merrybet.com', 'bangbet.com',
  'premierbet.net', 'parimatch.com', 'fonbet.com', 'leon.bet',
  'olimpbet.com', 'vulkanbet.com', 'casino.com', 'partycasino.com',
  'grosvenorcasinos.com', 'aspers.co.uk', 'springbokbet.com',
  'hollywoodbets.net', 'supabets.co.za', 'goldenpalace.com',
  'casinoroom.com', 'slotsmillion.com', 'slotsheaven.com',
  'casinoheroes.com', 'wildblaster.com', 'wildtornado.com', 'thunderpick.com'
];

// ── Default settings ──────────────────────────────────────────────────────────

const DEFAULT_SETTINGS = {
  enabled: true,
  mode: 'strict',
  customBlocklist: [],
  allowlist: [],
  blockedCount: 0,
  lastUpdated: null,
  domainCount: 0,
  fetchError: null,       // last fetch error message, null = ok
  rulesCapped: false,     // true if domain list exceeded MAX_RULES
  streakStart: null,      // ISO date string YYYY-MM-DD when current streak began
  lastActiveDate: null    // ISO date string — last day extension was enabled
};

// ── Date helpers ─────────────────────────────────────────────────────────────

function dateStr(d = new Date()) {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

function daysBetween(a, b) {
  // a, b are YYYY-MM-DD strings
  return Math.round((new Date(b) - new Date(a)) / 86400000);
}

// ── Streak logic ──────────────────────────────────────────────────────────────
// Streak = consecutive calendar days the extension has been ENABLED.
// Checked at midnight and on every popup open.
// Rules:
//   - First install: streak starts today.
//   - Each midnight: if yesterday === lastActiveDate, streak continues.
//   - If a day is skipped (extension disabled or not opened), streak resets.
//   - Disabling the extension does NOT instantly reset — it resets on the
//     NEXT day check, giving the user a chance to re-enable same day.

async function getStreakDays(settings) {
  if (!settings.streakStart) return 0;
  const today = dateStr();
  const lastActive = settings.lastActiveDate;

  // If last active was more than 1 day ago, streak is broken
  if (lastActive && daysBetween(lastActive, today) > 1) return 0;

  return daysBetween(settings.streakStart, today) + 1;
}

async function updateStreak(settings) {
  const today = dateStr();

  if (!settings.enabled) {
    // Don't update lastActiveDate when disabled — streak will break at midnight
    return settings;
  }

  if (!settings.streakStart || !settings.lastActiveDate) {
    // First time, or recovering from a reset
    settings.streakStart = today;
    settings.lastActiveDate = today;
    return settings;
  }

  const gap = daysBetween(settings.lastActiveDate, today);

  if (gap === 0) {
    // Same day, nothing to do
    return settings;
  } else if (gap === 1) {
    // Consecutive day — extend streak
    settings.lastActiveDate = today;
  } else {
    // Gap > 1 day — streak broken, restart
    settings.streakStart = today;
    settings.lastActiveDate = today;
  }

  return settings;
}

// ── Badge helpers ─────────────────────────────────────────────────────────────

function todayKey() {
  return 'badge_' + dateStr();
}

async function getBadgeCount() {
  const key = todayKey();
  const stored = await chrome.storage.local.get(key);
  return stored[key] || 0;
}

async function incrementBadgeCount() {
  const key = todayKey();
  const stored = await chrome.storage.local.get(key);
  const newCount = (stored[key] || 0) + 1;
  await chrome.storage.local.set({ [key]: newCount });
  return newCount;
}

async function updateBadge(count) {
  const settings = await getSettings();
  const text = count > 0 ? (count > 999 ? '999+' : String(count)) : '';
  await chrome.action.setBadgeText({ text });
  await chrome.action.setBadgeBackgroundColor({
    color: settings.enabled ? '#ff3c3c' : '#555555'
  });
  await chrome.action.setBadgeTextColor({ color: '#ffffff' });
}

async function refreshBadge() {
  const count = await getBadgeCount();
  await updateBadge(count);
}

async function pruneStaleBadgeKeys() {
  const all = await chrome.storage.local.get(null);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const keysToRemove = Object.keys(all).filter(k => {
    if (!k.startsWith('badge_')) return false;
    return new Date(k.replace('badge_', '')) < cutoff;
  });
  if (keysToRemove.length > 0) {
    await chrome.storage.local.remove(keysToRemove);
  }
}

// ── Strict mode block detection ───────────────────────────────────────────────

chrome.webNavigation.onErrorOccurred.addListener(async (details) => {
  if (details.frameId !== 0) return;
  if (details.error !== 'net::ERR_BLOCKED_BY_CLIENT') return;

  const settings = await getSettings();
  if (!settings.enabled || settings.mode !== 'strict') return;

  try {
    const url = new URL(details.url);
    const hostname = url.hostname.replace(/^www\./, '');
    const stored = await chrome.storage.local.get('blockDomains');
    const domains = stored.blockDomains || BUILTIN_DOMAINS;
    const isOurs = domains.some(d => {
      const clean = d.replace(/^www\./, '');
      return hostname === clean || hostname.endsWith('.' + clean);
    });
    if (!isOurs) return;
  } catch (e) {
    return;
  }

  settings.blockedCount = (settings.blockedCount || 0) + 1;
  await chrome.storage.local.set({ settings });

  const todayCount = await incrementBadgeCount();
  await updateBadge(todayCount);
});

// ── Midnight alarm ────────────────────────────────────────────────────────────

function setupMidnightAlarm() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setDate(midnight.getDate() + 1);
  midnight.setHours(0, 0, 5, 0);
  const msUntilMidnight = midnight - now;
  chrome.alarms.create('midnightReset', {
    delayInMinutes: msUntilMidnight / 60000,
    periodInMinutes: 24 * 60
  });
}

// ── Init ─────────────────────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(async (details) => {
  const existing = await chrome.storage.local.get('settings');
  if (!existing.settings) {
    const s = { ...DEFAULT_SETTINGS };
    s.streakStart = dateStr();
    s.lastActiveDate = dateStr();
    await chrome.storage.local.set({ settings: s });
  } else {
    // Migrate: add streak fields if upgrading from older version
    const s = existing.settings;
    if (!s.streakStart) {
      s.streakStart = dateStr();
      s.lastActiveDate = dateStr();
      await chrome.storage.local.set({ settings: s });
    }
  }

  await initializeBlocklist();
  setupAlarm();
  setupMidnightAlarm();
  await refreshBadge();

  // Open onboarding page on fresh install only (not on extension update)
  if (details.reason === 'install') {
    chrome.tabs.create({ url: chrome.runtime.getURL('onboarding.html') });
  }
});

chrome.runtime.onStartup.addListener(async () => {
  // Re-register alarms — they don't always survive browser restarts
  await ensureAlarmsRegistered();
  // Update streak on browser startup
  let settings = await getSettings();
  settings = await updateStreak(settings);
  await chrome.storage.local.set({ settings });
  await refreshBadge();
});

// Ensure both alarms exist — safe to call multiple times
async function ensureAlarmsRegistered() {
  const alarms = await chrome.alarms.getAll();
  const names = new Set(alarms.map(a => a.name));
  if (!names.has('updateBlocklist')) setupAlarm();
  if (!names.has('midnightReset')) setupMidnightAlarm();
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'updateBlocklist') {
    await fetchAndUpdateBlocklist();
  }
  if (alarm.name === 'midnightReset') {
    let settings = await getSettings();
    settings = await updateStreak(settings);
    await chrome.storage.local.set({ settings });
    await updateBadge(0);
    await pruneStaleBadgeKeys();
  }
});

function setupAlarm() {
  chrome.alarms.create('updateBlocklist', {
    delayInMinutes: UPDATE_INTERVAL_HOURS * 60,
    periodInMinutes: UPDATE_INTERVAL_HOURS * 60
  });
}

// ── Blocklist fetch ───────────────────────────────────────────────────────────

async function initializeBlocklist() {
  const stored = await chrome.storage.local.get('dynamicDomains');
  if (!stored.dynamicDomains || stored.dynamicDomains.length === 0) {
    await fetchAndUpdateBlocklist();
  } else {
    await applyBlockingRules();
  }
}

async function fetchAndUpdateBlocklist() {
  let domains = [...new Set(BUILTIN_DOMAINS)];
  let fetchError = null;
  let fetchSource = null;

  // Keep service worker alive during network fetch
  // (MV3 workers can be killed after ~30s of inactivity)
  const keepAlive = setInterval(() => chrome.runtime.getPlatformInfo(() => {}), 20000);

  try {
  // Try primary URL
  try {
    const response = await fetch(BLOCKLIST_URL, { signal: AbortSignal.timeout(25000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();

    // Validate: must contain at least 100 domain-like lines
    const parsed = parseHostsFile(text);
    if (parsed.length < 100) {
      throw new Error(`Blocklist too short (${parsed.length} entries) — may be malformed`);
    }

    domains = [...new Set([...domains, ...parsed])];
    fetchSource = 'primary';
  } catch (err) {
    fetchError = `Primary fetch failed: ${err.message}`;
    console.warn('[AntiGambling]', fetchError);

    // Try fallback URL
    try {
      const response2 = await fetch(BLOCKLIST_FALLBACK, { signal: AbortSignal.timeout(15000) });
      if (!response2.ok) throw new Error(`HTTP ${response2.status}`);
      const text2 = await response2.text();

      const parsed2 = parseBlocklist(text2);
      if (parsed2.length < 50) {
        throw new Error(`Fallback too short (${parsed2.length} entries)`);
      }

      domains = [...new Set([...domains, ...parsed2])];
      fetchError = `Used fallback (primary failed: ${err.message})`;
      fetchSource = 'fallback';
    } catch (err2) {
      fetchError = `Both sources failed. Using built-in list (${BUILTIN_DOMAINS.length} domains). Error: ${err2.message}`;
      console.error('[AntiGambling]', fetchError);
    }
  }

  const now = Date.now();
  const settings = await getSettings();
  settings.domainCount = domains.length;
  settings.lastUpdated = now;
  settings.fetchError = fetchError;
  settings.rulesCapped = domains.length > MAX_RULES;

  await chrome.storage.local.set({ dynamicDomains: domains, settings });
  await applyBlockingRules();

  return { count: domains.length, fetchError, fetchSource };
  } finally {
    clearInterval(keepAlive);
  }
}

function parseHostsFile(text) {
  const domains = [];
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const parts = trimmed.split(/\s+/);
    if (parts.length >= 2 && (parts[0] === '0.0.0.0' || parts[0] === '127.0.0.1')) {
      const domain = parts[1].toLowerCase();
      if (isValidDomain(domain) && domain !== 'localhost') {
        domains.push(domain);
      }
    }
  }
  return domains;
}

function parseBlocklist(text) {
  const domains = [];
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) continue;
    const domain = trimmed.replace(/^[*.]/, '').toLowerCase();
    if (isValidDomain(domain)) domains.push(domain);
  }
  return domains;
}

function isValidDomain(domain) {
  return /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,}$/.test(domain);
}

async function getSettings() {
  const stored = await chrome.storage.local.get('settings');
  return stored.settings || { ...DEFAULT_SETTINGS };
}

// ── Blocking rules ────────────────────────────────────────────────────────────

async function applyBlockingRules() {
  const settings = await getSettings();
  const stored = await chrome.storage.local.get('dynamicDomains');

  // Write mode+enabled to session storage so content scripts can fast-exit
  // without a message round-trip (session storage is faster than local)
  try {
    await chrome.storage.session.set({
      agMode: settings.mode,
      agEnabled: settings.enabled
    });
  } catch (e) { /* session storage not available in all Chrome versions */ }

  if (!settings.enabled) {
    const existing = await chrome.declarativeNetRequest.getDynamicRules();
    const removeIds = existing.map(r => r.id);
    if (removeIds.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: removeIds });
    }
    return;
  }

  const allDomains = new Set([
    ...BUILTIN_DOMAINS,
    ...(stored.dynamicDomains || []),
    ...(settings.customBlocklist || [])
  ]);

  for (const domain of (settings.allowlist || [])) {
    allDomains.delete(domain);
    allDomains.delete('www.' + domain);
  }

  const domains = [...allDomains];

  if (settings.mode === 'soft') {
    const existing = await chrome.declarativeNetRequest.getDynamicRules();
    const removeIds = existing.map(r => r.id);
    if (removeIds.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: removeIds });
    }
    await chrome.storage.local.set({ blockDomains: domains });
    return;
  }

  // Strict mode — BUILTIN_DOMAINS get priority slots, then dynamic fill the rest
  const prioritySet = new Set(BUILTIN_DOMAINS);
  const priority = domains.filter(d => prioritySet.has(d));
  const rest = domains.filter(d => !prioritySet.has(d));
  const ruleDomains = [...priority, ...rest].slice(0, MAX_RULES);

  // Update rulesCapped flag
  if (domains.length > MAX_RULES && !settings.rulesCapped) {
    settings.rulesCapped = true;
    await chrome.storage.local.set({ settings });
  }

  const rules = ruleDomains.map((domain, index) => ({
    id: index + 1,
    priority: 1,
    action: { type: 'block' },
    condition: {
      urlFilter: `||${domain}^`,
      resourceTypes: ['main_frame', 'sub_frame']
    }
  }));

  try {
    const existing = await chrome.declarativeNetRequest.getDynamicRules();
    const removeIds = existing.map(r => r.id);
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: removeIds,
      addRules: rules
    });
    await chrome.storage.local.set({ blockDomains: domains });
  } catch (error) {
    console.error('[AntiGambling] Error applying rules:', error);
  }
}

// ── Message handler ───────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  if (message.action === 'getSettings') {
    (async () => {
      let settings = await getSettings();
      // Update streak whenever popup opens
      settings = await updateStreak(settings);
      await chrome.storage.local.set({ settings });

      const stored = await chrome.storage.local.get('dynamicDomains');
      const streak = await getStreakDays(settings);
      sendResponse({
        settings,
        domainCount: stored.dynamicDomains?.length || BUILTIN_DOMAINS.length,
        streak
      });
    })();
    return true;
  }

  if (message.action === 'updateSettings') {
    (async () => {
      let settings = message.settings;
      // If re-enabling, update streak immediately
      if (settings.enabled) {
        settings = await updateStreak(settings);
      }
      await chrome.storage.local.set({ settings });
      await applyBlockingRules();
      await refreshBadge();
      sendResponse({ success: true });
    })();
    return true;
  }

  if (message.action === 'updateBlocklist') {
    fetchAndUpdateBlocklist().then(async result => {
      const s = await getSettings();
      sendResponse({
        success: true,
        count: result.count,
        lastUpdated: s.lastUpdated,
        fetchError: result.fetchError
      });
    });
    return true;
  }

  if (message.action === 'siteBlocked') {
    (async () => {
      const settings = await getSettings();
      settings.blockedCount = (settings.blockedCount || 0) + 1;
      await chrome.storage.local.set({ settings });
      const todayCount = await incrementBadgeCount();
      await updateBadge(todayCount);
    })();
    return true;
  }

  if (message.action === 'checkDomain') {
    (async () => {
      const stored = await chrome.storage.local.get(['blockDomains', 'settings']);
      const settings = stored.settings || { ...DEFAULT_SETTINGS };
      const domains = stored.blockDomains || BUILTIN_DOMAINS;
      const hostname = message.hostname;

      if (!settings.enabled) { sendResponse({ blocked: false }); return; }

      if (settings.allowlist?.some(d => {
        const clean = d.replace(/^www\./, '');
        return hostname === clean || hostname === 'www.' + clean || hostname.endsWith('.' + clean);
      })) {
        sendResponse({ blocked: false });
        return;
      }

      const isBlocked = domains.some(d => {
        const clean = d.replace(/^www\./, '');
        return hostname === clean || hostname === 'www.' + clean || hostname.endsWith('.' + clean);
      });
      sendResponse({ blocked: isBlocked, mode: settings.mode });
    })();
    return true;
  }

  if (message.action === 'resetStreak') {
    (async () => {
      const settings = await getSettings();
      settings.streakStart = dateStr();
      settings.lastActiveDate = dateStr();
      await chrome.storage.local.set({ settings });
      sendResponse({ success: true });
    })();
    return true;
  }
});
