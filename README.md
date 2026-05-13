# Directorio InBody México

Directorio interactivo de profesionales certificados con equipo InBody en México. Stack: Vite + React + Tailwind + Supabase + Mapbox + Vercel.

## Estado del proyecto

**Fase actual: Bloque 1 (setup técnico)** ✅

Próximas fases:
- Bloque 2: directorio público (mapa + filtros + tarjetas)
- Bloque 3: formulario de alta
- Bloque 4: panel admin
- Bloque 5: pulido y deploy a producción

## Estructura

```
directorio-inbody/
├── src/
│   ├── components/        Componentes reutilizables (próximamente)
│   ├── pages/             HomePage, RegistroPage, AdminPage
│   ├── lib/               Clientes: Supabase, Mapbox
│   ├── config/            Especialidades, modelos InBody, estados
│   ├── App.jsx            Router principal
│   ├── main.jsx           Entry point
│   └── index.css          Tailwind + estilos globales
├── supabase/
│   └── 01_schema.sql      Schema completo + seed data
├── public/
├── .env.example           Variables de entorno requeridas
├── index.html             HTML base
├── package.json           Dependencias
├── tailwind.config.js     Configuración Tailwind con branding InBody
├── vite.config.js         Configuración Vite
└── README.md
```

## Deploy paso a paso

### PASO 1: Subir a GitHub

1. Abre el repo `InBody-Directorio/directorio-inbody` que ya tienes creado
2. En la pestaña "Code" dale clic en "uploading an existing file"
3. Arrastra TODO el contenido de la carpeta `directorio-inbody/` (no la carpeta, lo de adentro)
4. Mensaje de commit: `Setup técnico inicial`
5. Commit changes

### PASO 2: Correr el schema en Supabase

1. Entra al dashboard de Supabase del proyecto `directorio-inbody`
2. En el menú izquierdo dale clic en "SQL Editor"
3. Dale clic en "New query"
4. Copia TODO el contenido de `supabase/01_schema.sql`
5. Pégalo en el editor
6. Dale clic en "Run" (esquina inferior derecha)
7. Debe decir "Success. No rows returned" o algo similar
8. Verifica en "Table Editor" que veas las 3 tablas: profesionales, ubicaciones, audit_log
9. Verifica en "Storage" que veas el bucket `directorio-fotos`

### PASO 3: Sacar las credenciales de Supabase

1. En Supabase, ve a "Project Settings" (icono engrane) → "API"
2. Copia el valor de "Project URL" (algo como `https://xxxxx.supabase.co`)
3. Copia el valor de "anon public" key (un token largo que empieza con `eyJ...`)
4. Guárdalos a la mano

### PASO 4: Conectar a Vercel

1. Entra a tu cuenta Vercel (la de `directorioinbody@gmail.com`)
2. "Add New" → "Project"
3. Importa el repo `InBody-Directorio/directorio-inbody`
4. **NO toques nada de la configuración inicial**, Vercel detecta solo que es Vite
5. ANTES de darle Deploy, expande la sección "Environment Variables" y agrega 3 variables:

   | Name | Value |
   |---|---|
   | `VITE_SUPABASE_URL` | Tu Project URL de Supabase |
   | `VITE_SUPABASE_ANON_KEY` | Tu anon public key de Supabase |
   | `VITE_MAPBOX_TOKEN` | Tu Default public token de Mapbox |

6. Dale clic en "Deploy"
7. Espera 1-2 minutos

### PASO 5: Verificar

1. Vercel te da un URL temporal (algo como `directorio-inbody-xyz.vercel.app`)
2. Ábrelo en tu navegador
3. Deberías ver una pantalla que dice "Setup técnico en línea" con dos checks verdes:
   - ✅ Supabase: "8 profesionales en BD"
   - ✅ Mapbox: "Token válido"
4. Si ves los dos checks verdes, **todo el setup está correcto** y podemos arrancar el Bloque 2

### Si algo falla

- **Supabase rojo:** revisa que hayas corrido el SQL completo sin errores y que las variables de entorno estén bien escritas en Vercel
- **Mapbox rojo:** revisa que el token esté bien escrito (debe empezar con `pk.`) y que no le hayan puesto restricciones de URL
- **Página en blanco:** revisa los logs de Vercel (Deployments → último deploy → Function Logs)

## Variables de entorno locales (para desarrollo)

Si quieres correr el proyecto en tu computadora (no obligatorio):

1. Copia `.env.example` a `.env`
2. Llena las 3 variables con tus valores reales
3. Corre `npm install` y después `npm run dev`

(Pero no necesitas hacer esto porque Vercel se encarga del hosting, solo es por si quieres desarrollar local más adelante.)

## Decisiones técnicas tomadas

- **Una tabla `profesionales` + una tabla `ubicaciones`** (1 a muchos), para soportar profesionales con varios consultorios
- **RLS habilitado:** público solo puede leer aprobados, admin (autenticado) lee todo y modifica
- **Storage público en bucket `directorio-fotos`:** todas las fotos del directorio (perfil, equipo InBody, lugar) viven aquí
- **Auth con magic link (próximo bloque):** Aza entra con su correo, sin contraseña
- **Especialidades cerradas (13):** dropdown fijo, aprobado por Aza el 28 de abril
- **Modelos InBody (16):** lista cerrada tal como pasó InBody, agrupada por categoría
- **Geocoding con Mapbox:** dirección a coordenadas, con validación visual del pin antes de aprobar

## Contacto

Rodrigo Vázquez · MKT LAB · rodrigo@marketinglab.mx
