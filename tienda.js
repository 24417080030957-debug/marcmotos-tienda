const STORE = {
  description:
    'Encuentra motos deportivas, urbanas y cruiser para moverte a diario y descubrir nuevos caminos.',
  address: 'Av. Paseo de los Motores 125, Col. Centro, Guadalajara, Jalisco, México',
  mapLabel: 'Av. Paseo de los Motores · Guadalajara',
  phone: '+52 33 5555 0142',
  hours: 'Lunes a sábado, 9:00 a 18:00',
  contacts: [
    {
      name: 'Mariana Torres',
      role: 'Asesora de ventas',
      phone: '+52 33 5555 0101',
      email: 'mariana@rutamotor.example',
      address: 'Av. Paseo de los Motores 125, Guadalajara'
    },
    {
      name: 'Diego Ramírez',
      role: 'Soporte y seguimiento',
      phone: '+52 33 5555 0102',
      email: 'diego@rutamotor.example',
      address: 'Av. Paseo de los Motores 125, Guadalajara'
    }
  ]
};
let CATEGORIES = window.MOTORCYCLE_CATALOG.categories.map(category => ({ ...category }));
let PRODUCTS = window.MOTORCYCLE_CATALOG.createProducts(CATEGORIES);
const CART_KEY = 'ruta-motor-cart-v3';
const CHECKOUT_KEY = 'ruta-motor-checkout-v3';
const cartLineKey = item => item.id;
const money = value =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0
  }).format(value);
function getCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    return Array.isArray(saved)
      ? saved
          .filter(
            item =>
              item &&
              PRODUCTS.some(product => product.id === item.id) &&
              Number.isInteger(item.quantity) &&
              item.quantity > 0
          )
          .map(item => ({ id: item.id, quantity: item.quantity }))
      : [];
  } catch (error) {
    console.error('No se pudo leer el carrito guardado.', error);
    return [];
  }
}
function setCart(cart) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch {
    /* El carrito permanece disponible durante esta visita. */
  }
  updateCartCounts();
}
function updateCartCounts() {
  const count = getCart().reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('[data-cart-count]').forEach(node => {
    node.textContent = count;
  });
}
function toast(message) {
  let node = document.querySelector('.toast');
  if (!node) {
    node = document.createElement('div');
    node.className = 'toast';
    node.setAttribute('role', 'status');
    document.body.append(node);
  }
  node.textContent = message;
  setTimeout(() => node.remove(), 2600);
}
function initCommon() {
  document.querySelectorAll('[data-year]').forEach(node => {
    node.textContent = new Date().getFullYear();
  });
  updateCartCounts();
}
function initInfo() {
  document.querySelector('#store-description').textContent = STORE.description;
  document.querySelector('#store-hours').textContent = STORE.hours;
  document.querySelector('#store-address').textContent = STORE.address;
  document.querySelector('#store-phone').textContent = STORE.phone;
  document.querySelector('#map-label').textContent = STORE.mapLabel;
}
function initCategories() {
  const list = document.querySelector('#category-list');
  const cover = document.querySelector('#category-cover');
  const title = document.querySelector('#category-feature-title');
  const copy = document.querySelector('#category-feature-copy');
  const open = document.querySelector('#category-open');
  const buttons = [...list.querySelectorAll('[data-category]')];
  CATEGORIES = buttons.map(button => window.MOTORCYCLE_CATALOG.configureCategory({
    name: button.dataset.category,
    emoji: button.querySelector('span').textContent.trim().split(' ')[0],
    description: button.dataset.description,
    image: button.dataset.image,
    href: button.dataset.href
  }));
  PRODUCTS = window.MOTORCYCLE_CATALOG.createProducts(CATEGORIES);
  buttons.forEach((button, index) => {
    button.querySelector('small').textContent = `${CATEGORIES[index].productCount} motos`;
  });
  try {
    localStorage.setItem('ruta-motor-categories-v1', JSON.stringify(CATEGORIES));
  } catch (error) {
    console.error('No se pudieron guardar las categorías.', error);
  }
  function choose(index) {
    const category = CATEGORIES[index];
    buttons.forEach((button, i) => {
      button.classList.toggle('selected', i === index);
    });
    cover.src = category.image;
    cover.classList.toggle('show-full-image', category.backgroundFit === 'contain');
    title.textContent = category.name;
    copy.textContent = category.description;
    open.href = category.href;
  }
  list.addEventListener('click', event => {
    const button = event.target.closest('[data-category]');
    if (button) {
      choose(buttons.indexOf(button));
    }
  });
  choose(0);
}
function initListing() {
  const requestedCategory = new URLSearchParams(location.search).get('categoria');
  const showAllProducts = document.body.dataset.allProducts === 'true' && !requestedCategory;
  const categoryName = requestedCategory ||
    (showAllProducts ? 'Todas las motos' : document.body.dataset.category || PRODUCTS[0].category);
  const category = {
    name: PRODUCTS.find(product => product.category === categoryName)?.category || categoryName
  };
  const heading = document.querySelector('#listing-title');
  const count = document.querySelector('#listing-count');
  const grid = document.querySelector('#product-grid');
  const search = document.querySelector('#product-search');
  heading.textContent = categoryName;
  document.querySelector('.page-heading p').textContent =
    'Selecciona una moto para consultar sus características y fotografías.';
  function render(term = '') {
    const filtered = PRODUCTS.filter(
      product =>
        (showAllProducts || product.category === category.name) &&
        `${product.name} ${product.category}`.toLocaleLowerCase('es').includes(term.toLocaleLowerCase('es'))
    );
    count.textContent = `${filtered.length} motos`;
    grid.innerHTML = filtered.length
      ? filtered
          .map(
            product =>
              `<article class="product-card">` +
              `<a href="detalle-moto.html?id=${encodeURIComponent(product.id)}">` +
              `<img class="product-image" src="${product.image}" alt="${product.name}" loading="lazy">` +
              `<div class="product-copy">` +
              `<small>${product.category}</small>` +
              `<h3>${product.name}</h3>` +
              `<div class="product-foot">` +
              `<span class="price">${money(product.price)}</span>` +
              `<span class="button button-dark">Ver moto →</span>` +
              `</div></div></a></article>`
          )
          .join('')
      : '<p>No encontramos motos con esa búsqueda.</p>';
  }
  search.addEventListener('input', () => {
    render(search.value.trim());
  });
  render();
}
function initProduct() {
  const id = new URLSearchParams(location.search).get('id');
  const product = PRODUCTS.find(item => item.id === id) || PRODUCTS[0];
  document.querySelector('#detail-category').textContent = product.category;
  document.querySelector('#detail-name').textContent = product.name;
  document.querySelector('#detail-price').textContent = money(product.price);
  document.querySelector('#detail-description').textContent = product.description;
  const mainImage = document.querySelector('#detail-main-image');
  const thumbs = document.querySelector('#gallery-thumbs');
  mainImage.alt = product.name;
  mainImage.src = product.detailImages[0];
  thumbs.innerHTML = product.detailImages
    .map(
      (src, index) =>
        `<button class="gallery-thumb${
          index === 0 ? ' active' : ''
        }" type="button" aria-label="Ver imagen ${index + 1}">` +
        `<img src="${src}" alt="${product.name}, fotografía ${index + 1}" loading="lazy"></button>`
    )
    .join('');
  thumbs.addEventListener('click', event => {
    const button = event.target.closest('.gallery-thumb');
    if (!button) return;
    const index = [...thumbs.children].indexOf(button);
    mainImage.src = product.detailImages[index];
    thumbs.querySelectorAll('.gallery-thumb').forEach((thumb, i) => {
      thumb.classList.toggle('active', i === index);
    });
  });
  let quantity = 1;
  const output = document.querySelector('#quantity-value');
  document.querySelectorAll('[data-quantity]').forEach(button =>
    button.addEventListener('click', () => {
      quantity = Math.max(
        1,
        Math.min(20, quantity + Number(button.dataset.quantity))
      );
      output.textContent = quantity;
    })
  );
  document.querySelector('#add-to-cart').addEventListener('click', () => {
    const cart = getCart();
    const item = cart.find(entry => entry.id === product.id);
    if (item) item.quantity += quantity;
    else cart.push({ id: product.id, quantity });
    setCart(cart);
    toast(`${quantity === 1 ? 'Moto agregada' : 'Motos agregadas'} a Compras`);
  });
}
function initCart() {
  const host = document.querySelector('#cart-content');
  let selected = new Set();
  function render() {
    const cart = getCart();
    if (!cart.length) {
      host.innerHTML =
        '<div class="cart-empty">' +
        '<div class="emoji">🛒</div>' +
        '<h2>Tu carrito está esperando</h2>' +
        '<p>Explora las categorías y agrega las motos que te interesan.</p>' +
        '<a class="button button-primary" href="categorias-motos.html">Explorar motos</a>' +
        '</div>';
      updateCartCounts();
      return;
    }
    selected = new Set(
      [...selected].filter(key => cart.some(item => cartLineKey(item) === key))
    );
    const total = cart
      .filter(item => selected.has(cartLineKey(item)))
      .reduce(
        (sum, item) =>
          sum +
          PRODUCTS.find(product => product.id === item.id).price * item.quantity,
        0
      );
    const cartItems = cart
      .map(item => {
        const product = PRODUCTS.find(entry => entry.id === item.id);
        const lineKey = cartLineKey(item);
        const quantityLabel = item.quantity === 1 ? 'unidad' : 'unidades';
        const checked = selected.has(lineKey) ? 'checked' : '';

        return (
          `<article class="cart-item">` +
          `<input class="select-circle" type="checkbox" aria-label="Seleccionar ${product.name}" ` +
          `data-select="${lineKey}" ${checked}>` +
          `<img src="${product.image}" alt="${product.name}" loading="lazy">` +
          `<div><h3>${product.name}</h3>` +
          `<p>${product.category} · ${item.quantity} ${quantityLabel}</p></div>` +
          `<span class="cart-item-price">${money(product.price * item.quantity)}</span>` +
          `<button class="remove-button" type="button" data-remove="${lineKey}">Eliminar</button>` +
          `</article>`
        );
      })
      .join('');
    host.innerHTML =
      `<div class="cart-table">${cartItems}</div>` +
      `<div class="cart-summary"><div>` +
      `<small>${selected.size} compra(s) seleccionada(s)</small>` +
      `<strong>Total: ${money(total)}</strong></div>` +
      `<span>${cart.length} moto(s) en tu carrito</span></div>` +
      `<div class="cart-actions">` +
      `<a class="button button-light" href="categorias-motos.html">＋ Seguir explorando</a>` +
      `<button class="button button-danger" type="button" id="cancel-purchase">Cancelar compra</button>` +
      `<button class="button button-primary" type="button" id="checkout-button">` +
      `Desea realizar la compra →</button>` +
      `</div>`;
    host.querySelectorAll('[data-select]').forEach(input =>
      input.addEventListener('change', () => {
        input.checked
          ? selected.add(input.dataset.select)
          : selected.delete(input.dataset.select);
        render();
      })
    );
    host.querySelectorAll('[data-remove]').forEach(button =>
      button.addEventListener('click', () => {
        setCart(getCart().filter(item => cartLineKey(item) !== button.dataset.remove));
        selected.delete(button.dataset.remove);
        render();
      })
    );
    host.querySelector('#cancel-purchase').addEventListener('click', () => {
      selected.clear();
      render();
      toast('Proceso cancelado; tus motos siguen en Compras');
    });
    host.querySelector('#checkout-button').addEventListener('click', () => {
      const ids = cart
        .filter(item => selected.has(cartLineKey(item)))
        .map(cartLineKey);
      if (!ids.length) {
        toast('Selecciona al menos una compra para continuar');
        return;
      }
      sessionStorage.setItem(CHECKOUT_KEY, JSON.stringify(ids));
      location.href = 'datos-entrega.html';
    });
    updateCartCounts();
  }
  render();
}
function initDelivery() {
  const form = document.querySelector('#delivery-form');
  const button = document.querySelector('#save-delivery');
  form.addEventListener('input', () => {
    button.disabled = !form.checkValidity();
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    sessionStorage.setItem('ruta-motor-customer', form.elements.fullName.value);
    location.href = 'pago-demo.html';
  });
}
function initPayment() {
  const form = document.querySelector('#payment-form');
  const ids = JSON.parse(sessionStorage.getItem(CHECKOUT_KEY) || '[]');
  const cart = getCart().filter(item => ids.includes(cartLineKey(item)));
  const total = cart.reduce(
    (sum, item) =>
      sum + PRODUCTS.find(product => product.id === item.id).price * item.quantity,
    0
  );
  document.querySelector('#payment-total').textContent =
    `Total de la compra seleccionada: ${money(total)} MXN.`;
  const customer = sessionStorage.getItem('ruta-motor-customer') || '';
  const holder = document.querySelector('#card-holder');
  holder.value = customer;
  document.querySelector('#card-number').addEventListener('input', event => {
    const digits = event.target.value.replace(/\D/g, '').slice(0, 16);
    event.target.value = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  });
  document.querySelector('#card-expiry').addEventListener('input', event => {
    const digits = event.target.value.replace(/\D/g, '').slice(0, 4);
    event.target.value =
      digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    document.querySelector('#payment-submit').hidden = true;
    document.querySelector('#payment-confirm-controls').hidden = false;
  });
  document.querySelector('#payment-cancel').addEventListener('click', () => {
    location.href = 'carrito.html';
  });
  document.querySelector('#accept-payment').addEventListener('click', () => {
    setCart(getCart().filter(item => !ids.includes(cartLineKey(item))));
    sessionStorage.removeItem(CHECKOUT_KEY);
    sessionStorage.removeItem('ruta-motor-customer');
    location.href = 'confirmacion-compra.html';
  });
}
function initSupport() {
  const supportGrid = document.querySelector('#support-grid');
  supportGrid.innerHTML = STORE.contacts
    .map(
      (person, index) =>
        `<article class="support-card">` +
        `<h2>${person.name}</h2>` +
        `<p><strong>${person.role}</strong></p>` +
        `<p>📞 ${person.phone}</p>` +
        `<p>✉️ ${person.email}</p>` +
        `<p>📍 ${person.address}</p>` +
        `</article>`
    )
    .join('');
}
initCommon();
const pageInitializers = {
  info: initInfo,
  categories: initCategories,
  listing: initListing,
  product: initProduct,
  cart: initCart,
  delivery: initDelivery,
  payment: initPayment,
  support: initSupport
};
pageInitializers[document.body.dataset.page]?.();
