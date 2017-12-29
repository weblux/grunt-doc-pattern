(function () {
  'use strict';

  function Skizz(selection, context) {
    var _this = this;

    this.length = selection.length;
    this.context = context || null;

    selection.forEach(function (element, index) {
      return _this[index] = element;
    });
  }

  var queue = [];

  /**
   * ready - Execute the function when the dom is ready
   *
   * @param  {function} fn The function to execute
   * @return {void}
   */
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', run);
      queue.push(fn);
      return;
    }

    fn();
  }

  /**
   * run - Execute the queue
   *
   * @return {void}
   */
  function run() {
    while (queue.length) {
      window.setTimeout(queue.shift(), 0);
    }
  }

  /**
   * extend - Extend an object with additional properties
   *
   * @param  {object} target The object to extend
   * @param  {object} ...mixins The object with additional properties
   * @return {object} The object extended
   */
  function extend(target) {
    var i = -1;
    var length = arguments.length <= 1 ? 0 : arguments.length - 1;

    while (++i < length) {
      var mixin = arguments.length <= i + 1 ? undefined : arguments[i + 1];

      for (var prop in mixin) {
        if (!mixin.hasOwnProperty(prop)) {
          continue;
        }

        Object.defineProperty(target, prop, {
          value: mixin[prop],
          enumerable: true,
          writable: true
        });
      }
    }

    return target;
  }

  var lang = document.documentElement.lang || 'en';

  /**
   * get - Get a translation
   *
   * @param  {object} i18n The translation with all available language
   * @return {object} The language needed
   */
  function getI18N(i18n) {
    return i18n[lang] !== undefined ? i18n[lang] : i18n['root'];
  }

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };











  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var Widgets = function () {
    function Widgets() {
      classCallCheck(this, Widgets);

      this.widgets = {};
      this.options = {};
    }

    Widgets.prototype.register = function register(widget) {
      this.widgets[widget.id] = widget(this, this.options[widget.id] || {});
      return this;
    };

    Widgets.prototype.unregister = function unregister(widget) {
      this.plugins[widget.id].destroy();
      return this;
    };

    return Widgets;
  }();

  /**
   * skizz - description
   *
   * @private
   * @param  {string|function|object|array} selector The css selector to search for matching element
   * @param  {object} [root] The context for selector
   * @return {object} skizz
   */
  function skizz$1(selector, root) {
    var selType = typeof selector === 'undefined' ? 'undefined' : _typeof(selector);

    if (selType === 'string' && selector.charAt(0) === '<') {
      var div = document.createElement('div');
      div.innerHTML = selector;
      return new Skizz([].slice.call(div.childNodes));
    }

    if (selType === 'string') {
      if (root !== undefined) {
        root = root.length ? root[0] : root;
      } else {
        root = document;
      }
      return new Skizz([].slice.call(root.querySelectorAll(selector)));
    }

    if (selType === 'function') {
      return skizz$1.ready(selector);
    }

    if (selector instanceof Skizz) {
      return selector;
    }

    if (selector instanceof window.HTMLElement) {
      return new Skizz([selector]);
    }

    if (selector instanceof Array) {
      return new Skizz(selector);
    }

    if (selector instanceof window.NodeList || selector instanceof window.HTMLCollection) {
      return new Skizz([].slice.call(selector));
    }

    return new Skizz([document]);
  }

  skizz$1.fn = Skizz.prototype;
  skizz$1.ready = ready;
  skizz$1.extend = extend;
  skizz$1.i18n = getI18N;
  skizz$1.Widgets = Widgets;

  /**
   * each - Apply a function on each item of an array
   *
   * @param  {array} collection The collection to run against the function
   * @param  {function} fn The function to apply on each item from the collection
   * @return {array} The collection
   */
  function each(collection, fn) {
    var index = -1;
    var length = collection.length;
    var val = void 0;

    while (++index < length) {
      val = fn.call(collection[index], index, collection);
      if (val === false) {
        break;
      }
    }

    return collection;
  }

  /**
   * isFunction - Determine if the argument passed is a function
   *
   * @param  {function} obj The argument to test if it's a function
   * @return {boolean} True if the argument passed is a function false otherwise
   */
  function isFunction(obj) {
    return !!(obj && obj.constructor && obj.call && obj.apply);
  }

  function stringSorting(collection, filter, skizz) {
    if (!filter.charAt(0) === ':') {
      return instanceSorting(collection, skizz(filter));
    } else {
      if (filter === ':even') {
        filter = function filter(index) {
          return index % 2 !== 0;
        };
      } else if (filter === ':odd') {
        filter = function filter(index) {
          return index % 2 === 0;
        };
      } else {
        filter = function filter() {
          return true;
        };
      }

      return fnSorting(collection, filter);
    }
  }

  function fnSorting(collection, filter) {
    var index = -1;
    var length = collection.length;
    var keep = [];

    while (++index < length) {
      if (filter(index, collection[index])) {
        keep.push(collection[index]);
      }
    }

    return keep;
  }

  function elementSorting(collection, filter) {
    var index = -1;
    var length = collection.length;
    var keep = [];

    while (++index < length) {
      if (collection[index] === filter) {
        keep.push(collection[index]);
      }
    }

    return keep;
  }

  function instanceSorting(collection, filter) {
    var index = -1;
    var filterIndex = void 0;
    var collectionLength = collection.length;
    var filterLength = filter.length;
    var keep = [];

    while (++index < collectionLength) {
      for (filterIndex = 0; filterIndex < filterLength; filterIndex++) {
        if (collection[index] === filter[filterIndex]) {
          keep.push(collection[index]);
        }
      }
    }

    return keep;
  }

  function filter(collection, filter) {
    var keep = [];

    if (typeof filter === 'string') {
      keep = stringSorting(collection, filter, this);
    }

    if (isFunction(filter)) {
      keep = fnSorting(collection, filter);
    }

    if ((typeof filter === 'undefined' ? 'undefined' : _typeof(filter)) === 'object') {
      if (filter.context !== undefined) {
        keep = instanceSorting(collection, filter);
      } else {
        keep = elementSorting(collection, filter);
      }
    }

    return keep.length ? this(keep) : collection;
  }

  /**
   * map - Apply a function on each item
   *
   * @param  {object} collection The collection to run against the function
   * @param  {type} fn The function to apply on each item from the collection
   * @return {array} The result of the function apply
   */
  function map(collection, fn) {
    var results = [];
    var i = -1;
    var length = collection.length;

    while (++i < length) {
      results[i] = fn.call(collection[i], i, collection);
    }

    return results;
  }

  /**
   * once - Run only once a function against the whole collection
   *
   * @param  {array} collection The collection to run against the function
   * @param  {function} predicate  The collection to run against the function
   * @return {boolean}
   */
  function once(collection, predicate) {
    var i = collection.length;

    while (i--) {
      if (predicate.call(collection[i], i, collection)) {
        return true;
      } else {
        return false;
      }
    }
  }

  skizz$1.fn.each = function (fn) {
    return each(this, fn);
  };

  skizz$1.fn.filter = function (selector) {
    return filter.apply(skizz$1, [this, selector]);
  };

  skizz$1.fn.map = function (fn) {
    return map(this, fn);
  };

  skizz$1.fn.once = function (fn) {
    return once(this, fn);
  };

  /**
   * css - Get or set css property to the collections
   *
   * @param  {string | object} prop    The property to get or set
   * @param  {string}          [value] The value to set to the property
   * @return {string | object}         The property value if value is undefined Skizz otherwise
   */
  function css(prop, value) {
    if (typeof prop === 'string' && value === undefined && this.length) {
      return window.getComputedStyle(this[0]).getPropertyValue(prop, null);
    }

    return this.each(function () {
      if (typeof prop === 'string') {
        this.style.setProperty(prop, value);
      } else {
        var str = [];
        for (value in prop) {
          if (!prop.hasOwnProperty(value)) {
            continue;
          }
          str.push(value + ':' + prop[value]);
        }
        this.style.cssText += str.join(';');
      }
    });
  }

  function attr(name, value) {
    if (arguments.length === 1 && typeof name === 'string') {
      return this.length ? this[0].getAttribute(name) : undefined;
    }

    return this.each(function () {
      if (value !== undefined && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) !== 'object') {
        this.setAttribute(name, value);
      } else {
        for (var attribute in name) {
          if (!name.hasOwnProperty(attribute)) {
            continue;
          }
          this.setAttribute(attribute, name[attribute]);
        }
      }
    });
  }

  /**
   * hasAttr - Check if the element has a specific attribute
   *
   * @param  {string} attribute The attribute to search for
   * @return {boolean} True if the className is set on the element false otherwise
   */
  function hasAttr(attribute) {
    return this.once(function () {
      return this.hasAttribute(attribute);
    });
  }

  /**
   * removeAttr - Remove attribute
   *
   * @param  {string} name The attribute to remove
   * @return {object} skizz
   */
  function removeAttr(name) {
    return this.each(function () {
      this.removeAttribute(name);
    });
  }

  /**
   * text - Get or set the text content
   *
   * To get the content, juste pass the text parameter
   *
   * @param  [{string}] text The text to set
   * @return {object}      skizz
   */
  function text(text) {
    if (arguments.length === 0 && this.length) {
      return this[0].textContent;
    }

    return this.each(function () {
      this.textContent = text;
    });
  }

  /**
   * addClass - Add one or more classname to an element
   *
   * @param  {string} className The classname to add
   * @return {void}
   */
  function addClass(className) {
    /**
     * classNameArray - Trim the classname than split the string whit a space
     * as a seperator into an array of substring
     *
     * @param  {string} className The string classname to transform
     * @return {array} An array of each className to add
     */
    function classNameArray(className) {
      var wsRE = /\s+/;
      return className.trim().split(wsRE);
    }

    /**
     * addClassStandard - Standard addClass implementation
     *
     * @param  {node} element The HTML element to add classname
     * @param  {string} className The class to add
     * @return {void}
     */
    function addClassStandard(element, className) {
      className = classNameArray(className);

      var i = className.length;
      while (i--) {
        element.classList.add(className[i]);
      }
    }

    /**
     * addClassCompat - The shim addClass implementation
     *
     * @param  {node} element The HTML element to add classname
     * @param  {string} className The class to add
     * @return {void}
     */
    function addClassCompat(element, className) {
      className = classNameArray(className);

      var replaced = element.className;
      var i = className.length;
      while (i--) {
        if (!new RegExp('^|\\s' + className[i] + '\\s|$').test(replaced)) {
          replaced += ' ' + className[i];
        }
      }
      element.className = replaced;
    }

    return 'classList' in document.documentElement ? this.each(function () {
      addClassStandard(this, className);
    }) : this.each(function () {
      addClassCompat(this, className);
    });
  }

  /**
   * hasClass - Check if the element has a specific className
   *
   * @param  {string} className The className to search for
   * @return {boolean} True if the className is set on the element false otherwise
   */
  function hasClass(className) {
    /**
     * hasClassStandard - Standard hasClass implementation
     *
     * @param  {type} element The HTML node to check if it contains the className
     * @param  {string} className The className to search for
     * @return {boolean} True if the className is set on the element false otherwise
     */

    function hasClassStandard(element, className) {
      return element.classList.contains(className);
    }

    /**
     * hasClassCompat - Shim hasClass implementation
     *
     * @param  {node} element The HTML node to check if it contains the className
     * @param  {string} className The className to search for
     * @return {boolean} True if the className is set on the element false otherwise
     */
    function hasClassCompat(element, className) {
      if (!element.className) {
        return false;
      }

      return new RegExp('^|\\s' + className + '\\s|$').test(element.className);
    }

    return 'classList' in document.documentElement ? this.once(function () {
      return hasClassStandard(this, className);
    }) : this.once(function () {
      return hasClassCompat(this, className);
    });
  }

  /**
   * removeClass - Remove one or more classname to an element
   *
   * @param  {string} className The classname to remove
   * @return {void}
   */
  function removeClass(className) {
    /**
     * classNameArray - Trim the classname than split the string whit a space
     * as a seperator into an array of substring
     *
     * @param  {string} className The string classname to transform
     * @return {array} An array of each className to remove
     */
    function classNameArray(className) {
      var wsRE = /\s+/;
      return className.trim().split(wsRE);
    }

    /**
     * removeClassStandard - Standard removeClass implementation
     *
     * @param  {node} element The HTML element to remove classname
     * @param  {string} className The class to remove
     * @return {void}
     */
    function removeClassStandard(element, className) {
      if (!element.className) {
        return false;
      }

      className = classNameArray(className);

      var i = className.length;
      while (i--) {
        element.classList.remove(className[i]);
      }
    }

    /**
     * removeClassCompat - The shim removeClass implementation
     *
     * @param  {node} element The HTML element to remove classname
     * @param  {string} className The class to remove
     * @return {void}
     */
    function removeClassCompat(element, className) {
      className = classNameArray(className);

      var replaced = element.className;
      var i = className.length;
      while (i--) {
        var regex = new RegExp('^|\\s' + className[i] + '\\s|$');
        if (regex.test(replaced)) {
          replaced = replaced.replace(regex, '');
        }
      }
      element.className = replaced;
    }

    return 'classList' in document.documentElement ? this.each(function () {
      removeClassStandard(this, className);
    }) : this.each(function () {
      removeClassCompat(this, className);
    });
  }

  /**
   * toggleClass - Toggle a specific className
   *
   * @param  {string} className The classname to add or remove
   * @return {void}
   */
  function toggleClass(className) {
    /**
     * toggleClassStandard - Standard toggleClass implementation
     *
     * @param  {node} element The HTML element to add or remove className
     * @param  {string} className The class to add or remove
     * @return {void}
     */
    function toggleClassStandard(element, className) {
      return element.classList.toggle(className);
    }

    /**
     * toggleClassCompat - The shim toggleClass implementation
     *
     * @param  {node} element The HTML element to add or remove className
     * @param  {string} className The class to add or remove
     * @return {void}
     */
    function toggleClassCompat(element, className) {
      var regex = new RegExp('^|\\s' + className + '\\s|$');
      if (regex.test(element.className)) {
        element.className = element.className.replace(regex, '');
      } else {
        element.className += ' ' + className;
      }
    }

    return 'classList' in document.documentElement ? this.each(function () {
      toggleClassStandard(this, className);
    }) : this.each(function () {
      toggleClassCompat(this, className);
    });
  }

  /**
   * after - Insert an html fragment after an element
   *
   * @param  {node|string} fragment The HTML fragment to insert
   * @return {object} skizz
   */
  function after(fragment) {
    if (typeof fragment === 'string') {
      return this.htmlAfter(fragment);
    }

    if (fragment.length) {
      fragment = fragment[0];
    }

    return this.each(function (index) {
      this.parentNode.insertBefore(index > 0 ? fragment.cloneNode(true) : fragment, this.nextSibling);
    });
  }

  /**
   * append - Append an html fragment into an element
   *
   * @param  {node|string} fragment The HTML fragment to insert
   * @return {object} skizz
   */
  function append(fragment) {
    if (typeof fragment === 'string') {
      return this.htmlAppend(fragment);
    }

    return this.each(function (index) {
      this.appendChild(index > 0 ? fragment.cloneNode(true) : fragment);
    });
  }

  /**
   * before - Insert an html fragment before an element
   *
   * @param  {node|string} fragment The HTML fragment to insert
   * @return {object} skizz
   */
  function before(fragment) {
    if (typeof fragment === 'string') {
      return this.htmlBefore(fragment);
    }

    if (fragment.length) {
      fragment = fragment[0];
    }

    return this.each(function (index) {
      this.parentNode.insertBefore(index > 0 ? fragment.cloneNode(true) : fragment, this);
    });
  }

  /**
   * prepend - Prepend an html fragment into an element
   *
   * @param  {node|string} fragment The HTML fragment to insert
   * @return {object} skizz
   */
  function prepend(fragment) {
    if (typeof fragment === 'string') {
      return this.htmlPrepend(fragment);
    }

    return this.each(function (index) {
      this.insertBefore(index > 0 ? fragment.cloneNode(true) : fragment, this.firstChild);
    });
  }

  /**
   * remove - Remove an element from the dom
   *
   * @return {object}  Skizz
   */
  function remove() {
    return this.each(function () {
      this.parentNode.removeChild(this);
    });
  }

  /**
   * html - Get or set html element
   *
   * @param  [{node|string}] fragment The HTML fragment to append
   * @return {object} skizz
   */
  function html(html) {
    if (arguments.length === 0 && this.length) {
      return this[0].innerHTML;
    }

    return this.each(function () {
      this.innerHTML = html;
    });
  }

  /**
   * insertHtml - Generic insert HTML string by position
   *
   * @private
   * @param  {string} position The position where to insert the element
   * @return {object} skizz
   */
  function insertHtmlMixin(position) {
    /**
     * insertHtml - insert HTML string
     *
     * @private
     * @param  {string} html The HTML to insert
     * @return {object} skizz
     */
    return function insertHtml(html) {
      return this.each(function () {
        this.insertAdjacentHTML(position, html);
      });
    };
  }

  /**
   * insert HTML string after the element
   * @function htmlAfter
   * @param  {string} html The HTML to insert
   * @return {object} skizz
   */
  var htmlAfter = insertHtmlMixin('afterend');

  /**
   * insert HTML string after the element
   * @function htmlAppend
   * @param  {string} html The HTML to insert
   * @return {object} skizz
   */
  var htmlAppend = insertHtmlMixin('beforeend');

  /**
   * insert HTML string after the element
   * @function htmlBefore
   * @param  {string} html The HTML to insert
   * @return {object} skizz
   */
  var htmlBefore = insertHtmlMixin('beforebegin');

  /**
   * insert HTML string after the element
   * @function htmlPrepend
   * @param  {string} html The HTML to insert
   * @return {object} skizz
   */
  var htmlPrepend = insertHtmlMixin('afterbegin');

  function prev() {
    var previous = this.map(function () {
      var prev = this.previousSibling;
      while (prev !== null && prev.nodeType === 3) {
        prev = prev.previousSibling;
      }
      return prev;
    });

    previous = previous.filter(function (item) {
      return item !== null;
    });

    return previous.length !== 0 ? skizz$1(previous) : null;
  }

  function next() {
    var next = this.map(function () {
      var next = this.nextSibling;
      while (next !== null && next.nodeType === 3) {
        next = next.nextSibling;
      }
      return next;
    });

    next = next.filter(function (item) {
      return item !== null;
    });

    return next.length !== 0 ? skizz$1(next) : null;
  }

  // Style manipulation
  // Element manipulation
  // Classname manipulation
  // Fragment insertion
  // Dom traversing
  // Style manipulation
  skizz$1.fn.css = css;

  // Element manipulation
  skizz$1.fn.attr = attr;
  skizz$1.fn.hasAttr = hasAttr;
  skizz$1.fn.removeAttr = removeAttr;
  skizz$1.fn.text = text;

  // ClassName manipulation
  skizz$1.fn.addClass = addClass;
  skizz$1.fn.hasClass = hasClass;
  skizz$1.fn.removeClass = removeClass;
  skizz$1.fn.toggleClass = toggleClass;

  // Fragment insertion
  skizz$1.fn.after = after;
  skizz$1.fn.append = append;
  skizz$1.fn.before = before;
  skizz$1.fn.prepend = prepend;
  skizz$1.fn.remove = remove;

  skizz$1.fn.html = html;
  skizz$1.fn.htmlBefore = htmlBefore;
  skizz$1.fn.htmlAfter = htmlAfter;
  skizz$1.fn.htmlAppend = htmlAppend;
  skizz$1.fn.htmlPrepend = htmlPrepend;

  // Dom traversing
  skizz$1.fn.prev = prev;
  skizz$1.fn.next = next;

  /**
   * Fire an event handler to the specified node. Event handlers can detect that the event was fired programatically
   * by testing for a 'synthetic=true' property on the event object
   * @param {HTMLNode} node The node to fire the event handler on.
   * @param {String} eventName The name of the event without the 'on' (e.g., 'focus')
   */
  function fireEvent(node, eventName) {
    // Make sure we use the ownerDocument from the provided node to avoid cross-window problems
    var doc = void 0;
    var event = void 0;

    if (node.ownerDocument) {
      doc = node.ownerDocument;
    } else if (node.nodeType === 9) {
      // the node may be the document itself, nodeType 9 = DOCUMENT_NODE
      doc = node;
    } else {
      throw new Error('Invalid node passed to fireEvent: ' + node.id);
    }

    if (node.dispatchEvent) {
      // Gecko-style approach (now the standard) takes more work
      var eventClass = '';

      // Different events have different event classes.
      // If this switch statement can't map an eventName to an eventClass,
      // the event firing is going to fail.
      switch (eventName) {
        // Dispatching of 'click' appears to not work correctly in Safari. Use 'mousedown' or 'mouseup' instead.
        case 'click':
        case 'mousedown':
        case 'mouseup':
          eventClass = 'MouseEvents';
          break;

        case 'focus':
        case 'change':
        case 'blur':
        case 'select':
          eventClass = 'HTMLEvents';
          break;
      }
      event = doc.createEvent(eventClass);

      var bubbles = eventName !== 'change';
      event.initEvent(eventName, bubbles, true); // All events created as bubbling and cancelable.

      event.synthetic = true; // allow detection of synthetic events
      node.dispatchEvent(event, true);
    } else if (node.fireEvent) {
      // IE-old school style
      event = doc.createEventObject();
      event.synthetic = true; // allow detection of synthetic events
      node.fireEvent('on' + eventName, event);
    }
  }

  function fire(types) {
    types = types.split(' ');
    return this.each(function () {
      var _this = this;

      types.forEach(function (type) {
        fireEvent(_this, type);
      });
    });
  }

  /**
   * checkArguments - As some parameters are optionnal, check and set each
   * parameters properly
   *
   * @param  {string} types The types of event to set
   * @param  {string} [selector] The selector for delegation
   * @param  {function} handler The function handling the event
   * @private
   * @return {object} arguments
   */
  function checkArguments(types, selector, handler) {
    if (arguments.length === 2 && isFunction(selector)) {
      handler = selector;
      selector = '_self';
    }
    //
    // if (arguments.length === 3 && isFunction(data)) {
    //   handler = data
    //   if (typeof selector !== 'string') {
    //     data = selector
    //     selector = '_self'
    //   } else {
    //     data = undefined
    //   }
    // }

    return {
      types: types,
      selector: selector,
      handler: handler
    };
  }

  function off(types, selector, handler) {
    var parameters = checkArguments.apply(undefined, arguments);

    types = parameters.types;
    selector = parameters.selector;
    handler = parameters.handler;

    types = types.split(' ');
    return this.each(function () {
      var _this = this;

      if (!this.SkizzHandlers) {
        return;
      }

      types.forEach(function (type) {
        var listeners = _this.SkizzHandlers[type];

        if (!listeners) {
          return;
        }

        listeners.forEach(function (listener, index) {
          if (listener.selector === selector && listener.originalCallback === handler) {
            _this.removeEventListener(type, listener.callback);
            _this.SkizzHandlers[type] = listeners.splice(index, 1);
          }
        });
      });
    });
  }

  function delegate(selector, handler) {
    return function (event) {
      skizz$1(selector).each(function () {
        if (this.contains(event.target)) {
          handler(event);
        }
      });
    };
  }

  function on(types, selector, handler) {
    var parameters = checkArguments.apply(undefined, arguments);

    types = parameters.types;
    selector = parameters.selector;
    handler = parameters.handler;

    var originalCallback = handler;

    if (selector !== '_self' && selector !== null) {
      handler = delegate(selector, handler);
    }

    types = types.split(' ');
    return this.each(function () {
      var _this = this;

      this.SkizzHandlers = this.SkizzHandlers || {};

      types.forEach(function (type) {
        _this.SkizzHandlers[type] = _this.SkizzHandlers[type] || [];
        _this.SkizzHandlers[type].push({
          selector: selector,
          callback: handler,
          originalCallback: originalCallback
        });
        _this.addEventListener(type, handler);
      });
    });
  }

  function one(types, selector, handler) {
    var parameters = checkArguments.apply(undefined, arguments);

    types = parameters.types;
    selector = parameters.selector;
    handler = parameters.handler;

    var that = this;
    var oneHandler = function oneHandler(event) {
      handler.apply(undefined, arguments);
      that.filter(this).off(event.type, selector, oneHandler);
    };

    return this.on(types, selector, oneHandler);
  }

  skizz$1.fn.fire = fire;
  skizz$1.fn.off = off;
  skizz$1.fn.on = on;
  skizz$1.fn.one = one;

  /**
   * hash - Get an hash of the passed argument
   * Usefull to generate a key for localStorage based on the current url
   *
   * @param  {string} string The string to hash
   * @return {number} The hash of the passed argument
   */
  function hash(string) {
    var hash = 0;

    if (string.length === 0) {
      return hash;
    }

    var chara = void 0;
    var i = void 0;
    var length = string.length;

    for (i = 0; i < length; i++) {
      chara = string.charCodeAt(i);
      hash = (hash << 5) - hash + chara;
      hash = hash & hash; // Convert to 32bit integer
    }

    return hash;
  }

  var indexes = {};

  /**
   * guid - Generate a unique ID
   *
   * @param  {string} [id='skizz'] The id to use
   * @param  {boolean} [url=true] Use the document url as an hash to generate the id
   * @return {string} The generated guid
   */
  function guid() {
    var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'skizz';
    var url = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

    if (indexes[id] === undefined) {
      indexes[id] = 0;
    } else {
      indexes[id]++;
    }

    return id + '-' + indexes[id] + (url ? '--' + hash(document.URL).toString() : '');
  }

  /**
   * rand - Generated number between a min and max value
   *
   * @param  {number} min The minimal value you want to random
   * @param  {number} max The maximal value you want to random
   * @return {number} The random value between min and max
   */
  function rand(min, max) {
    if (min === 0) {
      return Math.floor(Math.random() * max);
    }
    return Math.floor(Math.random() * (max - min) / min);
  }

  /**
   * encode - Encodes a string as an URI parameter
   *
   * @param  {string} string URI to encode
   * @return {string} The encoded URI
   */
  function encode(string) {
    return encodeURIComponent(string);
  }

  /**
   * decode - Decodes an URI parameters into a string
   *
   * @param  {string} uri URI to decode
   * @return {string} The decode uri
   */
  function decode(uri) {
    return decodeURIComponent(uri);
  }

  var Storage = function () {

    /**
     * constructor - Handle the local and session Storage
     *
     * @param  {string} type Type of storage (session or local)
     * @return {undefined}
     */
    function Storage(type) {
      var _this = this;

      classCallCheck(this, Storage);

      this.type = type;
      this.store = window[type];

      this.isAvailable = function () {
        var key = 'skizz-is-awesome';
        var data = key;

        try {
          // http://stackoverflow.com/questions/9077101/iphone-localstorage-quota-exceeded-err-issue#answer-12976988
          _this.store.setItem(key, data);
          _this.store.removeItem(key);
          return true;
        } catch (error) {
          return false;
        }
      };
    }

    /**
     * set - Set an item into the storage
     *
     * @param  {string} key The key used to store the item
     * @param  {any} data The data to store
     * @param  {date} [expires] When should the storage expire ?
     * @return {boolean|undefined} Return false if not supported or undefined when the data is store
     */


    Storage.prototype.set = function set$$1(key, data, expires) {
      if (!this.isAvailable) {
        return false;
      }

      data = JSON.stringify({
        value: data,
        expires: expires
      });

      return this.store.setItem(key, data);
    };

    /**
     * get - Get an item into the storage
     *
     * @param  {string} key The key used to store the item
     * @return {any} The data previously store
     */


    Storage.prototype.get = function get$$1(key) {
      var data = this.store.getItem(key);
      if (data === null) {
        return data;
      }

      data = JSON.parse(data);

      if (data.expires && new Date() > new Date(data.expires)) {
        this.remove(key);
        return null;
      }

      return data.value;
    };

    /**
     * remove - Remove one item into the storage
     *
     * @param  {string} key The key used to store the item
     * @return {undefined}
     */


    Storage.prototype.remove = function remove(key) {
      return this.store.removeItem(key);
    };

    /**
     * removeAll - Remove all items into the storage
     *
     * @return {undefined}
     */


    Storage.prototype.removeAll = function removeAll() {
      return this.store.clear();
    };

    /**
     * storageLength - Get the length of the Storage collection
     *
     * @return {int}  The length of the Storage collection
     */


    Storage.prototype.storageLength = function storageLength() {
      return this.store.length;
    };

    /**
     * getKey - Get the key of a store item by index
     *
     * @param  {int} index The index of the store item
     * @return {string} The name of the item
     */


    Storage.prototype.getKey = function getKey(index) {
      return this.store.key(index);
    };

    return Storage;
  }();

  var storage = {
    local: new Storage('localStorage'),
    session: new Storage('sessionStorage')
  };

  /**
   * @return: return an empty function
   */
  var noop = function () {
    var noop = function noop() {};
    return noop;
  };

  skizz$1.isFunction = isFunction;
  skizz$1.guid = guid;
  skizz$1.hash = hash;
  skizz$1.rand = rand;
  skizz$1.encode = encode;
  skizz$1.decode = decode;
  skizz$1.storage = storage;
  skizz$1.noop = noop;

  skizz$1.version = '0.1.0';

  window.skizz = window.$ = skizz$1;

  (function ($) {
    $.fn.fastButton = function (handler) {
      var body = document.body;
      var addEventListener = 'addEventListener';
      var removeEventListener = 'removeEventListener';
      var ClickBuster = {};

      /**
       * ClickBuster listens for consecutive clicks and identifies them as a
       * single event if they happen within the same area
       * @private
       */
      ClickBuster.coordinates = [];

      /**
        * Verifies that the click event has already been detected and if yes,
        * cancels it
        * @private
        */
      ClickBuster.onClick = function (event) {
        var i = void 0,
            x = void 0,
            y = void 0;
        for (i = 0; i < ClickBuster.coordinates.length; i += 2) {
          x = ClickBuster.coordinates[i];
          y = ClickBuster.coordinates[i + 1];
          if (Math.abs(event.clientX - x) < 25 && Math.abs(event.clientY - y) < 25) {
            event.stopPropagation();
            event.preventDefault();
          }
        }
      };

      /**
       * Click coordinates are tracked to prevent executing the handler twice
       * @private
       */
      ClickBuster.preventGhostClick = function (x, y) {
        ClickBuster.coordinates.push(x, y);
        window.setTimeout(ClickBuster.pop, 2500);
      };

      /**
       * Remove the oldest coordinates from the list
       * @private
       */
      ClickBuster.pop = function () {
        ClickBuster.coordinates.splice(0, 2);
      };

      document[addEventListener]('click', ClickBuster.onClick, true);

      var objHandler = {
        element: this,
        handler: handler,

        /** Listen for mouse click and touch events */
        handleEvent: function handleEvent(event) {
          switch (event.type) {
            case 'touchstart':
              this.onTouchStart(event);
              break;

            case 'touchmove':
              this.onTouchMove(event);
              break;

            case 'touchend':
              this.onClick(event);
              break;

            case 'click':
              this.onClick(event);
              break;
          }
        },

        /**
         * when the user presses her finger on the screen, we start
         * listening for when she removes it and memorize the
         * coordinates of the first finger (this is to discriminate
         * between taps and swipes)
         */
        onTouchStart: function onTouchStart(event) {
          var touch = event.touches[0];

          event.stopPropagation();

          this.element[addEventListener]('touchend', this, false);
          body[addEventListener]('touchmove', this, false);

          this.startX = touch.clientX;
          this.startY = touch.clientY;
        },

        /**
         * if the user moves her finger more than a certain amount,
         * it means this is a swipe gesture and we stop tracking it.
         */
        onTouchMove: function onTouchMove(event) {
          var touch = event.touches[0];

          if (Math.abs(touch.clientX - this.startX) > 10 || Math.abs(touch.clientY - this.startY) > 10) {
            this.reset();
          }
        },

        /**
         * the user tapped/clicked on the target button, therefore
         * we just call the handler
         */
        onClick: function onClick(event) {
          event.stopPropagation();
          this.reset();

          if (this.handler.handleEvent) {
            this.handler.handleEvent(event);
          } else {
            this.handler(event);
          }

          /* if it was a tap, we must take care of the click event that
           * will be fired 300ms later and prevent the handler from being
           * called twice.
           */
          if (event.type === 'touchend') {
            ClickBuster.preventGhostClick(this.startX, this.startY);
          }
        },

        /** stop tracking the user's gesture */
        reset: function reset() {
          this.element[0][removeEventListener]('touchend', this, false);
          body[removeEventListener]('touchmove', this, false);
        },

        /** remove any listener */
        destroy: function destroy() {
          var element = this.element[0];
          element[removeEventListener]('touchend', this, false);
          element[removeEventListener]('touchstart', this, false);
          element[removeEventListener]('touchmove', this, false);
          element[removeEventListener]('click', this, false);
          body[removeEventListener]('touchmove', this, false);
        }
      };

      function FastButton() {
        var element = this;
        this.element = element;
        this.handler = handler;

        element[addEventListener]('touchstart', objHandler, false);
        element[addEventListener]('click', objHandler, false);
        init();

        function init() {}
      }
      return this.each(FastButton);
    };
  })(window.skizz);

  /**
   * anchor - A progressive disclosure widget. Anchor lets one element control
   * the display of another element by means of click/touch.
   *
   * @param {Object} [options] Custom options
   * @param {Object} [options.one] Define if only one anchor at a time could be open
   * @param {Object} [options.onClick=function(){}] A callback executed each time the anchor is clicked/touched. It is passed two arguments: the anchor controlling the disclosure and the element disclosed.
   * @author Renow <info@renow.public.lu>
   * @version 2.0.0
   * @return {Object} Skizz
   */
  skizz$1.fn.anchor = function anchor(options) {
    options = skizz$1.extend({
      one: true,
      onClick: skizz$1.noop
    }, options);

    var module = 'anchor';
    var activeClassName = 'is-active';
    var destClassName = module + '-destination';
    var activeAnchor = null;

    this.each(function (index, elements) {
      var trigger = skizz$1(elements[index]);
      var destination = skizz$1(trigger.attr('data-destination') || elements[index].hash);

      if (destination.attr('id') !== null) {
        destination.attr('id', module + skizz$1.rand(0, 1000));
      }

      /**
       * Initializes the plugin.
       * Classes and listeners are added to the controlled elements.
       */
      function init() {
        trigger.attr({
          'tabindex': 0,
          'aria-controls': destination.attr('id')
        }).addClass(module).on('keypress', eventHandler).fastButton(eventHandler);

        destination.addClass(destClassName);
      }

      /**
       * Handles click/touch/keypress events on the trigger
       * @param {Object} event Click/Touch event details
       */
      function eventHandler(event) {
        if (event.type === 'keypress' && event.keyCode !== 13) {
          return;
        }
        event.preventDefault();
        trigger.toggleClass(activeClassName);
        destination.toggleClass(activeClassName);
        callback();
        if (activeAnchor) {
          if (trigger !== activeAnchor && options.one) {
            activeAnchor.fire('click');
          }
          activeAnchor = null;
        }
        if (trigger.hasClass(activeClassName)) {
          activeAnchor = trigger;
        }
      }

      /**
       * callback - execute the callback function from option
       *
       * @return {undefined}
       */
      function callback() {
        if (typeof options.onClick === 'function') {
          options.onClick(trigger, destination);
        }
      }

      init();
    });

    return skizz$1;
  };

  /**
   * a11ynav function - Skizz plugin to make sidebar layout navigation
   * accessible.
   *
   * @param  {object} [options] Plugin options to extend
   * @param  {object} [options.duration=200] The duration of the css animation
   * @param  {object} [options.api=false] Define if it return the api or skizz
   * @return {object}         Skizz or plugin method
   */
  skizz$1.fn.a11ynav = function a11ynav(options) {
    options = skizz$1.extend({
      duration: 200,
      api: false
    }, options);

    var module = 'a11ynav';
    var active = 'is-active';
    var body = skizz$1('body');
    var content = skizz$1('.page-body');
    var timer = null;

    /**
     * open - Handle the accessibility when the nav is opening
     *
     * @return {object}  Skizz
     */
    function open() {
      body.addClass(module + '-' + active);

      // A timeout is needed because there is a CSS transition on the navigation
      timer = window.setTimeout(function () {
        content.addClass(module + '-' + active);
        timer = null;
      }, options.duration);

      return skizz$1;
    }

    /**
     * close - Handle the accessibility when the nav is closing
     *
     * @return {object}  Skizz
     */
    function close() {
      if (timer !== null) {
        clearTimeout(timer);
      }
      body.removeClass(module + '-' + active);
      content.removeClass(module + '-' + active);

      return skizz$1;
    }

    return options.api ? {
      open: open,
      close: close
    } : this;
  };

  var nav = skizz$1('.page-headernav').a11ynav({ api: true });

  // Set i18n for subnav anchor
  var labels = {
    root: {
      open: 'Afficher le sous menu de ',
      close: 'Masquer le sous menu de '
    },
    en: {
      open: 'Show sub navigation of ',
      close: 'Hide sub navigation of '
    }
  };
  labels = skizz$1.i18n(labels);

  skizz$1('.anchor').anchor({
    onClick: function onClick(trigger) {
      var svg = skizz$1('svg use', trigger);
      if (trigger.hasClass('is-active')) {
        svg.attr('xlink:href', '#icon-navigation-close');
        nav.open();
      } else {
        svg.attr('xlink:href', '#icon-navigation-anchor');
        nav.close();
      }
    }
  });

  skizz$1('.subnav-anchor').anchor({
    onClick: function onClick(trigger) {
      var svg = skizz$1('svg use', trigger);
      var name = trigger.prev().text().trim();

      if (trigger.hasClass('is-active')) {
        trigger.attr('title', labels.close + name);
        svg.attr('xlink:href', '#icon-subnav-close');
      } else {
        trigger.attr('title', labels.open + name);
        svg.attr('xlink:href', '#icon-subnav-anchor');
      }
    }
  });

  (function () {
    'use strict'

    // Add class to every pre block to add line number
    document.querySelectorAll('pre').forEach(function (item) {
      item.className += 'line-numbers'
    })
  })()

}());
