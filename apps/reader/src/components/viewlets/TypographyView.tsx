import clsx from 'clsx'
import { ElementType, useState } from 'react'
import { PolymorphicPropsWithoutRef } from 'react-polymorphic-types'
import { useRecoilState } from 'recoil'

import { settingsState } from '@ink/reader/state'

import { Pane } from './Pane'
import { View } from './View'

export const TypographyView: React.FC = ({}) => {
  const [settings, setSettings] = useRecoilState(settingsState)
  return (
    <View className="space-y-4">
      <TextField
        as="input"
        name="font_size"
        type="number"
        min={14}
        max={28}
        defaultValue={settings.fontSize}
        onChange={(e) => {
          setSettings((prev) => ({
            ...prev,
            fontSize: Number(e.target.value),
          }))
        }}
      />
      <TextField
        as="input"
        name="font_weight"
        type="number"
        min={100}
        max={900}
        step={100}
        defaultValue={settings.fontWeight}
        onChange={(e) => {
          setSettings((prev) => ({
            ...prev,
            fontWeight: Number(e.target.value),
          }))
        }}
      />
      <TextField
        as="input"
        name="line_height"
        type="number"
        step={0.1}
        defaultValue={settings.lineHeight}
        onChange={(e) => {
          setSettings((prev) => ({
            ...prev,
            lineHeight: Number(e.target.value),
          }))
        }}
      />
      <TypeFacePane />
    </View>
  )
}

const typefaces = ['黑体', '宋体', 'sans-serif', 'serif']

const TypeFacePane: React.FC = ({}) => {
  const [sentence, setSentence] = useState(
    'The quick brown fox jumps over the lazy dog.',
  )
  return (
    <Pane headline="Typeface">
      <TextField
        as="textarea"
        name="sentence"
        defaultValue={sentence}
        onChange={(e) => setSentence(e.target.value)}
        className="mt-2 mb-4"
      />
      <div className="space-y-4">
        {typefaces.map((t) => (
          <Typeface key={t} fontFamily={t} sentence={sentence} />
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
  const [settings, setSettings] = useRecoilState(settingsState)
  const active = settings.fontFamily === fontFamily
  return (
    <button
      className={clsx(
        'typescale-body-medium space-y-1 px-5 text-left',
        active ? 'text-on-surface-variant' : 'text-outline/60',
      )}
      onClick={() => {
        setSettings((prev) => ({
          ...prev,
          fontFamily: active ? undefined : fontFamily,
        }))
      }}
    >
      <div>{fontFamily}</div>
      <div style={{ fontFamily }}>{sentence}</div>
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
    <div
      className={clsx(
        'text-on-surface-variant flex flex-col gap-2 px-5',
        className,
      )}
    >
      <label htmlFor={name} className="typescale-label-medium uppercase">
        {name}
      </label>
      <Component
        name={name}
        id={name}
        className="typescale-body-medium p-1"
        {...props}
      />
    </div>
  )
}
