/** Public GitHub metadata only. Shared by snapshot refresh, build and tests. */
export const PROJECT_OWNER = 'Mahoo12138';
export const DEFAULT_WINDOW_DAYS = 90;
const day = 86_400_000;
const namePattern = /^[A-Za-z0-9_.-]+$/;

// 展示规则独立于 GitHub 原始快照：重新同步不会恢复用户移除的项目。
export const PROJECT_EXCLUSIONS = Object.freeze([
  'Mahoo12138/Mahoo12138',
  'Mahoo12138/AI-Interviewer',
]);
const excludedRepositories = new Set(PROJECT_EXCLUSIONS.map(name => name.toLowerCase()));

/**
 * @template {{ fullName: string }} T
 * @param {T[]} repositories
 * @returns {T[]}
 */
export function selectProjectRepositories(repositories) {
  return repositories.filter(repo => !excludedRepositories.has(repo.fullName.toLowerCase()));
}


function requireValue(condition, message) {
  if (!condition) throw new Error(`Project data: ${message}`);
}
function timestamp(value) {
  requireValue(typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value)), 'invalid timestamp');
  return Date.parse(value);
}
/** Never turn a repository homepage into a script, credential URL or local-network link. */
export function safeHomepage(value) {
  if (!value || typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    if (url.protocol !== 'https:' || url.username || url.password || !host.includes('.') || host.endsWith('.local') || host.endsWith('.localhost') || host.endsWith('.internal') || /^[\d.]+$/.test(host) || host.includes(':')) return null;
    return url.href;
  } catch { return null; }
}

/** API pushed_at is a repository push time, not a release or personal contribution metric. */
export function createProjectsSnapshot(repos, fetchedAt, windowDays = DEFAULT_WINDOW_DAYS) {
  requireValue(Array.isArray(repos), 'repository response must be an array');
  requireValue(Number.isInteger(windowDays) && windowDays >= 1 && windowDays <= 366, 'window must be 1–366 days');
  const end = timestamp(fetchedAt);
  const since = new Date(end - windowDays * day).toISOString();
  const found = new Set();
  const repositories = [];
  for (const repo of repos) {
    // Explicit public markers are required even when a caller supplies authenticated data.
    if (repo.private !== false || repo.visibility !== 'public' || repo.owner?.login?.toLowerCase() !== PROJECT_OWNER.toLowerCase()) continue;
    requireValue(typeof repo.name === 'string' && namePattern.test(repo.name), 'invalid repository name');
    const key = repo.name.toLowerCase();
    requireValue(!found.has(key), `duplicate repository: ${repo.name}`);
    found.add(key);
    if (!repo.pushed_at || timestamp(repo.pushed_at) < Date.parse(since) || timestamp(repo.pushed_at) > end) continue;
    requireValue(repo.full_name.toLowerCase() === `${PROJECT_OWNER}/${repo.name}`.toLowerCase(), 'owner/name mismatch');
    requireValue(repo.html_url === `https://github.com/${repo.full_name}`, 'unexpected repository URL');
    repositories.push({
      name: repo.name,
      fullName: repo.full_name,
      url: repo.html_url,
      description: typeof repo.description === 'string' ? repo.description.trim() : '',
      language: typeof repo.language === 'string' ? repo.language : null,
      pushedAt: repo.pushed_at,
      homepage: safeHomepage(repo.homepage),
      fork: repo.fork === true,
      archived: repo.archived === true,
      visibility: 'public',
    });
  }
  repositories.sort((a, b) => b.pushedAt.localeCompare(a.pushedAt) || a.fullName.localeCompare(b.fullName, 'en'));
  return { schemaVersion: 1, owner: PROJECT_OWNER, windowDays, since, fetchedAt, repositories };
}

/** Fail the build instead of silently displaying malformed/stale privacy metadata. */
export function validateProjectsSnapshot(snapshot) {
  requireValue(snapshot?.schemaVersion === 1 && snapshot.owner === PROJECT_OWNER, 'unsupported snapshot');
  const end = timestamp(snapshot.fetchedAt), start = timestamp(snapshot.since);
  requireValue(Number.isInteger(snapshot.windowDays) && snapshot.windowDays >= 1 && snapshot.windowDays <= 366, 'invalid window');
  requireValue(end - start === snapshot.windowDays * day, 'date window mismatch');
  requireValue(Array.isArray(snapshot.repositories), 'missing repository list');
  const names = new Set();
  for (const repo of snapshot.repositories) {
    requireValue(typeof repo.name === 'string' && namePattern.test(repo.name), 'invalid repository name');
    requireValue(repo.visibility === 'public', `not public: ${repo.name}`);
    requireValue(typeof repo.fullName === 'string' && repo.fullName.toLowerCase() === `${PROJECT_OWNER}/${repo.name}`.toLowerCase(), 'owner mismatch');
    requireValue(repo.url === `https://github.com/${repo.fullName}`, 'unexpected repository URL');
    requireValue(!names.has(repo.name.toLowerCase()), 'duplicate repository');
    names.add(repo.name.toLowerCase());
    requireValue(typeof repo.description === 'string' && (repo.language === null || typeof repo.language === 'string'), 'invalid text fields');
    requireValue(typeof repo.fork === 'boolean' && typeof repo.archived === 'boolean', 'invalid repository flags');
    requireValue(repo.homepage === null || safeHomepage(repo.homepage) === repo.homepage, 'unsafe homepage');
    requireValue(timestamp(repo.pushedAt) >= start && timestamp(repo.pushedAt) <= end, 'push outside snapshot window');
  }
  return snapshot;
}
