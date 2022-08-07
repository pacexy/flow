import { supabaseClient } from '@supabase/auth-helpers-nextjs'
import { FileObject } from '@supabase/storage-js'
import { useEffect } from 'react'
import { atom, useRecoilValue, useSetRecoilState } from 'recoil'

import { useSubscription } from './useSubscription'

const remoteFilesState = atom<FileObject[] | undefined | null>({
  key: 'remote.files',
  default: undefined,
})

export function useInitRemoteFiles() {
  const setRemoteFiles = useSetRecoilState(remoteFilesState)
  const subscription = useSubscription()

  useEffect(() => {
    if (subscription?.status !== 'active') return

    supabaseClient.storage
      .from('books')
      .list(subscription.email)
      .then(({ data }) => {
        setRemoteFiles(data)
      })
  }, [setRemoteFiles, subscription])
}

export function useRemoteFiles() {
  return useRecoilValue(remoteFilesState)
}
