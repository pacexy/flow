import clsx from 'clsx'
import { useCallback, useRef, useState } from 'react'
import { MdAdd, MdRemove } from 'react-icons/md'

import { RenditionSpread } from '@ink/epubjs/types/rendition'
import { reader, useReaderSnapshot } from '@ink/reader/models'
import {
  defaultSettings,
  TypographyConfiguration,
  useSettings,
} from '@ink/reader/state'
import { keys } from '@ink/reader/utils'

import { Select, TextField, TextFieldProps } from '../Form'
import { PaneViewProps, PaneView, Pane } from '../base'

enum TypographyScope {
  Book,
  Global,
}

const typefaces = ['default', 'sans-serif', 'serif']

export const TypographyView: React.FC<PaneViewProps> = (props) => {
  const { focusedBookTab } = useReaderSnapshot()
  const [settings, setSettings] = useSettings()
  const [scope, setScope] = useState(TypographyScope.Book)

  const { fontFamily, fontSize, fontWeight, lineHeight, zoom, spread } =
    scope === TypographyScope.Book
      ? focusedBookTab?.book.configuration?.typography ?? defaultSettings
      : settings

  const setTypography = useCallback(
    <K extends keyof TypographyConfiguration>(
      k: K,
      v: TypographyConfiguration[K],
    ) => {
      if (scope === TypographyScope.Book) {
        reader.focusedBookTab?.updateBook({
          configuration: {
            ...reader.focusedBookTab.book.configuration,
            typography: {
              ...reader.focusedBookTab.book.configuration?.typography,
              [k]: v,
            },
          },
        })
      } else {
        setSettings((prev) => ({
          ...prev,
          [k]: v,
        }))
      }
    },
    [scope, setSettings],
  )

  return (
    <PaneView {...props}>
      <div className="typescale-body-medium flex gap-2 px-5 pb-2 !text-[13px]">
        {keys(TypographyScope)
          .filter((k) => isNaN(Number(k)))
          .map((scopeName) => (
            <button
              key={scopeName}
              className={clsx(
                TypographyScope[scopeName] === scope
                  ? 'text-on-surface-variant'
                  : 'text-outline/60',
              )}
              onClick={() => setScope(TypographyScope[scopeName])}
            >
              {scopeName}
            </button>
          ))}
      </div>
      <Pane
        headline="Typography"
        className="space-y-3 px-5 pt-2 pb-4"
        key={`${scope}${focusedBookTab?.id}`}
      >
        <Select
          name="Page View"
          value={spread ?? RenditionSpread.Auto}
          onChange={(e) => {
            setTypography('spread', e.target.value as RenditionSpread)
          }}
        >
          <option value={RenditionSpread.Auto}>Double Page</option>
          <option value={RenditionSpread.None}>Single Page</option>
        </Select>
        <Select
          name="Font Family"
          value={fontFamily}
          onChange={(e) => {
            setTypography('fontFamily', e.target.value)
          }}
        >
          {typefaces.map((t) => (
            <option key={t} value={t} style={{ fontFamily: t }}>
              {t}
            </option>
          ))}
        </Select>
        <NumberField
          name="Font Size"
          min={14}
          max={28}
          defaultValue={fontSize && parseInt(fontSize)}
          onChange={(v) => {
            setTypography('fontSize', v ? v + 'px' : undefined)
          }}
        />
        <NumberField
          name="Font Weight"
          min={100}
          max={900}
          step={100}
          defaultValue={fontWeight}
          onChange={(v) => {
            setTypography('fontWeight', v || undefined)
          }}
        />
        <NumberField
          name="Line Height"
          min={1}
          step={0.1}
          defaultValue={lineHeight}
          onChange={(v) => {
            setTypography('lineHeight', v || undefined)
          }}
        />
        <NumberField
          name="Zoom"
          min={1}
          step={0.1}
          defaultValue={zoom}
          onChange={(v) => {
            setTypography('zoom', v ?? 1)
          }}
        />
      </Pane>
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
