/* =======================================================
   SABOREAR-T · App
   ======================================================= */

const money = (n) => `$${Math.round(n).toLocaleString("es-MX")}`;

let cart = [];
let currentCategory = CATEGORY_ORDER[0];
let deliveryMode = "recoger";

function metaFor(catKey) {
  if (CATEGORY_META[catKey]) return CATEGORY_META[catKey];
  return { label: MENU[catKey].label, emoji: MENU[catKey].emoji, type: "simple" };
}

function renderNav() {
  const nav = document.getElementById("catNav");
  nav.innerHTML = CATEGORY_ORDER.map((key) => {
    const m = metaFor(key);
    return `<button class="cat-pill ${key === currentCategory ? "active" : ""}" data-cat="${key}">
      <span>${m.emoji}</span><span>${m.label}</span>
    </button>`;
  }).join("");
  nav.querySelectorAll(".cat-pill").forEach((btn) => {
    btn.addEventListener("click", () => showCategory(btn.dataset.cat));
  });
}

function showCategory(key) {
  currentCategory = key;
  renderNav();
  renderMain();
  document.getElementById("menuMain").scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderMain() {
  const main = document.getElementById("menuMain");
  main.innerHTML = "";
  const section = document.createElement("section");
  section.className = "menu-section active";
  const meta = metaFor(currentCategory);

  if (meta.type === "pizza") {
    section.innerHTML = `
      <h2 class="section-heading">Pizzas</h2>
      <p class="section-intro">Disfruta, combina y divide. Elige tradicional (hasta 2 ingredientes) o una de nuestras especialidades.</p>
      <div class="card-grid">
        <div class="item-card">
          <h3>Tradicional</h3>
          <p class="desc">Hasta 2 ingredientes a tu elección. Chica $${PIZZA_CONFIG.tradicional.prices.chica} · Mediana $${PIZZA_CONFIG.tradicional.prices.mediana} · Grande $${PIZZA_CONFIG.tradicional.prices.grande} · Mega $${PIZZA_CONFIG.tradicional.prices.mega}</p>
          <button class="card-cta builder" data-open-pizza="tradicional">Armar mi pizza</button>
        </div>
        <div class="item-card">
          <h3>Especialidad</h3>
          <p class="desc">Recetas de la casa: ${PIZZA_CONFIG.especialidad.recetas.map(r=>r.name).join(", ")}. Ingrediente extra +$${PIZZA_CONFIG.especialidad.ingredienteExtra}.</p>
          <button class="card-cta builder" data-open-pizza="especialidad">Elegir especialidad</button>
        </div>
        <div class="item-card">
          <h3>Mixta</h3>
          <p class="desc">${PIZZA_CONFIG.mixta.intro} ${PIZZA_CONFIG.mixta.sizes.map(s=>`${s.label} $${s.price}`).join(" · ")}</p>
          <button class="card-cta builder" data-open-pizza="mixta">Armar pizza mixta</button>
        </div>
      </div>
      <p class="section-intro" style="margin-top:16px;">${PIZZA_CONFIG.nota}</p>
    `;
    main.appendChild(section);
    section.querySelectorAll("[data-open-pizza]").forEach((b) =>
      b.addEventListener("click", () => openPizzaBuilder(b.dataset.openPizza))
    );
    return;
  }

  if (meta.type === "salad") {
    section.innerHTML = `
      <h2 class="section-heading">Ensaladas</h2>
      <p class="section-intro">${SALAD_CONFIG.incluyeNota} Ármala a tu gusto en 5 sencillos pasos.</p>
      <div class="card-grid">
        ${SALAD_CONFIG.sizes.map(s => `
          <div class="item-card">
            <h3>${s.label}</h3>
            <p class="desc">${s.proteinas} proteína${s.proteinas>1?"s":""} · ${s.toppings} toppings incluidos</p>
            <p class="item-variants"><span class="price">${money(s.price)}</span></p>
            <button class="card-cta builder" data-open-salad="${s.key}">Armar esta ensalada</button>
          </div>
        `).join("")}
      </div>
    `;
    main.appendChild(section);
    section.querySelectorAll("[data-open-salad]").forEach((b) =>
      b.addEventListener("click", () => openSaladBuilder(b.dataset.openSalad))
    );
    return;
  }

  // Categoría simple
  const cat = MENU[currentCategory];
  section.innerHTML = `
    <h2 class="section-heading">${cat.label}</h2>
    ${cat.intro ? `<p class="section-intro">${cat.intro}</p>` : ""}
    <div class="card-grid">
      ${cat.items.map((item) => `
        <div class="item-card">
          <h3>${item.name}</h3>
          ${item.desc ? `<p class="desc">${item.desc}</p>` : ""}
          <div class="item-variants">
            ${item.variants.map(v => `<div class="dot-row"><span>${v.label}</span><span class="dot-fill"></span><span class="price">${money(v.price)}</span></div>`).join("")}
          </div>
          <button class="card-cta" data-item="${item.id}">Agregar</button>
        </div>
      `).join("")}
    </div>
  `;
  main.appendChild(section);
  section.querySelectorAll("[data-item]").forEach((b) =>
    b.addEventListener("click", () => openItemModal(currentCategory, b.dataset.item))
  );
}

/* ---------------------------------------------------------
   ITEM MODAL (categorías simples)
--------------------------------------------------------- */
let itemModalState = null;

function openItemModal(catKey, itemId) {
  const cat = MENU[catKey];
  const item = cat.items.find((i) => i.id === itemId);
  itemModalState = {
    catKey, itemId,
    variantIdx: 0,
    proteina: null,
    pan: null,
    qty: 1,
  };
  renderItemModal();
  toggleModal("itemModal", true);
}

function renderItemModal() {
  const { catKey, itemId, variantIdx, proteina, pan, qty } = itemModalState;
  const cat = MENU[catKey];
  const item = cat.items.find((i) => i.id === itemId);
  const variant = item.variants[variantIdx];

  const needsProteina = cat.proteinaOpciones && /con prote/i.test(variant.label);
  const needsPan = !!cat.extraChoice;

  let unitPrice = variant.price;

  const inner = document.getElementById("itemModalInner");
  inner.innerHTML = `
    <button class="modal-x" data-close-item>✕</button>
    <h2 class="modal-h">${item.name}</h2>
    ${item.desc ? `<p class="modal-p">${item.desc}</p>` : ""}

    ${item.variants.length > 1 ? `
      <div class="builder-step">
        <h4>Elige tamaño / presentación</h4>
        <div class="chip-group" id="variantChips">
          ${item.variants.map((v, i) => `<button class="chip ${i===variantIdx?"selected":""}" data-vidx="${i}">${v.label} · ${money(v.price)}</button>`).join("")}
        </div>
      </div>` : ""}

    ${needsProteina ? `
      <div class="builder-step">
        <h4>Elige tu proteína</h4>
        <div class="chip-group" id="proteinaChips">
          ${cat.proteinaOpciones.map(p => `<button class="chip ${proteina===p?"selected":""}" data-p="${p}">${p}</button>`).join("")}
        </div>
      </div>` : ""}

    ${needsPan ? `
      <div class="builder-step">
        <h4>${cat.extraChoice.label}</h4>
        <div class="chip-group" id="panChips">
          ${cat.extraChoice.options.map(p => `<button class="chip ${pan===p?"selected":""}" data-pan="${p}">${p}</button>`).join("")}
        </div>
      </div>` : ""}

    <div class="builder-footer">
      <div class="qty-row">
        <button class="qty-btn" id="itemQtyMinus">−</button>
        <span id="itemQtyVal" style="font-family:var(--font-mono); font-weight:700;">${qty}</span>
        <button class="qty-btn" id="itemQtyPlus">+</button>
      </div>
      <div class="builder-price">${money(unitPrice * qty)}</div>
      <button class="add-btn" id="itemAddBtn">Agregar</button>
    </div>
  `;

  inner.querySelector("[data-close-item]").addEventListener("click", () => toggleModal("itemModal", false));
  if (item.variants.length > 1) {
    inner.querySelectorAll("[data-vidx]").forEach((b) =>
      b.addEventListener("click", () => { itemModalState.variantIdx = +b.dataset.vidx; renderItemModal(); })
    );
  }
  if (needsProteina) {
    inner.querySelectorAll("[data-p]").forEach((b) =>
      b.addEventListener("click", () => { itemModalState.proteina = b.dataset.p; renderItemModal(); })
    );
  }
  if (needsPan) {
    inner.querySelectorAll("[data-pan]").forEach((b) =>
      b.addEventListener("click", () => { itemModalState.pan = b.dataset.pan; renderItemModal(); })
    );
  }
  inner.querySelector("#itemQtyMinus").addEventListener("click", () => {
    itemModalState.qty = Math.max(1, itemModalState.qty - 1); renderItemModal();
  });
  inner.querySelector("#itemQtyPlus").addEventListener("click", () => {
    itemModalState.qty += 1; renderItemModal();
  });
  inner.querySelector("#itemAddBtn").addEventListener("click", () => {
    if (needsProteina && !proteina) return showToast("Elige una proteína");
    if (needsPan && !pan) return showToast(`Elige: ${cat.extraChoice.label.toLowerCase()}`);
    const details = [];
    if (proteina) details.push(`Proteína: ${proteina}`);
    if (pan) details.push(`Pan: ${pan}`);
    addToCart({
      name: `${item.name} (${variant.label})`,
      categoryLabel: cat.label,
      unitPrice: variant.price,
      qty: itemModalState.qty,
      details,
    });
    toggleModal("itemModal", false);
  });
}

/* ---------------------------------------------------------
   PIZZA BUILDER
--------------------------------------------------------- */
let pzState = null;

function openPizzaBuilder(type) {
  const defaultSize = type === "mixta" ? PIZZA_CONFIG.mixta.sizes[0].key : "mediana";
  pzState = { type, size: defaultSize, ingredients: [], recetas: [], extra: 0, qty: 1 };
  renderPizzaBuilder();
  toggleModal("builderModal", true);
}

function pizzaMaxIngredientes() {
  if (pzState.type === "mixta") return pizzaMixtaSize().maxTrad;
  return PIZZA_CONFIG.tradicional.maxIngredientes[pzState.size];
}
function pizzaMaxRecetas() {
  if (pzState.type === "mixta") return pizzaMixtaSize().maxEsp;
  return PIZZA_CONFIG.especialidad.maxRecetas[pzState.size];
}
function pizzaMixtaSize() {
  return PIZZA_CONFIG.mixta.sizes.find(s => s.key === pzState.size) || PIZZA_CONFIG.mixta.sizes[0];
}
function pizzaSizeOptions() {
  const conf = PIZZA_CONFIG;
  if (pzState.type === "mixta") {
    return conf.mixta.sizes.map(s => ({ key: s.key, label: s.label, price: s.price }));
  }
  return conf.sizes.map(s => ({ key: s.key, label: s.label, price: conf[pzState.type].prices[s.key] }));
}

function pizzaUnitPrice() {
  if (pzState.type === "mixta") return pizzaMixtaSize().price;
  const base = PIZZA_CONFIG[pzState.type].prices[pzState.size];
  const extraCost = pzState.type === "especialidad" ? pzState.extra * PIZZA_CONFIG.especialidad.ingredienteExtra : 0;
  return base + extraCost;
}

function renderPizzaBuilder() {
  const inner = document.getElementById("builderModalInner");
  const conf = PIZZA_CONFIG;
  const isTrad = pzState.type === "tradicional";
  const isEsp = pzState.type === "especialidad";
  const isMixta = pzState.type === "mixta";
  const maxIng = pizzaMaxIngredientes();
  const maxRec = pizzaMaxRecetas();
  const sizeOptions = pizzaSizeOptions();

  const stepLabel = isTrad ? " e ingredientes" : isEsp ? " y receta(s)" : ", ingrediente(s) y receta(s)";

  inner.innerHTML = `
    <button class="modal-x" data-close-builder>✕</button>
    <h2 class="modal-h">Arma tu pizza</h2>
    <p class="modal-p">Elige tipo, tamaño${stepLabel}.</p>

    <div class="type-toggle">
      <button data-type="tradicional" class="${isTrad?"active":""}">Tradicional</button>
      <button data-type="especialidad" class="${isEsp?"active":""}">Especialidad</button>
      <button data-type="mixta" class="${isMixta?"active":""}">Mixta</button>
    </div>
    ${isMixta ? `<p class="modal-p" style="margin-top:-10px;">${conf.mixta.intro}</p>` : ""}

    <div class="builder-step">
      <h4>Tamaño</h4>
      <div class="size-grid">
        ${sizeOptions.map(s => `
          <button class="size-card ${pzState.size===s.key?"selected":""}" data-size="${s.key}">
            <b>${s.label}</b><span>${money(s.price)}</span>
          </button>`).join("")}
      </div>
    </div>

    ${isTrad ? `
      <div class="builder-step">
        <h4>Ingredientes (máx. ${maxIng} en este tamaño)</h4>
        <div class="chip-group">
          ${conf.tradicional.ingredientes.map(ing => {
            const selected = pzState.ingredients.includes(ing);
            const disabled = !selected && pzState.ingredients.length >= maxIng;
            return `<button class="chip ${selected?"selected":""} ${disabled?"disabled":""}" data-ing="${ing}">${ing}</button>`;
          }).join("")}
        </div>
      </div>
    ` : ""}

    ${isEsp ? `
      <div class="builder-step">
        <h4>Elige tu(s) receta(s) — máx. ${maxRec} en este tamaño</h4>
        ${conf.especialidad.recetas.map((r, i) => {
          const selected = pzState.recetas.includes(i);
          const disabled = !selected && pzState.recetas.length >= maxRec;
          return `
            <button class="recipe-card ${selected?"selected":""} ${disabled?"disabled":""}" data-receta="${i}" style="width:100%; text-align:left; display:block;">
              <b>${r.name}</b>
              <p>${r.desc}</p>
            </button>
          `;
        }).join("")}
      </div>
      <div class="builder-step">
        <h4>Ingredientes extra (+${money(conf.especialidad.ingredienteExtra)} c/u)</h4>
        <div class="qty-row">
          <button class="qty-btn" id="pzExtraMinus">−</button>
          <span style="font-family:var(--font-mono); font-weight:700;">${pzState.extra}</span>
          <button class="qty-btn" id="pzExtraPlus">+</button>
        </div>
      </div>
    ` : ""}

    ${isMixta ? `
      <div class="builder-step">
        <h4>Ingrediente(s) tradicional(es) — máx. ${maxIng} en este tamaño</h4>
        <div class="chip-group">
          ${conf.tradicional.ingredientes.map(ing => {
            const selected = pzState.ingredients.includes(ing);
            const disabled = !selected && pzState.ingredients.length >= maxIng;
            return `<button class="chip ${selected?"selected":""} ${disabled?"disabled":""}" data-ing="${ing}">${ing}</button>`;
          }).join("")}
        </div>
      </div>
      <div class="builder-step">
        <h4>Receta(s) de especialidad — máx. ${maxRec} en este tamaño</h4>
        ${conf.especialidad.recetas.map((r, i) => {
          const selected = pzState.recetas.includes(i);
          const disabled = !selected && pzState.recetas.length >= maxRec;
          return `
            <button class="recipe-card ${selected?"selected":""} ${disabled?"disabled":""}" data-receta="${i}" style="width:100%; text-align:left; display:block;">
              <b>${r.name}</b>
              <p>${r.desc}</p>
            </button>
          `;
        }).join("")}
      </div>
    ` : ""}

    <div class="builder-footer">
      <div class="qty-row">
        <button class="qty-btn" id="pzQtyMinus">−</button>
        <span style="font-family:var(--font-mono); font-weight:700;">${pzState.qty}</span>
        <button class="qty-btn" id="pzQtyPlus">+</button>
      </div>
      <div class="builder-price">${money(pizzaUnitPrice() * pzState.qty)}</div>
      <button class="add-btn" id="pzAddBtn">Agregar</button>
    </div>
  `;

  inner.querySelector("[data-close-builder]").addEventListener("click", () => toggleModal("builderModal", false));
  inner.querySelectorAll("[data-type]").forEach((b) =>
    b.addEventListener("click", () => {
      const newType = b.dataset.type;
      pzState.type = newType;
      pzState.ingredients = [];
      pzState.recetas = [];
      pzState.extra = 0;
      pzState.size = newType === "mixta" ? PIZZA_CONFIG.mixta.sizes[0].key : "mediana";
      renderPizzaBuilder();
    })
  );
  inner.querySelectorAll("[data-size]").forEach((b) =>
    b.addEventListener("click", () => {
      pzState.size = b.dataset.size;
      // si el nuevo tamaño permite menos selecciones, recorta lo que sobre
      pzState.ingredients = pzState.ingredients.slice(0, pizzaMaxIngredientes());
      pzState.recetas = pzState.recetas.slice(0, pizzaMaxRecetas());
      renderPizzaBuilder();
    })
  );
  if (isTrad || isMixta) {
    inner.querySelectorAll("[data-ing]").forEach((b) =>
      b.addEventListener("click", () => {
        const ing = b.dataset.ing;
        const idx = pzState.ingredients.indexOf(ing);
        if (idx >= 0) pzState.ingredients.splice(idx, 1);
        else if (pzState.ingredients.length < maxIng) pzState.ingredients.push(ing);
        else showToast(`Máximo ${maxIng} ingrediente(s) en este tamaño`);
        renderPizzaBuilder();
      })
    );
  }
  if (isEsp || isMixta) {
    inner.querySelectorAll("[data-receta]").forEach((b) =>
      b.addEventListener("click", () => {
        const i = +b.dataset.receta;
        const idx = pzState.recetas.indexOf(i);
        if (idx >= 0) pzState.recetas.splice(idx, 1);
        else if (pzState.recetas.length < maxRec) pzState.recetas.push(i);
        else showToast(`Máximo ${maxRec} receta(s) en este tamaño`);
        renderPizzaBuilder();
      })
    );
  }
  if (isEsp) {
    inner.querySelector("#pzExtraMinus").addEventListener("click", () => { pzState.extra = Math.max(0, pzState.extra-1); renderPizzaBuilder(); });
    inner.querySelector("#pzExtraPlus").addEventListener("click", () => { pzState.extra += 1; renderPizzaBuilder(); });
  }
  inner.querySelector("#pzQtyMinus").addEventListener("click", () => { pzState.qty = Math.max(1, pzState.qty-1); renderPizzaBuilder(); });
  inner.querySelector("#pzQtyPlus").addEventListener("click", () => { pzState.qty += 1; renderPizzaBuilder(); });
  inner.querySelector("#pzAddBtn").addEventListener("click", () => {
    if (isTrad && pzState.ingredients.length === 0) return showToast("Elige al menos 1 ingrediente");
    if (isEsp && pzState.recetas.length === 0) return showToast("Elige al menos 1 receta");
    if (isMixta && pzState.ingredients.length === 0) return showToast("Elige al menos 1 ingrediente tradicional");
    if (isMixta && pzState.recetas.length === 0) return showToast("Elige al menos 1 receta de especialidad");

    const sizeLabel = sizeOptions.find(s => s.key === pzState.size).label;
    const recetaNames = pzState.recetas.map(i => conf.especialidad.recetas[i].name);
    const details = [];
    let nameSuffix;

    if (isTrad) {
      details.push(`Ingredientes: ${pzState.ingredients.join(", ")}`);
      nameSuffix = "Tradicional";
    } else if (isEsp) {
      details.push(`Receta${recetaNames.length>1?"s":""}: ${recetaNames.join(", ")}`);
      if (pzState.extra > 0) details.push(`Ingredientes extra: ${pzState.extra} (+${money(pzState.extra*conf.especialidad.ingredienteExtra)})`);
      nameSuffix = recetaNames.join(" + ");
    } else {
      details.push(`Ingredientes: ${pzState.ingredients.join(", ")}`);
      details.push(`Receta${recetaNames.length>1?"s":""}: ${recetaNames.join(", ")}`);
      nameSuffix = `Mixta (${pzState.ingredients.join(", ")} + ${recetaNames.join(", ")})`;
    }

    addToCart({
      name: `Pizza ${nameSuffix} (${sizeLabel})`,
      categoryLabel: "Pizzas",
      unitPrice: pizzaUnitPrice(),
      qty: pzState.qty,
      details,
    });
    toggleModal("builderModal", false);
  });
}

/* ---------------------------------------------------------
   SALAD BUILDER
--------------------------------------------------------- */
let slState = null;

function openSaladBuilder(sizeKey) {
  slState = { size: sizeKey, base: SALAD_CONFIG.bases[0], proteinas: [], toppings: [], aderezo: null, semillas: [], crutonOQueso: null, pechugaExtra: false, aderezoExtra: false, qty: 1 };
  renderSaladBuilder();
  toggleModal("builderModal", true);
}

function saladUnitPrice() {
  const sc = SALAD_CONFIG.sizes.find(s => s.key === slState.size);
  const extraProt = Math.max(0, slState.proteinas.length - sc.proteinas) * SALAD_CONFIG.extras.proteina;
  const extraTop = Math.max(0, slState.toppings.length - sc.toppings) * SALAD_CONFIG.extras.toppings;
  const pechuga = slState.pechugaExtra ? SALAD_CONFIG.extras.pechuga : 0;
  const aderezoExtra = slState.aderezoExtra ? SALAD_CONFIG.extras.aderezoOCrutones : 0;
  return sc.price + extraProt + extraTop + pechuga + aderezoExtra;
}

function renderSaladBuilder() {
  const inner = document.getElementById("builderModalInner");
  const sc = SALAD_CONFIG.sizes.find(s => s.key === slState.size);

  const chipGroup = (arr, selectedArr, dataAttr, max) => arr.map(v => {
    const selected = selectedArr.includes(v);
    return `<button class="chip ${selected?"selected":""}" data-${dataAttr}="${v}">${v}</button>`;
  }).join("");

  inner.innerHTML = `
    <button class="modal-x" data-close-builder>✕</button>
    <h2 class="modal-h">Arma tu ensalada</h2>
    <p class="modal-p">${SALAD_CONFIG.incluyeNota}</p>

    <div class="builder-step">
      <h4>Tamaño</h4>
      <div class="size-grid">
        ${SALAD_CONFIG.sizes.map(s => `
          <button class="size-card ${slState.size===s.key?"selected":""}" data-size="${s.key}">
            <b>${s.label}</b><span>${money(s.price)} · ${s.proteinas} prot / ${s.toppings} top</span>
          </button>`).join("")}
      </div>
    </div>

    <div class="builder-step">
      <h4>Paso 1 · Base</h4>
      <div class="chip-group">
        ${SALAD_CONFIG.bases.map(b => `<button class="chip ${slState.base===b?"selected":""}" data-base="${b}">${b}</button>`).join("")}
      </div>
    </div>

    <div class="builder-step">
      <h4>Paso 2 · Proteína (${sc.proteinas} incluida${sc.proteinas>1?"s":""}, extra +${money(SALAD_CONFIG.extras.proteina)})</h4>
      <div class="chip-group" id="proteinaChips">${chipGroup(SALAD_CONFIG.proteinas, slState.proteinas, "prot")}</div>
    </div>

    <div class="builder-step">
      <h4>Paso 3 · Toppings (${sc.toppings} incluidos, extra +${money(SALAD_CONFIG.extras.toppings)})</h4>
      <div class="chip-group" id="toppingChips">${chipGroup(SALAD_CONFIG.toppings, slState.toppings, "top")}</div>
    </div>

    <div class="builder-step">
      <h4>Paso 4 · Aderezo o vinagreta</h4>
      <div class="chip-group" id="aderezoChips">
        ${SALAD_CONFIG.aderezos.map(a => `<button class="chip ${slState.aderezo===a?"selected":""}" data-ader="${a}">${a}</button>`).join("")}
      </div>
    </div>

    <div class="builder-step">
      <h4>Paso 5 · Semillas (elige hasta 2)</h4>
      <div class="chip-group" id="semillaChips">${chipGroup(SALAD_CONFIG.semillas, slState.semillas, "sem")}</div>
    </div>

    <div class="builder-step">
      <h4>Crutones o queso parmesano</h4>
      <div class="chip-group">
        <button class="chip ${slState.crutonOQueso==="Crutones"?"selected":""}" data-cq="Crutones">Crutones</button>
        <button class="chip ${slState.crutonOQueso==="Queso Parmesano"?"selected":""}" data-cq="Queso Parmesano">Queso Parmesano</button>
      </div>
    </div>

    <div class="builder-step">
      <h4>Extras</h4>
      <div class="chip-group">
        <button class="chip ${slState.pechugaExtra?"selected":""}" id="pechugaExtraBtn">+ Pechuga extra (${money(SALAD_CONFIG.extras.pechuga)})</button>
        <button class="chip ${slState.aderezoExtra?"selected":""}" id="aderezoExtraBtn">+ Aderezo/crutones extra (${money(SALAD_CONFIG.extras.aderezoOCrutones)})</button>
      </div>
    </div>

    <div class="builder-footer">
      <div class="qty-row">
        <button class="qty-btn" id="slQtyMinus">−</button>
        <span style="font-family:var(--font-mono); font-weight:700;">${slState.qty}</span>
        <button class="qty-btn" id="slQtyPlus">+</button>
      </div>
      <div class="builder-price">${money(saladUnitPrice() * slState.qty)}</div>
      <button class="add-btn" id="slAddBtn">Agregar</button>
    </div>
  `;

  inner.querySelector("[data-close-builder]").addEventListener("click", () => toggleModal("builderModal", false));
  inner.querySelectorAll("[data-size]").forEach((b) => b.addEventListener("click", () => { slState.size = b.dataset.size; renderSaladBuilder(); }));
  inner.querySelectorAll("[data-base]").forEach((b) => b.addEventListener("click", () => { slState.base = b.dataset.base; renderSaladBuilder(); }));
  inner.querySelectorAll("[data-prot]").forEach((b) => b.addEventListener("click", () => { toggleArrItem(slState.proteinas, b.dataset.prot); renderSaladBuilder(); }));
  inner.querySelectorAll("[data-top]").forEach((b) => b.addEventListener("click", () => { toggleArrItem(slState.toppings, b.dataset.top); renderSaladBuilder(); }));
  inner.querySelectorAll("[data-ader]").forEach((b) => b.addEventListener("click", () => { slState.aderezo = b.dataset.ader; renderSaladBuilder(); }));
  inner.querySelectorAll("[data-sem]").forEach((b) => b.addEventListener("click", () => {
    const v = b.dataset.sem;
    const idx = slState.semillas.indexOf(v);
    if (idx >= 0) slState.semillas.splice(idx, 1);
    else if (slState.semillas.length < 2) slState.semillas.push(v);
    else showToast("Máximo 2 semillas");
    renderSaladBuilder();
  }));
  inner.querySelectorAll("[data-cq]").forEach((b) => b.addEventListener("click", () => { slState.crutonOQueso = b.dataset.cq; renderSaladBuilder(); }));
  inner.querySelector("#pechugaExtraBtn").addEventListener("click", () => { slState.pechugaExtra = !slState.pechugaExtra; renderSaladBuilder(); });
  inner.querySelector("#aderezoExtraBtn").addEventListener("click", () => { slState.aderezoExtra = !slState.aderezoExtra; renderSaladBuilder(); });
  inner.querySelector("#slQtyMinus").addEventListener("click", () => { slState.qty = Math.max(1, slState.qty-1); renderSaladBuilder(); });
  inner.querySelector("#slQtyPlus").addEventListener("click", () => { slState.qty += 1; renderSaladBuilder(); });
  inner.querySelector("#slAddBtn").addEventListener("click", () => {
    if (slState.proteinas.length === 0) return showToast("Elige al menos 1 proteína");
    if (slState.toppings.length === 0) return showToast("Elige al menos 1 topping");
    if (!slState.aderezo) return showToast("Elige un aderezo");
    const details = [
      `Base: ${slState.base}`,
      `Proteína: ${slState.proteinas.join(", ")}`,
      `Toppings: ${slState.toppings.join(", ")}`,
      `Aderezo: ${slState.aderezo}`,
    ];
    if (slState.semillas.length) details.push(`Semillas: ${slState.semillas.join(", ")}`);
    if (slState.crutonOQueso) details.push(slState.crutonOQueso);
    if (slState.pechugaExtra) details.push(`Pechuga extra (+${money(SALAD_CONFIG.extras.pechuga)})`);
    if (slState.aderezoExtra) details.push(`Aderezo/crutones extra (+${money(SALAD_CONFIG.extras.aderezoOCrutones)})`);
    addToCart({
      name: `Ensalada ${sc.label}`,
      categoryLabel: "Ensaladas",
      unitPrice: saladUnitPrice(),
      qty: slState.qty,
      details,
    });
    toggleModal("builderModal", false);
  });
}

function toggleArrItem(arr, val) {
  const idx = arr.indexOf(val);
  if (idx >= 0) arr.splice(idx, 1);
  else arr.push(val);
}

/* ---------------------------------------------------------
   MODAL HELPERS
--------------------------------------------------------- */
function toggleModal(id, show) {
  const modal = document.getElementById(id);
  const overlayId = id === "builderModal" ? "modalOverlay" : id === "itemModal" ? "modalOverlay" : "modalOverlay";
  const overlay = document.getElementById("modalOverlay");
  modal.classList.toggle("show", show);
  overlay.classList.toggle("show", show);
}
document.getElementById("modalOverlay").addEventListener("click", () => {
  toggleModal("builderModal", false);
  toggleModal("itemModal", false);
});

/* ---------------------------------------------------------
   CARRITO
--------------------------------------------------------- */
function addToCart({ name, categoryLabel, unitPrice, qty, details }) {
  cart.push({ uid: Date.now() + Math.random(), name, categoryLabel, unitPrice, qty, details });
  renderCart();
  showToast(`${name} agregado a tu pedido`);
}

function removeFromCart(uid) {
  cart = cart.filter((c) => c.uid !== uid);
  renderCart();
}

function cartTotal() {
  return cart.reduce((sum, c) => sum + c.unitPrice * c.qty, 0);
}

function renderCart() {
  document.getElementById("cartCount").textContent = cart.reduce((s, c) => s + c.qty, 0);
  const wrap = document.getElementById("cartItemsWrap");
  const emptyMsg = document.getElementById("cartEmptyMsg");
  const sendBtn = document.getElementById("sendWhatsappBtn");

  if (cart.length === 0) {
    wrap.innerHTML = "";
    emptyMsg.style.display = "block";
    sendBtn.disabled = true;
  } else {
    emptyMsg.style.display = "none";
    sendBtn.disabled = false;
    wrap.innerHTML = cart.map((c) => `
      <div class="cart-line">
        <div class="cart-line-top">
          <span>${c.qty}x ${c.name}</span>
          <span>${money(c.unitPrice * c.qty)}</span>
        </div>
        ${c.details && c.details.length ? `<div class="cart-line-detail">${c.details.join(" · ")}</div>` : ""}
        <div class="cart-line-actions">
          <button data-remove="${c.uid}">Quitar</button>
        </div>
      </div>
    `).join("");
    wrap.querySelectorAll("[data-remove]").forEach((b) =>
      b.addEventListener("click", () => removeFromCart(parseFloat(b.dataset.remove)))
    );
  }
  document.getElementById("cartTotal").textContent = money(cartTotal());
}

function openCart() {
  document.getElementById("cartDrawer").classList.add("open");
  document.getElementById("cartOverlay").classList.add("show");
}
function closeCart() {
  document.getElementById("cartDrawer").classList.remove("open");
  document.getElementById("cartOverlay").classList.remove("show");
}
document.getElementById("openCartBtn").addEventListener("click", openCart);
document.getElementById("closeCartBtn").addEventListener("click", closeCart);
document.getElementById("cartOverlay").addEventListener("click", closeCart);

document.getElementById("deliverySeg").addEventListener("click", (e) => {
  const btn = e.target.closest(".seg-btn");
  if (!btn) return;
  deliveryMode = btn.dataset.mode;
  document.querySelectorAll("#deliverySeg .seg-btn").forEach((b) => b.classList.toggle("active", b === btn));
  document.getElementById("addressField").style.display = deliveryMode === "domicilio" ? "flex" : "none";
});

document.getElementById("sendWhatsappBtn").addEventListener("click", () => {
  if (cart.length === 0) return;
  const name = document.getElementById("custName").value.trim();
  const address = document.getElementById("custAddress").value.trim();
  const notes = document.getElementById("custNotes").value.trim();

  if (!name) { showToast("Escribe tu nombre para el pedido"); return; }
  if (deliveryMode === "domicilio" && !address) { showToast("Escribe tu dirección de entrega"); return; }

  let msg = `🍃 *Nuevo pedido — Saborear-T*\n\n`;
  msg += `👤 Nombre: ${name}\n`;
  msg += `🚚 Entrega: ${deliveryMode === "domicilio" ? "A domicilio" : "Recoger en tienda"}\n`;
  if (deliveryMode === "domicilio") msg += `📍 Dirección: ${address}\n`;
  msg += `\n*Pedido:*\n`;
  cart.forEach((c) => {
    msg += `\n▫️ ${c.qty}x ${c.name} — ${money(c.unitPrice * c.qty)}`;
    if (c.details && c.details.length) msg += `\n   ${c.details.join("\n   ")}`;
  });
  msg += `\n\n💰 *Total: ${money(cartTotal())}*`;
  if (notes) msg += `\n\n📝 Notas: ${notes}`;

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
});

/* ---------------------------------------------------------
   TOAST
--------------------------------------------------------- */
let toastTimer;
function showToast(text) {
  const t = document.getElementById("toast");
  t.textContent = text;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}


/* ---------------------------------------------------------
   INIT
--------------------------------------------------------- */
function init() {
  renderNav();
  renderMain();
  renderCart();
  document.getElementById("brandBtn").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}
init();
