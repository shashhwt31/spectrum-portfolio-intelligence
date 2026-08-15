import test from 'node:test'; import assert from 'node:assert/strict'; import {holdings,analyze,scenario} from '../analytics.js';
test('analytics totals holdings and returns an explainable bounded score',()=>{const r=analyze();assert.equal(r.total,1040100);assert.ok(r.score>=0&&r.score<=100);assert.equal(r.components.length,10)});
test('scenario changes total by proposed contribution',()=>{const before=analyze(), after=scenario(holdings,25000,'intl');assert.equal(after.total,before.total+25000)});
test('asset allocations sum to 100',()=>{const total=analyze().asset.reduce((s,x)=>s+x.pct,0);assert.ok(Math.abs(total-100)<.00001)});
