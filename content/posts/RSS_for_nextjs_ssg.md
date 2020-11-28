---
title: Next.jsの静的サイト生成で作っているブログにRSSフィード機能をつける
published: 2020-11-09
---
# お知らせ
当ブログにRSSフィードをつけました。[RSS](https://blog.kasorin.work/rss.xml)

# なぜ？
今どきRSSなんて誰も読まんでしょの気持ちは超強いんですが、Twitterのフォロワーのひとりが今でもRSSリーダーを使っているのは知っているし、ブログとしてフィード的なものがないのはいささか脇が甘いかなという価値観もあり、実装は簡単そうなのでサッと作りました。

# 作り方
このブログはNext.jsの静的サイト生成で作られているので、その仕組みの中で勝手にRSSも作られてくれるのが望ましいです。

しかし、Next.jsの静的サイト生成は基本的にテンプレートHTMLに値を埋め込んで吐き出す以外のことは不得手です（たぶん）。pagesディレクトリ以下に置かれた.tsxをxmlとして吐き出す方法はないかなと思ってちょっと調べ始めましたが、なんだか面倒になってきたので別のアプローチを探します。

[Adding a statically-generated RSS feed to a Next.js 9.3+ Blog](https://dev.to/emilioschepis/adding-a-statically-generated-rss-feed-to-a-next-js-9-3-blog-58id)

はい、ありました。ビルド時に呼び出されるgetStaticProps()の中で、publicディレクトリに直接xmlファイルを書き出すというアイディアです。[ここ](https://github.com/vercel/next.js/discussions/12209)を見るとgetStaticProps()の中でpublicディレクトリ以下にファイルを書き出すのはVercelの中の人も推奨してるので、きっと大丈夫寄りのやつなんでしょう。ほんとか？（indexとRSSはほぼほぼ同じデータを使ってるからここで生成してええやろ！ということなのか？）

まあやれることはわかったので、lib/rss.tsにこういう感じのやつを書きます。（コードのスタイルあててないので見づらいですね、そのうちきれいにします……）

~~~typescript
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
const publishRss = async (posts: Post[]) => {
    const PATH = './public/rss.xml'
    const rss = generateRss(posts)
    fs.writeFileSync(PATH, rss)
}

export { publishRss }
~~~

これをindex.tsxあたりにimportして、getStaticProps()内で呼び出せば、ビルド時にpublic/rss.xmlが吐き出されます。public/rss.xmlはビルド後blog.kasorin.work/rss.xmlとして公開されます。**SUCCESS!**

ちなみにローカル環境での確認時にひとつ注意しておくことがあって、next devコマンドでlocalhost:3000に立ち上がる開発サーバですが、ビルド時にSSGする設定であろうとも開発サーバ上ではSSRされます。なので、xml生成用の関数を呼び出す元のページにアクセスしてgetStaticProps()が走らない限り、開発サーバの方にコードの修正が反映されません。今回の場合lib/rss.tsを修正した後にlocalhost:3000/rss.xmlではなく、localhost:3000/にアクセスしないと、index.tsxのgetStaticProps()が走らないので、僕はなんかこれ直んねえなあ？と5分ぐらい無駄にしました。Next.js SSGの地味ハマりポイントとしておぼえておきます。

# よかったこと
- getStaticProps()内でファイルを生成してpublic以下に書き出せること

これは特に個別記事のOGP画像の生成に効きそうだなと思っています。今までは基本的にhtml以外のファイルは事前に置いておく必要があって、そうなると記事を作成するたびに手動でOGP画像を生成して保存しておく必要が出てくると思っていたんですが、個別記事のgetStaticProps()内でcanvasか何かを使って記事内容に即した画像を生成できるとすごく楽ですね。あとこのブログはgithubリポジトリをNetlifyと連携させてデプロイしているんですが、OGP画像の動的生成をするとリポジトリに画像を入れずに済むという利点があるのもありがたいです。

- RSSを提供できたこと

僕のTwitterフォロワーの中でもたぶんひとりぐらいしかRSSリーダー使ってないんですけど、まあ今後増えないとも限りませんし、こういうのはちゃんと対応してあるという事実が大事という面もありますからね。コーヒー飲みに来た喫茶店のお冷がレモン水だと（ふーん……やるじゃん）って思うみたいな（？？？）。

# そのうちやること
- 記事本文中のコードブロックを見やすいようにする
- 個別記事のOGP画像生成をする
- RSSの情報をもう少し増やす
- フッターかどこかにRSSのリンクをつける

おわり。