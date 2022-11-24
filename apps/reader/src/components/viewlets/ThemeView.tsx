import clsx from 'clsx'
import { ComponentProps } from 'react'

import { range } from '@flow/internal'
import {
  useBackground,
  useColorScheme,
  useSourceColor,
} from '@flow/reader/hooks'

import { ColorPicker, Label } from '../Form'
import { PaneViewProps, PaneView, Pane } from '../base'

export const ThemeView: React.FC<PaneViewProps> = (props) => {
  const { setScheme } = useColorScheme()
  const { sourceColor, setSourceColor } = useSourceColor()

  const [, setBackground] = useBackground()

  return (
    <PaneView {...props}>
      <Pane headline="Theme" className="space-y-3 px-5 pt-2 pb-4">
        <div>
          <ColorPicker
            name="Source Color"
            defaultValue={sourceColor}
            onChange={(e) => {
              setSourceColor(e.target.value)
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
