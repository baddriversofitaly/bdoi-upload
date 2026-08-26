'use client'

import { useState, useRef, useEffect } from 'react'

type Option = { value: string; label: string }

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Seleziona...',
  variant = 'light',
}: {
  options: Option[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  variant?: 'light' | 'white'
}) {
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
  const selectedLabel = options.find((o) => o.value === value)?.label

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
        <span className={selectedLabel ? '' : 'opacity-50'}>{selectedLabel || placeholder}</span>
        <span className="ml-2 text-xs opacity-60">▾</span>
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
            {filtered.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  onChange(o.value)
                  setOpen(false)
                  setQuery('')
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                  o.value === value ? 'bg-blue-50 font-semibold text-[#1B4B93]' : 'text-gray-700'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
