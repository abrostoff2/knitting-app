import React, { useState, useCallback } from 'react'
import { MatchedPattern, YarnDetail } from '../types'
import { FilterPanel } from './FilterPanel'
import { SkeletonCard } from './SkeletonCard'
import styles from './PatternResultsScreen.module.css'

const API_URL = import.meta.env.VITE_API_URL || ''

interface Props {
  yarn: YarnDetail
  onBackToSearch: () => void
}

const ITEMS_PER_PAGE = 20

type SortBy = 'rating' | 'designer'
type PatternSource = 'exact' | 'similar'

const PATTERN_CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'home', label: 'Home' },
  { value: 'medical', label: 'Medical' },
  { value: 'pet', label: 'Pet' },
  { value: 'components', label: 'Components' },
]

const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US')
}

export const PatternResultsScreen: React.FC<Props> = ({ yarn, onBackToSearch }) => {
  const [patternFilter, setPatternFilter] = useState('')
  const [patterns, setPatterns] = useState<MatchedPattern[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [patternsPage, setPatternsPage] = useState(1)
  const [similarYarnsPage, setSimilarYarnsPage] = useState(1)
  const [hasMoreSimilarYarns, setHasMoreSimilarYarns] = useState(false)
  const [sortBy, setSortBy] = useState<SortBy>('rating')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [patternSource, setPatternSource] = useState<PatternSource>('exact')
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)

  const loadPatterns = useCallback(
    async (filter: string, similarYarnsPageNum: number = 1, categories: string[] = []) => {
      setIsLoading(true)
      setHasSearched(true)
      setPatternsPage(1)
      setSimilarYarnsPage(similarYarnsPageNum)

      try {
        let url = `${API_URL}/api/yarns/${yarn.id}/patterns`
        const params = new URLSearchParams()
        if (filter.trim()) {
          params.append('pattern_query', filter)
        }
        if (categories.length > 0) {
          params.append('category', categories.join('|'))
        }
        params.append('page', similarYarnsPageNum.toString())
        if (params.toString()) {
          url += '?' + params.toString()
        }

        console.log('Fetching patterns from:', url)
        const res = await fetch(url)
        if (!res.ok) throw new Error(`Failed to load patterns: ${res.status} ${res.statusText}`)

        const data = await res.json()
        console.log('Patterns loaded:', data.patterns.length)
        setPatterns(data.patterns || [])
        setHasMoreSimilarYarns(data.has_more || false)
      } catch (error) {
        console.error('Pattern fetch error:', error)
        setPatterns([])
        setHasMoreSimilarYarns(false)
      } finally {
        setIsLoading(false)
      }
    },
    [yarn.id]
  )

  React.useEffect(() => {
    loadPatterns(patternFilter, 1, selectedCategories)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadPatterns, selectedCategories])

  React.useEffect(() => {
    if (hasSearched) {
      const exactPatterns = patterns.filter((p) => p.match_type === 'exact')
      setPatternSource(exactPatterns.length > 0 ? 'exact' : 'similar')
    }
  }, [patterns, hasSearched])

  const handleFilterChange = async (e: React.FormEvent) => {
    e.preventDefault()
    await loadPatterns(patternFilter, 1, selectedCategories)
  }

  const handleClearFilter = async () => {
    setPatternFilter('')
    await loadPatterns('', 1, selectedCategories)
  }

  const handleCategoriesChange = (categories: string[]) => {
    setSelectedCategories(categories)
  }

  const noResults = hasSearched && !isLoading && patterns.length === 0

  const getSortedPatterns = () => {
    const sorted = [...patterns]
    if (sortBy === 'designer') {
      sorted.sort(
        (a, b) => (b.pattern.designer?.favorites_count || 0) - (a.pattern.designer?.favorites_count || 0)
      )
    } else {
      sorted.sort((a, b) => (b.pattern.rating_average || 0) - (a.pattern.rating_average || 0))
    }
    return sorted
  }

  const sortedPatterns = getSortedPatterns()
  const filteredBySource = sortedPatterns.filter((p) => p.match_type === patternSource)
  const patternPagesInBatch = Math.ceil(filteredBySource.length / ITEMS_PER_PAGE)
  const startIdx = (patternsPage - 1) * ITEMS_PER_PAGE
  const endIdx = startIdx + ITEMS_PER_PAGE
  const paginatedPatterns = filteredBySource.slice(startIdx, endIdx)

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
          placeholder="Search patterns (optional)"
          disabled={isLoading}
          className={styles.filterInput}
        />
        <button
          type="button"
          onClick={() => setIsFilterPanelOpen(true)}
          disabled={isLoading}
          className={styles.filterButtonIcon}
        >
          Filters {selectedCategories.length > 0 && <span className={styles.filterBadge}>{selectedCategories.length}</span>}
        </button>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          disabled={isLoading}
          className={styles.sortSelect}
        >
          <option value="rating">Best match</option>
          <option value="designer">Designer Popularity</option>
        </select>
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
        <div className={styles.controlsRow}>
          <div className={styles.sourceControls}>
            <label>Show:</label>
            <div className={styles.sourceToggle}>
              {patterns.some((p) => p.match_type === 'exact') && (
                <button
                  className={`${styles.sourceButton} ${patternSource === 'exact' ? styles.active : ''}`}
                  onClick={() => setPatternSource('exact')}
                  disabled={isLoading}
                >
                  This Yarn
                </button>
              )}
              <button
                className={`${styles.sourceButton} ${patternSource === 'similar' ? styles.active : ''}`}
                onClick={() => setPatternSource('similar')}
                disabled={isLoading}
              >
                Similar Yarns
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <>
          <div className={styles.loading}>Searching similar yarns and their patterns...</div>
          <div className={styles.patternGrid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </>
      )}

      {!isLoading && noResults && patternFilter ? (
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
          {(() => {
            const renderPatternCard = (matchedPattern: MatchedPattern) => {
              const { pattern, matched_yarn } = matchedPattern
              return (
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
                      <div>
                        <h3 className={styles.patternName}>{pattern.name}</h3>
                        {matched_yarn && (
                          <p className={styles.viaYarn}>via {matched_yarn.name}</p>
                        )}
                      </div>
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
              )
            }

            return (
              <>
                <div className={styles.patternGrid}>
                  {paginatedPatterns.map(renderPatternCard)}
                </div>
              </>
            )
          })()}

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
                {hasMoreSimilarYarns && ' (More patterns load as you paginate)'}
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
      <FilterPanel
        isOpen={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
        selectedCategories={selectedCategories}
        onChange={handleCategoriesChange}
      />
    </div>
  )
}
