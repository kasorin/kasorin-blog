import Link from "next/link"

import Layout from "../components/Layout"
import { readContentFiles } from "../lib/content-loader"

type Props = {
  posts:{
    title: string
    published: string
    content: string
    slug: string
  }[]
  hasArchive: boolean
}

export default function Home(props: Props): JSX.Element {
  const { posts, hasArchive } = props
  return (
    <Layout home title="">
      {posts.map((post) => <div
        key={post.slug}
        className="post-teaser"
      >
        <h2><Link href="/posts/[id]" as={`posts/${post.slug}`}><a>{post.title}</a></Link></h2>
        <div><span>{post.published}</span></div>
      </div>)}

      {hasArchive ? (
        <div className="home-archive">
          <Link href="/archive/[page]" as="/archive/1"><a>アーカイブ</a></Link>
        </div>
      ) : ``}

      <style jsx>{`
        .post-teaser {
          margin-bottom: 2em;
        }

        .post-teaser h2 a {
          text-decoration: none;
        }

        .home-archive {
          margin: 3em;
          display: flex;
          flex-direction: row;
          justify-content: center;
        }
      `}</style>
    </Layout>
  )
}

type GetStaticProps = {
  props: Props
}

/**
 * ページコンポーネントで使用する値を用意する
 */
export async function getStaticProps(): Promise<GetStaticProps>{
  const MAX_COUNT = 5
  const posts = await readContentFiles()
  const hasArchive = posts.length > MAX_COUNT

  return {
    props: {
      posts: posts.slice(0, MAX_COUNT),
      hasArchive,
    }
  }
}