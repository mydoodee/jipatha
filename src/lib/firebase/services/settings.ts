import { db, doc, getDoc, setDoc } from "../firestore";
import { siteConfig } from "@/config/site";

const SETTINGS_COLLECTION = "settings";
const SITE_SETTINGS_DOC = "site_config";

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  logoUrl?: string;
  affiliateDisclosure: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    line?: string;
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, SITE_SETTINGS_DOC);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as SiteSettings;
    }
  } catch (error) {
    console.error("Error fetching site settings:", error);
  }

  // Fallback default settings from siteConfig
  return {
    siteName: siteConfig.name,
    siteDescription: siteConfig.description,
    affiliateDisclosure: siteConfig.affiliateDisclosure,
    socialLinks: { ...siteConfig.social },
  };
}

export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<void> {
  const docRef = doc(db, SETTINGS_COLLECTION, SITE_SETTINGS_DOC);
  await setDoc(docRef, settings, { merge: true });
}
