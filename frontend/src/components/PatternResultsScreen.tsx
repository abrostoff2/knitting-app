import React, { useState, useCallback } from 'react'
import { Pattern, YarnDetail } from '../types'
import styles from './PatternResultsScreen.module.css'

interface Props {
  yarn: YarnDetail
  onBackToSearch: () => void
}

const ITEMS_PER_PAGE = 20

export const PatternResultsScreen: React.FC<Props> = ({ yarn, onBackToSearch }) => {
  const [patternFilter, setPatternFilter] = useState('')
  const [patterns, setPatterns] = useState<Pattern[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const loadPatterns = useCallback(async (filter: string) => {
    setIsLoading(true)
    setHasSearched(true)
    setCurrentPage(1)

    try {
      const url = new URL(`/api/yarns/${yarn.id}/patterns`, window.location.origin)
      if (filter.trim()) {
        url.searchParams.append('pattern_query', filter)
      }

      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to load patterns')

      const data = await res.json()
      setPatterns(data.patterns || [])
    } catch {
      setPatterns([])
    } finally {
      setIsLoading(false)
    }
  }, [yarn.id])

  React.useEffect(() => {
    loadPatterns(patternFilter)
  }, [loadPatterns, patternFilter])

  const handleFilterChange = async (e: React.FormEvent) => {
    e.preventDefault()
    await loadPatterns(patternFilter)
  }

  const handleClearFilter = async () => {
    setPatternFilter('')
    await loadPatterns('')
  }

  const noResults = hasSearched && !isLoading && patterns.length === 0

  const totalPages = Math.ceil(patterns.length / ITEMS_PER_PAGE)
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE
  const endIdx = startIdx + ITEMS_PER_PAGE
  const paginatedPatterns = patterns.slice(startIdx, endIdx)

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
      window.scrollTo(0, 0)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
      window.scrollTo(0, 0)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={onBackToSearch} className={styles.backButton}>
          ← New yarn search
        </button>

        <div className={styles.yarnInfo}>
          {yarn.first_photo?.square_url && (
            <img src={yarn.first_photo.square_url} alt={yarn.name} className={styles.yarnPhoto} />
          )}
          <div>
            <h2>{yarn.name}</h2>
            <p className={styles.company}>{yarn.yarn_company_name}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleFilterChange} className={styles.filterForm}>
        <input
          type="text"
          value={patternFilter}
          onChange={(e) => setPatternFilter(e.target.value)}
          placeholder="hat, cardigan, socks…"
          disabled={isLoading}
          className={styles.filterInput}
        />
        <button type="submit" disabled={isLoading} className={styles.filterButton}>
          {isLoading ? 'Searching...' : 'Filter'}
        </button>
      </form>

      {patternFilter && (
        <p className={styles.activeFilter}>
          Showing patterns for <strong>{patternFilter}</strong>
          <button onClick={handleClearFilter} className={styles.clearFilter}>
            Clear filter
          </button>
        </p>
      )}

      {isLoading && <div className={styles.loading}>Loading patterns...</div>}

      {noResults && patternFilter ? (
        <div className={styles.emptyState}>
          <p>No {patternFilter} patterns found for <strong>{yarn.name}</strong>.</p>
          <p>Try a different term, or <button onClick={handleClearFilter} className={styles.linkButton}>see all patterns for this yarn</button>.</p>
        </div>
      ) : noResults ? (
        <div className={styles.emptyState}>
          <p>No patterns found for this yarn yet.</p>
        </div>
      ) : (
        <>
          <div className={styles.patternGrid}>
            {paginatedPatterns.map((pattern) => (
              <a
                key={pattern.id}
                href={`https://www.ravelry.com/patterns/library/${pattern.permalink}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.patternCard}
              >
                {pattern.first_photo?.medium_url && (
                  <img
                    src={pattern.first_photo.medium_url}
                    alt={pattern.name}
                    className={styles.patternPhoto}
                  />
                )}
                <div className={styles.patternContent}>
                  <h3 className={styles.patternName}>{pattern.name}</h3>
                  <p className={styles.designer}>
                    {pattern.designer?.name || 'Unknown designer'}
                  </p>
                  <div className={styles.badges}>
                    {pattern.free !== undefined && (
                      <span className={`${styles.badge} ${pattern.free ? styles.free : styles.paid}`}>
                        {pattern.free ? 'Free' : 'Paid'}
                      </span>
                    )}
                    {pattern.designer?.favorites_count !== undefined && (
                      <span className={styles.badge}>⭐ Designer: {pattern.designer.favorites_count}</span>
                    )}
                    {pattern.rating_average && (
                      <span className={styles.badge}>★ {pattern.rating_average.toFixed(1)}</span>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={styles.paginationButton}
              >
                ← Previous
              </button>
              <span className={styles.pageInfo}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={styles.paginationButton}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
