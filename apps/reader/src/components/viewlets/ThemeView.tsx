import clsx from 'clsx'
import { range } from 'packages/internal/src'
import { ComponentProps } from 'react'

import { useBackground, useColorScheme } from '@ink/reader/hooks'
import { useSettings } from '@ink/reader/state'

import { ColorPicker, Label } from '../Form'
import { PaneViewProps, PaneView, Pane } from '../base'

export const ThemeView: React.FC<PaneViewProps> = (props) => {
  const [{ theme }, setSettings] = useSettings()
  const { setScheme } = useColorScheme()

  const [, setBackground] = useBackground()

  return (
    <PaneView {...props}>
      <Pane headline="Theme" className="space-y-3 px-5 pt-2 pb-4">
        <div>
          <ColorPicker
            name="Source Color"
            defaultValue={theme?.source ?? '#fff'}
            onChange={(e) => {
              setSettings((prev) => ({
                ...prev,
                theme: {
                  ...prev.theme,
                  source: e.target.value,
                },
              }))
            }}
          />
        </div>
        <div>
          <Label name="Background Color"></Label>
          <div className="flex gap-2">
            {range(7)
              .filter((i) => !(i % 2))
              .map((i) => i - 1)
              .map((i) => (
                <Background
                  key={i}
                  className={i > 0 ? `bg-surface${i}` : 'bg-white'}
                  onClick={() => {
                    setScheme('light')
                    setBackground(i)
                  }}
                />
              ))}
            <Background
              className="bg-black"
              onClick={() => {
                setScheme('dark')
              }}
            />
          </div>
        </div>
      </Pane>
    </PaneView>
  )
}

interface BackgroundProps extends ComponentProps<'div'> {}
const Background: React.FC<BackgroundProps> = ({ className, ...props }) => {
  return (
    <div
      className={clsx('border-outline-variant light h-6 w-6 border', className)}
      {...props}
    ></div>
  )
}
