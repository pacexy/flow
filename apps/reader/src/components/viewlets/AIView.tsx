import { useState } from 'react'
import { MdVisibility, MdVisibilityOff } from 'react-icons/md'

import { useTranslation, useAIConfig } from '@flow/reader/hooks'

import { TextField } from '../Form'
import { PaneViewProps, PaneView, Pane } from '../base'

export const AIView: React.FC<PaneViewProps> = (props) => {
  const [config, setConfig] = useAIConfig()
  const [showApiKey, setShowApiKey] = useState(false)
  const t = useTranslation('ai')

  return (
    <PaneView {...props}>
      <Pane headline={t('title')} className="space-y-3 px-5 pt-2 pb-4">
        <div>
          <TextField
            name={t('api_key')}
            type={showApiKey ? 'text' : 'password'}
            value={config.apiKey || ''}
            onChange={(e) => {
              setConfig({
                ...config,
                apiKey: e.target.value,
              })
            }}
            placeholder={t('api_key.placeholder')}
            actions={[
              {
                title: showApiKey ? t('api_key.hide') : t('api_key.show'),
                Icon: showApiKey ? MdVisibilityOff : MdVisibility,
                onClick: () => {
                  setShowApiKey(!showApiKey)
                },
              },
            ]}
          />
        </div>
        <div>
          <TextField
            name={t('api_url')}
            type="url"
            value={config.apiUrl || ''}
            onChange={(e) => {
              setConfig({
                ...config,
                apiUrl: e.target.value,
              })
            }}
            placeholder={t('api_url.placeholder')}
          />
        </div>
        <div>
          <TextField
            name={t('model_name')}
            value={config.modelName || ''}
            onChange={(e) => {
              setConfig({
                ...config,
                modelName: e.target.value,
              })
            }}
            placeholder={t('model_name.placeholder')}
          />
        </div>
        <div>
          <TextField
            name={t('translate_prompt')}
            as="textarea"
            value={config.translatePrompt || ''}
            onChange={(e) => {
              setConfig({
                ...config,
                translatePrompt: e.target.value,
              })
            }}
            placeholder={t('translate_prompt.placeholder')}
            className="min-h-[100px]"
          />
        </div>
        <div>
          <TextField
            name={t('summarize_prompt')}
            as="textarea"
            value={config.summarizePrompt || ''}
            onChange={(e) => {
              setConfig({
                ...config,
                summarizePrompt: e.target.value,
              })
            }}
            placeholder={t('summarize_prompt.placeholder')}
            className="min-h-[100px]"
          />
        </div>
      </Pane>
    </PaneView>
  )
}
