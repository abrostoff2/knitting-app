import React, { useState } from 'react'
import { CATEGORIES } from '../data/categories'
import styles from './CategoryFilter.module.css'

interface Props {
  selectedCategories: string[]
  onChange: (categories: string[]) => void
}

export const CategoryFilter: React.FC<Props> = ({ selectedCategories, onChange }) => {
  const [showAll, setShowAll] = useState(false)

  const toggleCategory = (categoryValue: string) => {
    if (selectedCategories.includes(categoryValue)) {
      onChange(selectedCategories.filter((c) => c !== categoryValue))
    } else {
      onChange([...selectedCategories, categoryValue])
    }
  }

  const removeCategory = (categoryValue: string) => {
    onChange(selectedCategories.filter((c) => c !== categoryValue))
  }

  const getSelectedLabel = (categoryValue: string) => {
    const category = CATEGORIES.find((c) => c.value === categoryValue)
    return category?.label || categoryValue
  }

  const allItems = CATEGORIES.flatMap((category) => [
    { value: category.value, label: category.label, isCategory: true, isSubcategory: false },
    ...category.subcategories.map((sub) => ({
      value: sub.value,
      label: sub.label,
      isCategory: false,
      isSubcategory: true,
    })),
  ])

  const visibleItems = showAll ? allItems : allItems.slice(0, 8)

  return (
    <div className={styles.filterContainer}>
      {selectedCategories.length > 0 && (
        <div className={styles.selectedChips}>
          {selectedCategories.map((categoryValue) => (
            <div key={categoryValue} className={styles.chip}>
              <span>{getSelectedLabel(categoryValue)}</span>
              <button
                className={styles.chipRemove}
                onClick={() => removeCategory(categoryValue)}
                aria-label={`Remove ${getSelectedLabel(categoryValue)}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className={styles.pillsContainer}>
        {visibleItems.map((item) => (
          <button
            key={item.value}
            className={`${styles.pill} ${item.isSubcategory ? styles.pillSubcategory : ''} ${selectedCategories.includes(item.value) ? styles.pillActive : ''}`}
            onClick={() => toggleCategory(item.value)}
          >
            {item.label}
          </button>
        ))}

        {!showAll && allItems.length > 8 && (
          <button className={styles.showMoreButton} onClick={() => setShowAll(true)}>
            + {allItems.length - 8} more
          </button>
        )}

        {showAll && allItems.length > 8 && (
          <button className={styles.showMoreButton} onClick={() => setShowAll(false)}>
            Show less
          </button>
        )}
      </div>
    </div>
  )
}
