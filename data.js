/* =======================================================
   SABOREAR-T · Datos del menú
   Para editar productos, precios o categorías, modifica
   este archivo directamente.
   ======================================================= */

const WHATSAPP_NUMBER = "5215528578757"; // 52 (México) + 1 + 5528578757

/* ---------- Categorías simples (tarjeta + variantes) ---------- */
/* Cada item: { id, name, desc, variants:[{label, price}], note } */

const MENU = {
  calzones: {
    label: "Calzones",
    emoji: "🥟",
    intro: "Masa de pizza cerrada y horneada, rellena de nuestras especialidades. Porción personal, acompañada de papas o espagueti (blanco o rojo).",
    items: [
      { id: "cal-hawaiano", name: "Calzones Hawaiano", desc: "Salsa de la casa, jamón y piña.", variants: [{ label: "Personal", price: 155 }] },
      { id: "cal-elote", name: "Calzones Elote", desc: "Salsa de la casa, pollo a la plancha en cubos y elote.", variants: [{ label: "Personal", price: 155 }] },
      { id: "cal-champi", name: "Calzones Champiñones", desc: "Salsa de la casa, pollo a la plancha en cubos y champiñones.", variants: [{ label: "Personal", price: 155 }] },
      { id: "cal-poblano", name: "Calzones Poblano", desc: "Crema poblana con pollo a la plancha en cubos.", variants: [{ label: "Personal", price: 155 }] },
      { id: "cal-chipotle", name: "Calzones Chipotle", desc: "Crema de chipotle con pollo a la plancha en cubos.", variants: [{ label: "Personal", price: 155 }] },
    ],
  },

  pastas: {
    label: "Pastas",
    emoji: "🍝",
    intro: "Acompañadas con queso parmesano. Elige preparación con o sin crema, y tu proteína.",
    items: [
      { id: "pas-poblana", name: "Pasta Poblana", desc: "Base crema.", variants: [{ label: "Con proteína", price: 125 }, { label: "Sin proteína", price: 95 }, { label: "Porción personal", price: 50 }, { label: "Boneless", price: 160 }] },
      { id: "pas-chipotle", name: "Pasta Chipotle", desc: "Base crema.", variants: [{ label: "Con proteína", price: 125 }, { label: "Sin proteína", price: 95 }, { label: "Porción personal", price: 50 }, { label: "Boneless", price: 160 }] },
      { id: "pas-crema", name: "Pasta a la crema", desc: "Base crema.", variants: [{ label: "Con proteína", price: 125 }, { label: "Sin proteína", price: 95 }, { label: "Porción personal", price: 50 }, { label: "Boneless", price: 160 }] },
      { id: "pas-casa", name: "Pasta salsa de la casa", desc: "Sin crema.", variants: [{ label: "Con proteína", price: 125 }, { label: "Sin proteína", price: 95 }, { label: "Porción personal", price: 50 }, { label: "Boneless", price: 160 }] },
      { id: "pas-mantequilla", name: "Pasta a la mantequilla", desc: "Sin crema.", variants: [{ label: "Con proteína", price: 125 }, { label: "Sin proteína", price: 95 }, { label: "Porción personal", price: 50 }, { label: "Boneless", price: 160 }] },
      { id: "pas-teriyaki", name: "Pasta Teriyaki", desc: "Con vegetales salteados.", variants: [{ label: "Único", price: 160 }] },
    ],
    proteinaOpciones: ["Salchicha Asadera", "Jamón", "Pollo", "Salchicha Pavo"],
  },

  hamburguesas: {
    label: "Hamburguesas",
    emoji: "🍔",
    intro: "Carne molida fresca de res. Acompañadas con papas o bastones de jícama, zanahoria y pepino. Elige tu pan: ajonjolí o tradicional.",
    items: [
      { id: "ham-clasica", name: "Hamburguesa Clásica", desc: "Carne de res, lechuga, jitomate, queso y tocino.", variants: [{ label: "Sencilla", price: 120 }, { label: "Doble", price: 160 }] },
      { id: "ham-hawaiana", name: "Hamburguesa Hawaiana", desc: "Carne de res, lechuga, jitomate, queso, piña, jamón y tocino.", variants: [{ label: "Sencilla", price: 135 }, { label: "Doble", price: 175 }] },
      { id: "ham-pollo", name: "Hamburguesa Pollo", desc: "Carne molida de pollo, lechuga, jitomate, queso y tocino.", variants: [{ label: "Sencilla", price: 120 }] },
    ],
    extraChoice: { label: "Elige tu pan", options: ["Ajonjolí", "Tradicional"] },
  },

  alitas: {
    label: "Alitas",
    emoji: "🍗",
    intro: "Montadas sobre base de ensalada, bañadas en salsa y acompañadas con papas. Orden de 5 piezas.",
    items: [
      { id: "ali-blueberry", name: "Alitas Blueberry Morita", desc: "", variants: [{ label: "Orden de 5", price: 130 }] },
      { id: "ali-tamarindo", name: "Alitas Tamarindo Chipotle", desc: "", variants: [{ label: "Orden de 5", price: 130 }] },
      { id: "ali-buffalo", name: "Alitas Buffalo", desc: "", variants: [{ label: "Orden de 5", price: 130 }] },
      { id: "ali-mango", name: "Alitas Mango Habanero", desc: "", variants: [{ label: "Orden de 5", price: 130 }] },
      { id: "ali-bbq", name: "Alitas BBQ", desc: "", variants: [{ label: "Orden de 5", price: 130 }] },
      { id: "ali-teriyaki", name: "Alitas Teriyaki", desc: "", variants: [{ label: "Orden de 5", price: 130 }] },
    ],
  },

  comidas: {
    label: "Comidas",
    emoji: "🍽️",
    intro: "Los paquetes incluyen una entrada (pasta, crema o consomé) y una agua chica del sabor del día.",
    items: [
      { id: "com-pechuga-paq", name: "Pechuga asada o empanizada", desc: "Con ensalada y papas fritas. Incluye entrada + agua.", variants: [{ label: "Paquete", price: 135 }] },
      { id: "com-enchiladas-verdes", name: "Orden de 4 enchiladas verdes", desc: "Rellenas de pollo, con crema, queso y cebolla. Incluye entrada + agua.", variants: [{ label: "Paquete", price: 135 }] },
      { id: "com-chilaquiles", name: "Chilaquiles verdes", desc: "Con pollo desmenuzado, crema, queso y cebolla. Incluye entrada + agua.", variants: [{ label: "Paquete", price: 135 }] },
      { id: "com-alambre", name: "Alambre de pollo", desc: "Con morrón, cebolla, queso, pepino, jitomate y tortillas de harina. Incluye entrada + agua.", variants: [{ label: "Paquete", price: 155 }] },
      { id: "com-ensalada-chica", name: "Ensalada chica (paquete)", desc: "Ármala a tu gusto como una ensalada chica. Incluye entrada + agua.", variants: [{ label: "Paquete", price: 155 }] },
      { id: "com-porcion-extra", name: "Extra porción personal", desc: "Consomé, crema o pasta.", variants: [{ label: "Porción", price: 50 }] },
      { id: "com-pechuga-sola", name: "Pechuga empanizada (sin paquete)", desc: "Con ensalada o espagueti.", variants: [{ label: "Individual", price: 90 }] },
      { id: "com-suizas", name: "Enchiladas Suizas (sin paquete)", desc: "Rellenas de pollo, bañadas en salsa verde y gratinadas.", variants: [{ label: "Individual", price: 115 }] },
    ],
  },

  antojos: {
    label: "Antojos",
    emoji: "🍟",
    intro: "Para picar. Aderezo extra $18.",
    items: [
      { id: "ant-papas-queso", name: "Papas fritas con queso amarillo", desc: "", variants: [{ label: "Orden", price: 75 }] },
      { id: "ant-nuggets", name: "Mix de nuggets con papas", desc: "", variants: [{ label: "Orden", price: 95 }] },
      { id: "ant-boneless", name: "Boneless con papas", desc: "", variants: [{ label: "Orden", price: 165 }] },
      { id: "ant-hotdog", name: "Hotdog con papas", desc: "", variants: [{ label: "Orden", price: 90 }] },
      { id: "ant-dedos-queso", name: "Dedos de queso", desc: "", variants: [{ label: "Orden", price: 125 }] },
      { id: "ant-aros", name: "Aros de cebolla", desc: "", variants: [{ label: "Orden", price: 75 }] },
    ],
  },

  club: {
    label: "Club",
    emoji: "🥪",
    items: [
      { id: "clu-sincronizadas", name: "Sincronizadas", desc: "Acompañadas con pico de gallo.", variants: [{ label: "Orden 2 pzas.", price: 45 }] },
      { id: "clu-molletes", name: "Molletes", desc: "Jamón o salchicha, acompañados con pico de gallo.", variants: [{ label: "Orden 2 pzas.", price: 45 }] },
      { id: "clu-sandwich", name: "Sándwich", desc: "Jamón, queso, lechuga, jitomate, chiles en vinagre. Pan integral o blanco.", variants: [{ label: "Individual", price: 60 }] },
    ],
  },
};

