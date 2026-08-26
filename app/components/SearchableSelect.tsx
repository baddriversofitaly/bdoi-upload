'use client'

import { useState, useRef, useEffect } from 'react'

type Option = { value: string; label: string }

type SingleProps = {
  options: Option[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  variant?: 'light' | 'white'
  multiple?: false
}

type MultiProps = {
  options: Option[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  variant?: 'light' | 'white'
  multiple: true
}

export default function SearchableSelect(props: SingleProps | MultiProps) {
  const { options, placeholder = 'Seleziona...', variant = 'light' } = props
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filtered = options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))

  const isSelected = (optValue: string) =>
    props.multiple ? props.value.includes(optValue) : props.value === optValue

  const handleOptionClick = (optValue: string) => {
    if (props.multiple) {
      const next = props.value.includes(optValue)
        ? props.value.filter((v) => v !== optValue)
        : [...props.value, optValue]
      props.onChange(next)
      // in multi-selezione il menù resta aperto, per selezionarne più di uno di fila
    } else {
      props.onChange(optValue)
      setOpen(false)
      setQuery('')
    }
  }

  const triggerLabel = props.multiple
    ? props.value.length > 0
      ? options
          .filter((o) => props.value.includes(o.value))
          .map((o) => o.label)
          .join(', ')
      : ''
    : options.find((o) => o.value === props.value)?.label || ''

  const isLight = variant === 'light'
  const triggerClass = isLight
    ? 'bg-white text-[#123769] focus:ring-2 focus:ring-white'
    : 'bg-gray-50 text-gray-800 border border-gray-300 focus:ring-2 focus:ring-[#1B4B93]'

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full text-left rounded-md px-3 py-2 text-sm ${triggerClass} focus:outline-none flex items-center justify-between`}
      >
        <span className={`truncate ${triggerLabel ? '' : 'opacity-50'}`}>
          {triggerLabel || placeholder}
        </span>
        <span className="ml-2 text-xs opacity-60 shrink-0">▾</span>
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 flex flex-col">
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca..."
            className="px-3 py-2 text-sm border-b border-gray-200 text-[#123769] focus:outline-none"
          />
          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 && (
              <p className="px-3 py-2 text-sm text-gray-400">Nessun risultato</p>
            )}
            {filtered.map((o) => {
              const selected = isSelected(o.value)
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => handleOptionClick(o.value)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2 ${
                    selected ? 'bg-blue-50 font-semibold text-[#1B4B93]' : 'text-gray-700'
                  }`}
                >
                  {props.multiple && (
                    <span
                      className={`inline-flex items-center justify-center w-4 h-4 rounded-sm border shrink-0 text-[10px] ${
                        selected ? 'bg-[#1B4B93] border-[#1B4B93] text-white' : 'border-gray-300'
                      }`}
                    >
                      {selected ? '✓' : ''}
                    </span>
                  )}
                  {o.label}
                </button>
              )
            })}
          </div>
          {props.multiple && (
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                setQuery('')
              }}
              className="text-xs text-[#1B4B93] font-semibold px-3 py-2 border-t border-gray-200 hover:bg-gray-50"
            >
              Fatto
            </button>
          )}
        </div>
      )}
    </div>
  )
}
