export const PreventFlash: React.FC = () => {
  const setColorScheme = () => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const scheme = localStorage.getItem('literal-color-scheme') ?? 'system'

    if (scheme === '"dark"' || (scheme === '"system"' && mql.matches))
      document.documentElement.classList.toggle('dark', true)
  }
  return (
    <>
      <style>{`
        html.dark {
          background: #121212;
        }
      `}</style>
      <script
        dangerouslySetInnerHTML={{ __html: `(${setColorScheme})()` }}
      ></script>
    </>
  )
}
