import React from 'react'
import { CATEGORIES } from '../data/categories'
import styles from './FilterPanel.module.css'

interface Props {
  isOpen: boolean
  onClose: () => void
  selectedCategories: string[]
  onChange: (categories: string[]) => void
  selectedCrafts?: string[]
  onCraftsChange?: (crafts: string[]) => void
}

export const FilterPanel: React.FC<Props> = ({
  isOpen,
  onClose,
  selectedCategories,
  onChange,
  selectedCrafts = [],
  onCraftsChange,
}) => {
  const handleCraftChange = (craft: string) => {
    const updated = selectedCrafts.includes(craft)
      ? selectedCrafts.filter((c) => c !== craft)
      : [...selectedCrafts, craft]
    onCraftsChange?.(updated)
  }
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

  const handleApply = () => {
    onClose()
  }

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
              <h3>Craft</h3>
            </div>
            <div className={styles.categoriesList}>
              <div className={styles.categoryGroup}>
                <div className={styles.categoryHeader}>
                  <label className={styles.categoryCheckbox}>
                    <input
                      type="checkbox"
                      checked={selectedCrafts.includes('knitting')}
                      onChange={() => handleCraftChange('knitting')}
                    />
                    <span className={styles.categoryLabel}>Knitting</span>
                  </label>
                </div>
              </div>
              <div className={styles.categoryGroup}>
                <div className={styles.categoryHeader}>
                  <label className={styles.categoryCheckbox}>
                    <input
                      type="checkbox"
                      checked={selectedCrafts.includes('crochet')}
                      onChange={() => handleCraftChange('crochet')}
                    />
                    <span className={styles.categoryLabel}>Crochet</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3>Pattern Categories</h3>
              {selectedCategories.length > 0 && (
                <button className={styles.clearAll} onClick={clearAll}>
                  Clear all
                </button>
              )}
            </div>

            <div className={styles.categoriesList}>
              {CATEGORIES.map((category) => (
                <div key={category.value} className={styles.categoryGroup}>
                  <div className={styles.categoryHeader}>
                    <label className={styles.categoryCheckbox}>
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.value)}
                        onChange={() => toggleCategory(category.value)}
                      />
                      <span className={styles.categoryLabel}>{category.label}</span>
                    </label>
                  </div>

                  {category.subcategories.length > 0 && (
                    <div className={styles.subcategoriesList}>
                      {category.subcategories.map((sub) => (
                        <label key={sub.value} className={styles.subcategoryCheckbox}>
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(sub.value)}
                            onChange={() => toggleCategory(sub.value)}
                          />
                          <span className={styles.subcategoryLabel}>{sub.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.applyButton} onClick={handleApply}>
            Apply filters
          </button>
        </div>
      </div>
    </>
  )
}
