module.exports = {
    "moduleFileExtensions": ['js', 'json', 'ts', 'vue'],
    "roots": [
        "<rootDir>/src"
    ],
    "transform": {
        "^.+\\.(ts|tsx)$": "ts-jest",
        "^.\\.(js)$": "babel-jest",
        '^.+\\.vue$': '@vue/vue2-jest',
    },
    "globals": {
        "__DEV__": true
    },
    "moduleNameMapper": {
        "^@/(.*)$": "<rootDir>/src/$1"
    },
    "setupFilesAfterEnv": ["<rootDir>/src/tests/setupTests.js"],
    "testEnvironment": "jsdom"
}