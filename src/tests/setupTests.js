
const Vue = require("vue");
const Vuex = require("vuex");
require('@testing-library/jest-dom')
require('@testing-library/jest-dom/extend-expect');

Vue.use(Vuex);

afterEach(() => {
    jest.resetAllMocks();
})