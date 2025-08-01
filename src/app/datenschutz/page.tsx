// app/datenschutz/page.tsx
import fs from 'fs'
import path from 'path'
import ReactMarkdown from 'react-markdown'

export const metadata = {
  title: 'Datenschutz – Book Repeat',
}

export default async function DatenschutzPage() {
  const filePath = path.join(process.cwd(), 'src', 'content', 'datenschutz.md')
  const fileContents = fs.readFileSync(filePath, 'utf8')

  return (
    <section className="max-w-5xl mx-auto p-6">
      <ReactMarkdown className="prose prose-lg">{fileContents}</ReactMarkdown>
    </section>
  )
}
