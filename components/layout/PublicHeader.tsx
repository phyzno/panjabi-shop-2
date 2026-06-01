import { Header, type HeaderVariant } from '@/components/layout/Header'
import { getCachedSiteSettings } from '@/lib/actions/settings.actions'

interface PublicHeaderProps {
  variant?: HeaderVariant;
}

export async function PublicHeader({ variant = "default" }: PublicHeaderProps) {
  const settingsRes = await getCachedSiteSettings();
  const settings = settingsRes?.data;

  let activeOfferText = null;
  if (settings && settings.active_offer_id) {
    const offers = Array.isArray(settings.offers) ? settings.offers : [];
    const liveOffer = offers.find((o: any) => o.id === settings.active_offer_id);
    if (liveOffer) {
      activeOfferText = liveOffer.text;
    }
  }

  return <Header activeOfferText={activeOfferText} variant={variant} />
}
