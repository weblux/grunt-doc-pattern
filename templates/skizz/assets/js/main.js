(function () {
  'use strict'

  // Add class to every pre block to add line number
  document.querySelectorAll('pre').forEach(function (item) {
    item.className += 'line-numbers'
  })
})()
