import '../styles/globals.css'
import Router from 'next/router'

import { GA_TRACKING_ID, pageview } from '../lib/gtag'

if (GA_TRACKING_ID) {
  Router.events.on('routeChangeComplete', url => pageview(url))
}

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

export default MyApp