/* Orden de navegación (incluye las categorías con armador especial) */
const CATEGORY_ORDER = ["pizzas", "calzones", "pastas", "ensaladas", "hamburguesas", "alitas", "comidas", "antojos", "club"];
const CATEGORY_META = {
  pizzas: { label: "Pizzas", emoji: "🍕", type: "pizza" },
  ensaladas: { label: "Ensaladas", emoji: "🥗", type: "salad" },
};

/* ---------- Armador de Pizza ---------- */
const PIZZA_CONFIG = {
  sizes: [
    { key: "chica", label: "Pizza Chica 25cm" },
    { key: "mediana", label: "Pizza Mediana 35cm" },
    { key: "grande", label: "Pizza Grande 40cm" },
    { key: "mega", label: "Pizza Mega 45cm" },
  ],
  /* Cuántas secciones se pueden elegir según el tamaño, y cómo se llama cada opción */
  partsOptions: { chica: [1], mediana: [1, 2], grande: [1, 2], mega: [1, 2, 3, 4] },
  partLabels: { 1: "Pizza completa", 2: "Mitad y Mitad", 3: "En tercios", 4: "En cuartos" },
  /* Cada sección admite hasta 2 ingredientes tradicionales, o 1 receta de especialidad */
  maxIngredientesPorSeccion: 2,
  tradicional: {
    prices: { chica: 90, mediana: 200, grande: 240, mega: 320 },
    ingredientes: ["Hawaiana", "Pepperoni", "Pollo", "Atún", "Jamón", "Tocino", "Champiñones", "Salchicha de Pavo o Asadera", "Molida de Res", "Elote", "Pimiento", "Piña", "Aguacate", "PopCorn Chicken"],
  },
  especialidad: {
    prices: { chica: 110, mediana: 240, grande: 280, mega: 380 },
    recetas: [
      { name: "Cochinita", desc: "Base de frijoles con nuestra exquisita cochinita." },
      { name: "Mexicana", desc: "Base de frijoles acompañada de longaniza, salchicha y aguacate." },
      { name: "Espinaca", desc: "Combinación cremosa de espinacas con queso Philadelphia, jamón y tocino." },
      { name: "Poblana", desc: "Crema poblana con toque de queso Philadelphia, pollo a la plancha en cubos." },
      { name: "Chipotle", desc: "Crema de chipotle con toque de queso Philadelphia, pollo a la plancha en cubos." },
      { name: "K-Carni", desc: "Carne molida, salchicha, tocino, pimiento y champiñones." },
      { name: "K-Vegi", desc: "Pimiento, elote, champiñones y jitomate cherry." },
      { name: "Boneless", desc: "Base de salsa de la casa con boneless y una salsa: tamarindo chipotle, mango habanero, búfalo o blueberry." },
      { name: "Hawaiana", desc: "Base de salsa de la casa con queso, piña y jamón." },
    ],
  },
  /* Precio cuando una pizza dividida combina secciones de distinto tipo */
  mixtaPrices: { mediana: 220, grande: 260, mega: 350 },
  nota: "Chica: sin división, hasta 2 ingredientes en tradicional o 1 sabor en especialidad. Mediana y Grande: se pueden dividir en 2 secciones. Mega: se puede dividir en 2, 3 o 4 secciones. Cada sección admite hasta 2 ingredientes (tradicional) o 1 receta (especialidad). En Mega, si la mayoría de las secciones son de especialidad se cobra precio de especialidad; de lo contrario se cobra el precio de pizza mixta.",
};

