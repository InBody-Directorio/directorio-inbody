# Directorio InBody México

## Estado del proyecto

- **Bloque 1: Setup técnico** ✅
- **Bloque 2: Directorio público** ✅
- **Bloque 2.5: Refinamiento landing premium** ✅
- Bloque 3: Formulario de alta (pendiente)
- Bloque 4: Panel admin (pendiente)

## Lo nuevo en este push

### Bugs corregidos
- Dropdown de filtros ya no se va hasta abajo (cambiado a `position: absolute` relativo al botón)
- Logo InBody ya no se ve encimado (viewBox recortado, sin padding raro)

### Cambios de diseño
- Mapa cambiado a **Light tech custom** (Mapbox Light con tinte rojo sutil en carreteras)
- Dot verde fake reemplazado por **pin rojo en la foto** del card
- HeroBar más compacto en mobile (sin descripción)

### Features nuevas
- **Chips independientes** de filtros activos (`[CDMX X]` separado del dropdown "Estado")
- **Filtros inteligentes**: opciones sin resultados aparecen grises con badge "Sin datos"
- **Tooltip al hover** sobre pines del mapa con nombre del profesional
- **Empty state overlay** cuando no hay resultados, con mensaje claro
- **Botón Cerrar mejorado** del popup (background semi-transparente para que destaque)

### Bloques nuevos tipo landing
- **HowItWorks**: 3 pasos visuales (Busca → Contacta → Mídete)
- **MarcaAutoridad**: stats de InBody como marca (90+ países, 30+ años, 4,000+ publicaciones)
- **CtaProfesionales**: bloque oscuro con CTA a registro + 3 beneficios
- **Footer**: completo con redes sociales, contacto, links legales

### Layout
- Mapa con altura fija 70vh
- Scroll para acceder a los bloques de landing debajo
- Layout responsive desktop + móvil

## Cómo subir este bloque

1. Descarga el zip y descomprímelo
2. Ve a GitHub → `InBody-Directorio/directorio-inbody`
3. "Add file" → "Upload files"
4. Arrastra todo el contenido (incluyendo subcarpetas)
5. Confirma sobrescribir archivos existentes
6. Commit message: `Bloque 2.5 landing premium: light tech + filtros inteligentes + footer`
7. Commit changes

Vercel re-deploya solo en 2 min.

## Estructura

```
src/
├── components/
│   ├── BottomSheet.jsx
│   ├── CtaProfesionales.jsx     NUEVO
│   ├── FiltrosBar.jsx            ACTUALIZADO (chips activos + filtros inteligentes)
│   ├── Footer.jsx                NUEVO
│   ├── Header.jsx                ACTUALIZADO (logo ajustado)
│   ├── HeroBar.jsx               ACTUALIZADO (compacto mobile)
│   ├── HowItWorks.jsx            NUEVO
│   ├── InBodyLogo.jsx            ACTUALIZADO (viewBox recortado)
│   ├── LocationButton.jsx
│   ├── MapaDirectorio.jsx        ACTUALIZADO (light mode + tooltips + empty state)
│   ├── MarcaAutoridad.jsx        NUEVO
│   ├── ProfesionalCard.jsx       ACTUALIZADO (pin rojo en vez de dot verde)
│   └── Sidebar.jsx
├── pages/
│   ├── HomePage.jsx              ACTUALIZADO (layout landing + filtros inteligentes)
│   ├── RegistroPage.jsx
│   └── AdminPage.jsx
├── hooks/
├── lib/
├── config/
└── App.jsx
```

## Contacto

Rodrigo Vázquez · MKT LAB · rodrigo@marketinglab.mx
