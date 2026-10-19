import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, symlinkSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import { getContentCatalog } from '../../src/content-model/catalog.mjs';
import { resolveContentLink, transformContentLinks, validateContentLinks } from '../../src/content-model/relative-links.mjs';
import { auditContentOutput, inspectHtml } from '../content-output.mjs';

function fixture(t) {
  const root = mkdtempSync(path.join(os.tmpdir(), 'astro-content-test-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const put = (name, body = '', data = '') => {
    const file = path.join(root, 'src/content', name); mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, `---\ntitle: Test\ndate: 2020-01-01\n${data}\n---\n${body}\n`); return file;
  };
  put('columns/alpha/index.md', '# Alpha'); put('columns/alpha/intro.md', '# Intro', 'order: 1');
  put('columns/alpha/next.md', '# Next', 'order: 2'); put('columns/beta/index.md', '# Beta');
  put('columns/beta/intro.md', '# Intro', 'order: 1'); put('posts/note.md', '# Note');
  const graph = (options = {}) => getContentCatalog(root, { fresh: true, legacyIds: {}, ...options });
  return { root, put, graph };
}
function rewrite(text, source, catalog, mdx = false) {
  const parser = unified().use(remarkParse); if (mdx) parser.use(remarkMdx);
  const tree = parser.parse(text); transformContentLinks(tree, source, catalog); return tree;
}
function nodes(tree, type) { return [tree, ...(tree.children ?? []).flatMap(c => nodes(c, type))].filter(n => n.type === type); }

