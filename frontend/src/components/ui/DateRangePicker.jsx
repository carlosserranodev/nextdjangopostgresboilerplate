'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'

export default function DateRangePicker({ startDate, endDate, onChange }) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSelect = (range) => {
    onChange(range)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {startDate && endDate ? (
          `${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`
        ) : (
          'Seleccionar fechas'
        )}
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 bg-white rounded-md shadow-lg">
          <DayPicker
            mode="range"
            selected={{ from: startDate, to: endDate }}
            onSelect={handleSelect}
            locale={es}
          />
        </div>
      )}
    </div>
  )
}