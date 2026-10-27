import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '@/hooks/i18n/useLanguage'

interface SEOProps {
  title?: string
  description?: string
  canonical?: string
  image?: string
  imageAlt?: string
}

export const SEO = ({ title, description, canonical, image = '/logo.png', imageAlt }: SEOProps) => {
  const { i18n } = useTranslation()
  const { lang } = useLanguage()
  const siteName = lang === 'ar' ? 'ستاربكس مصر' : 'Starbucks Egypt'
  const fullTitle = title ? `${title} | ${siteName}` : siteName
  const defaultDescription = lang === 'ar' 
    ? 'ستاربكس مصر - الصفحة الرئيسية'
    : 'Starbucks Egypt - Home'
  const defaultImageAlt = lang === 'ar' 
    ? 'ستاربكس مصر'
    : 'Starbucks Egypt'

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <html lang={lang} dir={i18n.dir()} />
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:image" content={image} />
      <meta property="og:image:alt" content={imageAlt || defaultImageAlt} />
      <meta property="og:type" content="website" />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={imageAlt || defaultImageAlt} />
    </Helmet>
  )
}
