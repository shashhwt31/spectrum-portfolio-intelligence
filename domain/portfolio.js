/** Reconstructs positions by account and instrument without merging broker accounts. */
export function reconstructPositions(transactions) {
  const positions=new Map();
  for(const transaction of [...transactions].sort((a,b)=>new Date(a.occurredAt)-new Date(b.occurredAt))){
    const key=`${transaction.accountId}:${transaction.instrumentId}`;
    const current=positions.get(key)||{accountId:transaction.accountId,instrumentId:transaction.instrumentId,quantity:0,cost:0,confidence:1,assumptions:[]};
    const quantity=Number(transaction.quantity), price=Number(transaction.price||0), fees=Number(transaction.fees||0);
    if(['BUY','TRANSFER_IN','CORPORATE_ACTION'].includes(transaction.type)){current.quantity+=quantity;current.cost+=quantity*price+fees}
    else if(['SELL','TRANSFER_OUT'].includes(transaction.type)){const costPerUnit=current.quantity?current.cost/current.quantity:0;current.quantity-=quantity;current.cost-=quantity*costPerUnit; if(current.quantity<0){current.assumptions.push('Transaction history begins after an existing position.');current.confidence=Math.min(current.confidence,.5)}}
    else {current.assumptions.push(`Ignored unsupported transaction type: ${transaction.type}.`);current.confidence=Math.min(current.confidence,.75)}
    current.confidence=Math.min(current.confidence,Number(transaction.confidence??1));
    positions.set(key,current);
  }
  return [...positions.values()].filter(position=>position.quantity!==0).map(position=>({...position,averageCost:position.quantity?position.cost/position.quantity:0}));
}

/** Returns only likely duplicate imports; equal instruments across accounts stay distinct. */
export function findDuplicateCandidates(positions) {
  const candidates=[];
  for(let i=0;i<positions.length;i++)for(let j=i+1;j<positions.length;j++){
    const a=positions[i],b=positions[j];
    if(a.accountId!==b.accountId)continue;
    const sameInstrument=Boolean(a.isin&&b.isin&&a.isin===b.isin)||Boolean(a.schemeCode&&b.schemeCode&&a.schemeCode===b.schemeCode);
    const sameValue=Math.abs(Number(a.value||0)-Number(b.value||0))<1;
    const sameQuantity=Math.abs(Number(a.quantity||0)-Number(b.quantity||0))<.0001;
    if(sameInstrument&&(sameValue||sameQuantity))candidates.push({leftId:a.id,rightId:b.id,confidence:sameValue&&sameQuantity?1:.8,reason:'Same account and stable instrument identifier; matching position value or quantity.'});
  }
  return candidates;
}
