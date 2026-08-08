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
      <p class="section-intro">Elige el tamaño y, si quieres, divide tu pizza en secciones para combinar sabores tradicionales y especialidades.</p>
      <button class="card-cta builder" id="openPizzaBuilderBtn" style="margin-bottom:20px;">Armar mi pizza</button>
      <div class="card-grid">
        <div class="item-card">
          <h3>Tradicional</h3>
          <p class="desc">Hasta 2 ingredientes por sección. Chica $${PIZZA_CONFIG.tradicional.prices.chica} · Mediana $${PIZZA_CONFIG.tradicional.prices.mediana} · Grande $${PIZZA_CONFIG.tradicional.prices.grande} · Mega $${PIZZA_CONFIG.tradicional.prices.mega}</p>
        </div>
        <div class="item-card">
          <h3>Especialidad</h3>
          <p class="desc">1 receta por sección. Recetas: ${PIZZA_CONFIG.especialidad.recetas.map(r=>r.name).join(", ")}. Chica $${PIZZA_CONFIG.especialidad.prices.chica} · Mediana $${PIZZA_CONFIG.especialidad.prices.mediana} · Grande $${PIZZA_CONFIG.especialidad.prices.grande} · Mega $${PIZZA_CONFIG.especialidad.prices.mega}</p>
        </div>
        <div class="item-card">
          <h3>Combinada (mitad y mitad / tercios / cuartos)</h3>
          <p class="desc">Divide tu Mediana o Grande en 2 secciones, o tu Mega en 2, 3 o 4. Mediana $${PIZZA_CONFIG.mixtaPrices.mediana} · Grande $${PIZZA_CONFIG.mixtaPrices.grande} · Mega $${PIZZA_CONFIG.mixtaPrices.mega} (el precio final depende de cuántas secciones sean de especialidad).</p>
        </div>
      </div>
      <p class="section-intro" style="margin-top:16px;">${PIZZA_CONFIG.nota}</p>
    `;
    main.appendChild(section);
    section.querySelector("#openPizzaBuilderBtn").addEventListener("click", () => openPizzaBuilder());
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
          <button class="card-cta ${item.isSaladBuilder ? "builder" : ""}" data-item="${item.id}" ${item.isSaladBuilder ? 'data-salad-builder="1"' : ""}>${item.isSaladBuilder ? "Armar mi ensalada" : "Agregar"}</button>
        </div>
      `).join("")}
    </div>
  `;
  main.appendChild(section);
  section.querySelectorAll("[data-item]").forEach((b) =>
    b.addEventListener("click", () => {
      if (b.dataset.saladBuilder) openComidaEnsaladaBuilder(currentCategory, b.dataset.item);
      else openItemModal(currentCategory, b.dataset.item);
    })
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
    entrada: null,
    tortilla: null,
    qty: 1,
    comment: "",
  };
  renderItemModal();
  toggleModal("itemModal", true);
}

function renderItemModal() {
  const { catKey, itemId, variantIdx, proteina, pan, entrada, tortilla, qty, comment } = itemModalState;
  const cat = MENU[catKey];
  const item = cat.items.find((i) => i.id === itemId);
  const variant = item.variants[variantIdx];

  const needsProteina = cat.proteinaOpciones && /con prote/i.test(variant.label);
  const choiceConf = item.extraChoice || cat.extraChoice;
  const needsPan = !!choiceConf;
  const needsEntrada = !!item.needsEntrada;
  const needsTortilla = !!item.needsTortilla;

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
        <h4>${choiceConf.label}</h4>
        <div class="chip-group" id="panChips">
          ${choiceConf.options.map(p => `<button class="chip ${pan===p?"selected":""}" data-pan="${p}">${p}</button>`).join("")}
        </div>
      </div>` : ""}

    ${needsEntrada ? `
      <div class="builder-step">
        <h4>Elige tu entrada</h4>
        <div class="chip-group" id="entradaChips">
          ${cat.entradaOpciones.map(e => `<button class="chip ${entrada===e?"selected":""}" data-entrada="${e}">${e}</button>`).join("")}
        </div>
      </div>` : ""}

    ${needsTortilla ? `
      <div class="builder-step">
        <h4>Elige tus tortillas</h4>
        <div class="chip-group" id="tortillaChips">
          ${cat.tortillaOpciones.map(t => `<button class="chip ${tortilla===t?"selected":""}" data-tortilla="${t}">${t}</button>`).join("")}
        </div>
      </div>` : ""}

    <div class="builder-step">
      <h4>¿Alguna solicitud especial? (opcional)</h4>
      <textarea id="itemCommentInput" class="comment-input" rows="2" placeholder="Ej. sin cebolla, bien cocido...">${comment}</textarea>
    </div>

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
  if (needsEntrada) {
    inner.querySelectorAll("[data-entrada]").forEach((b) =>
      b.addEventListener("click", () => { itemModalState.entrada = b.dataset.entrada; renderItemModal(); })
    );
  }
  if (needsTortilla) {
    inner.querySelectorAll("[data-tortilla]").forEach((b) =>
      b.addEventListener("click", () => { itemModalState.tortilla = b.dataset.tortilla; renderItemModal(); })
    );
  }
  inner.querySelector("#itemCommentInput").addEventListener("input", (e) => {
    itemModalState.comment = e.target.value;
  });
  inner.querySelector("#itemQtyMinus").addEventListener("click", () => {
    itemModalState.qty = Math.max(1, itemModalState.qty - 1); renderItemModal();
  });
  inner.querySelector("#itemQtyPlus").addEventListener("click", () => {
    itemModalState.qty += 1; renderItemModal();
  });
  inner.querySelector("#itemAddBtn").addEventListener("click", () => {
    if (needsProteina && !proteina) return showToast("Elige una proteína");
    if (needsPan && !pan) return showToast(`Elige: ${choiceConf.label.toLowerCase()}`);
    if (needsEntrada && !entrada) return showToast("Elige tu entrada");
    if (needsTortilla && !tortilla) return showToast("Elige tus tortillas");
    const details = [];
    if (proteina) details.push(`Proteína: ${proteina}`);
    if (pan) details.push(`${choiceConf.detailLabel || choiceConf.label}: ${pan}`);
    if (entrada) details.push(`Entrada: ${entrada}`);
    if (tortilla) details.push(`Tortillas: ${tortilla}`);
    addToCart({
      name: `${item.name} (${variant.label})`,
      categoryLabel: cat.label,
      unitPrice: variant.price,
      qty: itemModalState.qty,
      details,
      comment: itemModalState.comment,
    });
    toggleModal("itemModal", false);
  });
}

