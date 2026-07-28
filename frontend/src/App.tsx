import React, { useState, useEffect } from 'react'
import { Yarn, YarnDetail, Screen } from './types'
import { YarnSearchScreen } from './components/YarnSearchScreen'
import { YarnConfirmScreen } from './components/YarnConfirmScreen'
import { PatternResultsScreen } from './components/PatternResultsScreen'
import { LoadingScreen } from './components/LoadingScreen'
import styles from './App.module.css'

const API_URL = import.meta.env.VITE_API_URL || ''

export const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('search')
  const [isLoading, setIsLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<Yarn[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedYarn, setSelectedYarn] = useState<YarnDetail | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsInitializing(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  const handleYarnSearch = (yarns: Yarn[], query: string) => {
    setSearchResults(yarns)
    setSearchQuery(query)
    setScreen('confirm')
  }

  const handleYarnSelect = async (yarn: Yarn) => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/yarns/${yarn.id}`)
      if (!res.ok) throw new Error('Failed to load yarn details')
      const yarnDetail: YarnDetail = await res.json()
      setSelectedYarn(yarnDetail)
      setScreen('results')
    } catch (err) {
      console.error('Failed to load yarn:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToSearch = () => {
    setScreen('search')
    setSearchResults([])
    setSelectedYarn(null)
  }

  if (isInitializing) {
    return <LoadingScreen />
  }

  return (
    <div className={styles.app}>
      {screen === 'search' && (
        <YarnSearchScreen onSelect={handleYarnSearch} isLoading={isLoading} />
      )}

      {screen === 'confirm' && (
        <YarnConfirmScreen
          yarns={searchResults}
          query={searchQuery}
          onSelect={handleYarnSelect}
          onBack={handleBackToSearch}
        />
      )}

      {screen === 'results' && selectedYarn && (
        <PatternResultsScreen
          yarn={selectedYarn}
          onBackToSearch={handleBackToSearch}
        />
      )}
    </div>
  )
}
