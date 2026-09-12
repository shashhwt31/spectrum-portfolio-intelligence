import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyze, holdings as demoHoldings } from './analytics.js';

const root=dirname(fileURLToPath(import.meta.url));
const storePath=join(root,'data','portfolio.json');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8'};
const now=()=>new Date().toISOString();
const send=(res,status,body)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'});res.end(JSON.stringify(body))};
const readBody=req=>new Promise((resolve,reject)=>{let raw='';req.on('data',chunk=>raw+=chunk);req.on('end',()=>{try{resolve(raw?JSON.parse(raw):{})}catch{reject(new Error('Request body must be valid JSON.'))}});req.on('error',reject)});
const defaultProfile={riskProfile:'moderate',horizonYears:10,emergencyFund:'unknown',monthlyCapacity:0,goal:''};
async function load(){if(!existsSync(storePath))return {holdings:demoHoldings,profile:defaultProfile,audit:[{at:now(),event:'demo_seed_loaded',source:'system'}]};const data=JSON.parse(await readFile(storePath,'utf8'));return {...data,profile:data.profile||defaultProfile,audit:data.audit||[]}}
async function persist(data){await mkdir(dirname(storePath),{recursive:true});await writeFile(storePath,JSON.stringify(data,null,2),'utf8')}
function normalizeHolding(input){const value=Number(input.value);if(!input.name?.trim()||!Number.isFinite(value)||value<=0)throw new Error('Holding name and a positive current value are required.');return {id:input.id||`holding-${crypto.randomUUID()}`,name:input.name.trim(),symbol:input.symbol||'—',type:input.type||'Other',account:input.account||'Manual portfolio',source:input.source||'Manual entry',value,asset:input.asset||'Equity',sector:input.sector||'Unclassified',geo:input.geo||'India',issuer:input.issuer||input.name.trim(),fee:Number(input.fee)||0,liquidity:input.liquidity||'Not assessed',overlap:input.overlap||{},updated:now()}}

const server=createServer(async(req,res)=>{try{
 const url=new URL(req.url,'http://localhost');
 if(url.pathname==='/api/portfolio'&&req.method==='GET'){const data=await load();return send(res,200,{holdings:data.holdings,profile:data.profile,analysis:analyze(data.holdings),audit:data.audit.slice(-10)})}
 if(url.pathname==='/api/profile'&&req.method==='PUT'){const data=await load(),body=await readBody(req);if(!['conservative','moderate','growth'].includes(body.riskProfile))throw new Error('Choose a valid risk profile.');data.profile={riskProfile:body.riskProfile,horizonYears:Math.max(0,Number(body.horizonYears)||0),emergencyFund:body.emergencyFund||'unknown',monthlyCapacity:Math.max(0,Number(body.monthlyCapacity)||0),goal:String(body.goal||'').slice(0,80)};data.audit.push({at:now(),event:'profile_updated',source:'user'});await persist(data);return send(res,200,{profile:data.profile})}
 if(url.pathname==='/api/holdings'&&req.method==='POST'){const data=await load(),holding=normalizeHolding(await readBody(req));data.holdings.push(holding);data.audit.push({at:now(),event:'holding_created',source:holding.source,holdingId:holding.id});await persist(data);return send(res,201,{holding,analysis:analyze(data.holdings)})}
 if(url.pathname==='/api/imports'&&req.method==='POST'){const body=await readBody(req),data=await load();if(!Array.isArray(body.holdings)||!body.holdings.length)throw new Error('At least one imported holding is required.');const imported=body.holdings.map(item=>normalizeHolding({...item,source:item.source||'CSV import'}));data.holdings.push(...imported);data.audit.push({at:now(),event:'holdings_imported',source:'CSV import',count:imported.length});await persist(data);return send(res,201,{holdings:imported,analysis:analyze(data.holdings)})}
 if(url.pathname.startsWith('/api/holdings/')&&req.method==='DELETE'){const id=decodeURIComponent(url.pathname.split('/').pop()),data=await load(),before=data.holdings.length;data.holdings=data.holdings.filter(item=>item.id!==id);if(before===data.holdings.length)return send(res,404,{error:'Holding not found.'});data.audit.push({at:now(),event:'holding_deleted',holdingId:id});await persist(data);return send(res,200,{analysis:analyze(data.holdings)})}
 if(url.pathname.startsWith('/api/'))return send(res,404,{error:'API route not found.'});
 const target=normalize(url.pathname==='/'?'/index.html':url.pathname).replace(/^([.][.][/\\])+/, '');const path=join(root,target);if(!path.startsWith(root)||!existsSync(path)){res.writeHead(404);return res.end('Not found');}res.writeHead(200,{'content-type':mime[extname(path)]||'application/octet-stream'});res.end(await readFile(path));
}catch(error){send(res,400,{error:error.message||'Unexpected server error.'})}});
server.listen(Number(process.env.PORT)||4173,()=>console.log(`Spectrum running at http://localhost:${process.env.PORT||4173}`));
