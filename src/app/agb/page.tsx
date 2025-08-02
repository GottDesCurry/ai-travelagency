// Beispiel: app/agb/page.tsx (mit react-markdown)
import fs from 'fs'
import path from 'path'
import ReactMarkdown from 'react-markdown'

export const metadata = {
  title: 'AGB – Book Repeat',
}

export default async function AGBPage() {
  const filePath = path.join(process.cwd(), 'src', 'content', 'agb.md')
  const fileContents = fs.readFileSync(filePath, 'utf8')

  return (
    <section className="max-w-5xl mx-auto p-6">
      <div className="prose prose-lg">
        <ReactMarkdown>{fileContents}</ReactMarkdown>
      </div>
    </section>
  )
}
