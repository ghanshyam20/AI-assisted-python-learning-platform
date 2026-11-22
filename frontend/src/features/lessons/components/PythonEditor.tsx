import { useRef, useState } from 'react'
import Editor from '@monaco-editor/react'
import type { PyodideInterface } from 'pyodide'
import { Play, RotateCcw, LoaderCircle, Maximize2, Minimize2 } from 'lucide-react'
import { ExerciseHints } from '../../practice/ExerciseHints'
import './PythonEditor.css'

type PythonEditorProps = {
  initialCode: string
  onRun?: (output: string) => void
  exerciseId?: number
}

let runtimePromise: Promise<PyodideInterface> | null = null

function getPythonRuntime() {
  if (!runtimePromise) {
    runtimePromise = (async () => {
      const moduleUrl = `${window.location.origin}/pyodide/pyodide.mjs`
      const importModule = new Function(
        'url',
        'return import(url)'
      ) as (url: string) => Promise<{
        loadPyodide: (options: {
          indexURL: string
        }) => Promise<PyodideInterface>
      }>

      const pyodideModule = await importModule(moduleUrl)

      return pyodideModule.loadPyodide({
        indexURL: `${window.location.origin}/pyodide/`,
      })
    })().catch((error: unknown) => {
      runtimePromise = null
      throw error
    })
  }

  return runtimePromise
}

export function PythonEditor({ initialCode, onRun, exerciseId }: PythonEditorProps) {
  const [code, setCode] = useState(initialCode)
  const [output, setOutput] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'running'>('idle')
  const [error, setError] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const runtimeRef = useRef<PyodideInterface | null>(null)

  async function runCode() {
    if (status !== 'idle') return

    setStatus('loading')
    setOutput('Preparing Python...')
    setError(false)

    try {
      const python = runtimeRef.current ?? await getPythonRuntime()
      runtimeRef.current = python

      setStatus('running')
      const stdout: string[] = []
      const stderr: string[] = []

      python.setStdout({
        batched: (text: string) => stdout.push(text),
      })
      python.setStderr({
        batched: (text: string) => stderr.push(text),
      })

      await python.runPythonAsync(code)

      const result = [...stdout, ...stderr].join('\n')
      const finalOutput = result || 'Program finished without output.'

      setOutput(finalOutput)
      setError(stderr.length > 0)
      onRun?.(result)
    } catch (err) {
      setError(true)
      setOutput(err instanceof Error ? err.message : 'Unable to run Python.')
    } finally {
      setStatus('idle')
    }
  }

  function resetCode() {
    if (status !== 'idle') return
    setCode(initialCode)
    setOutput('')
    setError(false)
  }

  function renderWorkspace(
    hintButton: React.ReactNode = null,
    hintContent: React.ReactNode = null,
  ) {
    return (
    <section className="python-workspace">
      <div className="python-workspace__header">
        <div>
          <span className="python-workspace__label">CODE PLAYGROUND</span>
          <h3>Try it yourself</h3>
        </div>
        <div className="python-workspace__header-actions">
          <button
            type="button"
            className="python-workspace__expand"
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? 'Collapse editor' : 'Expand editor'}
            title={expanded ? 'Collapse editor' : 'Expand editor'}
          >
            {expanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            {expanded ? 'Collapse' : 'Expand'}
          </button>
          <span className="python-workspace__language">Python 3</span>
        </div>
      </div>

      <div className="python-workspace__editor">
        <Editor
          height={expanded ? "65vh" : "260px"}
          language="python"
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value ?? '')}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            automaticLayout: true,
            scrollBeyondLastLine: false,
            padding: { top: 16, bottom: 16 },
            tabSize: 4,
          }}
        />
      </div>

      <div className="python-workspace__toolbar">
        <button
          type="button"
          className="python-workspace__run"
          onClick={runCode}
          disabled={status !== 'idle'}
        >
          {status === 'idle' ? <Play size={16} /> : <LoaderCircle size={16} />}
          {status === 'loading'
            ? 'Loading Python...'
            : status === 'running'
              ? 'Running...'
              : 'Run code'}
        </button>

        <button
          type="button"
          className="python-workspace__reset"
          onClick={resetCode}
          disabled={status !== 'idle'}
        >
          <RotateCcw size={16} />
          Reset
        </button>

        {hintButton}
      </div>

      <div className="python-workspace__output">
        <div className="python-workspace__output-title">Output</div>
        <pre className={error ? 'python-workspace__error' : ''}>
          {output || 'Run your code to see the result here.'}
        </pre>
      </div>
      {hintContent}
    </section>
    )
  }

  return exerciseId === undefined ? (
    renderWorkspace()
  ) : (
    <ExerciseHints exerciseId={exerciseId}>
      {(hintButton, hintContent) =>
        renderWorkspace(hintButton, hintContent)
      }
    </ExerciseHints>
  )
}
