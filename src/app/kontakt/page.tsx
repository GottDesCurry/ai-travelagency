// app/kontakt/page.tsx
export const metadata = {
  title: 'Kontakt – Ba & Be Partners',
};

export default function KontaktPage() {
  return (
    <section className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Kontakt</h1>

      <div className="space-y-4">
        <p>Haben Sie Fragen oder Anregungen? Wir freuen uns auf Ihre Nachricht!</p>
        <ul className="space-y-2">
          <li>
            <strong>Adresse:</strong><br/>
            Inwilerriedstrasse 65<br/>
            6340 Baar, Schweiz
          </li>
          <li>
            <strong>Telefon:</strong> +41 XX XXX XX XX
          </li>
          <li>
            <strong>E-Mail:</strong><br/>
            <a href="mailto:info@ba-be-partners.ch" className="text-blue-600 underline">info@ba-be-partners.ch</a>
          </li>
        </ul>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Kontaktformular</h2>
        <form action="#" className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input type="text" name="name" className="mt-1 w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">E-Mail</label>
            <input type="email" name="email" className="mt-1 w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Nachricht</label>
            <textarea name="message" rows={4} className="mt-1 w-full border rounded p-2"></textarea>
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Absenden</button>
        </form>
      </div>
    </section>
  )
}
