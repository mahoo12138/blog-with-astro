import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createProjectsSnapshot, validateProjectsSnapshot, safeHomepage, selectProjectRepositories } from '../../src/utils/project-data.mjs';
import { fetchPublicRepositories, refreshProjects } from '../sync-projects.mjs';

const now = '2026-10-20T00:00:00.000Z';
const repo = (name = 'example', overrides = {}) => ({ name, full_name: `Mahoo12138/${name}`, html_url: `https://github.com/Mahoo12138/${name}`, owner: { login: 'Mahoo12138' }, private: false, visibility: 'public', fork: false, archived: false, pushed_at: '2026-10-19T00:00:00Z', description: null, language: null, homepage: null, ...overrides });
const response = data => ({ ok: true, status: 200, json: async () => data });

async function fixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), 'projects-sync-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const destination = path.join(root, 'projects.json');
  await writeFile(destination, 'existing snapshot');
  return { root, destination };
}

test('only explicit public owned repositories are ever exported; fork identity is retained', () => {
  const snapshot = createProjectsSnapshot([repo(), repo('fork', { fork: true }), repo('private', { private: true }), repo('unknown', { visibility: undefined }), repo('other', { owner: { login: 'other' } })], now);
  assert.deepEqual(snapshot.repositories.map(r => r.name), ['example', 'fork']);
  assert.equal(snapshot.repositories[1].fork, true);
  assert.equal(snapshot.repositories[0].description, '');
  assert.equal(snapshot.repositories[0].language, null);
  assert.equal(validateProjectsSnapshot(snapshot), snapshot);
});

test('window includes exact boundary, excludes old/future timestamps, sorts latest push first', () => {
  const since = new Date(Date.parse(now) - 90 * 86_400_000).toISOString();
  const snapshot = createProjectsSnapshot([repo('boundary', { pushed_at: since }), repo('recent'), repo('old', { pushed_at: new Date(Date.parse(since) - 1).toISOString() }), repo('future', { pushed_at: '2027-01-01T00:00:00Z' })], now);
  assert.deepEqual(snapshot.repositories.map(r => r.name), ['recent', 'boundary']);
  assert.equal(snapshot.since, since);
});

test('duplicate names, invalid metadata and malformed snapshot fail instead of being hidden', () => {
  assert.throws(() => createProjectsSnapshot([repo('A'), repo('a')], now), /duplicate/);
  assert.throws(() => createProjectsSnapshot([repo('../bad')], now), /name/);
  assert.throws(() => createProjectsSnapshot([repo('bad', { html_url: 'javascript:alert(1)' })], now), /URL/);
  assert.throws(() => createProjectsSnapshot([repo()], now, 0), /window/);
  for (const windowDays of [NaN, 367, 1.5]) assert.throws(() => createProjectsSnapshot([], now, windowDays), /window/);
  const snapshot = createProjectsSnapshot([repo()], now);
  assert.throws(() => validateProjectsSnapshot({ ...snapshot, since: now }), /window/);
  snapshot.repositories[0].visibility = 'private';
  assert.throws(() => validateProjectsSnapshot(snapshot), /not public/);
});

test('homepage URLs cannot contain active schemes, embedded credentials or local addresses', () => {
  for (const value of ['javascript:alert(1)', '//example.com', 'data:text/html,x', 'http://example.com', 'https://user:password@example.com', 'https://localhost', 'https://127.0.0.1', 'https://[::1]', 'https://router.local', 'not a URL']) assert.equal(safeHomepage(value), null, value);
  assert.equal(safeHomepage('https://example.com/projects'), 'https://example.com/projects');
  assert.equal(safeHomepage('https://example.com'), 'https://example.com/');
});

test('API pagination consumes every page with no Authorization header', async () => {
  const calls = [];
  const repos = await fetchPublicRepositories(async (url, options) => {
    calls.push(url);
    assert.equal(options.headers.Authorization, undefined);
    return response(calls.length === 1 ? Array.from({ length: 100 }, (_, i) => repo(`p${i}`)) : [repo('last')]);
  });
  assert.equal(repos.length, 101);
  assert.match(calls[1], /page=2$/);
});

test('pagination limit and rate limiting never produce a partial success', async () => {
  await assert.rejects(fetchPublicRepositories(async () => ({ ok: false, status: 403 })), /403/);
  await assert.rejects(fetchPublicRepositories(async () => response({ message: 'bad' })), /Invalid/);
  await assert.rejects(fetchPublicRepositories(async () => response(Array.from({ length: 100 }, () => repo()))), /Pagination/);
});

