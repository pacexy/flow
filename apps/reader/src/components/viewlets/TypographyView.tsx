import { useMounted } from '@literal-ui/hooks'
import clsx from 'clsx'
import { useRef, useState } from 'react'
import { MdAdd, MdRemove } from 'react-icons/md'
import { useRecoilState } from 'recoil'

import { settingsState } from '@ink/reader/state'

import { TextField, TextFieldProps } from '../TextField'
import { PaneViewProps, PaneView, Pane } from '../base'

export const TypographyView: React.FC<PaneViewProps> = ({
  className,
  ...props
}) => {
  const [settings, setSettings] = useRecoilState(settingsState)
  return (
    <PaneView className={clsx('space-y-4', className)} {...props}>
      <div className="mx-5 space-y-2">
        <NumberField
          name="font_size"
          min={14}
          max={28}
          defaultValue={parseInt(settings.fontSize)}
          onChange={(v) => {
            setSettings((prev) => ({
              ...prev,
              fontSize: v + 'px',
            }))
          }}
        />
        <NumberField
          name="font_weight"
          min={100}
          max={900}
          step={100}
          defaultValue={settings.fontWeight}
          onChange={(v) => {
            setSettings((prev) => ({
              ...prev,
              fontWeight: v,
            }))
          }}
        />
        <NumberField
          name="line_height"
          step={0.1}
          defaultValue={settings.lineHeight}
          onChange={(v) => {
            setSettings((prev) => ({
              ...prev,
              lineHeight: v,
            }))
          }}
        />
      </div>
      <TypeFacePane />
    </PaneView>
  )
}

interface NumberFieldProps extends Omit<TextFieldProps<'input'>, 'onChange'> {
  onChange: (v: number) => void
}
export const NumberField: React.FC<NumberFieldProps> = ({
  onChange,
  ...props
}) => {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <TextField
      as="input"
      type="number"
      actions={[
        {
          title: 'Step down',
          Icon: MdRemove,
          onClick: () => {
            if (!ref.current) return
            ref.current.stepDown()
            onChange(Number(ref.current.value))
          },
        },
        {
          title: 'Step up',
          Icon: MdAdd,
          onClick: () => {
            if (!ref.current) return
            ref.current.stepUp()
            onChange(Number(ref.current.value))
          },
        },
      ]}
      mRef={ref}
      onChange={(e) => {
        onChange(Number(e.target.value))
      }}
      {...props}
    />
  )
}

const typefaces = ['sans-serif', 'serif']

const TypeFacePane: React.FC = () => {
  const [sentence, setSentence] = useState(
    'The quick brown fox jumps over the lazy dog.',
  )
  return (
    <Pane headline="Typeface" className="mx-5">
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

  // avoid hydration mismatching
  if (!useMounted()) return null

  const active = settings.fontFamily === fontFamily

  return (
    <button
      className={clsx(
        'typescale-body-medium space-y-1 text-left',
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
