window.MOTORCYCLE_CATALOG = (() => {
  const definitions = [
    {
      name: 'Motos deportivas',
      emoji: '🏁',
      description: 'Diseño deportivo y potencia para disfrutar cada curva.',
      background: 'IMG/M01.JPG',
      href: 'catalogo-motos.html?categoria=Motos%20deportivas',
      products: [
        { name: 'Deportiva 1000', image: 'IMG/M01.JPG', price: 145000 },
        { name: 'Deportiva Azul', image: 'IMG/MO2.JPG', price: 112000 },
        { name: 'Deportiva Naranja', image: 'IMG/MO5.JPG', price: 98000 },
        { name: 'Racing Personalizada', image: 'IMG/mo9.jpg', price: 139000 }
      ]
    },
    {
      name: 'Motos urbanas',
      emoji: '🏙️',
      description: 'Prácticas y versátiles para moverte todos los días.',
      background: 'IMG/MO3.JPG',
      href: 'catalogo-motos.html?categoria=Motos%20urbanas',
      products: [
        { name: 'Naked Urbana', image: 'IMG/MO3.JPG', price: 78000 },
        { name: 'Mini Urbana', image: 'IMG/mo8.jpg', price: 55000 },
        { name: 'Naked Negra', image: 'IMG/mo10.jpg', price: 89000 }
      ]
    },
    {
      name: 'Motos cruiser',
      emoji: '🛣️',
      description: 'Estilo clásico y comodidad para recorrer nuevos caminos.',
      background: 'IMG/MO4.JPG',
      href: 'catalogo-motos.html?categoria=Motos%20cruiser',
      products: [
        { name: 'Cruiser Clásica', image: 'IMG/MO4.JPG', price: 105000 },
        { name: 'Custom Roja', image: 'IMG/mo6.jpg', price: 84000 },
        { name: 'Chopper Touring', image: 'IMG/mo7.jpg', price: 79000 }
      ]
    }
  ];
  const byName = new Map(definitions.map(definition => [definition.name, definition]));

  function configureCategory(category) {
    const definition = byName.get(category.name);
    if (!definition) {
      throw new Error(`No existe la configuración para "${category.name}".`);
    }
    return {
      ...definition,
      ...category,
      image: definition.background,
      productCount: definition.products.length
    };
  }

  function createProducts(categories) {
    return categories.flatMap((category, categoryIndex) => {
      const definition = configureCategory(category);
      return definition.products.map((product, productIndex) => ({
        id: `${categoryIndex}-${productIndex}`,
        category: definition.name,
        name: product.name,
        description: `${product.name}: ${definition.description}`,
        price: product.price,
        image: product.image,
        detailImages: [product.image]
      }));
    });
  }

  return { categories: definitions, configureCategory, createProducts };
})();
