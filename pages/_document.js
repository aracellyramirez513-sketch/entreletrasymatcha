import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        <meta charSet="UTF-8" />
        <meta name="p:domain_verify" content="02cc9444537bac94f8f46261543536c9" />
        <meta name="description" content="Un espacio donde comparto lo que leo con honestidad: reseñas de romance, dark romance, romantasy y más. Siempre con un matcha cerca." />
        <meta property="og:site_name" content="Entre letras y matcha" />
        <meta name="theme-color" content="#faf8f4" />
        <link rel="icon" href="/favicon.ico" />
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-TSDVKXMFTQ" />
        <script dangerouslySetInnerHTML={{__html:`
          window.dataLayer=window.dataLayer||[];
          function gtag(){dataLayer.push(arguments);}
          gtag('js',new Date());
          gtag('config','G-TSDVKXMFTQ');
        `}}/>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
