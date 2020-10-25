import path from "path"
import fs from "fs"

import remark from "remark"
import html from "remark-html"
import matter from "gray-matter"

import { formatDate } from "./date"

const DIR = path.join(process.cwd(), "content/posts")
const EXTENSION = ".md"
/**
 * Markdownファイル一覧を取得する
 */
const listContentFiles = () => {
    const filenames: string[] = fs.readdirSync(DIR)
    return filenames
        .filter((filename) => path.parse(filename).ext === EXTENSION)
}
/**
 * Markdownファイルの中身を全件パースして取得する
 */
const readContentFiles = async () => {
    const promisses = listContentFiles()
        .map((filename) => readContentFile({ filename }))

    const contents = await Promise.all(promisses)

    return contents.sort(sortWithProp('published', true))
}
/**
 * Markdownファイルの中身をパースして取得する
 */
const readContentFile = async ({ slug, filename }: readContentFileArgs) => {
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
    slug?: any,
    filename?: any,
}
/**
 * 前の投稿を取得する
 */
const getPrevPost = async ({ slug }: { slug: string }) => {
    const posts = await readContentFiles()
    const findPrevPostIndex = () => {
        const index = posts.findIndex((post) => post.slug === slug) + 1 
        return !(index >= posts.length) ? index : -1
    }
    const prevPostIndex = findPrevPostIndex()
    return !(prevPostIndex === -1)
        ? posts[prevPostIndex]
        : {
            title: '',
            published: '',
            content: '',
            slug: '',
        }
}
/**
 * 後の投稿を取得する
 */
const getNextPost = async ({ slug }: { slug: string }) => {
    const posts = await readContentFiles()
    const findNextPostIndex = () => {
        const index = posts.findIndex((post) => post.slug === slug) - 1
        return index
    } 
    const nextPostIndex = findNextPostIndex()
    return !(nextPostIndex === -1)
        ? posts[nextPostIndex]
        : {
            title: '',
            published: '',
            content: '',
            slug: '',
        }
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

export { listContentFiles, readContentFiles, readContentFile, getPrevPost, getNextPost }