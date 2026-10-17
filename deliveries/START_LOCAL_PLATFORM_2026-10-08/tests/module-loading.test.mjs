import test from 'node:test';
import assert from 'node:assert/strict';
import {serveStatic} from '../src/static.mjs';

test('every browser module import is served at its resolved URL', async () => {
  const pending = [new URL('http://localhost/app/public.js')], visited = new Set();
  while (pending.length) {
    const url = pending.shift();
    if (visited.has(url.href)) continue;
    visited.add(url.href);
    let body, status, headers;
    const served = await serveStatic({method:'GET'}, {
      writeHead(code, values) { status=code; headers=values; },
      end(bytes) { body=String(bytes); },
    }, url);
    assert.equal(served,true,`Missing browser module: ${url.pathname}`);
    assert.equal(status,200);
    assert.match(headers['content-type'],/javascript/);
    for (const match of body.matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)) {
      pending.push(new URL(match[1],url));
    }
  }
  assert.ok(visited.size>=3,'entry point, client and private views must all load');
});
