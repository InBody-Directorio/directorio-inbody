# Directorio InBody México · v0.4.0

Directorio interactivo de profesionales certificados con equipo InBody en México.

---

## 🔥 Bloque 4: Panel Administrativo

Este bloque agrega:

- **Panel administrativo** completo en `/inbody-admin`
- **Auth con correo + contraseña** + magic link como fallback
- **Niveles de admin**: super_admin y admin
- **Aprobar/rechazar/restaurar** profesionales con audit log
- **Gestión de admins** desde el panel
- **Vista de Audit Log** para super_admins
- **RLS reactivado** de forma segura (formulario público usa Vercel Function con SERVICE_ROLE)
- **Foto upload via API** (no directo a Storage, evita problemas RLS)

---

## 🚀 Setup completo (paso a paso)

### 1. Subir archivos a GitHub

Sube TODO el contenido del zip al repo `InBody-Directorio/directorio-inbody` (reemplaza archivos existentes).

### 2. Variables de entorno en Vercel

**Settings → Environment Variables**

Agrega/verifica estas variables:

| Variable | Valor | Notas |
|---|---|---|
| `VITE_SUPABASE_URL` | `https://xpyzjkahwbzcehsdiokk.supabase.co` | Pública, frontend |
| `VITE_SUPABASE_ANON_KEY` | (anon key legacy `eyJ...`) | Pública, frontend |
| `VITE_MAPBOX_TOKEN` | (tu token Mapbox) | Pública, frontend |
| `SUPABASE_SERVICE_ROLE_KEY` | (service_role secret) | **🚨 PRIVADA, solo backend** |
| `RESEND_API_KEY` | (tu API key de Resend) | Backend |
| `RESEND_FROM_EMAIL` | `InBody Directorio <directorio@marketinglab.mx>` | Opcional |
| `RESEND_TO_EMAIL` | `directorioinbody@gmail.com` | Notificaciones de nuevas solicitudes |

⚠️ **`SUPABASE_SERVICE_ROLE_KEY` la consigues en:** Supabase → Settings → API → "Legacy anon, service_role API keys" → service_role → Reveal → copia.

**NO le pongas el prefijo `VITE_`**, esa key SOLO va al servidor.

### 3. Correr el SQL del Bloque 4

Supabase → SQL Editor → New query → pega TODO el contenido de `supabase/05_panel_admin.sql` → Run.

Esto:
- Crea tabla `admins` con los 2 super_admins iniciales
- Crea tabla `audit_log`
- Agrega columnas a `profesionales` (motivo_rechazo, aprobado_por, etc.)
- Reactiva RLS con arquitectura nueva (segura, no rompe el form)

### 4. Redeploy en Vercel

Deployments → último → 3 puntitos → Redeploy → **desmarca cache** → confirma.

Espera 2-3 min.

### 5. Setup inicial de admins en Supabase Auth

Esto crea los usuarios en Supabase Auth con sus contraseñas. **Solo se corre una vez.**

Abre tu sitio en el navegador, F12 → Console y ejecuta:

```javascript
fetch('/api/admin/setup-inicial', { method: 'POST' })
  .then(r => r.json())
  .then(console.log);
```

Debe responder con:
```json
{
  "ok": true,
  "message": "Setup completado...",
  "credenciales": [
    { "email": "directorioinbody@gmail.com", "password": "InBody2026Admin!" },
    { "email": "rodrigo@marketinglab.mx", "password": "MktLab2026Admin!" }
  ]
}
```

### 6. Acceso al panel

Ve a `https://tu-sitio.vercel.app/inbody-admin`

**Credenciales iniciales:**

| Usuario | Correo | Contraseña |
|---|---|---|
| Equipo InBody (super_admin) | `directorioinbody@gmail.com` | `InBody2026Admin!` |
| Rodrigo (super_admin) | `rodrigo@marketinglab.mx` | `MktLab2026Admin!` |

**🚨 IMPORTANTE: Cambien la contraseña al entrar.** Vayan a "Mi cuenta" en el panel y pongan una contraseña personal.

---

## 📂 Estructura del Bloque 4

