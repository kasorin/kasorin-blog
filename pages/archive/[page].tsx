import Link from "next/link"

import Layout from "../../components/Layout"
import Pager from "../../components/Pager"
import { readContentFiles } from "../../lib/content-loader"

const COUNT_PER_PAGE = 10

export default function Archive(
    props: {
        posts: any[],
        page: number,
        total: number,
        perPage: number
    }): JSX.Element {
    const { posts, page, total, perPage } = props
    return (
        <Layout title="アーカイブ">
            {posts.map((post) => <div
                key={post.slug}
                className="post-teaser"
            >
                <h2><Link href="/posts/[id]" as={`/posts/${post.slug}`}><a>{post.title}</a></Link></h2>
                <div><span>{post.published}</span></div>
            </div>)}

            <Pager
                page={page} total={total} perPage={perPage}
                href="/archive/[page]"
                asCallback={(page) => `/archive/${page}`}
            />

            <style jsx>{`
                .post-teaser {
                    margin-bottom: 2em;
                }

                .post-teaser h2 a {
                    text-decoration: none;
                }
            `}</style>
        </Layout>
    )
}

/**
 * ページコンポーネントで使用する値を用意する
 */
export async function getStaticProps({ params }: {params:{page}}):Promise<{props}> {
    const page = parseInt(params.page, 10)
    const end = COUNT_PER_PAGE * page
    const start = end - COUNT_PER_PAGE
    const posts = await readContentFiles()

    return {
        props: {
            posts: posts.slice(start, end),
            page,
            total: posts.length,
            perPage: COUNT_PER_PAGE,
        }
    }
}

/**
 * 有効なURLパラメータを全件返す
 */
export async function getStaticPaths():Promise<{paths,fallback}> {
    const posts = await readContentFiles()
    const pages = range(Math.ceil(posts.length / COUNT_PER_PAGE))
    const paths = pages.map((page) => ({
        params: { page: `${page}` }
    }))

    return { paths: paths, fallback: false }
}

/**
 * ユーティリティ：1から指定された整数までを格納したArrayを返す
 */
function range(stop) {
    return Array.from({ length: stop }, (_, i) => i + 1)
}