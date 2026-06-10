# Imágenes oficiales de modelos InBody

Esta carpeta contiene las imágenes que aparecen en la tarjeta de cada profesional del directorio.

## Cómo agregar imágenes

1. Consigue las imágenes oficiales con **InBody México** (Aza puede pedírselas a su equipo de marketing)
2. Idealmente sean PNGs con fondo transparente, cuadradas (ej. 400x400 px)
3. Nómbralas con el `id` del modelo en minúsculas, sin espacios. Ejemplos:
   - `inbody970.png`
   - `inbody970s.png`
   - `inbody770.png`
   - `inbody770s.png`
   - `inbody580.png`
   - `inbody570.png`
   - `inbody380.png`
   - `inbody370.png`
   - `inbody370s.png`
   - `inbody270.png`
   - `inbody270s.png`
   - `inbody230.png`
   - `inbody120.png`
   - `inbodyh20n.png`
   - `inbodydial.png`
   - `inbodyband2.png`
   - `inbodybpbio.png`
4. Súbelas a esta carpeta `/public/modelos/`
5. Vercel deploya automáticamente y aparecen en las tarjetas

## Mientras no haya imágenes

El componente `ImagenModelo` muestra un placeholder elegante (degradado rojo soft con ícono de sparkles). No se ve roto, queda profesional. Cuando lleguen las imágenes oficiales, simplemente las subes y reemplazan el placeholder automáticamente.

## Por qué no descargamos las imágenes del sitio de InBody

InBody USA bloquea descargas directas de sus imágenes (responden 403). Además sería usar su IP sin permiso. Lo correcto es pedírselas a InBody México directamente.
