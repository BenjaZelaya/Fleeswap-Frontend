import { useState } from 'react'

function Home() {
  const [products] = useState([
    {
      id: 1,
      name: 'Reloj Antiguo',
      price: 450,
      image: '/assets/hero.png',
      category: 'Accesorios',
    },
    {
      id: 2,
      name: 'Lámpara Vintage',
      price: 320,
      image: '/assets/hero.png',
      category: 'Decoración',
    },
    {
      id: 3,
      name: 'Espejo Francés',
      price: 520,
      image: '/assets/hero.png',
      category: 'Muebles',
    },
  ])

  return (
    <div className="home">
      <header className="header">
        <h1>Fleeswap</h1>
        <p>Vende y compra artículos antiguos</p>
      </header>

      <section className="products-section">
        <h2>Artículos Destacados</h2>
        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <img src={product.image} alt={product.name} />
              <h3>{product.name}</h3>
              <p className="category">{product.category}</p>
              <p className="price">${product.price}</p>
              <button className="btn-primary">Ver Detalles</button>
            </div>
          ))}
        </div>
      </section>

      <footer className="footer">
        <p>&copy; 2024 Fleeswap. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}

export default Home
