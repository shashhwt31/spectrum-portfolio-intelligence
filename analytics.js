export const holdings = [
  { id:'h1', name:'Nifty 50 ETF', symbol:'NIFTYBEES', type:'ETF', account:'Zerodha', source:'CSV import', value:278400, asset:'Equity', sector:'Multi-sector', geo:'India', issuer:'Nippon India', fee:.05, liquidity:'High', overlap:{HDFC:8,ICICI:7,INFY:5,TCS:4}, updated:'15 Aug 2026, 10:32 IST' },
  { id:'h2', name:'HDFC Bank', symbol:'HDFCBANK', type:'Stock', account:'Zerodha', source:'CSV import', value:142800, asset:'Equity', sector:'Financials', geo:'India', issuer:'HDFC Bank', fee:0, liquidity:'High', overlap:{HDFC:100}, updated:'15 Aug 2026, 10:32 IST' },
  { id:'h3', name:'Infosys', symbol:'INFY', type:'Stock', account:'Groww', source:'Manual entry', value:116200, asset:'Equity', sector:'Information technology', geo:'India', issuer:'Infosys', fee:0, liquidity:'High', overlap:{INFY:100}, updated:'14 Aug 2026, 18:20 IST' },
  { id:'h4', name:'Parag Parikh Flexi Cap', symbol:'PPFCF', type:'Mutual fund', account:'Groww', source:'Manual entry', value:186000, asset:'Equity', sector:'Multi-sector', geo:'India & Global', issuer:'PPFAS', fee:.63, liquidity:'Medium', overlap:{HDFC:5,ICICI:4,INFY:3,TCS:3,GOOGL:5,MSFT:4}, updated:'14 Aug 2026, 18:20 IST' },
  { id:'h5', name:'Bharat Bond ETF Apr 2033', symbol:'EBBETF0433', type:'Bond ETF', account:'Wint Wealth', source:'Statement import', value:164500, asset:'Debt', sector:'Government / PSU', geo:'India', issuer:'Edelweiss', fee:.15, liquidity:'Medium', duration:'6.1 years', quality:'AAA / SDL', overlap:{PSU:100}, updated:'12 Aug 2026, 09:15 IST' },
  { id:'h6', name:'SGB 2.50% 2030', symbol:'SGB2030', type:'Government security', account:'ICICI Direct', source:'Manual entry', value:84200, asset:'Gold', sector:'Commodity', geo:'India', issuer:'Government of India', fee:0, liquidity:'Low', overlap:{GOLD:100}, updated:'08 Aug 2026, 11:00 IST' },
  { id:'h7', name:'Liquid Fund', symbol:'LIQUID', type:'Mutual fund', account:'Groww', source:'Manual entry', value:68000, asset:'Cash', sector:'Cash', geo:'India', issuer:'HDFC AMC', fee:.2, liquidity:'High', overlap:{CASH:100}, updated:'14 Aug 2026, 18:20 IST' }
];

export const providerMatrix = [
  ['Zerodha','Imported by CSV','15 Aug 2026, 10:32 IST','CSV statement','1','—'],
  ['Groww','Manual portfolio','14 Aug 2026, 18:20 IST','User-entered','3','—'],
  ['Wint Wealth','Imported statement','12 Aug 2026, 09:15 IST','PDF / statement','1','—'],
  ['Upstox','Import / manual only','—','No connection configured','0','—'],
  ['Angel One','Import / manual only','—','No connection configured','0','—'],
  ['ICICI Direct','Manual portfolio','08 Aug 2026, 11:00 IST','User-entered','1','—']
];

