import clsx from 'clsx'
import { ElementType, useState } from 'react'
import { PolymorphicPropsWithoutRef } from 'react-polymorphic-types'
import { useRecoilValue } from 'recoil'

import { renditionState } from '@ink/reader/state'

import { Pane } from './Pane'
import { View } from './View'

export const TypographyView: React.FC = ({}) => {
  return (
    <View className="space-y-4">
      <TextField name="font_size" type="number" min={14} max={28} />
      <TextField
        name="font_weight"
        type="number"
        min={400}
        max={900}
        step={100}
      />
      <TextField name="line_height" type="number" />
      <TypeFacePane />
    </View>
  )
}

const typefaces = ['黑体', '宋体', 'sans-serif', 'serif']

const TypeFacePane: React.FC = ({}) => {
  const [sentence, setSentence] = useState('')
  return (
    <Pane headline="Typeface">
      <TextField
        as="textarea"
        name="sentence"
        onChange={(e) => {
          setSentence(e.target.value)
        }}
        className="mt-2 mb-4"
      />
      <div className="space-y-4">
        {typefaces.map((t) => (
          <Typeface fontFamily={t} sentence={sentence} />
        ))}
      </div>
    </Pane>
  )
}

interface TypefaceProps {
  fontFamily: string
  sentence: string
}
export const Typeface: React.FC<TypefaceProps> = ({ fontFamily, sentence }) => {
  const rendition = useRecoilValue(renditionState)
  return (
    <button
      className="typescale-body-medium space-y-1 px-[22px] text-left"
      onClick={() => {
        rendition?.themes.font(fontFamily)
      }}
    >
      <div className="text-on-surface">{fontFamily}</div>
      <div className="text-on-surface-variant" style={{ fontFamily }}>
        {sentence || 'The quick brown fox jumps over the lazy dog.'}
      </div>
    </button>
  )
}

type TextFieldProps<T extends ElementType> = PolymorphicPropsWithoutRef<
  {
    name: string
  },
  T
>
export function TextField<T extends ElementType = 'input'>({
  name,
  as,
  className,
  ...props
}: TextFieldProps<T>) {
  const Component = as || 'input'
  return (
    <div className={clsx('flex flex-col gap-2 px-[22px]', className)}>
      <label
        htmlFor={name}
        className="text-on-surface-variant typescale-label-medium uppercase"
      >
        {name}
      </label>
      <Component
        name={name}
        id={name}
        className="typescale-body-medium text-on-surface px-2 py-1"
        {...props}
      />
    </div>
  )
}
