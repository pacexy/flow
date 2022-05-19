import { useSnapshot } from 'valtio'

import { reader } from '../Reader'

import { View, ViewProps } from './View'

export const ImageView: React.FC<ViewProps> = (props) => {
  const { focusedTab } = useSnapshot(reader)

  const resources = focusedTab?.epub.resources
  // @ts-ignore
  const blobs = resources?.replacementUrls
  // @ts-ignore
  const assets = resources?.assets as []

  if (!resources) return null

  return (
    <View {...props}>
      <div className="scroll">
        {assets.map((a: any, i) => {
          if (!blobs[i] || !a.type.includes('image')) return null
          return (
            <img
              className="w-full cursor-pointer px-5 py-2"
              key={i}
              src={blobs[i]}
              alt={a.href}
              onClick={() => focusedTab?.locateToImage(a.href)}
            />
          )
        })}
      </div>
    </View>
  )
}
