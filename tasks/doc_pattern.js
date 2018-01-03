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
var YAML = require('yamljs')
var nav = require('./helper/navigation')

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
      file.datas = file.src.filter(function (filepath) {
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

        return (docs !== null ? YAML.parse(docs[1]) : null)
      })[0]

      if (file.datas === null) {
        return file
      }

      file = nav.check(file)

      // Add versioning into the path and convert to html
      file.dest = path.join(destinationRoot, options.subfolder, currentVersion, file.datas.navigation.section, file.datas.navigation.name) + '.html'

      // Create page title
      file.title = options.title + ' | ' + file.datas.navigation.name
      file['logo-title'] = options.title

      // Set root path
      file.root = setRootPath(file.dest)
      // Set assets path
      file.assets = setAssetsPath(file.root, destinationRoot, options.subfolder)

      return file
    })

    // Remove empty file
    files = files.filter(function (file) {
      return file.datas !== null
    })

    // Collect navigation items
    var navigation = nav.collect(files, destinationRoot + '/' + options.subfolder + '/' + currentVersion)

    // Add all version index into files
    files.push(allVersionIndex(versions, currentVersion, options, destinationRoot))

    // Add home index into files
    files.push(homeIndex(navigation, options, currentVersion, destinationRoot))

    // Add section index into files
    for (var section in navigation) {
      files.push(sectionIndex(navigation, section, options, currentVersion, destinationRoot))
    }

    // Get partial
    var header = grunt.file.read(path.join(__dirname, '/', options.template, '/partial/header.hbs'))
    var footer = grunt.file.read(path.join(__dirname, '/', options.template, '/partial/footer.hbs'))

    // Write files
    files.forEach(function (file, index) {
      file.navigation = nav.create(file, navigation)
      file.versions = createVersion(currentVersion, path.join(file.root, destinationRoot, options.subfolder, 'index.html'))

      // Markdown to HTML and partial
      var content = assemble(header, file, index) + marked(file.datas.description) + assemble(footer, file, index)

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

  function createVersion (version, link) {
    return `<div class="doc-version">Version: ${version} - <a href="${link}">See all version</a></div>`
  }

  function setAssetsPath (roots, destination, subfolder) {
    return path.join(roots, destination, subfolder, 'assets/')
  }

  function setRootPath (path) {
    var roots = ''
    path = path.split('\\')

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

  function allVersionIndex (versions, currentVersion, options, destinationRoot) {
    if (versions.indexOf(currentVersion) === -1) {
      versions.push(currentVersion)
    }

    var content = '<ul>'
    versions.forEach(function (version) {
      content += '<li><a href="./' + version + '/index.html">' + version + '</a></li>'
    })
    content += '</ul>'

    return {
      title: options.title,
      'logo-title': options.title,
      dest: `${destinationRoot}/${options.subfolder}/index.html`,
      datas: {
        description: content
      },
      root: '../../',
      assets: `../../${destinationRoot}/${options.subfolder}/assets/`
    }
  }

  function homeIndex (navigation, options, currentVersion, destinationRoot) {
    var content = '<ul>'

    for (var section in navigation) {
      content += '<li><a href="./' + navigation[section].name + '/index.html">' + navigation[section].name + '</a></li>'
    }
    content += '</ul>'

    return {
      title: options.title + ' | ' + currentVersion,
      'logo-title': options.title,
      dest: `${destinationRoot}/${options.subfolder}/${currentVersion}/index.html`,
      datas: {
        description: content
      },
      root: '../../../',
      assets: `../../../${destinationRoot}/${options.subfolder}/assets/`
    }
  }

  function sectionIndex (navigation, section, options, currentVersion, destinationRoot) {
    var content = '<ul>'

    navigation[section].items.forEach(function (item) {
      content += '<li><a href="./' + item.name + '.html">' + item.name + '</a></li>'
    })
    content += '</ul>'

    return {
      title: options.title + ' | ' + navigation[section].name,
      'logo-title': options.title,
      dest: `${destinationRoot}/${options.subfolder}/${currentVersion}/${section}/index.html`,
      datas: {
        description: content
      },
      root: '../../../../',
      assets: `../../../../${destinationRoot}/${options.subfolder}/assets/`
    }
  }
}
