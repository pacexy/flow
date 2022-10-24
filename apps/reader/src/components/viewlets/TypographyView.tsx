import { useMounted } from '@literal-ui/hooks'
import clsx from 'clsx'
import { useRef, useState } from 'react'
import { MdAdd, MdRemove } from 'react-icons/md'

import { RenditionSpread } from '@ink/epubjs/types/rendition'
import { useSettings } from '@ink/reader/state'

import { Select, TextField, TextFieldProps } from '../Form'
import { PaneViewProps, PaneView, Pane } from '../base'

export const TypographyView: React.FC<PaneViewProps> = (props) => {
  const [{ fontSize, fontWeight, lineHeight, zoom, spread }, setSettings] =
    useSettings()

  return (
    <PaneView {...props}>
      <Pane headline="Typography" className="space-y-3 px-5 pt-2 pb-4">
        <Select
          name="Page View"
          value={spread ?? RenditionSpread.Auto}
          onChange={(e) => {
            setSettings((prev) => ({
              ...prev,
              spread: e.target.value as RenditionSpread,
            }))
          }}
        >
          <option value={RenditionSpread.Auto}>Double Page</option>
          <option value={RenditionSpread.None}>Single Page</option>
        </Select>
        <NumberField
          name="Font Size"
          min={14}
          max={28}
          defaultValue={fontSize && parseInt(fontSize)}
          onChange={(v) => {
            setSettings((prev) => ({
              ...prev,
              fontSize: v ? v + 'px' : undefined,
            }))
          }}
        />
        <NumberField
          name="Font Weight"
          min={100}
          max={900}
          step={100}
          defaultValue={fontWeight}
          onChange={(v) => {
            setSettings((prev) => ({
              ...prev,
              fontWeight: v || undefined,
            }))
          }}
        />
        <NumberField
          name="Line Height"
          min={1}
          step={0.1}
          defaultValue={lineHeight}
          onChange={(v) => {
            setSettings((prev) => ({
              ...prev,
              lineHeight: v || undefined,
            }))
          }}
        />
        <NumberField
          name="Zoom"
          min={1}
          step={0.1}
          defaultValue={zoom}
          onChange={(v) => {
            setSettings((prev) => ({
              ...prev,
              zoom: v ?? 1,
            }))
          }}
        />
      </Pane>
      <TypeFacePane />
    </PaneView>
  )
}

interface NumberFieldProps extends Omit<TextFieldProps<'input'>, 'onChange'> {
  onChange: (v?: number) => void
}
const NumberField: React.FC<NumberFieldProps> = ({ onChange, ...props }) => {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <TextField
      as="input"
      type="number"
      placeholder="default"
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
      // lazy render
      onBlur={(e) => {
        onChange(Number(e.target.value))
      }}
      onClear={() => {
        if (ref.current) ref.current.value = ''
        onChange(undefined)
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
    <Pane headline="Typeface" className="px-5">
      <TextField
        as="textarea"
        name="Sentence"
        defaultValue={sentence}
        onChange={(e) => setSentence(e.target.value)}
        className="mt-2 mb-4"
      />
      <div className="flex flex-col gap-4">
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
const Typeface: React.FC<TypefaceProps> = ({ fontFamily, sentence }) => {
  const [settings, setSettings] = useSettings()

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
