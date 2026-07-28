export interface SubcategoryOption {
  value: string
  label: string
}

export interface CategoryGroup {
  value: string
  label: string
  subcategories: SubcategoryOption[]
}

export const CATEGORIES: CategoryGroup[] = [
  {
    value: 'clothing',
    label: 'Clothing',
    subcategories: [
      { value: 'coat', label: 'Coat' },
      { value: 'dress', label: 'Dress' },
      { value: 'pants', label: 'Pants' },
      { value: 'shrug', label: 'Shrug' },
      { value: 'skirt', label: 'Skirt' },
      { value: 'sweater', label: 'Sweater' },
      { value: 'tops', label: 'Top' },
      { value: 'sleeveless-top', label: 'Sleeveless Top' },
      { value: 'strapless-top', label: 'Strapless Top' },
      { value: 'tee', label: 'Tee' },
      { value: 'vest', label: 'Vest' },
    ],
  },
  {
    value: 'accessories',
    label: 'Accessories',
    subcategories: [
      { value: 'bag', label: 'Bag' },
      { value: 'feet-legs', label: 'Feet/Legs' },
      { value: 'hands', label: 'Hands' },
      { value: 'hat', label: 'Hat' },
      { value: 'jewelry', label: 'Jewelry' },
      { value: 'neck-torso', label: 'Neck/Torso' },
      { value: 'headwear', label: 'Headwear' },
    ],
  },
  {
    value: 'home',
    label: 'Home',
    subcategories: [
      { value: 'blanket', label: 'Blanket' },
      { value: 'decorative', label: 'Decorative' },
      { value: 'pillow', label: 'Pillow' },
    ],
  },
  {
    value: 'toysandhobbies',
    label: 'Toys and Hobbies',
    subcategories: [
      { value: 'dollclothes', label: 'Doll Clothes' },
      { value: 'softies', label: 'Softies' },
    ],
  },
  {
    value: 'pet',
    label: 'Pet',
    subcategories: [],
  },
]
