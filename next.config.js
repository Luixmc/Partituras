/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permite compilar en OTRA carpeta sin pisar el `.next` que está usando el
  // servidor de desarrollo. Compilar encima de él lo deja roto ("Cannot find
  // module ./vendor-chunks/..."), y ya ha pasado tres veces. `npm run verificar`
  // define esta variable; `npm run build` no, así que Vercel no cambia.
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
  // Id de este despliegue, para que el service worker sepa qué versión sirve
  // y limpie el caché de la anterior. En Vercel es el commit; en local, "dev".
  env: {
    NEXT_PUBLIC_BUILD_ID: (process.env.VERCEL_GIT_COMMIT_SHA || "dev").slice(0, 7),
  },
  // Aqui habia unas cabeceras CORS, quitadas el 2026-08-28 (P-10). No hacian
  // NADA, y se comprobo antes de tocarlas:
  //   * se aplicaban a `/api/:path*`, y **no existe ninguna ruta /api**;
  //   * y a `/catalog/*` y `/sheets/*`, que son **paginas HTML, no una API**:
  //     el navegador no aplica CORS a la navegacion entre paginas;
  //   * y sobre todo, el origen permitido era **el dominio de la propia
  //     pagina** -- y el mismo origen nunca necesita permiso CORS. O sea que
  //     no habilitaban nada que no estuviera ya habilitado.
  // Lo malo no era el coste, era que **mentian**: parecia haber una politica
  // de acceso pensada, y el dia que cambiara el dominio habria dejado de
  // coincidir sin que nadie se enterara.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/**",
      },
    ],
  },
};

module.exports = nextConfig;
