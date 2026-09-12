import {holdings,providerMatrix,analyze,generateRebalancePlan,lookThroughSummary,parseHoldingsCsv,scenario,targetForProfile} from './analytics.js';
import {fundCatalog,searchFunds} from './fund_catalog.js';

const fmt=n=>'₹'+Math.round(n).toLocaleString('en-IN');
const esc=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
const colors=['#187d5d','#244f83','#dca733','#bdc9c1'];
let portfolio=JSON.parse(localStorage.getItem('spectrum-holdings')||'null')||holdings;
let profile=JSON.parse(localStorage.getItem('spectrum-profile')||'null')||{riskProfile:'moderate',horizonYears:10,emergencyFund:'unknown',monthlyCapacity:0};
let data, target='intl', rebalanceMode='contributions';
const api={
  get:()=>fetch('/api/portfolio').then(r=>r.ok?r.json():Promise.reject(new Error('API unavailable'))),
  create:holding=>fetch('/api/holdings',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(holding)}).then(r=>r.ok?r.json():r.json().then(x=>Promise.reject(new Error(x.error)))),
  import:holdings=>fetch('/api/imports',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({holdings})}).then(r=>r.ok?r.json():r.json().then(x=>Promise.reject(new Error(x.error)))),
  profile:profile=>fetch('/api/profile',{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify(profile)}).then(r=>r.ok?r.json():r.json().then(x=>Promise.reject(new Error(x.error)))),
  remove:id=>fetch(`/api/holdings/${encodeURIComponent(id)}`,{method:'DELETE'}).then(r=>r.ok?r.json():r.json().then(x=>Promise.reject(new Error(x.error))))
};

function render(){
  data=analyze(portfolio,targetForProfile(profile));
  document.querySelector('#total').textContent=fmt(data.total);
  document.querySelector('#score').textContent=data.score;
  document.querySelector('#assetLegend').innerHTML=data.asset.map((x,i)=>`<span style="--c:${colors[i]||'#bdc9c1'}">${x.name} <b>${x.pct.toFixed(1)}%</b></span>`).join('');
  document.querySelector('#concentration').innerHTML=[['Largest holding',data.top,'Review single-position reliance'],['Financials look-through',38,'Fund + direct holding exposure'],['Direct-stock overlap',data.overlap,'Across fund holdings data']].map(x=>`<div class="risk-item"><b>${x[0]} · ${x[1].toFixed(0)}%</b><br/><span class="muted">${x[2]}</span><div class="bar"><i style="width:${x[1]}%"></i></div></div>`).join('');
  document.querySelector('#components').innerHTML=data.components.map(x=>`<div class="component"><small>${x[0].toUpperCase()} · ${x[2]}%</small><b>${Math.round(x[1])}</b><progress value="${x[1]}" max="100"></progress></div>`).join('');
  document.querySelector('#overlapText').textContent=`Calculated direct-stock / fund overlap is ${data.overlap.toFixed(1)}% of current portfolio value. Full holdings are not available for every instrument, so this is an estimate.`;
  document.querySelector('#goldAllocation').textContent=(data.asset.find(x=>x.name==='Gold')?.pct||0).toFixed(1)+'%';
  renderHoldings();
  renderExposure();
  renderRebalance();
}

function renderHoldings(){
 document.querySelector('#holdingsTable').innerHTML=portfolio.map(item=>`<tr><td><div class="holding-name"><b>${esc(item.name)}</b><small>${esc(item.symbol||'—')} · ${esc(item.type||'Other')}</small></div></td><td>${esc(item.account)}</td><td>${esc(item.asset)}</td><td>${esc(item.source)}</td><td><b>${fmt(item.value)}</b></td><td><button class="remove-holding" data-remove-id="${esc(item.id)}">Remove</button></td></tr>`).join('')||'<tr><td colspan="6" class="muted">No holdings yet. Add a holding or import a CSV to begin.</td></tr>';
 document.querySelectorAll('[data-remove-id]').forEach(button=>button.onclick=async()=>{const id=button.dataset.removeId;if(!confirm('Remove this holding from the local portfolio?'))return;try{await api.remove(id)}catch{}save(portfolio.filter(item=>item.id!==id))});
}

