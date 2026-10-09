import next from "eslint-config-next";

const config = [
  ...next,
  { ignores: [".next/**", "node_modules/**", ".cache/**", ".local/**", ".npm/**", "backups/**", "reference/**"] },
];

export default config;
