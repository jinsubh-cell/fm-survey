export const metadata = {
  title: '2025 FM Asset 연도대상 만족도 설문',
  description: 'FM Asset 연도대상 만족도 설문조사',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#F5F4EF', minHeight: '100vh' }}>
        {children}
      </body>
    </html>
  );
}