export const sum = a => a.reduce((x,y)=>x+y,0);
const csvCells = row => [...row.matchAll(/(?:^|,)("(?:[^"]|"")*"|[^,]*)/g)].map(match => match[1].replace(/^"|"$/g,'').replace(/""/g,'"').trim());
export function parseHoldingsCsv(text, source='CSV import') {
 const rows=text.trim().split(/\r?\n/).filter(Boolean).map(csvCells);
 if (rows.length < 2) throw new Error('The file needs a header row and at least one holding.');
 const headers=rows.shift().map(x=>x.toLowerCase().replace(/[^a-z]/g,''));
 const lookup=(row,...names)=>{const i=headers.findIndex(h=>names.includes(h));return i<0?'':row[i]||''};
 const number=value=>Number(String(value).replace(/[^0-9.-]/g,''));
 const imported=rows.map((row,index)=>{
   const name=lookup(row,'name','instrument','security','holding'), value=number(lookup(row,'value','marketvalue','currentvalue'));
   if (!name || !Number.isFinite(value) || value<=0) return null;
   return {id:`import-${Date.now()}-${index}`,name,symbol:lookup(row,'symbol','ticker','isin')||'—',type:lookup(row,'type','instrumenttype')||'Other',account:lookup(row,'account','broker','provider')||'Imported account',source,value,asset:lookup(row,'asset','assetclass')||'Equity',sector:lookup(row,'sector')||'Unclassified',geo:lookup(row,'geo','geography','country')||'India',issuer:lookup(row,'issuer','fundhouse')||name,fee:number(lookup(row,'fee','expenseratio'))||0,liquidity:lookup(row,'liquidity')||'Not assessed',overlap:{},updated:'Imported locally'};
 }).filter(Boolean);
 if (!imported.length) throw new Error('No valid holdings found. Include Name and Value columns.');
 return imported;
}
export function analyze(items=holdings) {
 const total=sum(items.map(h=>h.value));
 const group=(key)=>Object.entries(items.reduce((a,h)=>{a[h[key]]=(a[h[key]]||0)+h.value;return a},{})).map(([name,value])=>({name,value,pct:value/total*100})).sort((a,b)=>b.value-a.value);
 const asset=group('asset'), sector=group('sector'), geo=group('geo'), issuer=group('issuer');
 const top=Math.max(...items.map(h=>h.value))/total*100;
 const equity=asset.find(x=>x.name==='Equity')?.pct||0, debt=asset.find(x=>x.name==='Debt')?.pct||0, gold=asset.find(x=>x.name==='Gold')?.pct||0;
 const overlapDirect = items.filter(h=>h.type==='Stock').reduce((v,h)=>v + Object.entries(h.overlap).reduce((z,[ticker,p])=> z + items.filter(f=>f.type!=='Stock').reduce((fSum,f)=>fSum+(f.overlap[ticker]||0)*f.value/100,0),0),0);
 const overlap=Math.min(100, overlapDirect/total*100);
 const weightedFee=sum(items.map(h=>h.value*h.fee))/total;
 const concentration=Math.max(0,100-top*1.55);
 const allocation=Math.max(45,100-(Math.abs(equity-65)+Math.abs(debt-25)+Math.abs(gold-10))*.9);
 const diversification=Math.min(96, 55+items.length*4+(asset.length-1)*5);
 const sectorScore=Math.max(40,100-(sector[0]?.pct||0)*.7);
 const geoScore=geo.length>1 ? 76 : 48;
 const cost=Math.max(55,100-weightedFee*24);
 const liquidity=82;
 const fixed=Math.max(45, debt ? 75 : 45);
 const components=[['Asset allocation',allocation,18],['Concentration',concentration,15],['Diversification',diversification,12],['Sector allocation',sectorScore,9],['Geographic allocation',geoScore,8],['Risk alignment',72,10],['Correlation & overlap',Math.max(40,88-overlap),10],['Cost efficiency',cost,7],['Liquidity',liquidity,5],['Fixed-income quality',fixed,6]];
 const score=Math.round(sum(components.map(x=>x[1]*x[2]))/100);
 return {total,asset,sector,geo,issuer,top,overlap,weightedFee,components,score};
}

export function scenario(items, amount, targetId) {
 const candidate={id:'new',name:targetId==='intl'?'Global Equity ETF':targetId==='bond'?'Short Duration Bond ETF':'Gold ETF',symbol:'SIM',type:'ETF',account:'Scenario',source:'Simulation',value:amount,asset:targetId==='intl'?'Equity':targetId==='bond'?'Debt':'Gold',sector:targetId==='intl'?'Global technology & broad market':targetId==='bond'?'Government / PSU':'Commodity',geo:targetId==='intl'?'International':'India',issuer:'Illustrative',fee:targetId==='intl'?.48:.18,liquidity:'Medium',overlap:targetId==='intl'?{MSFT:6,GOOGL:5}:targetId==='bond'?{PSU:30}:{GOLD:100}};
 return analyze([...items,candidate]);
}

export function generateRebalancePlan(items, targets={Equity:65,Debt:25,Gold:10}, mode='contributions') {
 const analysis=analyze(items), total=analysis.total;
 const current=Object.fromEntries(analysis.asset.map(item=>[item.name,item.value]));
 const targetRows=Object.entries(targets).map(([asset,pct])=>({asset,pct,targetValue:total*pct/100,currentValue:current[asset]||0,gap:total*pct/100-(current[asset]||0)}));
 const underweight=targetRows.filter(row=>row.gap>0);
 const requiredContribution=underweight.reduce((sum,row)=>sum+row.gap,0);
 const actions=targetRows.map(row=>({
   ...row,
   action:mode==='contributions'?(row.gap>0?`Direct new contributions to ${row.asset}`:'Pause new contributions to this asset class'):(row.gap>0?`Consider adding ${row.asset}`:`Consider reducing ${row.asset}`),
   amount:mode==='contributions'?(requiredContribution?row.gap/requiredContribution*Math.min(requiredContribution,total*.1):0):Math.abs(row.gap)
 }));
 return {mode,targets,total,current,requiredContribution,actions,assumptions:['Uses illustrative target weights only.','Excludes taxes, exit loads, transaction costs, price movements, lock-ins, and suitability review.','Does not create or execute trades.']};
}
