import React, { useState, useCallback } from 'react'
import { Pattern, YarnDetail } from '../types'
import styles from './PatternResultsScreen.module.css'

interface Props {
  yarn: YarnDetail
  onBackToSearch: () => void
}

const ITEMS_PER_PAGE = 20

type SortBy = 'rating' | 'designer'

const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US')
}

export const PatternResultsScreen: React.FC<Props> = ({ yarn, onBackToSearch }) => {
  const [patternFilter, setPatternFilter] = useState('')
  const [patterns, setPatterns] = useState<Pattern[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [patternsPage, setPatternsPage] = useState(1)
  const [similarYarnsPage, setSimilarYarnsPage] = useState(1)
  const [hasMoreSimilarYarns, setHasMoreSimilarYarns] = useState(false)
  const [sortBy, setSortBy] = useState<SortBy>('rating')

  const loadPatterns = useCallback(
    async (filter: string, similarYarnsPageNum: number = 1) => {
      setIsLoading(true)
      setHasSearched(true)
      setPatternsPage(1)
      setSimilarYarnsPage(similarYarnsPageNum)

      try {
        const url = new URL(`/api/yarns/${yarn.id}/patterns`, window.location.origin)
        if (filter.trim()) {
          url.searchParams.append('pattern_query', filter)
        }
        url.searchParams.append('page', similarYarnsPageNum.toString())

        const res = await fetch(url)
        if (!res.ok) throw new Error('Failed to load patterns')

        const data = await res.json()
        setPatterns(data.patterns || [])
        setHasMoreSimilarYarns(data.has_more || false)
      } catch {
        setPatterns([])
        setHasMoreSimilarYarns(false)
      } finally {
        setIsLoading(false)
      }
    },
    [yarn.id]
  )

  React.useEffect(() => {
    // Note: patternFilter intentionally excluded from deps—search happens only
    // on explicit Filter button click via handleFilterChange, not on keystroke.
    loadPatterns(patternFilter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadPatterns])

  const handleFilterChange = async (e: React.FormEvent) => {
    e.preventDefault()
    await loadPatterns(patternFilter)
  }

  const handleClearFilter = async () => {
    setPatternFilter('')
    await loadPatterns('')
  }

  const noResults = hasSearched && !isLoading && patterns.length === 0

  const getSortedPatterns = () => {
    const sorted = [...patterns]
    if (sortBy === 'designer') {
      sorted.sort(
        (a, b) => (b.designer?.favorites_count || 0) - (a.designer?.favorites_count || 0)
      )
    } else {
      sorted.sort((a, b) => (b.rating_average || 0) - (a.rating_average || 0))
    }
    return sorted
  }

  const sortedPatterns = getSortedPatterns()
  const patternPagesInBatch = Math.ceil(sortedPatterns.length / ITEMS_PER_PAGE)
  const startIdx = (patternsPage - 1) * ITEMS_PER_PAGE
  const endIdx = startIdx + ITEMS_PER_PAGE
  const paginatedPatterns = sortedPatterns.slice(startIdx, endIdx)

  const handleNextPage = async () => {
    if (patternsPage < patternPagesInBatch) {
      setPatternsPage(patternsPage + 1)
      window.scrollTo(0, 0)
    } else if (hasMoreSimilarYarns) {
      await loadPatterns(patternFilter, similarYarnsPage + 1)
      window.scrollTo(0, 0)
    }
  }

  const handlePrevPage = () => {
    if (patternsPage > 1) {
      setPatternsPage(patternsPage - 1)
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

      {hasSearched && !noResults && (
        <div className={styles.sortControls}>
          <label htmlFor="sort-select">Sort by:</label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            disabled={isLoading}
            className={styles.sortSelect}
          >
            <option value="rating">Pattern Rating</option>
            <option value="designer">Designer Popularity</option>
          </select>
        </div>
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
                  <div className={styles.patternHeader}>
                    <h3 className={styles.patternName}>{pattern.name}</h3>
                    {pattern.rating_average && (
                      <div className={styles.patternRating}>
                        <span className={styles.ratingValue}>{pattern.rating_average.toFixed(1)}</span>
                        <span className={styles.ratingLabel}>★</span>
                      </div>
                    )}
                  </div>
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
                      <span className={styles.badge}>⭐ Designer: {formatNumber(pattern.designer.favorites_count)}</span>
                    )}
                    {pattern.rating_average && (
                      <span className={styles.badge}>★ {pattern.rating_average.toFixed(1)}</span>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>

          {(patternPagesInBatch > 1 || hasMoreSimilarYarns) && (
            <div className={styles.pagination}>
              <button
                onClick={handlePrevPage}
                disabled={patternsPage === 1}
                className={styles.paginationButton}
              >
                ← Previous
              </button>
              <span className={styles.pageInfo}>
                Page {patternsPage} of {patternPagesInBatch}
                {hasMoreSimilarYarns && ' (more yarns available)'}
              </span>
              <button
                onClick={handleNextPage}
                disabled={patternsPage === patternPagesInBatch && !hasMoreSimilarYarns}
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
