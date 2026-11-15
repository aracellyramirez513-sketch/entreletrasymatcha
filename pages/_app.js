import '../styles/globals.css'
import Head from 'next/head'
import { useRouter } from 'next/router'

// Dirección oficial del sitio. Siempre con www, que es la que usa Vercel.
const SITE_URL = 'https://www.entreletrasymatcha.com'

export default function App({ Component, pageProps }) {
  const router = useRouter()

  // Ruta limpia: sin ?parámetros ni #anclas, para que Google vea una sola versión
  const ruta = (router.asPath || '/').split(/[?#]/)[0]
  const canonica = SITE_URL + (ruta === '/' ? '/' : ruta.replace(/\/+$/, ''))

  return (
    <>
      <Head>
        <link rel="canonical" href={canonica} key="canonical" />
        <meta property="og:url" content={canonica} key="og:url" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}
