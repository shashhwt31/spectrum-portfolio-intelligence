import test from 'node:test';
import assert from 'node:assert/strict';
import {searchFunds} from '../fund_catalog.js';

test('fund search finds real UTI Nifty scheme identifiers',()=>{
 const results=searchFunds('uti nifty');
 assert.ok(results.length>=5);
 assert.ok(results.some(result=>result.name==='UTI Nifty 50 Index Fund - Direct Plan - Growth Option'));
});
test('fund search requires every entered term',()=>{
 assert.equal(searchFunds('uti nonexistent').length,0);
});
