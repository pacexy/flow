import clsx from 'clsx'
import { useCallback, useRef, useState } from 'react'
import { MdAdd, MdRemove } from 'react-icons/md'

import { RenditionSpread } from '@flow/epubjs/types/rendition'
import { useTranslation } from '@flow/reader/hooks'
import { reader, useReaderSnapshot } from '@flow/reader/models'
import {
  defaultSettings,
  TypographyConfiguration,
  useSettings,
} from '@flow/reader/state'
import { keys } from '@flow/reader/utils'

import { Select, TextField, TextFieldProps } from '../Form'
import { PaneViewProps, PaneView, Pane } from '../base'

// Define an interface for the Font object

enum TypographyScope {
  Book,
  Global,
}

export const TypographyView: React.FC<PaneViewProps> = (props) => {
  const { focusedBookTab } = useReaderSnapshot()
  const [settings, setSettings] = useSettings()
  const [scope, setScope] = useState(TypographyScope.Book)
  const t = useTranslation('typography')

  const [localFonts, setLocalFonts] = useState<string[]>([
    'default',
    'sans-serif',
    'serif',
  ])

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
              {t(`scope.${scopeName.toLowerCase()}`)}
            </button>
          ))}
      </div>
      <Pane
        headline={t('title')}
        className="space-y-3 px-5 pt-2 pb-4"
        key={`${scope}${focusedBookTab?.id}`}
      >
        <Select
          name={t('page_view')}
          value={spread ?? RenditionSpread.Auto}
          onChange={(e) => {
            setTypography('spread', e.target.value as RenditionSpread)
          }}
        >
          <option value={RenditionSpread.None}>
            {t('page_view.single_page')}
          </option>
          <option value={RenditionSpread.Auto}>
            {t('page_view.double_page')}
          </option>
        </Select>
        <Select
          name={t('font_family')}
          value={fontFamily ?? 'default'}
          onFocus={async () => {
            if ('queryLocalFonts' in window) {
              try {
                const fonts = await window.queryLocalFonts()
                console.log('fonts', fonts)
                const uniqueFontFamilies = Array.from(
                  new Set(fonts.map((font) => font.family)),
                )
                setLocalFonts(['default', ...uniqueFontFamilies])
              } catch (error) {
                console.error('Error querying local fonts:', error)
                // Fallback fonts are already set in the initial state
              }
            }
            // If queryLocalFonts is not available, we'll use the fallback fonts set in the initial state
          }}
          onChange={(e) => {
            setTypography(
              'fontFamily',
              e.target.value === 'default' ? undefined : e.target.value,
            )
          }}
        >
          {localFonts.map((font) => (
            <option
              key={font}
              value={font}
              style={{ fontFamily: font !== 'default' ? font : undefined }}
            >
              {font}
            </option>
          ))}
        </Select>
        <NumberField
          name={t('font_size')}
          min={14}
          max={28}
          defaultValue={fontSize && parseInt(fontSize)}
          onChange={(v) => {
            setTypography('fontSize', v ? v + 'px' : undefined)
          }}
        />
        <NumberField
          name={t('font_weight')}
          min={100}
          max={900}
          step={100}
          defaultValue={fontWeight}
          onChange={(v) => {
            setTypography('fontWeight', v || undefined)
          }}
        />
        <NumberField
          name={t('line_height')}
          min={1}
          step={0.1}
          defaultValue={lineHeight}
          onChange={(v) => {
            setTypography('lineHeight', v || undefined)
          }}
        />
        <NumberField
          name={t('zoom')}
          min={1}
          step={0.1}
          defaultValue={zoom}
          onChange={(v) => {
            setTypography('zoom', v || undefined)
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
  const t = useTranslation('action')

  return (
    <TextField
      as="input"
      type="number"
      placeholder="default"
      actions={[
        {
          title: t('step_down'),
          Icon: MdRemove,
          onClick: () => {
            if (!ref.current) return
            ref.current.stepDown()
            onChange(Number(ref.current.value))
          },
        },
        {
          title: t('step_up'),
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
