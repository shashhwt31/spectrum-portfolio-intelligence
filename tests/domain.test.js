import test from 'node:test';
import assert from 'node:assert/strict';
import {findDuplicateCandidates,reconstructPositions} from '../domain/portfolio.js';

test('reconstructs an account position from buys and sells',()=>{
 const positions=reconstructPositions([{accountId:'a',instrumentId:'i',type:'BUY',quantity:10,price:100,fees:10,occurredAt:'2026-01-01'},{accountId:'a',instrumentId:'i',type:'SELL',quantity:4,price:110,occurredAt:'2026-02-01'}]);
 assert.equal(positions[0].quantity,6);assert.equal(positions[0].averageCost,101);
});
test('does not mark equivalent holdings in different broker accounts as duplicates',()=>{
 const candidates=findDuplicateCandidates([{id:'one',accountId:'a',isin:'INFY',quantity:2,value:100},{id:'two',accountId:'b',isin:'INFY',quantity:2,value:100}]);
 assert.equal(candidates.length,0);
});
test('marks only likely same-account repeated positions with confidence',()=>{
 const candidates=findDuplicateCandidates([{id:'one',accountId:'a',isin:'INFY',quantity:2,value:100},{id:'two',accountId:'a',isin:'INFY',quantity:2,value:100}]);
 assert.equal(candidates[0].confidence,1);
});
