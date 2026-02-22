import React from 'react'
import AddToCartButton from './AddToCartButton'
import { products } from '../data/products'
import './ProductSection.css'

const ProductSection: React.FC = () => {
  return (
    <section className="product-section">
      <div className="product-container">
        <h2 className="section-title">منتجاتنا المميزة</h2>
        <div className="product-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image-placeholder">
                <img src={product.image} alt={product.name} />
              </div>
              <h3 className="product-name">{product.name}</h3>
              <p className="product-category">{product.category}</p>
              <div className="product-price">
                <span className="amount">{product.price.toFixed(2)}</span>
                <span className="currency">ر.س</span>
              </div>
              <AddToCartButton product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProductSection
