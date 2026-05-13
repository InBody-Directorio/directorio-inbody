# Directorio InBody México

## Estado del proyecto

- **Bloque 1: Setup técnico** ✅
- **Bloque 2: Directorio público** ✅
- **Bloque 3: Formulario de alta** ✅
- Bloque 4: Panel admin (pendiente)
- Bloque 5: Pulido + deploy a `directorio.inbodymexico.com` (pendiente)

## Lo nuevo en el Bloque 3

### Formulario multi-step en `/registro`

5 pasos:
1. **Información profesional** (nombre, especialidad, descripción, foto perfil)
2. **Equipo InBody** (modelo + foto del equipo para verificación)
3. **Ubicación(es)** con geocodificación automática (hasta 3 sucursales)
4. **Contacto** (WhatsApp, teléfono, email, redes opcionales)
5. **Revisar y enviar** (resumen completo con opción de editar cualquier paso)

### Features

- **Compresión automática de fotos** cliente-side a 1200px max (browser-image-compression)
- **Geocodificación con debounce** al cambiar dirección (Mapbox)
- **Mini-mapa de validación** que muestra el pin cuando se ubica correctamente
- **Hasta 3 ubicaciones** con botón "Agregar otra ubicación"
- **Validación en tiempo real** de email, WhatsApp (10 dígitos México), teléfono
- **Verificación de duplicados** de email contra Supabase antes de enviar
- **Honeypot anti-spam** invisible para bots
- **Confirmación antes de cerrar pestaña** si hay datos llenados
- **2 correos transaccionales** vía Resend:
   - Al equipo InBody (`directorioinbody@gmail.com`) con resumen completo + fotos embebidas
   - Al doctor con resumen de su solicitud y plazo de 3-5 días hábiles
- **Pantalla de éxito** después de enviar con confirmación visual

### Seguridad

- Honeypot field invisible
- Validaciones server-side en la Vercel Function
- RLS de Supabase: público solo puede crear con status='pendiente'
- Storage policies: solo se aceptan uploads en carpetas `perfil/`, `equipo/`, `lugar/`
- Compresión obligatoria de fotos antes de subir (evita uploads gigantes)

## Cómo subir este bloque

### Paso 1: Subir archivos a GitHub

1. Descarga el zip y descomprímelo
2. GitHub → `InBody-Directorio/directorio-inbody`
3. "Add file" → "Upload files"
4. **Importante:** además de las carpetas habituales (`src/`, `public/`, etc.) ahora también viene una carpeta nueva `api/` con el archivo `registro.js`. Asegúrate de subirla.
5. Confirma sobrescribir archivos existentes
6. Commit message: `Bloque 3: formulario de alta multi-step + emails transaccionales`

### Paso 2: Correr SQL adicional en Supabase

1. Supabase → SQL Editor → New query
2. Copia el contenido de `supabase/03_registro_schema.sql`
3. Pégalo y Run
4. Debería decir Success (agrega columna `codigo_postal`, índice de email, etc.)

### Paso 3: Agregar variables de entorno en Vercel

Vamos a necesitar 3 nuevas variables. Ve a Vercel → tu proyecto → Settings → Environment Variables.

| Variable | Valor | Notas |
|---|---|---|
| `RESEND_API_KEY` | Tu API key de Resend | La misma que usaste en el brief |
| `RESEND_TO_EMAIL` | `directorioinbody@gmail.com` | A dónde llegan las solicitudes |
| `RESEND_FROM_EMAIL` | `InBody Directorio <directorio@marketinglab.mx>` | Remitente del correo (debe estar en dominio verificado en Resend) |

Marca las 3 como "Production, Preview, Development".

### Paso 4: Redeploy

1. Vercel → Deployments → último deploy → 3 puntitos → Redeploy
2. **Desmarca "Use existing Build Cache"**
3. Deploy

### Paso 5: Probar el flujo end-to-end

1. Abre tu URL de Vercel → da clic en "Registrar mi equipo"
2. Llena los 4 pasos con datos de prueba
3. Sube 2 fotos (cualquier imagen sirve)
4. Llega al resumen, revisa, da clic en "Enviar solicitud"
5. Debe aparecer la pantalla de éxito
6. **Verificar:**
   - `directorioinbody@gmail.com` recibió un correo con el resumen y las 2 fotos embebidas
   - El email de prueba que pusiste recibió la confirmación
   - En Supabase Table Editor → `profesionales` debe aparecer la nueva fila con `status='pendiente'`
   - En `ubicaciones` debe aparecer la ubicación nueva
   - En Storage → `directorio-fotos/perfil/` y `directorio-fotos/equipo/` deben aparecer las fotos

## Variables de entorno completas (Vercel)

Después de este bloque tendrás estas variables:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_MAPBOX_TOKEN=...
RESEND_API_KEY=...
RESEND_TO_EMAIL=directorioinbody@gmail.com
RESEND_FROM_EMAIL=InBody Directorio <directorio@marketinglab.mx>
```

## Estructura del proyecto

```
api/
└── registro.js                    [NUEVO] Vercel Function que manda emails

src/
├── components/
│   ├── registro/                  [NUEVO]
│   │   ├── Stepper.jsx            barra de progreso
│   │   ├── FormFields.jsx         inputs reutilizables (TextInput, Select, PhoneInput, etc.)
│   │   ├── PhotoUpload.jsx        upload con compresión y preview
│   │   ├── Step1Info.jsx          paso 1
│   │   ├── Step2Equipo.jsx        paso 2
│   │   ├── Step3Ubicacion.jsx     paso 3 (multi-ubicación + geocode)
│   │   ├── Step4Contacto.jsx      paso 4
│   │   ├── ResumenSolicitud.jsx   paso 5
│   │   └── SuccessScreen.jsx      post-envío
│   └── (los demás del Bloque 2)
├── lib/
│   ├── registro.js                [NUEVO] helpers de Supabase Storage + insert
│   ├── supabase.js
│   └── mapbox.js
├── pages/
│   ├── RegistroPage.jsx           [REESCRITA] formulario completo
│   ├── HomePage.jsx
│   └── AdminPage.jsx
└── ...

supabase/
├── 01_schema.sql                  Bloque 1
├── 02_seed_fotos.sql              Bloque 2 (fotos demo)
└── 03_registro_schema.sql         [NUEVO] ajustes para formulario
```

## Contacto

Rodrigo Vázquez · MKT LAB · rodrigo@marketinglab.mx
