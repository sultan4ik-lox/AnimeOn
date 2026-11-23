// ==UserScript==
// @name           AnimeOn+
// @namespace      https://v3.animeon.co/
// @version        0.1.7
// @description    Quality-of-Life улучшения и дополнительные функции для AnimeOn
// @author         gogo
// @license        GPL-3.0-only
// @match          https://v3.animeon.co/*
// @icon           https://v3.animeon.co/favicon.ico
// @grant          GM_setValue
// @grant          GM_getValue
// @run-at         document-start
// @updateURL    https://raw.githubusercontent.com/sultan4ik-lox/AnimeOn/main/AnimeOn%2B.user.js
// @downloadURL  https://raw.githubusercontent.com/sultan4ik-lox/AnimeOn/main/AnimeOn%2B.user.js
// ==/UserScript==

(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // src/core/router.ts
  var Router = class {
    constructor() {
      __publicField(this, "listeners", /* @__PURE__ */ new Set());
      __publicField(this, "lastUrl", location.href);
      __publicField(this, "isPlusTabRequested", false);
      this.init();
    }
    init() {
      const initialUrl = new URL(location.href);
      if (initialUrl.pathname === "/settings" && initialUrl.searchParams.get("tab") === "plus") {
        this.isPlusTabRequested = true;
      }
      const originalPushState = history.pushState.bind(history);
      const originalReplaceState = history.replaceState.bind(history);
      history.pushState = (data, unused, url) => {
        let targetUrl = url ? new URL(url.toString(), location.origin) : new URL(location.href);
        if (targetUrl.pathname === "/settings") {
          const tab = targetUrl.searchParams.get("tab");
          if (tab && tab !== "plus") {
            this.isPlusTabRequested = false;
          }
        }
        originalPushState(data, unused, url);
        this.handleUrlChange();
      };
      history.replaceState = (data, unused, url) => {
        let targetUrl = url ? new URL(url.toString(), location.origin) : new URL(location.href);
        if (this.isPlusTabRequested && targetUrl.pathname === "/settings" && targetUrl.searchParams.get("tab") === "profile") {
          targetUrl.searchParams.set("tab", "plus");
          originalReplaceState(data, unused, targetUrl.toString());
          this.handleUrlChange();
          return;
        }
        originalReplaceState(data, unused, url);
        this.handleUrlChange();
      };
      window.addEventListener("popstate", () => {
        const currentUrl = new URL(location.href);
        if (currentUrl.pathname === "/settings") {
          this.isPlusTabRequested = currentUrl.searchParams.get("tab") === "plus";
        }
        this.handleUrlChange();
      });
    }
    handleUrlChange() {
      if (location.href !== this.lastUrl) {
        this.lastUrl = location.href;
        const current = new URL(location.href);
        for (const callback of this.listeners) {
          callback(current);
        }
      }
    }
    onRouteChange(callback) {
      this.listeners.add(callback);
      callback(new URL(location.href));
      return () => this.listeners.delete(callback);
    }
    navigateToPlusTab() {
      this.isPlusTabRequested = true;
      const url = new URL(location.href);
      url.pathname = "/settings";
      url.searchParams.set("tab", "plus");
      history.pushState(null, "", url.toString());
    }
    exitPlusTab(targetTab = "profile") {
      this.isPlusTabRequested = false;
      const url = new URL(location.href);
      url.pathname = "/settings";
      url.searchParams.set("tab", targetTab);
      history.pushState(null, "", url.toString());
    }
  };
  var router = new Router();

  // src/modules/settings/tab-button.ts
  var DESKTOP_INACTIVE_CLASS = "focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300 group relative flex h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-left text-sm font-medium transition-colors duration-150 text-zinc-300 hover:bg-white/[0.05] hover:text-white";
  var DESKTOP_ACTIVE_CLASS = "focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300 group relative flex h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-left text-sm font-medium transition-colors duration-150 text-white";
  var MOBILE_INACTIVE_CLASS = "flex h-10 shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-full px-4 text-sm font-medium transition-[background-color,color] duration-150 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300 bg-white/[0.05] text-zinc-300 hover:bg-white/[0.09] hover:text-white";
  var MOBILE_ACTIVE_CLASS = "flex h-10 shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-full px-4 text-sm font-medium transition-[background-color,color] duration-150 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300 bg-primary text-white";
  function createDesktopButton(onClick) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = "animeon-plus-tab-desktop";
    btn.title = "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0440\u0430\u0441\u0448\u0438\u0440\u0435\u043D\u0438\u044F AnimeOn+";
    btn.className = DESKTOP_INACTIVE_CLASS;
    btn.innerHTML = `
    <span class="animeon-plus-active-bg bg-primary/[0.16] text-white absolute inset-0 rounded-xl" style="display: none;"></span>
    <svg class="animeon-plus-icon lucide relative h-[18px] w-[18px] shrink-0 text-zinc-400 transition-colors duration-150 group-hover:text-white group-focus-visible:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
    <span class="animeon-plus-label relative min-w-0 flex-1 truncate">AnimeonPlus</span>
  `;
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      onClick();
    });
    return btn;
  }
  function createMobileButton(onClick) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = "animeon-plus-tab-mobile";
    btn.className = MOBILE_INACTIVE_CLASS;
    btn.innerHTML = `
    <svg class="lucide h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
    <span>AnimeonPlus</span>
  `;
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      onClick();
    });
    return btn;
  }
  function updateButtonState(isPlusActive2) {
    const desktopBtn = document.getElementById("animeon-plus-tab-desktop");
    if (desktopBtn) {
      const bgSpan = desktopBtn.querySelector(".animeon-plus-active-bg");
      const icon = desktopBtn.querySelector(".animeon-plus-icon");
      const label = desktopBtn.querySelector(".animeon-plus-label");
      if (isPlusActive2) {
        desktopBtn.className = DESKTOP_ACTIVE_CLASS;
        desktopBtn.setAttribute("aria-current", "page");
        if (bgSpan) bgSpan.style.display = "block";
        if (icon) {
          icon.classList.remove("text-zinc-400");
          icon.classList.add("text-primary");
        }
        if (label) label.classList.add("font-semibold");
      } else {
        desktopBtn.className = DESKTOP_INACTIVE_CLASS;
        desktopBtn.removeAttribute("aria-current");
        if (bgSpan) bgSpan.style.display = "none";
        if (icon) {
          icon.classList.remove("text-primary");
          icon.classList.add("text-zinc-400");
        }
        if (label) label.classList.remove("font-semibold");
      }
    }
    const mobileBtn = document.getElementById("animeon-plus-tab-mobile");
    if (mobileBtn) {
      if (isPlusActive2) {
        mobileBtn.className = MOBILE_ACTIVE_CLASS;
        mobileBtn.setAttribute("aria-current", "page");
      } else {
        mobileBtn.className = MOBILE_INACTIVE_CLASS;
        mobileBtn.removeAttribute("aria-current");
      }
    }
    if (isPlusActive2) {
      const desktopNav = document.querySelector('nav[aria-label="\u0420\u0430\u0437\u0434\u0435\u043B\u044B \u043D\u0430\u0441\u0442\u0440\u043E\u0435\u043A"].md\\:flex, div.flex.items-start > nav');
      if (desktopNav) {
        const activeNativeBtns = desktopNav.querySelectorAll('button[aria-current="page"]:not(#animeon-plus-tab-desktop)');
        activeNativeBtns.forEach((btn) => {
          btn.removeAttribute("aria-current");
          btn.classList.remove("text-white");
          btn.classList.add("text-zinc-300");
          const activeSpan = btn.querySelector('span[class*="bg-primary"]');
          if (activeSpan && activeSpan instanceof HTMLElement) {
            activeSpan.style.display = "none";
          }
        });
      }
      const mobileNav = document.querySelector('div.md\\:hidden nav[aria-label="\u0420\u0430\u0437\u0434\u0435\u043B\u044B \u043D\u0430\u0441\u0442\u0440\u043E\u0435\u043A"]');
      if (mobileNav) {
        const activeMobileBtns = mobileNav.querySelectorAll('button[aria-current="page"]:not(#animeon-plus-tab-mobile)');
        activeMobileBtns.forEach((btn) => {
          btn.removeAttribute("aria-current");
          btn.classList.remove("bg-primary", "text-white");
          btn.classList.add("bg-white/[0.05]", "text-zinc-300");
        });
      }
    }
  }

  // src/core/storage.ts
  var storage = {
    get(key, defaultValue) {
      try {
        if (typeof GM_getValue !== "undefined") {
          return GM_getValue(`animeon_plus_${key}`, defaultValue);
        }
        const raw = localStorage.getItem(`animeon_plus_${key}`);
        return raw ? JSON.parse(raw) : defaultValue;
      } catch {
        return defaultValue;
      }
    },
    set(key, value) {
      try {
        if (typeof GM_setValue !== "undefined") {
          GM_setValue(`animeon_plus_${key}`, value);
          return;
        }
        localStorage.setItem(`animeon_plus_${key}`, JSON.stringify(value));
      } catch (e) {
        console.error("[AnimeOn+] Failed to save setting:", e);
      }
    }
  };

  // src/modules/hide-premium/index.ts
  var STORAGE_KEY = "hide_premium_enabled";
  var STYLE_ID = "animeon-plus-hide-premium";
  var PREMIUM_HIDE_CSS = `
/* Top header Premium button */
a[href="/premium"].group\\/pr,
header a[href="/premium"],
div.h-16 a[href="/premium"],

/* Account dropdown menu & mobile drawer */
a[href="/premium"].group\\/pp,
[role="menu"] a[href="/gifts"],
[data-slot="sheet-content"] a[href="/premium"],

/* Promo banners on Homepage and Anime page (above player) */
section:has(.pm-sheet),
section:has(.pm-panel),
.pm-sheet,
.pm-panel,

/* Video player voiceover promo hint */
#player p:has(.premium-shimmer-text),
#player .premium-shimmer-text,

/* Settings page hints and subscription tab button */
main section#preview a[href="/premium"],
main section#translation a[href="/premium"],
nav[aria-label="\u0420\u0430\u0437\u0434\u0435\u043B\u044B \u043D\u0430\u0441\u0442\u0440\u043E\u0435\u043A"] button:has(.lucide-crown),
div.md\\:hidden nav[aria-label="\u0420\u0430\u0437\u0434\u0435\u043B\u044B \u043D\u0430\u0441\u0442\u0440\u043E\u0435\u043A"] button:has(.lucide-crown) {
  display: none !important;
}
`;
  function isHidePremiumEnabled() {
    return storage.get(STORAGE_KEY, true);
  }
  function setHidePremiumEnabled(enabled) {
    storage.set(STORAGE_KEY, enabled);
    applyHidePremiumStyle(enabled);
  }
  function applyHidePremiumStyle(enabled) {
    let styleEl = document.getElementById(STYLE_ID);
    if (enabled) {
      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = STYLE_ID;
        styleEl.textContent = PREMIUM_HIDE_CSS;
        (document.head || document.documentElement).appendChild(styleEl);
      }
    } else {
      if (styleEl) {
        styleEl.remove();
      }
    }
  }
  var hidePremiumModule = {
    id: "hide-premium",
    name: "Hide Premium",
    description: "\u0421\u043A\u0440\u044B\u0442\u0438\u0435 \u0440\u0435\u043A\u043B\u0430\u043C\u043D\u044B\u0445 \u0431\u0430\u043D\u043D\u0435\u0440\u043E\u0432 \u0438 \u043A\u043D\u043E\u043F\u043E\u043A Premium",
    init() {
      const enabled = isHidePremiumEnabled();
      applyHidePremiumStyle(enabled);
    },
    destroy() {
      applyHidePremiumStyle(false);
    }
  };

  // src/modules/auto-claim/index.ts
  var STORAGE_KEY_REWARDS = "auto_claim_rewards";
  var STORAGE_KEY_BATTLEPASS = "auto_claim_battlepass";
  var STORAGE_KEY_ANOMALIES = "auto_claim_anomalies";
  var STORAGE_KEY_QUESTS = "auto_claim_quests";
  var clickedElements = /* @__PURE__ */ new WeakMap();
  var isBackgroundClaiming = false;
  function isAutoClaimRewardsEnabled() {
    return storage.get(STORAGE_KEY_REWARDS, true);
  }
  function setAutoClaimRewardsEnabled(enabled) {
    storage.set(STORAGE_KEY_REWARDS, enabled);
  }
  function isAutoClaimBattlepassEnabled() {
    return storage.get(STORAGE_KEY_BATTLEPASS, true);
  }
  function setAutoClaimBattlepassEnabled(enabled) {
    storage.set(STORAGE_KEY_BATTLEPASS, enabled);
    if (enabled) claimBattlepassRewards();
  }
  function isAutoClaimAnomaliesEnabled() {
    return storage.get(STORAGE_KEY_ANOMALIES, true);
  }
  function setAutoClaimAnomaliesEnabled(enabled) {
    storage.set(STORAGE_KEY_ANOMALIES, enabled);
    if (enabled) claimVisibleAnomaly();
  }
  function isAutoClaimQuestsEnabled() {
    return storage.get(STORAGE_KEY_QUESTS, true);
  }
  function setAutoClaimQuestsEnabled(enabled) {
    storage.set(STORAGE_KEY_QUESTS, enabled);
    if (enabled) runSilentBackgroundClaim();
  }
  function canClick(el) {
    if (!el.isConnected) return false;
    if (el.hasAttribute("disabled") || el.getAttribute("aria-disabled") === "true") return false;
    if (el.querySelector(".lqc-spin") || el.textContent?.includes("\u0417\u0430\u0431\u0438\u0440\u0430\u044E")) return false;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return false;
    const lastClick = clickedElements.get(el);
    if (lastClick && Date.now() - lastClick < 8e3) return false;
    return true;
  }
  function safeClick(el, label) {
    if (!canClick(el)) return;
    clickedElements.set(el, Date.now());
    try {
      el.click();
      console.log(`%c[AnimeOn+] ${label}`, "color: #A23FE8; font-weight: bold;");
    } catch (err) {
      console.error(`[AnimeOn+] \u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u043A\u043B\u0438\u043A\u0435 \u043D\u0430 ${label}:`, err);
    }
  }
  function checkOnScreenRewards() {
    if (!isAutoClaimRewardsEnabled()) return;
    const buttons = document.querySelectorAll(
      'button[aria-label*="\u0417\u0430\u0431\u0440\u0430\u0442\u044C"][aria-label*="AniMON"], button.group\\/lqc, button:has(img[src*="coin.svg"])'
    );
    buttons.forEach((btn) => {
      const target = btn.closest("button") || btn;
      if (canClick(target)) {
        const label = target.getAttribute("aria-label") || target.textContent?.trim() || "\u041D\u0430\u0433\u0440\u0430\u0434\u0430 AniMON";
        safeClick(target, `\u0421\u043E\u0431\u0440\u0430\u043D\u0430 \u043D\u0430\u0433\u0440\u0430\u0434\u0430: ${label}`);
      }
    });
    const menuItems = document.querySelectorAll('[role="menuitem"], button, [role="button"]');
    menuItems.forEach((el) => {
      const text = el.textContent || "";
      if (text.includes("\u0417\u0430\u0431\u0440\u0430\u0442\u044C") && (text.includes("AniMON") || text.includes("+") || el.querySelector('img[src*="coin"]'))) {
        if (text.trim().length < 60 && canClick(el)) {
          safeClick(el, `\u0421\u043E\u0431\u0440\u0430\u043D\u0430 \u043D\u0430\u0433\u0440\u0430\u0434\u0430: ${text.trim()}`);
        }
      }
    });
  }
  function notifyRewardStateSync(topics) {
    try {
      const detail = { facts: {}, topics };
      window.dispatchEvent(new CustomEvent("animeon:state-sync", { detail }));
      if (typeof BroadcastChannel !== "undefined") {
        const channel = new BroadcastChannel("animeon-state-sync");
        channel.postMessage({ topics });
        channel.close();
      }
    } catch {
    }
  }
  function updateClaimableCache(key, values) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const cached = JSON.parse(raw);
      if (typeof cached?.u !== "string" || !cached.u || !Number.isInteger(values.n) || values.n < 0) return;
      const t = Math.max(Date.now(), (Number(cached.t) || 0) + 1);
      const p = values.n === 0 ? 0 : values.n > cached.n || !cached.p ? t : cached.p;
      const next = JSON.stringify({ ...cached, ...values, t, p });
      localStorage.setItem(key, next);
      window.dispatchEvent(new StorageEvent("storage", {
        key,
        oldValue: raw,
        newValue: next,
        storageArea: localStorage,
        url: location.href
      }));
    } catch {
    }
  }
  async function refreshBattlepassClaimableCache() {
    try {
      const response = await fetch("/api/battlepass/claimable", { credentials: "include", cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      updateClaimableCache("animeon:bp-claimable:v1", {
        n: data.claimable,
        ...(typeof data.season_id === "string" && { s: data.season_id }),
        ...(Number.isInteger(data.level) && { l: data.level })
      });
    } catch {
    }
  }
  async function refreshLevelClaimableCache() {
    try {
      const response = await fetch("/api/levels/claimable", { credentials: "include", cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      updateClaimableCache("animeon:levels-claimable:v1", {
        n: data.claimable,
        a: Number(data.animon) || 0,
        l: Number(data.level) || 0,
        ...(Number.isInteger(data.quick) && { q: data.quick }),
        ...(Number.isInteger(data.quick_animon) && { qa: data.quick_animon })
      });
    } catch {
    }
  }
  var battlepassClaimInFlight = false;
  async function claimBattlepassRewards() {
    if (!isAutoClaimBattlepassEnabled() || battlepassClaimInFlight) return;
    battlepassClaimInFlight = true;
    try {
      const stateRes = await fetch("/api/battlepass", { credentials: "include", cache: "no-store" });
      if (!stateRes.ok) return;
      const state = await stateRes.json();
      const rewards = Array.isArray(state.rewards) ? state.rewards : [];
      const premium = state.viewer_is_premium === true;
      const claimable = rewards.filter((reward) =>
        reward.claimable === true && (reward.band === "free" || (reward.band === "premium" && premium))
      );
      let claimedAny = false;
      for (const reward of claimable) {
        const claimRes = await fetch("/api/battlepass/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ level: reward.level, band: reward.band })
        });
        if (!claimRes.ok) continue;
        const result = await claimRes.json();
        if (result.claimed === true) {
          claimedAny = true;
          console.log(
            `%c[AnimeOn+] Автоматически получена награда Battlepass: уровень ${reward.level}, ${reward.band}`,
            "color: #10B981; font-weight: bold;"
          );
        }
      }
      if (claimedAny) {
        await refreshBattlepassClaimableCache();
        notifyRewardStateSync(["balance"]);
      }
    } catch (err) {
    } finally {
      battlepassClaimInFlight = false;
    }
  }
  var anomalyClaimInFlight = false;
  var anomalyLastCheckedAt = 0;
  async function claimVisibleAnomaly() {
    if (!isAutoClaimAnomaliesEnabled() || anomalyClaimInFlight || Date.now() - anomalyLastCheckedAt < 1e4) return;
    anomalyClaimInFlight = true;
    anomalyLastCheckedAt = Date.now();
    try {
      const stateRes = await fetch("/api/event/boar/anomaly/state", { credentials: "include" });
      if (!stateRes.ok) return;
      const state = await stateRes.json();
      if (!state.eligible || !state.orb_id) return;
      const revealRes = await fetch("/api/event/boar/anomaly/reveal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ orb_id: state.orb_id })
      });
      if (!revealRes.ok || !(await revealRes.json()).ok) return;
      const claimMinMs = Math.max(0, Number(state.claim_min_ms) || 0);
      if (claimMinMs) {
        await new Promise((resolve) => setTimeout(resolve, claimMinMs));
      }
      const claimRes = await fetch("/api/event/boar/anomaly/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ orb_id: state.orb_id })
      });
      if (claimRes.ok) {
        const result = await claimRes.json();
        if (result.ok) {
          console.log("%c[AnimeOn+] Автоматически собрана сфера аномалии", "color: #10B981; font-weight: bold;");
        }
      }
    } catch {
    } finally {
      anomalyClaimInFlight = false;
    }
  }
  function checkAnomalies() {
    if (isAutoClaimAnomaliesEnabled()) claimVisibleAnomaly();
  }
  async function claimDailyQuests() {
    if (!isAutoClaimQuestsEnabled()) return;
    const dailyOptions = { credentials: "include", cache: "no-store" };
    let claimedAny = false;
    try {
      const res = await fetch("/api/quests/daily", dailyOptions);
      if (!res.ok) return;
      let daily = await res.json();
      const quests = Array.isArray(daily.quests) ? daily.quests : [];
      const claimable = quests.filter((q) => q.completed && !q.claimed);
      for (const q of claimable) {
        const claimRes = await fetch("/api/quests/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ quest_id: q.quest_id })
        });
        if (claimRes.ok) {
          claimedAny = true;
          console.log(
            `%c[AnimeOn+] \u0410\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438 \u0441\u043E\u0431\u0440\u0430\u043D \u043A\u0432\u0435\u0441\u0442: \xAB${q.title}\xBB (+${q.xp_reward || 0} XP, +${q.animon_reward || 0} AniMON)`,
            "color: #10B981; font-weight: bold;"
          );
        }
      }
      if (claimedAny && !daily.booster_claimable && !daily.booster_claimed) {
        const updatedRes = await fetch("/api/quests/daily", dailyOptions);
        if (!updatedRes.ok) return;
        daily = await updatedRes.json();
      }
      if (daily.booster_claimable === true && !daily.booster_claimed) {
        const claimRes = await fetch("/api/quests/booster/claim", {
          method: "POST",
          credentials: "include"
        });
        if (claimRes.ok) {
          console.log("%c[AnimeOn+] Автоматически забран бустер за прогресс дня", "color: #10B981; font-weight: bold;");
          if (!claimedAny) notifyRewardStateSync(["quests"]);
        }
      }
    } catch {
    } finally {
      if (claimedAny) notifyRewardStateSync(["quests", "xp", "balance"]);
    }
  }
  async function claimAccountLevels() {
    if (!isAutoClaimRewardsEnabled()) return;
    try {
      const res = await fetch("/api/levels/claimable", { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      let claimed = false;
      if (data.claimable > 0 || data.quick > 0) {
        const claimRes = await fetch("/api/levels/claim-quick", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({})
        });
        if (claimRes.ok) {
          claimed = true;
          const result = await claimRes.json();
          console.log(
            `%c[AnimeOn+] \u0410\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438 \u0441\u043E\u0431\u0440\u0430\u043D\u044B \u043D\u0430\u0433\u0440\u0430\u0434\u044B \u0437\u0430 \u0443\u0440\u043E\u0432\u043D\u0438 \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0430 (+${result.granted_animon || data.animon || 0} AniMON)`,
            "color: #10B981; font-weight: bold;"
          );
        }
      }
      if (claimed) {
        await refreshLevelClaimableCache();
        notifyRewardStateSync(["quests", "xp", "balance"]);
      }
    } catch (err) {
    }
  }
  async function runSilentBackgroundClaim() {
    if (isBackgroundClaiming) return;
    isBackgroundClaiming = true;
    try {
      await claimDailyQuests();
      await claimAccountLevels();
      await claimBattlepassRewards();
    } finally {
      isBackgroundClaiming = false;
    }
  }
  function scanOnScreen() {
    checkOnScreenRewards();
    checkAnomalies();
  }
  var onScreenTimer = null;
  var backgroundTimer = null;
  var observer = null;
  var autoClaimModule = {
    id: "auto-claim",
    name: "Auto Claim Engine",
    description: "\u0410\u0432\u0442\u043E\u0441\u0431\u043E\u0440 \u0435\u0436\u0435\u0434\u043D\u0435\u0432\u043D\u044B\u0445 \u043A\u0432\u0435\u0441\u0442\u043E\u0432, \u043C\u043E\u043D\u0435\u0442 \u0438 \u0441\u0444\u0435\u0440 \u0430\u043D\u043E\u043C\u0430\u043B\u0438\u0439.",
    init() {
      scanOnScreen();
      onScreenTimer = setInterval(scanOnScreen, 1500);
      let debounceTimer = null;
      observer = new MutationObserver(() => {
        if (debounceTimer) return;
        debounceTimer = setTimeout(() => {
          debounceTimer = null;
          scanOnScreen();
        }, 250);
      });
      observer.observe(document.body || document.documentElement, {
        childList: true,
        subtree: true
      });
      setTimeout(() => {
        runSilentBackgroundClaim();
      }, 3e3);
      backgroundTimer = setInterval(() => {
        runSilentBackgroundClaim();
      }, 18e4);
    },
    destroy() {
      if (onScreenTimer) {
        clearInterval(onScreenTimer);
        onScreenTimer = null;
      }
      if (backgroundTimer) {
        clearInterval(backgroundTimer);
        backgroundTimer = null;
      }
      if (observer) {
        observer.disconnect();
        observer = null;
      }
    }
  };

  // src/modules/chat/index.ts
  var STORAGE_KEY2 = "hide_chat_button";
  var STYLE_ID2 = "animeon-plus-hide-chat";
  var HIDE_CHAT_CSS = `
.chat-fab,
button.chat-fab,
button[aria-label*="\u043E\u0431\u0449\u0438\u0439 \u0447\u0430\u0442"] {
  display: none !important;
}
`;
  function isHideChatButtonEnabled() {
    return storage.get(STORAGE_KEY2, false);
  }
  function setHideChatButtonEnabled(enabled) {
    storage.set(STORAGE_KEY2, enabled);
    applyHideChatStyle(enabled);
  }
  function applyHideChatStyle(enabled) {
    let styleEl = document.getElementById(STYLE_ID2);
    if (enabled) {
      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = STYLE_ID2;
        styleEl.textContent = HIDE_CHAT_CSS;
        (document.head || document.documentElement).appendChild(styleEl);
      }
    } else {
      if (styleEl) {
        styleEl.remove();
      }
    }
  }
  var chatModule = {
    id: "chat-controller",
    name: "Chat Button Controller",
    description: "\u0421\u043A\u0440\u044B\u0442\u0438\u0435 \u043F\u043B\u0430\u0432\u0430\u044E\u0449\u0435\u0439 \u043A\u043D\u043E\u043F\u043A\u0438 \u0447\u0430\u0442\u0430",
    init() {
      const enabled = isHideChatButtonEnabled();
      applyHideChatStyle(enabled);
    },
    destroy() {
      applyHideChatStyle(false);
    }
  };

  // src/modules/quick-room/index.ts
  var STORAGE_KEY_TOGGLE = "quick_room_enabled";
  var CARD_ID = "animeon-plus-quick-room-card";
  var animeCache = /* @__PURE__ */ new Map();
  function isQuickRoomEnabled() {
    return storage.get(STORAGE_KEY_TOGGLE, true);
  }
  function setQuickRoomEnabled(enabled) {
    storage.set(STORAGE_KEY_TOGGLE, enabled);
    if (!enabled) {
      document.getElementById(CARD_ID)?.remove();
    } else {
      injectQuickRoom();
    }
  }
  function getAnimeSlug() {
    const match = window.location.pathname.match(/^\/anime\/([^\/?#]+)/);
    return match ? match[1] : null;
  }
  function getSavedChoice(slug) {
    return storage.get(`qr_choice_${slug}`, null);
  }
  function setSavedChoice(slug, choice) {
    storage.set(`qr_choice_${slug}`, choice);
  }
  async function fetchAnimeData(slug) {
    if (animeCache.has(slug)) {
      return animeCache.get(slug);
    }
    const res = await fetch(`/api/anime/${slug}`, { credentials: "include" });
    if (!res.ok) throw new Error("\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0434\u0430\u043D\u043D\u044B\u0435 \u0430\u043D\u0438\u043C\u0435");
    const data = await res.json();
    animeCache.set(slug, data);
    return data;
  }
  async function fetchUserHistory(animeId) {
    try {
      const res = await fetch(`/api/user/history/anime?anime_id=${animeId}`, {
        credentials: "include"
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.found && data.item ? data.item : null;
    } catch {
      return null;
    }
  }
  async function createRoom(btn, anime, translation, episode, slug) {
    const originalHtml = btn.innerHTML;
    btn.disabled = true;
    btn.classList.add("opacity-75");
    btn.innerHTML = `
    <span class="inline-block animate-spin mr-1.5">\u27F3</span>
    <span>\u0421\u043E\u0437\u0434\u0430\u043D\u0438\u0435 \u043A\u043E\u043C\u043D\u0430\u0442\u044B\u2026</span>
  `;
    try {
      const title = anime.material_data?.anime_title || anime.anime_title || document.querySelector("h1")?.textContent?.trim() || "\u0421\u043C\u043E\u0442\u0440\u0438\u043C \u0432\u043C\u0435\u0441\u0442\u0435";
      const payload = {
        title: `${title} \u2014 \u0441\u043C\u043E\u0442\u0440\u0438\u043C \u0432\u043C\u0435\u0441\u0442\u0435`,
        type: "private",
        anime_id: anime.id,
        episode: Number(episode) || 1,
        translation: translation || void 0,
        capacity: 2,
        control_policy: "everyone",
        vote_policy: "everyone",
        host_only_control: false,
        chat_slow_seconds: 0,
        auto_next: true,
        spoiler_guard: true,
        allow_reactions: true,
        scheduled_start_at: null
      };
      const res = await fetch("/api/cowatch/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setSavedChoice(slug, { translation, episode });
      const inviteUrl = data.invite?.url || `${window.location.origin}/together/${data.room.code}`;
      try {
        await navigator.clipboard.writeText(inviteUrl);
        console.log("[AnimeOn+] \u0421\u0441\u044B\u043B\u043A\u0430 \u043D\u0430 \u043A\u043E\u043C\u043D\u0430\u0442\u0443 \u0441\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u0430 \u0432 \u0431\u0443\u0444\u0435\u0440:", inviteUrl);
      } catch {
      }
      btn.innerHTML = `
      <svg class="w-3.5 h-3.5 mr-1 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span>\u041A\u043E\u043C\u043D\u0430\u0442\u0430 \u0441\u043E\u0437\u0434\u0430\u043D\u0430! \u0412\u0445\u043E\u0434\u0438\u043C\u2026</span>
    `;
      setTimeout(() => {
        window.location.href = `/together/${data.room.code}`;
      }, 250);
    } catch (err) {
      console.error("[AnimeOn+] \u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044F \u043A\u043E\u043C\u043D\u0430\u0442\u044B:", err);
      btn.innerHTML = `
      <span class="text-rose-400">\u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044F</span>
    `;
      setTimeout(() => {
        btn.innerHTML = originalHtml;
        btn.disabled = false;
        btn.classList.remove("opacity-75");
      }, 2500);
    }
  }
  async function injectQuickRoom() {
    if (!isQuickRoomEnabled()) return;
    const slug = getAnimeSlug();
    if (!slug) return;
    if (document.getElementById(CARD_ID)) return;
    const spaceY3 = document.querySelector("div.lg\\:sticky div.space-y-3, div.space-y-3");
    if (!spaceY3) return;
    const buttons = Array.from(spaceY3.querySelectorAll("button"));
    const watchTogetherBtn = buttons.find((b) => b.textContent?.includes("\u0421\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u0432\u043C\u0435\u0441\u0442\u0435"));
    if (!watchTogetherBtn) return;
    const card = document.createElement("div");
    card.id = CARD_ID;
    card.className = "rounded-xl border border-violet-500/20 bg-violet-500/[0.04] p-3 space-y-2.5 text-xs text-zinc-300";
    card.innerHTML = `
    <!-- Card Header -->
    <div class="flex items-center justify-between gap-1 text-[11px]">
      <div class="flex items-center gap-1.5 font-semibold text-violet-300">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-violet-400">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <polyline points="16 11 18 13 22 9"></polyline>
        </svg>
        <span>\u041A\u043E\u043C\u043D\u0430\u0442\u0430 \u0434\u043B\u044F \u0434\u0432\u043E\u0438\u0445</span>
      </div>

      <div id="aon-qr-history-badge" class="hidden items-center gap-1 rounded bg-violet-500/20 px-1.5 py-0.5 text-[10px] text-violet-200 cursor-pointer hover:bg-violet-500/30 transition-colors" title="\u041D\u0430\u0436\u043C\u0438\u0442\u0435, \u0447\u0442\u043E\u0431\u044B \u043F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u044C \u0434\u0430\u043D\u043D\u044B\u0435 \u0438\u0437 \u0438\u0441\u0442\u043E\u0440\u0438\u0438">
        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <span id="aon-qr-history-text">\u0418\u0437 \u0438\u0441\u0442\u043E\u0440\u0438\u0438</span>
      </div>
    </div>

    <!-- Controls Row: \u041E\u0437\u0432\u0443\u0447\u043A\u0430 + \u0421\u0435\u0440\u0438\u044F -->
    <div class="grid grid-cols-[1fr_80px] gap-2">
      <!-- \u041E\u0437\u0432\u0443\u0447\u043A\u0430 Select -->
      <div class="space-y-1">
        <label class="block text-[10px] font-medium text-zinc-400 uppercase tracking-wider">\u041E\u0437\u0432\u0443\u0447\u043A\u0430</label>
        <select id="aon-qr-translation" class="w-full h-8 rounded-lg bg-zinc-900 border border-white/[0.1] px-2 text-xs text-zinc-200 outline-none focus:border-violet-500 cursor-pointer transition-colors">
          <option value="">\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430...</option>
        </select>
      </div>

      <!-- \u0421\u0435\u0440\u0438\u044F Input / Select -->
      <div class="space-y-1">
        <label class="block text-[10px] font-medium text-zinc-400 uppercase tracking-wider">\u0421\u0435\u0440\u0438\u044F</label>
        <select id="aon-qr-episode" class="w-full h-8 rounded-lg bg-zinc-900 border border-white/[0.1] px-2 text-xs text-zinc-200 outline-none focus:border-violet-500 cursor-pointer text-center font-medium transition-colors">
          <option value="1">1</option>
        </select>
      </div>
    </div>

    <!-- Create Button -->
    <button
      id="aon-qr-submit-btn"
      type="button"
      class="border border-violet-500/30 bg-violet-600/25 text-violet-100 font-semibold hover:bg-violet-600/40 hover:text-white active:bg-violet-600/30 transition-[background-color,color,transform] duration-150 w-full rounded-lg h-9 inline-flex items-center justify-center gap-1.5 px-2.5 outline-none cursor-pointer select-none text-xs active:scale-[0.99]"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-violet-300">
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
      </svg>
      <span>\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u043F\u0440\u0438\u0432\u0430\u0442\u043D\u0443\u044E \u043A\u043E\u043C\u043D\u0430\u0442\u0443</span>
    </button>
  `;
    watchTogetherBtn.insertAdjacentElement("afterend", card);
    const translationSelect = card.querySelector("#aon-qr-translation");
    const episodeSelect = card.querySelector("#aon-qr-episode");
    const submitBtn = card.querySelector("#aon-qr-submit-btn");
    const historyBadge = card.querySelector("#aon-qr-history-badge");
    const historyText = card.querySelector("#aon-qr-history-text");
    try {
      const anime = await fetchAnimeData(slug);
      const translationsMap = anime.translations || {};
      const translationNames = Object.keys(translationsMap);
      if (translationNames.length === 0) {
        if (translationSelect) {
          translationSelect.innerHTML = '<option value="">\u041F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E</option>';
        }
      } else {
        if (translationSelect) {
          translationSelect.replaceChildren(...translationNames.map((name) => new Option(name, name)));
        }
      }
      const updateEpisodes = (selectedTr, preferredEpisode) => {
        const episodesObj = translationsMap[selectedTr]?.episodes || {};
        const epKeys = Object.keys(episodesObj).map(Number).sort((a, b) => a - b);
        const total = epKeys.length > 0 ? epKeys : [1];
        if (episodeSelect) {
          episodeSelect.replaceChildren(...total.map((n) => new Option(`\u0421\u0435\u0440. ${n}`, String(n))));
          if (preferredEpisode && total.includes(preferredEpisode)) {
            episodeSelect.value = String(preferredEpisode);
          } else if (total.length > 0) {
            episodeSelect.value = String(total[0]);
          }
        }
      };
      updateEpisodes(translationSelect?.value || translationNames[0] || "", 1);
      translationSelect?.addEventListener("change", () => {
        updateEpisodes(translationSelect.value, Number(episodeSelect?.value) || 1);
        setSavedChoice(slug, {
          translation: translationSelect.value,
          episode: Number(episodeSelect?.value) || 1
        });
      });
      episodeSelect?.addEventListener("change", () => {
        setSavedChoice(slug, {
          translation: translationSelect?.value || "",
          episode: Number(episodeSelect.value) || 1
        });
      });
      let historyApplied = false;
      const historyItem = await fetchUserHistory(anime.id);
      if (historyItem) {
        const histEp = historyItem.episode_num || 1;
        const histTr = historyItem.translation;
        if (historyBadge && historyText) {
          historyBadge.classList.remove("hidden");
          historyBadge.classList.add("inline-flex");
          historyText.textContent = `\u0418\u0441\u0442\u043E\u0440\u0438\u044F: ${histEp} \u0441\u0435\u0440. ${histTr ? `(${histTr})` : ""}`;
          historyBadge.addEventListener("click", (e) => {
            e.preventDefault();
            if (histTr && translationNames.includes(histTr)) {
              if (translationSelect) translationSelect.value = histTr;
            }
            updateEpisodes(translationSelect?.value || histTr || "", histEp);
            setSavedChoice(slug, {
              translation: translationSelect?.value || histTr || "",
              episode: histEp
            });
          });
        }
        const saved = getSavedChoice(slug);
        if (saved) {
          if (saved.translation && translationNames.includes(saved.translation)) {
            if (translationSelect) translationSelect.value = saved.translation;
          }
          updateEpisodes(translationSelect?.value || "", saved.episode);
        } else {
          if (histTr && translationNames.includes(histTr)) {
            if (translationSelect) translationSelect.value = histTr;
          }
          updateEpisodes(translationSelect?.value || histTr || "", histEp);
          historyApplied = true;
        }
      } else {
        const saved = getSavedChoice(slug);
        if (saved) {
          if (saved.translation && translationNames.includes(saved.translation)) {
            if (translationSelect) translationSelect.value = saved.translation;
          }
          updateEpisodes(translationSelect?.value || "", saved.episode);
        } else {
          const playerTr = document.querySelector(
            '#player div.lg\\:w-\\[320px\\] button.relative.z-10[aria-current="true"] span.truncate'
          )?.textContent?.trim();
          if (playerTr && translationNames.includes(playerTr)) {
            if (translationSelect) translationSelect.value = playerTr;
            updateEpisodes(playerTr, 1);
          }
        }
      }
      submitBtn?.addEventListener("click", (e) => {
        e.preventDefault();
        const currentTr = translationSelect?.value || translationNames[0] || "";
        const currentEp = Number(episodeSelect?.value) || 1;
        createRoom(submitBtn, anime, currentTr, currentEp, slug);
      });
    } catch (err) {
      console.error("[AnimeOn+] \u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0438\u043D\u0438\u0446\u0438\u0430\u043B\u0438\u0437\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u043A\u0430\u0440\u0442\u043E\u0447\u043A\u0443 \u0431\u044B\u0441\u0442\u0440\u043E\u0439 \u043A\u043E\u043C\u043D\u0430\u0442\u044B:", err);
    }
  }
  var observer2 = null;
  var quickRoomModule = {
    id: "quick-room",
    name: "Quick Room For Two",
    description: "\u041A\u0430\u0440\u0442\u043E\u0447\u043A\u0430 \u0431\u044B\u0441\u0442\u0440\u043E\u0433\u043E \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044F \u043A\u043E\u043C\u043D\u0430\u0442\u044B \u0434\u043B\u044F \u0434\u0432\u043E\u0438\u0445 \u0441 \u0432\u044B\u0431\u043E\u0440\u043E\u043C \u043E\u0437\u0432\u0443\u0447\u043A\u0438 \u0438 \u0441\u0435\u0440\u0438\u0438 \u0438\u0437 \u0438\u0441\u0442\u043E\u0440\u0438\u0438",
    init() {
      injectQuickRoom();
      router.onRouteChange(() => {
        injectQuickRoom();
      });
      observer2 = new MutationObserver(() => {
        if (window.location.pathname.startsWith("/anime/")) {
          if (!document.getElementById(CARD_ID)) {
            injectQuickRoom();
          }
        }
      });
      observer2.observe(document.body || document.documentElement, {
        childList: true,
        subtree: true
      });
    },
    destroy() {
      if (observer2) {
        observer2.disconnect();
        observer2 = null;
      }
      document.getElementById(CARD_ID)?.remove();
    }
  };

  // src/modules/homepage-cleaner/index.ts
  var STORAGE_KEY_HERO = "hide_hero_slider";
  var STORAGE_KEY_BP = "hide_battlepass_banner";
  var STYLE_ID_HERO = "animeon-plus-hide-hero";
  var STYLE_ID_BP = "animeon-plus-hide-battlepass";
  var HIDE_HERO_CSS = `
/* Hide Homepage Hero Carousel / Slider */
section.relative.-mt-16.z-10,
section:has(.hero-slider-height),
.hero-slider-height {
  display: none !important;
}
`;
  var HIDE_BP_CSS = `
/* Hide Homepage Battlepass Banner & Links */
section.bpp-compact,
section:has(.bpp-shell),
section:has(.bpp-panel),
section:has(a[href="/battlepass"]),
.bpp-compact,
.bpp-shell,
.bpp-panel,
header a[href="/battlepass"],
header a[aria-label="\u0411\u0430\u0442\u043B\u043F\u0430\u0441\u0441"],
[data-slot="sheet-content"] a[href="/battlepass"] {
  display: none !important;
}
`;
  function ensureStyle(id, css, enabled) {
    let styleEl = document.getElementById(id);
    if (enabled) {
      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = id;
        styleEl.textContent = css;
        (document.head || document.documentElement).appendChild(styleEl);
      }
    } else {
      if (styleEl) {
        styleEl.remove();
      }
    }
  }
  function isHideHeroSliderEnabled() {
    return storage.get(STORAGE_KEY_HERO, false);
  }
  function setHideHeroSliderEnabled(enabled) {
    storage.set(STORAGE_KEY_HERO, enabled);
    ensureStyle(STYLE_ID_HERO, HIDE_HERO_CSS, enabled);
  }
  function isHideBattlepassEnabled() {
    return storage.get(STORAGE_KEY_BP, false);
  }
  function setHideBattlepassEnabled(enabled) {
    storage.set(STORAGE_KEY_BP, enabled);
    ensureStyle(STYLE_ID_BP, HIDE_BP_CSS, enabled);
  }
  var homepageCleanerModule = {
    id: "homepage-cleaner",
    name: "Homepage Cleaner",
    description: "\u0421\u043A\u0440\u044B\u0442\u0438\u0435 \u0441\u043B\u0430\u0439\u0434\u0435\u0440\u0430 Hero \u0438 \u0431\u043B\u043E\u043A\u0430 \u0431\u043E\u0435\u0432\u043E\u0433\u043E \u043F\u0440\u043E\u043F\u0443\u0441\u043A\u0430 \u043D\u0430 \u0433\u043B\u0430\u0432\u043D\u043E\u0439 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0435",
    init() {
      ensureStyle(STYLE_ID_HERO, HIDE_HERO_CSS, isHideHeroSliderEnabled());
      ensureStyle(STYLE_ID_BP, HIDE_BP_CSS, isHideBattlepassEnabled());
    },
    destroy() {
      ensureStyle(STYLE_ID_HERO, HIDE_HERO_CSS, false);
      ensureStyle(STYLE_ID_BP, HIDE_BP_CSS, false);
    }
  };

  // src/modules/playback-speed/index.ts
  function initPlaybackSpeed() {
    const buttonId = "animeon-plus-speed-4x";
    function syncButton() {
      if (!location.pathname.startsWith("/anime/")) return;
      const player = document.getElementById("player");
      const video = player?.querySelector("video.player-video");
      if (!video) return;
      let button = player.querySelector(`#${buttonId}`);
      if (!button) {
        const label = Array.from(player.querySelectorAll(".custom-scrollbar > div > span > span"))
          .find((span) => span.textContent.trim() === "2.5×");
        if (!label) return;
        button = document.createElement("button");
        button.id = buttonId;
        button.type = "button";
        button.className = "w-full rounded-lg p-2 text-left text-sm font-medium text-white hover:bg-white/[0.06] aria-pressed:bg-primary/20";
        button.textContent = "4×";
        button.addEventListener("click", () => {
          const current = player.querySelector("video.player-video");
          if (current?.readyState > 0) current.playbackRate = 4;
        });
        label.closest(".custom-scrollbar").appendChild(button);
      }
      button.disabled = video.readyState === 0;
      button.setAttribute("aria-pressed", String(video.playbackRate === 4));
    }
    const observer = new MutationObserver(syncButton);
    observer.observe(document.body, { childList: true, subtree: true });
    for (const event of ["ratechange", "loadedmetadata", "emptied"]) {
      document.addEventListener(event, (e) => {
        if (e.target.matches?.("#player video.player-video")) syncButton();
      }, true);
    }
    syncButton();
  }

  // src/modules/settings/settings-view.ts
  function createAnimeonPlusView() {
    const container = document.createElement("div");
    container.id = "animeon-plus-settings-container";
    container.className = "space-y-5";
    const toggleOptions = [
      {
        id: "quick-room",
        iconSvg: `
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <polyline points="16 11 18 13 22 9"></polyline>
        </svg>
      `,
        title: "\u041A\u043D\u043E\u043F\u043A\u0430 \xAB\u041A\u043E\u043C\u043D\u0430\u0442\u0430 \u0434\u043B\u044F \u0434\u0432\u043E\u0438\u0445\xBB \u0432 1 \u043A\u043B\u0438\u043A",
        description: "\u0414\u043E\u0431\u0430\u0432\u043B\u044F\u0435\u0442 \u0431\u043B\u043E\u043A \u0431\u044B\u0441\u0442\u0440\u043E\u0439 \u043A\u043E\u043C\u043D\u0430\u0442\u044B \u043D\u0430 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0435 \u0430\u043D\u0438\u043C\u0435 \u0441 \u0432\u044B\u0431\u043E\u0440\u043E\u043C \u0441\u0435\u0440\u0438\u0438 \u0438 \u043E\u0437\u0432\u0443\u0447\u043A\u0438 \u0438\u0437 \u0438\u0441\u0442\u043E\u0440\u0438\u0438",
        isEnabled: isQuickRoomEnabled,
        setEnabled: setQuickRoomEnabled
      },
      {
        id: "hide-hero",
        iconSvg: `
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
          <line x1="2" y1="2" x2="22" y2="22"></line>
        </svg>
      `,
        title: "\u0421\u043A\u0440\u044B\u0442\u044C \u0433\u043B\u0430\u0432\u043D\u044B\u0439 \u0441\u043B\u0430\u0439\u0434\u0435\u0440 Hero \u043D\u0430 \u0433\u043B\u0430\u0432\u043D\u043E\u0439",
        description: "\u0421\u043A\u0440\u044B\u0432\u0430\u0435\u0442 \u0432\u0435\u0440\u0445\u043D\u0438\u0439 \u0431\u043E\u043B\u044C\u0448\u043E\u0439 \u043F\u0440\u043E\u043C\u043E-\u0441\u043B\u0430\u0439\u0434\u0435\u0440 \u0441 \u043F\u043E\u0441\u0442\u0435\u0440\u0430\u043C\u0438 \u043D\u0430 \u0433\u043B\u0430\u0432\u043D\u043E\u0439 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0435 \u0441\u0430\u0439\u0442\u0430",
        isEnabled: isHideHeroSliderEnabled,
        setEnabled: setHideHeroSliderEnabled
      },
      {
        id: "hide-battlepass",
        iconSvg: `
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          <line x1="2" y1="2" x2="22" y2="22"></line>
        </svg>
      `,
        title: "\u0421\u043A\u0440\u044B\u0442\u044C \u0431\u043B\u043E\u043A \u0431\u043E\u0435\u0432\u043E\u0433\u043E \u043F\u0440\u043E\u043F\u0443\u0441\u043A\u0430 \u043D\u0430 \u0433\u043B\u0430\u0432\u043D\u043E\u0439",
        description: "\u0421\u043A\u0440\u044B\u0432\u0430\u0435\u0442 \u043F\u0440\u043E\u043C\u043E-\u0431\u0430\u043D\u043D\u0435\u0440 Battlepass \u0432 \u043B\u0435\u043D\u0442\u0435 \u0433\u043B\u0430\u0432\u043D\u043E\u0439 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u044B \u0438 \u0437\u043D\u0430\u0447\u043E\u043A \u0432 \u0448\u0430\u043F\u043A\u0435",
        isEnabled: isHideBattlepassEnabled,
        setEnabled: setHideBattlepassEnabled
      },
      {
        id: "auto-claim-quests",
        iconSvg: `
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      `,
        title: "\u0422\u0438\u0445\u0438\u0439 \u0430\u0432\u0442\u043E\u0441\u0431\u043E\u0440 \u043A\u0432\u0435\u0441\u0442\u043E\u0432 (\u0432 \u0444\u043E\u043D\u0435)",
        description: "\u0410\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438 \u0437\u0430\u0431\u0438\u0440\u0430\u0435\u0442 \u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u043D\u044B\u0435 \u0435\u0436\u0435\u0434\u043D\u0435\u0432\u043D\u044B\u0435 \u043A\u0432\u0435\u0441\u0442\u044B \u0447\u0435\u0440\u0435\u0437 API \u0431\u0435\u0437 \u043E\u0442\u043A\u0440\u044B\u0442\u0438\u044F \u0441\u0442\u0440\u0430\u043D\u0438\u0446 \u0438 \u0431\u0435\u0437 \u043F\u043E\u043C\u0435\u0445 \u043F\u0440\u043E\u0441\u043C\u043E\u0442\u0440\u0443",
        isEnabled: isAutoClaimQuestsEnabled,
        setEnabled: setAutoClaimQuestsEnabled
      },
      {
        id: "auto-claim-battlepass",
        iconSvg: `
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          <line x1="2" y1="2" x2="22" y2="22"></line>
        </svg>
      `,
        title: "Автосбор наград Battlepass",
        description: "Автоматически получает доступные награды боевого пропуска через API сайта",
        isEnabled: isAutoClaimBattlepassEnabled,
        setEnabled: setAutoClaimBattlepassEnabled
      },
      {
        id: "auto-claim-rewards",
        iconSvg: `
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5.6 12.6h12.8v6.2a2.4 2.4 0 0 1-2.4 2.4H8a2.4 2.4 0 0 1-2.4-2.4z"></path>
          <path d="M12 12.6v8.6"></path>
          <path d="M5.6 8.4h12.8a1.2 1.2 0 0 1 1.2 1.2v1.8a1.2 1.2 0 0 1-1.2 1.2H5.6a1.2 1.2 0 0 1-1.2-1.2V9.6a1.2 1.2 0 0 1 1.2-1.2z"></path>
          <circle cx="12" cy="5" r="2"></circle>
        </svg>
      `,
        title: "\u0410\u0432\u0442\u043E\u0441\u0431\u043E\u0440 \u043C\u043E\u043D\u0435\u0442 \u0437\u0430 \u0443\u0440\u043E\u0432\u043D\u0438 (AniMON)",
        description: "\u0410\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438 \u0441\u043E\u0431\u0438\u0440\u0430\u0435\u0442 \u043C\u043E\u043D\u0435\u0442\u044B \u0437\u0430 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u0435 \u043D\u043E\u0432\u044B\u0445 \u0443\u0440\u043E\u0432\u043D\u0435\u0439 \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0430 \u043F\u0440\u0438 \u0438\u0445 \u043F\u043E\u044F\u0432\u043B\u0435\u043D\u0438\u0438",
        isEnabled: isAutoClaimRewardsEnabled,
        setEnabled: setAutoClaimRewardsEnabled
      },
      {
        id: "auto-claim-anomalies",
        iconSvg: `
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="m4.93 4.93 4.24 4.24"></path>
          <path d="m14.83 9.17 4.24-4.24"></path>
          <path d="m14.83 14.83 4.24 4.24"></path>
          <path d="m9.17 14.83-4.24 4.24"></path>
          <circle cx="12" cy="12" r="4"></circle>
        </svg>
      `,
        title: "\u0410\u0432\u0442\u043E\u0441\u0431\u043E\u0440 \u0441\u0444\u0435\u0440 \u0430\u043D\u043E\u043C\u0430\u043B\u0438\u0439",
        description: "\u0417\u0430\u0431\u0438\u0440\u0430\u0435\u0442 \u043F\u043E\u044F\u0432\u0438\u0432\u0448\u0438\u0435\u0441\u044F \u0441\u0444\u0435\u0440\u044B \u0447\u0435\u0440\u0435\u0437 API \u0441\u0430\u0439\u0442\u0430 \u0441 \u0443\u0447\u0451\u0442\u043E\u043C \u0437\u0430\u0434\u0435\u0440\u0436\u043A\u0438 \u0437\u0430\u0449\u0438\u0442\u044B",
        isEnabled: isAutoClaimAnomaliesEnabled,
        setEnabled: setAutoClaimAnomaliesEnabled
      },
      {
        id: "hide-premium",
        iconSvg: `
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        </svg>
      `,
        title: "\u0421\u043A\u0440\u044B\u0442\u044C \u0432\u0441\u0451, \u0447\u0442\u043E \u0441\u0432\u044F\u0437\u0430\u043D\u043E \u0441 Premium",
        description: "\u0421\u043A\u0440\u044B\u0432\u0430\u0435\u0442 \u0440\u0435\u043A\u043B\u0430\u043C\u043D\u044B\u0435 \u0431\u0430\u043D\u043D\u0435\u0440\u044B \u043D\u0430\u0434 \u043F\u043B\u0435\u0435\u0440\u043E\u043C, \u043A\u043D\u043E\u043F\u043A\u0438 Premium \u0432 \u0448\u0430\u043F\u043A\u0435, \u043C\u0435\u043D\u044E \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0430 \u0438 \u0441\u0430\u0439\u0434\u0431\u0430\u0440\u0435",
        isEnabled: isHidePremiumEnabled,
        setEnabled: setHidePremiumEnabled
      },
      {
        id: "hide-chat",
        iconSvg: `
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 10a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 14.286V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          <path d="M20 9a2 2 0 0 1 2 2v10.286a.71.71 0 0 1-1.212.502l-2.202-2.202A2 2 0 0 0 17.172 19H10a2 2 0 0 1-2-2v-1"></path>
          <line x1="2" y1="2" x2="22" y2="22"></line>
        </svg>
      `,
        title: "\u0421\u043A\u0440\u044B\u0442\u044C \u043A\u043D\u043E\u043F\u043A\u0443 \u043E\u0431\u0449\u0435\u0433\u043E \u0447\u0430\u0442\u0430",
        description: "\u0423\u0431\u0438\u0440\u0430\u0435\u0442 \u043F\u043B\u0430\u0432\u0430\u044E\u0449\u0443\u044E \u043A\u0440\u0443\u0433\u043B\u0443\u044E \u043A\u043D\u043E\u043F\u043A\u0443 \u0447\u0430\u0442\u0430 \u0432 \u043F\u0440\u0430\u0432\u043E\u043C \u043D\u0438\u0436\u043D\u0435\u043C \u0443\u0433\u043B\u0443 \u044D\u043A\u0440\u0430\u043D\u0430",
        isEnabled: isHideChatButtonEnabled,
        setEnabled: setHideChatButtonEnabled
      }
    ];
    const toggleRowsHtml = toggleOptions.map((opt) => {
      const active = opt.isEnabled();
      return `
      <label id="row-${opt.id}" class="group/row min-h-10 flex items-center justify-between gap-4 cursor-pointer">
        <div class="flex min-w-0 flex-1 items-start gap-3">
          <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-zinc-200 transition-colors duration-150 group-hover/row:text-white" aria-hidden="true">
            ${opt.iconSvg}
          </span>
          <div class="min-w-0 flex-1 pt-px">
            <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span class="text-sm font-medium leading-snug transition-colors duration-150 text-zinc-100 cursor-pointer group-hover/row:text-white">
                ${opt.title}
              </span>
              <span id="badge-${opt.id}" class="inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium ${active ? "bg-emerald-500/15 text-emerald-400" : "bg-zinc-700/40 text-zinc-400"}">
                ${active ? "\u0412\u043A\u043B\u044E\u0447\u0435\u043D\u043E" : "\u0412\u044B\u043A\u043B\u044E\u0447\u0435\u043D\u043E"}
              </span>
            </div>
            <p class="mt-0.5 text-[13px] leading-snug text-zinc-400">
              ${opt.description}
            </p>
          </div>
        </div>

        <!-- Switch Toggle Button -->
        <div class="flex shrink-0 items-center gap-2">
          <button
            type="button"
            role="switch"
            id="switch-${opt.id}"
            aria-checked="${active ? "true" : "false"}"
            data-state="${active ? "checked" : "unchecked"}"
            class="peer inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-white/[0.12] cursor-pointer"
          >
            <span
              data-state="${active ? "checked" : "unchecked"}"
              class="pointer-events-none block h-5 w-5 rounded-full bg-white shadow-md ring-0 transition-transform duration-200 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
            ></span>
          </button>
        </div>
      </label>
    `;
    }).join("");
    container.innerHTML = `
    <!-- Header Card -->
    <section class="rounded-2xl bg-white/[0.025] border border-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] p-5 sm:p-6 space-y-5">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0 text-left">
          <div class="flex items-center gap-2.5">
            <svg class="lucide shrink-0 text-primary h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            <h3 class="font-accent tracking-tight text-white min-w-0 text-[20px] leading-tight md:text-[22px]">
              AnimeOn+
            </h3>
            <span class="inline-flex items-center rounded-md bg-primary/20 px-2 py-0.5 text-xs font-semibold text-[#D4C6FF]">
              v0.1.7
            </span>
            <span class="text-xs text-zinc-500">
              Автор: gogo
            </span>
          </div>
          <p class="mt-2 text-sm leading-relaxed text-zinc-400">
            \u0423\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u0440\u0430\u0441\u0448\u0438\u0440\u0435\u043D\u0438\u0435\u043C, \u0432\u043D\u0435\u0448\u043D\u0438\u043C \u0432\u0438\u0434\u043E\u043C \u0438 \u0434\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u043C\u0438 \u0432\u043E\u0437\u043C\u043E\u0436\u043D\u043E\u0441\u0442\u044F\u043C\u0438
          </p>
        </div>
      </div>

      <div class="divide-y divide-white/[0.06] [&>*]:py-4 [&>*:first-child]:pt-0 [&>*:last-child]:pb-0 border-t border-white/[0.06] pt-5">
        ${toggleRowsHtml}

        <!-- Placeholder: Player Improvements -->
        <div class="group/row min-h-10 flex items-center justify-between gap-4">
          <div class="flex min-w-0 flex-1 items-start gap-3">
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-zinc-200" aria-hidden="true">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polygon points="10 8 16 12 10 16 10 8"></polygon>
              </svg>
            </span>
            <div class="min-w-0 flex-1 pt-px">
              <div class="flex items-center gap-x-2">
                <span class="text-sm font-medium leading-snug text-zinc-100">\u0423\u043B\u0443\u0447\u0448\u0435\u043D\u0438\u044F \u043F\u043B\u0435\u0435\u0440\u0430</span>
                <span class="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">\u0421\u043A\u043E\u0440\u043E</span>
              </div>
              <p class="mt-0.5 text-[13px] leading-snug text-zinc-400">
                \u0413\u043E\u0440\u044F\u0447\u0438\u0435 \u043A\u043B\u0430\u0432\u0438\u0448\u0438, \u0430\u0432\u0442\u043E\u043F\u0440\u043E\u043F\u0443\u0441\u043A \u043E\u043F\u0435\u043D\u0438\u043D\u0433\u043E\u0432 \u0438 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u0435 \u043D\u0430\u0441\u0442\u0440\u043E\u0435\u043A
              </p>
            </div>
          </div>
          <div class="flex shrink-0 items-center gap-2">
            <span class="text-xs text-zinc-500">\u0412 \u0440\u0430\u0437\u0440\u0430\u0431\u043E\u0442\u043A\u0435</span>
          </div>
        </div>

      </div>
    </section>
  `;
    toggleOptions.forEach((opt) => {
      const row = container.querySelector(`#row-${opt.id}`);
      const switchBtn = container.querySelector(`#switch-${opt.id}`);
      const badge = container.querySelector(`#badge-${opt.id}`);
      row?.addEventListener("click", (e) => {
        e.preventDefault();
        const currentState = switchBtn?.getAttribute("data-state") === "checked";
        const newState = !currentState;
        opt.setEnabled(newState);
        if (switchBtn) {
          switchBtn.setAttribute("aria-checked", newState ? "true" : "false");
          switchBtn.setAttribute("data-state", newState ? "checked" : "unchecked");
          const thumb = switchBtn.querySelector("span");
          if (thumb) {
            thumb.setAttribute("data-state", newState ? "checked" : "unchecked");
          }
        }
        if (badge) {
          badge.textContent = newState ? "\u0412\u043A\u043B\u044E\u0447\u0435\u043D\u043E" : "\u0412\u044B\u043A\u043B\u044E\u0447\u0435\u043D\u043E";
          badge.className = `inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium ${newState ? "bg-emerald-500/15 text-emerald-400" : "bg-zinc-700/40 text-zinc-400"}`;
        }
      });
    });
    return container;
  }

  // src/modules/settings/index.ts
  var isPlusActive = false;
  var plusViewEl = null;
  var observer3 = null;
  function isSettingsPage() {
    return window.location.pathname === "/settings";
  }
  function getActiveTabParam() {
    const url = new URL(window.location.href);
    return url.searchParams.get("tab");
  }
  function handleTabClick() {
    router.navigateToPlusTab();
    setActiveState(true);
  }
  function setActiveState(active) {
    isPlusActive = active;
    updateButtonState(active);
    const mainEl = document.querySelector("main");
    if (!mainEl) return;
    const nativeContent = mainEl.querySelector(":scope > div:not(#animeon-plus-settings-container)");
    if (active) {
      if (nativeContent) {
        nativeContent.style.display = "none";
      }
      if (!plusViewEl || !mainEl.contains(plusViewEl)) {
        plusViewEl = createAnimeonPlusView();
        mainEl.appendChild(plusViewEl);
      } else {
        plusViewEl.style.display = "block";
      }
    } else {
      if (plusViewEl) {
        plusViewEl.style.display = "none";
      }
      if (nativeContent) {
        nativeContent.style.display = "";
      }
    }
  }
  function injectDesktopButton() {
    if (document.getElementById("animeon-plus-tab-desktop")) return;
    const navContainer = document.querySelector('nav[aria-label="\u0420\u0430\u0437\u0434\u0435\u043B\u044B \u043D\u0430\u0441\u0442\u0440\u043E\u0435\u043A"].md\\:flex, div.flex.items-start > nav');
    if (!navContainer) return;
    const buttonsContainer = navContainer.querySelector(".flex.flex-col.gap-0\\.5");
    if (!buttonsContainer) return;
    const buttons = Array.from(buttonsContainer.querySelectorAll("button"));
    const profileBtn = buttons.find((b) => b.textContent?.includes("\u041F\u0440\u043E\u0444\u0438\u043B\u044C"));
    if (profileBtn) {
      const desktopBtn = createDesktopButton(handleTabClick);
      profileBtn.insertAdjacentElement("afterend", desktopBtn);
      buttons.forEach((btn) => {
        if (btn.dataset.plusHooked) return;
        btn.dataset.plusHooked = "true";
        btn.addEventListener("click", () => {
          setActiveState(false);
          if (btn.textContent?.includes("\u041F\u0440\u043E\u0444\u0438\u043B\u044C")) {
            router.exitPlusTab("profile");
          }
        });
      });
    }
  }
  function injectMobileButton() {
    if (document.getElementById("animeon-plus-tab-mobile")) return;
    const mobileNav = document.querySelector('div.md\\:hidden nav[aria-label="\u0420\u0430\u0437\u0434\u0435\u043B\u044B \u043D\u0430\u0441\u0442\u0440\u043E\u0435\u043A"]');
    if (!mobileNav) return;
    const buttons = Array.from(mobileNav.querySelectorAll("button"));
    const profileBtn = buttons.find((b) => b.textContent?.includes("\u041F\u0440\u043E\u0444\u0438\u043B\u044C"));
    if (profileBtn) {
      const mobileBtn = createMobileButton(handleTabClick);
      profileBtn.insertAdjacentElement("afterend", mobileBtn);
      buttons.forEach((btn) => {
        if (btn.dataset.plusHooked) return;
        btn.dataset.plusHooked = "true";
        btn.addEventListener("click", () => {
          setActiveState(false);
          if (btn.textContent?.includes("\u041F\u0440\u043E\u0444\u0438\u043B\u044C")) {
            router.exitPlusTab("profile");
          }
        });
      });
    }
  }
  function syncState() {
    if (!isSettingsPage()) {
      if (isPlusActive) {
        setActiveState(false);
      }
      return;
    }
    injectDesktopButton();
    injectMobileButton();
    const tab = getActiveTabParam();
    const shouldBeActive = tab === "plus" || router.isPlusTabRequested;
    if (shouldBeActive !== isPlusActive) {
      setActiveState(shouldBeActive);
    } else {
      updateButtonState(isPlusActive);
      if (isPlusActive) {
        const mainEl = document.querySelector("main");
        const plusContainer = document.getElementById("animeon-plus-settings-container");
        const nativeContent = mainEl?.querySelector(":scope > div:not(#animeon-plus-settings-container)");
        if (mainEl && (!plusContainer || !mainEl.contains(plusContainer) || nativeContent?.style.display !== "none")) {
          setActiveState(true);
        }
      }
    }
  }
  var settingsModule = {
    id: "settings-plus",
    name: "AnimeonPlus Settings",
    description: "\u0412\u043A\u043B\u0430\u0434\u043A\u0430 AnimeonPlus \u0432 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0430\u0445",
    init() {
      syncState();
      router.onRouteChange(() => {
        syncState();
      });
      observer3 = new MutationObserver(() => {
        if (isSettingsPage()) {
          const desktopInjected = document.getElementById("animeon-plus-tab-desktop");
          const mobileInjected = document.getElementById("animeon-plus-tab-mobile");
          const mainEl = document.querySelector("main");
          const plusContainer = document.getElementById("animeon-plus-settings-container");
          const shouldBeActive = getActiveTabParam() === "plus" || router.isPlusTabRequested;
          if (!desktopInjected || !mobileInjected || shouldBeActive && (!plusContainer || !mainEl?.contains(plusContainer))) {
            syncState();
          }
        }
      });
      observer3.observe(document.body || document.documentElement, {
        childList: true,
        subtree: true
      });
    },
    destroy() {
      if (observer3) {
        observer3.disconnect();
        observer3 = null;
      }
      const dBtn = document.getElementById("animeon-plus-tab-desktop");
      if (dBtn) dBtn.remove();
      const mBtn = document.getElementById("animeon-plus-tab-mobile");
      if (mBtn) mBtn.remove();
      if (plusViewEl) {
        plusViewEl.remove();
        plusViewEl = null;
      }
    }
  };

  // src/index.ts
  var modules = [
    hidePremiumModule,
    autoClaimModule,
    chatModule,
    quickRoomModule,
    homepageCleanerModule,
    { name: "4× Playback Speed", init: initPlaybackSpeed },
    settingsModule
  ];
  function bootstrap() {
    console.log("[AnimeOn+] Initializing modules...");
    for (const mod of modules) {
      try {
        mod.init();
        console.log(`[AnimeOn+] Module "${mod.name}" initialized.`);
      } catch (err) {
        console.error(`[AnimeOn+] Failed to initialize module "${mod.name}":`, err);
      }
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap);
  } else {
    bootstrap();
  }
})();
