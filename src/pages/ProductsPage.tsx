// src/pages/ProductsPage.tsx

import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Settings2 } from 'lucide-react';
import { SortOption } from '../types/product.types';
import { ProductFilters } from '../components/ProductFilters';
import { ProductGrid } from '../components/ProductGrid';
import { Pagination } from '../components/Pagination';
import SearchBox from '../components/SearchBox';
import { apiService } from '../services/api';
import './ProductsPage.css';

/* ── Skeleton card ─────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="pp-skeleton">
    <div className="pp-skeleton__block pp-skeleton__img" />
    <div className="pp-skeleton__body">
      <div className="pp-skeleton__block pp-skeleton__line pp-skeleton__line--lg" />
      <div className="pp-skeleton__block pp-skeleton__line pp-skeleton__line--md" />
      <div className="pp-skeleton__block pp-skeleton__line pp-skeleton__line--sm" />
      <div className="pp-skeleton__block pp-skeleton__btn" />
    </div>
  </div>
);

/* ── Top Controls Bar ──────────────────────────────────────── */
const TopControls = ({
  count,
  total,
  sortBy,
  onSortChange,
  listView,
  onViewChange,
  onMobileFilter,
}: {
  count: number;
  total: number;
  sortBy: SortOption;
  onSortChange: (s: SortOption) => void;
  listView: boolean;
  onViewChange: (v: boolean) => void;
  onMobileFilter: () => void;
}) => (
  <div className="pp-controls">
    <div className="pp-controls__left">
      {/* Mobile filter trigger */}
      <button
        className="pp-mobile-filter-btn"
        onClick={onMobileFilter}
        aria-label="فتح الفلاتر"
      >
        <Settings2 size={16} /> الفلاتر
      </button>

      {/* Count */}
      <p className="pp-controls__count">
        عرض <strong>{count}</strong> من {total} منتج
      </p>
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
      {/* Sort */}
      <select
        id="pp-sort"
        className="pp-sort-select"
        value={sortBy}
        onChange={e => onSortChange(e.target.value as SortOption)}
        aria-label="ترتيب المنتجات"
      >
        <option value="name-asc">الاسم (أ–ي)</option>
        <option value="price-asc">السعر: الأقل أولاً</option>
        <option value="price-desc">السعر: الأعلى أولاً</option>
        <option value="rating-desc">الأعلى تقييماً</option>
      </select>

      {/* View toggle */}
      <div className="pp-view-toggle">
        <button
          className={`pp-view-btn${!listView ? ' active' : ''}`}
          onClick={() => onViewChange(false)}
          aria-label="عرض شبكي"
          title="عرض شبكي"
        >
          ⊞
        </button>
        <button
          className={`pp-view-btn${listView ? ' active' : ''}`}
          onClick={() => onViewChange(true)}
          aria-label="عرض قائمة"
          title="عرض قائمة"
        >
          ≡
        </button>
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════ */
export const ProductsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('جميع الفئات');
  const [sortBy, setSortBy] = useState<SortOption>('created_at-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [listView, setListView] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const categories = ['جميع الفئات', 'سيارات', 'المواليد'];

  const getCategorySlug = (cat: string) => {
    const slugMap: Record<string, string> = {
      'سيارات': 'cars',
      'المواليد': 'balloons',
      'ديناصورات': 'dinosaurs',
      'فضاء': 'space'
    };
    return slugMap[cat] || '';
  };

  const parseSortOption = (option: SortOption) => {
    const [field, order] = option.split('-');
    return { field, order: order.toUpperCase() };
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const categorySlug = category === 'جميع الفئات' ? undefined : getCategorySlug(category);
        const params = new URLSearchParams({
          ...(categorySlug && { category: categorySlug }),
          ...(searchQuery && { search: searchQuery }),
          ...(minPrice && { min_price: minPrice }),
          ...(maxPrice && { max_price: maxPrice }),
          page: currentPage.toString(),
          limit: '9',
        });
        const response = await fetch(`http://localhost:8000/api/products?${params}`);
        const data = await response.json();
        if (data.success) {
          setProducts(data.data.products);
          setTotalPages(data.data.pagination.pages);
          setTotalCount(data.data.pagination.total ?? data.data.products.length);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [category, currentPage, searchQuery, minPrice, maxPrice]);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((p: any) =>
        p.name.toLowerCase().includes(query)
      );
    }

    filtered.sort((a: any, b: any) => {
      switch (sortBy) {
        case 'price-asc': return parseFloat(a.price) - parseFloat(b.price);
        case 'price-desc': return parseFloat(b.price) - parseFloat(a.price);
        case 'rating-desc': return (b.rating || 4.5) - (a.rating || 4.5);
        case 'name-asc': return a.name.localeCompare(b.name);
        default: return 0;
      }
    });

    return filtered;
  }, [products, searchQuery, sortBy]);

  const mappedProducts = filteredAndSortedProducts.map((p: any) => {
    // Use the image_url directly since it already contains the full URL
    const imageUrl = p.image_url || (p.images && p.images.length > 0 
      ? `http://localhost:8000${p.images[0].image_url}`
      : null);
    
    return {
      id: p.id.toString(),
      name: p.name,
      description: p.description,
      price: parseFloat(p.price),
      image: imageUrl,
      rating: 4.5,
      reviewsCount: 0,
      stock: p.stock,
      category: p.category_name,
      featured: false,
      images: p.images && p.images.length > 0 
        ? p.images.map((img: any) => `http://localhost:8000${img.image_url}`)
        : imageUrl ? [imageUrl] : [],
      longDescription: p.description,
      specifications: {},
    };
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="pp-root">

      {/* ── 1. Hero / Header ─────────────────────── */}
      <section className="pp-hero" aria-labelledby="pp-heading">
        <div className="pp-hero__inner">
          {/* Breadcrumb */}
          <nav className="pp-breadcrumb" aria-label="مسار التنقل">
            <Link to="/" className="">الرئيسية</Link>
            <span className="pp-breadcrumb__sep">›</span>
            <span className="pp-breadcrumb__current">جميع المنتجات</span>
          </nav>

          <h1 id="pp-heading" className="pp-hero__title">
            جميع <span>الألعاب</span>
          </h1>
          <p className="pp-hero__desc">
            اكتشف مجموعتنا المميزة من الألعاب عالية الجودة المصممة لإسعاد أطفالك.
            تصفح الفئات المختلفة واعثر على ما تحتاجه بالضبط.
          </p>
        </div>
      </section>

      {/* ── 2. Body (Sidebar + Main) ─────────────── */}
      <div className="pp-body">

        {/* ── 3. Filters (sidebar renders itself) ── */}
        <ProductFilters
          searchQuery={searchQuery}
          category={category}
          sortBy={sortBy}
          categories={categories}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onSearchChange={(q) => { setSearchQuery(q); setCurrentPage(1); }}
          onCategoryChange={(cat) => { setCategory(cat); setCurrentPage(1); }}
          onSortChange={setSortBy}
          onMinPriceChange={(price) => { setMinPrice(price); setCurrentPage(1); }}
          onMaxPriceChange={(price) => { setMaxPrice(price); setCurrentPage(1); }}
          drawerOpen={drawerOpen}
          onDrawerClose={() => setDrawerOpen(false)}
        />

        {/* ── 4. Main content ── */}
        <main>
          {/* Top controls */}
          <TopControls
            count={filteredAndSortedProducts.length}
            total={totalCount || filteredAndSortedProducts.length}
            sortBy={sortBy}
            onSortChange={setSortBy}
            listView={listView}
            onViewChange={setListView}
            onMobileFilter={() => setDrawerOpen(true)}
          />

          {/* Skeleton or grid */}
          {isLoading ? (
            <div className="pp-grid">
              {Array(9).fill(0).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <ProductGrid products={mappedProducts} listView={listView} />
          )}

          {/* Pagination */}
          {!isLoading && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </main>
      </div>
    </div>
  );
};