/* ---------- Armador de Ensalada ---------- */
const SALAD_CONFIG = {
  sizes: [
    { key: "chica", label: "Ensalada Chica", price: 95, proteinas: 1, toppings: 2 },
    { key: "mediana", label: "Ensalada Mediana", price: 120, proteinas: 1, toppings: 3 },
    { key: "grande", label: "Ensalada Grande", price: 160, proteinas: 2, toppings: 4 },
  ],
  bases: ["Base Lechuga", "Base Lechuga y Espinaca"],
  proteinas: ["Queso Panela", "Pollo", "Atún", "Manchego", "Jamón de Pavo", "Salchicha de Pavo", "Huevo Duro"],
  toppings: ["Elote", "Zanahoria", "Pimiento", "Brócoli", "Pepino", "Piña", "Jícama", "Fresa", "Uva", "Pera", "Jitomate Cherry", "Manzana", "Tallarines"],
  aderezos: ["Ranch", "Mil Islas", "Miel Mostaza", "César", "Vinagreta de Hierbas Finas", "Italiano"],
  semillas: ["Ajonjolí Sabores", "Almendra", "Arándano", "Fruta Mixta", "Semilla de Girasol Caramelizada", "Semilla de Girasol Salada", "Nuez", "Churritos de Nopal", "Semilla Mixta", "Cacahuate", "Pepitas"],
  extras: { aderezoOCrutones: 18, proteina: 35, pechuga: 50, toppings: 30 },
  incluyeNota: "Cada ensalada se acompaña con 2 semillas, 1 aderezo y crutones o queso parmesano.",
};
