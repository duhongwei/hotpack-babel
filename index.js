const babel = require.resolve('@babel/core')
const preset = {
  "@babel/preset-es2015": require.resolve('@babel/preset-es2015'),
  "@babel/preset-react": require.resolve('@babel/preset-react')
}
//后续事先define需要的方法，然后再启用transformRuntime
//const transformRuntime = require.resolve('@babel/plugin-transform-runtime')
module.exports = function (opts = {}) {
  return function (files, metalsmith, done) {
    for (let file in files) {
      if (!/\.js$/.test(file)) {
        continue
      }

      const thisOpts = Object.assign({}, {
        filename: file,
        ast: false,
        presets: ["@babel/preset-es2015"],
        plugins: [
         /*  [
            transformRuntime, {
              "helpers": true,
              "polyfill": true,
            }
          ] */
        ]
      }, opts);

      thisOpts.presets = thisOpts.presets.map(item => preset[item])
      const res = require(babel).transform(files[file].contents, thisOpts);
      if (res !== null) {

        if (!res.ignored) {
          console.log(res.code)
          files[file].contents = res.code;
        }
      }
    }
    done()
  }
}