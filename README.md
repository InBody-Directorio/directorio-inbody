# Directorio InBody México

Directorio interactivo de profesionales certificados con equipo InBody en México. Stack: Vite + React + Tailwind + Supabase + Mapbox + Vercel.

## Estado del proyecto

- **Bloque 1: Setup técnico** ✅
- **Bloque 2: Directorio público** ✅
- **Bloque 2.5: Upgrade visual (dark mode tech + logo + fotos)** ✅
- Bloque 3: Formulario de alta (pendiente)
- Bloque 4: Panel admin (pendiente)

## Lo nuevo en este push

- Logo InBody real integrado en el header (SVG vector, escala perfecto)
- HeroBar nuevo con título Fraunces serif + chip "En vivo" + 3 stats animados con count-up
- Mapa cambiado a **dark mode tech** (estilo Tesla / Vision Pro)
- Marcadores con glow rojo InBody, pulse animation en seleccionado
- Botón flotante "Ubícame" abajo a la derecha (pide ubicación al navegador)
- Marcador azul tipo Apple/Google para la ubicación del usuario con pulse animation
- Skeleton loaders en sidebar y bottom sheet (en lugar de spinner)
- Fix del bug del z-index de los dropdowns (ahora usan fixed positioning, ya no se ocultan tras el mapa)
- Hover en cards más vivo (gradiente sutil, borde izquierdo rojo cuando seleccionado)
- Dot status verde en cada card indicando "disponible"
- Status pill "Disponible" en el popup del pin
- 8 doctores con fotos de Unsplash de demo

## Cómo subir este bloque

### Paso 1: Sobrescribir archivos en GitHub

1. Descarga el zip y descomprímelo
2. GitHub → `InBody-Directorio/directorio-inbody`
3. "Add file" → "Upload files"
4. Arrastra todo el contenido (incluyendo subcarpetas)
5. Confirma sobrescribir archivos existentes
6. Commit message: `Bloque 2 visual upgrade: dark mode + logo InBody + fotos demo`
7. Commit changes

### Paso 2: Correr SQL para fotos de demo

Para que los 8 doctores ficticios tengan fotos visibles:

1. Supabase → SQL Editor → New query
2. Copia el contenido de `supabase/02_seed_fotos.sql`
3. Pégalo y dale Run
4. Debe decir Success y mostrarte los 8 registros con foto_perfil_url

### Paso 3: Verificar deploy automático

Vercel re-deploya solo en 2 min. Cuando termine, abre tu URL y debes ver:

- Header con logo InBody real arriba a la izquierda
- HeroBar con el título "Encuentra tu equipo InBody cerca de ti" y stats animados
- Filtros que ya no se ocultan tras el mapa
- Mapa en dark mode con pines rojos brillando
- 8 doctores con foto en el sidebar
- Botón circular oscuro flotante abajo a la derecha del mapa

## Estructura del proyecto

```
src/
├── components/
│   ├── BottomSheet.jsx       (skeletons añadidos)
│   ├── FiltrosBar.jsx        (fix z-index dropdowns)
│   ├── Header.jsx            (logo InBody real)
│   ├── HeroBar.jsx           (NUEVO: hero con stats)
│   ├── InBodyLogo.jsx        (NUEVO: SVG inline)
│   ├── LocationButton.jsx    (NUEVO: ubícame)
│   ├── MapaDirectorio.jsx    (DARK MODE)
│   ├── ProfesionalCard.jsx   (skeleton + status dot)
│   └── Sidebar.jsx           (skeletons añadidos)
├── pages/
│   ├── HomePage.jsx          (integra HeroBar + LocationButton)
│   ├── RegistroPage.jsx      (Bloque 3)
│   └── AdminPage.jsx         (Bloque 4)
├── hooks/
├── lib/
├── config/
└── App.jsx
```

## Contacto

Rodrigo Vázquez · MKT LAB · rodrigo@marketinglab.mx
