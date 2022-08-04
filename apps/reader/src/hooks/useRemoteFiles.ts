import { supabaseClient } from '@supabase/auth-helpers-nextjs'
import { FileObject } from '@supabase/storage-js'
import { useEffect, useState } from 'react'

import { useSubscription } from './useSubscription'

export function useRemoteFiles() {
  const [remoteFiles, setRemoteFiles] = useState<FileObject[] | null>()
  const subscription = useSubscription()

  useEffect(() => {
    if (!subscription) return

    supabaseClient.storage
      .from('books')
      .list(subscription.email)
      .then(({ data }) => {
        setRemoteFiles(data)
      })
  }, [subscription])

  return remoteFiles
}
