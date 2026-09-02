import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

export default createJestConfig({
    displayName: "graphood",
    testEnvironment: "node",
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
    },
    testMatch: ["<rootDir>/tests/**/*.(test|spec).(ts|tsx)"],
    collectCoverageFrom: [
        "src/shared/lib/actions/**/*.ts",
        "src/shared/lib/supabase/services/**/*.ts",
        "!**/index.ts",
    ],
});
