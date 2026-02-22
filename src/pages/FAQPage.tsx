import { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Minus, Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import './FAQPage.css';

interface FAQ {
    id: string;
    category: string;
    question: string;
    answer: string;
}

const FAQ_DATA: FAQ[] = [
    { id: '1', category: 'الطلبات', question: 'كيف يمكنني تقديم طلب؟', answer: 'تصفح الكتالوج الخاص بنا، أضف العناصر إلى سلة التسوق الخاصة بك، وانتقل إلى الدفع. اتبع الخطوات لتقديم معلومات الشحن والدفع الخاصة بك.' },
    { id: '2', category: 'الطلبات', question: 'هل يمكنني إلغاء طلبي؟', answer: 'يمكن إلغاء الطلبات فقط في غضون ساعة واحدة من تقديمها قبل معالجتها. يرجى الاتصال بالدعم على الفور.' },
    { id: '3', category: 'الشحن', question: 'كم يستغرق الشحن؟', answer: 'يستغرق الشحن العادي من 3 إلى 5 أيام عمل. تتوفر خيارات الشحن السريع عند الدفع، والتي تستغرق عادةً من يوم إلى يومي عمل.' },
    { id: '4', category: 'المدفوعات', question: 'ما هي طرق الدفع المقبولة؟', answer: 'نقبل جميع بطاقات الائتمان الرئيسية (Visa، MasterCard، American Express)، وPayPal، وApple Pay.' },
    { id: '5', category: 'الشحن', question: 'كيف يمكنني تتبع طلبي؟', answer: 'بمجرد شحن طلبك، ستتلقى رسالة بريد إلكتروني للتأكيد تحتوي على رابط تتبع لمراقبة حالة التسليم.' },
    { id: '6', category: 'الإرجاع', question: 'ما هي سياسة الإرجاع الخاصة بكم؟', answer: 'نقدم نافذة إرجاع لمدة 14 يومًا للعناصر غير المستخدمة في عبوتها الأصلية. يرجى زيارة صفحة سياسة الاسترجاع الخاصة بنا للحصول على إرشادات مفصلة.' },
    { id: '7', category: 'المدفوعات', question: 'هل معلومات الدفع الخاصة بي آمنة؟', answer: 'نعم، نحن نستخدم تشفير طبقة المقابس الآمنة (SSL) القياسي في الصناعة لحماية تفاصيلك الشخصية ومعلومات الدفع أثناء النقل.' },
    { id: '8', category: 'الشحن', question: 'هل تقدمون شحنًا دوليًا؟', answer: 'في الوقت الحالي، نشحن فقط داخل البلاد. نحن نعمل على توسيع خيارات التوصيل الخاصة بنا قريبًا!' },
    { id: '9', category: 'الحساب', question: 'هل أحتاج إلى حساب لتقديم طلب؟', answer: 'لا، يمكنك إتمام الشراء كضيف. ومع ذلك، يساعدك إنشاء حساب في تتبع طلباتك وإدارة تفاصيلك بسهولة.' },
    { id: '10', category: 'الحساب', question: 'كيف يمكنني تغيير كلمة المرور الخاصة بي؟', answer: 'انتقل إلى صفحة تسجيل الدخول وانقر على "نسيت كلمة المرور". اتبع الرابط المرسل إلى بريدك الإلكتروني لإعادة تعيينه بأمان.' },
    { id: '11', category: 'الإرجاع', question: 'كم يستغرق استرداد الأموال؟', answer: 'تتم معالجة المبالغ المستردة في غضون 5 إلى 7 أيام عمل بعد استلامنا للعنصر المرتجع وفحصه.' },
    { id: '12', category: 'الطلبات', question: 'ماذا لو نفد المخزون من عنصر ما؟', answer: 'يمكنك التسجيل لتتلقى إشعارًا عندما يعود العنصر إلى المخزون، أو التحقق من توصياتنا البديلة للمنتجات.' },
];

const CATEGORIES = ['الكل', 'الطلبات', 'المدفوعات', 'الشحن', 'الإرجاع', 'الحساب'];

const HighlightText = ({ text, highlight }: { text: string; highlight: string }) => {
    if (!highlight.trim()) return <span>{text}</span>;

    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);

    return (
        <span>
            {parts.map((part, i) =>
                regex.test(part) ? <mark key={i} className="faq-highlight">{part}</mark> : <span key={i}>{part}</span>
            )}
        </span>
    );
};

