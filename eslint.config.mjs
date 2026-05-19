import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/consistent-type-imports": ["warn", { prefer: "type-imports" }],
      "import/no-restricted-paths": [
        "error",
        {
          zones: [
            {
              target: "./src/features/map",
              from: "./src/features",
              except: ["./map"],
              message: "features/map cannot import from sibling features",
            },
            {
              target: "./src/features/place",
              from: "./src/features",
              except: ["./place"],
              message: "features/place cannot import from sibling features",
            },
            {
              target: "./src/features/search",
              from: "./src/features",
              except: ["./search"],
              message: "features/search cannot import from sibling features",
            },
            {
              target: "./src/features/trip",
              from: "./src/features",
              except: ["./trip"],
              message: "features/trip cannot import from sibling features",
            },
            {
              target: "./src/features/review",
              from: "./src/features",
              except: ["./review"],
              message: "features/review cannot import from sibling features",
            },
          ],
        },
      ],
    },
  },
];
