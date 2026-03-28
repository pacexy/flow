import { useRecoilState } from 'recoil'

import { aiConfigState, AIConfig } from '../state'

export function useAIConfig(): [AIConfig, (config: AIConfig) => void] {
  const [config, setConfig] = useRecoilState(aiConfigState)
  return [config, setConfig]
}
