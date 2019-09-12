const colors = require('colors');

const logo = "[XCLI]".bold.red;
const type_SPA = "[SPA]".bold.cyan;
const type_MPA = "[MPA]".bold.yellow;

module.exports = {
  [`${logo} Built-in Templates`]: {
    [`${type_SPA} [Single Page Application] React+(TS|ES6)+PUG`]: {
      [`${type_SPA} Typescript Template`]: "DemonCloud/cubec",
      [`${type_SPA} JavaScript Template`]: "DemonCloud/cubec",
    },
    [`${type_MPA} [Multiple Page Application] React+(TS|ES6)+PUG`]: {
      [`${type_MPA} Typescript Template`]: "DemonCloud/cubec",
      [`${type_MPA} JavaScript Template`]: "DemonCloud/cubec",
    },
    // "[MPWA] [Multiple Modules Progressed Web Application] React+(TS|ES6)+PUG": "DemonCloud/cubec"
  },
  [`${logo} Implements Plugin`]: {
    [`${logo} Plugin base on ${"abcx(1.0)".bold}`]: "DemonCloud/xcli-plugin-template"
  }
};
