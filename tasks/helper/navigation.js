function create (file, navigation) {
  var html = `<nav class="page-headernav" id="headernav" role="navigation" aria-labeledby="#headernav-title">
                <h1 id="headernav-title">Menu</h1>
                <div class="nav-section nav-section--primary">
                  <ul class="nav nav--primary">`

  for (var section in navigation) {
    var sectionLink = createRelativeLink(navigation[section].href, file)
    var sectionName = navigation[section].name
    var id = Math.floor(Math.random() * 1000) + 1
    var items = navigation[section].items
    var length = items.length
    var active = (navigation[section].href === file.dest) ? ' nav-item--active' : ''
    if (active === '' && length) {
      navigation[section].items.forEach(function (item) {
        if (item.href === file.dest) {
          active = ' nav-item--active'
        }
      })
    }
    var hasSubnav = length ? ' nav-item--has-subnav' : ''

    html += `<li class="nav-item ${hasSubnav}${active}">
              <a href="${sectionLink}">${sectionName}</a>`

    if (length) {
      html += `<a href="#subnav-${id}" class="subnav-anchor" title="Afficher le sous-menu de ${sectionName}">
                  <svg class="icon" viewBox="0 0 24 24" width="24" height="24">
                    <use xlink:href="#icon-subnav-anchor" x="0" y="0" />
                  </svg>
                </a>
                <ul id="subnav-${id}" class="subnav">`

      navigation[section].items.forEach(function (item) {
        var className = (item.href === file.dest) ? ' subnav-item--active' : ''
        var link = createRelativeLink(item.href, file)

        html += `<li class="subnav-item${className}"><a href="${link}">${item.name}</a></li>`
      })
    }
    html += '</ul></li>'
  }

  html += '</ul></div></nav>'

  return html
}

function createRelativeLink (link, file) {
  return file.root + link
}

function check (file) {
  if (file.datas !== null) {
    var name = file.dest.split('/')
    name = name[name.length - 1].replace('.hbs', '')

    if (file.datas.navigation === undefined) {
      file.datas.navigation = {
        section: 'misc',
        name: name
      }
    } else {
      if (file.datas.navigation.section === undefined) {
        file.datas.navigation['section'] = 'Misc'
      }
      if (file.datas.navigation.name === undefined) {
        file.datas.navigation['name'] = name
      }
    }
  }

  return file
}

function collect (files, destination) {
  var navigation = {}
  files.forEach(function (file) {
    var section = file.datas.navigation.section
    var filename = file.datas.navigation.name

    if (navigation[section] === undefined) {
      navigation[section] = {
        name: section,
        href: destination + '/' + section + '/index.html',
        items: []
      }
    }

    navigation[section].items.push({
      href: file.dest,
      name: filename
    })
  })

  return navigation
}

module.exports = {
  create: create,
  check: check,
  collect: collect
}
