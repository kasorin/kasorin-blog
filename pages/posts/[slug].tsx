import fs from "fs"
import path from "path"
import Link from "next/link"

import Layout from "../../components/Layout"
import { listContentFiles, readContentFile } from "../../lib/content-loader"

export default function Post(params) {
    return (
        <Layout title={params.title}>
            <div className="post-meta">
                <span>{params.published}</span>
            </div>
            <div className="post-body"
                dangerouslySetInnerHTML={{ __html: params.content }}
            />
            <div className="post-footer">
                <Link href="/">
                    <a>Back to Home</a>
                </Link>
            </div>
            <style jsx>{`
                .post-footer {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin: 0 0 4em;
                }
            `}</style>
        </Layout>
    )
}

export async function getStaticProps({ params }) {
    const content = await readContentFile({ fs, slug: params.slug })
    return {
        props: {
            ...content,
        }
    }
}

export async function getStaticPaths() {
    const paths = listContentFiles({ fs })
    .map((filename) => ({
        params: {
            slug: path.parse(filename).name,
        }
    }))

    return { paths, fallback: false }
}