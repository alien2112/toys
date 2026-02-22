import React, { useState, useEffect, useRef } from 'react'
import { Search, ChevronLeft, ChevronRight, Package, Star, CreditCard, Gift, Truck, Car, Waves, Smile, Baby, Circle, BookOpen, Bike, Trophy, Gamepad2, Puzzle, Sparkles, Box } from 'lucide-react'
import { Link } from 'react-router-dom'
import './Masthead.css'

// Icon mapping for categories
const iconMap: Record<string, React.ReactNode> = {
  'boys': <Car size={18} />,
  'water': <Waves size={18} />,
  'girls': <Smile size={18} />,
  'baby': <Baby size={18} />,
  'balloons': <Circle size={18} />,
  'edu': <BookOpen size={18} />,
  'bikes': <Bike size={18} />,
  'supercar': <Car size={18} />,
  'challenges': <Trophy size={18} />,
  'cars': <Car size={18} />,
  'dinosaurs': <Gamepad2 size={18} />,
  'space': <Sparkles size={18} />,
}

interface Category {
  id: number
  name: string
  slug: string
  description?: string
}

const slides = [
  {
    id: 0,
    headline: 'العب، اكتشف، اِبتكر',
    sub: 'أفضل الألعاب لكل سن وكل مناسبة',
    badge: 'وصل حديثاً',
    cta: 'تسوق الآن',
    panels: [
      { cls: 'ms-panel ms-panel--yellow', icon: <Bike size={24} />, label: 'دراجات' },
      { cls: 'ms-panel ms-panel--red ms-panel--skew', icon: null, label: '' },
      { cls: 'ms-panel ms-panel--blue', icon: <Box size={24} />, label: 'كراسي أطفال' },
      { cls: 'ms-panel ms-panel--peach ms-panel--skew', icon: null, label: '' },
      { cls: 'ms-panel ms-panel--pink', icon: <Smile size={24} />, label: 'دمى' },
    ]
  },
  {
    id: 1,
    headline: 'ألعاب تعليمية رائعة',
    sub: 'نمّي مهارات طفلك مع ألعابنا التعليمية',
    badge: 'الأكثر مبيعاً',
    cta: 'اكتشف المزيد',
    panels: [
      { cls: 'ms-panel ms-panel--blue', icon: <BookOpen size={24} />, label: 'تعليمي' },
      { cls: 'ms-panel ms-panel--yellow ms-panel--skew', icon: null, label: '' },
      { cls: 'ms-panel ms-panel--pink', icon: <Gamepad2 size={24} />, label: 'ألعاب ذكاء' },
      { cls: 'ms-panel ms-panel--red ms-panel--skew', icon: null, label: '' },
      { cls: 'ms-panel ms-panel--peach', icon: <Puzzle size={24} />, label: 'بازل' },
    ]
  },
  {
    id: 2,
    headline: 'بالونات هيليوم للمناسبات',
    sub: 'اجعل حفلتك لا تُنسى مع بالوناتنا',
    badge: 'خاص للعيد',
    cta: 'احجز الآن',
    panels: [
      { cls: 'ms-panel ms-panel--pink', icon: <Circle size={24} />, label: 'بالونات' },
      { cls: 'ms-panel ms-panel--peach ms-panel--skew', icon: null, label: '' },
      { cls: 'ms-panel ms-panel--yellow', icon: <Sparkles size={24} />, label: 'هدايا' },
      { cls: 'ms-panel ms-panel--blue ms-panel--skew', icon: null, label: '' },
      { cls: 'ms-panel ms-panel--red', icon: <Gift size={24} />, label: 'مفاجآت' },
    ]
  }
]

const features = [
  { icon: <Truck size={22} />, label: 'توصيل سريع', note: 'لجميع المناطق' },
  { icon: <Star size={22} />, label: 'جودة عالية', note: 'منتجات موثوقة' },
  { icon: <CreditCard size={22} />, label: 'دفع آمن', note: 'بطاقات & Apple Pay' },
  { icon: <Gift size={22} />, label: 'تغليف هدايا', note: 'خدمة مجانية' },
  { icon: <Package size={22} />, label: 'إرجاع مجاني', note: 'خلال 30 يوم' },
]