function exposureList(items){return items.slice(0,5).map(item=>`<div class="exposure-item"><div><span>${item.name}</span><b>${item.pct.toFixed(1)}%</b></div><i style="width:${Math.min(100,item.pct)}%"></i></div>`).join('')||'<p class="fine">No classified exposure data available.</p>'}
function renderExposure(){
  const summary=lookThroughSummary(portfolio);
  document.querySelector('#sectorExposure').innerHTML=exposureList(data.sector);
  document.querySelector('#geoExposure').innerHTML=exposureList(data.geo);
  document.querySelector('#lookThroughQuality').textContent=summary.quality;
  document.querySelector('#overlapExposure').innerHTML=summary.shared.length?summary.shared.map(item=>`<p>${item.name}<span>${fmt(item.estimatedFundExposure)} estimated fund exposure</span></p>`).join(''):'<p class="fine">No reliable direct-stock overlap could be calculated from the available sources.</p>';
}

function renderRebalance(){
  const plan=generateRebalancePlan(portfolio,targetForProfile(profile),rebalanceMode);
  document.querySelector('#rebalanceRows').innerHTML=plan.actions.map(row=>`<div class="rebalance-row"><div><strong>${row.asset}</strong><span>Current ${fmt(row.currentValue)} · target ${row.pct}%</span></div><div><b>${fmt(row.targetValue)}</b><span>target value</span></div><div><b>${row.gap>=0?'+':'−'}${fmt(Math.abs(row.gap))}</b><span>allocation gap</span></div><div class="rebalance-action">${row.action}${row.amount?` · ${fmt(row.amount)}`:''}</div></div>`).join('');
  document.querySelector('#rebalanceNote').textContent=rebalanceMode==='contributions'?`To close the current underweight gaps purely with new money would require approximately ${fmt(plan.requiredContribution)}; use this as a gradual guide, not a mandate.`:plan.assumptions.join(' ');
}

function save(next){portfolio=next;localStorage.setItem('spectrum-holdings',JSON.stringify(portfolio));render()}
render();
api.get().then(result=>{portfolio=result.holdings;profile=result.profile||profile;localStorage.setItem('spectrum-profile',JSON.stringify(profile));hydrateProfile();save(portfolio)}).catch(()=>{});
document.querySelector('#providers').innerHTML=providerMatrix.map(p=>`<tr><td><b>${p[0]}</b></td><td><span class="status ${p[1].includes('Import')?'import':''}">${p[1]}</span></td><td>${p[2]}</td><td>${p[3]}</td><td>${p[4]}</td><td><button class="ghost">${p[4]!=='0'?'View':'Import'}</button></td></tr>`).join('');
document.querySelectorAll('.choice button').forEach(button=>button.onclick=()=>{target=button.dataset.target;document.querySelectorAll('.choice button').forEach(x=>x.classList.toggle('selected',x===button))});
document.querySelectorAll('.mode-choice button').forEach(button=>button.onclick=()=>{rebalanceMode=button.dataset.mode;document.querySelectorAll('.mode-choice button').forEach(x=>x.classList.toggle('selected',x===button));renderRebalance()});
document.querySelectorAll('[data-sim]').forEach(button=>button.onclick=()=>{target=button.dataset.sim;document.querySelector(`[data-target="${target}"]`).click();document.querySelector('#simulator').scrollIntoView({behavior:'smooth'})});
document.querySelector('#runSim').onclick=()=>{const amount=Number(document.querySelector('#amount').value)||25000,r=scenario(portfolio,amount,target),diff=r.score-data.score;document.querySelector('#simResult').innerHTML=`<span>SIMULATED · ILLUSTRATIVE</span><h2>${r.score}/100 <small style="color:${diff>=0?'#7cdfb9':'#f2b24c'}">${diff>=0?'↑':''}${diff} points</small></h2><p>New portfolio value: ${fmt(r.total)}. Equity ${r.asset.find(x=>x.name==='Equity')?.pct.toFixed(1)||0}%, debt ${r.asset.find(x=>x.name==='Debt')?.pct.toFixed(1)||0}%, estimated overlap ${r.overlap.toFixed(1)}%.</p><p class="fine" style="color:#c5d4df;margin-top:12px">This is calculated from displayed holdings and simplified proxy exposures. It excludes taxes, price movement, brokerage and suitability review.</p>`};

