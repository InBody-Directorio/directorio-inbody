# Directorio InBody México

Proyecto MKT LAB. Cliente: InBody México.

Stack: Vite + React + Supabase + Mapbox + Resend, desplegado en Vercel.

---

## 🚀 Cómo desplegar desde cero (paso a paso)

### 1) Sobreescribir el repo

Este zip contiene **TODO** el proyecto. Descomprime y reemplaza todo el contenido del repo `Rovian96/directorio-inbody` con estos archivos. Luego haz `git add -A && git commit -m "rebuild" && git push`.

### 2) Variables de entorno en Vercel

En Vercel → Settings → Environment Variables, asegúrate de tener TODAS estas:

| Variable | Para qué sirve | Dónde sacarla |
|---|---|---|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase | Supabase → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Llave pública (anónima) | Supabase → Settings → API → anon public |
| `VITE_MAPBOX_TOKEN` | Token de Mapbox para mapas | account.mapbox.com → Access tokens |
| `SUPABASE_SERVICE_ROLE_KEY` | Llave admin (solo backend) | Supabase → Settings → API → service_role |
| `RESEND_API_KEY` | Para mandar correos | resend.com → API Keys |
| `RESEND_FROM_EMAIL` | Remitente de correos (debe estar verificado en Resend) | Ej: `directorio@inbodymexico.com` |
| `RESEND_TO_EMAIL` | Buzón que recibe notificaciones | `directorioinbody@gmail.com` |

⚠️ **Todas las `VITE_*` necesitan estar marcadas en Production + Preview + Development**.

### 3) Correr SQLs en Supabase (en orden)

Entra a Supabase → SQL Editor y corre EN ORDEN:

1. `supabase/01_schema.sql` — Crea tablas `profesionales`, `ubicaciones`, storage bucket, RLS public.
2. `supabase/05_panel_admin.sql` — Crea tablas `admins`, `audit_log`, RLS admin.
3. `supabase/06_tanda1.sql` — Agrega columna `numero_serie`.

### 4) Push a Vercel

Con el push de git, Vercel auto-deploya. Esperar 1-2 min.

### 5) Setup inicial de admins (solo UNA vez)

Cuando Vercel termine el deploy:

1. Abre la URL en el navegador (ej. `https://directorio-inbody.vercel.app`)
2. Abre la consola del navegador (F12 → Console)
3. Pega y ejecuta:

```js
fetch('/api/admin/setup-inicial', {method:'POST'}).then(r=>r.json()).then(console.log)
```

Esto crea los 2 super_admins iniciales:

- `directorioinbody@gmail.com` / `InBody2026Admin!`
- `rodrigo@marketinglab.mx` / `MktLab2026Admin!`

⚠️ **Cámbialos en cuanto entres** (Mi cuenta → Cambiar contraseña).

### 6) Probar

Entra a `/inbody-admin` y haz login con uno de los dos admins iniciales. Si todo jala, ya está listo.

---

## 🗺️ Estructura

```
.
├── api/                          # Vercel Functions (backend)
│   ├── registro.js               # POST: nuevo profesional + correo
│   ├── upload-foto.js            # POST: sube imagen a Supabase Storage
│   └── admin/
│       ├── aprobar.js            # Aprobar profesional
│       ├── rechazar.js           # Rechazar profesional
│       ├── restaurar.js          # Restaurar rechazado a pendiente
│       ├── crear-admin.js        # Crear nuevo admin (solo super)
│       ├── eliminar-admin.js     # Eliminar admin (solo super)
│       ├── cambiar-password.js   # Cambiar mi contraseña
│       └── setup-inicial.js      # UNA VEZ: crea admins iniciales
├── src/
│   ├── pages/                    # HomePage, RegistroPage, AdminPage
│   ├── components/               # Components públicos + admin/ + registro/
│   ├── hooks/                    # useAdminAuth, useProfesionalesAdmin
│   ├── lib/                      # supabase, mapbox, registro, adminApi, exportCSV
│   ├── config/                   # especialidades, modelos, estados
│   ├── App.jsx                   # Routing principal
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Tailwind + estilos custom InBody
├── supabase/                     # SQLs en orden
├── public/modelos/               # Imágenes de modelos InBody (placeholder por ahora)
├── tailwind.config.js            # Paleta oficial InBody
├── index.html                    # Fonts Lato + Noto Sans, Mapbox CSS
├── vite.config.js
└── vercel.json
```

---

## 🎨 Branding

Colores y fuentes vienen del brandbook oficial InBody v1.0.1:

- **InBody Red**: `#971B2F` (PANTONE 7427C)
- **Pin del mapa**: `#E31937` (más brillante para visibilidad)
- **Tipografía**: Lato (display/títulos) + Noto Sans (cuerpo)
- **Regla**: rojo máximo 10% del área total

---

## 📋 Pendientes conocidos

- [ ] Imágenes oficiales de los modelos InBody (subir a `/public/modelos/{id}.png`). Por ahora todos muestran un placeholder elegante con gradiente rojo.
- [ ] Lista de modelos descontinuados (pendiente que InBody mande la lista).
- [ ] DNS `directorio.inbodymexico.com` (pendiente IT InBody).
- [ ] Configurar dominio verificado en Resend para el `RESEND_FROM_EMAIL`.

---

## 🐛 Si el build falla en Vercel

1. Ver el log completo en Vercel → Deployment → tab **"Logs"** (no Runtime Logs, sino el log del build).
2. Si la pestaña Logs aparece vacía, prueba abrir directamente la URL del deployment fallido y agregarle `?expand-logs` al final.
3. Los errores más comunes son:
   - Variable de entorno `VITE_*` faltante → revisa paso 2.
   - SQL no ejecutado → revisa paso 3.
   - Bucket de Storage `directorio-fotos` no creado → corre `01_schema.sql` (lo crea automático).

---

Hecho con cariño por Rodrigo + Claude para que Aza pueda dormir tranquila. 🛌
