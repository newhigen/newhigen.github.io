import fs from 'node:fs'
import path from 'node:path'

export interface Book {
  title: string
  englishTitle: string
  year: number
  month: number
}

export interface HeatmapCell {
  year: number
  month: number
  count: number
  books: Book[]
}

export interface YearGroup {
  year: number
  books: Book[]
  total: number
}

function parseCSV(csv: string): Book[] {
  const [, ...rows] = csv.trim().split('\n')
  return rows
    .filter(line => line.trim())
    .map(line => {
      const cols = line.split(',')
      const title = (cols[0] ?? '').replace(/^"|"$/g, '').trim()
      const englishTitle = (cols[1] ?? '').replace(/^"|"$/g, '').trim()
      const year = parseInt(cols[2] ?? '', 10)
      const month = parseInt(cols[3] ?? '', 10)
      return { title, englishTitle, year, month }
    })
    .filter(b => (b.title || b.englishTitle) && b.year && b.month)
}

export function loadBooks(): Book[] {
  const csvPath = path.resolve('./src/data/books.csv')
  const csv = fs.readFileSync(csvPath, 'utf-8')
  return parseCSV(csv).sort(
    (a, b) => b.year - a.year || b.month - a.month || a.title.localeCompare(b.title)
  )
}

export function getHeatmapData(books: Book[]): { cells: Map<string, HeatmapCell>; years: number[] } {
  const cells = new Map<string, HeatmapCell>()
  const yearSet = new Set<number>()

  for (const book of books) {
    yearSet.add(book.year)
    const key = `${book.year}-${String(book.month).padStart(2, '0')}`
    const existing = cells.get(key)
    if (existing) {
      existing.count++
      existing.books.push(book)
    } else {
      cells.set(key, { year: book.year, month: book.month, count: 1, books: [book] })
    }
  }

  const currentYear = new Date().getFullYear()
  const minYear = Math.min(...yearSet, currentYear)
  const years: number[] = []
  for (let y = currentYear; y >= minYear; y--) years.push(y)

  return { cells, years }
}

export function getBooksByYear(books: Book[]): YearGroup[] {
  const map = new Map<number, Book[]>()
  for (const book of books) {
    const list = map.get(book.year) ?? []
    list.push(book)
    map.set(book.year, list)
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => b - a)
    .map(([year, books]) => ({
      year,
      books: books.sort((a, b) => b.month - a.month || a.title.localeCompare(b.title)),
      total: books.length
    }))
}

export function intensityLevel(count: number): number {
  return Math.min(count, 4)
}
