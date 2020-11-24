import fs from "fs"

type Post = {
    slug: string
    title: string
    published: string
}

const generateRssItem = (post: Post): string => {
    return (`
        <item>
            <guid>https://blog.kasorin.work/posts/${post.slug}</guid>
            <title>${post.title}</title>
            <link>https://blog.kasorin.work/posts/${post.slug}</link>
            <pubDate>${new Date(post.published).toUTCString()}</pubDate>
        </item>
    `)
}

const generateRss = (posts: Post[]): string => {
    return (`
        <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
            <channel>
                <title>滝行記録</title>
                <link>https://blog.kasorin.work/</link>
                <description>kasorin's blog</description>
                <atom:link href="https://blog.kasorin.work/rss.xml" rel="self" type="application/rss+xml"/>
                ${posts.map(generateRssItem).join('')}
            </channel>
        </rss>
    `)
}
const publishRss = async (posts: Post[]): Promise<void> => {
    const PATH = './public/rss.xml'
    const rss = generateRss(posts)
    fs.writeFileSync(PATH, rss)
}

export { publishRss }