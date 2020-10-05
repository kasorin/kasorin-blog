import path from "path"

import remark from "remark"
import html from "remark-html"
import matter from "gray-matter"

import { formatDate } from "./date"

const DIR = path.join(process.cwd(), "content/posts")
const EXTENSION = ".md"
/**
 * Markdownファイル一覧を取得する
 */
const listContentFiles = ({ fs }) => {
    const filenames = fs.readdirSync(DIR)
    return filenames
        .filter((filename) => path.parse(filename).ext === EXTENSION)
}
/**
 * Markdownファイルの中身を全件パースして取得する
 */
const readContentFiles = async ({ fs }) => {
    const promisses = listContentFiles({ fs })
        .map((filename) => readContentFile({ fs, filename }))

    const contents = await Promise.all(promisses)

    return contents.sort(sortWithProp('published', true))
}
/**
 * Markdownファイルの中身をパースして取得する
 */
const readContentFile = async ({ fs, slug, filename }: readContentFileArgs) => {
    if (slug === undefined) {
        slug = path.parse(filename).name
    }
    const raw = fs.readFileSync(path.join(DIR, `${slug}${EXTENSION}`), 'utf8')
    const matterResult = matter(raw)

    const { title, published: rawPublished } = matterResult.data

    const parsedContent = await remark()
        .use(html)
        .process(matterResult.content)
    const content = parsedContent.toString()

    return {
        title,
        published: formatDate(rawPublished),
        content,
        slug,
    }
}
type readContentFileArgs = {
    fs: any,
    slug?: any,
    filename?: any,
}

/**
 * Markdownの投稿をソートするためのヘルパー
 */
const sortWithProp = (name, reversed) => (a, b) => {
    if (reversed) {
        return a[name] < b[name] ? 1: -1
    } else {
        return a[name] < b[name] ? -1: 1
    }
}

export { listContentFiles, readContentFiles, readContentFile }