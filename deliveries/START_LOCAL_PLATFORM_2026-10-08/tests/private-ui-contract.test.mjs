import test from 'node:test';
import assert from 'node:assert/strict';
import {renderPrivateMe, renderSubmissionForm} from '../public-ui/private-views.mjs';
import fs from 'node:fs';

const publicScript = fs.readFileSync(new URL('../public-ui/public.js', import.meta.url), 'utf8');
const staticScript = fs.readFileSync(new URL('../src/static.mjs', import.meta.url), 'utf8');
const indexHtml = fs.readFileSync(new URL('../public-ui/index.html', import.meta.url), 'utf8');

test('private workspace exposes clear sections and auth boundary', () => {
  const html = renderPrivateMe({
    authError: 'AUTH_NOT_CONFIGURED',
    profile: null,
    memberships: [],
    notifications: [],
    submissions: [],
    exchanges: [],
    listings: [],
    book: [],
    doll: null,
  });
  assert.match(html, /我的工作台/);
  assert.match(html, /我的投稿/);
  assert.match(html, /我的娃娃/);
  assert.match(html, /身份服务尚未接入/);
  assert.match(html, /提交地点或路线/);
});

test('submission form distinguishes place and route and gives labelled fields', () => {
  const place = renderSubmissionForm({kind: 'place', artists: [{id: 'artist-1', name: '安溥'}]});
  const route = renderSubmissionForm({kind: 'route', artists: [{id: 'artist-1', name: '安溥'}]});
  assert.match(place, /提交地点/);
  assert.match(route, /提交路线/);
  assert.match(place, /for="submission-name"/);
  assert.match(place, /地图搜索/);
  assert.match(place, /文字识别/);
  assert.match(route, /站点/);
});

test('private view is wired into the public shell and static allowlist', () => {
  assert.match(publicScript, /private-views\.mjs/);
  assert.match(publicScript, /s\.path==='\/submit'/);
  assert.match(staticScript, /\(css\|mjs\)/);
  assert.match(indexHtml, /private\.css/);
});