/* ---------------------------------------------------------
   PIZZA BUILDER (por secciones)
--------------------------------------------------------- */
let pzState = null;

function pizzaDefaultSection() {
  return { type: "tradicional", ingredients: [], recetaIdx: null };
}

function pizzaPartsOptions() {
  return PIZZA_CONFIG.partsOptions[pzState.size];
}

function pizzaResizeSections(newParts) {
  const sections = pzState.sections;
  while (sections.length < newParts) sections.push(pizzaDefaultSection());
  while (sections.length > newParts) sections.pop();
  pzState.parts = newParts;
}

function openPizzaBuilder() {
  pzState = { size: "mediana", parts: 1, sections: [pizzaDefaultSection()], qty: 1, comment: "" };
  renderPizzaBuilder();
  toggleModal("builderModal", true);
}

function pizzaUnitPrice() {
  const conf = PIZZA_CONFIG;
  const { size, parts, sections } = pzState;

  if (parts === 1) {
    return sections[0].type === "tradicional" ? conf.tradicional.prices[size] : conf.especialidad.prices[size];
  }

  const espCount = sections.filter((s) => s.type === "especialidad").length;
  const tradCount = parts - espCount;

  if (size === "mega") {
    if (espCount > parts / 2) return conf.especialidad.prices.mega;
    return conf.mixtaPrices.mega;
  }

  // mediana / grande, siempre 2 secciones en este caso
  if (espCount === parts) return conf.especialidad.prices[size];
  if (tradCount === parts) return conf.tradicional.prices[size];
  return conf.mixtaPrices[size];
}

