import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useDocumentTitle } from '../../../lib/useDocumentTitle'
import { useToast } from '../../../components/Toast'
import ToolLayout, { ToolPanel } from './ToolLayout'
import ToolConfigPanel from './ToolConfigPanel'
import ToolPreviewPanel from './ToolPreviewPanel'
import type { FieldValue, FieldValues, ToolConfig, ToolResultItem } from './types'

/**
 * Driver for every mini tool route: owns the values bag and the fake
 * generation state machine (idle → generating w/ progress → done with
 * result items). Tool route files are thin configs over this page.
 */
const MiniToolPage: React.FC<{ config: ToolConfig }> = ({ config }) => {
  useDocumentTitle(`${config.title} | Atlabs AI`)
  const { toast } = useToast()
  const [values, setValues] = useState<FieldValues>(config.initialValues ?? {})
  const [status, setStatus] = useState<'idle' | 'generating' | 'done'>('idle')
  const [progress, setProgress] = useState(0)
  const [items, setItems] = useState<ToolResultItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const timer = useRef<number | null>(null)

  // Kill any in-flight fake generation when the route unmounts.
  useEffect(
    () => () => {
      if (timer.current !== null) window.clearInterval(timer.current)
    },
    [],
  )

  const setValue = useCallback((id: string, value: FieldValue) => {
    setValues((prev) => ({ ...prev, [id]: value }))
  }, [])

  const generate = useCallback(() => {
    const validationError = config.validate?.(values) ?? null
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)
    setStatus('generating')
    setProgress(0)
    setItems([])

    const duration = config.durationMs ?? 2200 + Math.round(Math.random() * 1800)
    const startedAt = Date.now()
    const snapshot = values

    if (timer.current !== null) window.clearInterval(timer.current)
    timer.current = window.setInterval(() => {
      const elapsed = Date.now() - startedAt
      const pct = Math.min(100, Math.round((elapsed / duration) * 100))
      setProgress(pct)
      if (pct >= 100) {
        if (timer.current !== null) window.clearInterval(timer.current)
        timer.current = null
        setItems(config.buildResults(snapshot))
        setStatus('done')
        toast({
          title: `${config.title} finished`,
          description: 'Fixture pipeline complete — results are placeholders.',
          variant: 'success',
        })
      }
    }, 90)
  }, [config, toast, values])

  const reset = useCallback(() => {
    if (timer.current !== null) {
      window.clearInterval(timer.current)
      timer.current = null
    }
    setStatus('idle')
    setProgress(0)
    setItems([])
    setError(null)
  }, [])

  return (
    <ToolLayout config={config}>
      <ToolPanel title="Configuration">
        <ToolConfigPanel
          config={config}
          values={values}
          setValue={setValue}
          generating={status === 'generating'}
          error={error}
          onGenerate={generate}
        />
      </ToolPanel>

      <ToolPanel
        title={status === 'generating' ? 'Generating' : 'Preview'}
        className="min-h-[420px]"
      >
        <ToolPreviewPanel
          config={config}
          values={values}
          status={status}
          progress={progress}
          items={items}
          onReset={reset}
        />
      </ToolPanel>
    </ToolLayout>
  )
}

export default MiniToolPage