test('namespaced IDs support identical chapter names across columns without changing route slugs', t => {
  const f=fixture(t),g=f.graph(); assert.ok(g.byId.has('posts:alpha/intro'));assert.ok(g.byId.has('posts:beta/intro'));
  assert.equal(g.byId.get('posts:alpha/intro').route,'/columns/alpha/intro/');
});
test('index, sibling, cross-column and standalone links preserve query and encoded fragment', t => {
  const f=fixture(t),g=f.graph(),s=g.byId.get('posts:alpha/intro');
  assert.equal(resolveContentLink('./index.md',s,g),'/columns/alpha/');
  assert.equal(resolveContentLink('./next.md?q=a%26b#%E6%A0%87%E9%A2%98',s,g),'/columns/alpha/next/?q=a%26b#%E6%A0%87%E9%A2%98');
  assert.equal(resolveContentLink('../beta/intro.md',s,g),'/columns/beta/intro/');
  assert.equal(resolveContentLink('../../posts/note.md',s,g),'/post/note/');
  for(const href of ['#local','?q=1','https://example.org/x.md','//example.org','mailto:a@b.test','/columns/alpha/']) assert.equal(resolveContentLink(href,s,g),href);
});
test('references and MDX literal anchors are rewritten; code and expressions remain untouched', t => {
  const f=fixture(t),g=f.graph(),s=g.byId.get('posts:alpha/intro');
  const tree=rewrite('[go][next]\n\n[next]: ./next.md\n\n`[bad](./missing.md)`\n\n```md\n[bad](./missing.md)\n```',s,g);
  assert.equal(nodes(tree,'definition')[0].url,'/columns/alpha/next/'); assert.equal(nodes(tree,'code')[0].value,'[bad](./missing.md)');
  const jsx=rewrite('<a href="./next.md">Next</a>\n\n<a href={target}>Dynamic</a>',s,g,true);
  const anchors=[...nodes(jsx,'mdxJsxFlowElement'),...nodes(jsx,'mdxJsxTextElement')].filter(n=>n.name==='a');
  assert.equal(anchors[0].attributes[0].value,'/columns/alpha/next/');assert.equal(typeof anchors[1].attributes[0].value,'object');
});
test('MDX index and Unicode/space filenames resolve by source path rather than browser path', t => {
  const f=fixture(t);rmSync(path.join(f.root,'src/content/columns/beta/index.md'));f.put('columns/beta/index.mdx','# Beta');
  f.put('columns/beta/学习 笔记.mdx','# Notes','order: 2');const g=f.graph(),s=g.byId.get('posts:alpha/intro');
  assert.equal(resolveContentLink('../beta/index.mdx',s,g),'/columns/beta/');
  assert.equal(resolveContentLink('../beta/%E5%AD%A6%E4%B9%A0%20%E7%AC%94%E8%AE%B0.mdx',s,g),'/columns/beta/%E5%AD%A6%E4%B9%A0-%E7%AC%94%E8%AE%B0/');
});
test('missing index, duplicate index, duplicate URL and duplicate order fail closed', t => {
  for(const change of ['missing','index','url','order']) { const f=fixture(t);
    if(change==='missing')rmSync(path.join(f.root,'src/content/columns/alpha/index.md'));
    if(change==='index')f.put('columns/alpha/index.mdx','# Duplicate');
    if(change==='url')f.put('columns/alpha/intro.mdx','# Duplicate','order: 3');
    if(change==='order')f.put('columns/alpha/other.md','# Duplicate','order: 1');
    assert.throws(()=>f.graph(),/缺少|冲突|重复/);
  }
});
test('path ownership rejects stale frontmatter, nested chapters and missing order', t => {
  for(const change of ['field','nested','order']) {const f=fixture(t);
    if(change==='field')f.put('columns/alpha/intro.md','# Intro','order: 1\ncolumnId: beta');
    if(change==='nested')f.put('columns/alpha/sub/chapter.md','# Sub','order: 3');
    if(change==='order')f.put('columns/alpha/intro.md','# Intro');
    assert.throws(()=>f.graph(),/columnId|嵌套|order/);
  }
});
test('published links to draft chapter, draft column and empty index fail; draft links can target drafts',t=>{
  const f=fixture(t);f.put('columns/alpha/next.md','# Next','order: 2\ndraft: true');f.put('columns/beta/index.md','# Beta','draft: true');f.put('columns/empty/index.md','# Empty');
  const g=f.graph(),s=g.byId.get('posts:alpha/intro');
  for(const href of ['./next.md','../beta/intro.md','../beta/index.md','../empty/index.md'])assert.throws(()=>resolveContentLink(href,s,g),/草稿|空专栏/);
  assert.equal(resolveContentLink('./next.md',{...s,published:false},g),'/columns/alpha/next/');
});
test('missing targets, invalid escapes and project escapes fail; source checker reports file and line',t=>{
  const f=fixture(t);const g=f.graph(),s=g.byId.get('posts:alpha/intro');
  for(const href of ['./missing.md','./missing.png','%ZZ','../../../../../../etc/passwd','../\\secret'])assert.throws(()=>resolveContentLink(href,s,g));
  f.put('columns/alpha/intro.md','[missing](./gone.md)','order: 1');assert.throws(()=>validateContentLinks(f.graph()),/alpha\/intro.md:\d+.*gone.md/);
});
test('local images retain Astro optimization paths; downloads get public asset URLs; symlinks rejected',t=>{
  const f=fixture(t);const dir=path.join(f.root,'src/content/columns/alpha/assets');mkdirSync(dir);
  writeFileSync(path.join(dir,'image.png'),'image');writeFileSync(path.join(dir,'read me.pdf'),'pdf');writeFileSync(path.join(dir,'.env'),'secret');writeFileSync(path.join(dir,'code.js'),'private');
  const g=f.graph(),s=g.byId.get('posts:alpha/intro');
  assert.equal(resolveContentLink('./assets/image.png',s,g,{image:true}),'./assets/image.png');
  const jsx=rewrite('<img src="./assets/image.png" alt="image" />',s,g,true);
  assert.equal(nodes(jsx,'mdxJsxFlowElement')[0].attributes[0].value,'/content-assets/columns/alpha/assets/image.png');
  assert.equal(resolveContentLink('./assets/read%20me.pdf#page=2',s,g),'/content-assets/columns/alpha/assets/read%20me.pdf#page=2');
  assert.throws(()=>resolveContentLink('./assets/.env',s,g));assert.throws(()=>resolveContentLink('./assets/code.js',s,g));
  symlinkSync(path.join(dir,'image.png'),path.join(dir,'linked.png'));assert.throws(()=>f.graph(),/符号链接/);
});
test('legacy alias collision and lost identity fail; old comment redirect keys remain explicit',t=>{
  const f=fixture(t);const g=f.graph({legacyIds:{'alpha/intro':'old-intro'}});assert.equal(g.aliases.get('/post/old-intro/'),'/columns/alpha/intro/');
  assert.throws(()=>f.graph({legacyIds:{'alpha/intro':'note'}}),/冲突/);
  assert.throws(()=>f.graph({legacyIds:{'gone/intro':'old'}}),/不存在/);
});
test('catalog cache changes on target publication updates',t=>{
  const f=fixture(t);const a=getContentCatalog(f.root);f.put('columns/alpha/next.md','# Next','order: 2\ndraft: true');const b=getContentCatalog(f.root);
  assert.notEqual(a.version,b.version);assert.equal(b.byId.get('posts:alpha/next').published,false);
});
test('HTML audit sees relative links and fragments but excludes code samples and JS strings',t=>{
  const f=fixture(t),dist=path.join(f.root,'dist');mkdirSync(path.join(dist,'a'),{recursive:true});mkdirSync(path.join(dist,'b'));
  writeFileSync(path.join(dist,'a/index.html'),'<a href="../b/?q=1#ok">yes</a><pre><a href="./fake.md">code</a></pre><script>const s=\'<a href="fake.md">\'</script>');
  writeFileSync(path.join(dist,'b/index.html'),'<h1 id="ok">B</h1>');
  const minimal={entries:[],aliases:new Map()};assert.deepEqual(auditContentOutput(dist,minimal).failures,[]);
  writeFileSync(path.join(dist,'b/index.html'),'<h1>B</h1><a href="./bad.md">bad</a>');
  const failures=auditContentOutput(dist,minimal).failures;assert.ok(failures.some(f=>f.includes('锚点')));assert.ok(failures.some(f=>f.includes('bad.md')));
  assert.deepEqual(inspectHtml('<pre><a href="x">x</a></pre><a href="a&amp;b">y</a>').links,['a&b']);
});
