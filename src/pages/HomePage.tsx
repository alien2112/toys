import React, { useState, useEffect } from 'react'
import Masthead from '../components/Masthead'
import ProductSections from '../components/ProductSections'

const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [topRatedProducts, setTopRatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch featured products
        const featuredResponse = await fetch('http://localhost:8000/api/products/featured?limit=4');
        const featuredData = await featuredResponse.json();

        // Fetch top-rated products
        const topRatedResponse = await fetch('http://localhost:8000/api/products/top-rated?limit=4');
        const topRatedData = await topRatedResponse.json();

        if (featuredData.success) {
          setFeaturedProducts(featuredData.data.map((p: any) => {
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
              category: p.category_name,
              rating: parseFloat(p.avg_rating || 0),
              reviewsCount: parseInt(p.review_count || 0)
            };
          }));
        }

        if (topRatedData.success) {
          setTopRatedProducts(topRatedData.data.map((p: any) => {
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
              category: p.category_name,
              rating: parseFloat(p.avg_rating || 0),
              reviewsCount: parseInt(p.review_count || 0)
            };
          }));
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        background: '#f7f7fc',
        fontFamily: "'Cairo', sans-serif"
      }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '50%',
          border: '4px solid #FFB800',
          borderTopColor: 'transparent',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{ fontSize: '16px', color: '#64647a', fontWeight: '600' }}>جاري تحميل المنتجات...</span>
      </div>
    );
  }

  return (
    <>
      <Masthead />
      <ProductSections
        featuredProducts={featuredProducts}
        topRatedProducts={topRatedProducts}
      />
    </>
  )
}

export default HomePage
