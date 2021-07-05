import babel from "@babel/core";
import { join, dirname } from 'path'
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const key1 = 'node/corejs.min.js'
const key2 = 'node/regenerator-runtime.js'
export default async function ({ debug, opts = {} }) {
  let { util: { isHtml, isJs }, config: { logger } } = this

  this.on('afterParse', (files) => {
    for (let file of files) {
      if (!isJs(file.key)) continue
      if (/\.min\.js$/.test(file.key)) continue
      if (/^node\/$/.test(file.key)) continue
      if (file.meta && file.meta.isMin) continue

      debug(`buble ${file.key}`)
      try {
        let presetsOpt = {
          "useBuiltIns": false
        }
        if (opts.targets) {
          presetsOpt.targets = opts.targets(file, this)
        }
        let presets = [
          [
            "@babel/env",
            presetsOpt
          ]
        ]
        let code = babel.transformSync(file.content, {
          presets
        }).code;

        code = code.replace(/function _classCallCheck.+/, '')
        code = code.replace(/function _defineProperties.+/, '')
        code = code.replace(/function asyncGeneratorStep.+/, '')
        code = code.replace(/function _asyncToGenerator.+/, '')
        code = code.replace(/function _createForOfIteratorHelper.+/, '')
        code = code.replace(/function _unsupportedIterableToArray.+/, '')
        code = code.replace(/function _arrayLikeToArray.+/, '')

        file.content = code

      }
      catch (error) {
        console.log(file.content)
        logger.error(`error when compile ${file.key}\n ${error.message}`, true)
      }
    }
  })

  this.on('afterKey', async function () {

    let path = join(__filename, '../corejs.min.js')

    let content = await this.fs.readFile(path)
    content.replace('sourceMappingURL','')
    this.files.push({
      meta: { isMin: true },
      key: key1,
      path,
      content
    })
  })
  this.on('afterGroup', function (files) {

    debug('babel on event beforeDep')

    for (let file of files) {
      if (!isHtml(file.key)) continue;
       //Pollyfill单独一组
      let babelGroup=[]
      if (opts.usePolyfill && opts.usePolyfill(file, this)) {
        babelGroup.push(key1)
      }
      babelGroup.push(key2)
      file.dep.jsList.unshift(babelGroup)
    }
  })
  this.on('afterKey', async function () {
    let prePath = dirname(require.resolve('regenerator-runtime'))
    let path = ''

    path = join(prePath, 'runtime.js')

    let content = await this.fs.readFile(path)
    content = `
    ${content}
    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }
    function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
    function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
    function _createForOfIteratorHelper(o, allowArrayLike) {
      var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() { }; return { s: F, n: function n() { if (i >= o.length) return { done: true };
      return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance. In order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
      var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } };
    }
    function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
    function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

    window._classCallCheck=_classCallCheck
    window._defineProperties=_defineProperties
    window.asyncGeneratorStep=asyncGeneratorStep
    window._asyncToGenerator=_asyncToGenerator
    
    window._createForOfIteratorHelper=_createForOfIteratorHelper
    window._unsupportedIterableToArray=_unsupportedIterableToArray
    window._arrayLikeToArray=_arrayLikeToArray
    `
    this.addFile({
      //无论是dev,还是pro都标识为 min，就是不压缩,不转换
      meta: { isMin: true },
      key: key2,
      path,
      content
    })
  })
}
