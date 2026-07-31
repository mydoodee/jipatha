import { AffiliateProvider } from "./types";

export class ShopeeAffiliateProvider implements AffiliateProvider {
  readonly platform = "shopee";

  /**
   * Validate if URL is a valid Shopee URL
   */
  async validateLink(url: string): Promise<boolean> {
    try {
      const parsed = new URL(url);
      return (
        parsed.hostname.includes("shopee.co.th") ||
        parsed.hostname.includes("shope.ee") ||
        parsed.hostname.includes("shopee.com")
      );
    } catch {
      return false;
    }
  }

  /**
   * Mode A (Manual): If affiliate URL is already given or needs basic validation.
   * Mode B (API): Can be extended to call Shopee Affiliate Open API when API keys are available.
   */
  async generateLink(originalUrl: string): Promise<string> {
    const isValid = await this.validateLink(originalUrl);
    if (!isValid) {
      throw new Error("Invalid Shopee URL");
    }
    // Default fallback return original URL if no auto-converter is configured
    return originalUrl;
  }
}

export const shopeeAffiliateProvider = new ShopeeAffiliateProvider();
