const camelcase = require("lodash.camelcase");

module.exports = {
  resolveFields: (source) => {
    let result = {};
    for (const [key, value] of Object.entries(source)) {
      let newValue = value;
      if (!!Object.keys(value).length) {
        newValue = module.exports.resolveFields(value);
      }
      result[camelcase(key)] = newValue;
    }
    return result;
  },
};
