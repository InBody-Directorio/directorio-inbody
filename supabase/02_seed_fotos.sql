-- ============================================================
-- UPDATE: Fotos de Unsplash para los doctores de demo
-- ============================================================
-- Ejecutar en Supabase SQL Editor para que los 8 doctores
-- ficticios tengan fotos de stock realistas.
-- ============================================================

UPDATE profesionales SET foto_perfil_url = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80&auto=format&fit=crop' WHERE email = 'maria@ejemplo.com';

UPDATE profesionales SET foto_perfil_url = 'https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=400&q=80&auto=format&fit=crop' WHERE email = 'contacto@ejemplo.com';

UPDATE profesionales SET foto_perfil_url = 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80&auto=format&fit=crop' WHERE email = 'carlos@ejemplo.com';

UPDATE profesionales SET foto_perfil_url = 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&q=80&auto=format&fit=crop' WHERE email = 'info@ejemplo.com';

UPDATE profesionales SET foto_perfil_url = 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80&auto=format&fit=crop' WHERE email = 'ana@ejemplo.com';

UPDATE profesionales SET foto_perfil_url = 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&q=80&auto=format&fit=crop' WHERE email = 'reservas@ejemplo.com';

UPDATE profesionales SET foto_perfil_url = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80&auto=format&fit=crop' WHERE email = 'roberto@ejemplo.com';

UPDATE profesionales SET foto_perfil_url = 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400&q=80&auto=format&fit=crop' WHERE email = 'patricia@ejemplo.com';

-- Verificar
SELECT nombre, foto_perfil_url FROM profesionales WHERE status = 'aprobado';
