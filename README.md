# Directorio InBody México

Directorio interactivo de profesionales certificados con equipo InBody en México. Stack: Vite + React + Tailwind + Supabase + Mapbox + Vercel.

## Estado del proyecto

- **Bloque 1: Setup técnico** ✅
- **Bloque 2: Directorio público (mapa + filtros + tarjetas)** ✅
- Bloque 3: Formulario de alta (pendiente)
- Bloque 4: Panel admin (pendiente)
- Bloque 5: Pulido + deploy final (pendiente)

## Cómo subir el Bloque 2

1. Descarga el zip de este bloque y descomprímelo
2. Ve a GitHub → `InBody-Directorio/directorio-inbody`
3. Dale clic a "Add file" → "Upload files"
4. Arrastra todo el contenido de la carpeta (incluyendo subcarpetas como `src`, `supabase`, etc.)
5. **IMPORTANTE:** GitHub te va a preguntar si quieres sobrescribir los archivos existentes. Dale clic en "Replace" o "Overwrite". Es lo que queremos.
6. Commit message: `Bloque 2: directorio público con mapa`
7. Commit changes

Vercel detecta el push automáticamente y re-deploya en 1-2 minutos.

## Lo que se ve después del deploy

Ya no la pantalla de "Setup técnico en línea". Ahora vas a ver:

- **Header sticky** con logo InBody y botón "Registrar mi equipo"
- **Barra de filtros**: búsqueda por nombre, dropdown Estado, dropdown Especialidad
- **Sidebar lateral izquierdo** (desktop) o **bottom sheet drag-up** (móvil) con tarjetas de profesionales
- **Mapa de México** con los 8 doctores ficticios como pines rojos
- **Popup** al hacer clic en un pin con foto, info, modelo InBody, WhatsApp grande y botones de llamar/cómo llegar

## Estructura del proyecto

```
src/
├── components/
│   ├── BottomSheet.jsx       Bottom sheet móvil con drag
│   ├── FiltrosBar.jsx        Búsqueda + dropdowns
│   ├── Header.jsx            Header con logo y CTA
│   ├── MapaDirectorio.jsx    Mapbox + markers + popup
│   ├── ProfesionalCard.jsx   Tarjeta en lista
│   └── Sidebar.jsx           Sidebar desktop
├── pages/
│   ├── HomePage.jsx          Directorio público (este bloque)
│   ├── RegistroPage.jsx      Pendiente (Bloque 3)
│   └── AdminPage.jsx         Pendiente (Bloque 4)
├── hooks/
│   ├── useIsMobile.js        Detecta desktop vs móvil
│   └── useProfesionales.js   Fetch de Supabase
├── lib/
│   ├── supabase.js           Cliente
│   └── mapbox.js             Token + geocoding
├── config/
│   ├── especialidades.js     13 especialidades (Aza aprobó)
│   ├── modelos.js            16 modelos InBody
│   └── estados.js            32 estados de México
└── App.jsx                   Router
```

## Decisiones de diseño aplicadas

- **Sidebar lateral en desktop** + **bottom sheet en móvil** (estilo Apple Maps + Airbnb)
- **Popup en mapa** al hacer clic en pin (no panel lateral, para no sobrecargar)
- **Marcador estilo Airbnb**: círculo rojo InBody, hover crece, seleccionado invierte colores
- **Mapa Mapbox Light** como base para que los pines rojos destaquen
- **Tipografías**: Inter para UI, Fraunces para hero futuro
- **Color de acento único**: rojo InBody `#E31937` solo para CTAs críticos y pines
- **Bordes 0.5px** y backdrop-blur en headers para feel Apple

## Variables de entorno (ya configuradas en Vercel)

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_MAPBOX_TOKEN`

No tocar, ya están funcionando.

## Contacto

Rodrigo Vázquez · MKT LAB · rodrigo@marketinglab.mx
