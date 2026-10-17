import {createRequire} from 'node:module';
const require=createRequire(new URL('../../../.worktrees/start-slice-001/package.json',import.meta.url));
export const {Pool}=require('pg');
export const {z}=require('zod');
