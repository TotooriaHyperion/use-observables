/* eslint-disable @typescript-eslint/no-var-requires */
const commander = require("commander");

commander.option("-c, --cov", "cov");
commander.option("-w, --watch", "watch");
commander.allowUnknownOption().parse(process.argv);

module.exports = {
  roots: ["<rootDir>"],
  // transform: {
  //   "^.+\\.ts$": "ts-jest",
  // },
  // watch 状态直接测试 TS 文件，不走module
  moduleNameMapper: commander.watch
    ? {
        "use-observables": "<rootDir>/src",
      }
    : {
        "use-observables": "<rootDir>/lib",
      },
  testRegex: "(__tests__/.*.(test|spec)).tsx?$",
  preset: "ts-jest/presets/js-with-babel",
  // collectCoverage: commander.cov,
  collectCoverage: true,
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  modulePathIgnorePatterns: ["example-.*/"],
  coveragePathIgnorePatterns: ["(__tests__/.*|.*.mock).(jsx?|tsx?)$", ".jsx?$"],
  // verbose: true,
  globals: {
    "ts-jest": {
      tsconfig: "./tsconfig.esm.json",
      isolatedModules: true,
    },
  },
};
