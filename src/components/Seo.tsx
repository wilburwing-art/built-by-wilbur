import { Helmet } from "react-helmet-async"

const SITE_NAME = "Built by Wilbur"
const SITE_URL = "https://builtbywilbur.com"
const DEFAULT_DESC =
  "Wilbur Pyn — AI engineer and full-stack web builder. Selected work in React, TypeScript, and the Anthropic stack."

interface SeoProps {
  title?: string
  description?: string
  path?: string
  type?: "website" | "article"
}

export function Seo({
  title,
  description = DEFAULT_DESC,
  path = "/",
  type = "website",
}: SeoProps) {
  const fullTitle = title ? `${title} · ${SITE_NAME}` : SITE_NAME
  const url = `${SITE_URL}${path}`

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  )
}
