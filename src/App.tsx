import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { askVisionLLM, hasApiKey, setApiKey } from './api/groq'
import { LanguageSwitcher } from './components/LanguageSwitcher'
import { useScreenCapture } from './hooks/useScreenCapture'

function App() {
  const { t } = useTranslation()
  const [answer, setAnswer] = useState<string>('')
  const [status, setStatus] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [captureActive, setCaptureActive] = useState(false)
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [needsKey, setNeedsKey] = useState(!hasApiKey())

  const { stream, error, videoRef, startCapture, stopCapture, captureFullFrame } =
    useScreenCapture()

  useEffect(() => {
    if (!stream || !videoRef.current) return
    videoRef.current.srcObject = stream
  }, [stream, videoRef])

  const handleStartCapture = useCallback(async () => {
    setStatus('')
    setAnswer('')
    try {
      await startCapture()
      setCaptureActive(true)
    } catch {
      setStatus(t('status.cancelled'))
    }
  }, [startCapture, t])

  const handleStopCapture = useCallback(() => {
    stopCapture()
    setCaptureActive(false)
  }, [stopCapture])

  const handleSaveApiKey = useCallback(() => {
    const key = apiKeyInput.trim()
    if (key) {
      setApiKey(key)
      setNeedsKey(false)
      setApiKeyInput('')
    } else {
      setStatus(t('status.enterApiKey'))
    }
  }, [apiKeyInput, t])

  const handleAskLLM = useCallback(async () => {
    if (!hasApiKey()) {
      setNeedsKey(true)
      setStatus(t('status.enterApiKey'))
      return
    }
    if (!stream) {
      setStatus(t('status.selectRegion'))
      return
    }

    setLoading(true)
    setStatus(t('status.capturing'))
    setAnswer('')

    try {
      const base64 = await captureFullFrame()
      const result = await askVisionLLM(base64)
      setAnswer(result)
      setStatus(t('status.done'))
    } catch (err) {
      setStatus(err instanceof Error ? err.message : t('status.llmFailed'))
    } finally {
      setLoading(false)
    }
  }, [stream, captureFullFrame, t])

  useEffect(() => {
    setNeedsKey(!hasApiKey())
  }, [])

  return (
    <div
      style={{
        maxWidth: 560,
        margin: '0 auto',
        padding: 24,
        minHeight: '100vh',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>{t('title')}</h1>
        <LanguageSwitcher />
      </div>
      <p style={{ color: '#a6adc8', fontSize: 14, marginBottom: 24 }}>
        {t('subtitle')}
      </p>

      {needsKey && (
        <div
          style={{
            padding: 16,
            background: '#313244',
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 13, color: '#a6adc8', marginBottom: 8 }}>
            {t('apiKeyLabel')}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveApiKey()}
              placeholder="gsk_..."
              style={{
                flex: 1,
                minWidth: 200,
                padding: 10,
                background: '#1e1e2e',
                border: '1px solid #45475a',
                borderRadius: 8,
                color: '#cdd6f4',
                fontSize: 14,
              }}
            />
            <button
              onClick={handleSaveApiKey}
              style={{
                padding: '10px 16px',
                background: '#89b4fa',
                border: 'none',
                borderRadius: 8,
                color: '#1e1e2e',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              {t('save')}
            </button>
          </div>
          <p style={{ fontSize: 12, color: '#6c7086', marginTop: 8, marginBottom: 0 }}>
            {t('apiKeyHint')}{' '}
            <a href="https://console.groq.com" target="_blank" rel="noreferrer" style={{ color: '#89b4fa' }}>
              console.groq.com
            </a>
          </p>
        </div>
      )}

      {error && (
        <div
          style={{
            padding: 12,
            background: '#45475a',
            borderRadius: 8,
            color: '#f38ba8',
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <button
          onClick={handleStartCapture}
          disabled={captureActive}
          style={{
            padding: '12px 20px',
            background: captureActive ? '#313244' : '#45475a',
            border: 'none',
            borderRadius: 8,
            color: '#cdd6f4',
            cursor: captureActive ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: 14,
          }}
        >
          {captureActive ? t('sharing') : t('shareScreen')}
        </button>
        {captureActive && stream && (
          <>
            <button
              onClick={handleAskLLM}
              disabled={loading}
              style={{
                padding: '12px 20px',
                background: loading ? '#313244' : '#89b4fa',
                border: 'none',
                borderRadius: 8,
                color: loading ? '#6c7086' : '#1e1e2e',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: 14,
              }}
            >
              {loading ? t('capture.asking') : t('capture.askLLM')}
            </button>
            <button
              onClick={handleStopCapture}
              style={{
                padding: '12px 20px',
                background: '#45475a',
                border: 'none',
                borderRadius: 8,
                color: '#cdd6f4',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: 14,
              }}
            >
              {t('capture.stop')}
            </button>
          </>
        )}
      </div>

      {captureActive && stream && !status && (
        <div
          style={{
            padding: 10,
            background: '#313244',
            borderRadius: 8,
            color: '#a6adc8',
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          {t('capture.hint')}
        </div>
      )}
      {status && (
        <div
          style={{
            padding: 10,
            background: '#313244',
            borderRadius: 8,
            color: '#a6adc8',
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          {status}
        </div>
      )}

      {answer && (
        <div
          style={{
            padding: 16,
            background: '#313244',
            borderRadius: 8,
            borderLeft: '4px solid #a6e3a1',
          }}
        >
          <div style={{ fontSize: 12, color: '#a6adc8', marginBottom: 8 }}>
            {t('answer')}
          </div>
          <div style={{ color: '#a6e3a1', fontSize: 15, lineHeight: 1.5 }}>
            {answer}
          </div>
        </div>
      )}

      {captureActive && stream && (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{
            position: 'absolute',
            left: -9999,
            width: 1,
            height: 1,
            opacity: 0,
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  )
}

export default App
