// app/layout.js
import './globals.css'

export const metadata = {
  title: 'Prayer Times App',
  description: 'Shows current prayer time and time left before the next prayer',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-gray-100 text-gray-800">
        {children}
      </body>
    </html>
  )
}
