const QUERY_HISTORY_KEY = "salesAnalyticsAI.queryHistory.v1";
const SAVED_ANALYSES_KEY = "salesAnalyticsAI.savedAnalyses.v1";
const MAX_HISTORY_ITEMS = 50;
const MAX_SAVED_ITEMS = 50;

function normalizeQueryText(query) {
  return String(query || "").trim().replace(/\s+/g, " ").toLowerCase();
}

function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    if (!("localStorage" in window)) {
      return null;
    }

    const storage = window.localStorage;
    const probeKey = "__salesAnalyticsAI_probe__";
    storage.setItem(probeKey, "1");
    storage.removeItem(probeKey);
    return storage;
  } catch (error) {
    return null;
  }
}

function parseStoredArray(key) {
  const storage = getStorage();

  if (!storage) {
    return [];
  }

  try {
    const rawValue = storage.getItem(key);

    if (!rawValue) {
      return [];
    }

    const parsed = JSON.parse(rawValue);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch (error) {
    return [];
  }
}

function writeStoredArray(key, value) {
  const storage = getStorage();

  if (!storage) {
    return false;
  }

  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    return false;
  }
}

function isValidHistoryItem(item) {
  return (
    item &&
    typeof item === "object" &&
    typeof item.id === "string" &&
    typeof item.query === "string" &&
    item.query.trim().length > 0 &&
    typeof item.createdAt === "string"
  );
}

function isValidSavedItem(item) {
  return (
    item &&
    typeof item === "object" &&
    typeof item.id === "string" &&
    typeof item.query === "string" &&
    item.query.trim().length > 0 &&
    typeof item.savedAt === "string"
  );
}

function buildId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `item-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getQueryHistory() {
  const items = parseStoredArray(QUERY_HISTORY_KEY)
    .filter(isValidHistoryItem)
    .map((item) => ({
      id: item.id,
      query: item.query.trim().replace(/\s+/g, " "),
      createdAt: item.createdAt,
    }));

  return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function addQueryToHistory(query) {
  const trimmedQuery = String(query || "").trim().replace(/\s+/g, " ");

  if (!trimmedQuery) {
    return getQueryHistory();
  }

  const normalizedQuery = normalizeQueryText(trimmedQuery);
  const currentHistory = getQueryHistory();
  const filteredHistory = currentHistory.filter(
    (entry) => normalizeQueryText(entry.query) !== normalizedQuery
  );

  const nextEntry = {
    id: buildId(),
    query: trimmedQuery,
    createdAt: new Date().toISOString(),
  };

  const nextHistory = [nextEntry, ...filteredHistory].slice(0, MAX_HISTORY_ITEMS);
  writeStoredArray(QUERY_HISTORY_KEY, nextHistory);

  return nextHistory;
}

export function deleteHistoryItem(id) {
  const nextHistory = getQueryHistory().filter((entry) => entry.id !== id);
  writeStoredArray(QUERY_HISTORY_KEY, nextHistory);
  return nextHistory;
}

export function clearQueryHistory() {
  const storage = getStorage();

  if (!storage) {
    return [];
  }

  try {
    storage.removeItem(QUERY_HISTORY_KEY);
  } catch (error) {
    // Ignore storage failures gracefully.
  }

  return [];
}

export function getSavedAnalyses() {
  const items = parseStoredArray(SAVED_ANALYSES_KEY)
    .filter(isValidSavedItem)
    .map((item) => ({
      id: item.id,
      query: item.query.trim().replace(/\s+/g, " "),
      savedAt: item.savedAt,
    }));

  return items.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
}

export function saveAnalysis(query) {
  const trimmedQuery = String(query || "").trim().replace(/\s+/g, " ");

  if (!trimmedQuery) {
    return getSavedAnalyses();
  }

  const normalizedQuery = normalizeQueryText(trimmedQuery);
  const currentSaved = getSavedAnalyses();

  const existing = currentSaved.find(
    (entry) => normalizeQueryText(entry.query) === normalizedQuery
  );

  if (existing) {
    return currentSaved;
  }

  const nextEntry = {
    id: buildId(),
    query: trimmedQuery,
    savedAt: new Date().toISOString(),
  };

  const nextSaved = [nextEntry, ...currentSaved].slice(0, MAX_SAVED_ITEMS);
  writeStoredArray(SAVED_ANALYSES_KEY, nextSaved);

  return nextSaved;
}

export function removeSavedAnalysis(id) {
  const nextSaved = getSavedAnalyses().filter((entry) => entry.id !== id);
  writeStoredArray(SAVED_ANALYSES_KEY, nextSaved);
  return nextSaved;
}

export function isQuerySaved(query, savedAnalyses = []) {
  const normalizedQuery = normalizeQueryText(query);
  return savedAnalyses.some(
    (entry) => normalizeQueryText(entry.query) === normalizedQuery
  );
}

export { QUERY_HISTORY_KEY, SAVED_ANALYSES_KEY, MAX_HISTORY_ITEMS, MAX_SAVED_ITEMS };
