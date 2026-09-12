// Curated scheme identifiers for holding entry only. Names are based on AMFI/AMC
// disclosures; this is not a live NAV, availability, or recommendation service.
export const fundCatalog=[
 {name:'UTI Nifty 50 Index Fund - Direct Plan - Growth Option',issuer:'UTI Mutual Fund',type:'Index fund',asset:'Equity',sector:'Multi-sector',geo:'India',underlyingIndex:'Nifty 50'},
 {name:'UTI Nifty 50 ETF',issuer:'UTI Mutual Fund',type:'ETF',asset:'Equity',sector:'Multi-sector',geo:'India',underlyingIndex:'Nifty 50'},
 {name:'UTI Nifty Next 50 Index Fund - Direct Plan - Growth Option',issuer:'UTI Mutual Fund',type:'Index fund',asset:'Equity',sector:'Multi-sector',geo:'India',underlyingIndex:'Nifty Next 50'},
 {name:'UTI Nifty Next 50 ETF',issuer:'UTI Mutual Fund',type:'ETF',asset:'Equity',sector:'Multi-sector',geo:'India',underlyingIndex:'Nifty Next 50'},
 {name:'UTI Nifty Midcap 150 Index Fund - Direct Plan - Growth Option',issuer:'UTI Mutual Fund',type:'Index fund',asset:'Equity',sector:'Multi-sector',geo:'India',underlyingIndex:'Nifty Midcap 150'},
 {name:'UTI Nifty Bank ETF',issuer:'UTI Mutual Fund',type:'ETF',asset:'Equity',sector:'Financials',geo:'India',underlyingIndex:'Nifty Bank'},
 {name:'HDFC Index Fund - Nifty 50 Plan - Direct Plan - Growth Option',issuer:'HDFC Mutual Fund',type:'Index fund',asset:'Equity',sector:'Multi-sector',geo:'India',underlyingIndex:'Nifty 50'},
 {name:'ICICI Prudential Nifty 50 Index Fund - Direct Plan - Growth',issuer:'ICICI Prudential Mutual Fund',type:'Index fund',asset:'Equity',sector:'Multi-sector',geo:'India',underlyingIndex:'Nifty 50'},
 {name:'Nippon India Index Fund - Nifty 50 Plan - Direct Plan - Growth',issuer:'Nippon India Mutual Fund',type:'Index fund',asset:'Equity',sector:'Multi-sector',geo:'India',underlyingIndex:'Nifty 50'},
 {name:'SBI Nifty Index Fund - Direct Plan - Growth',issuer:'SBI Mutual Fund',type:'Index fund',asset:'Equity',sector:'Multi-sector',geo:'India',underlyingIndex:'Nifty 50'},
 {name:'Parag Parikh Flexi Cap Fund - Direct Plan - Growth',issuer:'PPFAS Mutual Fund',type:'Mutual fund',asset:'Equity',sector:'Multi-sector',geo:'India & Global',underlyingIndex:null},
 {name:'HDFC Liquid Fund - Direct Plan - Growth Option',issuer:'HDFC Mutual Fund',type:'Mutual fund',asset:'Cash',sector:'Cash',geo:'India',underlyingIndex:null},
 {name:'ICICI Prudential Liquid Fund - Direct Plan - Growth',issuer:'ICICI Prudential Mutual Fund',type:'Mutual fund',asset:'Cash',sector:'Cash',geo:'India',underlyingIndex:null},
 {name:'Bharat Bond FOF - April 2033 - Direct Plan - Growth',issuer:'Edelweiss Mutual Fund',type:'Bond fund',asset:'Debt',sector:'Government / PSU',geo:'India',underlyingIndex:'Nifty Bharat Bond Index - April 2033'}
];

export function searchFunds(query,limit=6){
 const terms=query.trim().toLowerCase().split(/\s+/).filter(Boolean);
 if(!terms.length)return [];
 return fundCatalog.filter(fund=>terms.every(term=>fund.name.toLowerCase().includes(term))).slice(0,limit);
}
