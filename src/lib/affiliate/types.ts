export interface AffiliateProvider {
  /**
   * Platform identifier (e.g. 'shopee')
   */
  readonly platform: string;

  /**
   * Generate an affiliate link from an original product URL
   */
  generateLink(originalUrl: string): Promise<string>;

  /**
   * Validate if a URL belongs to this affiliate platform
   */
  validateLink(url: string): Promise<boolean>;
}
