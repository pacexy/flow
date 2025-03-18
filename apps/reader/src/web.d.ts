// https://github.com/christianliebel/paint/blob/850a57cd3cc6f6532791abb6d20d9228ceffb74f/types/static.d.ts#L66
// Type declarations for File Handling API

interface LaunchParams {
  files: FileSystemFileHandle[]
}

interface LaunchQueue {
  setConsumer(consumer: (launchParams: LaunchParams) => any): void
}

interface LocalFont {
  family: string
  fullName: string
  postscriptName: string
  style: string
}

interface Window {
  launchQueue: LaunchQueue
  queryLocalFonts: () => Promise<LocalFont[]>
}
