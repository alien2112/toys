// src/pages/ProductDetailPage.tsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ProductGallery } from '../components/ProductGallery';
import { ProductInfo } from '../components/ProductInfo';
import { ReviewList } from '../components/ReviewList';
import { RelatedProducts } from '../components/RelatedProducts';
import {
  Truck, RotateCcw, ShieldCheck, CreditCard,
  FileText, BarChart3, Star, ArrowRight, PackageX,
  Sparkles
} from 'lucide-react';
import './ProductDetailPage.css';

/* ── Trust badges data ──────────────────────── */
const trustBadges = [
  { icon: Truck, label: 'شحن سريع', sub: 'توصيل خلال 2-5 أيام عمل' },
  { icon: RotateCcw, label: 'إرجاع مجاني', sub: 'خلال 30 يوم من الشراء' },
  { icon: ShieldCheck, label: 'ضمان الجودة', sub: 'منتجات أصلية 100%' },
  { icon: CreditCard, label: 'دفع آمن', sub: 'بيانات مشفرة ومحمية' },
];

/* ── Skeleton loading state ─────────────────── */
const LoadingSkeleton = () => (
  <div className="pdp-root">
    <div className="pdp-crumb">
      <div className="pdp-crumb__inner">
        <div className="pdp-skeleton-block" style={{ width: 220, height: 14 }} />
      </div>
    </div>
    <div className="pdp-main">
      <div className="pdp-skeleton-block" style={{ aspectRatio: '1', borderRadius: 20 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
        <div className="pdp-skeleton-block" style={{ height: 20, width: '45%' }} />
        <div className="pdp-skeleton-block" style={{ height: 36, width: '75%' }} />
        <div className="pdp-skeleton-block" style={{ height: 22, width: '40%', borderRadius: 999 }} />
        <div className="pdp-skeleton-block" style={{ height: 80, borderRadius: 16 }} />
        <div className="pdp-skeleton-block" style={{ height: 18, width: '30%', borderRadius: 999 }} />
        <div className="pdp-skeleton-block" style={{ height: 64, borderRadius: 10 }} />
        <div style={{ display: 'flex', gap: '.85rem' }}>
          <div className="pdp-skeleton-block" style={{ height: 54, flex: 1, borderRadius: 999 }} />
          <div className="pdp-skeleton-block" style={{ height: 54, flex: 1, borderRadius: 999 }} />
        </div>
      </div>
    </div>
  </div>
);

/* ── Main page ──────────────────────────────── */
export const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState<any>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');

  useEffect(() => {
    const fetchProductData = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const productRes = await fetch(`http://localhost:8000/api/products/${id}`);
        const productData = await productRes.json();

        if (productData.success && productData.data) {
          setProduct(productData.data);
          
          // Fetch variants if product has them
          if (productData.data.has_variants) {
            const variantsRes = await fetch(`http://localhost:8000/api/products/${id}/variants`);
            const variantsData = await variantsRes.json();
            
            if (variantsData.success) {
              setVariants(variantsData.data || []);
              // Select first available variant by default
              const firstVariant = variantsData.data?.find((v: any) => v.is_active);
              if (firstVariant) {
                setSelectedVariant(firstVariant);
              }
            }
          }
          
          if (productData.data.category_slug) {
            const relatedRes = await fetch(`http://localhost:8000/api/products?category=${productData.data.category_slug}&limit=5`);
            const relatedData = await relatedRes.json();
            if (relatedData.success) {
              setRelatedProducts(
                relatedData.data.products
                  .filter((p: any) => p.id.toString() !== id)
                  .slice(0, 4)
              );
            }
          }
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductData();
  }, [id]);



  /* ── Loading state ── */
  if (isLoading) return <LoadingSkeleton />;

  /* ── Not found ── */
  if (!product) {
    return (
      <div className="pdp-root">
        <div className="pdp-not-found">
          <div className="pdp-not-found__icon"><PackageX size={60} /></div>
          <h1>المنتج غير موجود</h1>
          <p>عذراً، لم نتمكن من العثور على المنتج المطلوب.</p>
          <button className="pdp-not-found__btn" onClick={() => navigate('/products')}>
            <ArrowRight size={16} /> العودة إلى المنتجات
          </button>
        </div>
      </div>
    );
  }

  /* ── Mapped product ── */
  const currentDisplayProduct = selectedVariant || product;
  const mapped = {
    id: product.id.toString(),
    name: product.name,
    description: product.description,
    longDescription: product.description,
    price: parseFloat(currentDisplayProduct?.price || product.price),
    image: currentDisplayProduct?.image_url || product.image_url,
    images:
      currentDisplayProduct?.image_url 
        ? [currentDisplayProduct.image_url]
        : product.images && product.images.length > 0
          ? product.images.map((img: any) => `http://localhost:8000${img.image_url}`)
          : product.image_url ? [product.image_url] : [],
    category: product.category_name,
    rating: 4.5,
    reviewsCount: 0,
    stock: currentDisplayProduct?.stock || product.stock,
    featured: false,
    specifications: {},
    hasVariants: product.has_variants,
    variants: variants,
    selectedVariant: selectedVariant,
  };

  const mappedRelated = relatedProducts.map((p: any) => ({
    id: p.id.toString(),
    name: p.name,
    description: p.description,
    longDescription: p.description,
    price: parseFloat(p.price),
    image: p.image_url,
    images: p.image_url ? [p.image_url] : [],
    category: p.category_name,
    rating: 4.5,
    reviewsCount: 0,
    stock: p.stock,
    featured: false,
    specifications: {},
  }));

  const hasSpecs = mapped.specifications && Object.keys(mapped.specifications).length > 0;

  const tabs = [
    { key: 'desc', icon: FileText, label: 'الوصف' },
    ...(hasSpecs ? [{ key: 'specs', icon: BarChart3, label: 'المواصفات' }] : []),
    { key: 'reviews', icon: Star, label: 'التقييمات' },
  ] as const;

  return (
    <div className="pdp-root">

      {/* ═══ 1. BREADCRUMB ═══ */}
      <nav className="pdp-crumb" aria-label="مسار التنقل">
        <div className="pdp-crumb__inner">
          <Link to="/">الرئيسية</Link>
          <span className="pdp-crumb__sep">›</span>
          <Link to="/products">المنتجات</Link>
          <span className="pdp-crumb__sep">›</span>
          {mapped.category && (
            <>
              <span>{mapped.category}</span>
              <span className="pdp-crumb__sep">›</span>
            </>
          )}
          <span className="pdp-crumb__current">{mapped.name}</span>
        </div>
      </nav>

      {/* ═══ 2. MAIN (Gallery + Info) ═══ */}
      <div className="pdp-main">
        <ProductGallery images={mapped.images.length ? mapped.images : [mapped.image]} name={mapped.name} />
        <ProductInfo product={mapped} />
      </div>

      {/* ═══ 3. TRUST BADGES ═══ */}
      <div className="pdp-trust">
        <div className="pdp-trust__grid">
          {trustBadges.map((b, i) => {
            const Icon = b.icon;
            return (
              <div key={i} className="pdp-trust__item">
                <span className="pdp-trust__icon"><Icon size={22} /></span>
                <div>
                  <div className="pdp-trust__label">{b.label}</div>
                  <div className="pdp-trust__sub">{b.sub}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══ 4. TABS ═══ */}
      <div className="pdp-tabs">
        <div className="pdp-tabs__bar" role="tablist">
          {tabs.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              role="tab"
              className={`pdp-tabs__btn${activeTab === key ? ' active' : ''}`}
              onClick={() => setActiveTab(key as any)}
              aria-selected={activeTab === key}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* Tab panels */}
        <div className="pdp-tabs__panel" key={activeTab} role="tabpanel">
          {activeTab === 'desc' && (
            <div className="pdp-desc-text">
              {mapped.longDescription || mapped.description || 'لا يوجد وصف متاح لهذا المنتج حالياً.'}
            </div>
          )}

          {activeTab === 'specs' && hasSpecs && (
            <div className="pdp-specs-grid">
              {Object.entries(mapped.specifications).map(([key, value]) => (
                <div key={key} className="pdp-spec-item">
                  <span className="pdp-spec-item__key">{key}</span>
                  <span className="pdp-spec-item__val">{String(value)}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reviews' && (
            <ReviewList productId={parseInt(id || '0')} />
          )}
        </div>
      </div>

      {/* ═══ 5. RELATED PRODUCTS ═══ */}
      {mappedRelated.length > 0 && (
        <div className="pdp-related">
          <div className="pdp-related__header">
            <h2 className="pdp-related__title">
              <Sparkles size={20} />
              منتجات ذات صلة
            </h2>
          </div>
          <RelatedProducts products={mappedRelated} />
        </div>
      )}

      {/* ═══ 6. STICKY MOBILE CTA ═══ */}
      <div className="pdp-mobile-cta">
        <span className="pdp-mobile-cta__price">{mapped.price.toFixed(2)} ر.س</span>
        <button
          className="pdp-mobile-cta__btn"
          disabled={mapped.stock === 0}
        >
          {mapped.stock === 0 ? 'غير متوفر' : 'أضف إلى السلة'}
        </button>
      </div>
    </div>
  );
};
