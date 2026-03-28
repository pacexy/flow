import { Overlay } from '@literal-ui/core'
import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'
import { MdClose, MdSmartToy, MdSummarize, MdTranslate } from 'react-icons/md'

import { useAIConfig, useTranslation } from '../hooks'
import { BookTab } from '../models'
import { scale } from '../platform'

import { IconButton } from './Button'

interface AIAssistantProps {
  tab: BookTab
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ tab }) => {
  const [position, setPosition] = useState({ x: 20, y: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [summaryText, setSummaryText] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [translating, setTranslating] = useState(false)
  const [translateProgress, setTranslateProgress] = useState(0)
  const [translateStatus, setTranslateStatus] = useState<string>('')
  const buttonRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const dragStartPos = useRef({ x: 0, y: 0 })
  const dragStartMousePos = useRef({ x: 0, y: 0 })
  const hasDragged = useRef(false)
  const [config] = useAIConfig()
  const t = useTranslation('ai_assistant')

  // Load saved position from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('aiAssistantPosition')
    if (saved) {
      try {
        const { x, y } = JSON.parse(saved)
        setPosition({ x, y })
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, [])

  // Save position to localStorage
  useEffect(() => {
    if (!isDragging) {
      localStorage.setItem('aiAssistantPosition', JSON.stringify(position))
    }
  }, [position, isDragging])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return // Only handle left mouse button
    e.preventDefault()
    e.stopPropagation()

    const container = tab.container
    if (!container) return

    // Reset drag flag
    hasDragged.current = false

    // Store initial button position relative to container
    dragStartPos.current = { ...position }

    // Store initial mouse position relative to viewport
    dragStartMousePos.current = {
      x: e.clientX,
      y: e.clientY,
    }

    setIsDragging(true)
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const container = tab.container
      if (!container) {
        setIsDragging(false)
        return
      }

      const containerRect = container.getBoundingClientRect()
      const buttonRect = buttonRef.current?.getBoundingClientRect()
      if (!buttonRect) return

      // Calculate mouse movement delta
      const deltaX = e.clientX - dragStartMousePos.current.x
      const deltaY = e.clientY - dragStartMousePos.current.y

      // Check if moved enough to be considered a drag (threshold: 5px)
      const dragDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      if (dragDistance > 5) {
        hasDragged.current = true
      }

      // Calculate new position based on initial position + delta
      const newX = dragStartPos.current.x + deltaX
      const newY = dragStartPos.current.y + deltaY

      // Constrain to container bounds
      const maxX = containerRect.width - buttonRect.width
      const maxY = containerRect.height - buttonRect.height

      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      })
    }

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
    }

    const handleMouseLeave = () => {
      // If mouse leaves the window, stop dragging
      setIsDragging(false)
    }

    // Use capture phase to ensure we catch events early
    // Use passive: false for mousemove to allow preventDefault
    document.addEventListener('mousemove', handleMouseMove, {
      passive: false,
      capture: true,
    })
    document.addEventListener('mouseup', handleMouseUp, {
      passive: true,
      capture: true,
    })
    // Listen for mouse leave to handle mouse leaving window
    document.addEventListener('mouseleave', handleMouseLeave, {
      passive: true,
    })

    return () => {
      document.removeEventListener('mousemove', handleMouseMove, {
        capture: true,
      })
      document.removeEventListener('mouseup', handleMouseUp, { capture: true })
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [isDragging, tab.container])

  const handleSummarize = async () => {
    setShowMenu(false)
    setShowSummary(true)
    setLoading(true)
    setError('')

    try {
      // Get current page content
      const contents = tab.rendition?.getContents()
      if (!contents || contents.length === 0) {
        setError(t('summarize.error.no_content'))
        setLoading(false)
        return
      }

      const view = contents[0]
      const doc = view.document
      const text = doc.body.textContent?.trim() || ''

      if (!text) {
        setError(t('summarize.error.no_text'))
        setLoading(false)
        return
      }

      const { summarizeText } = await import('../utils/summarize')
      const result = await summarizeText(text, config)

      if (result.error) {
        setError(result.error)
      } else {
        setSummaryText(result.text)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('summarize.error.failed'))
    } finally {
      setLoading(false)
    }
  }

  const handleTranslatePage = async () => {
    setShowMenu(false)
    setTranslating(true)
    setTranslateProgress(0)
    setTranslateStatus('')
    setError('')

    try {
      // Get current page content
      const contents = tab.rendition?.getContents()
      if (!contents || contents.length === 0) {
        setError(t('translate.error.no_content'))
        setTranslating(false)
        return
      }

      const view = contents[0]
      const doc = view.document

      // Check if already translated
      const hasTranslations = doc.querySelector('.ai-translation')
      if (hasTranslations) {
        // Remove existing translations
        const { removeTranslations } = await import('../utils/translatePage')
        removeTranslations(doc)
        // Trigger reflow
        tab.rendition?.resize()
        setTranslating(false)
        setTranslateStatus(t('translate.removed'))
        setTimeout(() => setTranslateStatus(''), 2000)
        return
      }

      // Extract paragraphs
      const { extractParagraphs, translatePage } = await import(
        '../utils/translatePage'
      )
      const paragraphs = extractParagraphs(doc)

      if (paragraphs.length === 0) {
        setError(t('translate.error.no_paragraphs'))
        setTranslating(false)
        return
      }

      setTranslateStatus(`${t('translate.progress')}: 0/${paragraphs.length}`)

      // Translate paragraphs
      const result = await translatePage(paragraphs, config, (progress) => {
        setTranslateProgress(progress)
        const current = Math.round(progress * paragraphs.length)
        setTranslateStatus(
          `${t('translate.progress')}: ${current}/${paragraphs.length}`,
        )
      })

      // Trigger reflow to adjust page layout
      tab.rendition?.resize()

      if (result.success > 0) {
        const successText = t('translate.success.detail')
          .replace('{success}', result.success.toString())
          .replace('{failed}', result.failed.toString())
        setTranslateStatus(`${t('translate.success')}: ${successText}`)
      } else {
        setError(t('translate.error.failed'))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('translate.error.failed'))
    } finally {
      setTranslating(false)
      setTimeout(() => {
        setTranslateStatus('')
        setTranslateProgress(0)
      }, 3000)
    }
  }

  const container = tab.container
  if (!container) return null

  // Calculate menu position to avoid going off-screen
  const menuWidth = 200
  const menuHeight = 60
  const buttonSize = 48
  const containerRect = container.getBoundingClientRect()
  const buttonRight = position.x + buttonSize
  const spaceRight = containerRect.width - buttonRight

  // Position menu to the right if there's space, otherwise to the left
  const menuLeft =
    spaceRight >= menuWidth + 10
      ? buttonRight + 10
      : Math.max(0, position.x - menuWidth - 10)
  const menuTop = position.y

  return (
    <>
      <div
        ref={buttonRef}
        className={clsx(
          'bg-surface text-on-surface-variant shadow-2 absolute z-50 flex h-12 w-12 cursor-move select-none items-center justify-center rounded-full transition-shadow',
          isDragging ? 'shadow-4' : 'hover:shadow-3',
        )}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          userSelect: 'none',
          WebkitUserSelect: 'none',
          touchAction: 'none',
        }}
        onMouseDown={handleMouseDown}
        onClick={(e) => {
          // Prevent click if we just dragged or are currently dragging
          if (hasDragged.current || isDragging) {
            e.preventDefault()
            e.stopPropagation()
            return
          }
          // Only show menu if we didn't drag (moved less than threshold)
          e.stopPropagation()
          setShowMenu(true)
        }}
      >
        <MdSmartToy size={scale(24, 28)} />
      </div>

      {showMenu && (
        <>
          <Overlay
            className="!z-[49] !bg-transparent"
            onMouseDown={() => setShowMenu(false)}
          />
          <div
            ref={menuRef}
            className="bg-surface text-on-surface-variant shadow-2 absolute z-50 min-w-[200px] rounded p-2"
            style={{
              left: `${menuLeft}px`,
              top: `${Math.max(
                0,
                Math.min(menuTop, containerRect.height - menuHeight),
              )}px`,
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="space-y-1">
              <button
                className="hover:bg-surface-variant flex w-full items-center gap-2 rounded px-3 py-2 text-left"
                onClick={handleSummarize}
              >
                <MdSummarize size={scale(20, 24)} />
                <span className="typescale-body-medium">{t('summarize')}</span>
              </button>
              <button
                className="hover:bg-surface-variant flex w-full items-center gap-2 rounded px-3 py-2 text-left"
                onClick={handleTranslatePage}
                disabled={translating}
              >
                <MdTranslate size={scale(20, 24)} />
                <span className="typescale-body-medium">
                  {t('translate.page')}
                </span>
              </button>
            </div>
          </div>
        </>
      )}

      {showSummary && (
        <>
          <Overlay
            className="!z-[51] !bg-transparent"
            onMouseDown={() => setShowSummary(false)}
          />
          <div
            className="bg-surface text-on-surface-variant shadow-2 fixed left-1/2 top-1/2 z-[51] max-h-[80vh] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded p-4"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MdSummarize size={scale(20, 24)} />
                <span className="typescale-title-medium text-on-surface">
                  {t('summarize.title')}
                </span>
              </div>
              <IconButton
                title={t('close')}
                Icon={MdClose}
                size={scale(20, 24)}
                onClick={() => setShowSummary(false)}
              />
            </div>
            <div className="typescale-body-medium text-on-surface max-h-[60vh] overflow-y-auto">
              {loading && (
                <div className="text-on-surface-variant">
                  {t('summarize.loading')}
                </div>
              )}
              {error && (
                <div className="text-error text-on-surface-variant">
                  {error}
                </div>
              )}
              {!loading && !error && summaryText && (
                <div className="whitespace-pre-wrap">{summaryText}</div>
              )}
            </div>
          </div>
        </>
      )}

      {translating && (
        <>
          <Overlay className="!z-[51] !bg-black/20" />
          <div
            className="bg-surface text-on-surface-variant shadow-2 fixed left-1/2 top-1/2 z-[51] min-w-[300px] -translate-x-1/2 -translate-y-1/2 rounded p-4"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center gap-2">
              <MdTranslate size={scale(20, 24)} />
              <span className="typescale-title-medium text-on-surface">
                {t('translate.page.title')}
              </span>
            </div>
            <div className="mb-2">
              <div className="typescale-body-small text-on-surface-variant mb-1">
                {translateStatus || t('translate.loading')}
              </div>
              <div className="bg-surface-variant h-2 w-full overflow-hidden rounded">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${translateProgress * 100}%` }}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {translateStatus && !translating && (
        <div
          className="bg-surface text-on-surface-variant shadow-2 fixed left-1/2 top-20 z-[51] min-w-[200px] -translate-x-1/2 rounded px-4 py-2"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="typescale-body-small text-on-surface">
            {translateStatus}
          </div>
        </div>
      )}
    </>
  )
}
