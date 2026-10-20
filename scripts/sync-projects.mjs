import { readFile, writeFile, rename, unlink } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { PROJECT_OWNER, DEFAULT_WINDOW_DAYS, createProjectsSnapshot, validateProjectsSnapshot } from '../src/utils/project-data.mjs';

/** This unauthenticated endpoint returns public repositories only. Fetch every page. */
export async function fetchPublicRepositories(fetchImpl = fetch) {
  const repositories = [];
  for (let page = 1; page <= 20; page += 1) {
    const url = `https://api.github.com/users/${PROJECT_OWNER}/repos?type=owner&sort=pushed&direction=desc&per_page=100&page=${page}`;
    const response = await fetchImpl(url, {
      headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'Mahoo-Space-Projects', 'X-GitHub-Api-Version': '2026-03-10' },
      signal: AbortSignal.timeout(20_000),
      redirect: 'error',
    });
    if (!response.ok) throw new Error(`GitHub HTTP ${response.status}; existing snapshot was not changed.`);
    const batch = await response.json();
    if (!Array.isArray(batch)) throw new Error('Invalid GitHub response; existing snapshot was not changed.');
    repositories.push(...batch);
    if (batch.length < 100) return repositories;
  }
  throw new Error('Pagination limit reached; refuse to save a partial repository list.');
}

/** Compare before replacing so a refresh cannot overwrite concurrent manual edits. */
export async function refreshProjects({ destination = new URL('../src/data/projects.json', import.meta.url), fetchImpl = fetch, windowDays = DEFAULT_WINDOW_DAYS, now = () => new Date() } = {}) {
  let previous = null;
  try { previous = await readFile(destination, 'utf8'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const repos = await fetchPublicRepositories(fetchImpl);
  const snapshot = validateProjectsSnapshot(createProjectsSnapshot(repos, now().toISOString(), windowDays));
  // A sudden empty result is more likely a scope/API problem than an intentional removal.
  if (snapshot.repositories.length === 0) throw new Error('No recent public repositories; retain current snapshot for review.');
  let current = null;
  try { current = await readFile(destination, 'utf8'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (current !== previous) throw new Error('Snapshot changed during refresh; resolve the concurrent edit first.');
  const temp = new URL(`./.projects-${randomUUID()}.json`, destination instanceof URL ? destination : pathToFileURL(destination));
  try {
    await writeFile(temp, JSON.stringify(snapshot, null, 2) + '\n', { flag: 'wx' });
    await rename(temp, destination);
  } finally { await unlink(temp).catch(error => { if (error.code !== 'ENOENT') throw error; }); }
  return snapshot;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const args = process.argv.slice(2);
    if (args.some(arg => !/^--days=\d+$/.test(arg)) || args.length > 1) throw new Error('Usage: pnpm projects:sync [--days=90]');
    const windowDays = args.length ? Number(args[0].split('=')[1]) : DEFAULT_WINDOW_DAYS;
    const snapshot = await refreshProjects({ windowDays });
    console.log(`Saved ${snapshot.repositories.length} public repositories (${windowDays} days), as of ${snapshot.fetchedAt}. Review the diff before publishing.`);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