test('successful sync saves only normalized metadata and leaves no temporary files', async t => {
  const { root, destination } = await fixture(t);
  const snapshot = await refreshProjects({ destination, fetchImpl: async () => response([repo('public', { secret: 'must-not-export', permissions: { admin: true } })]), now: () => new Date(now) });
  const text = await readFile(destination, 'utf8');
  assert.equal(snapshot.repositories.length, 1);
  assert.doesNotMatch(text, /secret|permissions|must-not-export/);
  assert.equal(JSON.parse(text).fetchedAt, now);
  assert.deepEqual(await readdir(root), ['projects.json']);
});

test('network, malformed data, empty results or second-page failures keep existing snapshot', async t => {
  const { root, destination } = await fixture(t);
  const failures = [async () => { throw new Error('timeout'); }, async () => ({ ok: false, status: 429 }), async () => response([]), async () => response([repo('x'), repo('x')])];
  let n = 0;
  failures.push(async () => ++n === 1 ? response(Array.from({ length: 100 }, (_, i) => repo(`p${i}`))) : { ok: false, status: 500 });
  for (const fetchImpl of failures) {
    await assert.rejects(refreshProjects({ destination, fetchImpl, now: () => new Date(now) }));
    assert.equal(await readFile(destination, 'utf8'), 'existing snapshot');
    assert.deepEqual(await readdir(root), ['projects.json']);
  }
});

test('manual snapshot edit during an API request is not overwritten', async t => {
  const { destination } = await fixture(t);
  await assert.rejects(refreshProjects({ destination, now: () => new Date(now), fetchImpl: async () => {
    await writeFile(destination, 'manual edit');
    return response([repo()]);
  } }), /concurrent edit/);
  assert.equal(await readFile(destination, 'utf8'), 'manual edit');
});

test('display exclusions are case-insensitive exact repository identities, not broad name matching', () => {
  const input = [
    { fullName: 'Mahoo12138/Mahoo12138' },
    { fullName: 'mahoo12138/AI-INTERVIEWER' },
    { fullName: 'Mahoo12138/pontis' },
    { fullName: 'Mahoo12138/AI-Interviewer-next' },
    { fullName: 'Mahoo12138/new-project' },
  ];
  const before = structuredClone(input);
  const result = selectProjectRepositories(input);
  assert.deepEqual(result, input.slice(2));
  assert.deepEqual(input, before, 'display selection must not mutate the API snapshot');
  assert.equal(result[0], input[2], 'retained metadata and order must not change');
  assert.deepEqual(selectProjectRepositories([]), []);
  assert.deepEqual(selectProjectRepositories(input.slice(0, 2)), []);
});

test('repeat synchronization cannot make removed projects appear in the display list', async t => {
  const { destination } = await fixture(t);
  for (let attempt = 0; attempt < 2; attempt++) {
    const snapshot = await refreshProjects({ destination, now: () => new Date(now), fetchImpl: async () => response([
      repo('Mahoo12138'), repo('AI-Interviewer', { fork: true }), repo('pontis'), repo('next-tool'),
    ]) });
    validateProjectsSnapshot(snapshot);
    assert.equal(snapshot.repositories.length, 4, 'raw candidate snapshot remains auditable');
    const saved = JSON.parse(await readFile(destination, 'utf8'));
    assert.deepEqual(selectProjectRepositories(saved.repositories).map(r => r.name), ['next-tool', 'pontis']);
  }
});

test('project showcase has no search/filter controller and enables wide layout explicitly', async () => {
  const page = await readFile(new URL('../../src/pages/projects.astro', import.meta.url), 'utf8');
  const config = await readFile(new URL('../../src/config/projects.ts', import.meta.url), 'utf8');
  assert.doesNotMatch(page, /<form\b|<input\b|<select\b|data-project-search|data-project-controls|scripts\/projects/);
  assert.match(page, /contentWidth="wide"/);
  assert.match(page, /rightbar=\{null\}/);
  assert.match(config, /selectProjectRepositories\(snapshotData\.repositories\)/);
  await assert.rejects(readFile(new URL('../../src/scripts/projects.ts', import.meta.url)), { code: 'ENOENT' });
});

test('checked-in snapshot is valid, complete for its recorded window and publicly scoped', async () => {
  const snapshot = JSON.parse(await readFile(new URL('../../src/data/projects.json', import.meta.url), 'utf8'));
  validateProjectsSnapshot(snapshot);
  assert.ok(snapshot.repositories.length > 0);
  for (const r of snapshot.repositories) {
    assert.equal(r.visibility, 'public');
    assert.equal(r.fullName.split('/')[0], 'Mahoo12138');
    assert.deepEqual(Object.keys(r).sort(), ['name', 'fullName', 'url', 'description', 'language', 'pushedAt', 'homepage', 'fork', 'archived', 'visibility'].sort());
  }
});
