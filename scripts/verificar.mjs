// Compila el proyecto SIN tocar el `.next` que está usando el servidor de
// desarrollo, para poder comprobar que un cambio compila con el servidor
// encendido. Compilar encima del `.next` de desarrollo lo deja inservible
// (T-04), y `npm run build` es lo que ejecuta Vercel: no se toca.
import { spawnSync } from "node:child_process";

const r = spawnSync("npx", ["next", "build"], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, NEXT_DIST_DIR: ".next-verificar" },
});
process.exit(r.status ?? 1);