const modal=document.querySelector('#modal'),form=document.querySelector('#holdingForm'),panel=document.querySelector('#importPanel'),message=document.querySelector('#formMessage');
const fundName=document.querySelector('#fundName'),fundResults=document.querySelector('#fundResults');
function selectFund(fund){fundName.value=fund.name;form.elements.asset.value=fund.asset;fundName.dataset.catalogMatch=fund.name;fundResults.classList.add('hidden')}
fundName.oninput=()=>{const matches=searchFunds(fundName.value);fundName.dataset.catalogMatch='';fundResults.innerHTML=matches.map(fund=>`<button type="button" class="fund-result" data-fund-name="${esc(fund.name)}"><b>${esc(fund.name)}</b><small>${esc(fund.issuer)} · ${esc(fund.type)}${fund.underlyingIndex?` · tracks ${esc(fund.underlyingIndex)}`:''}</small></button>`).join('');fundResults.classList.toggle('hidden',!matches.length);document.querySelectorAll('[data-fund-name]').forEach(button=>button.onclick=()=>selectFund(fundCatalog.find(fund=>fund.name===button.dataset.fundName)))};
fundName.onblur=()=>setTimeout(()=>fundResults.classList.add('hidden'),150);
function openModal(importMode){document.querySelector('#modalTitle').textContent=importMode?'Import holdings CSV':'Add a holding';document.querySelector('#modalText').textContent=importMode?'Import a simple holdings CSV from any provider. Every imported record is marked with its source.':'Manual entry is always available. Data will be clearly labelled as user supplied.';form.classList.toggle('hidden',importMode);panel.classList.toggle('hidden',!importMode);message.textContent='';modal.classList.remove('hidden')}
document.querySelectorAll('#importBtn,#importBtn2').forEach(button=>button.onclick=()=>openModal(true));
document.querySelector('#addBtn').onclick=()=>openModal(false);
document.querySelector('#addHoldingFromList').onclick=()=>openModal(false);
document.querySelectorAll('.close').forEach(button=>button.onclick=()=>modal.classList.add('hidden'));
form.onsubmit=async event=>{event.preventDefault();const values=Object.fromEntries(new FormData(form)),matched=fundCatalog.find(fund=>fund.name===values.name);const holding={name:values.name,symbol:'—',type:matched?.type||'Other',account:values.account||'Manual portfolio',source:matched?'Manual entry · curated scheme match':'Manual entry',value:Number(values.value),asset:matched?.asset||values.asset,sector:matched?.sector||'Unclassified',geo:matched?.geo||'India',issuer:matched?.issuer||values.name,fee:0,liquidity:'Not assessed',overlap:{},underlyingIndex:matched?.underlyingIndex||null};try{const result=await api.create(holding);save([...portfolio,result.holding])}catch{save([...portfolio,{...holding,id:`manual-${Date.now()}`,updated:'Entered locally'}])}form.reset();fundName.dataset.catalogMatch='';modal.classList.add('hidden')};
document.querySelector('#csvFile').onchange=async event=>{const file=event.target.files[0];if(!file)return;try{const added=parseHoldingsCsv(await file.text());try{await api.import(added)}catch{}save([...portfolio,...added]);message.textContent=`Imported ${added.length} holding${added.length===1?'':'s'} locally.`;setTimeout(()=>modal.classList.add('hidden'),800)}catch(error){message.textContent=error.message}};
const profileForm=document.querySelector('#profileForm'),profileMessage=document.querySelector('#profileMessage');
function hydrateProfile(){for(const [key,value] of Object.entries(profile)){if(profileForm.elements[key])profileForm.elements[key].value=value}}
hydrateProfile();
profileForm.onsubmit=async event=>{event.preventDefault();const next=Object.fromEntries(new FormData(profileForm));next.horizonYears=Number(next.horizonYears)||0;next.monthlyCapacity=Number(next.monthlyCapacity)||0;try{const result=await api.profile(next);profile=result.profile}catch{profile=next}localStorage.setItem('spectrum-profile',JSON.stringify(profile));render();profileMessage.textContent='Planning context updated locally.'};
