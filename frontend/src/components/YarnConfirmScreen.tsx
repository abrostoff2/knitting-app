import React from 'react'
import { Yarn } from '../types'
import styles from './YarnConfirmScreen.module.css'

interface Props {
  yarns: Yarn[]
  query: string
  onSelect: (yarn: Yarn) => void
  onBack: () => void
}

export const YarnConfirmScreen: React.FC<Props> = ({ yarns, query, onSelect, onBack }) => {
  return (
    <div className={styles.container}>
      <button onClick={onBack} className={styles.backButton}>← Back to search</button>

      <h2>Which yarn is it?</h2>
      <p className={styles.subtitle}>We found {yarns.length} match{yarns.length !== 1 ? 'es' : ''} for "{query}"</p>

      <div className={styles.grid}>
        {yarns.map((yarn) => (
          <div
            key={yarn.id}
            className={styles.card}
            onClick={() => onSelect(yarn)}
          >
            {yarn.first_photo?.square_url && (
              <img
                src={yarn.first_photo.square_url}
                alt={yarn.name}
                className={styles.photo}
              />
            )}
            <div className={styles.content}>
              <h3 className={styles.name}>{yarn.name}</h3>
              <p className={styles.company}>
                {yarn.yarn_company_name || 'Unknown company'}
              </p>
              {yarn.yarn_weight?.name && (
                <p className={styles.weight}>{yarn.yarn_weight.name}</p>
              )}
              {yarn.rating_average && (
                <p className={styles.rating}>
                  ⭐ {yarn.rating_average.toFixed(1)} ({yarn.rating_count} ratings)
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
