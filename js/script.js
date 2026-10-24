// MyBasket demo storefront — product data and UI behaviour.
const products = [
  { id: 1, name: "Sweet Red Apples", category: "Fruits", unit: "4 pcs · approx. 500 g", price: 129, oldPrice: 159, emoji: "🍎", tag: "Bestseller", popular: 1 },
  { id: 2, name: "Fresh Bananas", category: "Fruits", unit: "6 pcs · approx. 700 g", price: 49, oldPrice: 60, emoji: "🍌", tag: "Fresh pick", popular: 2 },
  { id: 3, name: "Farm Carrots", category: "Vegetables", unit: "500 g", price: 35, oldPrice: 45, emoji: "🥕", tag: "Save 22%", popular: 3 },
  { id: 4, name: "Broccoli", category: "Vegetables", unit: "1 head · approx. 300 g", price: 69, oldPrice: 85, emoji: "🥦", tag: "Farm fresh", popular: 4 },
  { id: 5, name: "Whole Milk", category: "Dairy", unit: "1 litre", price: 62, oldPrice: 68, emoji: "🥛", tag: "Daily essential", popular: 5 },
  { id: 6, name: "Free-range Eggs", category: "Dairy", unit: "6 eggs", price: 78, oldPrice: 90, emoji: "🥚", tag: "Protein pick", popular: 6 },
  { id: 7, name: "Sourdough Bread", category: "Bakery", unit: "400 g loaf", price: 95, oldPrice: 115, emoji: "🍞", tag: "Baked today", popular: 7 },
  { id: 8, name: "Creamy Peanut Butter", category: "Pantry", unit: "340 g jar", price: 149, oldPrice: 179, emoji: "🥜", tag: "Customer love", popular: 8 },
  { id: 9, name: "Juicy Strawberries", category: "Fruits", unit: "250 g box", price: 99, oldPrice: 129, emoji: "🍓", tag: "Seasonal", popular: 9 },
  { id: 10, name: "Baby Spinach", category: "Vegetables", unit: "200 g pack", price: 45, oldPrice: 55, emoji: "🥬", tag: "Fresh pick", popular: 10 },
  { id: 11, name: "Greek Yogurt", category: "Dairy", unit: "400 g tub", price: 115, oldPrice: 135, emoji: "🥣", tag: "High protein", popular: 11 },
  { id: 12, name: "Basmati Rice", category: "Pantry", unit: "1 kg pack", price: 119, oldPrice: 145, emoji: "🍚", tag: "Pantry staple", popular: 12 }
];

const cart = new Map();
let activeCategory = "All";
let searchTerm = "";
let toastTimeout;

const $ = (selector) => document.querySelector(selector);
const money = (amount) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.remove("translate-y-5", "opacity-0");
  toast.classList.add("translate-y-0", "opacity-100");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.add("translate-y-5", "opacity-0");
    toast.classList.remove("translate-y-0", "opacity-100");
  }, 2300);
}

function getVisibleProducts() {
  let list = products.filter((product) => {
    const categoryMatch = activeCategory === "All" || product.category === activeCategory;
    const queryMatch = `${product.name} ${product.category} ${product.unit}`.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && queryMatch;
  });
  const sort = $("#sortSelect").value;
  if (sort === "priceLow") list.sort((a, b) => a.price - b.price);
  if (sort === "priceHigh") list.sort((a, b) => b.price - a.price);
  if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "popular") list.sort((a, b) => a.popular - b.popular);
  return list;
}

function renderProducts() {
  const list = getVisibleProducts();
  $("#productGrid").innerHTML = list.map((product) => {
    const qty = cart.get(product.id) || 0;
    return `
      <article class="product-card">
        <div class="product-art">
          <span class="tag">${product.tag}</span><span aria-hidden="true">${product.emoji}</span>
          <button class="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-gray-400 hover:text-rose-500" data-wishlist="${product.id}" aria-label="Add ${product.name} to wishlist">♡</button>
        </div>
        <div class="product-content">
          <p class="product-title">${product.name}</p>
          <p class="product-unit">${product.unit}</p>
          <div class="mt-3 flex items-center gap-2"><span class="text-base font-black">${money(product.price)}</span><span class="text-xs text-gray-400 line-through">${money(product.oldPrice)}</span></div>
          <div class="mt-3">${qty ? quantityControl(product.id, qty) : `<button class="add-button w-full" data-add="${product.id}"><span>＋</span> Add to basket</button>`}</div>
        </div>
      </article>`;
  }).join("");
  $("#emptyState").classList.toggle("hidden", list.length > 0);
  $("#productGrid").classList.toggle("hidden", list.length === 0);
  $("#productHeading").textContent = searchTerm ? `Search results for “${searchTerm}”` : activeCategory === "All" ? "Popular this week" : activeCategory;
}

function quantityControl(id, qty) {
  return `<div class="qty-control"><button data-change="${id}" data-delta="-1" aria-label="Remove one">−</button><span>${qty} in basket</span><button data-change="${id}" data-delta="1" aria-label="Add one">＋</button></div>`;
}

