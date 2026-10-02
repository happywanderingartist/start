import assert from 'node:assert/strict';
export function assertRestarted(previous:string|Date,current:string|Date) {
  assert.notEqual(new Date(previous).toISOString(),new Date(current).toISOString(),'PostgreSQL must actually restart');
}
