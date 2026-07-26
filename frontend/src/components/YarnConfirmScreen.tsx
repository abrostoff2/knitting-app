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
  if (yarns.length === 0) return null

  const selectedYarn = yarns[0]

  return (
    <div className={styles.container}>
      <button onClick={onBack} className={styles.backButton}>← Search again</button>

      <h2>Confirm your yarn</h2>
      <p className={styles.subtitle}>Please confirm which yarn you mean</p>

      <div className={styles.card}>
        <div className={styles.cardGrid}>
          {selectedYarn.first_photo?.square_url && (
            <img
              src={selectedYarn.first_photo.square_url}
              alt={selectedYarn.name}
              className={styles.photo}
            />
          )}
          <div className={styles.content}>
            <h3 className={styles.name}>{selectedYarn.name}</h3>
            <p className={styles.company}>{selectedYarn.yarn_company_name || 'Unknown company'}</p>
            {selectedYarn.yarn_weight?.name && (
              <p className={styles.weight}>{selectedYarn.yarn_weight.name}</p>
            )}
            {selectedYarn.rating_average && (
              <p className={styles.rating}>
                ⭐ {selectedYarn.rating_average.toFixed(1)} ({selectedYarn.rating_count} ratings)
              </p>
            )}

            <div className={styles.infoSection}>
              <h3>Why this yarn?</h3>
              <div className={styles.infoItems}>
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>🧵</span>
                  <div className={styles.infoText}>
                    <span className={styles.infoLabel}>100% Merino Wool</span>
                    <span className={styles.infoValue}>Soft, warm, and easy to knit</span>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>📏</span>
                  <div className={styles.infoText}>
                    <span className={styles.infoLabel}>Worsted Weight</span>
                    <span className={styles.infoValue}>Versatile for many projects</span>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>⭐</span>
                  <div className={styles.infoText}>
                    <span className={styles.infoLabel}>Highly Rated</span>
                    <span className={styles.infoValue}>Great for sweaters, hats, accessories, and more</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.buttonGroup}>
        <button onClick={() => onSelect(selectedYarn)} className={styles.continueButton}>
          Yes, this is my yarn
        </button>
        <button onClick={onBack} className={styles.backButtonSecondary}>
          Search again
        </button>
      </div>
    </div>
  )
}
