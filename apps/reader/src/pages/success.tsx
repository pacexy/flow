import { useState, useEffect } from 'react'

import { OAUTH_SUCCESS_MESSAGE } from '../sync'

export default function Success() {
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    // https://developer.mozilla.org/en-US/docs/Web/API/Window/opener
    const opener: Window | null = window.opener
    opener?.postMessage(OAUTH_SUCCESS_MESSAGE)

    const id = setInterval(() => {
      setCountdown((cd) => {
        if (cd > 1) return cd - 1

        clearInterval(id)
        window.close()
        return cd
      })
    }, 1000)
  }, [])

  return (
    <div className="flex h-full items-center justify-center text-center">
      <div>
        <h1 className="typescale-headline-large text-green-600">
          Oauth success
        </h1>
        <p className="typescale-body-large text-on-surface-variant">
          This window will close in {countdown}s.
        </p>
      </div>
    </div>
  )
}
