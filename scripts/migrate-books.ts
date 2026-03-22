import fs from 'fs'
import path from 'path'

const BOOKS_POSTS_DIR = '/Users/newhigen/dev/books/_posts'
const BLOG_POSTS_DIR = '/Users/newhigen/dev/blog/src/content/posts'
const BLOG_DRAFTS_DIR = '/Users/newhigen/dev/blog/src/content/draft'

interface ParsedFrontmatter {
  title: string
  date: string
  permalink?: string
  published?: string | boolean
  [key: string]: unknown
}

function parseFrontmatter(raw: string): ParsedFrontmatter {
  const result: Record<string, unknown> = {}
  for (const line of raw.split('\n')) {
    const match = line.match(/^(\w[\w_-]*)\s*:\s*(.+)$/)
    if (match) {
      let value: string | boolean = match[2].trim()
      // Strip surrounding quotes
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      if (value === 'true') value = true as unknown as string
      if (value === 'false') value = false as unknown as string
      result[match[1]] = value
    }
  }
  return result as unknown as ParsedFrontmatter
}

function escapeYamlString(str: string): string {
  // If title contains colons, quotes, or special chars, wrap in quotes
  if (/[:#{}\[\]&*?|>!%@`]/.test(str) || str.includes("'") || str.includes('"')) {
    return `"${str.replace(/"/g, '\\"')}"`
  }
  return str
}

function main() {
  const files = fs.readdirSync(BOOKS_POSTS_DIR).filter(f => f.endsWith('.md'))
  console.log(`Found ${files.length} posts to migrate\n`)

  let postCount = 0
  let draftCount = 0

  for (const file of files) {
    const content = fs.readFileSync(path.join(BOOKS_POSTS_DIR, file), 'utf-8')

    // Parse frontmatter
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
    if (!fmMatch) {
      console.log(`SKIP (no frontmatter): ${file}`)
      continue
    }

    const [, frontmatterRaw, body] = fmMatch
    const fm = parseFrontmatter(frontmatterRaw)

    if (!fm.title || !fm.date) {
      console.log(`SKIP (missing title or date): ${file}`)
      continue
    }

    // Extract date parts from frontmatter date (YYYY-MM-DD)
    const dateStr = String(fm.date)
    const dateMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (!dateMatch) {
      console.log(`SKIP (bad date: ${dateStr}): ${file}`)
      continue
    }
    const [, yyyy, mm, dd] = dateMatch
    const yy = yyyy.slice(2)

    // Determine slug: prefer permalink, fall back to filename slug
    const slug =
      fm.permalink ||
      file
        .replace(/^\d{4}-\d{2}-\d{2}-/, '')
        .replace(/\.md$/, '')

    const newFilename = `${yy}${mm}${dd}_${slug}.md`

    // Build new frontmatter (only title + pubDate — blog schema is strict)
    const title = escapeYamlString(String(fm.title))
    const newFrontmatter = `---\ntitle: ${title}\npubDate: ${dateStr}\n---`

    const output = `${newFrontmatter}\n${body}`

    // Determine destination
    const isDraft = fm.published === false || fm.published === 'false'
    const outDir = isDraft ? BLOG_DRAFTS_DIR : BLOG_POSTS_DIR
    const outFilename = isDraft ? `_${newFilename}` : newFilename
    const outPath = path.join(outDir, outFilename)

    // Check for conflicts
    if (fs.existsSync(outPath)) {
      console.log(`CONFLICT (exists): ${outFilename}`)
      continue
    }

    fs.writeFileSync(outPath, output, 'utf-8')
    if (isDraft) {
      draftCount++
      console.log(`DRAFT: ${file} → draft/${outFilename}`)
    } else {
      postCount++
      console.log(`POST:  ${file} → posts/${newFilename}`)
    }
  }

  console.log(`\nDone: ${postCount} posts, ${draftCount} drafts migrated`)
}

main()
