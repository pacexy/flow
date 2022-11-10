import {
  redFromArgb,
  greenFromArgb,
  blueFromArgb,
  argbFromRgb,
  hexFromArgb,
} from '@material/material-color-utilities'

export function rgbFromArgb(argb: number) {
  return [redFromArgb, greenFromArgb, blueFromArgb].map((f) => f(argb))
}

function compositeChannels(channel1: number, channel2: number, p: number) {
  return (1 - p) * channel1 + p * channel2
}

// https://en.wikipedia.org/wiki/Transparency_%28graphic%29#Compositing_calculations
export function compositeColors(color1: number, color2: number, p: number) {
  const [r1, g1, b1] = rgbFromArgb(color1)
  const [r2, g2, b2] = rgbFromArgb(color2)
  return hexFromArgb(
    argbFromRgb(
      compositeChannels(r1!, r2!, p),
      compositeChannels(g1!, g2!, p),
      compositeChannels(b1!, b2!, p),
    ),
  )
}