function renderPizzaBuilder() {
  const inner = document.getElementById("builderModalInner");
  const conf = PIZZA_CONFIG;
  const partsOptions = pizzaPartsOptions();
  const showPartsStep = partsOptions.length > 1;

  inner.innerHTML = `
    <button class="modal-x" data-close-builder>✕</button>
    <h2 class="modal-h">Arma tu pizza</h2>
    <p class="modal-p">Elige tamaño${showPartsStep ? ", si la divides" : ""} y el sabor de cada sección.</p>

    <div class="builder-step">
      <h4>Tamaño</h4>
      <div class="size-grid">
        ${conf.sizes.map(s => `
          <button class="size-card ${pzState.size===s.key?"selected":""}" data-size="${s.key}">
            <b>${s.label}</b>
          </button>`).join("")}
      </div>
    </div>

    ${showPartsStep ? `
      <div class="builder-step">
        <h4>¿Cómo la quieres dividir?</h4>
        <div class="chip-group">
          ${partsOptions.map(n => `<button class="chip ${pzState.parts===n?"selected":""}" data-parts="${n}">${conf.partLabels[n]}</button>`).join("")}
        </div>
      </div>
    ` : ""}

    ${pzState.sections.map((sec, i) => `
      <div class="builder-step" style="border-top:1px dashed var(--line); padding-top:16px;">
        <h4>${pzState.parts > 1 ? `Sección ${i+1} de ${pzState.parts}` : "Tu pizza"}</h4>
        <div class="chip-group" style="margin-bottom:10px;">
          <button class="chip ${sec.type==="tradicional"?"selected":""}" data-sec-type="${i}:tradicional">Tradicional</button>
          <button class="chip ${sec.type==="especialidad"?"selected":""}" data-sec-type="${i}:especialidad">Especialidad</button>
        </div>
        ${sec.type === "tradicional" ? `
          <p class="chip-note">Hasta ${conf.maxIngredientesPorSeccion} ingredientes</p>
          <div class="chip-group">
            ${conf.tradicional.ingredientes.map(ing => {
              const selected = sec.ingredients.includes(ing);
              const disabled = !selected && sec.ingredients.length >= conf.maxIngredientesPorSeccion;
              return `<button class="chip ${selected?"selected":""} ${disabled?"disabled":""}" data-sec-ing="${i}:${ing}">${ing}</button>`;
            }).join("")}
          </div>
        ` : `
          <p class="chip-note">Elige 1 receta para esta sección</p>
          ${conf.especialidad.recetas.map((r, ri) => `
            <button class="recipe-card ${sec.recetaIdx===ri?"selected":""}" data-sec-receta="${i}:${ri}" style="width:100%; text-align:left; display:block;">
              <b>${r.name}</b>
              <p>${r.desc}</p>
            </button>
          `).join("")}
        `}
      </div>
    `).join("")}

    <div class="builder-step">
      <h4>¿Alguna solicitud especial? (opcional)</h4>
      <textarea id="pzCommentInput" class="comment-input" rows="2" placeholder="Ej. bien horneada, cortar en cuadros, sin orégano...">${pzState.comment}</textarea>
    </div>

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
  inner.querySelector("#pzCommentInput").addEventListener("input", (e) => { pzState.comment = e.target.value; });

  inner.querySelectorAll("[data-size]").forEach((b) =>
    b.addEventListener("click", () => {
      pzState.size = b.dataset.size;
      const allowed = pizzaPartsOptions();
      if (!allowed.includes(pzState.parts)) pizzaResizeSections(allowed[0]);
      renderPizzaBuilder();
    })
  );

  if (showPartsStep) {
    inner.querySelectorAll("[data-parts]").forEach((b) =>
      b.addEventListener("click", () => { pizzaResizeSections(+b.dataset.parts); renderPizzaBuilder(); })
    );
  }

  inner.querySelectorAll("[data-sec-type]").forEach((b) =>
    b.addEventListener("click", () => {
      const [i, type] = b.dataset.secType.split(":");
      const sec = pzState.sections[+i];
      sec.type = type;
      sec.ingredients = [];
      sec.recetaIdx = null;
      renderPizzaBuilder();
    })
  );

  inner.querySelectorAll("[data-sec-ing]").forEach((b) =>
    b.addEventListener("click", () => {
      const [i, ing] = b.dataset.secIng.split(":");
      const sec = pzState.sections[+i];
      const idx = sec.ingredients.indexOf(ing);
      if (idx >= 0) sec.ingredients.splice(idx, 1);
      else if (sec.ingredients.length < conf.maxIngredientesPorSeccion) sec.ingredients.push(ing);
      else showToast(`Máximo ${conf.maxIngredientesPorSeccion} ingredientes por sección`);
      renderPizzaBuilder();
    })
  );

  inner.querySelectorAll("[data-sec-receta]").forEach((b) =>
    b.addEventListener("click", () => {
      const [i, ri] = b.dataset.secReceta.split(":");
      pzState.sections[+i].recetaIdx = +ri;
      renderPizzaBuilder();
    })
  );

  inner.querySelector("#pzQtyMinus").addEventListener("click", () => { pzState.qty = Math.max(1, pzState.qty-1); renderPizzaBuilder(); });
  inner.querySelector("#pzQtyPlus").addEventListener("click", () => { pzState.qty += 1; renderPizzaBuilder(); });

  inner.querySelector("#pzAddBtn").addEventListener("click", () => {
    for (let i = 0; i < pzState.sections.length; i++) {
      const sec = pzState.sections[i];
      if (sec.type === "tradicional" && sec.ingredients.length === 0) {
        return showToast(pzState.parts > 1 ? `Elige al menos 1 ingrediente en la sección ${i+1}` : "Elige al menos 1 ingrediente");
      }
      if (sec.type === "especialidad" && sec.recetaIdx === null) {
        return showToast(pzState.parts > 1 ? `Elige una receta en la sección ${i+1}` : "Elige una receta");
      }
    }

    const sizeLabel = conf.sizes.find(s => s.key === pzState.size).label;
    const partsLabel = conf.partLabels[pzState.parts];
    const details = pzState.sections.map((sec, i) => {
      const prefix = pzState.parts > 1 ? `Sección ${i+1}` : "";
      if (sec.type === "tradicional") {
        return `${prefix ? prefix + " · " : ""}Tradicional: ${sec.ingredients.join(", ")}`;
      }
      return `${prefix ? prefix + " · " : ""}Especialidad: ${conf.especialidad.recetas[sec.recetaIdx].name}`;
    });

    addToCart({
      name: `${sizeLabel}${pzState.parts > 1 ? ` — ${partsLabel}` : ""}`,
      categoryLabel: "Pizzas",
      unitPrice: pizzaUnitPrice(),
      qty: pzState.qty,
      details,
      comment: pzState.comment,
    });
    toggleModal("builderModal", false);
  });
}


/* ---------------------------------------------------------
   SALAD BUILDER
--------------------------------------------------------- */
let slState = null;

function openSaladBuilder(sizeKey) {
  slState = { size: sizeKey, base: SALAD_CONFIG.bases[0], proteinas: [], toppings: [], aderezo: null, semillas: [], crutonOQueso: null, pechugaExtra: false, aderezoExtra: false, qty: 1, comment: "" };
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

    <div class="builder-step">
      <h4>¿Alguna solicitud especial? (opcional)</h4>
      <textarea id="slCommentInput" class="comment-input" rows="2" placeholder="Ej. aderezo aparte, sin cebolla, poca sal...">${slState.comment}</textarea>
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
  inner.querySelector("#slCommentInput").addEventListener("input", (e) => { slState.comment = e.target.value; });
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
      comment: slState.comment,
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
   ENSALADA CHICA (paquete de Comidas)
   Misma funcionalidad del armador de ensaladas, pero fija
   al tamaño chica, con precio de paquete y paso de entrada.
--------------------------------------------------------- */
let ceState = null;

function openComidaEnsaladaBuilder(catKey, itemId) {
  const cat = MENU[catKey];
  const item = cat.items.find((i) => i.id === itemId);
  ceState = {
    catKey, itemId,
    base: SALAD_CONFIG.bases[0], proteinas: [], toppings: [], aderezo: null,
    semillas: [], crutonOQueso: null, pechugaExtra: false, aderezoExtra: false,
    entrada: null, qty: 1, comment: "",
  };
  renderComidaEnsaladaBuilder();
  toggleModal("builderModal", true);
}

function comidaEnsaladaUnitPrice(item) {
  const sc = SALAD_CONFIG.sizes.find(s => s.key === "chica");
  const extraProt = Math.max(0, ceState.proteinas.length - sc.proteinas) * SALAD_CONFIG.extras.proteina;
  const extraTop = Math.max(0, ceState.toppings.length - sc.toppings) * SALAD_CONFIG.extras.toppings;
  const pechuga = ceState.pechugaExtra ? SALAD_CONFIG.extras.pechuga : 0;
  const aderezoExtra = ceState.aderezoExtra ? SALAD_CONFIG.extras.aderezoOCrutones : 0;
  return item.variants[0].price + extraProt + extraTop + pechuga + aderezoExtra;
}

function renderComidaEnsaladaBuilder() {
  const inner = document.getElementById("builderModalInner");
  const cat = MENU[ceState.catKey];
  const item = cat.items.find((i) => i.id === ceState.itemId);
  const sc = SALAD_CONFIG.sizes.find(s => s.key === "chica");

  const chipGroup = (arr, selectedArr, dataAttr) => arr.map(v => {
    const selected = selectedArr.includes(v);
    return `<button class="chip ${selected?"selected":""}" data-${dataAttr}="${v}">${v}</button>`;
  }).join("");

  inner.innerHTML = `
    <button class="modal-x" data-close-builder>✕</button>
    <h2 class="modal-h">${item.name}</h2>
    <p class="modal-p">${SALAD_CONFIG.incluyeNota} Incluye entrada + agua chica.</p>

    <div class="builder-step">
      <h4>Elige tu entrada</h4>
      <div class="chip-group">
        ${cat.entradaOpciones.map(e => `<button class="chip ${ceState.entrada===e?"selected":""}" data-entrada="${e}">${e}</button>`).join("")}
      </div>
    </div>

    <div class="builder-step">
      <h4>Paso 1 · Base</h4>
      <div class="chip-group">
        ${SALAD_CONFIG.bases.map(b => `<button class="chip ${ceState.base===b?"selected":""}" data-base="${b}">${b}</button>`).join("")}
      </div>
    </div>

    <div class="builder-step">
      <h4>Paso 2 · Proteína (${sc.proteinas} incluida, extra +${money(SALAD_CONFIG.extras.proteina)})</h4>
      <div class="chip-group">${chipGroup(SALAD_CONFIG.proteinas, ceState.proteinas, "prot")}</div>
    </div>

    <div class="builder-step">
      <h4>Paso 3 · Toppings (${sc.toppings} incluidos, extra +${money(SALAD_CONFIG.extras.toppings)})</h4>
      <div class="chip-group">${chipGroup(SALAD_CONFIG.toppings, ceState.toppings, "top")}</div>
    </div>

    <div class="builder-step">
      <h4>Paso 4 · Aderezo o vinagreta</h4>
      <div class="chip-group">
        ${SALAD_CONFIG.aderezos.map(a => `<button class="chip ${ceState.aderezo===a?"selected":""}" data-ader="${a}">${a}</button>`).join("")}
      </div>
    </div>

    <div class="builder-step">
      <h4>Paso 5 · Semillas (elige hasta 2)</h4>
      <div class="chip-group">${chipGroup(SALAD_CONFIG.semillas, ceState.semillas, "sem")}</div>
    </div>

    <div class="builder-step">
      <h4>Crutones o queso parmesano</h4>
      <div class="chip-group">
        <button class="chip ${ceState.crutonOQueso==="Crutones"?"selected":""}" data-cq="Crutones">Crutones</button>
        <button class="chip ${ceState.crutonOQueso==="Queso Parmesano"?"selected":""}" data-cq="Queso Parmesano">Queso Parmesano</button>
      </div>
    </div>

    <div class="builder-step">
      <h4>Extras</h4>
      <div class="chip-group">
        <button class="chip ${ceState.pechugaExtra?"selected":""}" id="cePechugaExtraBtn">+ Pechuga extra (${money(SALAD_CONFIG.extras.pechuga)})</button>
        <button class="chip ${ceState.aderezoExtra?"selected":""}" id="ceAderezoExtraBtn">+ Aderezo/crutones extra (${money(SALAD_CONFIG.extras.aderezoOCrutones)})</button>
      </div>
    </div>

    <div class="builder-step">
      <h4>¿Alguna solicitud especial? (opcional)</h4>
      <textarea id="ceCommentInput" class="comment-input" rows="2" placeholder="Ej. sin cebolla, aderezo aparte...">${ceState.comment}</textarea>
    </div>

    <div class="builder-footer">
      <div class="qty-row">
        <button class="qty-btn" id="ceQtyMinus">−</button>
        <span style="font-family:var(--font-mono); font-weight:700;">${ceState.qty}</span>
        <button class="qty-btn" id="ceQtyPlus">+</button>
      </div>
      <div class="builder-price">${money(comidaEnsaladaUnitPrice(item) * ceState.qty)}</div>
      <button class="add-btn" id="ceAddBtn">Agregar</button>
    </div>
  `;

  inner.querySelector("[data-close-builder]").addEventListener("click", () => toggleModal("builderModal", false));
  inner.querySelectorAll("[data-entrada]").forEach((b) => b.addEventListener("click", () => { ceState.entrada = b.dataset.entrada; renderComidaEnsaladaBuilder(); }));
  inner.querySelectorAll("[data-base]").forEach((b) => b.addEventListener("click", () => { ceState.base = b.dataset.base; renderComidaEnsaladaBuilder(); }));
  inner.querySelectorAll("[data-prot]").forEach((b) => b.addEventListener("click", () => { toggleArrItem(ceState.proteinas, b.dataset.prot); renderComidaEnsaladaBuilder(); }));
  inner.querySelectorAll("[data-top]").forEach((b) => b.addEventListener("click", () => { toggleArrItem(ceState.toppings, b.dataset.top); renderComidaEnsaladaBuilder(); }));
  inner.querySelectorAll("[data-ader]").forEach((b) => b.addEventListener("click", () => { ceState.aderezo = b.dataset.ader; renderComidaEnsaladaBuilder(); }));
  inner.querySelectorAll("[data-sem]").forEach((b) => b.addEventListener("click", () => {
    const v = b.dataset.sem;
    const idx = ceState.semillas.indexOf(v);
    if (idx >= 0) ceState.semillas.splice(idx, 1);
    else if (ceState.semillas.length < 2) ceState.semillas.push(v);
    else showToast("Máximo 2 semillas");
    renderComidaEnsaladaBuilder();
  }));
  inner.querySelectorAll("[data-cq]").forEach((b) => b.addEventListener("click", () => { ceState.crutonOQueso = b.dataset.cq; renderComidaEnsaladaBuilder(); }));
  inner.querySelector("#cePechugaExtraBtn").addEventListener("click", () => { ceState.pechugaExtra = !ceState.pechugaExtra; renderComidaEnsaladaBuilder(); });
  inner.querySelector("#ceAderezoExtraBtn").addEventListener("click", () => { ceState.aderezoExtra = !ceState.aderezoExtra; renderComidaEnsaladaBuilder(); });
  inner.querySelector("#ceCommentInput").addEventListener("input", (e) => { ceState.comment = e.target.value; });
  inner.querySelector("#ceQtyMinus").addEventListener("click", () => { ceState.qty = Math.max(1, ceState.qty-1); renderComidaEnsaladaBuilder(); });
  inner.querySelector("#ceQtyPlus").addEventListener("click", () => { ceState.qty += 1; renderComidaEnsaladaBuilder(); });
  inner.querySelector("#ceAddBtn").addEventListener("click", () => {
    if (!ceState.entrada) return showToast("Elige tu entrada");
    if (ceState.proteinas.length === 0) return showToast("Elige al menos 1 proteína");
    if (ceState.toppings.length === 0) return showToast("Elige al menos 1 topping");
    if (!ceState.aderezo) return showToast("Elige un aderezo");
    const details = [
      `Entrada: ${ceState.entrada}`,
      `Base: ${ceState.base}`,
      `Proteína: ${ceState.proteinas.join(", ")}`,
      `Toppings: ${ceState.toppings.join(", ")}`,
      `Aderezo: ${ceState.aderezo}`,
    ];
    if (ceState.semillas.length) details.push(`Semillas: ${ceState.semillas.join(", ")}`);
    if (ceState.crutonOQueso) details.push(ceState.crutonOQueso);
    if (ceState.pechugaExtra) details.push(`Pechuga extra (+${money(SALAD_CONFIG.extras.pechuga)})`);
    if (ceState.aderezoExtra) details.push(`Aderezo/crutones extra (+${money(SALAD_CONFIG.extras.aderezoOCrutones)})`);
    addToCart({
      name: item.name,
      categoryLabel: cat.label,
      unitPrice: comidaEnsaladaUnitPrice(item),
      qty: ceState.qty,
      details,
      comment: ceState.comment,
    });
    toggleModal("builderModal", false);
  });
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
function addToCart({ name, categoryLabel, unitPrice, qty, details, comment }) {
  cart.push({ uid: Date.now() + Math.random(), name, categoryLabel, unitPrice, qty, details, comment: (comment || "").trim() });
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
        ${c.comment ? `<div class="cart-line-comment">💬 ${c.comment}</div>` : ""}
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
    if (c.comment) msg += `\n   💬 ${c.comment}`;
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
