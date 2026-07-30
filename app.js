import { categories, products } from "./data.js";
import { lineTotal, inventoryValue, stockLevel, findProductBySku, countByCategory } from "./helpers.js";

function renderStats() {
    const el = document.querySelector("#stats");
    if (!el) return;
    const total = inventoryValue(products);
    el.textContent = 
        `So san pham = ${products.length}\nTong gia tri kho = ${total}`;
}
renderStats();

function categoryName(id) {
    const c = categories.find((c) => c.id === id);
    return c ? c.name : "?";
}

let currentList = products; 

function render(list){
    const grid = document.querySelector('[data-testid="cm-product-table"]');
    grid.innerHTML = "";

    for (const p of list) {
        const card = document.createElement("article");
        card.className = "cm-card";
        card.dataset.testid = "cm-product-row";
        card.dataset.sku = p.sku;

        const h3 = document.createElement("h3");
        h3.textContent = p.name;

        const cat = document.createElement("p");
        cat.textContent = categoryName(p.category_id);

        const price = document.createElement("p");
        price.className = "cm-card-price";
        price.textContent = String(p.price);

        const stock = document.createElement("p");
        stock.className = "cm-stock";
        stock.textContent = stockLevel(p.qty);

        card.append(h3, cat, price, stock);
        grid.appendChild(card);
    }
    const countEl = document.querySelector('[data-testid="cm-visible-count"]');
    if (countEl) {
        countEl.textContent = `Hien thi: ${list.length} san pham`;
    }
}

render(products);

function renderSubscribers() {
  const ul = document.querySelector('[data-testid="cm-subscriber-list"]');
  if (!ul) return;
  ul.innerHTML = "";
  const subscribers = JSON.parse(localStorage.getItem("cm_subscribers") ?? "[]");
  for (const s of subscribers) {
    const li = document.createElement("li");
    li.textContent = `${s.name} — ${s.email}`;
    ul.appendChild(li);
  }
}
renderSubscribers();

const selectCat = document.querySelector('[data-testid="cm-filter-category"]');
if (selectCat) {
  function applyFilter(v) {
    currentList =
      v === "all"
        ? products
        : products.filter((p) => p.category_id === Number(v));
    render(currentList);
  }

  selectCat.addEventListener("change", () => {
    localStorage.setItem("cm_filter", selectCat.value);
    applyFilter(selectCat.value);
  });

  const saved = localStorage.getItem("cm_filter") ?? "all";
  selectCat.value = saved;
  applyFilter(saved);
}

const sortBtn = document.querySelector("#sort-price");
sortBtn.addEventListener("click", () => {
  const sorted = [...currentList].sort((a, b) => a.price - b.price);
  render(sorted);
});

const grid = document.querySelector('[data-testid="cm-product-table"]');
grid.addEventListener("click", (e) => {
  const card = e.target.closest(".cm-card");
  if (!card) return;
  console.log("Ban vua bam card:", card.dataset.sku);
});

console.log(inventoryValue(products)); // 41380000
console.log(stockLevel(10), stockLevel(3), stockLevel(1)); // Du Sap het Can nhap

categories.forEach((cat) => {
    const subset = products.filter((p) => p.category_id === cat.id);
    console.log(cat.name, subset.length, inventoryValue(subset));
});

const subscribeForm = document.querySelector('[data-testid="cm-subscribe-form"]');
const formMsg = document.querySelector("#form-msg");

if (subscribeForm) {
  subscribeForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = subscribeForm.name.value;
    const email = subscribeForm.email.value;
    const category_id = subscribeForm.category_id.value;

    const errors = [];
    if (name.trim().length < 2) errors.push("Ten toi thieu 2 ky tu");
    if (!/^\S+@\S+\.\S+$/.test(email)) errors.push("Email khong hop le");

    if (errors.length > 0) {
      formMsg.textContent = errors.join(". ");
      formMsg.className = "cm-error";
      return;
    }

    const subscribers = JSON.parse(localStorage.getItem("cm_subscribers") ?? "[]");
    subscribers.push({ name, email, category_id });
    localStorage.setItem("cm_subscribers", JSON.stringify(subscribers));

    formMsg.textContent = "Dang ky thanh cong";
    formMsg.className = "cm-success";
    subscribeForm.reset();
    renderSubscribers(); // se viet o Buoc 10
  });
}

const addForm = document.querySelector('[data-testid="cm-product-form"]');
const productFormMsg = document.querySelector("#product-form-msg");

if (addForm) {
  addForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const sku = addForm.sku.value.trim();
    const name = addForm.name.value.trim();
    const category_id = addForm.category_id.value;
    const price = addForm.price.value;
    const qty = addForm.qty.value;

    if (!sku || !name || !category_id) {
      productFormMsg.textContent = "Thieu thong tin bat buoc";
      return;
    }
    if (Number(price) <= 0) {
      productFormMsg.textContent = "Gia phai lon hon 0";
      return;
    }
    if (findProductBySku(products, sku)) {
      productFormMsg.textContent = "SKU da ton tai";
      return;
    }

    products.push({
      sku,
      name,
      category_id: Number(category_id),
      price: Number(price),
      qty: Number(qty) || 0,
    });

    productFormMsg.textContent = "";
    render(products);       
    renderStats();
    addForm.reset();
  });
}

const loginForm = document.querySelector('[data-testid="cm-login-form"]');
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const { username, password } = loginForm;
    const msgEl = document.querySelector("#login-msg");
    if (username.value === "admin" && password.value === "CampusMart@01") {
      localStorage.setItem("cm_auth", "true");
      msgEl.textContent = "Dang nhap thanh cong";
    } else {
      msgEl.textContent = "Sai tai khoan hoac mat khau";
    }
  });
}