export default function FAQPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('الكل');
    const [openId, setOpenId] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const filteredFaqs = useMemo(() => {
        return FAQ_DATA.filter(faq => {
            const matchesCategory = activeCategory === 'الكل' || faq.category === activeCategory;
            const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [searchQuery, activeCategory]);

    const toggleAccordion = (id: string) => {
        setOpenId(prev => prev === id ? null : id);
    };

    return (
        <div className="faq-page" dir="rtl">
            <div className="faq-background-elements">
                <div className="faq-glow faq-glow-1"></div>
                <div className="faq-glow faq-glow-2"></div>
            </div>

            <div className={`faq-hero ${isLoaded ? 'animate-in' : ''}`}>
                <h1 className="faq-hero-title">كيف يمكننا مساعدتك؟</h1>
                <p className="faq-hero-subtitle">ابحث عن إجابات سريعة للأسئلة الشائعة، أو تواصل معنا مباشرة.</p>

                <div className="faq-search-wrapper">
                    <div className="faq-search">
                        <Search size={22} className="faq-search-icon" />
                        <input
                            type="text"
                            placeholder="ابحث عن سؤالك هنا..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className={`faq-content-container ${isLoaded ? 'animate-in-delay-1' : ''}`}>
                <div className="faq-categories">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            className={`faq-category-btn ${activeCategory === cat ? 'active' : ''}`}
                            onClick={() => {
                                setActiveCategory(cat);
                                setOpenId(null);
                                setSearchQuery('');
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="faq-list">
                    {filteredFaqs.length > 0 ? (
                        filteredFaqs.map((faq, index) => {
                            const isOpen = openId === faq.id;
                            return (
                                <div
                                    key={faq.id}
                                    className={`faq-item ${isOpen ? 'open' : ''}`}
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                >
                                    <button
                                        className="faq-question"
                                        onClick={() => toggleAccordion(faq.id)}
                                        aria-expanded={isOpen}
                                    >
                                        <span className="faq-question-text">
                                            <HighlightText text={faq.question} highlight={searchQuery} />
                                        </span>
                                        <span className="faq-icon-wrapper">
                                            {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                                        </span>
                                    </button>
                                    <div
                                        className={`faq-answer-container ${isOpen ? 'open' : ''}`}
                                        role="region"
                                    >
                                        <div className="faq-answer">
                                            <HighlightText text={faq.answer} highlight={searchQuery} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="faq-no-results">
                            <div className="faq-no-results-icon">
                                <Search size={40} />
                            </div>
                            <h3>لا توجد نتائج</h3>
                            <p>لم نتمكن من العثور على أي أسئلة تطابق بحثك عن "{searchQuery}"</p>
                            <button className="faq-reset-btn" onClick={() => setSearchQuery('')}>مسح البحث</button>
                        </div>
                    )}
                </div>
            </div>

            <div className={`faq-trust-section ${isLoaded ? 'animate-in-delay-2' : ''}`}>
                <div className="faq-trust-content">
                    <div className="faq-trust-icon">
                        <Mail size={32} />
                    </div>
                    <h2>هل لا زال لديك أسئلة؟</h2>
                    <p>فريق الدعم المخصص لدينا متاح دائمًا لمساعدتك في أي استفسارات أخرى.</p>
                    <Link to="/contact" className="faq-contact-btn">
                        <span>تواصل معنا</span>
                        <ArrowLeft size={18} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
