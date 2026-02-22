import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Heart,
  Shield,
  Star,
  BookOpen,
  Package,
  Truck,
  Gift,
  CreditCard,
  HeadphonesIcon,
  Users,
  Award,
  TrendingUp,
  CheckCircle,
  ArrowLeft,
  Sparkles,
  Smile,
  Zap,
} from 'lucide-react'
import './AboutPage.css'

/* ─── Animated Counter Hook ─── */
function useCounter(target: number, duration: number, started: boolean) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!started) return
    let start = 0
    const step = Math.ceil(target / (duration / 16))
    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(start)
      }
    }, 16)
    return () => clearInterval(timer)
  }, [started, target, duration])
  return count
}

/* ─── Intersection Observer Hook ─── */
function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect() } },
      { threshold }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

/* ─── Stat Card ─── */
interface StatCardProps {
  icon: React.ReactNode
  value: number
  suffix: string
  label: string
  started: boolean
}
const StatCard: React.FC<StatCardProps> = ({ icon, value, suffix, label, started }) => {
  const count = useCounter(value, 2000, started)
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-number">{count.toLocaleString('ar-SA')}{suffix}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

/* ─── Main Page ─── */
const AboutPage: React.FC = () => {
  const { ref: heroRef, inView: heroInView } = useInView(0.1)
  const { ref: storyRef, inView: storyInView } = useInView(0.15)
  const { ref: missionRef, inView: missionInView } = useInView(0.15)
  const { ref: valuesRef, inView: valuesInView } = useInView(0.1)
  const { ref: whyRef, inView: whyInView } = useInView(0.1)
  const { ref: statsRef, inView: statsInView } = useInView(0.2)
  const { ref: ctaRef, inView: ctaInView } = useInView(0.2)

  const milestones = [
    { year: '2018', title: 'بداية الحلم', desc: 'انطلقت AMANLOVE من فكرة بسيطة: إحضار الفرح إلى كل منزل.' },
    { year: '2019', title: 'أولى خطواتنا', desc: 'فتحنا أبوابنا رسمياً وخدمنا أولى العائلات الكريمة.' },
    { year: '2021', title: 'النمو والتوسع', desc: 'تجاوزنا حاجز 1000 عائلة سعيدة وسّعنا تشكيلتنا بشكل كبير.' },
    { year: '2024', title: 'الريادة والتميز', desc: 'أصبحنا المتجر المفضّل لآلاف الأسر في المملكة.' },
  ]

  const values = [
    { icon: <Smile size={32} />, title: 'الفرح أولاً', text: 'نؤمن بأن اللعب ليس رفاهية، بل حق لكل طفل. نختار كل منتج بعناية ليجلب الابتسامة والبهجة.', color: '#FFB800' },
    { icon: <Shield size={32} />, title: 'الأمان لا يُساوَم عليه', text: 'كل لعبة في متجرنا تلبي أعلى معايير السلامة العالمية. صحة أطفالكم وسلامتهم هي أولويتنا القصوى.', color: '#22C55E' },
    { icon: <Star size={32} />, title: 'الجودة في كل التفاصيل', text: 'لا نقبل بأقل من الأفضل. نختار علامات تجارية موثوقة ومنتجات متينة تدوم طويلاً وتحافظ على قيمتها.', color: '#8B5CF6' },
    { icon: <BookOpen size={32} />, title: 'التعلم من خلال اللعب', text: 'نؤمن بقوة الألعاب التعليمية التي تنمي مهارات الأطفال الذهنية والحركية والاجتماعية بطريقة ممتعة.', color: '#3B82F6' },
    { icon: <Heart size={32} />, title: 'العائلة في القلب', text: 'نحن عائلة نخدم عائلات. نفهم احتياجاتكم لأننا نعيشها، ونعاملكم كما نحب أن نُعامَل.', color: '#EF4444' },
  ]

  const differentiators = [
    { icon: <Package size={28} />, title: 'تشكيلة مختارة بعناية فائقة', text: 'لا نعرض كل شيء. نعرض الأفضل فقط. كل منتج يمر بفريقنا من الآباء والأمهات قبل أن يصل إليكم.' },
    { icon: <Truck size={28} />, title: 'توصيل سريع وموثوق', text: 'نعرف أن الأطفال لا يحبون الانتظار. لذلك نوصل طلباتكم بسرعة وأمان إلى باب منزلكم.' },
    { icon: <Gift size={28} />, title: 'خدمة تغليف الهدايا', text: 'كل مناسبة تستحق أن تكون مميزة. نقدم خدمة تغليف احترافية تجعل هديتكم لا تُنسى.' },
    { icon: <CreditCard size={28} />, title: 'طرق دفع آمنة ومتنوعة', text: 'تسوقوا براحة بال تامة. نوفر خيارات دفع آمنة ومرنة تناسب الجميع.' },
    { icon: <HeadphonesIcon size={28} />, title: 'دعم عملاء يهتم حقاً', text: 'فريقنا موجود دائماً للإجابة على أسئلتكم ومساعدتكم في اختيار الألعاب المناسبة لأعمار أطفالكم.' },
  ]

  const trustBadges = [
    { icon: <Users size={24} />, label: 'آلاف العائلات السعيدة', desc: 'انضموا إلى مجتمع AMANLOVE' },
    { icon: <Award size={24} />, label: 'منتجات أصلية 100%', desc: 'نضمن أصالة كل منتج نبيعه' },
    { icon: <CheckCircle size={24} />, label: 'سياسة إرجاع مرنة', desc: 'رضاكم هو هدفنا دائماً' },
  ]

  return (
    <div className="about-page" id="about">

      {/* ── 1. Hero Section ── */}
      <section className="ab-hero" aria-label="صفحة من نحن">
        <div className="ab-hero__bg-pattern" aria-hidden="true">
          {[...Array(20)].map((_, i) => (
            <span key={i} className={`ab-hero__particle ab-hero__particle--${i % 5}`} aria-hidden="true" />
          ))}
        </div>
        <div className="ab-hero__glow" aria-hidden="true" />
        <div
          className={`ab-container ab-hero__content ${heroInView ? 'ab-anim-in' : ''}`}
          ref={heroRef}
        >
          <div className="ab-hero__badge">
            <Sparkles size={14} />
            <span>AMANLOVE <Heart size={14} fill="currentColor" strokeWidth={0} style={{ display: 'inline-block', verticalAlign: 'middle' }} /></span>
          </div>
          <h1 className="ab-hero__title">
            نحن نصنع الفرح
            <span className="ab-hero__title-highlight"> لعبة واحدة </span>
            في كل مرة
          </h1>
          <p className="ab-hero__subtitle">
            في AMANLOVE، نؤمن بأن كل طفل يستحق أن يعيش طفولة مليئة بالضحك والاكتشاف والذكريات الجميلة.
            منذ أن فتحنا أبوابنا، كان هدفنا واحداً: أن نكون جزءاً من أسعد لحظات عائلتك.
          </p>
          <div className="ab-hero__cta-row">
            <Link to="/products" className="ab-btn ab-btn--primary">
              <Zap size={18} />
              اكتشف متجرنا
            </Link>
            <Link to="/contact" className="ab-btn ab-btn--ghost">
              تواصل معنا
              <ArrowLeft size={18} />
            </Link>
          </div>
        </div>
        <div className="ab-hero__scroll-indicator" aria-hidden="true">
          <div className="ab-hero__scroll-dot" />
        </div>
      </section>

      {/* ── 2. Our Story + Timeline ── */}
      <section className="ab-section ab-story" aria-labelledby="story-heading">
        <div className="ab-container">
          <div className={`ab-story__grid ${storyInView ? 'ab-anim-in' : ''}`} ref={storyRef}>
            {/* Text Side */}
            <div className="ab-story__text">
              <div className="ab-eyebrow">قصتنا</div>
              <h2 id="story-heading" className="ab-heading">
                رحلة بدأت بحلم <span className="ab-highlight">بسيط</span>
              </h2>
              <p className="ab-body-text">
                بدأت AMANLOVE من حلم بسيط: أن نجلب البهجة إلى كل منزل في المملكة العربية السعودية.
              </p>
              <p className="ab-body-text">
                كنا آباء وأمهات مثلكم، نبحث عن ألعاب آمنة وممتعة وذات قيمة حقيقية. لكننا وجدنا أن السوق يفتقر إلى متجر يجمع بين الجودة العالية والتنوع الكبير والخدمة المميزة.
              </p>
              <p className="ab-body-text ab-body-text--accent">
                كل لعبة نختارها تمر بمعايير صارمة للجودة والأمان. كل طلب نستقبله نعامله كأنه لأطفالنا. وكل ابتسامة نراها على وجه طفل تذكرنا لماذا بدأنا هذه الرحلة.
              </p>
            </div>

            {/* Timeline Side */}
            <div className="ab-story__timeline">
              {milestones.map((m, i) => (
                <div
                  className="ab-timeline-item"
                  key={i}
                  style={{ animationDelay: `${i * 0.15}s` }}
                >
                  <div className="ab-timeline-item__year">{m.year}</div>
                  <div className="ab-timeline-item__connector">
                    <div className="ab-timeline-item__dot" />
                    {i < milestones.length - 1 && <div className="ab-timeline-item__line" />}
                  </div>
                  <div className="ab-timeline-item__card">
                    <h3 className="ab-timeline-item__title">{m.title}</h3>
                    <p className="ab-timeline-item__desc">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Mission, Vision ── */}
      <section className="ab-section ab-mission" aria-labelledby="mission-heading">
        <div className="ab-mission__bg" aria-hidden="true" />
        <div className="ab-container">
          <div className="ab-section-header">
            <div className="ab-eyebrow">رؤيتنا ورسالتنا</div>
            <h2 id="mission-heading" className="ab-heading ab-heading--center">
              نحو مستقبل <span className="ab-highlight">أفضل</span> للأطفال
            </h2>
          </div>
          <div
            className={`ab-mission__grid ${missionInView ? 'ab-anim-in' : ''}`}
            ref={missionRef}
          >
            <div className="ab-mission-card ab-mission-card--vision">
              <div className="ab-mission-card__icon-wrap">
                <TrendingUp size={36} />
              </div>
              <div className="ab-mission-card__label">رؤيتنا</div>
              <h3 className="ab-mission-card__title">الوجهة الأولى للعائلات</h3>
              <p className="ab-mission-card__text">
                أن نكون الوجهة الأولى لكل عائلة في المملكة والخليج عندما يتعلق الأمر بألعاب الأطفال، حيث تلتقي الجودة بالفرح والتعليم بالمرح.
              </p>
            </div>
            <div className="ab-mission-card ab-mission-card--mission">
              <div className="ab-mission-card__icon-wrap">
                <Heart size={36} />
              </div>
              <div className="ab-mission-card__label">رسالتنا</div>
              <h3 className="ab-mission-card__title">إثراء طفولة كل طفل</h3>
              <p className="ab-mission-card__text">
                نسعى لإثراء طفولة كل طفل من خلال توفير ألعاب آمنة ومبتكرة وتعليمية، مع تقديم تجربة تسوق استثنائية تجعل كل عملية شراء لحظة سعيدة لكم ولأطفالكم.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Values ── */}
      <section className="ab-section ab-values" aria-labelledby="values-heading">
        <div className="ab-container">
          <div className="ab-section-header">
            <div className="ab-eyebrow">قيمنا</div>
            <h2 id="values-heading" className="ab-heading ab-heading--center">
              القيم التي <span className="ab-highlight">نعيشها</span> كل يوم
            </h2>
          </div>
          <div
            className={`ab-values__grid ${valuesInView ? 'ab-anim-in' : ''}`}
            ref={valuesRef}
          >
            {values.map((v, i) => (
              <div
                className="ab-value-card"
                key={i}
                style={{ '--accent': v.color, animationDelay: `${i * 0.1}s` } as React.CSSProperties}
              >
                <div className="ab-value-card__icon">{v.icon}</div>
                <h3 className="ab-value-card__title">{v.title}</h3>
                <p className="ab-value-card__text">{v.text}</p>
                <div className="ab-value-card__bar" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Why Choose Us (Differentiators) ── */}
      <section className="ab-section ab-why" aria-labelledby="why-heading">
        <div className="ab-why__bg" aria-hidden="true" />
        <div className="ab-container">
          <div className="ab-section-header">
            <div className="ab-eyebrow">لماذا نحن</div>
            <h2 id="why-heading" className="ab-heading ab-heading--center">
              لماذا تختار <span className="ab-highlight">AMANLOVE</span>؟
            </h2>
          </div>
          <div
            className={`ab-why__grid ${whyInView ? 'ab-anim-in' : ''}`}
            ref={whyRef}
          >
            {differentiators.map((d, i) => (
              <div
                className="ab-why-card"
                key={i}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="ab-why-card__icon">{d.icon}</div>
                <div className="ab-why-card__body">
                  <h3 className="ab-why-card__title">{d.title}</h3>
                  <p className="ab-why-card__text">{d.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Stats / Achievements ── */}
      <section className="ab-section ab-stats" aria-labelledby="stats-heading" ref={statsRef}>
        <div className="ab-stats__glow" aria-hidden="true" />
        <div className="ab-container">
          <div className="ab-section-header">
            <div className="ab-eyebrow ab-eyebrow--light">أرقام تتحدث</div>
            <h2 id="stats-heading" className="ab-heading ab-heading--center ab-heading--light">
              إنجازاتنا <span className="ab-highlight--light">بالأرقام</span>
            </h2>
          </div>
          <div className="ab-stats__grid">
            <StatCard icon={<Users size={32} />} value={15000} suffix="+" label="عائلة سعيدة" started={statsInView} />
            <StatCard icon={<Package size={32} />} value={500} suffix="+" label="منتج متنوع" started={statsInView} />
            <StatCard icon={<Award size={32} />} value={6} suffix="" label="سنوات من الثقة" started={statsInView} />
            <StatCard icon={<Star size={32} />} value={98} suffix="%" label="رضا العملاء" started={statsInView} />
          </div>

          {/* Trust Badges */}
          <div className="ab-trust-badges">
            {trustBadges.map((b, i) => (
              <div className="ab-trust-badge" key={i}>
                <div className="ab-trust-badge__icon">{b.icon}</div>
                <div>
                  <div className="ab-trust-badge__label">{b.label}</div>
                  <div className="ab-trust-badge__desc">{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. CTA Section ── */}
      <section className="ab-section ab-cta" aria-labelledby="cta-heading">
        <div className="ab-cta__bg-pattern" aria-hidden="true" />
        <div
          className={`ab-container ab-cta__content ${ctaInView ? 'ab-anim-in' : ''}`}
          ref={ctaRef}
        >
          <div className="ab-cta__icon-top" aria-hidden="true"><Heart size={32} fill="currentColor" strokeWidth={0} /></div>
          <h2 id="cta-heading" className="ab-cta__title">
            دعونا نكون جزءاً من قصة طفولة أطفالكم
          </h2>
          <p className="ab-cta__sub">
            كل لعبة هي بداية مغامرة جديدة. كل ابتسامة هي ذكرى تدوم للأبد.
          </p>
          <p className="ab-cta__sub">
            في AMANLOVE، نحن لا نبيع ألعاباً فقط. نحن نساعدكم في بناء لحظات سعيدة تبقى في قلوب أطفالكم إلى الأبد.
          </p>
          <div className="ab-cta__buttons">
            <Link to="/products" className="ab-btn ab-btn--cta-primary">
              <Zap size={20} />
              ابدأ التسوق الآن
            </Link>
            <Link to="/contact" className="ab-btn ab-btn--cta-secondary">
              اتصل بنا
              <ArrowLeft size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage
