import React from 'react'
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import { CodeComponent } from 'react-markdown/src/ast-to-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism"

import Layout from "../../components/Layout"
import Mermaid from '../../components/Mermaid';
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
    type CodeProps = Parameters<CodeComponent>[0]
    const components = {
        code({node, className, children, ...props}: CodeProps) {
            if (className === 'language-mermaid'){
                return <Mermaid graphDefinition={node.children[0].value}/>
            } else {
                const match = /language-(\w+)/.exec(className || '')
                return match
                    ? <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" children={children} {...props} />
                    : <code className={className} {...props} />
            }
        }
    }
    
    return (
        <Layout title={params.title}>
            <div className="post-meta">
                <span>{params.published}</span>
            </div>
            <ReactMarkdown
                components={components}
                className="post-body"
            >
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