function setQuantity(id, nextQty) {
  if (nextQty <= 0) cart.delete(id);
  else cart.set(id, nextQty);
  renderProducts();
  renderCart();
}

function cartCount() {
  return [...cart.values()].reduce((total, qty) => total + qty, 0);
}

function renderCart() {
  const count = cartCount();
  const entries = [...cart.entries()].map(([id, qty]) => ({ product: products.find((p) => p.id === id), qty }));
  const subtotal = entries.reduce((total, entry) => total + entry.product.price * entry.qty, 0);
  const delivery = count === 0 || subtotal >= 499 ? 0 : 40;
  $("#cartCount").textContent = count;
  $("#cartSubtitle").textContent = `${count} item${count === 1 ? "" : "s"}`;
  $("#cartSubtotal").textContent = money(subtotal);
  $("#deliveryFee").textContent = delivery === 0 ? "FREE" : money(delivery);
  $("#cartTotal").textContent = money(subtotal + delivery);
  $("#checkoutBtn").disabled = count === 0;
  $("#cartItems").innerHTML = entries.length ? entries.map(({ product, qty }) => `
    <div class="cart-row">
      <div class="cart-row-art">${product.emoji}</div>
      <div class="min-w-0 flex-1"><p class="truncate text-sm font-extrabold">${product.name}</p><p class="mt-1 text-xs text-gray-500">${money(product.price)} each</p>
        <div class="mt-2 inline-flex items-center gap-3 rounded-lg bg-gray-50 px-2 py-1"><button data-change="${product.id}" data-delta="-1" aria-label="Remove one">−</button><span class="text-xs font-bold">${qty}</span><button data-change="${product.id}" data-delta="1" aria-label="Add one">＋</button></div>
      </div><strong class="text-sm">${money(product.price * qty)}</strong>
    </div>`).join("") : `<div class="flex h-full flex-col items-center justify-center text-center"><div class="text-6xl">🧺</div><h3 class="mt-4 font-black">Your basket is empty</h3><p class="mt-2 text-sm text-gray-500">Add a few fresh favourites to get started.</p><button id="startShoppingBtn" class="mt-5 rounded-xl bg-basket-500 px-5 py-3 font-bold text-white">Start shopping</button></div>`;
  const freeMessage = count > 0 && subtotal < 499 ? `<p class="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">Add ${money(499 - subtotal)} more for free delivery.</p>` : "";
  $("#cartItems").insertAdjacentHTML("beforeend", freeMessage);
}

function openCart() {
  $("#drawerBackdrop").classList.remove("hidden");
  $("#cartDrawer").classList.remove("translate-x-full");
  $("#cartDrawer").setAttribute("aria-hidden", "false");
  document.body.classList.add("drawer-open");
}
function closeCart() {
  $("#drawerBackdrop").classList.add("hidden");
  $("#cartDrawer").classList.add("translate-x-full");
  $("#cartDrawer").setAttribute("aria-hidden", "true");
  document.body.classList.remove("drawer-open");
}

function openModal(title, message, extraHtml = "") {
  $("#modalTitle").textContent = title;
  $("#modalText").textContent = message;
  $("#modalExtra").innerHTML = extraHtml;
  $("#modalBackdrop").classList.remove("hidden");
  $("#modalBackdrop").classList.add("flex");
}
function closeModal() {
  $("#modalBackdrop").classList.add("hidden");
  $("#modalBackdrop").classList.remove("flex");
}

function runSearch(value) {
  searchTerm = value.trim();
  $("#searchInput").value = value;
  $("#mobileSearchInput").value = value;
  renderProducts();
  if (searchTerm) $("#products").scrollIntoView({ behavior: "smooth" });
}

// Product actions use event delegation so re-rendered cards keep working.
$("#productGrid").addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add]");
  const changeButton = event.target.closest("[data-change]");
  const wishButton = event.target.closest("[data-wishlist]");
  if (addButton) {
    const id = Number(addButton.dataset.add);
    setQuantity(id, (cart.get(id) || 0) + 1);
    showToast(`${products.find((p) => p.id === id).name} added to basket`);
  }
  if (changeButton) {
    const id = Number(changeButton.dataset.change);
    setQuantity(id, (cart.get(id) || 0) + Number(changeButton.dataset.delta));
  }
  if (wishButton) {
    const id = Number(wishButton.dataset.wishlist);
    const product = products.find((p) => p.id === id);
    wishButton.classList.toggle("text-rose-500");
    wishButton.textContent = wishButton.classList.contains("text-rose-500") ? "♥" : "♡";
    showToast(`${product.name} ${wishButton.textContent === "♥" ? "saved to" : "removed from"} wishlist`);
  }
});

