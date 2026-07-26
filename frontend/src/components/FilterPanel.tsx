import React from 'react'
import { CATEGORIES } from '../data/categories'
import styles from './FilterPanel.module.css'

interface Props {
  isOpen: boolean
  onClose: () => void
  selectedCategories: string[]
  onChange: (categories: string[]) => void
}

export const FilterPanel: React.FC<Props> = ({
  isOpen,
  onClose,
  selectedCategories,
  onChange,
}) => {
  const toggleCategory = (categoryValue: string) => {
    if (selectedCategories.includes(categoryValue)) {
      onChange(selectedCategories.filter((c) => c !== categoryValue))
    } else {
      onChange([...selectedCategories, categoryValue])
    }
  }

  const clearAll = () => {
    onChange([])
  }

  const allItems = CATEGORIES.flatMap((category) => [
    { value: category.value, label: category.label, isCategory: true },
    ...category.subcategories.map((sub) => ({
      value: sub.value,
      label: sub.label,
      isCategory: false,
    })),
  ])

  return (
    <>
      {isOpen && <div className={styles.overlay} onClick={onClose} />}
      <div className={`${styles.panel} ${isOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <h2>Filters</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3>Pattern Categories</h3>
              {selectedCategories.length > 0 && (
                <button className={styles.clearAll} onClick={clearAll}>
                  Clear all
                </button>
              )}
            </div>

            <div className={styles.itemsList}>
              {allItems.map((item) => (
                <label key={item.value} className={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(item.value)}
                    onChange={() => toggleCategory(item.value)}
                  />
                  <span className={item.isCategory ? styles.categoryLabel : styles.subcategoryLabel}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.applyButton} onClick={onClose}>
            Apply filters
          </button>
        </div>
      </div>
    </>
  )
}
