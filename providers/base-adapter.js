/**
 * Provider adapters normalize approved data into the canonical portfolio model.
 * Implementations must never scrape websites or collect passwords, OTPs, PINs, or TPINs.
 */
export class ProviderAdapter {
  constructor({providerCode,capabilities}){this.providerCode=providerCode;this.capabilities=capabilities}
  async authorize(){throw new Error(`${this.providerCode} has no approved authorization flow configured.`)}
  async sync(){throw new Error(`${this.providerCode} has no approved sync flow configured.`)}
  normalizeAccount() {throw new Error('Adapter must normalize accounts.');}
  normalizeHolding() {throw new Error('Adapter must normalize holdings.');}
  normalizeTransaction() {throw new Error('Adapter must normalize transactions.');}
}

export const providerCapabilities={
  zerodha:{officialApi:false,import:true,manual:true},groww:{officialApi:false,import:true,manual:true},wint_wealth:{officialApi:false,import:true,manual:true},upstox:{officialApi:false,import:true,manual:true},angel_one:{officialApi:false,import:true,manual:true},icici_direct:{officialApi:false,import:true,manual:true}
};
