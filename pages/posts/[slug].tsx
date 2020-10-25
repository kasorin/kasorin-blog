import path from "path"
import Link from "next/link"

import Layout from "../../components/Layout"
import { listContentFiles, readContentFile, getPrevPost, getNextPost } from "../../lib/content-loader"

export default function Post(params) {
    return (
        <Layout title={params.title}>
            <div className="post-meta">
                <span>{params.published}</span>
            </div>
            <div className="post-body"
                dangerouslySetInnerHTML={{ __html: params.content }}
            />
            <ul className="post-footer">
                {params.prevPost.slug? (
                    <li className="post-footer-prev">
                        <Link href="/posts/[id]" as={`${params.prevPost.slug}`}>
                            <a>{`[Previous post: ${params.prevPost.title}]`}</a>
                        </Link>
                    </li>
                ): ''}
                <li className="post-footer-home">
                    <Link href="/">
                        <a>[Index]</a>
                    </Link>
                </li>
                {params.nextPost.slug? (
                    <li className="post-footer-next">
                        <Link href="/posts/[id]" as={`${params.nextPost.slug}`}>
                            <a>{`[Next post: ${params.nextPost.title}]`}</a>
                        </Link>
                    </li>
                ): ''}
            </ul>
            <style jsx>{`
                .post-footer {
                    list-style-type: none;
                }
            `}</style>
        </Layout>
    )
}

export async function getStaticProps({ params }) {
    const content = await readContentFile({ slug: params.slug })
    const prevPost = await getPrevPost({ slug: params.slug })
    const nextPost = await getNextPost({ slug: params.slug })
    return {
        props: {
            ...content,
            prevPost: {
                title: prevPost.title,
                slug: prevPost.slug,
            },
            nextPost: {
                title: nextPost.title,
                slug: nextPost.slug,
            },
        }
    }
}

export async function getStaticPaths() {
    const paths = listContentFiles()
    .map((filename) => ({
        params: {
            slug: path.parse(filename).name,
        }
    }))

    return { paths, fallback: false }
}