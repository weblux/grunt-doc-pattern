var handlebars = require('handlebars')
require('handlebars-helpers')({
  handlebars: handlebars
})

function register (grunt, options, files) {
  registerHelpers(grunt, options)
  registerPartials(grunt, files)
}

function registerHelpers (grunt, options) {
  grunt.file.recurse(options.helpers, function (abspath) {
    var helpers = require(process.cwd() + '/' + abspath)
    for (var helper in helpers) {
      if (helpers.hasOwnProperty(helper)) {
        handlebars.registerHelper(helper, helpers[helper])
      }
    }
  })
}

function registerPartials (grunt, files) {
  files.forEach(function (file) {
    file.src.forEach(function (filepath) {
      var path = filepath.split('/')
      var filename = path[path.length - 1].replace('.hbs', '')
      var section = path[2].replace(/\d*-/g, '')
      var partialName = section + '-' + filename
      var partial = grunt.file.read(filepath, { encoding: 'utf8' })
      handlebars.registerPartial(partialName, partial)
    })
  })
}

function createLiveExample (file) {
  if (file.datas.data === undefined) {
    return ''
  }
  var example = handlebars.compile(file.datas.pattern)
  var datas = extend({}, file.datas.data, {root: {site: {settings: {icons: 'filled'}}}})
  datas = file.datas.data
  example = example(datas)

  return `<h2>Example</h2>
          <div class="sandbox-example">
            ${example}
          </div>`
}

function extend () {
  var dest = arguments[0]
  var sources = Array.prototype.slice.call(arguments, 1)
  while (sources.length) {
    var source = sources.shift()
    for (var prop in source) {
      if (!source.hasOwnProperty(prop)) continue
      var propVal = source[prop]
      if (typeof propVal === 'object' && typeof dest[prop] === 'object') {
        dest[prop] = dest[prop] || {}
        extend(dest[prop], propVal)
      } else {
        dest[prop] = propVal
      }
    }
  }
  return dest
}

module.exports = {
  register: register,
  create: createLiveExample
}