```
api/
├── registro.js              ← REESCRITO: usa SERVICE_ROLE
├── upload-foto.js           ← NUEVO: sube foto con SERVICE_ROLE
└── admin/
    ├── aprobar.js
    ├── rechazar.js
    ├── restaurar.js
    ├── crear-admin.js       ← Solo super_admin
    ├── eliminar-admin.js    ← Solo super_admin
    ├── cambiar-password.js
    └── setup-inicial.js     ← Correr UNA vez para crear admins en Auth

src/
├── hooks/
│   ├── useAdminAuth.js              ← NUEVO: auth + validación admins
│   └── useProfesionalesAdmin.js     ← NUEVO: listas filtradas
├── lib/
│   ├── adminApi.js                  ← NUEVO: helpers para llamar APIs
│   └── registro.js                  ← REESCRITO: usa /api/registro
├── components/admin/
│   ├── LoginScreen.jsx
│   ├── AdminSidebar.jsx
│   ├── ProfesionalDetailModal.jsx
│   ├── ProfesionalesList.jsx
│   ├── AdminsView.jsx
│   ├── AuditLogView.jsx
│   └── MiCuentaView.jsx
└── pages/
    └── AdminPage.jsx                ← REESCRITO con router interno

supabase/
└── 05_panel_admin.sql               ← Schema del Bloque 4
```

---

## 🗺️ Rutas del panel

| Ruta | Quién puede | Qué hace |
|---|---|---|
| `/inbody-admin` | Todos los admins | Redirige a pendientes |
| `/inbody-admin/pendientes` | Todos los admins | Lista pendientes con badge |
| `/inbody-admin/aprobados` | Todos los admins | Lista aprobados |
| `/inbody-admin/rechazados` | Todos los admins | Lista rechazados (con restaurar) |
| `/inbody-admin/administradores` | Solo super_admin | Gestión de admins |
| `/inbody-admin/audit-log` | Solo super_admin | Historial de acciones |
| `/inbody-admin/mi-cuenta` | Todos los admins | Cambiar propia contraseña |

---

## 🔐 Arquitectura de seguridad

```
┌────────────────────────────────────────────────────────┐
│  Frontend público                                       │
│  - Lee profesionales aprobados con anon key            │
│  - NO toca Supabase directo para INSERT                │
│  - Manda fotos via /api/upload-foto (con SERVICE_ROLE) │
│  - Manda registro via /api/registro (con SERVICE_ROLE) │
└────────────────────────────────────────────────────────┘
                       │
                       ▼
┌────────────────────────────────────────────────────────┐
│  Vercel Functions (backend)                            │
│  - Tienen SERVICE_ROLE_KEY (nunca llega al navegador)  │
│  - Validan datos antes de tocar Supabase               │
│  - Hacen INSERT con permisos completos                 │
└────────────────────────────────────────────────────────┘
                       │
                       ▼
┌────────────────────────────────────────────────────────┐
│  Supabase (RLS activado)                               │
│  - anon: SOLO SELECT en profesionales aprobados        │
│  - authenticated (admin logueado): puede todo          │
│  - service_role (backend): bypassa RLS                 │
└────────────────────────────────────────────────────────┘
```

---

## 🛠️ Troubleshooting

### "Error creando profesional: new row violates RLS"
Pasó porque `SUPABASE_SERVICE_ROLE_KEY` no está bien configurada en Vercel. Verifica que existe y tiene el valor correcto.

### "Sesión inválida" al entrar al panel
Tu token expiró. Cierra sesión y vuelve a entrar.

### "No tienes permisos de administrador"
Tu correo no está en la tabla `admins` de Supabase, o no corriste `setup-inicial`. Vuelve a correr:
```javascript
fetch('/api/admin/setup-inicial', { method: 'POST' }).then(r => r.json()).then(console.log);
```

### El correo no llega cuando rechazo/apruebo
Revisa que `RESEND_API_KEY` esté en Vercel y que el dominio `marketinglab.mx` esté verificado en Resend.

---

## 📋 Checklist post-deploy

- [ ] Variables de entorno en Vercel completas (especialmente `SUPABASE_SERVICE_ROLE_KEY`)
- [ ] SQL `05_panel_admin.sql` ejecutado
- [ ] Redeploy SIN cache hecho
- [ ] `/api/admin/setup-inicial` ejecutado una vez
- [ ] Login con `directorioinbody@gmail.com` / `InBody2026Admin!` funciona
- [ ] Login con `rodrigo@marketinglab.mx` / `MktLab2026Admin!` funciona
- [ ] Contraseñas iniciales cambiadas desde "Mi cuenta"
- [ ] Probaste aprobar una solicitud pendiente → llegó correo verde "¡Estás dentro!" al doctor
- [ ] Probaste rechazar con motivo → llegó correo al doctor
- [ ] Probaste restaurar un rechazo → volvió a pendientes
- [ ] El formulario público sigue funcionando con RLS activado

---

## 🎯 Próximos pasos (Bloque 5)

- DNS: apuntar `directorio.inbodymexico.com` al deploy de Vercel
- Pulir errores cosméticos
- Optimizaciones de performance
- Analytics opcional
- Handoff a Aza

---

## 📞 Soporte

Para dudas técnicas, contactar a Rodrigo Vázquez · MKT LAB.
