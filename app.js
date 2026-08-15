import {holdings,providerMatrix,analyze,generateRebalancePlan,parseHoldingsCsv,scenario} from './analytics.js';

const fmt=n=>'₹'+Math.round(n).toLocaleString('en-IN');
const colors=['#187d5d','#244f83','#dca733','#bdc9c1'];
let portfolio=JSON.parse(localStorage.getItem('spectrum-holdings')||'null')||holdings;
let data, target='intl', rebalanceMode='contributions';
const api={
  get:()=>fetch('/api/portfolio').then(r=>r.ok?r.json():Promise.reject(new Error('API unavailable'))),
  create:holding=>fetch('/api/holdings',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(holding)}).then(r=>r.ok?r.json():r.json().then(x=>Promise.reject(new Error(x.error)))),
  import:holdings=>fetch('/api/imports',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({holdings})}).then(r=>r.ok?r.json():r.json().then(x=>Promise.reject(new Error(x.error))))
};

function render(){
  data=analyze(portfolio);
  document.querySelector('#total').textContent=fmt(data.total);
  document.querySelector('#score').textContent=data.score;
  document.querySelector('#assetLegend').innerHTML=data.asset.map((x,i)=>`<span style="--c:${colors[i]||'#bdc9c1'}">${x.name} <b>${x.pct.toFixed(1)}%</b></span>`).join('');
  document.querySelector('#concentration').innerHTML=[['Largest holding',data.top,'Review single-position reliance'],['Financials look-through',38,'Fund + direct holding exposure'],['Direct-stock overlap',data.overlap,'Across fund holdings data']].map(x=>`<div class="risk-item"><b>${x[0]} · ${x[1].toFixed(0)}%</b><br/><span class="muted">${x[2]}</span><div class="bar"><i style="width:${x[1]}%"></i></div></div>`).join('');
  document.querySelector('#components').innerHTML=data.components.map(x=>`<div class="component"><small>${x[0].toUpperCase()} · ${x[2]}%</small><b>${Math.round(x[1])}</b><progress value="${x[1]}" max="100"></progress></div>`).join('');
  document.querySelector('#overlapText').textContent=`Calculated direct-stock / fund overlap is ${data.overlap.toFixed(1)}% of current portfolio value. Full holdings are not available for every instrument, so this is an estimate.`;
  document.querySelector('#goldAllocation').textContent=(data.asset.find(x=>x.name==='Gold')?.pct||0).toFixed(1)+'%';
  renderRebalance();
}

function renderRebalance(){
  const plan=generateRebalancePlan(portfolio,{Equity:65,Debt:25,Gold:10},rebalanceMode);
  document.querySelector('#rebalanceRows').innerHTML=plan.actions.map(row=>`<div class="rebalance-row"><div><strong>${row.asset}</strong><span>Current ${fmt(row.currentValue)} · target ${row.pct}%</span></div><div><b>${fmt(row.targetValue)}</b><span>target value</span></div><div><b>${row.gap>=0?'+':'−'}${fmt(Math.abs(row.gap))}</b><span>allocation gap</span></div><div class="rebalance-action">${row.action}${row.amount?` · ${fmt(row.amount)}`:''}</div></div>`).join('');
  document.querySelector('#rebalanceNote').textContent=rebalanceMode==='contributions'?`To close the current underweight gaps purely with new money would require approximately ${fmt(plan.requiredContribution)}; use this as a gradual guide, not a mandate.`:plan.assumptions.join(' ');
}

function save(next){portfolio=next;localStorage.setItem('spectrum-holdings',JSON.stringify(portfolio));render()}
render();
api.get().then(result=>{portfolio=result.holdings;save(portfolio)}).catch(()=>{});
document.querySelector('#providers').innerHTML=providerMatrix.map(p=>`<tr><td><b>${p[0]}</b></td><td><span class="status ${p[1].includes('Import')?'import':''}">${p[1]}</span></td><td>${p[2]}</td><td>${p[3]}</td><td>${p[4]}</td><td><button class="ghost">${p[4]!=='0'?'View':'Import'}</button></td></tr>`).join('');
document.querySelectorAll('.choice button').forEach(button=>button.onclick=()=>{target=button.dataset.target;document.querySelectorAll('.choice button').forEach(x=>x.classList.toggle('selected',x===button))});
document.querySelectorAll('.mode-choice button').forEach(button=>button.onclick=()=>{rebalanceMode=button.dataset.mode;document.querySelectorAll('.mode-choice button').forEach(x=>x.classList.toggle('selected',x===button));renderRebalance()});
document.querySelectorAll('[data-sim]').forEach(button=>button.onclick=()=>{target=button.dataset.sim;document.querySelector(`[data-target="${target}"]`).click();document.querySelector('#simulator').scrollIntoView({behavior:'smooth'})});
document.querySelector('#runSim').onclick=()=>{const amount=Number(document.querySelector('#amount').value)||25000,r=scenario(portfolio,amount,target),diff=r.score-data.score;document.querySelector('#simResult').innerHTML=`<span>SIMULATED · ILLUSTRATIVE</span><h2>${r.score}/100 <small style="color:${diff>=0?'#7cdfb9':'#f2b24c'}">${diff>=0?'↑':''}${diff} points</small></h2><p>New portfolio value: ${fmt(r.total)}. Equity ${r.asset.find(x=>x.name==='Equity')?.pct.toFixed(1)||0}%, debt ${r.asset.find(x=>x.name==='Debt')?.pct.toFixed(1)||0}%, estimated overlap ${r.overlap.toFixed(1)}%.</p><p class="fine" style="color:#c5d4df;margin-top:12px">This is calculated from displayed holdings and simplified proxy exposures. It excludes taxes, price movement, brokerage and suitability review.</p>`};

const modal=document.querySelector('#modal'),form=document.querySelector('#holdingForm'),panel=document.querySelector('#importPanel'),message=document.querySelector('#formMessage');
function openModal(importMode){document.querySelector('#modalTitle').textContent=importMode?'Import holdings CSV':'Add a holding';document.querySelector('#modalText').textContent=importMode?'Import a simple holdings CSV from any provider. Every imported record is marked with its source.':'Manual entry is always available. Data will be clearly labelled as user supplied.';form.classList.toggle('hidden',importMode);panel.classList.toggle('hidden',!importMode);message.textContent='';modal.classList.remove('hidden')}
document.querySelectorAll('#importBtn,#importBtn2').forEach(button=>button.onclick=()=>openModal(true));
document.querySelector('#addBtn').onclick=()=>openModal(false);
document.querySelectorAll('.close').forEach(button=>button.onclick=()=>modal.classList.add('hidden'));
form.onsubmit=async event=>{event.preventDefault();const values=Object.fromEntries(new FormData(form));const holding={name:values.name,symbol:'—',type:'Other',account:values.account||'Manual portfolio',source:'Manual entry',value:Number(values.value),asset:values.asset,sector:'Unclassified',geo:'India',issuer:values.name,fee:0,liquidity:'Not assessed',overlap:{}};try{const result=await api.create(holding);save([...portfolio,result.holding])}catch{save([...portfolio,{...holding,id:`manual-${Date.now()}`,updated:'Entered locally'}])}form.reset();modal.classList.add('hidden')};
document.querySelector('#csvFile').onchange=async event=>{const file=event.target.files[0];if(!file)return;try{const added=parseHoldingsCsv(await file.text());try{await api.import(added)}catch{}save([...portfolio,...added]);message.textContent=`Imported ${added.length} holding${added.length===1?'':'s'} locally.`;setTimeout(()=>modal.classList.add('hidden'),800)}catch(error){message.textContent=error.message}};
