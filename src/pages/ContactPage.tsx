import React, { useState, useEffect, useRef } from 'react'
import {
  Mail, Phone, Clock, MapPin, Send, CheckCircle,
  MessageCircle, Shield, Zap, Users, ChevronDown
} from 'lucide-react'
import CountUp from 'react-countup'
import './ContactPage.css'

interface ContactInfo {
  email: string
  phone: string
  whatsapp: string
  address: string
  hours: string
}

const faqs = [
  {
    q: 'ما هو وقت الرد على الرسائل؟',
    a: 'نرد على جميع الرسائل خلال 24 ساعة كحد أقصى في أيام العمل.'
  },
  {
    q: 'هل يمكنني تتبع طلبي؟',
    a: 'نعم، يمكنك التواصل معنا برقم الطلب وسنزودك بآخر التحديثات فوراً.'
  },
  {
    q: 'ما طرق الدفع المتاحة؟',
    a: 'نقبل البطاقات الائتمانية، مدى، Apple Pay، وتحويل بنكي.'
  },
  {
    q: 'هل تتوفر خدمة التوصيل لجميع المناطق؟',
    a: 'نعم، نوصّل لجميع مناطق المملكة العربية السعودية.'
  }
]

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: 'support@amanlove.com',
    phone: '+966 1234 5678',
    whatsapp: '+96612345678',
    address: 'السعودية',
    hours: 'السبت - الخميس: 9:00 صباحاً - 9:00 مساءً'
  })
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchSettings()
    // Trigger animation on mount
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/settings')
      const data = await response.json()

      if (data.success) {
        setContactInfo({
          email: data.data.contact_email || 'support@amanlove.com',
          phone: data.data.contact_phone || '+966 1234 5678',
          whatsapp: data.data.contact_whatsapp || '+96612345678',
          address: data.data.contact_address || 'السعودية',
          hours: data.data.contact_hours || 'السبت - الخميس: 9:00 صباحاً - 9:00 مساءً'
        })
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
    setTimeout(() => setIsSubmitted(false), 5000)
  }

  return (
    <div className="cp-page" id="contact" dir="rtl">

      {/* ── Hero ── */}
      <section className="cp-hero" ref={heroRef}>
        {/* Animated background shapes */}
        <div className="cp-hero__bg">
          <div className="cp-hero__orb cp-hero__orb--1" />
          <div className="cp-hero__orb cp-hero__orb--2" />
          <div className="cp-hero__orb cp-hero__orb--3" />
          <div className="cp-hero__grid" />
        </div>

        {/* Floating particles */}
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className={`cp-hero__particle cp-hero__particle--${i + 1}`} />
        ))}

        <div className={`cp-hero__content ${isVisible ? 'cp-hero__content--visible' : ''}`}>
          <div className="cp-hero__badge">
            <MessageCircle size={14} />
            <span>تواصل معنا</span>
          </div>
          <h1 className="cp-hero__title">
            نحن هنا <span className="cp-hero__title-accent">لمساعدتك</span>
          </h1>
          <p className="cp-hero__desc">
            هل لديك سؤال؟ تحتاج إلى مساعدة في اختيار اللعبة المثالية؟<br />
            فريقنا المتخصص جاهز للرد عليك بكل سرور وفي أسرع وقت.
          </p>

          {/* Trust stats */}
          <div className="cp-hero__stats">
            <div className="cp-hero__stat">
              <Zap size={20} className="cp-hero__stat-icon" />
              <div>
                <span className="cp-hero__stat-value">24h</span>
                <span className="cp-hero__stat-label">وقت الرد</span>
              </div>
            </div>
            <div className="cp-hero__stat-divider" />
            <div className="cp-hero__stat">
              <Users size={20} className="cp-hero__stat-icon" />
              <div>
                <span className="cp-hero__stat-value"><CountUp end={5000} prefix="+" suffix="K" /></span>
                <span className="cp-hero__stat-label">عميل سعيد</span>
              </div>
            </div>
            <div className="cp-hero__stat-divider" />
            <div className="cp-hero__stat">
              <Shield size={20} className="cp-hero__stat-icon" />
              <div>
                <span className="cp-hero__stat-value"><CountUp end={100} suffix="%" /></span>
                <span className="cp-hero__stat-label">خصوصية آمنة</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="cp-hero__scroll">
          <div className="cp-hero__scroll-dot" />
        </div>
      </section>

      {/* ── Main Contact Section ── */}
      <section className="cp-main">
        {/* Subtle background decoration */}
        <div className="cp-main__bg-deco cp-main__bg-deco--1" />
        <div className="cp-main__bg-deco cp-main__bg-deco--2" />

        <div className="cp-container">
          <div className="cp-grid">

            {/* ── Left: Contact Form ── */}
            <div className="cp-form-card">
              <div className="cp-form-card__header">
                <h2 className="cp-form-card__title">أرسل لنا رسالة</h2>
                <p className="cp-form-card__sub">سنرد عليك في أقرب وقت ممكن</p>
              </div>

              <form className="cp-form" onSubmit={handleSubmit} noValidate>
                <div className="cp-form__row">
                  <div className="cp-field">
                    <label htmlFor="name" className="cp-field__label">الاسم الكامل</label>
                    <div className="cp-field__input-wrap">
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="cp-field__input"
                        placeholder="أدخل اسمك الكامل"
                        required
                        aria-label="الاسم الكامل"
                      />
                      <div className="cp-field__focus-bar" />
                    </div>
                  </div>

                  <div className="cp-field">
                    <label htmlFor="email" className="cp-field__label">البريد الإلكتروني</label>
                    <div className="cp-field__input-wrap">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="cp-field__input"
                        placeholder="example@email.com"
                        required
                        aria-label="البريد الإلكتروني"
                      />
                      <div className="cp-field__focus-bar" />
                    </div>
                  </div>
                </div>

                <div className="cp-form__row">
                  <div className="cp-field">
                    <label htmlFor="phone" className="cp-field__label">رقم الهاتف <span className="cp-field__optional">(اختياري)</span></label>
                    <div className="cp-field__input-wrap">
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="cp-field__input"
                        placeholder="+966 XXXX XXXX"
                        aria-label="رقم الهاتف"
                      />
                      <div className="cp-field__focus-bar" />
                    </div>
                  </div>

                  <div className="cp-field">
                    <label htmlFor="subject" className="cp-field__label">الموضوع</label>
                    <div className="cp-field__input-wrap cp-field__input-wrap--select">
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="cp-field__input cp-field__select"
                        required
                        aria-label="الموضوع"
                      >
                        <option value="">اختر الموضوع</option>
                        <option value="product-inquiry">استفسار عن منتج</option>
                        <option value="order-status">حالة الطلب</option>
                        <option value="complaint">شكوى</option>
                        <option value="suggestion">اقتراح</option>
                        <option value="other">أخرى</option>
                      </select>
                      <div className="cp-field__focus-bar" />
                    </div>
                  </div>
                </div>

                <div className="cp-field">
                  <label htmlFor="message" className="cp-field__label">رسالتك</label>
                  <div className="cp-field__input-wrap">
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      className="cp-field__input cp-field__textarea"
                      placeholder="اكتب رسالتك هنا..."
                      rows={6}
                      required
                      aria-label="رسالتك"
                    />
                    <div className="cp-field__focus-bar" />
                  </div>
                </div>

                <button
                  type="submit"
                  className={`cp-submit-btn ${isSubmitted ? 'cp-submit-btn--success' : ''}`}
                  id="contact-submit-btn"
                  aria-label="إرسال الرسالة"
                >
                  {isSubmitted ? (
                    <>
                      <CheckCircle size={20} />
                      <span>تم الإرسال بنجاح!</span>
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      <span>إرسال الرسالة</span>
                    </>
                  )}
                  <div className="cp-submit-btn__shimmer" />
                </button>

                {isSubmitted && (
                  <div className="cp-success-banner" role="alert">
                    <CheckCircle size={18} />
                    <span>تم إرسال رسالتك بنجاح! سنرد عليك قريباً.</span>
                  </div>
                )}
              </form>
            </div>

            {/* ── Right: Contact Info ── */}
            <div className="cp-info-col">
              <div className="cp-info-header">
                <h2 className="cp-info-header__title">معلومات التواصل</h2>
                <p className="cp-info-header__sub">نحن متاحون لك دائماً</p>
              </div>

              <div className="cp-info-cards">
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="cp-info-card"
                  aria-label={`البريد الإلكتروني: ${contactInfo.email}`}
                >
                  <div className="cp-info-card__icon-wrap">
                    <Mail size={24} strokeWidth={1.8} />
                  </div>
                  <div className="cp-info-card__body">
                    <span className="cp-info-card__label">البريد الإلكتروني</span>
                    <span className="cp-info-card__value">{contactInfo.email}</span>
                    <span className="cp-info-card__note">نرد خلال 24 ساعة</span>
                  </div>
                  <div className="cp-info-card__arrow">›</div>
                </a>

                <a
                  href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}
                  className="cp-info-card"
                  dir="ltr"
                  aria-label={`الهاتف: ${contactInfo.phone}`}
                >
                  <div className="cp-info-card__icon-wrap">
                    <Phone size={24} strokeWidth={1.8} />
                  </div>
                  <div className="cp-info-card__body" dir="rtl">
                    <span className="cp-info-card__label">الهاتف</span>
                    <span className="cp-info-card__value" dir="ltr">{contactInfo.phone}</span>
                    <span className="cp-info-card__note">متاح خلال ساعات العمل</span>
                  </div>
                  <div className="cp-info-card__arrow" dir="rtl">›</div>
                </a>

                <div className="cp-info-card cp-info-card--static">
                  <div className="cp-info-card__icon-wrap">
                    <Clock size={24} strokeWidth={1.8} />
                  </div>
                  <div className="cp-info-card__body">
                    <span className="cp-info-card__label">ساعات العمل</span>
                    <span className="cp-info-card__value">{contactInfo.hours}</span>
                    <span className="cp-info-card__note">الجمعة: مغلق</span>
                  </div>
                </div>

                <div className="cp-info-card cp-info-card--static">
                  <div className="cp-info-card__icon-wrap">
                    <MapPin size={24} strokeWidth={1.8} />
                  </div>
                  <div className="cp-info-card__body">
                    <span className="cp-info-card__label">الموقع</span>
                    <span className="cp-info-card__value">{contactInfo.address}</span>
                    <span className="cp-info-card__note">نوصّل لجميع مناطق السعودية</span>
                  </div>
                </div>
              </div>

              {/* Trust box */}
              <div className="cp-trust-box">
                <div className="cp-trust-box__header">
                  <Shield size={18} />
                  <h3>لماذا تتواصل معنا؟</h3>
                </div>
                <ul className="cp-trust-list">
                  <li className="cp-trust-list__item">
                    <span className="cp-trust-list__check"><CheckCircle size={16} /></span>
                    رد سريع خلال 24 ساعة كحد أقصى
                  </li>
                  <li className="cp-trust-list__item">
                    <span className="cp-trust-list__check"><CheckCircle size={16} /></span>
                    فريق متخصص يفهم احتياجاتك
                  </li>
                  <li className="cp-trust-list__item">
                    <span className="cp-trust-list__check"><CheckCircle size={16} /></span>
                    خصوصيتك محمية بالكامل
                  </li>
                  <li className="cp-trust-list__item">
                    <span className="cp-trust-list__check"><CheckCircle size={16} /></span>
                    حلول عملية لكل استفساراتك
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WhatsApp CTA ── */}
      <section className="cp-whatsapp">
        <div className="cp-container">
          <div className="cp-whatsapp__card">
            <div className="cp-whatsapp__bg-glow" />
            <div className="cp-whatsapp__content">
              <div className="cp-whatsapp__icon-wrap">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <div>
                <h2 className="cp-whatsapp__title">تفضل التواصل عبر واتساب؟</h2>
                <p className="cp-whatsapp__text">تحدث معنا مباشرة واحصل على رد فوري على استفساراتك</p>
              </div>
            </div>
            <a
              href={`https://wa.me/${contactInfo.whatsapp.replace(/[^0-9]/g, '')}`}
              className="cp-whatsapp__btn"
              target="_blank"
              rel="noopener noreferrer"
              id="whatsapp-cta-btn"
              aria-label="فتح محادثة واتساب"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span>ابدأ المحادثة الآن</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section className="cp-faq">
        <div className="cp-container">
          <div className="cp-faq__header">
            <div className="cp-eyebrow">
              <span>الأسئلة الشائعة</span>
            </div>
            <h2 className="cp-faq__title">هل لديك سؤال؟</h2>
            <p className="cp-faq__sub">إليك أكثر الأسئلة التي نتلقاها وإجاباتها</p>
          </div>

          <div className="cp-faq__list">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className={`cp-faq__item ${openFaq === i ? 'cp-faq__item--open' : ''}`}
              >
                <button
                  className="cp-faq__question"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                  id={`faq-${i}`}
                >
                  <span>{faq.q}</span>
                  <ChevronDown size={20} className="cp-faq__chevron" />
                </button>
                <div
                  className="cp-faq__answer"
                  role="region"
                  aria-labelledby={`faq-${i}`}
                >
                  <p>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}

export default ContactPage
