import React from 'react'
import styles from './SkeletonCard.module.css'

export const SkeletonCard: React.FC = () => {
  return (
    <div className={styles.card}>
      <div className={styles.photo} />
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.nameContainer}>
            <div className={styles.title} />
            <div className={styles.subtitle} />
          </div>
          <div className={styles.rating} />
        </div>
        <div className={styles.designer} />
        <div className={styles.badges}>
          <div className={styles.badge} />
          <div className={styles.badge} />
          <div className={styles.badge} />
        </div>
      </div>
    </div>
  )
}
