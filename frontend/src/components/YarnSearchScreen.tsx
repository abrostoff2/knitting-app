import React, { useState } from 'react'
import { Yarn } from '../types'
import { FilterPanel } from './FilterPanel'
import styles from './YarnSearchScreen.module.css'

const API_URL = import.meta.env.VITE_API_URL || ''

interface Props {
  onSelect: (yarns: Yarn[], query: string) => void
  isLoading: boolean
}

export const YarnSearchScreen: React.FC<Props> = ({ onSelect, isLoading }) => {
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setError(null)
    setSearched(true)

    try {
      const res = await fetch(`${API_URL}/api/yarns/search?query=${encodeURIComponent(query)}`)
      if (!res.ok) throw new Error('Search failed')
      const yarns: Yarn[] = await res.json()

      if (yarns.length === 0) {
        setError(`No yarns found for '${query}'. Check the spelling or try the yarn's full name.`)
        return
      }

      onSelect(yarns, query)
    } catch {
      setError('Failed to search. Please try again.')
    }
  }

  return (
    <div className={styles.container}>
      <h1>Yarn Pattern Matcher ✨</h1>
      <p className={styles.subtitle}>Find patterns for the yarn you own</p>

      <form onSubmit={handleSearch} className={styles.form}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What yarn do you have?"
          disabled={isLoading}
          autoFocus
          className={styles.input}
        />
        <button
          type="button"
          onClick={() => setIsFilterPanelOpen(true)}
          disabled={isLoading}
          className={styles.filterButton}
        >
          Filters {selectedCategories.length > 0 && <span className={styles.badge}>{selectedCategories.length}</span>}
        </button>
        <button type="submit" disabled={isLoading} className={styles.button}>
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <div className={styles.error}>{error}</div>}

      {searched && !error && isLoading && (
        <div className={styles.loading}>Loading yarns...</div>
      )}

      <FilterPanel
        isOpen={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
        selectedCategories={selectedCategories}
        onChange={setSelectedCategories}
      />
    </div>
  )
}
