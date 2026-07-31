import { AffiliateProvider } from "./types";
import { shopeeAffiliateProvider } from "./shopee";

const providers: Record<string, AffiliateProvider> = {
  shopee: shopeeAffiliateProvider,
};

export function getAffiliateProvider(platform: string): AffiliateProvider {
  const provider = providers[platform.toLowerCase()];
  if (!provider) {
    throw new Error(`Unsupported affiliate platform: ${platform}`);
  }
  return provider;
}