$("#cartItems").addEventListener("click", (event) => {
  const changeButton = event.target.closest("[data-change]");
  if (changeButton) {
    const id = Number(changeButton.dataset.change);
    setQuantity(id, (cart.get(id) || 0) + Number(changeButton.dataset.delta));
  }
  if (event.target.closest("#startShoppingBtn")) {
    closeCart();
    $("#products").scrollIntoView({ behavior: "smooth" });
  }
});

document.querySelectorAll(".category").forEach((button) => {
  button.addEventListener("click", () => {
    activeCategory = button.dataset.category;
    document.querySelectorAll(".category").forEach((item) => item.classList.toggle("active", item === button));
    renderProducts();
    $("#products").scrollIntoView({ behavior: "smooth" });
  });
});

$("#searchForm").addEventListener("submit", (event) => { event.preventDefault(); runSearch($("#searchInput").value); });
$("#mobileSearchForm").addEventListener("submit", (event) => { event.preventDefault(); runSearch($("#mobileSearchInput").value); });
$("#searchInput").addEventListener("input", (event) => { searchTerm = event.target.value.trim(); $("#mobileSearchInput").value = event.target.value; renderProducts(); });
$("#mobileSearchInput").addEventListener("input", (event) => { searchTerm = event.target.value.trim(); $("#searchInput").value = event.target.value; renderProducts(); });
$("#sortSelect").addEventListener("change", renderProducts);
$("#resetSearchBtn").addEventListener("click", () => {
  searchTerm = ""; activeCategory = "All"; $("#searchInput").value = ""; $("#mobileSearchInput").value = "";
  document.querySelectorAll(".category").forEach((item) => item.classList.toggle("active", item.dataset.category === "All"));
  renderProducts();
});

$("#cartBtn").addEventListener("click", openCart);
$("#closeCartBtn").addEventListener("click", closeCart);
$("#drawerBackdrop").addEventListener("click", closeCart);
$("#checkoutBtn").addEventListener("click", () => {
  const count = cartCount();
  if (!count) return;
  closeCart();
  openModal("Ready for checkout?", `Your basket has ${count} item${count === 1 ? "" : "s"} with a total of ${$("#cartTotal").textContent}. This is a front-end demo, so no order or payment will be processed.`, `<div class="rounded-xl bg-basket-50 p-4 text-sm text-basket-700">Next step for a real app: connect an address form, backend order API and payment gateway.</div>`);
});
$("#dealsBtn").addEventListener("click", () => { $("#offerBanner").scrollIntoView({ behavior: "smooth", block: "center" }); showToast("Your welcome offer is waiting below"); });
$("#copyCodeBtn").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText("WELCOME10");
    showToast("Offer code WELCOME10 copied!");
  } catch {
    openModal("Your offer code", "Use this code at checkout: WELCOME10", `<button id="copyFallbackBtn" class="rounded-lg border px-4 py-2 font-bold">Select code: WELCOME10</button>`);
  }
});
$("#modalExtra").addEventListener("click", (event) => {
  if (event.target.closest("#copyFallbackBtn")) showToast("Use code WELCOME10 at checkout");
});
$("#closeModalBtn").addEventListener("click", closeModal);
$("#modalOkBtn").addEventListener("click", closeModal);
$("#modalBackdrop").addEventListener("click", (event) => { if (event.target === $("#modalBackdrop")) closeModal(); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape") { closeCart(); closeModal(); } });

$("#locationBtn").addEventListener("click", () => {
  openModal("Set delivery location", "Choose where you would like your groceries delivered.", `<label for="locationInput" class="mb-2 block text-sm font-bold">City or PIN code</label><input id="locationInput" class="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-basket-500" placeholder="e.g. 751001 or Bhubaneswar" />`);
  $("#modalOkBtn").textContent = "Save location";
  $("#modalOkBtn").onclick = () => {
    const input = $("#locationInput");
    if (input && input.value.trim()) {
      $("#locationLabel").textContent = input.value.trim();
      closeModal(); showToast("Delivery location updated");
    } else {
      closeModal();
      openModal("Add a location", "Enter a city or PIN code so we can show the right delivery options.");
    }
    $("#modalOkBtn").textContent = "Got it";
    $("#modalOkBtn").onclick = closeModal;
  };
});
$("#accountBtn").addEventListener("click", () => openModal("Welcome to MyBasket", "Account sign-in is not connected yet. In a production app, this is where login, registration and order history would appear."));
$("#helpBtn").addEventListener("click", () => openModal("How can we help?", "This demo storefront has working product search, category filters, sorting, wishlist toggles and a shopping basket. Checkout and account features need a backend."));
$("#allCategoriesBtn").addEventListener("click", () => { activeCategory = "All"; document.querySelectorAll(".category").forEach((item) => item.classList.toggle("active", item.dataset.category === "All")); renderProducts(); showToast("Showing all categories"); });

$("#newsletterForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const email = $("#emailInput").value.trim();
  $("#newsletterMessage").textContent = `Thanks! ${email} has been added to this demo signup.`;
  $("#emailInput").value = "";
});
$("#currentYear").textContent = new Date().getFullYear();

renderProducts();
renderCart();
