/* ===== Menú — app de menú semanal =====
   Sin servidor: todo vive en localStorage del dispositivo. */
(() => {
  'use strict';

  const STORE_KEY = 'menu-v1';

  const MEALS = [
    { key: 'desayuno', label: 'Desayuno', icon: '🌅' },
    { key: 'comida',   label: 'Comida',   icon: '🍽️' },
    { key: 'cena',     label: 'Cena',     icon: '🌙' },
  ];
  const MEAL_LABEL = { desayuno: 'Desayuno', comida: 'Comida', cena: 'Cena' };

  /* Pasillos del súper, en el orden en el que se suele recorrer la tienda. */
  const SECCIONES = [
    { key: 'fruta',     label: 'Frutería y verdura',   icon: '🥬' },
    { key: 'carne',     label: 'Carnicería',           icon: '🥩' },
    { key: 'pescado',   label: 'Pescadería',           icon: '🐟' },
    { key: 'charcu',    label: 'Charcutería y quesos', icon: '🧀' },
    { key: 'lacteos',   label: 'Lácteos y huevos',     icon: '🥛' },
    { key: 'pan',       label: 'Panadería',            icon: '🥖' },
    { key: 'despensa',  label: 'Despensa',             icon: '🥫' },
    { key: 'congelado', label: 'Congelados',           icon: '🧊' },
    { key: 'bebida',    label: 'Bebidas',              icon: '🧃' },
    { key: 'drogueria', label: 'Droguería',            icon: '🧻' },
    { key: 'otros',     label: 'Otros',                icon: '🛒' },
  ];
  const SECCION = Object.fromEntries(SECCIONES.map(s => [s.key, s]));

  /* Palabras clave por pasillo, siempre sin acentos y en minúsculas.
     Gana siempre la coincidencia más larga: "atun en lata" va a despensa
     aunque "atun" esté en pescadería. */
  const CLAVES_POR_SECCION = {
    fruta: ['lechuga', 'tomate', 'cebolla', 'ajo', 'patata', 'patatas', 'zanahoria', 'pimiento',
      'calabacin', 'berenjena', 'brocoli', 'coliflor', 'judia verde', 'judias verdes', 'acelgas',
      'espinacas', 'puerro', 'champinon', 'champinones', 'setas', 'aguacate', 'limon', 'lima',
      'naranja', 'mandarina', 'platano', 'manzana', 'pera', 'fresa', 'fresas', 'uva', 'uvas',
      'melon', 'sandia', 'kiwi', 'pina', 'pepino', 'apio', 'calabaza', 'esparragos', 'alcachofa',
      'alcachofas', 'guisantes', 'rucula', 'canonigos', 'perejil', 'cilantro', 'jengibre', 'col',
      'repollo', 'nabo', 'remolacha', 'boniato', 'brotes', 'albahaca', 'hierbabuena',
      'verdura', 'verduras', 'hortalizas', 'ensalada', 'fruta'],

    carne: ['pollo', 'pechuga', 'muslo', 'alitas', 'ternera', 'cerdo', 'lomo', 'solomillo',
      'filete', 'filetes', 'carne', 'carne picada', 'albondigas', 'costilla', 'costillas',
      'chuleta', 'chuletas', 'pavo', 'conejo', 'cordero', 'hamburguesa', 'hamburguesas',
      'secreto', 'higado'],

    pescado: ['salmon', 'merluza', 'bacalao', 'lubina', 'dorada', 'rape', 'gambas',
      'langostinos', 'mejillones', 'almejas', 'calamares', 'chipirones', 'pulpo', 'sepia',
      'boquerones', 'lenguado', 'rodaballo', 'trucha', 'pescado', 'marisco',
      'surimi', 'palitos de cangrejo', 'atun fresco', 'lomo de atun'],

    charcu: ['jamon', 'jamon serrano', 'jamon york', 'jamon cocido', 'chorizo', 'salchichon',
      'lomo embuchado', 'bacon', 'salchicha', 'salchichas', 'fuet', 'mortadela', 'fiambre',
      'longaniza', 'morcilla', 'sobrasada', 'panceta', 'chistorra', 'txistorra', 'pate',
      'queso', 'queso rallado', 'mozzarella', 'parmesano', 'cheddar'],

    lacteos: ['leche', 'yogur', 'yogures', 'nata', 'mantequilla', 'margarina', 'queso fresco',
      'requeson', 'cuajada', 'huevo', 'huevos', 'kefir', 'batido', 'flan', 'natillas'],

    pan: ['pan', 'pan de molde', 'barra de pan', 'baguette', 'bollo', 'croissant', 'magdalenas',
      'tostadas', 'biscotes', 'tortillas de trigo', 'masa de pizza', 'hojaldre', 'empanada',
      'bizcocho', 'chapata'],

    despensa: ['arroz', 'arroz de sushi', 'pasta', 'macarrones', 'espaguetis', 'fideos', 'harina',
      'azucar', 'sal', 'aceite', 'aceite de oliva', 'vinagre', 'vinagre de arroz', 'especias',
      'pimienta', 'oregano', 'comino', 'pimenton', 'curry', 'wasabi', 'caldo', 'tomate frito',
      'tomate triturado', 'atun', 'atun en lata', 'sardinas', 'anchoas', 'bonito', 'conserva',
      'conservas', 'maiz', 'garbanzos', 'lentejas', 'alubias', 'judias blancas', 'legumbres',
      'soja', 'salsa de soja', 'alga nori', 'sesamo', 'cereales', 'cafe', 'te verde', 'infusion',
      'cacao', 'chocolate', 'mermelada', 'miel', 'frutos secos', 'nueces', 'almendras',
      'aceitunas', 'pepinillos', 'mayonesa', 'ketchup', 'mostaza', 'pan rallado', 'levadura',
      'galletas', 'patatas fritas', 'leche condensada'],

    congelado: ['congelado', 'congelados', 'menestra', 'verduras de menestra', 'helado', 'pizza',
      'pizza congelada', 'edamame', 'varitas', 'croquetas', 'empanadillas', 'gulas',
      'guisantes congelados'],

    bebida: ['agua', 'vino', 'cerveza', 'refresco', 'zumo', 'cola', 'tonica', 'sidra', 'cava',
      'champan', 'bebida', 'bebidas'],

    drogueria: ['papel de cocina', 'papel higienico', 'papel de aluminio', 'film', 'detergente',
      'lavavajillas', 'suavizante', 'bolsas de basura', 'estropajo', 'lejia', 'friegasuelos',
      'servilletas', 'bayeta', 'jabon', 'champu', 'gel', 'desodorante', 'pasta de dientes'],
  };

  /* Se compila una vez: clave más larga primero y con límites de palabra,
     para que "pan" no se coma "empanada". */
  const REGLAS_PASILLO = Object.entries(CLAVES_POR_SECCION)
    .flatMap(([sec, claves]) => claves.map(c => ({ sec, clave: c })))
    .sort((a, b) => b.clave.length - a.clave.length)
    .map(r => ({
      sec: r.sec,
      /* El "(es|s)?" del final hace que "limon" case también con "limones". */
      re: new RegExp('\\b' + r.clave.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?:es|s)?\\b'),
    }));

  const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

  /* Platos de arranque: se cargan solo la primera vez. */
  const SEED = [
    ['Café con tostadas',      ['desayuno'],         'pan, aceite, tomate, café'],
    ['Cereales con leche',     ['desayuno'],         'cereales, leche'],
    ['Yogur con fruta',        ['desayuno'],         'yogur, plátano, nueces'],
    ['Menestra',               ['comida'],           'verduras de menestra, jamón, ajo'],
    ['Salchichas',             ['comida', 'cena'],   'salchichas, patatas'],
    ['Albóndigas',             ['comida'],           'albóndigas, tomate frito, arroz'],
    ['Atún con arroz',         ['comida', 'cena'],   'arroz, atún en lata, tomate'],
    ['Pasta con bacon y setas',['comida'],           'pasta, bacon, setas, nata'],
    ['Acelgas',                ['comida'],           'acelgas, patata, ajo'],
    ['Garbanzos',              ['comida'],           'garbanzos, chorizo, verdura'],
    ['Ensalada de lechuga',    ['comida', 'cena'],   'lechuga, tomate, cebolla, atún'],
    ['Ensalada de pasta',      ['comida', 'cena'],   'pasta, atún, maíz, tomate, huevo'],
    ['Poke',                   ['comida', 'cena'],   'arroz, salmón, aguacate, edamame, soja'],
    ['Sushi',                  ['comida', 'cena'],   'arroz de sushi, salmón, alga nori, aguacate'],
    ['Pollo con verduras',     ['comida', 'cena'],   'pollo, pimiento, cebolla, calabacín'],
    ['Verduras al vapor',      ['cena'],             'brócoli, zanahoria, judía verde'],
    ['Ternera con patatas',    ['comida'],           'ternera, patatas, cebolla'],
    ['Sopa',                   ['cena'],             'caldo, fideos, zanahoria'],
  ];

  /* ===== Utilidades ===== */

  const $ = sel => document.querySelector(sel);
  const uid = () => 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

  function esc(s) {
    return String(s).replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function parseIng(txt) {
    return String(txt || '').split(/[,\n;]/).map(s => s.trim()).filter(Boolean);
  }

  const pad = n => String(n).padStart(2, '0');
  const iso = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());

  function parseISO(s) {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  const todayISO = () => iso(new Date());

  function addDays(dateISO, n) {
    const d = parseISO(dateISO);
    d.setDate(d.getDate() + n);
    return iso(d);
  }

  /* Lunes de la semana a la que pertenece la fecha. */
  function startOfWeek(dateISO) {
    const d = parseISO(dateISO);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return iso(d);
  }

  function dayLabel(dateISO) {
    const d = parseISO(dateISO);
    return cap(DIAS[d.getDay()]) + ' ' + d.getDate() + ' ' + MESES[d.getMonth()];
  }

  function weekLabel(fromISO, toISO) {
    const a = parseISO(fromISO), b = parseISO(toISO);
    const mesA = MESES[a.getMonth()], mesB = MESES[b.getMonth()];
    return mesA === mesB
      ? `${a.getDate()} – ${b.getDate()} ${mesB}`
      : `${a.getDate()} ${mesA} – ${b.getDate()} ${mesB}`;
  }

  /* ===== Estado ===== */

  let state = load();
  let curDate = todayISO();
  let curWeek = startOfWeek(todayISO());
  let platoFilter = '';
  let pickerCtx = null;   // { date, meal, all, q }

  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data && Array.isArray(data.platos)) {
          data.menu = data.menu || {};
          data.compra = data.compra || {};
          data.pasillos = data.pasillos || {};
          return data;
        }
      }
    } catch (e) {
      /* Datos corruptos: se tiran y se arranca de cero, para no reintentar
         leerlos en cada arranque. */
      try { localStorage.removeItem(STORE_KEY); } catch (e2) { /* nada que hacer */ }
    }

    return {
      version: 1,
      platos: SEED.map(([nombre, tipos, ing]) => ({
        id: uid(), nombre, tipos, ingredientes: parseIng(ing), nota: '',
      })),
      menu: {},
      compra: {},
      pasillos: {},
    };
  }

  function save() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch (e) {
      toast('No se han podido guardar los datos');
    }
  }

  /* ===== Acceso al menú ===== */

  const plato = id => state.platos.find(p => p.id === id) || null;

  function slot(dateISO, meal) {
    const dia = state.menu[dateISO];
    return dia && dia[meal] ? dia[meal] : null;
  }

  function setSlot(dateISO, meal, platoId) {
    if (!state.menu[dateISO]) state.menu[dateISO] = {};

    if (platoId) state.menu[dateISO][meal] = platoId;
    else delete state.menu[dateISO][meal];

    if (!Object.keys(state.menu[dateISO]).length) delete state.menu[dateISO];
    save();
  }

  /* Última fecha (en ms) en la que salió el plato; 0 si nunca. */
  function lastUsed(id) {
    let best = '';
    for (const [fecha, slots] of Object.entries(state.menu)) {
      if (fecha > best && Object.values(slots).includes(id)) best = fecha;
    }
    return best ? parseISO(best).getTime() : 0;
  }

  function weekDays() {
    return Array.from({ length: 7 }, (_, i) => addDays(curWeek, i));
  }

  /* ===== Vista: Hoy ===== */

  const hoyMeals = $('#hoy-meals');
  const dateText = $('#date-text');

  function renderHoy() {
    const esHoy = curDate === todayISO();
    dateText.textContent = (esHoy ? 'Hoy · ' : '') + dayLabel(curDate);

    hoyMeals.innerHTML = MEALS.map(m => {
      const p = plato(slot(curDate, m.key));
      return `<button class="card meal-card${p ? '' : ' empty'}" data-meal="${m.key}">
        <div class="meal-top">
          <span class="meal-icon">${m.icon}</span>
          <span class="meal-label">${m.label}</span>
        </div>
        <div class="meal-plato">${p ? esc(p.nombre) : 'Sin plan'}</div>
        ${p && p.ingredientes.length ? `<div class="meal-ing">${esc(p.ingredientes.join(' · '))}</div>` : ''}
        ${p && p.nota ? `<div class="meal-nota">${esc(p.nota)}</div>` : ''}
      </button>`;
    }).join('');
  }

  hoyMeals.addEventListener('click', ev => {
    const card = ev.target.closest('.meal-card');
    if (card) openPicker(curDate, card.dataset.meal);
  });

  $('#btn-prev-day').addEventListener('click', () => { curDate = addDays(curDate, -1); renderHoy(); });
  $('#btn-next-day').addEventListener('click', () => { curDate = addDays(curDate, 1); renderHoy(); });
  $('#btn-today').addEventListener('click', () => { curDate = todayISO(); renderHoy(); });

  /* ===== Vista: Semana ===== */

  const semanaDays = $('#semana-days');
  const weekText = $('#week-text');

  function renderSemana() {
    const days = weekDays();
    weekText.textContent = weekLabel(days[0], days[6]);

    /* Cuántas veces sale cada plato esta semana, para avisar de repeticiones. */
    const veces = {};
    days.forEach(ds => MEALS.forEach(m => {
      const id = slot(ds, m.key);
      if (id) veces[id] = (veces[id] || 0) + 1;
    }));

    const hoy = todayISO();

    semanaDays.innerHTML = days.map(ds => {
      const d = parseISO(ds);
      const filas = MEALS.map(m => {
        const p = plato(slot(ds, m.key));
        return `<button class="day-row${p ? '' : ' empty'}" data-date="${ds}" data-meal="${m.key}">
          <span class="day-icon">${m.icon}</span>
          <span class="day-plato">${p ? esc(p.nombre) : '—'}</span>
          ${p && veces[p.id] > 1 ? '<span class="repeat" title="Se repite esta semana">↻</span>' : ''}
        </button>`;
      }).join('');

      return `<div class="card day-card${ds === hoy ? ' today' : ''}">
        <div class="day-head">${cap(DIAS[d.getDay()])} <span class="day-num">${d.getDate()}</span></div>
        ${filas}
      </div>`;
    }).join('');
  }

  semanaDays.addEventListener('click', ev => {
    const row = ev.target.closest('.day-row');
    if (row) openPicker(row.dataset.date, row.dataset.meal);
  });

  /* La semana es la misma en Semana y en Compra: moverla actualiza las dos. */
  function setWeek(lunesISO) {
    curWeek = lunesISO;
    renderSemana();
    renderCompra();
  }

  $('#btn-prev-week').addEventListener('click', () => setWeek(addDays(curWeek, -7)));
  $('#btn-next-week').addEventListener('click', () => setWeek(addDays(curWeek, 7)));
  $('#btn-this-week').addEventListener('click', () => setWeek(startOfWeek(todayISO())));

  $('#btn-prev-week-c').addEventListener('click', () => setWeek(addDays(curWeek, -7)));
  $('#btn-next-week-c').addEventListener('click', () => setWeek(addDays(curWeek, 7)));
  $('#btn-this-week-c').addEventListener('click', () => setWeek(startOfWeek(todayISO())));

  $('#btn-copy-week').addEventListener('click', () => {
    const days = weekDays();
    const tieneAlgo = days.some(ds => state.menu[ds]);

    if (tieneAlgo && !confirm('Se sustituye lo que haya en esta semana por la semana anterior. ¿Seguir?')) return;

    let copiados = 0;
    days.forEach(ds => {
      const origen = state.menu[addDays(ds, -7)];
      if (origen) { state.menu[ds] = Object.assign({}, origen); copiados++; }
      else delete state.menu[ds];
    });

    save();
    renderSemana();
    toast(copiados ? 'Semana copiada' : 'La semana anterior está vacía');
  });

  $('#btn-fill-week').addEventListener('click', () => {
    const days = weekDays();
    const usados = new Set();

    days.forEach(ds => MEALS.forEach(m => {
      const id = slot(ds, m.key);
      if (id) usados.add(id);
    }));

    let puestos = 0;
    days.forEach(ds => MEALS.forEach(m => {
      if (slot(ds, m.key)) return;

      const delTipo = state.platos.filter(p => p.tipos.includes(m.key));
      const frescos = delTipo.filter(p => !usados.has(p.id));
      const pool = frescos.length ? frescos : delTipo;
      if (!pool.length) return;

      /* El que lleva más tiempo sin salir. */
      pool.sort((a, b) => lastUsed(a.id) - lastUsed(b.id));
      setSlot(ds, m.key, pool[0].id);
      usados.add(pool[0].id);
      puestos++;
    }));

    renderSemana();
    toast(puestos ? `${puestos} hueco${puestos > 1 ? 's' : ''} rellenado${puestos > 1 ? 's' : ''}` : 'No había huecos');
  });

  $('#btn-clear-week').addEventListener('click', () => {
    if (!confirm('¿Vaciar toda la semana?')) return;

    weekDays().forEach(ds => { delete state.menu[ds]; });
    delete state.compra[curWeek];
    save();
    renderSemana();
    renderCompra();
    toast('Semana vaciada');
  });

  /* ===== Vista: Compra ===== */

  const shopPending = $('#shop-pending');
  const shopDone = $('#shop-done');
  const extraInput = $('#extra-input');

  const norm = s => s.toLowerCase().trim();

  /* Datos de la compra de la semana que se está mirando. Solo se crean al escribir. */
  function compraWeek(crear) {
    let c = state.compra[curWeek];

    if (!c && crear) {
      c = { marcados: {}, extras: [] };
      state.compra[curWeek] = c;
    }
    return c || { marcados: {}, extras: [] };
  }

  /* Ingredientes de los platos de la semana, sin repetir, con los platos de los que salen. */
  function ingredientesSemana() {
    const mapa = new Map();

    weekDays().forEach(ds => MEALS.forEach(m => {
      const p = plato(slot(ds, m.key));
      if (!p) return;

      p.ingredientes.forEach(ing => {
        const k = claveIng(ing);
        if (!k) return;

        if (!mapa.has(k)) mapa.set(k, { key: k, txt: ing, platos: new Set() });

        const e = mapa.get(k);
        /* Si el mismo ingrediente viene escrito de dos formas, se enseña la más
           larga: en una lista de la compra pega más "patatas" que "patata". */
        if (ing.length > e.txt.length) e.txt = ing;

        e.platos.add(p.nombre);
      });
    }));

    return [...mapa.values()]
      .map(x => ({ key: x.key, txt: x.txt, platos: [...x.platos], extra: false }))
      .sort((a, b) => a.txt.localeCompare(b.txt, 'es'));
  }

  /* Todo lo que va en la lista: ingredientes de la semana + lo añadido a mano. */
  function itemsCompra() {
    const c = compraWeek(false);
    const extras = c.extras.map(e => ({
      key: 'x:' + e.id, ingKey: claveIng(e.txt), txt: e.txt, platos: [], extra: true, id: e.id,
    }));
    return ingredientesSemana().map(i => Object.assign({ ingKey: i.key }, i)).concat(extras);
  }

  const sinAcentos = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '');

  /* Raíz de una palabra: se le quita el plural y la "e" final, para que las dos
     formas acaben igual ("tomate" y "tomates" → "tomat"). No pretende ser un
     singular correcto, solo una clave estable para agrupar. */
  function raiz(w) {
    if (w.length >= 5 && w.endsWith('ces')) return w.slice(0, -3) + 'z';   // nueces → nuez

    if (w.length >= 4 && w.endsWith('s')) w = w.slice(0, -1);              // patatas → patata
    if (w.length >= 4 && w.endsWith('e')) w = w.slice(0, -1);              // tomate → tomat

    return w;
  }

  /* Clave con la que se agrupa un ingrediente en la lista de la compra:
     sin acentos y sin singular/plural, para que "patata" y "patatas" sean
     la misma línea. El texto que se muestra es aparte. */
  function claveIng(txt) {
    return sinAcentos(norm(txt)).split(/\s+/).filter(Boolean).map(raiz).join(' ');
  }

  /* Pasillo de un ingrediente: primero lo que haya dicho el usuario, luego el
     diccionario. El ajuste manual va por clave agrupada (así vale para singular
     y plural), pero el diccionario se busca sobre el texto de verdad: su raíz
     ("tomat") no casaría con ninguna palabra clave. */
  function pasilloDe(ingKey, txt) {
    if (state.pasillos[ingKey]) return state.pasillos[ingKey];

    const limpio = sinAcentos(norm(txt));
    const regla = REGLAS_PASILLO.find(r => r.re.test(limpio));
    return regla ? regla.sec : 'otros';
  }

  /* Agrupa por pasillo respetando el orden de SECCIONES. */
  function agruparPorPasillo(items) {
    const grupos = new Map();

    items.forEach(i => {
      const sec = pasilloDe(i.ingKey, i.txt);
      if (!grupos.has(sec)) grupos.set(sec, []);
      grupos.get(sec).push(i);
    });

    return SECCIONES
      .filter(s => grupos.has(s.key))
      .map(s => ({ seccion: s, items: grupos.get(s.key) }));
  }

  function filaCompra(item, marcado) {
    const sec = SECCION[pasilloDe(item.ingKey, item.txt)];

    return `<li>
      <div class="shop-row${marcado ? ' on' : ''}" data-key="${esc(item.key)}" data-ing="${esc(item.ingKey)}">
        <span class="shop-box">${marcado ? '✓' : ''}</span>
        <span class="shop-main">
          <span class="shop-txt">${esc(item.txt)}</span>
          ${item.platos.length ? `<span class="shop-src">${esc(item.platos.join(' · '))}</span>` : ''}
          ${item.extra ? '<span class="shop-src">añadido a mano</span>' : ''}
        </span>
        ${editPasillos ? `<span class="shop-pasillo">${esc(sec.label)}</span>` : ''}
        ${item.extra && !editPasillos ? `<button class="shop-del" data-del="${esc(item.id)}" aria-label="Quitar">×</button>` : ''}
      </div>
    </li>`;
  }

  function renderCompra() {
    $('#compra-week-text').textContent = weekLabel(curWeek, addDays(curWeek, 6));

    const c = compraWeek(false);
    const items = itemsCompra();
    const pendientes = items.filter(i => !c.marcados[i.key]);
    const hechos = items.filter(i => c.marcados[i.key]);

    $('#compra-count').textContent = items.length ? `${hechos.length} de ${items.length}` : '';
    $('#pasillos-hint').hidden = !editPasillos;

    shopPending.innerHTML = pendientes.length
      ? agruparPorPasillo(pendientes).map(g => `<div class="shop-group">
          <div class="shop-group-head">
            <span>${g.seccion.icon}</span><span>${esc(g.seccion.label)}</span>
            <span class="shop-group-n">${g.items.length}</span>
          </div>
          <ul class="shop-list">${g.items.map(i => filaCompra(i, false)).join('')}</ul>
        </div>`).join('')
      : `<p class="empty-msg">${items.length
          ? '¡Todo cogido!'
          : 'Sin platos esta semana. Planifica la semana y aquí sale la compra.'}</p>`;

    $('#shop-done-head').hidden = !hechos.length;
    shopDone.innerHTML = hechos.map(i => filaCompra(i, true)).join('');
  }

  /* ===== Cambiar un producto de pasillo ===== */

  let editPasillos = false;

  $('#btn-edit-pasillos').addEventListener('click', () => {
    editPasillos = !editPasillos;

    const btn = $('#btn-edit-pasillos');
    btn.textContent = editPasillos ? 'Listo' : 'Editar pasillos';
    btn.classList.toggle('secondary', !editPasillos);

    renderCompra();
  });

  function openPasilloPicker(ingKey, txt) {
    const actual = pasilloDe(ingKey, txt);
    const aMano = !!state.pasillos[ingKey];

    openSheet(`
      <div class="sheet-title">${esc(txt)}</div>
      <ul class="sec-list" id="sec-list">
        ${SECCIONES.map(s => `<li data-sec="${s.key}"${s.key === actual ? ' class="sel"' : ''}>
          <span>${s.icon}</span><span>${esc(s.label)}</span>
        </li>`).join('')}
      </ul>
      ${aMano ? '<div class="sheet-actions"><button class="btn secondary" id="sec-reset">Volver al automático</button></div>' : ''}
    `);

    $('#sec-list').addEventListener('click', ev => {
      const li = ev.target.closest('li[data-sec]');
      if (!li) return;

      state.pasillos[ingKey] = li.dataset.sec;
      save();
      closeSheet();
      renderCompra();
      toast(`A ${SECCION[li.dataset.sec].label}`);
    });

    if (aMano) {
      $('#sec-reset').addEventListener('click', () => {
        delete state.pasillos[ingKey];
        save();
        closeSheet();
        renderCompra();
        toast('Pasillo automático');
      });
    }
  }

  function toggleCompra(key) {
    const c = compraWeek(true);

    if (c.marcados[key]) delete c.marcados[key];
    else c.marcados[key] = true;

    save();
    renderCompra();
  }

  function onShopClick(ev) {
    const fila = ev.target.closest('.shop-row');

    if (editPasillos) {
      if (fila) openPasilloPicker(fila.dataset.ing, fila.querySelector('.shop-txt').textContent);
      return;
    }

    const del = ev.target.closest('[data-del]');
    if (del) {
      const c = compraWeek(true);
      c.extras = c.extras.filter(e => e.id !== del.dataset.del);
      delete c.marcados['x:' + del.dataset.del];
      save();
      renderCompra();
      return;
    }

    const row = ev.target.closest('.shop-row');
    if (row) toggleCompra(row.dataset.key);
  }

  shopPending.addEventListener('click', onShopClick);
  shopDone.addEventListener('click', onShopClick);

  function addExtra() {
    const txt = extraInput.value.trim();
    if (!txt) return;

    const c = compraWeek(true);
    c.extras.push({ id: uid(), txt });
    save();

    extraInput.value = '';
    renderCompra();
    extraInput.focus();
  }

  $('#btn-add-extra').addEventListener('click', addExtra);

  extraInput.addEventListener('keydown', ev => {
    if (ev.key === 'Enter') { ev.preventDefault(); addExtra(); }
  });

  $('#btn-uncheck-all').addEventListener('click', () => {
    const c = compraWeek(true);
    c.marcados = {};
    save();
    renderCompra();
    toast('Lista desmarcada');
  });

  $('#btn-copy-list').addEventListener('click', () => {
    const c = compraWeek(false);
    const pendientes = itemsCompra().filter(i => !c.marcados[i.key]);

    if (!pendientes.length) { toast('No queda nada por comprar'); return; }

    const texto = `Compra ${weekLabel(curWeek, addDays(curWeek, 6))}\n\n`
      + agruparPorPasillo(pendientes)
        .map(g => `${g.seccion.icon} ${g.seccion.label.toUpperCase()}\n`
          + g.items.map(i => '- ' + i.txt).join('\n'))
        .join('\n\n');

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto)
        .then(() => toast('Lista copiada'))
        .catch(() => copiarAPelo(texto));
    } else {
      copiarAPelo(texto);
    }
  });

  /* Respaldo para navegadores o contextos donde la API de portapapeles no va. */
  function copiarAPelo(texto) {
    const ta = document.createElement('textarea');
    ta.value = texto;
    ta.style.cssText = 'position:fixed;top:-1000px;opacity:0';
    document.body.appendChild(ta);
    ta.select();

    let ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }

    document.body.removeChild(ta);
    toast(ok ? 'Lista copiada' : 'No se ha podido copiar');
  }

  /* ===== Vista: Platos ===== */

  const platosList = $('#platos-list');
  const platosSearch = $('#platos-search');

  function platosFiltrados(tipo, q) {
    const txt = (q || '').trim().toLowerCase();
    return state.platos
      .filter(p => !tipo || p.tipos.includes(tipo))
      .filter(p => !txt ||
        p.nombre.toLowerCase().includes(txt) ||
        p.ingredientes.join(' ').toLowerCase().includes(txt))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  }

  function renderPlatos() {
    const lista = platosFiltrados(platoFilter, platosSearch.value);

    platosList.innerHTML = lista.length
      ? lista.map(p => `<li data-id="${p.id}">
          <div class="plato-name">${esc(p.nombre)}</div>
          <div class="plato-meta">${p.tipos.map(t => `<span class="badge">${MEAL_LABEL[t]}</span>`).join('')}</div>
          ${p.ingredientes.length ? `<div class="plato-ing">${esc(p.ingredientes.join(' · '))}</div>` : ''}
        </li>`).join('')
      : '<li class="empty-msg" style="background:none;box-shadow:none">Ningún plato con ese filtro</li>';
  }

  platosList.addEventListener('click', ev => {
    const li = ev.target.closest('li[data-id]');
    if (li) openPlatoForm(li.dataset.id);
  });

  platosSearch.addEventListener('input', renderPlatos);

  $('#platos-filter').addEventListener('click', ev => {
    const chip = ev.target.closest('.chip');
    if (!chip) return;

    platoFilter = chip.dataset.tipo;
    $('#platos-filter').querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c === chip));
    renderPlatos();
  });

  $('#btn-new-plato').addEventListener('click', () => openPlatoForm(null));

  /* ===== Hoja modal ===== */

  const sheetOverlay = $('#sheet-overlay');
  const sheetContent = $('#sheet-content');

  function openSheet(html) {
    sheetContent.innerHTML = html;
    sheetOverlay.hidden = false;
  }

  function closeSheet() {
    sheetOverlay.hidden = true;
    sheetContent.innerHTML = '';
    pickerCtx = null;
  }

  sheetOverlay.addEventListener('click', ev => {
    if (ev.target === sheetOverlay) closeSheet();
  });

  document.addEventListener('keydown', ev => {
    if (ev.key === 'Escape' && !sheetOverlay.hidden) closeSheet();
  });

  /* ===== Elegir plato para un hueco ===== */

  function openPicker(dateISO, meal) {
    pickerCtx = { date: dateISO, meal, all: false, q: '' };
    renderPicker();
  }

  function renderPicker() {
    const { date, meal, all, q } = pickerCtx;
    const actual = slot(date, meal);
    const lista = platosFiltrados(all ? '' : meal, q);

    openSheet(`
      <div class="sheet-title">${MEAL_LABEL[meal]} · ${esc(dayLabel(date))}</div>
      <input type="search" class="sheet-search" id="pick-search" placeholder="Buscar plato…" value="${esc(q)}">
      <div class="chips">
        <button class="chip${all ? '' : ' active'}" id="pick-tipo">Solo de ${MEAL_LABEL[meal].toLowerCase()}</button>
        <button class="chip${all ? ' active' : ''}" id="pick-all">Todos</button>
      </div>
      <ul class="pick-list" id="pick-list">
        ${lista.length
          ? lista.map(p => `<li data-id="${p.id}"${p.id === actual ? ' class="sel"' : ''}>
              <span class="pick-name">${esc(p.nombre)}</span>
              <span class="pick-ing">${esc(p.ingredientes.join(', '))}</span>
            </li>`).join('')
          : '<li class="pick-empty">Ningún plato. Crea uno nuevo.</li>'}
      </ul>
      <div class="sheet-actions">
        <button class="btn secondary" id="pick-clear"${actual ? '' : ' disabled'}>Vaciar</button>
        <button class="btn" id="pick-new">+ Nuevo plato</button>
      </div>
    `);

    const search = $('#pick-search');
    search.addEventListener('input', () => {
      pickerCtx.q = search.value;
      const pos = search.selectionStart;
      renderPicker();
      const nuevo = $('#pick-search');
      nuevo.focus();
      nuevo.setSelectionRange(pos, pos);
    });

    $('#pick-tipo').addEventListener('click', () => { pickerCtx.all = false; renderPicker(); });
    $('#pick-all').addEventListener('click', () => { pickerCtx.all = true; renderPicker(); });

    $('#pick-list').addEventListener('click', ev => {
      const li = ev.target.closest('li[data-id]');
      if (!li) return;

      setSlot(date, meal, li.dataset.id);
      closeSheet();
      refresh();
      toast('Plato asignado');
    });

    $('#pick-clear').addEventListener('click', () => {
      setSlot(date, meal, null);
      closeSheet();
      refresh();
      toast('Hueco vaciado');
    });

    $('#pick-new').addEventListener('click', () => openPlatoForm(null, { date, meal }));
  }

  /* ===== Alta y edición de platos ===== */

  function openPlatoForm(id, asignarA) {
    const p = id ? plato(id) : null;
    const tipos = p ? p.tipos : (asignarA ? [asignarA.meal] : ['comida']);

    openSheet(`
      <div class="sheet-title">${p ? 'Editar plato' : 'Nuevo plato'}</div>
      <label class="field">
        <span>Nombre</span>
        <input type="text" id="f-nombre" value="${p ? esc(p.nombre) : ''}" placeholder="Pasta con bacon y setas">
      </label>
      <div class="field">
        <span>¿Para qué comidas?</span>
        <div class="chips" id="f-tipos">
          ${MEALS.map(m => `<button type="button" class="chip${tipos.includes(m.key) ? ' active' : ''}" data-tipo="${m.key}">${m.label}</button>`).join('')}
        </div>
      </div>
      <label class="field">
        <span>Ingredientes (separados por comas)</span>
        <textarea id="f-ing" placeholder="pasta, bacon, setas, nata">${p ? esc(p.ingredientes.join(', ')) : ''}</textarea>
      </label>
      <label class="field">
        <span>Nota (opcional)</span>
        <input type="text" id="f-nota" value="${p ? esc(p.nota) : ''}" placeholder="Sacar la carne del congelador">
      </label>
      <div class="sheet-actions">
        ${p ? '<button class="btn danger" id="f-del">Borrar</button>' : ''}
        <button class="btn" id="f-save">Guardar</button>
      </div>
    `);

    const chips = $('#f-tipos');
    chips.addEventListener('click', ev => {
      const chip = ev.target.closest('.chip');
      if (chip) chip.classList.toggle('active');
    });

    $('#f-nombre').focus();

    $('#f-save').addEventListener('click', () => {
      const nombre = $('#f-nombre').value.trim();
      if (!nombre) { toast('Ponle un nombre'); return; }

      const marcados = [...chips.querySelectorAll('.chip.active')].map(c => c.dataset.tipo);
      if (!marcados.length) { toast('Marca al menos una comida'); return; }

      const datos = {
        nombre,
        tipos: marcados,
        ingredientes: parseIng($('#f-ing').value),
        nota: $('#f-nota').value.trim(),
      };

      let nuevoId;
      if (p) Object.assign(p, datos);
      else { nuevoId = uid(); state.platos.push(Object.assign({ id: nuevoId }, datos)); }

      save();

      if (asignarA && nuevoId) setSlot(asignarA.date, asignarA.meal, nuevoId);

      closeSheet();
      refresh();
      toast(p ? 'Plato actualizado' : 'Plato creado');
    });

    if (p) {
      $('#f-del').addEventListener('click', () => {
        if (!confirm(`¿Borrar "${p.nombre}"? También se quita de los días en los que esté puesto.`)) return;

        state.platos = state.platos.filter(x => x.id !== p.id);

        /* Se limpia de todos los días del menú. */
        for (const [fecha, slots] of Object.entries(state.menu)) {
          for (const m of Object.keys(slots)) {
            if (slots[m] === p.id) delete slots[m];
          }
          if (!Object.keys(slots).length) delete state.menu[fecha];
        }

        save();
        closeSheet();
        refresh();
        toast('Plato borrado');
      });
    }
  }

  /* ===== Ajustes ===== */

  $('#btn-export').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `menu-${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast('Copia exportada');
  });

  $('#btn-import').addEventListener('click', () => $('#import-file').click());

  $('#import-file').addEventListener('change', ev => {
    const file = ev.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data || !Array.isArray(data.platos)) throw new Error('formato');

        if (!confirm('Se sustituyen los datos actuales por los del fichero. ¿Seguir?')) return;

        state = {
          version: 1,
          platos: data.platos,
          menu: data.menu || {},
          compra: data.compra || {},
          pasillos: data.pasillos || {},
        };
        save();
        refresh();
        toast('Datos importados');
      } catch (e) {
        toast('El fichero no es válido');
      }
    };
    reader.readAsText(file);
    ev.target.value = '';
  });

  $('#btn-wipe').addEventListener('click', () => {
    if (!confirm('Se borran todos los platos y todos los menús. ¿Seguro?')) return;

    localStorage.removeItem(STORE_KEY);
    state = load();
    save();
    refresh();
    toast('Datos borrados');
  });

  /* ===== Navegación y arranque ===== */

  document.querySelector('.tabbar').addEventListener('click', ev => {
    const tab = ev.target.closest('.tab');
    if (!tab) return;

    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t === tab));
    document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === 'view-' + tab.dataset.view));
    window.scrollTo(0, 0);
    refresh();
  });

  let toastTimer;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 1900);
  }

  function refresh() {
    renderHoy();
    renderSemana();
    renderCompra();
    renderPlatos();
  }

  refresh();

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
})();
