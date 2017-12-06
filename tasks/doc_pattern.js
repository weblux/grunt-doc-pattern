/*
 * grunt-doc-pattern
 * https://github.com/weblux/grunt-doc-pattern
 *
 * Copyright (c) 2017 Huntedpix
 * Licensed under the MIT license.
 */

'use strict'

var marked = require('marked')
var path = require('path')
var fs = require('fs')

marked.setOptions({
  smartypants: true,
  sanitize: false
})

module.exports = function (grunt) {
  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('doc_pattern', 'A grunt plugin to generate documentation directly from patterns files', function () {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      subfolder: 'patterns',
      template: '../templates/skizz',
      title: 'Pattern Doc'
    })

    var destinationRoot = this.target

    // Get all existing version and check if the docs is already generated
    var currentVersion = grunt.config.data.pkg.version
    var versions = getExistingVersion(destinationRoot + '/' + options.subfolder + '/')

    if (versions.indexOf(currentVersion) !== -1) {
      grunt.fail.warn('Patterns docs version ' + currentVersion + ' already exist.')
    }

    // Iterate over all specified file groups to extract content
    var files = this.files.map(function (file) {
      // Concat specified files.
      file.content = file.src.filter(function (filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.')
          return false
        } else {
          return true
        }
      }).map(function (filepath) {
        // Read file source and extract the usefull content for docs
        var fileContent = grunt.file.read(filepath, { encoding: 'utf8' })
        var docs = /---([^]*)---/g.exec(fileContent)

        return (docs !== null ? docs[1] : null)
      })[0]

      // Add versioning into the path and convert to html
      var path = file.dest.split('/')
      path.splice(2, 0, currentVersion)
      file.dest = path.join('/').replace('.hbs', '.html')

      // Create page title
      file.title = options.title + ' | ' + path[path.length - 1].substr()
      file['logo-title'] = options.title

      // Set root path
      file.root = setRootPath(file.dest)
      // Set assets path
      file.assets = setAssetsPath(file.root, destinationRoot, options.subfolder)

      return file
    })

    // Remove empty file
    files = files.filter(function (file) {
      return file.content !== null
    })

    // Collect navigation items
    var navigation = {}
    files.forEach(function (file) {
      var path = file.dest.split('/')
      var section = path[3]
      var filename = path[path.length - 1]

      if (navigation[section] === undefined) {
        navigation[section] = {
          name: section,
          href: path[0] + '/' + path[1] + '/' + path[2] + '/' + path[3] + '/index.html',
          items: []
        }
      }

      navigation[section].items.push({
        href: file.dest,
        name: filename.replace('.html', '')
      })
    })

    // Get partial
    var header = grunt.file.read(path.join(__dirname, '/', options.template, '/partial/header.hbs'))
    var footer = grunt.file.read(path.join(__dirname, '/', options.template, '/partial/footer.hbs'))

    // Write files
    files.forEach(function (file) {
      file.navigation = createNavigation(file, navigation)
      file.versions = createVersion(currentVersion, path.join(file.root, destinationRoot, options.subfolder, 'index.html'))
      header = assemble(header, file)
      footer = assemble(footer, file)

      // Markdown to HTML
      file.content = marked(file.content)

      var content = header + file.content + footer

      // Write the destination file.
      grunt.file.write(file.dest, content)

      // Print a success message.
      grunt.log.writeln('File "' + file.dest + '" created.')
    })

    // Copy assets
    grunt.file.recurse(path.join(__dirname, '/', options.template, '/assets/'), function (abspath, rootdir, subdir, filename) {
      grunt.file.copy(abspath, path.join(destinationRoot, options.subfolder, '/assets/', subdir, filename))
    })
  })

  function assemble (template, file) {
    return template.replace(/{{(.*)}}/g, function (match, key) {
      key = key.trim()
      return (file[key] !== undefined) ? file[key] : ''
    })
  }

  function createNavigation (file, navigation) {
    var html = `<nav class="page-headernav" id="headernav" role="navigation" aria-labeledby="#headernav-title">
                  <h1 id="headernav-title">Menu</h1>
                  <ul class="nav nav--primary">`

    for (var section in navigation) {
      var sectionLink = createRelativeLink(navigation[section].href, file)
      var sectionName = navigation[section].name
      html += '<li><a href="' + sectionLink + '">' + sectionName + '</a><ul class="subnav">'

      var items = navigation[section].items
      if (items.length) {
        var length = items.length
        var index

        for (index = 0; index < length; index++) {
          var className = 'class="' + ((navigation[section].items[index].href === file.dest) ? 'subnav-item subnav-item--active' : 'subnav-item') + '"'
          var link = createRelativeLink(navigation[section].items[index].href, file)
          var name = navigation[section].items[index].name
          html += '<li><a href="' + link + '" ' + className + '>' + name + '</a></li>'
        }
      }
      html += '</ul></li>'
    }

    html += '</ul></nav>'

    return html
  }

  function createRelativeLink (link, file) {
    return file.root + link
  }

  function createVersion (version, link) {
    return `<div class="doc-version">Version: ${version} - <a href="${link}">See all version</a></div>`
  }

  function setAssetsPath (roots, destination, subfolder) {
    return path.join(roots, destination, subfolder, 'assets/')
  }

  function setRootPath (path) {
    var roots = ''
    path = path.split('/')

    path.forEach(function (item, index) {
      if (index) {
        roots += '../'
      }
    })

    return roots
  }

  function getExistingVersion (path) {
    var versions = []
    try {
      versions = fs.readdirSync(path).filter(function (file) {
        return fs.statSync(path + '/' + file).isDirectory()
      })
    } catch (e) {}

    // Exclude assets folder from versions
    versions = versions.filter(function (version) {
      return version !== 'assets'
    })

    return versions
  }
}
