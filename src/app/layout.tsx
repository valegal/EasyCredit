import './globals.css'
import SessionProvider from './SessionProvider';
// ----------------------------------------------------------------------

export const metadata = {
  title: 'EasyCredit',
  description:'Plataforma EasyCredit',
  keywords: 'microcreditos, creditos, credit, debit, debito, finanzas, capital, prestamos, sencillo, formulario de datos, credimonto, microcréditos, préstamos, Colombia',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full bg-white">
      <body className="h-full">
      <SessionProvider>
        {children}
      </SessionProvider>
      </body>
    </html>
  )
}