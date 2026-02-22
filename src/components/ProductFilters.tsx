// src/components/ProductFilters.tsx

import { useState, ChangeEvent } from 'react';
import { SortOption } from '../types/product.types';
import { X } from 'lucide-react';

interface ProductFiltersProps {
  searchQuery: string;
  category: string;
  sortBy: SortOption;
  categories: string[];
  minPrice: string;
  maxPrice: string;
  onSearchChange: (query: string) => void;
  onCategoryChange: (category: string) => void;
  onSortChange: (sort: SortOption) => void;
  onMinPriceChange: (price: string) => void;
  onMaxPriceChange: (price: string) => void;
  /** Pass true from the outside when the mobile drawer is open */
  drawerOpen?: boolean;
  onDrawerClose?: () => void;
}

/** Reusable accordion section */
const FilterSection = ({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="pp-filter-section">
      <button
        className="pp-filter-section__toggle"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        {title}
        <span className={`pp-filter-section__chevron${open ? ' open' : ''}`}>▼</span>
      </button>
      <div className={`pp-filter-section__body${open ? ' open' : ''}`}>
        <div className="pp-filter-section__inner">{children}</div>
      </div>
    </div>
  );
};

/** Shared filter panel content (used in both sidebar and drawer) */
const FilterPanelContent = ({
  searchQuery,
  category,
  categories,
  minPrice,
  maxPrice,
  onSearchChange,
  onCategoryChange,
  onMinPriceChange,
  onMaxPriceChange,
}: Pick<
  ProductFiltersProps,
  'searchQuery' | 'category' | 'categories' | 'minPrice' | 'maxPrice' | 'onSearchChange' | 'onCategoryChange' | 'onMinPriceChange' | 'onMaxPriceChange'
>) => (
  <>
    {/* Search */}
    <FilterSection title="البحث" defaultOpen>
      <div className="pp-search-wrapper">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          id="pp-search"
          type="text"
          className="pp-search-input"
          placeholder="ابحث عن منتج..."
          value={searchQuery}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
          aria-label="البحث عن المنتجات"
        />
      </div>
    </FilterSection>

    {/* Categories */}
    <FilterSection title="الفئات" defaultOpen>
      <div className="pp-cat-list">
        {categories.map(cat => (
          <button
            key={cat}
            className={`pp-cat-item${category === cat ? ' active' : ''}`}
            onClick={() => onCategoryChange(cat)}
            aria-pressed={category === cat}
          >
            {cat}
          </button>
        ))}
      </div>
    </FilterSection>

    {/* Price Range */}
    <FilterSection title="نطاق السعر" defaultOpen>
      <div className="pp-price-range">
        <div className="pp-price-input-group">
          <label htmlFor="min-price" className="pp-price-label">السعر الأدنى</label>
          <input
            id="min-price"
            type="number"
            className="pp-price-input"
            placeholder="0"
            value={minPrice}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onMinPriceChange(e.target.value)}
            aria-label="السعر الأدنى"
          />
        </div>
        <div className="pp-price-input-group">
          <label htmlFor="max-price" className="pp-price-label">السعر الأعلى</label>
          <input
            id="max-price"
            type="number"
            className="pp-price-input"
            placeholder="9999"
            value={maxPrice}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onMaxPriceChange(e.target.value)}
            aria-label="السعر الأعلى"
          />
        </div>
      </div>
    </FilterSection>
  </>
);

export const ProductFilters = ({
  searchQuery,
  category,
  sortBy,
  categories,
  minPrice,
  maxPrice,
  onSearchChange,
  onCategoryChange,
  onSortChange,
  onMinPriceChange,
  onMaxPriceChange,
  drawerOpen = false,
  onDrawerClose,
}: ProductFiltersProps) => {
  const handleClear = () => {
    onSearchChange('');
    onCategoryChange('جميع الفئات');
    onSortChange('name-asc');
    onMinPriceChange('');
    onMaxPriceChange('');
  };

  // ── Desktop sidebar ──────────────────────
  return (
    <>
      {/* ╔══ SIDEBAR (desktop only) ══════════╗ */}
      <div className="pp-sidebar">
        <div className="pp-filter-card">
          <div className="pp-filter-card__head">
            <h3>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="8" y1="12" x2="16" y2="12" />
                <line x1="12" y1="18" x2="12" y2="18" />
              </svg>
              الفلاتر
            </h3>
            <button className="pp-filter-clear" onClick={handleClear} aria-label="مسح جميع الفلاتر">
              مسح الكل
            </button>
          </div>

          <FilterPanelContent
            searchQuery={searchQuery}
            category={category}
            categories={categories}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onSearchChange={onSearchChange}
            onCategoryChange={onCategoryChange}
            onMinPriceChange={onMinPriceChange}
            onMaxPriceChange={onMaxPriceChange}
          />
        </div>
      </div>

      {/* ╔══ MOBILE DRAWER ═══════════════════╗ */}
      <div
        className={`pp-drawer-overlay${drawerOpen ? ' open' : ''}`}
        onClick={onDrawerClose}
        aria-hidden="true"
      />
      <div
        className={`pp-drawer${drawerOpen ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="فلاتر المنتجات"
      >
        <div className="pp-drawer__head">
          <h2>الفلاتر</h2>
          <button className="pp-drawer__close" onClick={onDrawerClose} aria-label="إغلاق"><X size={20} /></button>
        </div>

        <div className="pp-drawer__body">
          <FilterPanelContent
            searchQuery={searchQuery}
            category={category}
            categories={categories}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onSearchChange={onSearchChange}
            onCategoryChange={onCategoryChange}
            onMinPriceChange={onMinPriceChange}
            onMaxPriceChange={onMaxPriceChange}
          />
        </div>

        <div className="pp-drawer__footer">
          <button className="pp-drawer__clear" onClick={handleClear}>مسح الكل</button>
          <button className="pp-drawer__apply" onClick={onDrawerClose}>
            عرض النتائج
          </button>
        </div>
      </div>

      {/* ── Hidden sort field (consumed by TopControls in parent) ── */}
      {/* sort state is passed up via onSortChange, handled in ProductsPage */}
    </>
  );
};
