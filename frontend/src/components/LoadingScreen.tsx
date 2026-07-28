import React from 'react'
import styles from './LoadingScreen.module.css'

export const LoadingScreen: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.spinner}></div>
        <h1>StashMatch</h1>
        <p>Starting up...</p>
      </div>
    </div>
  )
}
