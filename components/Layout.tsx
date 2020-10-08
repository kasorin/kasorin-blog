import Head from "next/head"
import Link from "next/link"

const Layout = (props) => {
    const { title, children } = props
    const siteTitle = "滝行記録"

    return (
        <div className="page">
            <Head>
                <title>{title ? `${title} | ${siteTitle}` : siteTitle}</title>
                <link rel="icon" href="/favicon.ico" />
                <meta name="description" content="kasorin's blog'"/>
                <meta property="og:title" content={title ? `${title}` : siteTitle}/>
                <meta property="og:url" content="kasorin.work"/>
                <meta property="og:image" content="https://og-image.vercel.app/**kasorin.works**.png?theme=dark&md=1&fontSize=100px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fvercel-triangle-white.svg" />
                <meta property="og:description" content="kasorin's blog"/>
                <meta name="twitter:card" content="summary"/>
                <meta name="twitter:site" content="@kasorin_r"/>
            </Head>

            <header>
                <h1 className="site-title">
                    <Link href="/">
                        <a>{siteTitle}</a>
                    </Link>
                </h1>
            </header>

            <main>
                {title ? <h1 className="page-title">{title}</h1> : ``}
                <div className="page-main">
                    {children}
                </div>
            </main>

            <footer>
                &copy; {siteTitle}
            </footer>

            <style jsx>{`
                .page {
                    padding: 2em 1em;
                    max-width: 800px;
                    margin-left: auto;
                    margin-right: auto;
                }

                header {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin: 0 0 4em;
                }

                .site-title a {
                    color: inherit;
                    text-decoration: none;
                }

                footer {
                    margin-top: 4em;
                    padding-top: 2em;
                    padding-bottom: 2em;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
            `}</style>

            <style jsx global>{`
                html,
                body {
                    padding: 0;
                    margin: 0;
                    font-family: 'Noto Sans JP', -apple-system, "Segoe UI", "Helvetica Neue", "Hiragino Kaku Gothic ProN", メイリオ, meiryo, sans-serif;
                    color: #222;
                }

                img,
                iframe {
                    max-width: 100%;
                }

                h1, h2, h3, h4, h5, h6 {
                    font-family: Montserrat, -apple-system, "Segoe UI", "Helvetica Neue", "Hiragino Kaku Gothic ProN", メイリオ, meiryo, sans-serif;
                }

                * {
                    box-sizing: border-box;
                }
            `}</style>
        </div>
    )
}

export default Layout