const Masthead: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/categories')
      const data = await response.json()
      
      if (data.success) {
        setCategories(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const goTo = (idx: number) => {
    if (animating) return
    setAnimating(true)
    setCurrent(idx)
    setTimeout(() => setAnimating(false), 500)
  }

  const next = () => goTo((current + 1) % slides.length)
  const prev = () => goTo((current - 1 + slides.length) % slides.length)

  useEffect(() => {
    intervalRef.current = setInterval(next, 5000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [current])

  const slide = slides[current]

  return (
    <>
      {/* ── Search Banner ── */}
      <section className="ms-search-bar" aria-label="بحث">
        <div className="ms-search-bar__inner">
          <Link to="/products" className="ms-search-bar__browse">
            تسوق حسب الأقسام
          </Link>
          <div className="ms-search-bar__form">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="ابحث عن منتجات..."
              className="ms-search-bar__input"
              aria-label="بحث عن منتجات"
            />
            <select className="ms-search-bar__select" aria-label="اختيار الفئة">
              <option>جميع الأقسام</option>
              {categories.map(c => <option key={c.id}>{c.name}</option>)}
            </select>
            <button className="ms-search-bar__btn" aria-label="بحث">
              <Search size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* ── Hero Slider ── */}
      <section className="ms-hero" aria-label="العروض الرئيسية">
        {/* Panels */}
        <div className={`ms-hero__panels ${animating ? 'ms-hero__panels--anim' : ''}`}>
          {slide.panels.map((p, i) => (
            <div key={i} className={p.cls}>
              {p.icon && (
                <div className="ms-panel__content">
                  <span className="ms-panel__emoji">{p.icon}</span>
                  {p.label && <span className="ms-panel__label">{p.label}</span>}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Text overlay */}
        <div className="ms-hero__overlay" />
        <div className={`ms-hero__text ${animating ? 'ms-hero__text--exit' : 'ms-hero__text--enter'}`}>
          <span className="ms-hero__badge">{slide.badge}</span>
          <h1 className="ms-hero__headline">{slide.headline}</h1>
          <p className="ms-hero__sub">{slide.sub}</p>
          <Link to="/products" className="ms-hero__cta">{slide.cta}</Link>
        </div>

        {/* Navigation */}
        <button className="ms-hero__nav ms-hero__nav--prev" onClick={prev} aria-label="السابق">
          <ChevronRight size={28} />
        </button>
        <button className="ms-hero__nav ms-hero__nav--next" onClick={next} aria-label="التالي">
          <ChevronLeft size={28} />
        </button>

        {/* Dots */}
        <div className="ms-hero__dots" role="tablist">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`ms-hero__dot ${i === current ? 'ms-hero__dot--active' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`شريحة ${i + 1}`}
              role="tab"
            />
          ))}
        </div>

        {/* WhatsApp float */}
        <a
          href="https://wa.me/966123456789"
          className="ms-hero__whatsapp"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="تواصل عبر واتساب"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          <span>لاستفساراتكم؟ ابدأ المحادثة</span>
        </a>
      </section>

      {/* ── Category Pills ── */}
      <section className="ms-cats" aria-label="الأقسام">
        <div className="ms-cats__inner">
          {categories.map(cat => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.slug}`}
              className="ms-cats__pill"
              aria-label={cat.name}
            >
              <span className="ms-cats__emoji">{iconMap[cat.slug] || <Package size={18} />}</span>
              <span className="ms-cats__label">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Features Bar ── */}
      <section className="ms-features" aria-label="مميزاتنا">
        <div className="ms-features__inner">
          {features.map((f, i) => (
            <div key={i} className="ms-features__item">
              <div className="ms-features__icon">{f.icon}</div>
              <div className="ms-features__text">
                <span className="ms-features__label">{f.label}</span>
                <span className="ms-features__note">{f.note}</span>
              </div>
              {i < features.length - 1 && <div className="ms-features__divider" />}
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

export default Masthead
