import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  {
    ignores: [".next/**", ".open-next/**", ".vercel/**"],
  },
  ...nextVitals,
];

export default eslintConfig;
