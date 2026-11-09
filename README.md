# Menú

App personal para organizar el **menú semanal**: qué toca cocinar cada día en desayuno, comida y cena.

Sin cuentas, sin servidor, sin cuotas. Los datos viven en el `localStorage` del dispositivo.

## Qué hace (v0)

- **Hoy**: las tres comidas del día en grande, con los ingredientes del plato. Flechas para ir a otros días.
- **Semana**: los 7 días con sus tres comidas. Marca el día actual y avisa (`↻`) de los platos que se repiten en la semana.
  - *Copiar anterior*: trae el menú de la semana pasada.
  - *Rellenar huecos*: pone en cada hueco vacío el plato de ese tipo que lleva más tiempo sin salir, sin repetir dentro de la semana.
  - *Vaciar*: limpia la semana.
- **Compra**: la lista de la semana, sumando sin repetir los ingredientes de todos los platos planificados, **agrupada por pasillos del súper** (frutería, carnicería, pescadería, charcutería, lácteos, panadería, despensa, congelados, bebidas, droguería, otros), en el orden en que se recorre la tienda. Cada línea dice de qué platos sale. Se marca lo que ya está en el carro (pasa a un bloque "En el carro"), se añaden cosas a mano (leche, papel…), se desmarca todo y se copia al portapapeles —con los pasillos— para mandarla por WhatsApp. Con *Editar pasillos* se toca un producto para recolocarlo, y ese ajuste se recuerda para siempre. Comparte semana con la vista Semana: moverte en una mueve la otra.
- **Platos**: biblioteca de platos con nombre, para qué comidas valen, ingredientes y una nota opcional ("sacar la carne del congelador"). Buscador por nombre o ingrediente.
- **Ajustes**: exportar / importar JSON y borrar todo.

Funciona offline e instalable como PWA (manifest + service worker).

## Estructura

```
index.html                 vistas (Hoy, Semana, Platos, Ajustes)
css/app.css                estilos, claro y oscuro
js/app.js                  toda la lógica
manifest.webmanifest       PWA
sw.js                      service worker (app shell en caché)
icons/                     iconos 192 / 512 / apple-touch
```

## Datos

Una sola clave en `localStorage`: `menu-v1`.

```jsonc
{
  "version": 1,
  "platos": [
    { "id": "p...", "nombre": "Sopa", "tipos": ["cena"], "ingredientes": ["caldo", "fideos"], "nota": "" }
  ],
  "menu": {
    "2026-11-09": { "desayuno": "p...", "comida": "p...", "cena": "p..." }
  },
  "compra": {
    "2026-11-09": {                          // clave = lunes de la semana
      "marcados": { "patatas": true },       // ingrediente en minúsculas, o "x:<id>" si es extra
      "extras":   [ { "id": "p...", "txt": "papel de cocina" } ]
    }
  },
  "pasillos": { "setas": "despensa" }        // solo los ajustes manuales del usuario
}
```

Los ingredientes se agrupan por una **raíz** (`claveIng` en `js/app.js`): sin acentos, sin plural y sin la "e" final, de forma que `patata` y `patatas`, o `tomate` y `tomates`, caen en la misma línea. No es un singular correcto (`tomate` → `tomat`), solo una clave estable; de las dos formas se muestra la más larga, que en una lista de la compra suele ser la buena. El diccionario de pasillos se busca sobre el texto real, no sobre la raíz.

Los pasillos se deducen de un diccionario de palabras clave sin acentos (`CLAVES_POR_SECCION` en `js/app.js`). Gana siempre la coincidencia **más larga** y con límite de palabra, para que `atún en lata` vaya a despensa y no a pescadería, y para que `pan` no se coma `empanada`. Lo que no encaja cae en *Otros*. Lo que el usuario recoloca a mano se guarda en `pasillos` y manda sobre el diccionario.

El menú se indexa **por fecha**, no por semana: así "Hoy" es inmediato y la vista de semana solo lee siete fechas seguidas.

La lista de la compra **no se guarda**: se recalcula de los platos de la semana cada vez. Lo único que se guarda son las marcas de "ya cogido" y lo añadido a mano.

## Ideas pendientes

- Cantidades en los ingredientes (hoy son texto suelto, sin unidades).
- Semana tipo / plantillas.
- Etiquetas (rápido, horno, táper) y filtro al elegir plato.
- Marcar "ya cocinado / hay táper".
