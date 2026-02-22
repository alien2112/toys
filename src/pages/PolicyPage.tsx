import { useState, useEffect, useRef } from 'react';
import { Shield, FileText, Truck, RefreshCcw, Package, Clock } from 'lucide-react';
import './PolicyPage.css';

interface Section {
    id: string;
    title: string;
    icon: React.ReactNode;
}

const SECTIONS: Section[] = [
    { id: 'privacy', title: 'سياسة الخصوصية', icon: <Shield size={20} /> },
    { id: 'terms', title: 'الشروط والأحكام', icon: <FileText size={20} /> },
    { id: 'shipping', title: 'سياسة الشحن', icon: <Truck size={20} /> },
    { id: 'returns', title: 'سياسة الاسترجاع', icon: <RefreshCcw size={20} /> },
];

export default function PolicyPage() {
    const [activeSection, setActiveSection] = useState<string>(SECTIONS[0].id);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);
    const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

    useEffect(() => {
        setIsLoaded(true);

        const handleScroll = () => {
            // Calculate scroll progress
            const totalScroll = document.documentElement.scrollTop;
            const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scroll = `${totalScroll / windowHeight}`;
            setScrollProgress(Number(scroll) * 100);

            // Update active section spy
            const scrollPosition = window.scrollY + 180; // Offset for header + padding

            let currentSection = SECTIONS[0].id;
            for (const section of SECTIONS) {
                const element = sectionRefs.current[section.id];
                if (element && element.offsetTop <= scrollPosition) {
                    currentSection = section.id;
                }
            }
            setActiveSection(currentSection);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        setActiveSection(id);
        const element = sectionRefs.current[id];
        if (element) {
            window.scrollTo({
                top: element.offsetTop - 120, // Offset to not overlap with fixed headers
                behavior: 'smooth',
            });
        }
    };

    return (
        <div className="policy-page" dir="rtl">
            {/* Scroll Progress Bar */}
            <div
                className="policy-scroll-progress"
                style={{ width: `${scrollProgress}%` }}
            ></div>

            <div className="policy-background"></div>

            <div className={`policy-hero ${isLoaded ? 'animate-in' : ''}`}>
                <div className="policy-badge">المركز القانوني</div>
                <h1>سياساتنا وشروطنا</h1>
                <p>التزامنا بالشفافية والوضوح. تعرف على كيفية حماية بياناتك وشروط استخدام خدماتنا.</p>
            </div>

            <div className="policy-layout">
                <aside className={`policy-sidebar ${isLoaded ? 'animate-in-delay-1' : ''}`}>
                    <nav className="policy-nav" aria-label="تنقل السياسات">
                        {SECTIONS.map(section => (
                            <button
                                key={section.id}
                                className={activeSection === section.id ? 'active' : ''}
                                onClick={() => scrollToSection(section.id)}
                                aria-current={activeSection === section.id ? 'page' : undefined}
                            >
                                <span className="policy-nav-icon">{section.icon}</span>
                                <span className="policy-nav-text">{section.title}</span>
                                {activeSection === section.id && (
                                    <span className="policy-nav-indicator"></span>
                                )}
                            </button>
                        ))}
                    </nav>
                </aside>

                <main className={`policy-content ${isLoaded ? 'animate-in-delay-2' : ''}`}>
                    <div className="policy-last-updated">
                        آخر تحديث: <span>25 أكتوبر 2023</span>
                    </div>

                    <section
                        id="privacy"
                        className="policy-section card-container"
                        ref={el => sectionRefs.current['privacy'] = el}
                    >
                        <div className="section-header">
                            <div className="section-icon"><Shield size={28} /></div>
                            <h2>سياسة الخصوصية</h2>
                        </div>

                        <p className="policy-lead">خصوصيتك مهمة بالنسبة لنا. توضح سياسة الخصوصية هذه كيف نجمع ونستخدم ونحمي معلوماتك عند زيارة موقعنا على الويب.</p>

                        <div className="policy-grid">
                            <div className="policy-content-block">
                                <h3>جمع البيانات</h3>
                                <p>قد نجمع معلومات شخصية مثل اسمك، عنوان بريدك الإلكتروني، عنوان الشحن، وتفاصيل الدفع عند إجراء عملية شراء أو التسجيل في نشرتنا الإخبارية.</p>
                            </div>

                            <div className="policy-content-block">
                                <h3>أمان الدفع</h3>
                                <p>يتم تشفير جميع معاملات الدفع باستخدام تقنية طبقة المقابس الآمنة (SSL). لا نقوم بتخزين تفاصيل بطاقتك الائتمانية الكاملة على خوادمنا.</p>
                            </div>
                        </div>

                        <div className="policy-content-block full-width">
                            <h3>ملفات تعريف الارتباط وخدمات الطرف الثالث</h3>
                            <p>نستخدم ملفات تعريف الارتباط لتعزيز تجربة التصفح الخاصة بك، تحليل حركة المرور على الموقع، وتخصيص المحتوى. يمكنك تعطيل ملفات تعريف الارتباط في إعدادات متصفحك.</p>
                            <ul className="styled-list">
                                <li>موفرو الدفع المعالجون للمعاملات الآمنة.</li>
                                <li>شركاء الشحن لتوصيل الطلبات بكفاءة.</li>
                                <li>خدمات التحليل الإحصائي مجهولة المصدر.</li>
                            </ul>
                        </div>

                        <div className="policy-content-block full-width highlight-box">
                            <h3>حقوق المستخدم</h3>
                            <p>يحق لك الوصول إلى معلوماتك الشخصية أو تحديثها أو حذفها في أي وقت عن طريق الاتصال بفريق الدعم لدينا أو إدارة إعدادات حسابك.</p>
                        </div>
                    </section>

                    <section
                        id="terms"
                        className="policy-section card-container"
                        ref={el => sectionRefs.current['terms'] = el}
                    >
                        <div className="section-header">
                            <div className="section-icon"><FileText size={28} /></div>
                            <h2>الشروط والأحكام</h2>
                        </div>
                        <p className="policy-lead">باستخدام موقعنا، فإنك توافق على الالتزام بالشروط والأحكام التالية.</p>

                        <div className="policy-content-block full-width">
                            <h3>شروط الاستخدام والمسؤوليات</h3>
                            <ul className="styled-list">
                                <li>يجب أن لا يقل عمرك عن 18 عامًا أو تزور الموقع تحت إشراف ولي أمرك.</li>
                                <li>لا يجوز لك استخدام منتجاتنا لأي غرض غير قانوني أو غير مصرح به.</li>
                                <li>إذا قمت بإنشاء حساب، فأنت مسؤول عن الحفاظ على سرية تفاصيل حسابك.</li>
                                <li>جميع المحتويات (نصوص، رسومات، شعارات) محمية بموجب قوانين حقوق النشر.</li>
                            </ul>
                        </div>

                        <div className="policy-divider"></div>

                        <div className="policy-content-block full-width">
                            <h3>حدود المسؤولية</h3>
                            <p>لن نكون مسؤولين عن أي أضرار مباشرة أو غير مباشرة أو عرضية أو تبعية ناتجة عن استخدام أو عدم القدرة على استخدام موقعنا أو منتجاتنا. يتم تقديم الخدمات كما هي دون أي ضمانات ضمنية.</p>
                        </div>
                    </section>

                    <section
                        id="shipping"
                        className="policy-section card-container"
                        ref={el => sectionRefs.current['shipping'] = el}
                    >
                        <div className="section-header">
                            <div className="section-icon"><Truck size={28} /></div>
                            <h2>سياسة الشحن</h2>
                        </div>
                        <p className="policy-lead">نسعى جاهدين لتسليم منتجاتك في أسرع وقت ممكن وبأعلى كفاءة.</p>

                        <div className="policy-timeline">
                            <div className="timeline-item">
                                <div className="timeline-marker">1</div>
                                <div className="timeline-content">
                                    <h4>المعالجة والتجهيز</h4>
                                    <p>تتم معالجة الطلبات في غضون 1-2 أيام عمل. (لا يتم الشحن في العطلات الرسمية).</p>
                                </div>
                            </div>
                            <div className="timeline-item">
                                <div className="timeline-marker">2</div>
                                <div className="timeline-content">
                                    <h4>خيارات الشحن والتوصيل</h4>
                                    <p><strong>الشحن العادي:</strong> من 3 إلى 5 أيام عمل.<br /><strong>الشحن السريع:</strong> من يوم إلى يومي عمل.</p>
                                </div>
                            </div>
                            <div className="timeline-item">
                                <div className="timeline-marker">3</div>
                                <div className="timeline-content">
                                    <h4>التتبع والاستلام</h4>
                                    <p>بمجرد شحن طلبك، ستتلقى رسالة بريد إلكتروني تحتوي على رابط تتبع لمراقبة مسار الشحنة.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section
                        id="returns"
                        className="policy-section card-container"
                        ref={el => sectionRefs.current['returns'] = el}
                    >
                        <div className="section-header">
                            <div className="section-icon"><RefreshCcw size={28} /></div>
                            <h2>سياسة الاسترجاع والاسترداد</h2>
                        </div>
                        <p className="policy-lead">نريد أن تكون راضيًا تمامًا عن مشترياتك. إذا لم تكن كذلك، فنحن هنا للمساعدة.</p>

                        <div className="policy-grid three-cols">
                            <div className="policy-feature-box">
                                <div className="feature-number">14</div>
                                <h4>يوم للاسترجاع</h4>
                                <p>لديك نافذة زمنية مرنة لإرجاع العنصر من تاريخ استلامه.</p>
                            </div>
                            <div className="policy-feature-box">
                                <div className="feature-icon"><Package size={40} color="#0ea5e9" /></div>
                                <h4>الحالة الأصلية</h4>
                                <p>يجب أن يكون العنصر غير مستخدم وفي تغليفه الأصلي مع إيصال الشراء.</p>
                            </div>
                            <div className="policy-feature-box">
                                <div className="feature-icon"><Clock size={40} color="#0ea5e9" /></div>
                                <h4>استرداد سريع</h4>
                                <p>تسترد أموالك في غضون 5-7 أيام عمل بعد معالجة الفحص.</p>
                            </div>
                        </div>

                        <div className="policy-content-block full-width mt-20">
                            <h3>استثناءات هامة</h3>
                            <p>لأسباب تعود للصحة والسلامة العامة، لا يمكن إرجاع بعض العناصر مثل المنتجات المخصصة، أو السلع القابلة للتلف، أو عناصر العناية الشخصية.</p>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}
