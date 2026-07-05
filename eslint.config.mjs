import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  {
    rules: {
      // Texte français dans le JSX : les apostrophes ne doivent pas casser le build.
      "react/no-unescaped-entities": "off",
      // ADR (voir ARCHITECTURE.md) : ces patterns setState-dans-effet sont nos hydratations
      // volontaires SSR-safe (localStorage → état après montage). Rétrogradés en avertissement
      // pour que la CI reste au vert sans masquer les nouveaux cas (visibles dans le rapport).
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/immutability": "warn", // mutation des particules canvas du splash (physique animée)
      "react-hooks/refs": "warn", // ringRef synchronisée au rendu (fix documenté du bug de boucle Leaflet)
    },
  },
]);

export default eslintConfig;
