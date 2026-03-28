import { Overlay } from '@literal-ui/core'
import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'
import { MdClose, MdTranslate, MdContentCopy, MdCheck } from 'react-icons/md'

import { useAIConfig, useTranslation } from '../hooks'
import { scale } from '../platform'

import { IconButton } from './Button'

interface TranslatePopupProps {
  text: string
  anchorRect: DOMRect
  containerRect: DOMRect
  viewRect: DOMRect
  onClose: () => void
}

export const TranslatePopup: React.FC<TranslatePopupProps> = ({
  text,
  anchorRect,
  containerRect,
  viewRect,
  onClose,
}) => {
  const [config] = useAIConfig()
  const t = useTranslation('menu')
  const [translatedText, setTranslatedText] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const popupRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(300) // Default width
  const [height, setHeight] = useState(100) // Default height
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!config.apiKey || !config.apiUrl || !config.modelName) {
      setError('AI configuration is incomplete')
      setLoading(false)
      return
    }

    const translate = async () => {
      try {
        const { translateText } = await import('../utils/translate')
        const result = await translateText(text, config)
        if (result.error) {
          setError(result.error)
        } else {
          setTranslatedText(result.text)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Translation failed')
      } finally {
        setLoading(false)
      }
    }

    translate()
  }, [text, config])

  useEffect(() => {
    if (popupRef.current) {
      const rect = popupRef.current.getBoundingClientRect()
      setWidth(rect.width)
      setHeight(rect.height)
    }
  }, [translatedText, loading, error])

  // copy button
  const handleCopy = async () => {
    if (!translatedText) return
    try {
      await navigator.clipboard.writeText(translatedText)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  // Calculate position relative to container
  const anchorLeft = anchorRect.left + viewRect.left - containerRect.left
  const anchorTop = anchorRect.top + viewRect.top - containerRect.top
  const anchorRight = anchorLeft + anchorRect.width
  const anchorBottom = anchorTop + anchorRect.height

  const viewportWidth = containerRect.width
  const viewportHeight = containerRect.height
  const margin = 8

  // Calculate available space in each direction
  const spaceRight = viewportWidth - anchorRight
  const spaceLeft = anchorLeft
  const spaceBottom = viewportHeight - anchorBottom
  const spaceTop = anchorTop

  // Determine horizontal position
  // If there's not enough space on the right, position to the left
  let left: number
  if (spaceRight >= width + margin) {
    // Enough space on the right, position to the right
    left = anchorRight + margin
  } else if (spaceLeft >= width + margin) {
    // Not enough space on right, but enough on left, position to the left
    left = anchorLeft - width - margin
  } else {
    // Not enough space on either side, center it or align to edges
    if (spaceLeft > spaceRight) {
      left = Math.max(0, anchorLeft - width)
    } else {
      left = Math.min(viewportWidth - width, anchorRight)
    }
  }

  // Determine vertical position
  // If there's not enough space below, position above
  let top: number
  if (spaceBottom >= height + margin) {
    // Enough space below, position below
    top = anchorBottom + margin
  } else if (spaceTop >= height + margin) {
    // Not enough space below, but enough above, position above
    top = anchorTop - height - margin
  } else {
    // Not enough space on either side, center it or align to edges
    if (spaceTop > spaceBottom) {
      top = Math.max(0, anchorTop - height)
    } else {
      top = Math.min(viewportHeight - height, anchorBottom)
    }
  }

  // Ensure the popup stays within viewport bounds
  left = Math.max(0, Math.min(left, viewportWidth - width))
  top = Math.max(0, Math.min(top, viewportHeight - height))

  return (
    <>
      <Overlay className="!z-[60] !bg-transparent" onMouseDown={onClose} />
      <div
        ref={popupRef}
        className={clsx(
          'bg-surface text-on-surface-variant shadow-2 absolute z-[60] max-w-sm rounded p-3',
        )}
        style={{
          left: `${left}px`,
          top: `${top}px`,
          minWidth: '200px',
          maxWidth: '400px',
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MdTranslate size={scale(18, 20)} />
            <span className="typescale-label-medium text-on-surface-variant">
              {t('translate')}
            </span>
          </div>
          <div className="flex gap-1">
            {/* 复制按钮：成功后短暂显示 ✔️ */}
            {!loading && !error && translatedText && (
              <IconButton
                title={copied ? t('copied') : t('copy')}
                Icon={copied ? MdCheck : MdContentCopy}
                size={scale(18, 20)}
                onClick={handleCopy}
                className={copied ? 'text-success' : ''}
              />
            )}
            <IconButton
              title={t('close')}
              Icon={MdClose}
              size={scale(18, 20)}
              onClick={onClose}
            />
          </div>
        </div>
        <div className="typescale-body-medium text-on-surface">
          {loading && (
            <div className="text-on-surface-variant">
              {t('translate.loading')}
            </div>
          )}
          {error && (
            <div className="text-error text-on-surface-variant">{error}</div>
          )}
          {!loading && !error && translatedText && (
            <div className="whitespace-pre-wrap">{translatedText}</div>
          )}
        </div>
      </div>
    </>
  )
}
