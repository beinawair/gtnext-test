const { rules } = require(`./.xo-config.json`)

module.exports = {
  root: true,
  extends: [
    `eslint:recommended`,
    `plugin:@typescript-eslint/recommended`
  ],
  parser: `@typescript-eslint/parser`,
  plugins: [`@typescript-eslint`],
  ignorePatterns: [`node_modules`, `**/*deprecated*`, `**/*ts*`],
  overrides: [
    {
      files: [`*.ts`, `*.tsx`], // Your TypeScript files extension

      // As mentioned in the comments, you should extend TypeScript plugins here,
      // instead of extending them outside the `overrides`.
      // If you don't want to extend any rules, you don't need an `extends` attribute.
      extends: [
        `plugin:@typescript-eslint/recommended`,
        `plugin:@typescript-eslint/recommended-requiring-type-checking`,
      ],

      parserOptions: {
        project: [`./tsconfig.json`], // Specify it only for TypeScript files
      },
      rules: {
        ...rules,
        reportUnusedDisableDirectives: [0],
      },
    },
  ],
  rules: {
    // "@typescript-eslint/quotes": [2, "backtick"],
    "no-tabs": [2],
    indent: [`error`, 2],
    semi: [2, `never`],
    quotes: [2, `backtick`],
    "@typescript-eslint/no-var-requires": [1],
    curly: [2, `multi-or-nest`, `consistent`],
    "object-curly-spacing": [2, `always`],
    reportUnusedDisableDirectives: [0],
  },
}
