import React from 'react'
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism"

import Layout from "../../components/Layout"
import { readContentFiles, readContentFile, getPrevPost, getNextPost } from "../../lib/content-loader"

type Params = {
    title: string
    published: string
    content: string
    slug: string
    prevPost: {
        title: string
        slug: string
    }
    nextPost: {
        title: string
        slug: string
    }
}

export default function Post(params: Params): JSX.Element {
    const renderers = {
        // eslint-disable-next-line react/display-name
        code: ({language, value}) => {
            // eslint-disable-next-line react/no-children-prop
            return <SyntaxHighlighter style={vscDarkPlus} language={language} children={value} />
        }
    }
    
    return (
        <Layout title={params.title}>
            <div className="post-meta">
                <span>{params.published}</span>
            </div>
            <ReactMarkdown className="post-body" renderers={renderers}>
                {params.content}
            </ReactMarkdown>
            <ul className="post-footer">
                {params.nextPost.slug? (
                    <li className="post-footer-next">
                        <Link href="/posts/[id]" as={`${params.nextPost.slug}`}>
                            <a>{`[Next post: ${params.nextPost.title}]`}</a>
                        </Link>
                    </li>
                ): ''}
                <li className="post-footer-home">
                    <Link href="/">
                        <a>[Index]</a>
                    </Link>
                </li>
                {params.prevPost.slug? (
                    <li className="post-footer-prev">
                        <Link href="/posts/[id]" as={`${params.prevPost.slug}`}>
                            <a>{`[Previous post: ${params.prevPost.title}]`}</a>
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

type GetStaticProps = {
    props: Params
}

export async function getStaticProps({ params }: { params: { slug: string } }): Promise<GetStaticProps> {
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

type GetStaticPaths = {
    paths: {
        params: {
            slug: string
        }
    }[]
    fallback: boolean
}

export async function getStaticPaths(): Promise<GetStaticPaths> {
    const posts = await readContentFiles()
    const paths = posts.map((post) => ({
        params: {
            slug: post.slug
        }
    }))
    return { paths, fallback: false }
}