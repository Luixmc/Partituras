// ─────────────────────────────────────────────────────────────
// Comprobación de estilo y errores comunes.
//
// 🔴 POR QUÉ ESTE ARCHIVO EXISTE Y NO EL `.eslintrc` DE ANTES:
// al subir a Next 16 (2026-08-22) **el comando `next lint` desapareció**, así
// que `npm run lint` llevaba una semana contestando «Invalid project
// directory: .../lint». O sea: había un comando que decía comprobar el código
// y **no comprobaba nada**. Nadie se entera de eso hasta que lo ejecuta.
//
// ESLint 9 usa este formato («flat config») en vez de `.eslintrc.json`, y es
// lo que exige `eslint-config-next` 16.
//
// Se ejecuta con `npm run lint`, y **no bloquea el CI**: ver el porqué abajo.
// ─────────────────────────────────────────────────────────────

// ⚠️ Se importa DIRECTAMENTE, sin el puente `FlatCompat`: `eslint-config-next`
// 16 ya viene en este formato, y pasarla por el puente la rompe con un
// «Converting circular structure to JSON» que no dice nada de la causa.
import next from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

export default [
  {
    // Nada de esto es código nuestro: son cosas generadas o de terceros.
    ignores: [
      "node_modules/**",
      ".next/**",
      ".next-verificar/**",
      ".pruebas-tmp/**",
      "public/pdf.worker.min.mjs", // el worker de PDF, copiado tal cual
      "next-env.d.ts",
      "layout.tsx",                // huérfano en la raíz, no lo usa nadie (P-10)
    ],
  },

  ...next,
  ...typescript,

  {
    rules: {
      // El proyecto viene con `"strict": false` en TypeScript y bastante `any`
      // heredado. Marcarlo todo como error convertiría el lint en ruido que
      // nadie mira — que es justo como se llega a un comando roto sin que se
      // note. Queda como AVISO: se ve, no bloquea.
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],

      // -- Las dos del compilador de React --
      //
      // BAJADAS A AVISO DESPUES DE REVISAR LOS NUEVE CASOS UNO A UNO, no para
      // que el lint se calle. Los nueve son el mismo patron, y en Next **no
      // tiene alternativa**: leer `localStorage` o `window.location` despues de
      // montar. El servidor no tiene ninguna de las dos, asi que leerlas
      // durante el render romperia la pagina -- de hecho varios de esos
      // efectos ya llevaban escrito al lado por que estan asi.
      //
      // La regla acierta en general (evitar renders en cascada) y **no acierta
      // aqui**. Si algun dia aparece un caso que si sea un fallo, se ve igual:
      // sigue saliendo, en amarillo.
      "react-hooks/set-state-in-effect": "warn",
      // Nota de optimizacion del compilador, no un fallo: avisa de que no pudo
      // conservar un `useMemo` escrito a mano. La pagina funciona igual.
      "react-hooks/preserve-manual-memoization": "warn",
    },
  },
];
