import { useEffect } from 'react';
import { useSite } from '../context/SiteContext';

interface SeoHeadProps {
  pageKey: string;
  fallbackTitle: string;
  fallbackDescription: string;
}

function setMetaTag(attr: 'name' | 'property', key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function SeoHead({ pageKey, fallbackTitle, fallbackDescription }: SeoHeadProps) {
  const { siteContent } = useSite();
  const seo = siteContent?.seo?.[pageKey];
  const title = seo?.title || fallbackTitle;
  const description = seo?.description || fallbackDescription;

  useEffect(() => {
    document.title = title;
    setMetaTag('name', 'description', description);
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', window.location.origin + window.location.pathname);
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
  }, [title, description]);

  return null;
}
