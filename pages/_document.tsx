import Document, { Html, Head, Main, NextScript } from 'next/document'

import { GA_TRACKING_ID } from '../lib/gtag'

class MyDocument extends Document {
    render(): JSX.Element {
        return (
            <Html lang="ja">
                <Head>
                    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@800&family=Noto+Sans+JP:wght@400;700&display=swap" rel="stylesheet" />
                    { /* Google Analytics */}
                    {
                        GA_TRACKING_ID && <script
                            async
                            src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
                        />
                    }
                    {
                        GA_TRACKING_ID && <script
                            dangerouslySetInnerHTML={{
                                __html: `
                                    window.dataLayer = window.dataLayer || [];
                                    function gtag(){dataLayer.push(arguments);}
                                    gtag('js', new Date());
                                    gtag('config', '${GA_TRACKING_ID}', {
                                        page_path: window.location.pathname,
                                    });
                                `,
                            }}
                        />
                    }
                    <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        )
    }
}

export default MyDocument