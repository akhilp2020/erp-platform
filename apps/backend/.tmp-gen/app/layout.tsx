export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html><body className="p-6 font-sans">{children}</body></html>;
}