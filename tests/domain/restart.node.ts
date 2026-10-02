import {test} from 'node:test';
import assert from 'node:assert/strict';
import {assertRestarted} from '../../tooling/verification/restart.ts';
test('a native PG Date and its saved ISO string cannot impersonate a restart',()=>{
 const instant='2026-10-02T11:53:27.858Z';assert.throws(()=>assertRestarted(instant,new Date(instant)),/actually restart/);
 assertRestarted('2026-10-02T10:14:02.554Z',new Date(instant));
});
