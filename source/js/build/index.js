/*!
* tabbable 6.0.1
* @license MIT, https://github.com/focus-trap/tabbable/blob/master/LICENSE
*/
var candidateSelectors = ['input', 'select', 'textarea', 'a[href]', 'button', '[tabindex]:not(slot)', 'audio[controls]', 'video[controls]', '[contenteditable]:not([contenteditable="false"])', 'details>summary:first-of-type', 'details'];
var candidateSelector = /* #__PURE__ */candidateSelectors.join(',');
var NoElement = typeof Element === 'undefined';
var matches = NoElement ? function () {} : Element.prototype.matches || Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
var getRootNode = !NoElement && Element.prototype.getRootNode ? function (element) {
  return element.getRootNode();
} : function (element) {
  return element.ownerDocument;
};

/**
 * @param {Element} el container to check in
 * @param {boolean} includeContainer add container to check
 * @param {(node: Element) => boolean} filter filter candidates
 * @returns {Element[]}
 */
var getCandidates = function getCandidates(el, includeContainer, filter) {
  var candidates = Array.prototype.slice.apply(el.querySelectorAll(candidateSelector));
  if (includeContainer && matches.call(el, candidateSelector)) {
    candidates.unshift(el);
  }
  candidates = candidates.filter(filter);
  return candidates;
};

/**
 * @callback GetShadowRoot
 * @param {Element} element to check for shadow root
 * @returns {ShadowRoot|boolean} ShadowRoot if available or boolean indicating if a shadowRoot is attached but not available.
 */

/**
 * @callback ShadowRootFilter
 * @param {Element} shadowHostNode the element which contains shadow content
 * @returns {boolean} true if a shadow root could potentially contain valid candidates.
 */

/**
 * @typedef {Object} CandidateScope
 * @property {Element} scopeParent contains inner candidates
 * @property {Element[]} candidates list of candidates found in the scope parent
 */

/**
 * @typedef {Object} IterativeOptions
 * @property {GetShadowRoot|boolean} getShadowRoot true if shadow support is enabled; falsy if not;
 *  if a function, implies shadow support is enabled and either returns the shadow root of an element
 *  or a boolean stating if it has an undisclosed shadow root
 * @property {(node: Element) => boolean} filter filter candidates
 * @property {boolean} flatten if true then result will flatten any CandidateScope into the returned list
 * @property {ShadowRootFilter} shadowRootFilter filter shadow roots;
 */

/**
 * @param {Element[]} elements list of element containers to match candidates from
 * @param {boolean} includeContainer add container list to check
 * @param {IterativeOptions} options
 * @returns {Array.<Element|CandidateScope>}
 */
var getCandidatesIteratively = function getCandidatesIteratively(elements, includeContainer, options) {
  var candidates = [];
  var elementsToCheck = Array.from(elements);
  while (elementsToCheck.length) {
    var element = elementsToCheck.shift();
    if (element.tagName === 'SLOT') {
      // add shadow dom slot scope (slot itself cannot be focusable)
      var assigned = element.assignedElements();
      var content = assigned.length ? assigned : element.children;
      var nestedCandidates = getCandidatesIteratively(content, true, options);
      if (options.flatten) {
        candidates.push.apply(candidates, nestedCandidates);
      } else {
        candidates.push({
          scopeParent: element,
          candidates: nestedCandidates
        });
      }
    } else {
      // check candidate element
      var validCandidate = matches.call(element, candidateSelector);
      if (validCandidate && options.filter(element) && (includeContainer || !elements.includes(element))) {
        candidates.push(element);
      }

      // iterate over shadow content if possible
      var shadowRoot = element.shadowRoot ||
      // check for an undisclosed shadow
      typeof options.getShadowRoot === 'function' && options.getShadowRoot(element);
      var validShadowRoot = !options.shadowRootFilter || options.shadowRootFilter(element);
      if (shadowRoot && validShadowRoot) {
        // add shadow dom scope IIF a shadow root node was given; otherwise, an undisclosed
        //  shadow exists, so look at light dom children as fallback BUT create a scope for any
        //  child candidates found because they're likely slotted elements (elements that are
        //  children of the web component element (which has the shadow), in the light dom, but
        //  slotted somewhere _inside_ the undisclosed shadow) -- the scope is created below,
        //  _after_ we return from this recursive call
        var _nestedCandidates = getCandidatesIteratively(shadowRoot === true ? element.children : shadowRoot.children, true, options);
        if (options.flatten) {
          candidates.push.apply(candidates, _nestedCandidates);
        } else {
          candidates.push({
            scopeParent: element,
            candidates: _nestedCandidates
          });
        }
      } else {
        // there's not shadow so just dig into the element's (light dom) children
        //  __without__ giving the element special scope treatment
        elementsToCheck.unshift.apply(elementsToCheck, element.children);
      }
    }
  }
  return candidates;
};
var getTabindex = function getTabindex(node, isScope) {
  if (node.tabIndex < 0) {
    // in Chrome, <details/>, <audio controls/> and <video controls/> elements get a default
    // `tabIndex` of -1 when the 'tabindex' attribute isn't specified in the DOM,
    // yet they are still part of the regular tab order; in FF, they get a default
    // `tabIndex` of 0; since Chrome still puts those elements in the regular tab
    // order, consider their tab index to be 0.
    // Also browsers do not return `tabIndex` correctly for contentEditable nodes;
    // so if they don't have a tabindex attribute specifically set, assume it's 0.
    //
    // isScope is positive for custom element with shadow root or slot that by default
    // have tabIndex -1, but need to be sorted by document order in order for their
    // content to be inserted in the correct position
    if ((isScope || /^(AUDIO|VIDEO|DETAILS)$/.test(node.tagName) || node.isContentEditable) && isNaN(parseInt(node.getAttribute('tabindex'), 10))) {
      return 0;
    }
  }
  return node.tabIndex;
};
var sortOrderedTabbables = function sortOrderedTabbables(a, b) {
  return a.tabIndex === b.tabIndex ? a.documentOrder - b.documentOrder : a.tabIndex - b.tabIndex;
};
var isInput = function isInput(node) {
  return node.tagName === 'INPUT';
};
var isHiddenInput = function isHiddenInput(node) {
  return isInput(node) && node.type === 'hidden';
};
var isDetailsWithSummary = function isDetailsWithSummary(node) {
  var r = node.tagName === 'DETAILS' && Array.prototype.slice.apply(node.children).some(function (child) {
    return child.tagName === 'SUMMARY';
  });
  return r;
};
var getCheckedRadio = function getCheckedRadio(nodes, form) {
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i].checked && nodes[i].form === form) {
      return nodes[i];
    }
  }
};
var isTabbableRadio = function isTabbableRadio(node) {
  if (!node.name) {
    return true;
  }
  var radioScope = node.form || getRootNode(node);
  var queryRadios = function queryRadios(name) {
    return radioScope.querySelectorAll('input[type="radio"][name="' + name + '"]');
  };
  var radioSet;
  if (typeof window !== 'undefined' && typeof window.CSS !== 'undefined' && typeof window.CSS.escape === 'function') {
    radioSet = queryRadios(window.CSS.escape(node.name));
  } else {
    try {
      radioSet = queryRadios(node.name);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Looks like you have a radio button with a name attribute containing invalid CSS selector characters and need the CSS.escape polyfill: %s', err.message);
      return false;
    }
  }
  var checked = getCheckedRadio(radioSet, node.form);
  return !checked || checked === node;
};
var isRadio = function isRadio(node) {
  return isInput(node) && node.type === 'radio';
};
var isNonTabbableRadio = function isNonTabbableRadio(node) {
  return isRadio(node) && !isTabbableRadio(node);
};

// determines if a node is ultimately attached to the window's document
var isNodeAttached = function isNodeAttached(node) {
  var _nodeRootHost;
  // The root node is the shadow root if the node is in a shadow DOM; some document otherwise
  //  (but NOT _the_ document; see second 'If' comment below for more).
  // If rootNode is shadow root, it'll have a host, which is the element to which the shadow
  //  is attached, and the one we need to check if it's in the document or not (because the
  //  shadow, and all nodes it contains, is never considered in the document since shadows
  //  behave like self-contained DOMs; but if the shadow's HOST, which is part of the document,
  //  is hidden, or is not in the document itself but is detached, it will affect the shadow's
  //  visibility, including all the nodes it contains). The host could be any normal node,
  //  or a custom element (i.e. web component). Either way, that's the one that is considered
  //  part of the document, not the shadow root, nor any of its children (i.e. the node being
  //  tested).
  // To further complicate things, we have to look all the way up until we find a shadow HOST
  //  that is attached (or find none) because the node might be in nested shadows...
  // If rootNode is not a shadow root, it won't have a host, and so rootNode should be the
  //  document (per the docs) and while it's a Document-type object, that document does not
  //  appear to be the same as the node's `ownerDocument` for some reason, so it's safer
  //  to ignore the rootNode at this point, and use `node.ownerDocument`. Otherwise,
  //  using `rootNode.contains(node)` will _always_ be true we'll get false-positives when
  //  node is actually detached.
  var nodeRootHost = getRootNode(node).host;
  var attached = !!((_nodeRootHost = nodeRootHost) !== null && _nodeRootHost !== void 0 && _nodeRootHost.ownerDocument.contains(nodeRootHost) || node.ownerDocument.contains(node));
  while (!attached && nodeRootHost) {
    var _nodeRootHost2;
    // since it's not attached and we have a root host, the node MUST be in a nested shadow DOM,
    //  which means we need to get the host's host and check if that parent host is contained
    //  in (i.e. attached to) the document
    nodeRootHost = getRootNode(nodeRootHost).host;
    attached = !!((_nodeRootHost2 = nodeRootHost) !== null && _nodeRootHost2 !== void 0 && _nodeRootHost2.ownerDocument.contains(nodeRootHost));
  }
  return attached;
};
var isZeroArea = function isZeroArea(node) {
  var _node$getBoundingClie = node.getBoundingClientRect(),
    width = _node$getBoundingClie.width,
    height = _node$getBoundingClie.height;
  return width === 0 && height === 0;
};
var isHidden = function isHidden(node, _ref) {
  var displayCheck = _ref.displayCheck,
    getShadowRoot = _ref.getShadowRoot;
  // NOTE: visibility will be `undefined` if node is detached from the document
  //  (see notes about this further down), which means we will consider it visible
  //  (this is legacy behavior from a very long way back)
  // NOTE: we check this regardless of `displayCheck="none"` because this is a
  //  _visibility_ check, not a _display_ check
  if (getComputedStyle(node).visibility === 'hidden') {
    return true;
  }
  var isDirectSummary = matches.call(node, 'details>summary:first-of-type');
  var nodeUnderDetails = isDirectSummary ? node.parentElement : node;
  if (matches.call(nodeUnderDetails, 'details:not([open]) *')) {
    return true;
  }
  if (!displayCheck || displayCheck === 'full' || displayCheck === 'legacy-full') {
    if (typeof getShadowRoot === 'function') {
      // figure out if we should consider the node to be in an undisclosed shadow and use the
      //  'non-zero-area' fallback
      var originalNode = node;
      while (node) {
        var parentElement = node.parentElement;
        var rootNode = getRootNode(node);
        if (parentElement && !parentElement.shadowRoot && getShadowRoot(parentElement) === true // check if there's an undisclosed shadow
        ) {
          // node has an undisclosed shadow which means we can only treat it as a black box, so we
          //  fall back to a non-zero-area test
          return isZeroArea(node);
        } else if (node.assignedSlot) {
          // iterate up slot
          node = node.assignedSlot;
        } else if (!parentElement && rootNode !== node.ownerDocument) {
          // cross shadow boundary
          node = rootNode.host;
        } else {
          // iterate up normal dom
          node = parentElement;
        }
      }
      node = originalNode;
    }
    // else, `getShadowRoot` might be true, but all that does is enable shadow DOM support
    //  (i.e. it does not also presume that all nodes might have undisclosed shadows); or
    //  it might be a falsy value, which means shadow DOM support is disabled

    // Since we didn't find it sitting in an undisclosed shadow (or shadows are disabled)
    //  now we can just test to see if it would normally be visible or not, provided it's
    //  attached to the main document.
    // NOTE: We must consider case where node is inside a shadow DOM and given directly to
    //  `isTabbable()` or `isFocusable()` -- regardless of `getShadowRoot` option setting.

    if (isNodeAttached(node)) {
      // this works wherever the node is: if there's at least one client rect, it's
      //  somehow displayed; it also covers the CSS 'display: contents' case where the
      //  node itself is hidden in place of its contents; and there's no need to search
      //  up the hierarchy either
      return !node.getClientRects().length;
    }

    // Else, the node isn't attached to the document, which means the `getClientRects()`
    //  API will __always__ return zero rects (this can happen, for example, if React
    //  is used to render nodes onto a detached tree, as confirmed in this thread:
    //  https://github.com/facebook/react/issues/9117#issuecomment-284228870)
    //
    // It also means that even window.getComputedStyle(node).display will return `undefined`
    //  because styles are only computed for nodes that are in the document.
    //
    // NOTE: THIS HAS BEEN THE CASE FOR YEARS. It is not new, nor is it caused by tabbable
    //  somehow. Though it was never stated officially, anyone who has ever used tabbable
    //  APIs on nodes in detached containers has actually implicitly used tabbable in what
    //  was later (as of v5.2.0 on Apr 9, 2021) called `displayCheck="none"` mode -- essentially
    //  considering __everything__ to be visible because of the innability to determine styles.
    //
    // v6.0.0: As of this major release, the default 'full' option __no longer treats detached
    //  nodes as visible with the 'none' fallback.__
    if (displayCheck !== 'legacy-full') {
      return true; // hidden
    }
    // else, fallback to 'none' mode and consider the node visible
  } else if (displayCheck === 'non-zero-area') {
    // NOTE: Even though this tests that the node's client rect is non-zero to determine
    //  whether it's displayed, and that a detached node will __always__ have a zero-area
    //  client rect, we don't special-case for whether the node is attached or not. In
    //  this mode, we do want to consider nodes that have a zero area to be hidden at all
    //  times, and that includes attached or not.
    return isZeroArea(node);
  }

  // visible, as far as we can tell, or per current `displayCheck=none` mode, we assume
  //  it's visible
  return false;
};

// form fields (nested) inside a disabled fieldset are not focusable/tabbable
//  unless they are in the _first_ <legend> element of the top-most disabled
//  fieldset
var isDisabledFromFieldset = function isDisabledFromFieldset(node) {
  if (/^(INPUT|BUTTON|SELECT|TEXTAREA)$/.test(node.tagName)) {
    var parentNode = node.parentElement;
    // check if `node` is contained in a disabled <fieldset>
    while (parentNode) {
      if (parentNode.tagName === 'FIELDSET' && parentNode.disabled) {
        // look for the first <legend> among the children of the disabled <fieldset>
        for (var i = 0; i < parentNode.children.length; i++) {
          var child = parentNode.children.item(i);
          // when the first <legend> (in document order) is found
          if (child.tagName === 'LEGEND') {
            // if its parent <fieldset> is not nested in another disabled <fieldset>,
            // return whether `node` is a descendant of its first <legend>
            return matches.call(parentNode, 'fieldset[disabled] *') ? true : !child.contains(node);
          }
        }
        // the disabled <fieldset> containing `node` has no <legend>
        return true;
      }
      parentNode = parentNode.parentElement;
    }
  }

  // else, node's tabbable/focusable state should not be affected by a fieldset's
  //  enabled/disabled state
  return false;
};
var isNodeMatchingSelectorFocusable = function isNodeMatchingSelectorFocusable(options, node) {
  if (node.disabled || isHiddenInput(node) || isHidden(node, options) ||
  // For a details element with a summary, the summary element gets the focus
  isDetailsWithSummary(node) || isDisabledFromFieldset(node)) {
    return false;
  }
  return true;
};
var isNodeMatchingSelectorTabbable = function isNodeMatchingSelectorTabbable(options, node) {
  if (isNonTabbableRadio(node) || getTabindex(node) < 0 || !isNodeMatchingSelectorFocusable(options, node)) {
    return false;
  }
  return true;
};
var isValidShadowRootTabbable = function isValidShadowRootTabbable(shadowHostNode) {
  var tabIndex = parseInt(shadowHostNode.getAttribute('tabindex'), 10);
  if (isNaN(tabIndex) || tabIndex >= 0) {
    return true;
  }
  // If a custom element has an explicit negative tabindex,
  // browsers will not allow tab targeting said element's children.
  return false;
};

/**
 * @param {Array.<Element|CandidateScope>} candidates
 * @returns Element[]
 */
var sortByOrder = function sortByOrder(candidates) {
  var regularTabbables = [];
  var orderedTabbables = [];
  candidates.forEach(function (item, i) {
    var isScope = !!item.scopeParent;
    var element = isScope ? item.scopeParent : item;
    var candidateTabindex = getTabindex(element, isScope);
    var elements = isScope ? sortByOrder(item.candidates) : element;
    if (candidateTabindex === 0) {
      isScope ? regularTabbables.push.apply(regularTabbables, elements) : regularTabbables.push(element);
    } else {
      orderedTabbables.push({
        documentOrder: i,
        tabIndex: candidateTabindex,
        item: item,
        isScope: isScope,
        content: elements
      });
    }
  });
  return orderedTabbables.sort(sortOrderedTabbables).reduce(function (acc, sortable) {
    sortable.isScope ? acc.push.apply(acc, sortable.content) : acc.push(sortable.content);
    return acc;
  }, []).concat(regularTabbables);
};
var tabbable = function tabbable(el, options) {
  options = options || {};
  var candidates;
  if (options.getShadowRoot) {
    candidates = getCandidatesIteratively([el], options.includeContainer, {
      filter: isNodeMatchingSelectorTabbable.bind(null, options),
      flatten: false,
      getShadowRoot: options.getShadowRoot,
      shadowRootFilter: isValidShadowRootTabbable
    });
  } else {
    candidates = getCandidates(el, options.includeContainer, isNodeMatchingSelectorTabbable.bind(null, options));
  }
  return sortByOrder(candidates);
};

// wait for all animations to complete their promises
function animationsComplete(
  element,
  options = {
    subtree: false,
  }
) {
  return Promise.allSettled(element.getAnimations(options).map(animation => animation.finished));
}

// finish all animations
function finishAnimations(
  element,
  options = {
    subtree: false,
  }
) {
  element.getAnimations(options).forEach(animation => {
    animation.finish();
  });
}

const applyAnimation = async (element, options = {}) => {
  if (!element) {
    return;
  }
  const className = options.className ?? null;
  // if use className, default animation porperty will be ignored
  // unless you set it in options manually
  options = {
    className: className,
    animation: null,
    duration: className ? null : 0,
    easing: className ? null : 'ease',
    fill: className ? null : 'both',
    iterations: className ? null : 1,
    direction: className ? null : 'normal',
    delay: className ? null : 0,
    subtree: false,
    keep: true,
    ...options,
  };
  const animationStyle = {
    animation: options.animation,
    animationDuration: options.duration,
    animationTimingFunction: options.easing,
    animationFillMode: options.fill,
    animationIterationCount: options.iterations,
    animationDirection: options.direction,
    animationDelay: options.delay,
  };
  const prevStyles = element.style.cssText;
  if (options.className) {
    element.classList.add(options.className);
  }
  Object.assign(element.style, animationStyle);
  await animationsComplete(element, { subtree: options.subtree });
  if (options.className) {
    element.classList.remove(options.className);
  }
  if (!options.keep) {
    //restore styles
    element.style = prevStyles;
  }
};

// for the porpuse of applying a transition to an element
const applyTransition = async (element, options = {}) => {
  options = {
    transition: null,
    from: {},
    fromClass: null,
    to: {},
    toClass: null,
    subtree: false,
    keep: true,
    ...options,
  };
  const prevStyles = element.style.cssText;
  //from
  Object.assign(element.style, options.from);
  options.fromClass && element.classList.add(options.fromClass);
  // wait for two frames
  await new Promise(resolve =>
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    })
  );
  //apply transition
  element.style.transition = options.transition;
  //to
  Object.assign(element.style, options.to);
  options.toClass && element.classList.add(options.toClass);
  await animationsComplete(element, { subtree: options.subtree });
  if (!options.keep) {
    //restore styles
    element.style = prevStyles;
  }
};

// trap focus inside container
function focusTrap(container, event) {
  const focusableElements = tabbable(container);
  if (focusableElements.length === 0) {
    event.preventDefault();
    return;
  }
  const firstFocusableElement = focusableElements[0];
  const lastFocusableElement = focusableElements[focusableElements.length - 1];
  if (document.activeElement === lastFocusableElement) {
    firstFocusableElement.focus();
    event.preventDefault();
  } else if (document.activeElement === firstFocusableElement && event.shiftKey) {
    lastFocusableElement.focus();
    event.preventDefault();
  }
}

/**
 * Underscore.js 1.13.2
 * https://underscorejs.org
 * (c) 2009-2021 Jeremy Ashkenas, Julian Gonggrijp, and DocumentCloud and Investigative Reporters & Editors
 * Underscore may be freely distributed under the MIT license.
 */
// A (possibly faster) way to get the current timestamp as an integer.
function now$1() {
  return Date.now() || new Date().getTime();
}
// Some functions take a variable number of arguments, or a few expected
// arguments at the beginning and then a variable number of values to operate
// on. This helper accumulates all remaining arguments past the function’s
// argument length (or an explicit `startIndex`), into an array that becomes
// the last argument. Similar to ES6’s "rest parameter".
function restArguments(func, startIndex) {
  startIndex = startIndex == null ? func.length - 1 : +startIndex;
  return function () {
    var length = Math.max(arguments.length - startIndex, 0),
      rest = Array(length),
      index = 0;
    for (; index < length; index++) {
      rest[index] = arguments[index + startIndex];
    }
    switch (startIndex) {
      case 0:
        return func.call(this, rest);
      case 1:
        return func.call(this, arguments[0], rest);
      case 2:
        return func.call(this, arguments[0], arguments[1], rest);
    }
    var args = Array(startIndex + 1);
    for (index = 0; index < startIndex; index++) {
      args[index] = arguments[index];
    }
    args[startIndex] = rest;
    return func.apply(this, args);
  };
}

// When a sequence of calls of the returned function ends, the argument
// function is triggered. The end of a sequence is defined by the `wait`
// parameter. If `immediate` is passed, the argument function will be
// triggered at the beginning of the sequence instead of at the end.
function debounce(func, wait, immediate) {
  let timeout, previous, args, result, context;
  const later = function () {
    const passed = now$1() - previous;
    if (wait > passed) {
      timeout = setTimeout(later, wait - passed);
    } else {
      timeout = null;
      if (!immediate) result = func.apply(context, args);
      // This check is needed because `func` can recursively invoke `debounced`.
      if (!timeout) args = context = null;
    }
  };
  const debounced = restArguments(function (_args) {
    context = this;
    args = _args;
    previous = now$1();
    if (!timeout) {
      timeout = setTimeout(later, wait);
      if (immediate) result = func.apply(context, args);
    }
    return result;
  });
  const cancel = function () {
    clearTimeout(timeout);
    timeout = args = context = null;
  };
  return Object.assign(debounced, { cancel });
}

// Returns a function, that, when invoked, will only be triggered at most once
// during a given window of time. Normally, the throttled function will run
// as much as it can, without ever going more than once per `wait` duration;
// but if you'd like to disable the execution on the leading edge, pass
// `{leading: false}`. To disable execution on the trailing edge, ditto.
function throttle(func, wait, options) {
  let timeout, context, args, result;
  let previous = 0;
  if (!options) options = {};
  const later = function () {
    previous = options.leading === false ? 0 : now$1();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) context = args = null;
  };
  const throttled = function () {
    const _now = now$1();
    if (!previous && options.leading === false) previous = _now;
    const remaining = wait - (_now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = _now;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };
  const cancel = function () {
    clearTimeout(timeout);
    previous = 0;
    timeout = context = args = null;
  };
  return Object.assign(throttled, { cancel });
}

/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
// https://github.com/mozilla/fathom/blob/master/fathom/utilsForFrontend.mjs

/**
 * Yield an element and each of its ancestors.
 */
function* ancestors(element) {
  yield element;
  let parent;
  while ((parent = element.parentNode) !== null && parent.nodeType === parent.ELEMENT_NODE) {
    yield parent;
    element = parent;
  }
}

/**
 * Return whether an element is practically visible, considering things like 0
 * size or opacity, ``visibility: hidden`` and ``overflow: hidden``.
 *
 * Merely being scrolled off the page in either horizontally or vertically
 * doesn't count as invisible; the result of this function is meant to be
 * independent of viewport size.
 *
 * Fnode support has been removed.
 */
function isVisible(element) {
  // This could be 5x more efficient if https://github.com/w3c/csswg-drafts/issues/4122 happens.
  const elementWindow = window;
  const elementRect = element.getBoundingClientRect();
  const elementStyle = elementWindow.getComputedStyle(element);
  // Alternative to reading ``display: none`` due to Bug 1381071.
  if (elementRect.width === 0 && elementRect.height === 0 && elementStyle.overflow !== 'hidden') {
    return false;
  }
  if (elementStyle.visibility === 'hidden') {
    return false;
  }
  // Check if the element is irrevocably off-screen:
  if (elementRect.x + elementRect.width < 0 || elementRect.y + elementRect.height < 0) {
    return false;
  }
  for (const ancestor of ancestors(element)) {
    const isElement = ancestor === element;
    const style = isElement ? elementStyle : elementWindow.getComputedStyle(ancestor);
    if (style.opacity === '0') {
      return false;
    }
    if (style.display === 'contents') {
      // ``display: contents`` elements have no box themselves, but children are
      // still rendered.
      continue;
    }
    const rect = isElement ? elementRect : ancestor.getBoundingClientRect();
    if ((rect.width === 0 || rect.height === 0) && elementStyle.overflow === 'hidden') {
      // Zero-sized ancestors don’t make descendants hidden unless the descendant
      // has ``overflow: hidden``.
      return false;
    }
  }
  return true;
}

// method to improve performance
// use to break long task into smaller tasks
const yieldToMain = () => {
  return new Promise(resolve => {
    setTimeout(resolve, 0);
  });
};

const config = {};

const get$1 = () => {
  const configText = document.querySelector('#config-data')?.textContent;
  if (configText) {
    return JSON.parse(configText);
  } else {
    return {};
  }
};

const clear = () => {
  for (const key in config) {
    delete config[key];
  }
};

const assign = newConfig => {
  clear();
  Object.assign(config, newConfig);
  return config;
};

const update = () => {
  const newConfig = get$1();
  return assign(newConfig);
};

const clone = () => {
  // deep clone config object and return
  return JSON.parse(JSON.stringify(config));
};
update();

let colorMode = config.colormode ?? 'auto';

const set = mode => {
  document.documentElement.classList.remove('dark');
  document.documentElement.classList.remove('light');
  if (mode === 'auto') {
    colorMode = mode;
    if (getScheme() === 'dark') {
      document.documentElement.classList.add('dark');
    }
  } else if (mode === 'dark') {
    colorMode = mode;
    document.documentElement.classList.add('dark');
  } else if (mode === 'light') {
    colorMode = mode;
  }
};

const get = () => {
  return colorMode;
};

// auto --> light --> dark --> auto
const toggle = () => {
  if (colorMode === 'auto') {
    return set('light');
  } else if (colorMode === 'light') {
    return set('dark');
  } else if (colorMode === 'dark') {
    return set('auto');
  }
};

const getScheme = () => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const autoChange = () => {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (colorMode === 'auto') {
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  });
};

var colorMode$1 = {
  set,
  get,
  toggle,
  getScheme,
  autoChange,
};

class Popover {
  static defaultPopoverOptions = {
    mountTo: document.body, // mount popover to this element
    scrollLock: true, // lock body scroll when popover is opened
    presist: false, // keep popover in dom once opened
    prefix: 'popover', // prefix for popover class
    backdrop: true, // has backdrop
    closeBtn: true, // has close button
    autoFocus: true, // auto focus on first focusable element
    trigger: 'click', // popover trigger
    hoverOpenDelay: 0, // delay before popover open on hover
    hoverCloseDelay: 250, // delay before popover close on hover
    zIndex: null, // popover z-index
    defaultOpen: false, // open popover by default
  };
  constructor(element, toggle, options = {}) {
    const combinedOptions = { ...Popover.defaultPopoverOptions, ...options };
    this.popoverTemplate = element;
    this.toggleEl = toggle;
    this.mountedPopover = null;
    this.isOpened = false;
    this.options = combinedOptions;
    this._prevFocus = null;
    this.__close = this.close.bind(this);
    this.__onKeyDown = this._onKeyDown.bind(this);
    this.__onToggleClick = this._onToggleClick.bind(this);
    this.__onToggleKeyDown = this._onToggleKeyDown.bind(this);
    this.__onMouseEnter = this._onMouseEnter.bind(this);
    this.__onMouseLeave = this._onMouseLeave.bind(this);
    this._openDebounce = debounce(this.open.bind(this), this.options.hoverOpenDelay);
    this._closeDebounce = debounce(this.close.bind(this), this.options.hoverCloseDelay);
    if (this.options.presist) {
      this._mount();
      this._setUnaccessable();
    }
    if (this.toggleEl instanceof HTMLElement) {
      this.toggleEl.addEventListener('click', this.__onToggleClick);
      if (this.options.trigger === 'hover') {
        this.toggleEl.addEventListener('mouseenter', this.__onMouseEnter);
        this.toggleEl.addEventListener('mouseleave', this.__onMouseLeave);
      }
      this.toggleEl.addEventListener('keydown', this.__onToggleKeyDown);
    }

    if (this.popoverTemplate.classList.contains('open') || this.options.defaultOpen) {
      this.open();
    }
  }
  _onToggleKeyDown(event) {
    // in async case, this method may still be called after destroy
    if (!this.popoverTemplate) return;
    if (event.key === 'Enter' || event.key === ' ') {
      this.toggle();
      event.preventDefault();
    }
  }

  _onToggleClick(event) {
    // in async case, this method may still be called after destroy
    if (!this.popoverTemplate) return;
    this.toggle();
  }

  _onMouseEnter(event) {
    // in async case, this method may still be called after destroy
    if (!this.popoverTemplate) return;
    this._closeDebounce.cancel();
    this._openDebounce();
  }

  _onMouseLeave(event) {
    // in async case, this method may still be called after destroy
    if (!this.popoverTemplate) return;
    this._openDebounce.cancel();
    this._closeDebounce();
  }

  _bindEvents() {
    if (this.mountedPopover) {
      if (this.options.closeBtn) {
        const popoverCloseBtn = this.mountedPopover.querySelector(`.${this.options.prefix}-close-btn`);
        popoverCloseBtn.addEventListener('click', this.__close);
      }
      if (this.options.backdrop) {
        const popoverBackdrop = this.mountedPopover.querySelector(`.${this.options.prefix}-backdrop`);
        popoverBackdrop.addEventListener('click', this.__close);
      }
      this.mountedPopover.addEventListener('keydown', this.__onKeyDown);
      if (this.options.trigger === 'hover') {
        this.mountedPopover.addEventListener('mouseenter', this.__onMouseEnter);
        this.mountedPopover.addEventListener('mouseleave', this.__onMouseLeave);
      }
    }
  }

  _unbindEvents() {
    if (this.mountedPopover) {
      if (this.options.closeBtn) {
        const popoverCloseBtn = this.mountedPopover.querySelector(`.${this.options.prefix}-close-btn`);
        popoverCloseBtn.removeEventListener('click', this.__close);
      }
      if (this.options.backdrop) {
        const popoverBackdrop = this.mountedPopover.querySelector(`.${this.options.prefix}-backdrop`);
        popoverBackdrop.removeEventListener('click', this.__close);
      }
      this.mountedPopover.removeEventListener('keydown', this.__onKeyDown);
      if (this.options.trigger === 'hover') {
        this.mountedPopover.removeEventListener('mouseenter', this.__onMouseEnter);
        this.mountedPopover.removeEventListener('mouseleave', this.__onMouseLeave);
      }
    }
  }

  _onKeyDown(event) {
    // in async case, this method may still be called after destroy
    if (!this.popoverTemplate) return;
    if (event.key === 'Escape') {
      this.close();
    } else if (event.key === 'Tab') {
      focusTrap(this.mountedPopover, event);
    }
    event.stopPropagation();
  }

  _autoFocus() {
    if (this.mountedPopover) {
      const autofocus = this.mountedPopover.querySelector('[autofocus]');
      if (autofocus) {
        autofocus.focus();
      }
    }
  }

  _mount() {
    if (!this.mountedPopover) {
      // this.mountedPopover = this.popoverTemplate.cloneNode(true);
      this.mountedPopover = this.popoverTemplate;
      this.mountedPopover.style.zIndex = this.options.zIndex;
      this.options.mountTo.append(this.mountedPopover);
      this._bindEvents();
    }
  }

  _unmount() {
    if (this.mountedPopover) {
      this._unbindEvents();
      this.mountedPopover.remove();
      this.mountedPopover = null;
    }
  }

  _setAccessable() {
    if (this.mountedPopover) {
      // set tabindex to 0 and remove aria-hidden
      this.mountedPopover.setAttribute('tabindex', '0');
      this.mountedPopover.removeAttribute('aria-hidden');
      this.mountedPopover.style.display = '';
      this._bindEvents();
    }
  }

  _setUnaccessable() {
    if (this.mountedPopover) {
      // set tabindex to -1 and add aria-hidden
      this.mountedPopover.setAttribute('tabindex', '-1');
      this.mountedPopover.setAttribute('aria-hidden', 'true');
      this.mountedPopover.style.display = 'none';
      this._unbindEvents();
    }
  }

  async toggle() {
    if (this.isOpened) {
      await this.close();
    } else {
      await this.open();
    }
  }

  async open() {
    if (!this.isOpened) {
      this._prevFocus = document.activeElement; // save previous focus
      if (this.options.scrollLock) {
        document.body.style.overflow = 'hidden';
      }
      if (this.options.presist) {
        this._setAccessable();
      } else {
        this._mount();
      }
      this.mountedPopover.classList.add('open');
      if (this.options.autoFocus) {
        this._autoFocus();
      }
      this.isOpened = true;
    }
  }

  async close() {
    if (this.isOpened) {
      if (this.options.scrollLock) {
        document.body.style.overflow = '';
      }
      this.isOpened = false;
      if (this._prevFocus instanceof HTMLElement) {
        this._prevFocus.focus({
          preventScroll: true,
        });
      }
      this.mountedPopover.classList.remove('open');
      if (this.options.presist) {
        this._setUnaccessable();
      } else {
        this._unmount();
      }
    }
  }

  async destroy() {
    await this.close();
    this._unmount();
    if (this.toggleEl instanceof HTMLElement) {
      this.toggleEl.removeEventListener('keydown', this.__onToggleKeyDown);
      this.toggleEl.removeEventListener('click', this.__onToggleClick);
      if (this.options.trigger === 'hover') {
        this.toggleEl.removeEventListener('mouseenter', this.__onMouseEnter);
        this.toggleEl.removeEventListener('mouseleave', this.__onMouseLeave);
      }
    }
    this.toggleEl = null;
  }
}

class Modal extends Popover {
  static defaultModalOptions = {
    mountTo: document.body, // mount popover to this element
    scrollLock: true, // lock body scroll when popover is opened
    presist: false, // keep modal in dom once opened
    zIndex: null,
  };
  constructor(element, toggle, options = {}) {
    const combinedOptions = { ...Modal.defaultModalOptions, ...options };
    super(element, toggle, {
      prefix: 'modal',
      backdrop: true,
      closeBtn: true,
      autoFocus: true,
      ...combinedOptions,
    });
  }

  async toggle() {
    if (this.isOpened) {
      await this.close();
    } else {
      await this.open();
    }
  }

  async open() {
    if (!this.isOpened) {
      await super.open();
      const modalBackdrop = this.mountedPopover.querySelector('.modal-backdrop');
      const modalPanel = this.mountedPopover.querySelector('.modal-panel');
      modalBackdrop.classList.remove('fade-out');
      modalPanel.classList.remove('slide-down-fade-out');
      modalBackdrop.classList.add('fade-in');
      modalPanel.classList.add('slide-up-fade-in');
    }
  }

  async close() {
    if (this.isOpened) {
      const modalBackdrop = this.mountedPopover.querySelector('.modal-backdrop');
      const modalPanel = this.mountedPopover.querySelector('.modal-panel');
      modalBackdrop.classList.remove('fade-in');
      modalPanel.classList.remove('slide-up-fade-in');
      modalBackdrop.classList.add('fade-out');
      modalPanel.classList.add('slide-down-fade-out');
      await Promise.all([animationsComplete(modalBackdrop), animationsComplete(modalPanel)]);
      await super.close();
    }
  }
}

class Search {
  constructor() {
    this.rootSelector = '';
    this.inputSelector = '';
    this.initSearchInstance = null;
    if (config.search.provider === 'local') {
      this.rootSelector = '#local-search-panel';
      this.inputSelector = '.local-SearchBox-input';
      this.initSearchInstance = initLocalSearch;
    } else if (config.search.provider === 'algolia') {
      this.rootSelector = '#algolia-search-panel';
      this.inputSelector = '.ais-SearchBox-input';
      this.initSearchInstance = initAlgoliaSearch;
    }
    this.toggleEl = document.querySelector('#search-toggle');
    this.__onToggleClick = this._onToggleClick.bind(this);
    if (this.toggleEl instanceof HTMLElement) {
      this.toggleEl.addEventListener('click', this.__onToggleClick);
    }
    this.init();
  }
  init() {
    this.searchInstance = null;
    const template = document.querySelector('#search-modal-template');
    if (template instanceof HTMLTemplateElement) {
      const el = template.content.querySelector('.modal')?.cloneNode(true);
      if (el instanceof HTMLElement) {
        this.modal = new Modal(el);
      }
    }
  }
  _onToggleClick() {
    this.toggle();
  }
  get isOpened() {
    if (this.modal) {
      return this.modal.isOpened;
    }
    return false;
  }
  async open() {
    if (this.modal) {
      await this.modal.open();
      const el = this.modal.mountedPopover.querySelector(this.rootSelector);
      if (this.initSearchInstance) {
        this.searchInstance = await this.initSearchInstance(el);
      }
      this.modal.mountedPopover.querySelector(this.inputSelector).focus();
    }
  }
  async close() {
    if (this.modal) {
      await this.modal.close();
      this.searchInstance?.destroy();
      this.searchInstance = null;
    }
  }
  async toggle() {
    if (this.modal) {
      if (this.isOpened) {
        await this.close();
      } else {
        await this.open();
      }
    }
  }
  destroy() {
    this.modal?.destroy();
    this.modal = null;
    if (this.toggleEl instanceof HTMLElement) {
      this.toggleEl.removeEventListener('click', this.__onToggleClick);
    }
  }
}

async function initLocalSearch(element) {
  const { localsearch, LocalSearch } = await import('./localsearch-585b9ee8.js');

  const searchClient = localsearch(config.search.path);
  searchClient.configure({
    searchableAttributes: ['title', 'content'],
    attributesToHighlight: ['title', 'content'],
    attributesToSnippet: ['content'],
    attributesToRetrieve: ['title', 'content', 'url'],
  });
  const search = new LocalSearch({
    searchClient,
    placeholder: config.search.placeholder,
    searchAsYouType: config.search.searchAsYouType,
    templates: {
      item: hit => `
        <article>
          <a href="${hit.url}" rel="bookmark">
            <div class="post-thumbnail">
              <svg fill="currentColor" width="1em" height="1em" class="icon"><use xlink:href="#ri-menu-line"></use></svg>
            </div>
            <div class="post-content">
              <h2 class="post-title">${hit.title}</h2>
              <div class="post-excerpt">${hit.content}</div>
            </div>
            <svg fill="currentColor" width="1em" height="1em" class="icon enter-icon"><use xlink:href="#ri-arrow-right-s-line"></use></svg>
          </a>
        </article>`,
      empty: query => `<div>未查找到有关 ${query} 的结果</div>`,
    },
    onQueryChange() {
      const container = element.querySelector('#local-search-result-wrap');
      if (search.isEmptyQuery()) {
        container.style.display = 'none';
      }
    },
    onQuery() {
      const container = element.querySelector('#local-search-result-wrap');
      container.style.display = 'none';
    },
    onResult() {
      const container = element.querySelector('#local-search-result-wrap');
      container.style.display = '';
    }
  });
  search.setSearchBox(element.querySelector('#search-input'));
  search.setSearchResults(element.querySelector('#local-hits'));
  search.setSubmitButton(element.querySelector('.local-SearchBox-submit'));
  search.setResetButton(element.querySelector('.local-SearchBox-reset'));
  search.start();
  return {
    instance: search,
    destroy() {
      search.destroy();
    },
  };
}

async function initAlgoliaSearch(element) {
  const algoliasearch = (await import('./algoliasearch-lite.esm.browser-18573b18.js')).default;
  const instantsearch = (await import('./index-03663e12.js')).default;
  // import configure from 'instantsearch.js/es/widgets/configure/configure';
  // import searchBox from 'instantsearch.js/es/widgets/search-box/search-box';
  // import infiniteHits from 'instantsearch.js/es/widgets/infinite-hits/infinite-hits';
  // import poweredBy from 'instantsearch.js/es/widgets/powered-by/powered-by';
  // import hits from 'instantsearch.js/es/widgets/hits/hits';
  // import pagination from 'instantsearch.js/es/widgets/pagination/pagination';
  // import stats from 'instantsearch.js/es/widgets/stats/stats';
  const { configure, searchBox, poweredBy, infiniteHits, hits, pagination, stats } = await import('./index-1c79cfb0.js');
  

  const algoliaClient = algoliasearch(config.search.appId, config.search.apiKey);
  const searchClient = {
    ...algoliaClient,
    search(requests) {
      if (requests.every(({ params }) => !params.query)) {
        return Promise.resolve({
          results: requests.map(() => ({
            hits: [],
            nbHits: 0,
            nbPages: 0,
            page: 0,
            processingTimeMS: 0,
          })),
        });
      }
      return algoliaClient.search(requests);
    },
  };
  const search = instantsearch({
    indexName: config.search.indexName,
    searchClient,
    searchFunction(helper) {
      const container = element.querySelector('#algolia-search-result-wrap');
      container.style.display = helper.state.query === '' ? 'none' : '';
      helper.search();
    },
  });
  const widgets = [];
  if (config.search.configure.enable) {
    const { enable, ...options } = config.search.configure;
    const widget = configure({
      // attributesToSnippet: ['*'],
      // attributesToHighlight: ['*'],
      // snippetEllipsisText: '...',
      ...options
    });
    widgets.push(widget);
  }
  if (config.search.searchBox.enable) {
    const { enable, ...options } = config.search.searchBox;
    const widget = searchBox({
      container: element.querySelector('#algolia-searchbox'),
      placeholder: config.search.searchBox.placeholder,
      autofocus: false,
      searchAsYouType: config.search.searchBox.searchAsYouType,
      showReset: true,
      showSubmit: true,
      showLoadingIndicator: true,
      templates: {
        submit({ cssClasses }, { html }) {
          return html`<svg fill="currentColor" width="1em" height="1em" class="icon ${cssClasses.submit}"><use xlink:href="#ri-search-line"></use></svg>`;
        },
        reset({ cssClasses }, { html }) {
          return html`<svg fill="currentColor" width="1em" height="1em" class="icon ${cssClasses.resetIcon}"><use xlink:href="#ri-close-circle-fill"></use></svg>`;
        },
        loadingIndicator({ cssClasses }, { html }) {
          return html`<svg fill="currentColor" width="1em" height="1em" class="icon ${cssClasses.loadingIcon}"><use xlink:href="#ri-loader-4-line"></use></svg>`;
        }
      },
      ...options
    });
    widgets.push(widget);
  }
  if (config.search.poweredBy.enable) {
    const { enable, ...options } = config.search.poweredBy;
    const widget = poweredBy({
      container: element.querySelector('#algolia-poweredby'),
      ...options
    });
    widgets.push(widget);
  }
  if (config.search.infiniteHits.enable || config.search.hits.enable) {
    const hitOptions = {
      container: element.querySelector('#algolia-hits'),
      transformItems(items) {
        return items.map(item => ({
          ...item,
          date: new Date(item.date).toLocaleDateString(),
          hasThumbnail: item.thumbnail != null,
        }));
      },
      templates: {
        showMoreText() { return '加载更多'; },
        empty(result, { html }) {
          if (result.query) {
            return html`<div>未查找到有关 ${result.query} 的结果</div>`;
          }
          return html`<div>搜索中</div>`;
        },
        item(hit, { html, components }) {
          return html`
            <article>
              <a href="${hit.permalink}" rel="bookmark">
                <div class="post-thumbnail">
                  ${
                    hit.thumbnail 
                    ? html`<img src="${hit.thumbnail}"/>`
                    : html`<svg fill="currentColor" width="1em" height="1em" class="icon"><use xlink:href="#ri-menu-line"></use></svg>`
                  }
                </div>
                <div class="post-content">
                  <div class="post-date">${hit.date}</div>
                  <h2 class="post-title">${components.Highlight({ hit, attribute: 'title' })}</h2>
                  <div class="post-excerpt">${components.Snippet({ hit, attribute: 'content' })}</div>
                </div>
                <svg fill="currentColor" width="1em" height="1em" class="icon enter-icon"><use xlink:href="#ri-arrow-right-s-line"></use></svg>
              </a>
            </article>`;
        }
      },
    };
    if (config.search.infiniteHits.enable) {
      const { enable, ...options } = config.search.infiniteHits;
      const widget = infiniteHits({
        ...hitOptions,
        ...options
      });
      widgets.push(widget);
    }
    if (config.search.hits.enable) {
      const { enable, ...options } = config.search.hits;
      const widget = hits({
        ...hitOptions,
        ...options
      });
      widgets.push(widget);
    }
  }
  if (config.search.stats.enable) {
    const { enable, ...options } = config.search.stats;
    const widget = stats({
      container: element.querySelector('#algolia-stats'),
      templates: {
        text(state, { html }) {
          return html`<span role="img" aria-label="emoji">⚡️</span><strong>${state.nbHits}</strong> results found ${ state.query ? html`for <strong>"${state.query}"</strong>` : '' } in <strong>${state.processingTimeMS}ms</strong>`;
        }
      },
      ...options
    });
    widgets.push(widget);
  }
  if (config.search.pagination.enable) {
    const { enable, ...options } = config.search.pagination;
    const widget = pagination({
      container: element.querySelector('#algolia-pagination'),
      ...options
    });
    widgets.push(widget);
  }
  search.addWidgets(widgets);
  search.start();
  return {
    instance: search,
    destory() {
      search.removeWidgets(widgets);
      search.dispose();
    },
  };
}

class Drawer extends Popover {
  static defaultDrawerOptions = {
    mountTo: document.body, // mount popover to this element
    scrollLock: true, // lock body scroll when popover is opened
    presist: false, // keep drawer in dom once opened
    zIndex: null,
  };
  constructor(element, toggle, options = {}) {
    const combinedOptions = { ...Drawer.defaultDrawerOptions, ...options };
    super(element, toggle, {
      prefix: 'drawer',
      backdrop: true,
      closeBtn: true,
      autoFocus: true,
      ...combinedOptions,
    });
    this.anchor = element.classList.contains('drawer-anchor-left') ? 'left' : 'right';
    this._slideInDirection = this.anchor === 'left' ? 'right' : 'left';
    this._slideOutDirection = this.anchor === 'left' ? 'left' : 'right';
  }

  async open() {
    if (!this.isOpened) {
      await super.open();
      const drawerBackdrop = this.mountedPopover.querySelector('.drawer-backdrop');
      const drawerPanel = this.mountedPopover.querySelector('.drawer-panel');
      drawerBackdrop.classList.remove('fade-out');
      drawerPanel.classList.remove(`slide-${this._slideOutDirection}-fade-out`);
      drawerBackdrop.classList.add('fade-in');
      drawerPanel.classList.add(`slide-${this._slideInDirection}-fade-in`);
    }
  }

  async close() {
    if (this.isOpened) {
      const drawerBackdrop = this.mountedPopover.querySelector('.drawer-backdrop');
      const drawerPanel = this.mountedPopover.querySelector('.drawer-panel');
      drawerBackdrop.classList.remove('fade-in');
      drawerPanel.classList.remove(`slide-${this._slideInDirection}-fade-in`);
      drawerBackdrop.classList.add('fade-out');
      drawerPanel.classList.add(`slide-${this._slideOutDirection}-fade-out`);
      await Promise.all([animationsComplete(drawerBackdrop), animationsComplete(drawerPanel)]);
      await super.close();
    }
  }
}

const checkBehavior = (behavior) => {
    return behavior === undefined || behavior === "auto" || behavior === "instant" || behavior === "smooth";
};
function elementScrollXY(x, y) {
    this.scrollLeft = x;
    this.scrollTop = y;
}
const failedExecute = (method, object, reason = "cannot convert to dictionary.") => `Failed to execute '${method}' on '${object}': ${reason}`;
const failedExecuteInvalidEnumValue = (method, object, value) => failedExecute(method, object, `The provided value '${value}' is not a valid enum value of type ScrollBehavior.`);
/* eslint-disable */
const backupMethod = (proto, method, fallback) => {
    var _a;
    const backup = `__SEAMLESS.BACKUP$${method}`;
    if (!proto[backup] && proto[method] && !((_a = proto[method]) === null || _a === void 0 ? void 0 : _a.__isPolyfill)) {
        proto[backup] = proto[method];
    }
    return proto[backup] || fallback;
};
/* eslint-enable */
const isObject = (value) => {
    const type = typeof value;
    return value !== null && (type === "object" || type === "function");
};
/**
 * - On Chrome and Firefox, document.scrollingElement will return the <html> element.
 * - Safari, document.scrollingElement will return the <body> element.
 * - On Edge, document.scrollingElement will return the <body> element.
 * - IE11 does not support document.scrollingElement, but you can assume its <html>.
 */
const scrollingElement = (element) => element.ownerDocument.scrollingElement || element.ownerDocument.documentElement;

const ease = (k) => {
    return 0.5 * (1 - Math.cos(Math.PI * k));
};
/* eslint-disable */
function now() {
    var _a;
    let fn;
    if ((_a = window.performance) === null || _a === void 0 ? void 0 : _a.now) {
        fn = () => window.performance.now();
    }
    else {
        fn = () => window.Date.now();
    }
    // @ts-ignore
    now = fn;
    return fn();
}
/* eslint-enable */
const DURATION = 500;
const step = (context) => {
    const currentTime = now();
    const elapsed = (currentTime - context.timeStamp) / (context.duration || DURATION);
    if (elapsed > 1) {
        context.method(context.targetX, context.targetY);
        context.callback();
        return;
    }
    const value = (context.timingFunc || ease)(elapsed);
    const currentX = context.startX + (context.targetX - context.startX) * value;
    const currentY = context.startY + (context.targetY - context.startY) * value;
    context.method(currentX, currentY);
    context.rafId = window.requestAnimationFrame(() => {
        step(context);
    });
};

// https://drafts.csswg.org/cssom-view/#normalize-non-finite-values
const nonFinite = (value) => {
    if (!isFinite(value)) {
        return 0;
    }
    return Number(value);
};
const isConnected = (node) => {
    var _a;
    return ((_a = node.isConnected) !== null && _a !== void 0 ? _a : (!node.ownerDocument ||
        // eslint-disable-next-line no-bitwise
        !(node.ownerDocument.compareDocumentPosition(node) & /** DOCUMENT_POSITION_DISCONNECTED */ 1)));
};
const scrollWithOptions = (element, options, config) => {
    var _a, _b;
    if (!isConnected(element)) {
        return;
    }
    const startX = element.scrollLeft;
    const startY = element.scrollTop;
    const targetX = nonFinite((_a = options.left) !== null && _a !== void 0 ? _a : startX);
    const targetY = nonFinite((_b = options.top) !== null && _b !== void 0 ? _b : startY);
    if (targetX === startX && targetY === startY) {
        return;
    }
    const fallback = backupMethod(HTMLElement.prototype, "scroll", elementScrollXY);
    const method = backupMethod(Object.getPrototypeOf(element), "scroll", fallback).bind(element);
    if (options.behavior !== "smooth") {
        method(targetX, targetY);
        return;
    }
    const removeEventListener = () => {
        window.removeEventListener("wheel", cancelScroll);
        window.removeEventListener("touchmove", cancelScroll);
    };
    const context = Object.assign(Object.assign({}, config), { timeStamp: now(), startX,
        startY,
        targetX,
        targetY, rafId: 0, method, callback: removeEventListener });
    const cancelScroll = () => {
        window.cancelAnimationFrame(context.rafId);
        removeEventListener();
    };
    window.addEventListener("wheel", cancelScroll, {
        passive: true,
        once: true,
    });
    window.addEventListener("touchmove", cancelScroll, {
        passive: true,
        once: true,
    });
    step(context);
};
const isWindow = (obj) => obj.window === obj;
const createScroll = (scrollName) => (target, scrollOptions, config) => {
    const [element, scrollType] = isWindow(target)
        ? [scrollingElement(target.document.documentElement), "Window"]
        : [target, "Element"];
    const options = scrollOptions !== null && scrollOptions !== void 0 ? scrollOptions : {};
    if (!isObject(options)) {
        throw new TypeError(failedExecute(scrollName, scrollType));
    }
    if (!checkBehavior(options.behavior)) {
        throw new TypeError(failedExecuteInvalidEnumValue(scrollName, scrollType, options.behavior));
    }
    if (scrollName === "scrollBy") {
        options.left = nonFinite(options.left) + element.scrollLeft;
        options.top = nonFinite(options.top) + element.scrollTop;
    }
    scrollWithOptions(element, options, config);
};
const scrollTo = /* #__PURE__ */ createScroll("scrollTo");

const { OverlayScrollbars } = await import('./overlayscrollbars-b484a3a2.js');
// 滚动事件拦截器
class AbstractScrollManager {
  constructor() {
    if (this.constructor === AbstractScrollManager) {
      throw new TypeError('AbstractScrollManager is an abstract class and cannot be instantiated directly.');
    }
    this.store = {};
    this.handleScrollEvent = this.handleScrollEvent.bind(this);
  }
  register(name, fn) {
    if (!name) throw new TypeError('name is required');
    if (typeof fn !== 'function') throw new TypeError('fn must be a function');
    this.store[name] = fn;
  }
  unregister(name) {
    if (!name) throw new TypeError('name is required');
    delete this.store[name];
    // Reflect.deleteProperty(this.store, name);
  }
  handleScrollEvent(event) {
    for (let name in this.store) {
      this.store[name].call(this, event);
      // Reflect.apply(this.store[handler], this, args);
    }
  }
  getScrollTop() {
    throw new Error('not implemented');
  }
  getScrollLeft() {
    throw new Error('not implemented');
  }
  scrollTo(xCoord, yCoord) {
    throw new Error('not implemented');
  }
  triggerEvent() {
    throw new Error('not implemented');
  }
  destroy() {
    this.store = {};
  }
}
class NativeScrollManager extends AbstractScrollManager {
  constructor(element) {
    super();
    this.element = element;
    this._throttle = throttle(event => {
      this.handleScrollEvent(event);
    }, 0);
    this.bindEvent();
  }
  bindEvent() {
    if (this.element === document.documentElement) {
      document.addEventListener('scroll', this._throttle, { passive: true });
    } else {
      this.element.addEventListener('scroll', this._throttle, { passive: true });
    }
  }
  scrollTo(xCoord, yCoord, immediate = false) {
    if (yCoord === undefined) {
      yCoord = xCoord;
      xCoord = 0;
    }
    scrollTo(this.element, {
      top: yCoord,
      left: xCoord,
      behavior: immediate ? 'auto' : 'smooth',
    });
  }
  // experimental
  scrollIntoView(element, margin = 40) {
    const rect = element.getBoundingClientRect();
    const containerRect = this.element.getBoundingClientRect();
    if (rect.y < containerRect.y + margin) {
      // upper bound exceeded
      const d = rect.y - containerRect.y;
      this.scrollTo(this.element.scrollTop + d - margin);
    } else if (rect.y + rect.height > containerRect.y + containerRect.height) {
      // lower bound exceeded
      const d = rect.y + rect.height - (containerRect.y + containerRect.height);
      this.scrollTo(this.element.scrollTop + d + margin);
    }
  }
  triggerEvent() {
    if (this.element === document.documentElement) {
      document.dispatchEvent(new Event('scroll'));
    } else {
      this.element.dispatchEvent(new Event('scroll'));
    }
  }
  getScrollTop() {
    return this.element === document ? document.documentElement.scrollTop : this.element.scrollTop;
  }
  getScrollLeft() {
    return this.element === document ? document.documentElement.scrollLeft : this.element.scrollLeft;
  }
  destroy() {
    super.destroy();
    if (this.element === document.documentElement) {
      document.removeEventListener('scroll', this._throttle);
    } else {
      this.element.removeEventListener('scroll', this._throttle);
    }
  }
}

class OverlayScrollManager extends AbstractScrollManager {
  constructor(element) {
    super();
    if (OverlayScrollbars !== null) {
      const el = element === document.documentElement ? document.body : element;
      this.instance = OverlayScrollbars(el, {
        showNativeOverlaidScrollbars: false,
        scrollbars: {
          autoHide: 'move',
        },
      });
      this.element = element;
      this.bindEvent();
    }
  }
  bindEvent() {
    this.instance?.on(
      'scroll',
      throttle(event => {
        this.handleScrollEvent(event);
      }, 200)
    );
  }
  scrollTo(xCoord, yCoord, immediate = false) {
    if (yCoord === undefined) {
      yCoord = xCoord;
      xCoord = 0;
    }
    if (this.element === document.documentElement) {
      this.element.scroll({
        top: yCoord,
        left: xCoord,
        behavior: immediate ? 'auto' : 'smooth',
      });
    } else {
      this.element.querySelector(':scope > .os-viewport')?.scroll({
        top: yCoord,
        left: xCoord,
        behavior: immediate ? 'auto' : 'smooth',
      });
    }
    // this.instance?.scroll({
    //     x: xCoord,
    //     y: yCoord,
    // }, immediate ? 0 : 500, 'easeOutCubic');
  }
  triggerEvent() {
    if (this.element === document.documentElement) {
      document.dispatchEvent(new Event('scroll'));
    } else {
      this.element.dispatchEvent(new Event('scroll'));
    }
  }
  getScrollTop() {
    return this.element === document ? document.documentElement.scrollTop : this.element.scrollTop;
  }
  getScrollLeft() {
    return this.element === document ? document.documentElement.scrollLeft : this.element.scrollLeft;
  }
  destroy() {
    this.instance?.destroy();
    super.destroy();
  }
}
config.overlay_scrollbar.enable ? OverlayScrollManager : NativeScrollManager;
let scrollManager;
if (config.overlay_scrollbar.enable) {
  scrollManager = new OverlayScrollManager(document.documentElement);
} else {
  scrollManager = new NativeScrollManager(document.documentElement);
}

let e$1=e=>"object"==typeof e&&null!=e&&1===e.nodeType,t$2=(e,t)=>(!t||"hidden"!==e)&&("visible"!==e&&"clip"!==e),n$2=(e,n)=>{if(e.clientHeight<e.scrollHeight||e.clientWidth<e.scrollWidth){let l=getComputedStyle(e,null);return t$2(l.overflowY,n)||t$2(l.overflowX,n)||(e=>{let t=(e=>{if(!e.ownerDocument||!e.ownerDocument.defaultView)return null;try{return e.ownerDocument.defaultView.frameElement}catch(e){return null}})(e);return !!t&&(t.clientHeight<e.scrollHeight||t.clientWidth<e.scrollWidth)})(e)}return !1},l$2=(e,t,n,l,i,o,r,d)=>o<e&&r>t||o>e&&r<t?0:o<=e&&d<=n||r>=t&&d>=n?o-e-l:r>t&&d<n||o<e&&d>n?r-t+i:0,i$2=e=>{let t=e.parentElement;return null==t?e.getRootNode().host||null:t};var o$3=(t,o)=>{var r,d,h,f,u,s;if("undefined"==typeof document)return [];let{scrollMode:a,block:c,inline:g,boundary:m,skipOverflowHiddenElements:p}=o,w="function"==typeof m?m:e=>e!==m;if(!e$1(t))throw new TypeError("Invalid target");let W=document.scrollingElement||document.documentElement,H=[],b=t;for(;e$1(b)&&w(b);){if(b=i$2(b),b===W){H.push(b);break}null!=b&&b===document.body&&n$2(b)&&!n$2(document.documentElement)||null!=b&&n$2(b,p)&&H.push(b);}let v=null!=(d=null==(r=window.visualViewport)?void 0:r.width)?d:innerWidth,y=null!=(f=null==(h=window.visualViewport)?void 0:h.height)?f:innerHeight,E=null!=(u=window.scrollX)?u:pageXOffset,M=null!=(s=window.scrollY)?s:pageYOffset,{height:x,width:I,top:C,right:R,bottom:T,left:V}=t.getBoundingClientRect(),k="start"===c||"nearest"===c?C:"end"===c?T:C+x/2,B="center"===g?V+I/2:"end"===g?R:V,D=[];for(let e=0;e<H.length;e++){let t=H[e],{height:n,width:i,top:o,right:r,bottom:d,left:h}=t.getBoundingClientRect();if("if-needed"===a&&C>=0&&V>=0&&T<=y&&R<=v&&C>=o&&T<=d&&V>=h&&R<=r)return D;let f=getComputedStyle(t),u=parseInt(f.borderLeftWidth,10),s=parseInt(f.borderTopWidth,10),m=parseInt(f.borderRightWidth,10),p=parseInt(f.borderBottomWidth,10),w=0,b=0,O="offsetWidth"in t?t.offsetWidth-t.clientWidth-u-m:0,X="offsetHeight"in t?t.offsetHeight-t.clientHeight-s-p:0,Y="offsetWidth"in t?0===t.offsetWidth?0:i/t.offsetWidth:0,L="offsetHeight"in t?0===t.offsetHeight?0:n/t.offsetHeight:0;if(W===t)w="start"===c?k:"end"===c?k-y:"nearest"===c?l$2(M,M+y,y,s,p,M+k,M+k+x,x):k-y/2,b="start"===g?B:"center"===g?B-v/2:"end"===g?B-v:l$2(E,E+v,v,u,m,E+B,E+B+I,I),w=Math.max(0,w+M),b=Math.max(0,b+E);else {w="start"===c?k-o-s:"end"===c?k-d+p+X:"nearest"===c?l$2(o,d,n,s,p+X,k,k+x,x):k-(o+n/2)+X/2,b="start"===g?B-h-u:"center"===g?B-(h+i/2)+O/2:"end"===g?B-r+m+O:l$2(h,r,i,u,m+O,B,B+I,I);let{scrollLeft:e,scrollTop:f}=t;w=Math.max(0,Math.min(f+w/L,t.scrollHeight-n/L+X)),b=Math.max(0,Math.min(e+b/Y,t.scrollWidth-i/Y+O)),k+=f-w,B+=e-b;}D.push({el:t,top:w,left:b});}return D};

let t$1=e=>!1===e?{block:"end",inline:"nearest"}:(e=>e===Object(e)&&0!==Object.keys(e).length)(e)?e:{block:"start",inline:"nearest"};function o$2(o,l){let n=o.isConnected||o.ownerDocument.documentElement.contains(o);if((e=>"object"==typeof e&&"function"==typeof e.behavior)(l))return l.behavior(n?o$3(o,l):[]);if(!n)return;let r=t$1(l),c=o$3(o,r),i="scrollBehavior"in document.body.style;c.forEach((e=>{let{el:t,top:o,left:l}=e;t.scroll&&i?t.scroll({top:o,left:l,behavior:r.behavior}):(t.scrollTop=o,t.scrollLeft=l);}));}

class Toc {
  constructor(postElement, tocElement, containerElement) {
    this.rootElement = tocElement;
    let observedTitle = [...postElement.querySelectorAll('h2,h3,h4,h5,h6')];
    this.tocItem = new Map();

    let tocItem = [...tocElement.querySelectorAll('.toc a[href]')];
    for (let index = 0; index < tocItem.length; index++) {
      const element = tocItem[index];
      let name = element.getAttribute('href').substr(1); // remove # characters
      name = decodeURI(name);
      if (name.length > 0) {
        this.tocItem.set(name, {
          index: index,
          element: element,
        });
      }
    }
    this.containerElement = containerElement;
    this._tocObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(entry => {
          const name = entry.target.id;
          if (entry.intersectionRatio === 1) {
            // console.log('enter', entry);
            this._activateTocItem(name);
            // check if an element is visible
            if (isVisible(this.rootElement)) {
              // console.log('scroll into view');
              this._scrollIntoView(name);
            }
          } else {
            // console.log('leave', entry);
            this._deactivateTocItem(name);
          }
        });
      },
      { threshold: 1 }
    );
    observedTitle.forEach(item => {
      this._tocObserver.observe(item);
    });
    this.activedTocItem = new Set();
  }
  _activateTocItem(name) {
    name = decodeURI(name);
    let item = this.tocItem.get(name);
    if (item) {
      this.activedTocItem.add(item);
      this._clearActiveClass();
      this._setActiveClass();
    }
  }
  _deactivateTocItem(name) {
    name = decodeURI(name);
    let item = this.tocItem.get(name);
    if (item) {
      if (this.activedTocItem.size > 1) {
        this._clearActiveClass();
      }
      this.activedTocItem.delete(item);
      this._setActiveClass();
    }
  }
  _clearActiveClass() {
    this.tocItem.forEach(item => {
      item.element.classList.remove('toc-active');
    });
  }
  _setActiveClass() {
    let minIndexItem = null;
    this.activedTocItem.forEach(item => {
      if (minIndexItem === null) {
        minIndexItem = item;
      } else {
        minIndexItem = minIndexItem.index < item.index ? minIndexItem : item;
      }
    });
    if (minIndexItem !== null) {
      minIndexItem.element.classList.add('toc-active');
    }
  }
  _scrollIntoView(name) {
    const item = this.tocItem.get(decodeURI(name));
    o$2(item.element, {
      scrollMode: 'if-needed',
      behavior: 'smooth',
      block: 'nearest',
      boundary: this.containerElement,
    });
  }
  async destroy() {
    this._tocObserver.disconnect();
    this.tocItem.clear();
    this.activedTocItem.clear();
  }
}

class Tabs {
  static defaultTabOptions = {
    defaultActivate: 0,
  };
  constructor(element, options = {}) {
    const combinedOptions = { ...Tabs.defaultTabOptions, ...options };
    this.element = element;
    this.options = combinedOptions;
    this.headerElement = this.element.querySelector('.tabs-header');
    this.bodyElement = this.element.querySelector('.tabs-body');
    this.gliderElement = this.element.querySelector('.tabs-glider');
    this.animationPromises = [];
    this.activatedTab = this.options.defaultActivate;
    this.__onTabClick = this._onTabClick.bind(this);
    this.__onKeyDown = this._onKeyDown.bind(this);
    // delay init until visible
    this._visibleObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.intersectionRatio > 0) {
          this._init();
          this._visibleObserver.disconnect();
        }
      });
    });
    this._bindEvents();
  }
  get tabs() {
    return [...this.element.querySelectorAll('.tabs-header .tab')];
  }
  get panels() {
    return [...this.element.querySelectorAll('.tabs-body .tab-panel')];
  }

  _init() {
    // initial style
    this.panels.forEach((panel, index) => {
      if (index !== 0) {
        panel.style.display = 'none';
      } else {
        panel.style.display = 'block';
      }
    });
    const tab = this.tabs[this.activatedTab];
    const panel = this.panels[this.activatedTab];
    tab.classList.add('active');
    panel.classList.add('active');
    tab.setAttribute('aria-selected', true);
    this.headerElement.setAttribute('aria-labelledby', tab.id);
    this.gliderElement.style.width = tab.offsetWidth + 'px';
    this.gliderElement.style.left = tab.offsetLeft + 'px';
  }

  _onTabClick(event) {
    // in async case, this method may still be called after destroy
    if (!this.element) return;
    const target = event.target;
    const closetTab = target.closest('.tab');
    if (this.tabs.includes(closetTab)) {
      const index = this.tabs.indexOf(closetTab);
      this.activateTab(index);
    }
  }

  _onKeyDown(event) {
    // in async case, this method may still be called after destroy
    if (!this.element) return;
    const target = event.target;
    if (target.classList.contains('tab') && this.tabs.includes(target)) {
      let nextIndex = this.activatedTab;
      switch (event.key) {
        case 'Enter':
        case ' ':
          nextIndex = this.tabs.indexOf(target);
          break;
        case 'ArrowLeft':
          nextIndex = (this.activatedTab - 1 + this.tabs.length) % this.tabs.length;
          break;
        case 'ArrowRight':
          nextIndex = (this.activatedTab + 1 + this.tabs.length) % this.tabs.length;
          break;
        default:
          return;
      }
      event.preventDefault();
      this.activateTab(nextIndex);
    }
  }

  _bindEvents() {
    this.headerElement.addEventListener('click', this.__onTabClick);
    this.headerElement.addEventListener('keydown', this.__onKeyDown);
    this._visibleObserver.observe(this.element);
  }
  _unbindEvents() {
    this.headerElement.removeEventListener('click', this.__onTabClick);
    this.headerElement.removeEventListener('keydown', this.__onKeyDown);
    this._visibleObserver.disconnect();
  }

  async _enterAnimation(index, oldIndex) {
    const panel = this.panels[index];
    const oldPanel = this.panels[oldIndex];
    panel.style.position = 'absolute';
    panel.style.display = 'block';
    this.bodyElement.style.overflow = 'hidden';
    await Promise.all([
      applyTransition(panel, {
        from: {
          transform: index > oldIndex ? 'translateX(100%)' : 'translateX(-100%)',
          opacity: 0,
        },
        to: {
          transform: 'translateX(0)',
          opacity: 1,
        },
      }),
      applyTransition(this.bodyElement, {
        from: {
          height: oldPanel.offsetHeight + 'px',
        },
        to: {
          height: panel.offsetHeight + 'px',
        },
      }),
    ]);
    panel.style.position = null;
    panel.style.transform = null;
    panel.style.opacity = null;
    this.bodyElement.style.height = null;
    this.bodyElement.style.overflow = null;
  }

  async _leaveAnimation(index, oldIndex) {
    const oldPanel = this.panels[oldIndex];
    oldPanel.style.position = 'absolute';
    await applyTransition(oldPanel, {
      from: {
        transform: 'translateX(0)',
        opacity: 1,
      },
      to: {
        transform: index > oldIndex ? 'translateX(-100%)' : 'translateX(100%)',
        opacity: 0,
      },
    }),
      (oldPanel.style.display = 'none');
    oldPanel.style.position = null;
    oldPanel.style.transform = null;
    oldPanel.style.opacity = null;
  }

  async activateTab(index) {
    if (index === this.activatedTab) {
      return;
    }
    const tab = this.tabs[index];
    const oldTab = this.tabs[this.activatedTab];
    const panel = this.panels[index];
    const oldPanel = this.panels[this.activatedTab];
    tab.classList.add('active');
    panel.classList.add('active');
    oldTab.classList.remove('active');
    oldPanel.classList.remove('active');
    tab.setAttribute('aria-selected', true);
    oldTab.setAttribute('aria-selected', false);
    this.headerElement.setAttribute('aria-labelledby', tab.id);

    this.gliderElement.style.width = tab.getBoundingClientRect().width + 'px';
    this.gliderElement.style.left = tab.offsetLeft + 'px';

    const oldIndex = this.activatedTab;
    this.activatedTab = index;
    tab.focus();
    await this._finishAllAnimations();
    this.animationPromises.push(this._leaveAnimation(index, oldIndex));
    this.animationPromises.push(this._enterAnimation(index, oldIndex));
    await Promise.all(this.animationPromises);
  }

  async _finishAllAnimations() {
    this.panels.forEach((panel, index) => {
      finishAnimations(panel);
    });
    await Promise.all(this.animationPromises);
    this.animationPromises = [];
  }

  async destroy() {
    this._unbindEvents();
    this.element = null;
    this.headerElement = null;
    this.bodyElement = null;
  }
}

class Treeview {
  static defaultTreeviewOptions = {
    // ...
    deselectOnBlur: false,
    onSelect: (item, device) => {},
    onDeselect: (item, device) => {},
    onFocus: (item, device) => {},
    onBlur: (item, device) => {},
    beforeExpand: (item, device) => {},
    beforeCollapse: (item, device) => {},
    afterExpand: (item, device) => {},
    afterCollapse: (item, device) => {},
  };

  constructor(element, options = {}) {
    const combbindOptions = { ...Treeview.defaultTreeviewOptions, ...options };
    this.element = element;
    this.options = combbindOptions;
    this.items = {};
    this.selected = null;
    this.focused = null;

    this._isKeyDown = false;
    this._isMouseDown = false; // to tell if the focus is caused by mouse down
    this._onDocKeyDown = (() => {
      this._isKeyDown = true;
    }).bind(this);
    this._onDocKeyUp = (() => {
      this._isKeyDown = false;
    }).bind(this);
    this._onDocMouseDown = (() => {
      this._isMouseDown = true;
    }).bind(this);
    this._onDocMouseUp = (() => {
      this._isMouseDown = false;
    }).bind(this);

    this._buildTree(this.element);
    this.__onItemClick = this._onItemClick.bind(this);
    this.__onKeyDown = this._onKeyDown.bind(this);
    this.__onMouseDown = this._onMouseDown.bind(this);
    this.__onFocus = this._onFocus.bind(this);
    this.__onBlur = this._onBlur.bind(this);
    this._bindEvents();
    for (const id in this.items) {
      const item = this.items[id];
      const contentElement = item.element.querySelector('.treeview-item-content');
      if (item.isExpanded && id !== 'root') {
        item.element.setAttribute('aria-expanded', 'true');
        contentElement.style.visibility = null;
        contentElement.style.height = 'auto';
      }
    }
  }

  _buildTree(rootElement, parentId = null) {
    const children = [];
    const id = parentId ? rootElement.getAttribute('id').replace('treeview-item-', '') : 'root';
    const isExpanded = parentId ? rootElement.classList.contains('expanded') : true;
    const childrenElements = parentId
      ? rootElement.querySelectorAll(':scope > .treeview-item-content > .treeview-item')
      : rootElement.querySelectorAll(':scope > .treeview-item');
    childrenElements.forEach(child => {
      children.push(this._buildTree(child, id));
    });
    this.items[id] = {
      parentId,
      isExpanded: children.length === 0 ? false : isExpanded,
      children,
      element: rootElement,
      isEndpoint: children.length === 0,
    };
    return id;
  }

  _bindEvents() {
    this.element.addEventListener('click', this.__onItemClick);
    this.element.addEventListener('keydown', this.__onKeyDown);
    this.element.addEventListener('focus', this.__onFocus);
    this.element.addEventListener('mousedown', this.__onMouseDown);
    this.element.addEventListener('blur', this.__onBlur);
    document.addEventListener('mousedown', this._onDocMouseDown);
    document.addEventListener('mouseup', this._onDocMouseUp);
    document.addEventListener('keydown', this._onDocKeyDown);
    document.addEventListener('keyup', this._onDocKeyUp);
  }

  _unbindEvents() {
    this.element.removeEventListener('click', this.__onItemClick);
    this.element.removeEventListener('keydown', this.__onKeyDown);
    this.element.removeEventListener('focus', this.__onFocus);
    this.element.removeEventListener('mousedown', this.__onMouseDown);
    this.element.removeEventListener('blur', this.__onBlur);
    document.removeEventListener('mousedown', this._onDocMouseDown);
    document.removeEventListener('mouseup', this._onDocMouseUp);
    document.removeEventListener('keydown', this._onDocKeyDown);
    document.removeEventListener('keyup', this._onDocKeyUp);
  }

  _onKeyDown(event) {
    const key = event.key;
    switch (key) {
      case 'ArrowDown':
        event.preventDefault();
        this._focusNext(this.focused ?? 'root', 'keyboard');
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (this.focused !== null) {
          this._focusPrev(this.focused, 'keyboard');
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (this.focused !== null) {
          if (this.items[this.focused].isExpanded) {
            this.collapse(this.focused, 'keyboard');
          } else {
            const parent = this.items[this.focused].parentId;
            if (parent !== 'root') {
              this.focus(parent, 'keyboard');
            }
          }
        }
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (this.focused !== null) {
          if (!this.items[this.focused].isEndpoint) {
            if (!this.items[this.focused].isExpanded) {
              this.expand(this.focused, 'keyboard');
            } else {
              this.focus(this.items[this.focused].children[0], 'keyboard');
            }
          }
        }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (this.focused !== null) {
          if (!this.items[this.focused].isEndpoint) {
            this.toggle(this.focused, 'keyboard');
            this.select(this.focused, 'keyboard');
          } else {
            this.select(this.focused, 'keyboard');
          }
        }
        break;
    }
  }

  _onItemClick(event) {
    // console.log('treeview click');
    const item = event.target.closest('.treeview-item');
    const isItem = item !== null && this.items.hasOwnProperty(item.id.replace('treeview-item-', ''));
    if (isItem) {
      const id = item.getAttribute('id').replace('treeview-item-', '');
      this.toggle(id, 'mouse');
      this.select(id, 'mouse');
      this.focus(id, 'mouse');
    }
  }

  _onMouseDown(event) {
    // Prevent focus on child elements
    event.preventDefault();
    this.element.focus({
      preventScroll: true,
    });
  }

  _onFocus(event) {
    // focus when click will be handled by _onItemClick
    if (this._isKeyDown) {
      if (this.selected) {
        this.focus(this.selected, 'keyboard');
      } else {
        this._focusNext('root', 'keyboard');
      }
    }
  }

  _onBlur(event) {
    const device = this._isKeyDown ? 'keyboard' : 'mouse';
    this.blur(this.focused, device);
    if (this.options.deselectOnBlur) {
      this.deselect(this.selected, device);
    }
  }

  async toggle(id, device) {
    if (!(id in this.items) || this.items[id].isEndpoint) {
      return;
    }
    if (this.items[id].isExpanded) {
      await this.collapse(id, device);
    } else {
      await this.expand(id, device);
    }
  }

  async expand(id, device) {
    if (!(id in this.items) || this.items[id].isEndpoint || this.items[id].isExpanded) {
      return;
    }
    const item = this.items[id];
    const element = item.element;
    const contentElement = element.querySelector('.treeview-item-content');

    if (typeof this.options.beforeExpand === 'function') {
      await new Promise(resolve => {
        this.options.beforeExpand(item, device);
        resolve(null);
      });
    }

    this.items[id].isExpanded = true;
    element.classList.add('expanded');
    element.setAttribute('aria-expanded', 'true');
    contentElement.style.visibility = null;

    await applyTransition(contentElement, {
      from: { height: contentElement.offsetHeight + 'px', opacity: 0, transform: 'translateX(10%)' },
      to: { height: contentElement.scrollHeight + 'px', opacity: 1, transform: 'translateX(0)' },
    });

    if (this.items[id]?.isExpanded) {
      contentElement.style.height = 'auto';
      if (typeof this.options.afterExpand === 'function') {
        this.options.afterExpand(item, device);
      }
    }
  }

  async collapse(id, device) {
    if (!(id in this.items) || this.items[id].isEndpoint || !this.items[id].isExpanded) {
      return;
    }
    const item = this.items[id];
    const element = item.element;
    const contentElement = element.querySelector('.treeview-item-content');

    if (typeof this.options.beforeCollapse === 'function') {
      await new Promise(resolve => {
        this.options.beforeCollapse(item, device);
        resolve(null);
      });
    }

    element.classList.remove('expanded');
    element.setAttribute('aria-expanded', 'false');
    this.items[id].isExpanded = false;

    await applyTransition(contentElement, {
      from: { height: contentElement.offsetHeight + 'px', opacity: 1, transform: 'translateX(0)' },
      to: { height: '0px', opacity: 0, transform: 'translateX(10%)' },
    });

    if (!this.items[id]?.isExpanded) {
      contentElement.style.visibility = 'hidden';
      if (typeof this.options.afterCollapse === 'function') {
        this.options.afterCollapse(item, device);
      }
    }
  }

  async select(id, device) {
    if (!(id in this.items) || this.selected === id) {
      return;
    }
    if (this.selected) {
      await this.deselect(this.selected, device);
    }
    const item = this.items[id];
    const element = item.element;
    element.classList.add('selected');
    element.setAttribute('aria-selected', 'true');
    this.selected = id;
    if (typeof this.options.onSelect === 'function') {
      this.options.onSelect(item, device);
    }
  }

  async deselect(id, device) {
    if (!(id in this.items) || this.selected !== id) {
      return;
    }
    const item = this.items[id];
    const element = item.element;
    element.classList.remove('selected');
    element.setAttribute('aria-selected', 'false');
    this.selected = null;
    if (typeof this.options.onDeselect === 'function') {
      this.options.onDeselect(item, device);
    }
  }

  async focus(id, device) {
    if (!(id in this.items) || this.focused === id) {
      return;
    }
    if (this.focused) {
      await this.blur(this.focused, device);
    }
    const item = this.items[id];
    const element = item.element;
    element.classList.add('focused');
    this.focused = id;
    if (device === 'keyboard') {
      // scroll into view if needed
      const rect = element.getBoundingClientRect();
      if (
        rect.top < 0 ||
        rect.left < 0 ||
        rect.bottom > document.documentElement.clientHeight ||
        rect.right > document.documentElement.clientWidth
      ) {
        element.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      }
    }
    if (typeof this.options.onFocus === 'function') {
      this.options.onFocus(item, device);
    }
  }

  async blur(id, device) {
    if (!(id in this.items) || this.focused !== id) {
      return;
    }
    const item = this.items[id];
    const element = item.element;
    element.classList.remove('focused');
    this.focused = null;
    if (typeof this.options.onBlur === 'function') {
      this.options.onBlur(item, device);
    }
  }

  _getPrevSibling(id) {
    if (!(id in this.items)) {
      return null;
    }
    const item = this.items[id];
    const parentId = item.parentId;
    if (!parentId) {
      // is root
      return null;
    }
    const parent = this.items[parentId];
    const index = parent.children.indexOf(id);
    if (index > 0) {
      return parent.children[index - 1];
    }
    return null;
  }

  _getNextSibling(id) {
    if (!(id in this.items)) {
      return null;
    }
    const item = this.items[id];
    const parentId = item.parentId;
    if (!parentId) {
      // is root
      return null;
    }
    const parent = this.items[parentId];
    const index = parent.children.indexOf(id);
    if (index < parent.children.length - 1) {
      return parent.children[index + 1];
    }
    return null;
  }

  _focusPrev(currentId, device) {
    if (!(currentId in this.items)) {
      return;
    }
    const currentItem = this.items[currentId];
    const prevSibling = this._getPrevSibling(currentId);
    if (prevSibling) {
      const prevSiblingItem = this.items[prevSibling];
      if (prevSiblingItem.isExpanded) {
        let lastChild = prevSibling;
        let lastChildItem = prevSiblingItem;
        while (lastChildItem.isExpanded) {
          lastChild = lastChildItem.children[lastChildItem.children.length - 1];
          lastChildItem = this.items[lastChild];
        }
        this.focus(lastChild, device);
      } else {
        this.focus(prevSibling, device);
      }
    } else {
      if (currentItem.parentId !== 'root') {
        this.focus(currentItem.parentId, device);
      }
    }
  }

  _focusNext(currentId, device) {
    if (!(currentId in this.items)) {
      return;
    }
    const currentItem = this.items[currentId];
    if (currentItem.isExpanded) {
      const firstChild = currentItem.children[0];
      this.focus(firstChild, device);
    } else {
      const nextSibling = this._getNextSibling(currentId);
      if (nextSibling) {
        this.focus(nextSibling, device);
      } else {
        let parent = currentItem.parentId;
        while (parent !== null) {
          const nextSibling = this._getNextSibling(parent);
          if (nextSibling) {
            this.focus(nextSibling, device);
            break;
          }
          parent = this.items[parent].parentId;
        }
      }
    }
  }

  async destroy() {
    this._unbindEvents();
    this.items = {};
    this.element = null;
  }
}

class Sidebar {
  constructor(element = document.querySelector('#sidebar')) {
    this.init(element);
  }

  init(element = document.querySelector('#sidebar')) {
    this.rootElement = element;
    this._hasProfile = false;
    this._hasTocView = false;
    this._hasTabs = false;
    this._hasCategoryTree = false;
    this._initConFetti();
    this._initCategoryTree();
    this._initTabs();
    if (this._hasTabs) {
      this._initTocView();
    }
  }

  async _onProfileAvatarClick(event) {
    if (event.target instanceof HTMLElement) {
      const confetti = (await import('./confetti.module-6b35f8c7.js')).default;
      const rect = event.target.getBoundingClientRect();
      const x = (rect.x + rect.width / 2) / document.documentElement.clientWidth;
      const y = (rect.y + rect.height / 2) / document.documentElement.clientHeight;
      confetti({
        particleCount: 100,
        spread: 70,
        startVelocity: 30,
        origin: {
          x,
          y
        },
        zIndex: 99999
      });
    }
  }

  _initConFetti() {
    const profileElement = this.rootElement?.querySelector('.profile');
    if (profileElement) {
      this._hasProfile = true;
      this.avatarElement = profileElement?.querySelector('.avatar');
      this.avatarElement?.addEventListener('click', this._onProfileAvatarClick);
    }
  }

  _initTabs() {
    const tabsElement = this.rootElement?.querySelector('.sidebar-tabs');
    if (tabsElement !== null) {
      this._hasTabs = true;
      this.tabsIns = new Tabs(tabsElement);
    }
  }

  _initTocView() {
    const postElement = document.querySelector('#main .page');
    const tocElement = this.rootElement?.querySelector('.toc-view > .toc');
    const containerElement = this.rootElement?.querySelector('.tabs-body');
    if (tocElement && postElement && containerElement) {
      this._hasTocView = true;
      this.tocIns = new Toc(postElement, tocElement, containerElement);
    }
  }

  _initCategoryTree() {
    const element = this.rootElement?.querySelector('.category-tree > .treeview');
    if (element) {
      this._hasCategoryTree = true;
      this.TreeviewIns = new Treeview(element, {
        deselectOnBlur: true,
        onSelect: (item, device) => {
          if (device === 'keyboard') {
            const link = item.element.querySelector('a');
            if (link !== null) {
              link.click();
            }
          }
        },
        onFocus: (item, device) => {
          // scroll into view if needed
          // align to bottom cause the navbar is fixed
          if (device === 'keyboard') {
            const rect = element.getBoundingClientRect();
            if (
              rect.top < 40 ||
              rect.left < 0 ||
              rect.bottom > document.documentElement.clientHeight ||
              rect.right > document.documentElement.clientWidth
            ) {
              element.scrollIntoView({ block: 'nearest', inline: 'nearest' });
            }
          }
        },
      });
    }
  }

  async reset(element = document.querySelector('#sidebar')) {
    await this.destroy();
    this.init(element);
  }

  async destroy() {
    await Promise.all([
      this._hasProfile ? (() => {
        this.avatarElement?.removeEventListener('click', this._onProfileAvatarClick);
        this.avatarElement = null;
      })() : null,
      this._hasTabs ? this.tabsIns?.destroy() : null,
      this._hasTocView ? this.tocIns?.destroy() : null,
      this._hasCategoryTree ? this.TreeviewIns?.destroy() : null,
    ]);
  }
}

function t(t){return t.split("-")[0]}function e(t){return t.split("-")[1]}function n$1(e){return ["top","bottom"].includes(t(e))?"x":"y"}function r$1(t){return "y"===t?"height":"width"}function i$1(i,o,a){let{reference:l,floating:s}=i;const c=l.x+l.width/2-s.width/2,f=l.y+l.height/2-s.height/2,u=n$1(o),m=r$1(u),g=l[m]/2-s[m]/2,d="x"===u;let p;switch(t(o)){case"top":p={x:c,y:l.y-s.height};break;case"bottom":p={x:c,y:l.y+l.height};break;case"right":p={x:l.x+l.width,y:f};break;case"left":p={x:l.x-s.width,y:f};break;default:p={x:l.x,y:l.y};}switch(e(o)){case"start":p[u]-=g*(a&&d?-1:1);break;case"end":p[u]+=g*(a&&d?-1:1);}return p}const o$1=async(t,e,n)=>{const{placement:r="bottom",strategy:o="absolute",middleware:a=[],platform:l}=n,s=a.filter(Boolean),c=await(null==l.isRTL?void 0:l.isRTL(e));let f=await l.getElementRects({reference:t,floating:e,strategy:o}),{x:u,y:m}=i$1(f,r,c),g=r,d={},p=0;for(let n=0;n<s.length;n++){const{name:a,fn:h}=s[n],{x:y,y:x,data:w,reset:v}=await h({x:u,y:m,initialPlacement:r,placement:g,strategy:o,middlewareData:d,rects:f,platform:l,elements:{reference:t,floating:e}});u=null!=y?y:u,m=null!=x?x:m,d={...d,[a]:{...d[a],...w}},v&&p<=50&&(p++,"object"==typeof v&&(v.placement&&(g=v.placement),v.rects&&(f=!0===v.rects?await l.getElementRects({reference:t,floating:e,strategy:o}):v.rects),({x:u,y:m}=i$1(f,g,c))),n=-1);}return {x:u,y:m,placement:g,strategy:o,middlewareData:d}};function a$1(t){return "number"!=typeof t?function(t){return {top:0,right:0,bottom:0,left:0,...t}}(t):{top:t,right:t,bottom:t,left:t}}function l$1(t){return {...t,top:t.y,left:t.x,right:t.x+t.width,bottom:t.y+t.height}}async function s$1(t,e){var n;void 0===e&&(e={});const{x:r,y:i,platform:o,rects:s,elements:c,strategy:f}=t,{boundary:u="clippingAncestors",rootBoundary:m="viewport",elementContext:g="floating",altBoundary:d=!1,padding:p=0}=e,h=a$1(p),y=c[d?"floating"===g?"reference":"floating":g],x=l$1(await o.getClippingRect({element:null==(n=await(null==o.isElement?void 0:o.isElement(y)))||n?y:y.contextElement||await(null==o.getDocumentElement?void 0:o.getDocumentElement(c.floating)),boundary:u,rootBoundary:m,strategy:f})),w=l$1(o.convertOffsetParentRelativeRectToViewportRelativeRect?await o.convertOffsetParentRelativeRectToViewportRelativeRect({rect:"floating"===g?{...s.floating,x:r,y:i}:s.reference,offsetParent:await(null==o.getOffsetParent?void 0:o.getOffsetParent(c.floating)),strategy:f}):s[g]);return {top:x.top-w.top+h.top,bottom:w.bottom-x.bottom+h.bottom,left:x.left-w.left+h.left,right:w.right-x.right+h.right}}const c$1=Math.min,f$1=Math.max;function u$1(t,e,n){return f$1(t,c$1(e,n))}const g$1={left:"right",right:"left",bottom:"top",top:"bottom"};function d$1(t){return t.replace(/left|right|bottom|top/g,(t=>g$1[t]))}function p$1(t,i,o){void 0===o&&(o=!1);const a=e(t),l=n$1(t),s=r$1(l);let c="x"===l?a===(o?"end":"start")?"right":"left":"start"===a?"bottom":"top";return i.reference[s]>i.floating[s]&&(c=d$1(c)),{main:c,cross:d$1(c)}}const h$1={start:"end",end:"start"};function y$1(t){return t.replace(/start|end/g,(t=>h$1[t]))}const x$2=["top","right","bottom","left"];x$2.reduce(((t,e)=>t.concat(e,e+"-start",e+"-end")),[]);const b$1=function(e){return void 0===e&&(e={}),{name:"flip",options:e,async fn(n){var r;const{placement:i,middlewareData:o,rects:a,initialPlacement:l,platform:c,elements:f}=n,{mainAxis:u=!0,crossAxis:m=!0,fallbackPlacements:g,fallbackStrategy:h="bestFit",flipAlignment:x=!0,...w}=e,v=t(i),b=g||(v===l||!x?[d$1(l)]:function(t){const e=d$1(t);return [y$1(t),e,y$1(e)]}(l)),R=[l,...b],A=await s$1(n,w),P=[];let T=(null==(r=o.flip)?void 0:r.overflows)||[];if(u&&P.push(A[v]),m){const{main:t,cross:e}=p$1(i,a,await(null==c.isRTL?void 0:c.isRTL(f.floating)));P.push(A[t],A[e]);}if(T=[...T,{placement:i,overflows:P}],!P.every((t=>t<=0))){var O,L;const t=(null!=(O=null==(L=o.flip)?void 0:L.index)?O:0)+1,e=R[t];if(e)return {data:{index:t,overflows:T},reset:{placement:e}};let n="bottom";switch(h){case"bestFit":{var D;const t=null==(D=T.map((t=>[t,t.overflows.filter((t=>t>0)).reduce(((t,e)=>t+e),0)])).sort(((t,e)=>t[1]-e[1]))[0])?void 0:D[0].placement;t&&(n=t);break}case"initialPlacement":n=l;}if(i!==n)return {reset:{placement:n}}}return {}}}};function R$1(t,e){return {top:t.top-e.height,right:t.right-e.width,bottom:t.bottom-e.height,left:t.left-e.width}}function A$1(t){return x$2.some((e=>t[e]>=0))}const P$1=function(t){let{strategy:e="referenceHidden",...n}=void 0===t?{}:t;return {name:"hide",async fn(t){const{rects:r}=t;switch(e){case"referenceHidden":{const e=R$1(await s$1(t,{...n,elementContext:"reference"}),r.reference);return {data:{referenceHiddenOffsets:e,referenceHidden:A$1(e)}}}case"escaped":{const e=R$1(await s$1(t,{...n,altBoundary:!0}),r.floating);return {data:{escapedOffsets:e,escaped:A$1(e)}}}default:return {}}}}};const T$1=function(r){return void 0===r&&(r=0),{name:"offset",options:r,async fn(i){const{x:o,y:a}=i,l=await async function(r,i){const{placement:o,platform:a,elements:l}=r,s=await(null==a.isRTL?void 0:a.isRTL(l.floating)),c=t(o),f=e(o),u="x"===n$1(o),m=["left","top"].includes(c)?-1:1,g=s&&u?-1:1,d="function"==typeof i?i(r):i;let{mainAxis:p,crossAxis:h,alignmentAxis:y}="number"==typeof d?{mainAxis:d,crossAxis:0,alignmentAxis:null}:{mainAxis:0,crossAxis:0,alignmentAxis:null,...d};return f&&"number"==typeof y&&(h="end"===f?-1*y:y),u?{x:h*g,y:p*m}:{x:p*m,y:h*g}}(i,r);return {x:o+l.x,y:a+l.y,data:l}}}};function O$2(t){return "x"===t?"y":"x"}const L$2=function(e){return void 0===e&&(e={}),{name:"shift",options:e,async fn(r){const{x:i,y:o,placement:a}=r,{mainAxis:l=!0,crossAxis:c=!1,limiter:f={fn:t=>{let{x:e,y:n}=t;return {x:e,y:n}}},...m}=e,g={x:i,y:o},d=await s$1(r,m),p=n$1(t(a)),h=O$2(p);let y=g[p],x=g[h];if(l){const t="y"===p?"bottom":"right";y=u$1(y+d["y"===p?"top":"left"],y,y-d[t]);}if(c){const t="y"===h?"bottom":"right";x=u$1(x+d["y"===h?"top":"left"],x,x-d[t]);}const w=f.fn({...r,[p]:y,[h]:x});return {...w,data:{x:w.x-i,y:w.y-o}}}}},D$2=function(e){return void 0===e&&(e={}),{options:e,fn(r){const{x:i,y:o,placement:a,rects:l,middlewareData:s}=r,{offset:c=0,mainAxis:f=!0,crossAxis:u=!0}=e,m={x:i,y:o},g=n$1(a),d=O$2(g);let p=m[g],h=m[d];const y="function"==typeof c?c(r):c,x="number"==typeof y?{mainAxis:y,crossAxis:0}:{mainAxis:0,crossAxis:0,...y};if(f){const t="y"===g?"height":"width",e=l.reference[g]-l.floating[t]+x.mainAxis,n=l.reference[g]+l.reference[t]-x.mainAxis;p<e?p=e:p>n&&(p=n);}if(u){var w,v,b,R;const e="y"===g?"width":"height",n=["top","left"].includes(t(a)),r=l.reference[d]-l.floating[e]+(n&&null!=(w=null==(v=s.offset)?void 0:v[d])?w:0)+(n?0:x.crossAxis),i=l.reference[d]+l.reference[e]+(n?0:null!=(b=null==(R=s.offset)?void 0:R[d])?b:0)-(n?x.crossAxis:0);h<r?h=r:h>i&&(h=i);}return {[g]:p,[d]:h}}}};

function n(t){return t&&t.document&&t.location&&t.alert&&t.setInterval}function o(t){if(null==t)return window;if(!n(t)){const e=t.ownerDocument;return e&&e.defaultView||window}return t}function i(t){return o(t).getComputedStyle(t)}function r(t){return n(t)?"":t?(t.nodeName||"").toLowerCase():""}function l(){const t=navigator.userAgentData;return t&&Array.isArray(t.brands)?t.brands.map((t=>t.brand+"/"+t.version)).join(" "):navigator.userAgent}function c(t){return t instanceof o(t).HTMLElement}function s(t){return t instanceof o(t).Element}function f(t){if("undefined"==typeof ShadowRoot)return !1;return t instanceof o(t).ShadowRoot||t instanceof ShadowRoot}function u(t){const{overflow:e,overflowX:n,overflowY:o,display:r}=i(t);return /auto|scroll|overlay|hidden/.test(e+o+n)&&!["inline","contents"].includes(r)}function a(t){return ["table","td","th"].includes(r(t))}function d(t){const e=/firefox/i.test(l()),n=i(t),o=n.backdropFilter||n.WebkitBackdropFilter;return "none"!==n.transform||"none"!==n.perspective||!!o&&"none"!==o||e&&"filter"===n.willChange||e&&!!n.filter&&"none"!==n.filter||["transform","perspective"].some((t=>n.willChange.includes(t)))||["paint","layout","strict","content"].some((t=>{const e=n.contain;return null!=e&&e.includes(t)}))}function h(){return !/^((?!chrome|android).)*safari/i.test(l())}function g(t){return ["html","body","#document"].includes(r(t))}const m=Math.min,p=Math.max,w$1=Math.round;function v$1(t,e,n){var i,r,l,f;void 0===e&&(e=!1),void 0===n&&(n=!1);const u=t.getBoundingClientRect();let a=1,d=1;e&&c(t)&&(a=t.offsetWidth>0&&w$1(u.width)/t.offsetWidth||1,d=t.offsetHeight>0&&w$1(u.height)/t.offsetHeight||1);const g=s(t)?o(t):window,m=!h()&&n,p=(u.left+(m&&null!=(i=null==(r=g.visualViewport)?void 0:r.offsetLeft)?i:0))/a,v=(u.top+(m&&null!=(l=null==(f=g.visualViewport)?void 0:f.offsetTop)?l:0))/d,y=u.width/a,x=u.height/d;return {width:y,height:x,top:v,right:p+y,bottom:v+x,left:p,x:p,y:v}}function y(t){return (e=t,(e instanceof o(e).Node?t.ownerDocument:t.document)||window.document).documentElement;var e;}function x$1(t){return s(t)?{scrollLeft:t.scrollLeft,scrollTop:t.scrollTop}:{scrollLeft:t.pageXOffset,scrollTop:t.pageYOffset}}function b(t){return v$1(y(t)).left+x$1(t).scrollLeft}function L$1(t,e,n){const o=c(e),i=y(e),l=v$1(t,o&&function(t){const e=v$1(t);return w$1(e.width)!==t.offsetWidth||w$1(e.height)!==t.offsetHeight}(e),"fixed"===n);let s={scrollLeft:0,scrollTop:0};const f={x:0,y:0};if(o||!o&&"fixed"!==n)if(("body"!==r(e)||u(i))&&(s=x$1(e)),c(e)){const t=v$1(e,!0);f.x=t.x+e.clientLeft,f.y=t.y+e.clientTop;}else i&&(f.x=b(i));return {x:l.left+s.scrollLeft-f.x,y:l.top+s.scrollTop-f.y,width:l.width,height:l.height}}function E$1(t){if("html"===r(t))return t;const e=t.assignedSlot||t.parentNode||(f(t)?t.host:null)||y(t);return f(e)?e.host:e}function R(t){return c(t)&&"fixed"!==i(t).position?t.offsetParent:null}function T(t){const e=o(t);let n=R(t);for(;n&&a(n)&&"static"===i(n).position;)n=R(n);return n&&("html"===r(n)||"body"===r(n)&&"static"===i(n).position&&!d(n))?e:n||function(t){let e=E$1(t);for(;c(e)&&!g(e);){if(d(e))return e;e=E$1(e);}return null}(t)||e}function W(t){const e=E$1(t);return g(e)?t.ownerDocument.body:c(e)&&u(e)?e:W(e)}function H$1(t,e){var n;void 0===e&&(e=[]);const i=W(t),r=i===(null==(n=t.ownerDocument)?void 0:n.body),l=o(i),c=r?[l].concat(l.visualViewport||[],u(i)?i:[]):i,s=e.concat(c);return r?s:s.concat(H$1(c))}function D$1(e,n,r){return "viewport"===n?l$1(function(t,e){const n=o(t),i=y(t),r=n.visualViewport;let l=i.clientWidth,c=i.clientHeight,s=0,f=0;if(r){l=r.width,c=r.height;const t=h();(t||!t&&"fixed"===e)&&(s=r.offsetLeft,f=r.offsetTop);}return {width:l,height:c,x:s,y:f}}(e,r)):s(n)?function(t,e){const n=v$1(t,!1,"fixed"===e),o=n.top+t.clientTop,i=n.left+t.clientLeft;return {top:o,left:i,x:i,y:o,right:i+t.clientWidth,bottom:o+t.clientHeight,width:t.clientWidth,height:t.clientHeight}}(n,r):l$1(function(t){var e;const n=y(t),o=x$1(t),r=null==(e=t.ownerDocument)?void 0:e.body,l=p(n.scrollWidth,n.clientWidth,r?r.scrollWidth:0,r?r.clientWidth:0),c=p(n.scrollHeight,n.clientHeight,r?r.scrollHeight:0,r?r.clientHeight:0);let s=-o.scrollLeft+b(t);const f=-o.scrollTop;return "rtl"===i(r||n).direction&&(s+=p(n.clientWidth,r?r.clientWidth:0)-l),{width:l,height:c,x:s,y:f}}(y(e)))}const A={getClippingRect:function(t){let{element:e,boundary:n,rootBoundary:o,strategy:l}=t;const c="clippingAncestors"===n?function(t){let e=H$1(t).filter((t=>s(t)&&"body"!==r(t))),n=null;const o="fixed"===i(t).position;let l=o?E$1(t):t;for(;s(l)&&!g(l);){const t=i(l),r=d(l);(o?r||n:r||"static"!==t.position||!n||!["absolute","fixed"].includes(n.position))?n=t:e=e.filter((t=>t!==l)),l=E$1(l);}return e}(e):[].concat(n),f=[...c,o],u=f[0],a=f.reduce(((t,n)=>{const o=D$1(e,n,l);return t.top=p(o.top,t.top),t.right=m(o.right,t.right),t.bottom=m(o.bottom,t.bottom),t.left=p(o.left,t.left),t}),D$1(e,u,l));return {width:a.right-a.left,height:a.bottom-a.top,x:a.left,y:a.top}},convertOffsetParentRelativeRectToViewportRelativeRect:function(t){let{rect:e,offsetParent:n,strategy:o}=t;const i=c(n),l=y(n);if(n===l)return e;let s={scrollLeft:0,scrollTop:0};const f={x:0,y:0};if((i||!i&&"fixed"!==o)&&(("body"!==r(n)||u(l))&&(s=x$1(n)),c(n))){const t=v$1(n,!0);f.x=t.x+n.clientLeft,f.y=t.y+n.clientTop;}return {...e,x:e.x-s.scrollLeft+f.x,y:e.y-s.scrollTop+f.y}},isElement:s,getDimensions:function(t){if(c(t))return {width:t.offsetWidth,height:t.offsetHeight};const e=v$1(t);return {width:e.width,height:e.height}},getOffsetParent:T,getDocumentElement:y,async getElementRects(t){let{reference:e,floating:n,strategy:o}=t;const i=this.getOffsetParent||T,r=this.getDimensions;return {reference:L$1(e,await i(n),o),floating:{x:0,y:0,...await r(n)}}},getClientRects:t=>Array.from(t.getClientRects()),isRTL:t=>"rtl"===i(t).direction};function C$1(t,e,n,o){void 0===o&&(o={});const{ancestorScroll:i=!0,ancestorResize:r=!0,elementResize:l=!0,animationFrame:c=!1}=o,f=i&&!c,u=f||r?[...s(t)?H$1(t):t.contextElement?H$1(t.contextElement):[],...H$1(e)]:[];u.forEach((t=>{f&&t.addEventListener("scroll",n,{passive:!0}),r&&t.addEventListener("resize",n);}));let a,d=null;if(l){let o=!0;d=new ResizeObserver((()=>{o||n(),o=!1;})),s(t)&&!c&&d.observe(t),s(t)||!t.contextElement||c||d.observe(t.contextElement),d.observe(e);}let h=c?v$1(t):null;return c&&function e(){const o=v$1(t);!h||o.x===h.x&&o.y===h.y&&o.width===h.width&&o.height===h.height||n();h=o,a=requestAnimationFrame(e);}(),n(),()=>{var t;u.forEach((t=>{f&&t.removeEventListener("scroll",n),r&&t.removeEventListener("resize",n);})),null==(t=d)||t.disconnect(),d=null,c&&cancelAnimationFrame(a);}}const O$1=(t,n,o)=>o$1(t,n,{platform:A,...o});

class Dropdown extends Popover {
  // default options
  static defaultDropdownOptions = {
    mountTo: document.body, // mount popover to this element
    scrollLock: false, // lock body scroll when popover is opened
    presist: false, // keep modal in dom once opened
    placement: 'bottom-start', // popover placement
    flip: true, // flip popover placement if not enough space
    shift: true, // shift popover placement if not enough space
    offset: 4, // popover offset
    closeWhenInvisible: false, // close popover when target is invisible,
    autoClose: false, // close popover after click inside
    trigger: 'click', // popover trigger
    zIndex: null,
  };

  constructor(element, toggle, options = {}) {
    const combinedOptions = { ...Dropdown.defaultDropdownOptions, ...options };
    super(element, toggle, {
      prefix: 'dropdown',
      backdrop: false,
      closeBtn: false,
      autoFocus: false,
      mountTo: combinedOptions.mountTo,
      scrollLock: combinedOptions.scrollLock,
      presist: combinedOptions.presist,
      trigger: combinedOptions.trigger,
      zIndex: combinedOptions.zIndex,
    });
    this.options = {
      ...combinedOptions,
      ...this.options,
    };
    this.element = element;
    this.itemSelector = ':scope > .dropdown-panel > .dropdown-item';
    this.activeItem = null;
    this._middleware = [];
    if (this.options.flip) {
      this._middleware.push(b$1());
    }
    if (this.options.shift) {
      this._middleware.push(
        L$2({
          crossAxis: true,
          limiter: D$2(),
        })
      );
    }
    if (this.options.offset !== 0) {
      this._middleware.push(T$1(this.options.offset));
    }
    if (this.options.closeWhenInvisible) {
      this._middleware.push(P$1());
    }
    this._cleanupAutoUpdate = null;
    this.__clickToClose = this._clickToClose.bind(this);
    this.__onItemMouseEnter = this._onItemMouseEnter.bind(this);
    this.__onItemMouseLeave = this._onItemMouseLeave.bind(this);
  }

  get allItems() {
    return [...this.mountedPopover.querySelectorAll(this.itemSelector)];
  }

  _bindEvents() {
    // override
    super._bindEvents();
    document.addEventListener('click', this.__clickToClose);
    this.allItems.forEach(item => {
      item.addEventListener('mouseenter', this.__onItemMouseEnter);
      item.addEventListener('mouseleave', this.__onItemMouseLeave);
      item.addEventListener('click', this.__clickToClose);
    });
  }

  _unbindEvents() {
    // override
    super._unbindEvents();
    document.removeEventListener('click', this.__clickToClose);
    this.allItems.forEach(item => {
      item.removeEventListener('mouseenter', this.__onItemMouseEnter);
      item.removeEventListener('mouseleave', this.__onItemMouseLeave);
      item.removeEventListener('click', this.__clickToClose);
    });
  }

  _onToggleKeyDown(event) {
    // override
    // in async case, this method may still be called after destroy
    if (!this.element) return;
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowRight') {
      this.toggle();
      if (this.allItems.length > 0) {
        this._activateItem(this.allItems[0]);
        this.allItems[0].firstElementChild.focus();
      }
      event.preventDefault();
    }
  }

  _clickToClose(event) {
    // in async case, this method may still be called after destroy
    if (!this.element) return;
    if (this.isOpened) {
      if (
        this.options.autoClose &&
        this.mountedPopover.contains(event.target) &&
        !this.toggleEl.contains(event.target)
      ) {
        this.close();
      }
      if (!this.mountedPopover.contains(event.target) && !this.toggleEl.contains(event.target)) {
        this.close();
      }
    }
  }

  _onItemMouseEnter(event) {
    // in async case, this method may still be called after destroy
    if (!this.element) return;
    if (this.allItems.includes(event.target)) {
      this._activateItem(event.target);
    }
  }

  _onItemMouseLeave(event) {
    // in async case, this method may still be called after destroy
    if (!this.element) return;
    if (this.allItems.includes(event.target)) {
      this._deactivateItem(event.target);
    }
  }

  _onKeyDown(event) {
    // override
    // in async case, this method may still be called after destroy
    if (!this.element) return;
    super._onKeyDown(event);
    if (event.key === 'ArrowDown') {
      // find next item and activate it
      this._activateNextItem();
      event.preventDefault();
    }
    if (event.key === 'ArrowUp') {
      // find prev item and activate it
      this._activatePrevItem();
      event.preventDefault();
    }
    if (event.key === 'Tab' || event.key === 'ArrowLeft') {
      this.close();
    }
  }

  _activateItem(item) {
    if (this.activeItem) {
      this.activeItem.classList.remove('active');
    }
    this.activeItem = item;
    this.activeItem.classList.add('active');
  }

  _deactivateItem(item) {
    if (item) {
      item.classList.remove('active');
    } else {
      if (this.activeItem) {
        this.activeItem.classList.remove('active');
      }
    }
    this.activeItem = null;
  }

  _activateNextItem() {
    const items = this.allItems;
    if (items.length === 0) {
      return;
    }
    let index = 0;
    if (this.activeItem) {
      index = Array.from(items).indexOf(this.activeItem);
      index = (index + 1) % items.length;
      this._activateItem(items[index]);
      items[index].firstElementChild.focus();
    } else {
      this._activateItem(items[0]);
      items[0].firstElementChild.focus();
    }
  }

  _activatePrevItem() {
    const items = this.allItems;
    if (items.length === 0) {
      return;
    }
    let index = items.length - 1;
    if (this.activeItem) {
      index = Array.from(items).indexOf(this.activeItem);
      index = (index - 1 + items.length) % items.length;
      this._activateItem(items[index]);
      items[index].firstElementChild.focus();
    } else {
      this._activateItem(items[items.length - 1]);
      items[items.length - 1].firstElementChild.focus();
    }
  }

  async open() {
    // override
    if (!this.isOpened) {
      // console.log('open', this);
      await super.open();
      this.mountedPopover.style.pointerEvents = 'none';
      const panel = this.mountedPopover.querySelector('.dropdown-panel');
      const update = async () => {
        if (this.mountedPopover) {
          const strategy = window.getComputedStyle(this.mountedPopover)['position'] === 'fixed' ? 'fixed' : 'absolute';

          const { x, y, middlewareData } = await O$1(this.toggleEl, this.mountedPopover, {
            placement: this.options.placement,
            strategy: strategy,
            middleware: this._middleware,
          });
          this.mountedPopover.style.left = `${x}px`;
          this.mountedPopover.style.top = `${y}px`;
          // bounding rect relative to viewport
          const rectToggle = this.toggleEl.getBoundingClientRect();
          const rectPopover = this.mountedPopover.getBoundingClientRect();
          const offsetX = rectToggle.x - rectPopover.x + rectToggle.width / 2;
          const offsetY = rectToggle.y - rectPopover.y + rectToggle.height / 2;
          panel.style.transformOrigin = `${offsetX}px ${offsetY}px`;

          if (this.options.closeWhenInvisible) {
            const { referenceHidden } = middlewareData.hide;
            if (referenceHidden) {
              await super.close(); // no animation
            }
          }
        }
      };
      await update();
      await applyTransition(panel, {
        transition: 'transform .1s ease-out, opacity .1s ease-out',
        from: {
          opacity: 0,
          transform: 'scale(.9)',
        },
        to: {
          opacity: 1,
          transform: 'scale(1)',
        },
      });

      this._cleanupAutoUpdate = C$1(this.toggleEl, this.mountedPopover, update);
      this.mountedPopover.style.pointerEvents = '';
    }
  }

  async close() {
    // override
    if (this.isOpened) {
      // console.log('closing', this);
      if (this._cleanupAutoUpdate) {
        this._cleanupAutoUpdate();
      }
      this._deactivateItem();
      const panel = this.mountedPopover.querySelector('.dropdown-panel');
      await applyTransition(panel, {
        transition: 'transform .075s ease-out, opacity .075s ease-out',
        from: {
          opacity: 1,
          transform: 'scale(1)',
        },
        to: {
          opacity: 0,
          transform: 'scale(.9)',
        },
      });
      await super.close();
    }
  }
}

class CascadeDropdown {
  static defaultOptions = {
    rootDropdownOptions: {
      placement: 'bottom-start',
      offset: 4,
    },
    childDropdownOptions: {
      placement: 'right-start',
      offset: -8,
    },
  };
  constructor(element, toggleEl, options) {
    this.element = element;
    this.toggleEl = toggleEl;
    const { rootDropdownOptions, childDropdownOptions, ...newOptions } = options ?? {};
    this.rootDropdownOptions = {
      ...CascadeDropdown.defaultOptions.rootDropdownOptions,
      ...rootDropdownOptions,
      ...newOptions,
    };
    this.childDropdownOptions = {
      ...CascadeDropdown.defaultOptions.childDropdownOptions,
      ...childDropdownOptions,
      ...newOptions,
    };
    this.dropdowns = {};
    this.__onToggleClick = this._onToggleClick.bind(this);
    // this.toggleEl.addEventListener('click', this.__onToggleClick);
    this.initDropdowns();
  }
  _onToggleClick(event) {
    // in async case, this method may still be called after destroy
    if (!this.element) return;
    const rootDropdown = this.dropdowns['root'];
    if (rootDropdown) {
      rootDropdown.toggle();
    }
  }
  recurseInit(id, element, toggle, depth = 0) {
    if (depth >= 16) return; // max depth limit is 16
    // console.log('recurseInit', name, element, toggle);
    const submenuItems = element.querySelectorAll('.dropdown-panel > .dropdown-item.dropdown-submenu');
    submenuItems.forEach(submenuItem => {
      const submenuToggle = submenuItem.querySelector('button');
      const submenuId = submenuToggle.getAttribute('id').replace('dropdown-toggle-', '');
      const submenuEl = this.element.querySelector(`#dropdown-${submenuId}`);
      this.recurseInit(submenuId, submenuEl, submenuToggle, depth + 1);
    });
    this.dropdowns[id] = new Dropdown(
      element,
      toggle,
      id === 'root'
        ? this.rootDropdownOptions
        : {
            mountTo: toggle.parentElement,
            ...this.childDropdownOptions,
          }
    );
  }
  initDropdowns() {
    const rootToggle = this.toggleEl;
    const rootId = 'root';
    const rootEl = this.element.querySelector(`#dropdown-${rootId}`);
    this.recurseInit(rootId, rootEl, rootToggle);
  }
  async openRoot() {
    await this.dropdowns['root'].open();
  }
  async openAll() {
    for (const id in this.dropdowns) {
      await this.dropdowns[id].open();
    }
  }
  async closeAll() {
    for (const id in this.dropdowns) {
      await this.dropdowns[id].close();
    }
  }
  async open(id) {
    // id is a string of hashcode
    if (id in this.dropdowns) {
      await this.dropdowns[id].open();
    }
  }
  async close(id) {
    if (id in this.dropdowns) {
      await this.dropdowns[id].close();
    }
  }
  async destroy() {
    await Promise.all(Object.values(this.dropdowns).map(dropdown => dropdown.destroy()));
    this.dropdowns = {};
    this.element = null;
    this.toggleEl = null;
  }
}

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

var toastify = {exports: {}};

/*!
 * Toastify js 1.12.0
 * https://github.com/apvarun/toastify-js
 * @license MIT licensed
 *
 * Copyright (C) 2018 Varun A P
 */

(function (module) {
	(function(root, factory) {
	  if (module.exports) {
	    module.exports = factory();
	  } else {
	    root.Toastify = factory();
	  }
	})(commonjsGlobal, function(global) {
	  // Object initialization
	  var Toastify = function(options) {
	      // Returning a new init object
	      return new Toastify.lib.init(options);
	    },
	    // Library version
	    version = "1.12.0";

	  // Set the default global options
	  Toastify.defaults = {
	    oldestFirst: true,
	    text: "Toastify is awesome!",
	    node: undefined,
	    duration: 3000,
	    selector: undefined,
	    callback: function () {
	    },
	    destination: undefined,
	    newWindow: false,
	    close: false,
	    gravity: "toastify-top",
	    positionLeft: false,
	    position: '',
	    backgroundColor: '',
	    avatar: "",
	    className: "",
	    stopOnFocus: true,
	    onClick: function () {
	    },
	    offset: {x: 0, y: 0},
	    escapeMarkup: true,
	    ariaLive: 'polite',
	    style: {background: ''}
	  };

	  // Defining the prototype of the object
	  Toastify.lib = Toastify.prototype = {
	    toastify: version,

	    constructor: Toastify,

	    // Initializing the object with required parameters
	    init: function(options) {
	      // Verifying and validating the input object
	      if (!options) {
	        options = {};
	      }

	      // Creating the options object
	      this.options = {};

	      this.toastElement = null;

	      // Validating the options
	      this.options.text = options.text || Toastify.defaults.text; // Display message
	      this.options.node = options.node || Toastify.defaults.node;  // Display content as node
	      this.options.duration = options.duration === 0 ? 0 : options.duration || Toastify.defaults.duration; // Display duration
	      this.options.selector = options.selector || Toastify.defaults.selector; // Parent selector
	      this.options.callback = options.callback || Toastify.defaults.callback; // Callback after display
	      this.options.destination = options.destination || Toastify.defaults.destination; // On-click destination
	      this.options.newWindow = options.newWindow || Toastify.defaults.newWindow; // Open destination in new window
	      this.options.close = options.close || Toastify.defaults.close; // Show toast close icon
	      this.options.gravity = options.gravity === "bottom" ? "toastify-bottom" : Toastify.defaults.gravity; // toast position - top or bottom
	      this.options.positionLeft = options.positionLeft || Toastify.defaults.positionLeft; // toast position - left or right
	      this.options.position = options.position || Toastify.defaults.position; // toast position - left or right
	      this.options.backgroundColor = options.backgroundColor || Toastify.defaults.backgroundColor; // toast background color
	      this.options.avatar = options.avatar || Toastify.defaults.avatar; // img element src - url or a path
	      this.options.className = options.className || Toastify.defaults.className; // additional class names for the toast
	      this.options.stopOnFocus = options.stopOnFocus === undefined ? Toastify.defaults.stopOnFocus : options.stopOnFocus; // stop timeout on focus
	      this.options.onClick = options.onClick || Toastify.defaults.onClick; // Callback after click
	      this.options.offset = options.offset || Toastify.defaults.offset; // toast offset
	      this.options.escapeMarkup = options.escapeMarkup !== undefined ? options.escapeMarkup : Toastify.defaults.escapeMarkup;
	      this.options.ariaLive = options.ariaLive || Toastify.defaults.ariaLive;
	      this.options.style = options.style || Toastify.defaults.style;
	      if(options.backgroundColor) {
	        this.options.style.background = options.backgroundColor;
	      }

	      // Returning the current object for chaining functions
	      return this;
	    },

	    // Building the DOM element
	    buildToast: function() {
	      // Validating if the options are defined
	      if (!this.options) {
	        throw "Toastify is not initialized";
	      }

	      // Creating the DOM object
	      var divElement = document.createElement("div");
	      divElement.className = "toastify on " + this.options.className;

	      // Positioning toast to left or right or center
	      if (!!this.options.position) {
	        divElement.className += " toastify-" + this.options.position;
	      } else {
	        // To be depreciated in further versions
	        if (this.options.positionLeft === true) {
	          divElement.className += " toastify-left";
	          console.warn('Property `positionLeft` will be depreciated in further versions. Please use `position` instead.');
	        } else {
	          // Default position
	          divElement.className += " toastify-right";
	        }
	      }

	      // Assigning gravity of element
	      divElement.className += " " + this.options.gravity;

	      if (this.options.backgroundColor) {
	        // This is being deprecated in favor of using the style HTML DOM property
	        console.warn('DEPRECATION NOTICE: "backgroundColor" is being deprecated. Please use the "style.background" property.');
	      }

	      // Loop through our style object and apply styles to divElement
	      for (var property in this.options.style) {
	        divElement.style[property] = this.options.style[property];
	      }

	      // Announce the toast to screen readers
	      if (this.options.ariaLive) {
	        divElement.setAttribute('aria-live', this.options.ariaLive);
	      }

	      // Adding the toast message/node
	      if (this.options.node && this.options.node.nodeType === Node.ELEMENT_NODE) {
	        // If we have a valid node, we insert it
	        divElement.appendChild(this.options.node);
	      } else {
	        if (this.options.escapeMarkup) {
	          divElement.innerText = this.options.text;
	        } else {
	          divElement.innerHTML = this.options.text;
	        }

	        if (this.options.avatar !== "") {
	          var avatarElement = document.createElement("img");
	          avatarElement.src = this.options.avatar;

	          avatarElement.className = "toastify-avatar";

	          if (this.options.position == "left" || this.options.positionLeft === true) {
	            // Adding close icon on the left of content
	            divElement.appendChild(avatarElement);
	          } else {
	            // Adding close icon on the right of content
	            divElement.insertAdjacentElement("afterbegin", avatarElement);
	          }
	        }
	      }

	      // Adding a close icon to the toast
	      if (this.options.close === true) {
	        // Create a span for close element
	        var closeElement = document.createElement("button");
	        closeElement.type = "button";
	        closeElement.setAttribute("aria-label", "Close");
	        closeElement.className = "toast-close";
	        closeElement.innerHTML = "&#10006;";

	        // Triggering the removal of toast from DOM on close click
	        closeElement.addEventListener(
	          "click",
	          function(event) {
	            event.stopPropagation();
	            this.removeElement(this.toastElement);
	            window.clearTimeout(this.toastElement.timeOutValue);
	          }.bind(this)
	        );

	        //Calculating screen width
	        var width = window.innerWidth > 0 ? window.innerWidth : screen.width;

	        // Adding the close icon to the toast element
	        // Display on the right if screen width is less than or equal to 360px
	        if ((this.options.position == "left" || this.options.positionLeft === true) && width > 360) {
	          // Adding close icon on the left of content
	          divElement.insertAdjacentElement("afterbegin", closeElement);
	        } else {
	          // Adding close icon on the right of content
	          divElement.appendChild(closeElement);
	        }
	      }

	      // Clear timeout while toast is focused
	      if (this.options.stopOnFocus && this.options.duration > 0) {
	        var self = this;
	        // stop countdown
	        divElement.addEventListener(
	          "mouseover",
	          function(event) {
	            window.clearTimeout(divElement.timeOutValue);
	          }
	        );
	        // add back the timeout
	        divElement.addEventListener(
	          "mouseleave",
	          function() {
	            divElement.timeOutValue = window.setTimeout(
	              function() {
	                // Remove the toast from DOM
	                self.removeElement(divElement);
	              },
	              self.options.duration
	            );
	          }
	        );
	      }

	      // Adding an on-click destination path
	      if (typeof this.options.destination !== "undefined") {
	        divElement.addEventListener(
	          "click",
	          function(event) {
	            event.stopPropagation();
	            if (this.options.newWindow === true) {
	              window.open(this.options.destination, "_blank");
	            } else {
	              window.location = this.options.destination;
	            }
	          }.bind(this)
	        );
	      }

	      if (typeof this.options.onClick === "function" && typeof this.options.destination === "undefined") {
	        divElement.addEventListener(
	          "click",
	          function(event) {
	            event.stopPropagation();
	            this.options.onClick();
	          }.bind(this)
	        );
	      }

	      // Adding offset
	      if(typeof this.options.offset === "object") {

	        var x = getAxisOffsetAValue("x", this.options);
	        var y = getAxisOffsetAValue("y", this.options);

	        var xOffset = this.options.position == "left" ? x : "-" + x;
	        var yOffset = this.options.gravity == "toastify-top" ? y : "-" + y;

	        divElement.style.transform = "translate(" + xOffset + "," + yOffset + ")";

	      }

	      // Returning the generated element
	      return divElement;
	    },

	    // Displaying the toast
	    showToast: function() {
	      // Creating the DOM object for the toast
	      this.toastElement = this.buildToast();

	      // Getting the root element to with the toast needs to be added
	      var rootElement;
	      if (typeof this.options.selector === "string") {
	        rootElement = document.getElementById(this.options.selector);
	      } else if (this.options.selector instanceof HTMLElement || (typeof ShadowRoot !== 'undefined' && this.options.selector instanceof ShadowRoot)) {
	        rootElement = this.options.selector;
	      } else {
	        rootElement = document.body;
	      }

	      // Validating if root element is present in DOM
	      if (!rootElement) {
	        throw "Root element is not defined";
	      }

	      // Adding the DOM element
	      var elementToInsert = Toastify.defaults.oldestFirst ? rootElement.firstChild : rootElement.lastChild;
	      rootElement.insertBefore(this.toastElement, elementToInsert);

	      // Repositioning the toasts in case multiple toasts are present
	      Toastify.reposition();

	      if (this.options.duration > 0) {
	        this.toastElement.timeOutValue = window.setTimeout(
	          function() {
	            // Remove the toast from DOM
	            this.removeElement(this.toastElement);
	          }.bind(this),
	          this.options.duration
	        ); // Binding `this` for function invocation
	      }

	      // Supporting function chaining
	      return this;
	    },

	    hideToast: function() {
	      if (this.toastElement.timeOutValue) {
	        clearTimeout(this.toastElement.timeOutValue);
	      }
	      this.removeElement(this.toastElement);
	    },

	    // Removing the element from the DOM
	    removeElement: function(toastElement) {
	      // Hiding the element
	      // toastElement.classList.remove("on");
	      toastElement.className = toastElement.className.replace(" on", "");

	      // Removing the element from DOM after transition end
	      window.setTimeout(
	        function() {
	          // remove options node if any
	          if (this.options.node && this.options.node.parentNode) {
	            this.options.node.parentNode.removeChild(this.options.node);
	          }

	          // Remove the element from the DOM, only when the parent node was not removed before.
	          if (toastElement.parentNode) {
	            toastElement.parentNode.removeChild(toastElement);
	          }

	          // Calling the callback function
	          this.options.callback.call(toastElement);

	          // Repositioning the toasts again
	          Toastify.reposition();
	        }.bind(this),
	        400
	      ); // Binding `this` for function invocation
	    },
	  };

	  // Positioning the toasts on the DOM
	  Toastify.reposition = function() {

	    // Top margins with gravity
	    var topLeftOffsetSize = {
	      top: 15,
	      bottom: 15,
	    };
	    var topRightOffsetSize = {
	      top: 15,
	      bottom: 15,
	    };
	    var offsetSize = {
	      top: 15,
	      bottom: 15,
	    };

	    // Get all toast messages on the DOM
	    var allToasts = document.getElementsByClassName("toastify");

	    var classUsed;

	    // Modifying the position of each toast element
	    for (var i = 0; i < allToasts.length; i++) {
	      // Getting the applied gravity
	      if (containsClass(allToasts[i], "toastify-top") === true) {
	        classUsed = "toastify-top";
	      } else {
	        classUsed = "toastify-bottom";
	      }

	      var height = allToasts[i].offsetHeight;
	      classUsed = classUsed.substr(9, classUsed.length-1);
	      // Spacing between toasts
	      var offset = 15;

	      var width = window.innerWidth > 0 ? window.innerWidth : screen.width;

	      // Show toast in center if screen with less than or equal to 360px
	      if (width <= 360) {
	        // Setting the position
	        allToasts[i].style[classUsed] = offsetSize[classUsed] + "px";

	        offsetSize[classUsed] += height + offset;
	      } else {
	        if (containsClass(allToasts[i], "toastify-left") === true) {
	          // Setting the position
	          allToasts[i].style[classUsed] = topLeftOffsetSize[classUsed] + "px";

	          topLeftOffsetSize[classUsed] += height + offset;
	        } else {
	          // Setting the position
	          allToasts[i].style[classUsed] = topRightOffsetSize[classUsed] + "px";

	          topRightOffsetSize[classUsed] += height + offset;
	        }
	      }
	    }

	    // Supporting function chaining
	    return this;
	  };

	  // Helper function to get offset.
	  function getAxisOffsetAValue(axis, options) {

	    if(options.offset[axis]) {
	      if(isNaN(options.offset[axis])) {
	        return options.offset[axis];
	      }
	      else {
	        return options.offset[axis] + 'px';
	      }
	    }

	    return '0px';

	  }

	  function containsClass(elem, yourClass) {
	    if (!elem || typeof yourClass !== "string") {
	      return false;
	    } else if (
	      elem.className &&
	      elem.className
	        .trim()
	        .split(/\s+/gi)
	        .indexOf(yourClass) > -1
	    ) {
	      return true;
	    } else {
	      return false;
	    }
	  }

	  // Setting up the prototype for the init object
	  Toastify.lib.init.prototype = Toastify.lib;

	  // Returning the Toastify function to be assigned to the window object/module
	  return Toastify;
	});
} (toastify));

var Toastify = toastify.exports;

class Navigator {
  constructor(element = document.querySelector('#navigator')) {
    this.leftDropdownIns = null;
    this.rightDrawerIns = null;
    this.rightDrawerSideBarIns = null;
    this.colorModeBtnIns = null;
    this.menuInses = [];
    this.searchIns = null;
    this._onScroll = this._onScroll.bind(this);
    this._bindScrollListener();
    this.init(element);
  }

  init(element = document.querySelector('#navigator')) {
    this.rootElement = element;
    this.menuElement = this.rootElement?.querySelector('.nav-menu');
    this.logoElement = this.rootElement?.querySelector('.nav-logo');
    this.toolElement = this.rootElement?.querySelector('.nav-toolkit');

    this._initMenu();
    this._initTool();
    this.updateMenuIndicator();
    this.show();
    this._onScroll();
  }
  _onScroll(event) {
    if (!(this.rootElement instanceof HTMLElement)) return;
    const navbarHeight = this.rootElement.offsetHeight;
    let sidebar = null;
    if (config.sidebar.enable) {
      sidebar = document.querySelector('#sidebar');
    }
    let header = null;
    if (config.header.enable) {
      header = document.querySelector('#header');
    }
    const throttleHeight = config.header.enable && header instanceof HTMLElement 
      ? (header.offsetHeight  - navbarHeight ?? 0) 
      : 30;
    const scrollTop = scrollManager.getScrollTop();

    if (scrollTop <= 30) {
      this.show();
      this.rootElement.classList.remove('nav-fix');
      this.rootElement.classList.remove('nav-transparent');
      this.rootElement.classList.add('nav-top');
      if (config.header.enable) {
        this.rootElement.classList.add('nav-transparent');
      }
      if (config.sidebar.enable) {
        sidebar?.querySelector('.sidebar-content')?.classList.remove('headblank');
      }
    } else {
      this.rootElement.classList.remove('nav-top');
      this.rootElement.classList.remove('nav-transparent');
      this.rootElement.classList.add('nav-fix');
      if (scrollTop - this.lastScrollTop > 0) {
        if (scrollTop > throttleHeight) {
          this.hide();
        }
        if (config.sidebar.enable) {
          //向下滚动取消侧边栏头部留空
          sidebar?.querySelector('.sidebar-content')?.classList.remove('headblank');
        }
      } else {
        this.show();
        if (config.sidebar.enable) {
          //向上滚动时若导航条覆盖侧边栏内容，则给侧边栏头部留空
          const sidebarTop = sidebar?.getBoundingClientRect().top ?? 0;
          const sidebarContentTop = sidebar?.querySelector('.sidebar-content')?.getBoundingClientRect().top ?? 0;
          if (sidebarTop < navbarHeight && sidebarContentTop >= 0) {
            sidebar?.querySelector('.sidebar-content')?.classList.add('headblank');
          } else {
            sidebar?.querySelector('.sidebar-content')?.classList.remove('headblank');
          }
        }
      }
    }
    this.lastScrollTop = scrollTop;
  }

  _bindScrollListener() {
    //添加滚动事件监听
    this.lastScrollTop = scrollManager.getScrollTop();
    scrollManager.register('nav', this._onScroll);
  }

  updateMenuIndicator() {
    // 初始化当前导航指示条
    this.rootElement?.querySelectorAll('.nav-menu-item>.link').forEach(link => {
      link.parentElement?.classList.remove('nav-active');
      function pathname(url) {
        // 清空origin、search、hash和最后一个/
        url = url.replace(/^(\w+:)?\/\/([\w-]+\.)+[\w-]+/gi, '');
        url = url.replace(/\?.*/gi, '');
        url = url.replace(/#.*/gi, '');
        url = url.replace(/\/$/gi, '');
        return url;
      }
      if (link instanceof HTMLAnchorElement && pathname(window.location.href) == pathname(link.href)) {
        link.parentElement?.classList.add('nav-active');
      }
    });
  }

  initRightDrawer() {
    const rightDrawerTemplate = document.querySelector('#right-drawer-template');
    if (rightDrawerTemplate instanceof HTMLTemplateElement) {
      const el = rightDrawerTemplate.content.querySelector('.drawer')?.cloneNode(true);
      const toggle = document.querySelector('#right-drawer-toggle');
      if (el instanceof HTMLElement) {
        this.rightDrawerSideBarIns = new Sidebar(el);
        this.rightDrawerIns = new Drawer(el, toggle);
      }
    }
  }

  initLeftDropdown() {
    const leftDropdownTemplate = document.querySelector('#left-dropdown-template');
    if (leftDropdownTemplate instanceof HTMLTemplateElement) {
      const el = leftDropdownTemplate.content.querySelector('.cascade-dropdown')?.cloneNode(true);
      const toggle = document.querySelector('#left-dropdown-toggle');
      if (el instanceof HTMLElement) {
        this.leftDropdownIns = new CascadeDropdown(el, toggle, {
          trigger: 'hover',
          zIndex: 100,
        });
      }
    }
  }

  _initMenu() {
    // 初始化多级菜单
    if (this.menuElement) {
      const menuToggleList = [...this.menuElement.querySelectorAll('.menu-toggle')];
      menuToggleList.forEach(toggle => {
        const dropdownTemplate = toggle.nextElementSibling;
        if (dropdownTemplate instanceof HTMLTemplateElement) {
          const el = dropdownTemplate.content.querySelector('.cascade-dropdown')?.cloneNode(true);
          if (el instanceof HTMLElement) {
            this.menuInses.push(
              new CascadeDropdown(el, toggle, {
                trigger: 'hover',
                zIndex: 100,
              })
            );
          }
        }
      });
    }
  }

  _initTool() {
    if (config.navigator.toolkit.search.enable && config.search.enable) {
      this.searchIns = new Search();
    }
    this.initLeftDropdown();
    if(config.sidebar.enable) {
      this.initRightDrawer();
    }

    if (config.navigator.toolkit.colormode.enable) {
      // 初始化颜色模式按钮
      const colorModeToggle = document.querySelector('#color-mode-toggle');
      if (colorModeToggle instanceof HTMLElement) {
        const changeIcon = () => {
          if (colorMode$1.get() === 'auto') {
            return '<svg fill="currentColor" width="1em" height="1em"><use xlink:href="#ri-computer-line"></use></svg>';
          } else if (colorMode$1.get() === 'dark') {
            return '<svg fill="currentColor" width="1em" height="1em"><use xlink:href="#ri-moon-fill"></use></svg>';
          } else {
            return '<svg fill="currentColor" width="1em" height="1em"><use xlink:href="#ri-sun-fill"></use></svg>';
          }
        };
        colorModeToggle.innerHTML = changeIcon();
        const callback = event => {
          colorMode$1.toggle();
          const icon = changeIcon();
          colorModeToggle.innerHTML = icon;
          const modeText =
            colorMode$1.get() === 'auto' ? '跟随系统' : colorMode$1.get() === 'dark' ? '深色模式' : '浅色模式';
          Toastify({
            text: `${icon}<span class="ml-2 mr-1">已切换至${modeText}</span>`,
            duration: 1500,
            gravity: 'top',
            close: false,
            position: 'right',
            className:
              'bg-gradient-to-br from-primary-500 to-primary-700 rounded-md shadow-lg shadow-primary-900/50 dark:shadow-primary-700/50 flex flex-nowrap items-center text-base max-w-full',
            stopOnFocus: true,
            escapeMarkup: false,
            offset: {
              x: 0,
              y: 56,
            },
          }).showToast();
        };
        colorModeToggle.addEventListener('click', callback);
        this.colorModeBtnIns = {
          async destroy() {
            colorModeToggle.removeEventListener('click', callback);
          },
        };
      }
    }
  }

  isShown() {
    if (!this.rootElement) return false;
    return !this.rootElement.classList.contains('nav-hide');
  }

  show() {
    this.rootElement?.classList.remove('nav-hide');
    this.rootElement?.classList.add('nav-show');
  }

  hide() {
    this.rootElement?.classList.remove('nav-show');
    this.rootElement?.classList.add('nav-hide');

    this.menuInses.forEach(menu => {
      menu.closeAll();
    });
  }

  async reset(element = document.querySelector('#navigator')) {
    this.searchIns?.destroy();
    const waitList = [];
    waitList.push(
      this.rightDrawerIns?.destroy(),
      this.rightDrawerSideBarIns?.destroy(),
      this.leftDropdownIns?.destroy(),
      this.colorModeBtnIns?.destroy(),
      ...this.menuInses.map(menu => menu.destroy())
    );
    await Promise.all(waitList);

    this.rootElement = null;
    this.menuElement = null;
    this.logoElement = null;
    this.toolElement = null;
    this.menuInses = [];
    this.init(element);
  }

  async destroy() {
    scrollManager.unregister('nav');
    this.searchIns?.destroy();
    const waitList = [];
    waitList.push(
      this.rightDrawerIns?.destroy(),
      this.rightDrawerSideBarIns?.destroy(),
      this.leftDropdownIns?.destroy(),
      this.colorModeBtnIns?.destroy(),
      ...this.menuInses.map(menu => menu.destroy())
    );
    await Promise.all(waitList);
    this.rootElement = null;
    this.menuElement = null;
    this.logoElement = null;
    this.toolElement = null;
    this.menuInses = [];
  }
}

var nprogress = {exports: {}};

/* NProgress, (c) 2013, 2014 Rico Sta. Cruz - http://ricostacruz.com/nprogress
 * @license MIT */

(function (module, exports) {
(function(root, factory) {

	  {
	    module.exports = factory();
	  }

	})(commonjsGlobal, function() {
	  var NProgress = {};

	  NProgress.version = '0.2.0';

	  var Settings = NProgress.settings = {
	    minimum: 0.08,
	    easing: 'ease',
	    positionUsing: '',
	    speed: 200,
	    trickle: true,
	    trickleRate: 0.02,
	    trickleSpeed: 800,
	    showSpinner: true,
	    barSelector: '[role="bar"]',
	    spinnerSelector: '[role="spinner"]',
	    parent: 'body',
	    template: '<div class="bar" role="bar"><div class="peg"></div></div><div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'
	  };

	  /**
	   * Updates configuration.
	   *
	   *     NProgress.configure({
	   *       minimum: 0.1
	   *     });
	   */
	  NProgress.configure = function(options) {
	    var key, value;
	    for (key in options) {
	      value = options[key];
	      if (value !== undefined && options.hasOwnProperty(key)) Settings[key] = value;
	    }

	    return this;
	  };

	  /**
	   * Last number.
	   */

	  NProgress.status = null;

	  /**
	   * Sets the progress bar status, where `n` is a number from `0.0` to `1.0`.
	   *
	   *     NProgress.set(0.4);
	   *     NProgress.set(1.0);
	   */

	  NProgress.set = function(n) {
	    var started = NProgress.isStarted();

	    n = clamp(n, Settings.minimum, 1);
	    NProgress.status = (n === 1 ? null : n);

	    var progress = NProgress.render(!started),
	        bar      = progress.querySelector(Settings.barSelector),
	        speed    = Settings.speed,
	        ease     = Settings.easing;

	    progress.offsetWidth; /* Repaint */

	    queue(function(next) {
	      // Set positionUsing if it hasn't already been set
	      if (Settings.positionUsing === '') Settings.positionUsing = NProgress.getPositioningCSS();

	      // Add transition
	      css(bar, barPositionCSS(n, speed, ease));

	      if (n === 1) {
	        // Fade out
	        css(progress, { 
	          transition: 'none', 
	          opacity: 1 
	        });
	        progress.offsetWidth; /* Repaint */

	        setTimeout(function() {
	          css(progress, { 
	            transition: 'all ' + speed + 'ms linear', 
	            opacity: 0 
	          });
	          setTimeout(function() {
	            NProgress.remove();
	            next();
	          }, speed);
	        }, speed);
	      } else {
	        setTimeout(next, speed);
	      }
	    });

	    return this;
	  };

	  NProgress.isStarted = function() {
	    return typeof NProgress.status === 'number';
	  };

	  /**
	   * Shows the progress bar.
	   * This is the same as setting the status to 0%, except that it doesn't go backwards.
	   *
	   *     NProgress.start();
	   *
	   */
	  NProgress.start = function() {
	    if (!NProgress.status) NProgress.set(0);

	    var work = function() {
	      setTimeout(function() {
	        if (!NProgress.status) return;
	        NProgress.trickle();
	        work();
	      }, Settings.trickleSpeed);
	    };

	    if (Settings.trickle) work();

	    return this;
	  };

	  /**
	   * Hides the progress bar.
	   * This is the *sort of* the same as setting the status to 100%, with the
	   * difference being `done()` makes some placebo effect of some realistic motion.
	   *
	   *     NProgress.done();
	   *
	   * If `true` is passed, it will show the progress bar even if its hidden.
	   *
	   *     NProgress.done(true);
	   */

	  NProgress.done = function(force) {
	    if (!force && !NProgress.status) return this;

	    return NProgress.inc(0.3 + 0.5 * Math.random()).set(1);
	  };

	  /**
	   * Increments by a random amount.
	   */

	  NProgress.inc = function(amount) {
	    var n = NProgress.status;

	    if (!n) {
	      return NProgress.start();
	    } else {
	      if (typeof amount !== 'number') {
	        amount = (1 - n) * clamp(Math.random() * n, 0.1, 0.95);
	      }

	      n = clamp(n + amount, 0, 0.994);
	      return NProgress.set(n);
	    }
	  };

	  NProgress.trickle = function() {
	    return NProgress.inc(Math.random() * Settings.trickleRate);
	  };

	  /**
	   * Waits for all supplied jQuery promises and
	   * increases the progress as the promises resolve.
	   *
	   * @param $promise jQUery Promise
	   */
	  (function() {
	    var initial = 0, current = 0;

	    NProgress.promise = function($promise) {
	      if (!$promise || $promise.state() === "resolved") {
	        return this;
	      }

	      if (current === 0) {
	        NProgress.start();
	      }

	      initial++;
	      current++;

	      $promise.always(function() {
	        current--;
	        if (current === 0) {
	            initial = 0;
	            NProgress.done();
	        } else {
	            NProgress.set((initial - current) / initial);
	        }
	      });

	      return this;
	    };

	  })();

	  /**
	   * (Internal) renders the progress bar markup based on the `template`
	   * setting.
	   */

	  NProgress.render = function(fromStart) {
	    if (NProgress.isRendered()) return document.getElementById('nprogress');

	    addClass(document.documentElement, 'nprogress-busy');
	    
	    var progress = document.createElement('div');
	    progress.id = 'nprogress';
	    progress.innerHTML = Settings.template;

	    var bar      = progress.querySelector(Settings.barSelector),
	        perc     = fromStart ? '-100' : toBarPerc(NProgress.status || 0),
	        parent   = document.querySelector(Settings.parent),
	        spinner;
	    
	    css(bar, {
	      transition: 'all 0 linear',
	      transform: 'translate3d(' + perc + '%,0,0)'
	    });

	    if (!Settings.showSpinner) {
	      spinner = progress.querySelector(Settings.spinnerSelector);
	      spinner && removeElement(spinner);
	    }

	    if (parent != document.body) {
	      addClass(parent, 'nprogress-custom-parent');
	    }

	    parent.appendChild(progress);
	    return progress;
	  };

	  /**
	   * Removes the element. Opposite of render().
	   */

	  NProgress.remove = function() {
	    removeClass(document.documentElement, 'nprogress-busy');
	    removeClass(document.querySelector(Settings.parent), 'nprogress-custom-parent');
	    var progress = document.getElementById('nprogress');
	    progress && removeElement(progress);
	  };

	  /**
	   * Checks if the progress bar is rendered.
	   */

	  NProgress.isRendered = function() {
	    return !!document.getElementById('nprogress');
	  };

	  /**
	   * Determine which positioning CSS rule to use.
	   */

	  NProgress.getPositioningCSS = function() {
	    // Sniff on document.body.style
	    var bodyStyle = document.body.style;

	    // Sniff prefixes
	    var vendorPrefix = ('WebkitTransform' in bodyStyle) ? 'Webkit' :
	                       ('MozTransform' in bodyStyle) ? 'Moz' :
	                       ('msTransform' in bodyStyle) ? 'ms' :
	                       ('OTransform' in bodyStyle) ? 'O' : '';

	    if (vendorPrefix + 'Perspective' in bodyStyle) {
	      // Modern browsers with 3D support, e.g. Webkit, IE10
	      return 'translate3d';
	    } else if (vendorPrefix + 'Transform' in bodyStyle) {
	      // Browsers without 3D support, e.g. IE9
	      return 'translate';
	    } else {
	      // Browsers without translate() support, e.g. IE7-8
	      return 'margin';
	    }
	  };

	  /**
	   * Helpers
	   */

	  function clamp(n, min, max) {
	    if (n < min) return min;
	    if (n > max) return max;
	    return n;
	  }

	  /**
	   * (Internal) converts a percentage (`0..1`) to a bar translateX
	   * percentage (`-100%..0%`).
	   */

	  function toBarPerc(n) {
	    return (-1 + n) * 100;
	  }


	  /**
	   * (Internal) returns the correct CSS for changing the bar's
	   * position given an n percentage, and speed and ease from Settings
	   */

	  function barPositionCSS(n, speed, ease) {
	    var barCSS;

	    if (Settings.positionUsing === 'translate3d') {
	      barCSS = { transform: 'translate3d('+toBarPerc(n)+'%,0,0)' };
	    } else if (Settings.positionUsing === 'translate') {
	      barCSS = { transform: 'translate('+toBarPerc(n)+'%,0)' };
	    } else {
	      barCSS = { 'margin-left': toBarPerc(n)+'%' };
	    }

	    barCSS.transition = 'all '+speed+'ms '+ease;

	    return barCSS;
	  }

	  /**
	   * (Internal) Queues a function to be executed.
	   */

	  var queue = (function() {
	    var pending = [];
	    
	    function next() {
	      var fn = pending.shift();
	      if (fn) {
	        fn(next);
	      }
	    }

	    return function(fn) {
	      pending.push(fn);
	      if (pending.length == 1) next();
	    };
	  })();

	  /**
	   * (Internal) Applies css properties to an element, similar to the jQuery 
	   * css method.
	   *
	   * While this helper does assist with vendor prefixed property names, it 
	   * does not perform any manipulation of values prior to setting styles.
	   */

	  var css = (function() {
	    var cssPrefixes = [ 'Webkit', 'O', 'Moz', 'ms' ],
	        cssProps    = {};

	    function camelCase(string) {
	      return string.replace(/^-ms-/, 'ms-').replace(/-([\da-z])/gi, function(match, letter) {
	        return letter.toUpperCase();
	      });
	    }

	    function getVendorProp(name) {
	      var style = document.body.style;
	      if (name in style) return name;

	      var i = cssPrefixes.length,
	          capName = name.charAt(0).toUpperCase() + name.slice(1),
	          vendorName;
	      while (i--) {
	        vendorName = cssPrefixes[i] + capName;
	        if (vendorName in style) return vendorName;
	      }

	      return name;
	    }

	    function getStyleProp(name) {
	      name = camelCase(name);
	      return cssProps[name] || (cssProps[name] = getVendorProp(name));
	    }

	    function applyCss(element, prop, value) {
	      prop = getStyleProp(prop);
	      element.style[prop] = value;
	    }

	    return function(element, properties) {
	      var args = arguments,
	          prop, 
	          value;

	      if (args.length == 2) {
	        for (prop in properties) {
	          value = properties[prop];
	          if (value !== undefined && properties.hasOwnProperty(prop)) applyCss(element, prop, value);
	        }
	      } else {
	        applyCss(element, args[1], args[2]);
	      }
	    }
	  })();

	  /**
	   * (Internal) Determines if an element or space separated list of class names contains a class name.
	   */

	  function hasClass(element, name) {
	    var list = typeof element == 'string' ? element : classList(element);
	    return list.indexOf(' ' + name + ' ') >= 0;
	  }

	  /**
	   * (Internal) Adds a class to an element.
	   */

	  function addClass(element, name) {
	    var oldList = classList(element),
	        newList = oldList + name;

	    if (hasClass(oldList, name)) return; 

	    // Trim the opening space.
	    element.className = newList.substring(1);
	  }

	  /**
	   * (Internal) Removes a class from an element.
	   */

	  function removeClass(element, name) {
	    var oldList = classList(element),
	        newList;

	    if (!hasClass(element, name)) return;

	    // Replace the class name.
	    newList = oldList.replace(' ' + name + ' ', ' ');

	    // Trim the opening and closing spaces.
	    element.className = newList.substring(1, newList.length - 1);
	  }

	  /**
	   * (Internal) Gets a space separated list of the class names on the element. 
	   * The list is wrapped with a single space on each end to facilitate finding 
	   * matches within the list.
	   */

	  function classList(element) {
	    return (' ' + (element.className || '') + ' ').replace(/\s+/gi, ' ');
	  }

	  /**
	   * (Internal) Removes an element from the DOM.
	   */

	  function removeElement(element) {
	    element && element.parentNode && element.parentNode.removeChild(element);
	  }

	  return NProgress;
	});
} (nprogress));

var NProgress = nprogress.exports;

class Loading {
  static defaultOptions = {
    defaultOpen: false,
  };
  constructor(element, options = {}) {
    const combinedOptions = { ...Loading.defaultOptions, ...options };
    this.element = element ?? document.querySelector('.loading');
    this.options = combinedOptions;
    this.isOpened = false;
    if (this.options.defaultOpen) {
      setTimeout(() => {
        NProgress.start();
      }, 0);
      this.element.style.display = '';
      this.isOpened = true;
    } else {
      this.element.style.display = 'none';
    }
    // performace of NProgress is not good
    // NProgress.configure({
    //     trickleSpeed: 200,
    //     showSpinner: false
    // });
  }
  async show() {
    if (this.isOpened) return;
    this.isOpened = true;
    // console.log('show',this);
    // this.element.style.visibility = 'visible';
    this.element.style.display = '';
    // document.body.style.overflow = 'hidden';
    setTimeout(() => {
      NProgress.start();
    }, 0);
    await applyAnimation(this.element, {
      className: 'fade-in',
      duration: 500,
    });
    // this.element.classList.add('fade-in');
  }

  async hide() {
    // console.log('hide',this);
    if (!this.isOpened) return;
    setTimeout(() => {
      NProgress.done();
    }, 0);
    // document.body.style.overflow = '';
    await applyAnimation(this.element, {
      className: 'fade-out',
      duration: 500,
    });
    // this.element.style.visibility = 'hidden';
    this.element.style.display = 'none';

    this.isOpened = false;
  }

  async destroy() {
    this.element = null;
  }
}

class Fabs {
  constructor(element = document.querySelector('.fabs')) {
    this._handleScroll = this._handleScroll.bind(this);
    scrollManager.register('fabs', this._handleScroll);
    this._backToTop = () => {
      scrollManager.scrollTo(0);
    };
    this._goToComment = () => {
      const commentEl = document.querySelector('.comments');
      if (commentEl instanceof HTMLElement) {
        scrollManager.scrollTo(commentEl.offsetTop - 64);
      }
    };
    this.init(element);
  }

  init(element = document.querySelector('.fabs')) {
    this.rootElement = element;
    this.gotoTopBtn = this.rootElement?.querySelector('#goto-top-btn');
    this.gotoCommentBtn = this.rootElement?.querySelector('#goto-comment-btn');
    if (config.fabs.goto_top.enable && this.gotoTopBtn) {
      this._initGotoTopBtn();
    }
    if (config.fabs.goto_comment.enable && this.gotoCommentBtn) {
      this._initGotoCommentBtn();
    }
  }

  _handleScroll(event) {
    if (scrollManager.getScrollTop() > 20) {
      this.rootElement?.classList.remove('fabs-hidden');
    } else {
      this.rootElement?.classList.add('fabs-hidden');
    }
  }

  _initGotoTopBtn() {
    this.gotoTopBtn?.addEventListener('click', this._backToTop);
  }

  _initGotoCommentBtn() {
    this.gotoCommentBtn?.addEventListener('click', this._goToComment);
  }

  async reset(element = document.querySelector('.fabs')) {
    this.gotoTopBtn?.removeEventListener('click', this._backToTop);
    this.gotoCommentBtn?.removeEventListener('click', this._goToComment);
    this.rootElement = null;
    this.gotoTopBtn = null;
    this.gotoCommentBtn = null;
    this.init(element);
  }

  async destroy() {
    scrollManager.unregister('fabs');
    this.gotoTopBtn?.removeEventListener('click', this._backToTop);
    this.gotoCommentBtn?.removeEventListener('click', this._goToComment);
    this.rootElement = null;
    this.gotoTopBtn = null;
    this.gotoCommentBtn = null;
  }
}

let Parallax = null;
if (config.layout === 'home' && config.header.cover.type === 'parallax') {
  Parallax = (await import('./parallax-ba67aa87.js').then(function (n) { return n.p; })).default;
}

class Header {
  constructor(element = document.querySelector('#header')) {
    this._handleIndicatorClick = this._handleIndicatorClick.bind(this);
    this.init(element);
  }

  init(element = document.querySelector('#header')) {
    this.rootElement = element;
    this._initDescription();
    this._initBackground();
    this.indicatorElement = this.rootElement?.querySelector('.indicator');
    this.indicatorElement?.addEventListener('click', this._handleIndicatorClick);
  }
  _initBackground() {
    if (config.layout === 'home') {
      const backgroundElement = this.rootElement?.querySelector('.background');
      if (config.header.cover.type === 'parallax' && backgroundElement instanceof HTMLElement) {
        this.parallaxIns = new Parallax(backgroundElement, {
          // selector: '.layer',
          relativeInput: true,
          // clipRelativeInput: true,
          hoverOnly: true,
          frictionX: 0.18,
          frictionY: 0.18,
          scalarX: 6,
          scalarY: 6,
          limitX: 50,
          limitY: 50,
        });
      }
      if (config.header.cover.type === 'random' && backgroundElement instanceof HTMLElement) {
        document.querySelector('#header .cover .background');
        const coverList = [...config.header.cover.image];
        const cover = coverList[Math.floor(Math.random() * coverList.length)];
        backgroundElement.style.backgroundImage = `url(${cover})`;
      }
    }
  }
  _initDescription() {
    if (config.layout === 'home') {
      const descriptionElement = this.rootElement?.querySelector('.description');
      if (descriptionElement instanceof HTMLElement) {
        if (config.header.description.type === 'normal') {
          descriptionElement.innerHTML = `<span>${config.header.description.content}</span>`;
        } else if (config.header.description.type === 'random') {
          const descList = [...config.header.description.content];
          descriptionElement.innerHTML = `<span>${descList[Math.floor(Math.random() * descList.length)]}</span>`;
        } else if (config.header.description.type == 'api') {
          fetch(config.header.description.url)
            .then(res => res.json())
            .then(data => {
              descriptionElement.innerHTML = `
                <span class="hotokoto">
                    <span class="hitokoto-text">${data[config.header.description.text_field]}</span>
                    <span class="hitokoto-author"> —— ${data[config.header.description.from_field]}</span>
                </span>`;
            });
        }
      }
    }
  }

  _handleIndicatorClick(event) {
    if (this.rootElement instanceof HTMLElement) {
      scrollManager.scrollTo(this.rootElement.offsetTop + this.rootElement.offsetHeight);
    }
  }

  async reset(element = document.querySelector('#header')) {
    await this.destroy();
    this.init(element);
  }

  async destroy() {
    this.parallaxIns?.destroy();
    this.indicatorElement?.removeEventListener('click', this._handleIndicatorClick);
    this.rootElement = null;
    this.indicatorElement = null;
  }
}

// anchor 点击事件拦截器
class AnchorManager {
  constructor(element = document.body) {
    this.store = {};
    this.element = element;
    this._handleClick = this._handleClick.bind(this);
    document.addEventListener('click', this._handleClick, true);
    // this.mutationObserver = new MutationObserver(mutations => {
    //     console.log(mutations);
    //     mutations.forEach(mutation => {
    //         mutation.removedNodes.forEach(node => {
    //             if (node instanceof HTMLElement) {
    //                 [...node.querySelectorAll('a[href]')].forEach(item => {
    //                     item.removeEventListener('click', this._handleClick, true);
    //                 });
    //             }
    //         });
    //         mutation.addedNodes.forEach(node => {
    //             if (node instanceof HTMLElement) {
    //                 [...node.querySelectorAll('a[href]')].forEach(item => {
    //                     item.addEventListener('click', this._handleClick, true);
    //                 });
    //             }
    //         });
    //     });
    // });
    // this.mutationObserver.observe(this.element, {childList: true, subtree: true});
  }
  // 监视搜索页面和弹窗中的链接
  _handleClick(event) {
    const target = event.target;
    const anchor = target.closest('a[href]');
    if (anchor instanceof HTMLAnchorElement) {
      // console.log(anchor);
      for (const handler in this.store) {
        this.store[handler](event, anchor);
      }
    }
  }
  // _handleClick() {
  //     for (let handler in this.store) {
  //         Reflect.apply(this.store[handler], this, arguments);
  //     }
  // }
  register(name, fn) {
    if (!name) throw new TypeError('name is required');
    if (typeof fn !== 'function') throw new TypeError('fn must be a function');
    this.store[name] = fn;
    // [...this.element.querySelectorAll('a[href]')].forEach(item => {
    //     item.addEventListener('click', this._handleClick, true);
    // });
  }
  unregister(name) {
    if (!name) throw new TypeError('name is required');
    // [...this.element.querySelectorAll('a[href]')].forEach(item => {
    //     item.removeEventListener('click', this._handleClick, true);
    // });
    Reflect.deleteProperty(this.store, name);
  }

  destroy() {
    this.store = {};
    // this.mutationObserver.disconnect();
  }
}
const anchorManager = new AnchorManager();

class v{constructor(a){this.key=a;this.pull();}pull(){let a=window.history.state,b=null==a?void 0:a[this.key];if(void 0===b||this.index!==b){var c=window.sessionStorage.getItem(this.key),d=c?JSON.parse(c):[];d[this.index]=this.state;window.sessionStorage.setItem(this.key,JSON.stringify(d));void 0===b?(this.index=d.length,this.state=null,window.history.replaceState({...a,[this.key]:this.index},document.title)):(this.index=b,this.state=c?d[b]:null);}}}
let w=(a,b)=>{a.replaceWith(b);},x={default:w,innerHTML:(a,b)=>{a.innerHTML=b.innerHTML;},textContent:(a,b)=>{a.textContent=b.textContent;},innerText:(a,b)=>{a.innerText=b.innerText;},attributes:(a,b)=>{let c=a.getAttributeNames();b.getAttributeNames().forEach(d=>{a.setAttribute(d,b.getAttribute(d)||"");c=c.filter(e=>e!==d);});c.forEach(d=>{a.removeAttribute(d);});},replaceWith:w};
class C{constructor(a,b){this.form=a;this.submitButton=b;}getAttribute(a){let {submitButton:b,form:c}=this;if(b&&b.hasAttribute(`form${a}`)){var d=`${a.charAt(0).toUpperCase()}${a.slice(1)}`;if(d=b[`form${d}`])return d}return c[a]}getEntryList(){let {form:a,submitButton:b}=this,c=new FormData(a);b&&!b.disabled&&b.name&&c.append(b.name,b.value);return c}getNameValuePairs(){return Array.from(this.getEntryList(),([a,b])=>[a,b instanceof File?b.name:b])}getURLSearchParams(){return new URLSearchParams(this.getNameValuePairs())}getTextPlain(){return this.getNameValuePairs().reduce((a,
[b,c])=>`${a}${b}=${c}\r\n`,"")}getRequestInfo(){let a=this.getAttribute("action");var b=new URL(a,document.baseURI);if(!/^https?:$/.test(b.protocol))return null;switch(this.getAttribute("method")){case "get":return b.search=this.getURLSearchParams().toString(),b.href;case "post":switch(this.getAttribute("enctype")){case "application/x-www-form-urlencoded":b=this.getURLSearchParams();break;case "multipart/form-data":b=this.getEntryList();break;case "text/plain":b=this.getTextPlain();break;default:return null}return new Request(a,
{method:"POST",body:b});default:return null}}}let D=a=>{if(a===window.name)return window;switch(a.toLowerCase()){case "":case "_self":return window;case "_parent":return window.parent;case "_top":return window.top}};
class E{constructor(a){this.pjax=a;}test(a){let {defaultTrigger:b}=this.pjax.options;if("boolean"===typeof b)return b;let {enable:c,exclude:d}=b;return !1!==c&&(!d||!a.matches(d))}load(a,b){var c,d;let e={},g=null==(c=b.getAttribute("referrerpolicy"))?void 0:c.toLowerCase();void 0!==g&&(e.referrerPolicy=g);null!=(d=b.getAttribute("rel"))&&d.split(/\s+/).some(h=>"noreferrer"===h.toLowerCase())&&(e.referrer="");this.pjax.load(new Request(a,e)).catch(()=>{});}onLinkOpen(a){if(!a.defaultPrevented){var {target:b}=
a;if(b instanceof Element&&(b=b.closest("a[href], area[href]"))&&this.test(b)){if(a instanceof MouseEvent||a instanceof KeyboardEvent)if(a.metaKey||a.ctrlKey||a.shiftKey||a.altKey)return;D(b.target)===window&&b.origin===window.location.origin&&(a.preventDefault(),this.load(b.href,b));}}}onFormSubmit(a){if(!a.defaultPrevented){var {target:b,submitter:c}=a;if(b instanceof HTMLFormElement&&this.test(b)){var d=new C(b,c);D(d.getAttribute("target"))===window&&(d=d.getRequestInfo())&&(new URL("string"===
typeof d?d:d.url)).origin===window.location.origin&&(a.preventDefault(),this.load(d,b));}}}register(){document.addEventListener("click",a=>{this.onLinkOpen(a);});document.addEventListener("keyup",a=>{if("Enter"===a.key)this.onLinkOpen(a);});"SubmitEvent"in window&&document.addEventListener("submit",a=>{this.onFormSubmit(a);});}}
async function F(a,{selectors:b,switches:c,signal:d=null}){if(null!=d&&d.aborted)throw new DOMException("Aborted switches","AbortError");let e=!1,g=[];b.forEach(h=>{let l=a.querySelectorAll(h),k=document.querySelectorAll(h);if(l.length!==k.length)throw new DOMException(`Selector '${h}' does not select the same amount of nodes`,"IndexSizeError");let {activeElement:f}=document;k.forEach((n,p)=>{!e&&f&&n.contains(f)&&((f instanceof HTMLElement||f instanceof SVGElement)&&f.blur(),e=!0);let q=(null==c?
void 0:c[h])||x.default,r=Promise.resolve().then(()=>q(n,l[p])).catch(()=>{});g.push(r);});});await Promise.race([Promise.all(g),new Promise((h,l)=>{null==d?void 0:d.addEventListener("abort",()=>{l(new DOMException("Aborted switches","AbortError"));});})]);return {focusCleared:e}}
async function G(a,b={}){var c,d;let {selectors:e,switches:g,cache:h,timeout:l,hooks:k}={...this.options,...b},f={},n=(null==(c=this.abortController)?void 0:c.signal)||null;f.signal=n;c={cache:h,signal:n};a instanceof Request&&(c.referrer=a.referrer,c.referrerPolicy=a.referrerPolicy);a=new Request(a,c);a.headers.set("X-Requested-With","Fetch");a.headers.set("X-Pjax","true");a.headers.set("X-Pjax-Selectors",JSON.stringify(e));a=await (null==(d=k.request)?void 0:d.call(k,a))||a;f.request=a;f.timeout=
l;let p;0<l&&(p=window.setTimeout(()=>{var m;null==(m=this.abortController)?void 0:m.abort();},l),f.timeoutID=p);this.fire("send",f);try{var q,r,y;let m=await fetch(a).finally(()=>{window.clearTimeout(p);}),t=await (null==(q=k.response)?void 0:q.call(k,m))||m;f.response=t;this.fire("receive",f);let u=new URL(t.url);u.hash=(new URL(a.url)).hash;window.location.href!==u.href&&window.history.pushState(null,"",u.href);let z=(new DOMParser).parseFromString(await t.text(),"text/html"),I=await (null==(r=k.document)?
void 0:r.call(k,z))||z;f.switches=g;let A=await F(I,{selectors:e,switches:g,signal:n}),B=await (null==(y=k.switchesResult)?void 0:y.call(k,A))||A;f.switchesResult=B;await this.preparePage(B,b);}catch(m){throw f.error=m,this.fire("error",f),m;}finally{this.fire("complete",f);}this.fire("success",f);}let H=/^((application|text)\/(x-)?(ecma|java)script|text\/(javascript1\.[0-5]|(j|live)script))$/;
class J{constructor(a){this.evaluable=this.blocking=this.external=!1;this.target=a;if(a.hasAttribute("src")||a.text){var b=a.type?a.type.trim().toLowerCase():"text/javascript";if(H.test(b))this.type="classic";else if("module"===b)this.type="module";else return;a.noModule&&"classic"===this.type||(a.src&&(this.external=!0),this.blocking=!0,"classic"!==this.type?this.blocking=!1:this.external&&(a.hasAttribute("async")?this.blocking=!1:a.defer&&(this.blocking=!1)),this.evaluable=!0);}}eval(){return new Promise((a,
b)=>{let c=this.target,d=document.createElement("script");d.addEventListener("error",b);d.async=!1;c.getAttributeNames().forEach(e=>{d.setAttribute(e,c.getAttribute(e)||"");});d.text=c.text;document.contains(c)?c.replaceWith(d):(document.head.append(d),this.external?d.addEventListener("load",()=>d.remove()):d.remove());this.external?d.addEventListener("load",()=>a()):a();})}}
class K{constructor(a){this.signal=a;}async exec(a){var b;if(null!=(b=this.signal)&&b.aborted)throw new DOMException("Execution aborted","AbortError");b=a.eval().catch(()=>{});a.blocking&&await b;}}
async function L(a,{signal:b=null}={}){if(null!=b&&b.aborted)throw new DOMException("Aborted execution","AbortError");a=Array.from(a,d=>new J(d)).filter(d=>d.evaluable);let c=new K(b);a=a.reduce((d,e)=>e.external?Promise.all([d,c.exec(e)]):d.then(()=>c.exec(e)),Promise.resolve());await Promise.race([a,new Promise((d,e)=>{null==b?void 0:b.addEventListener("abort",()=>{e(new DOMException("Aborted execution","AbortError"));});})]);}
let M=()=>{let a=null;const b=decodeURIComponent(window.location.hash.slice(1));b&&(a=document.getElementById(b)||document.getElementsByName(b)[0]);a||b&&"top"!==b.toLowerCase()||(a=document.scrollingElement);return a};
async function N(a,b={}){b={...this.options,...b};if(a){var c;if(a.focusCleared){let e=document.querySelectorAll("[autofocus]")[0];(e instanceof HTMLElement||e instanceof SVGElement)&&e.focus();}let d=[];b.scripts&&document.querySelectorAll(b.scripts).forEach(e=>{e instanceof HTMLScriptElement&&d.push(e);});b.selectors.forEach(e=>{document.querySelectorAll(e).forEach(g=>{g instanceof HTMLScriptElement?d.push(g):g.querySelectorAll("script").forEach(h=>{d.includes(h)||d.push(h);});});});d.sort((e,g)=>e.compareDocumentPosition(g)&
Node.DOCUMENT_POSITION_PRECEDING||-1);await L(d,{signal:(null==(c=this.abortController)?void 0:c.signal)||null});}({scrollTo:c}=b);if(!1!==c){a=a?[0,0]:!1;if(Array.isArray(c))a=c;else if("number"===typeof c)a=[window.scrollX,c];else if(c=M())c.scrollIntoView(),a=!1;a&&window.scrollTo(a[0],a[1]);}}
async function O(a,b={}){var c;this.storeHistory();let d=new AbortController;null==(c=this.abortController)?void 0:c.abort();this.abortController=d;c=new URL("string"===typeof a?a:a.url,document.baseURI);c.pathname+c.search===this.location.pathname+this.location.search&&c.href.includes("#")?(window.location.hash!==c.hash&&window.history.pushState(null,"",c.href),await this.preparePage(null,b)):await this.switchDOM(a,b);this.history.pull();this.location.href=window.location.href;this.abortController=
null;}
class P{static reload(){window.location.reload();}constructor(a={}){this.options={defaultTrigger:!0,selectors:["title",".pjax"],switches:{},scripts:"script[data-pjax]",scrollTo:!0,scrollRestoration:!0,cache:"default",timeout:0,hooks:{}};this.history=new v("pjax");this.location=new URL(window.location.href);this.abortController=null;this.switchDOM=G;this.preparePage=N;this.weakLoad=O;Object.assign(this.options,a);this.options.scrollRestoration&&(window.history.scrollRestoration="manual",window.addEventListener("beforeunload",()=>
{window.history.scrollRestoration="auto";}));({defaultTrigger:a}=this.options);(!0===a||!1!==a&&!1!==a.enable)&&(new E(this)).register();window.addEventListener("popstate",b=>{this.storeHistory();this.history.pull();null!==b.state&&(b={},this.options.scrollRestoration&&this.history.state&&(b.scrollTo=this.history.state.scrollPos),this.load(window.location.href,b).catch(()=>{}));});}storeHistory(){this.history.state={scrollPos:[window.scrollX,window.scrollY]};}fire(a,b){a=new CustomEvent(`pjax:${a}`,{bubbles:!0,
cancelable:!1,detail:{abortController:this.abortController,...b}});document.dispatchEvent(a);}async load(a,b={}){try{await this.weakLoad(a,b);}catch(c){if(c instanceof DOMException&&"AbortError"===c.name)throw c;window.location.assign("string"===typeof a?a:a.url);}}}P.switches=x;

console.log('dev mode');

if (config.lazyload.enable) {
  window.lazySizesConfig = window.lazySizesConfig || {};
  window.lazySizesConfig.expand = 400;
}

colorMode$1.set(config.colormode ?? 'auto');
colorMode$1.autoChange();

let loading =  config.loading.enable ? new Loading(null, {
  defaultOpen: true,
}) : null;

// script before this line will be executed before DOMContentLoaded
await yieldToMain();

let header = config.header.enable ? new Header() : null;
await yieldToMain();

let navigator$1 = config.navigator.enable ? new Navigator() : null;
await yieldToMain();

let sidebar = config.sidebar.enable ? new Sidebar() : null;
await yieldToMain();

let fabs = new Fabs();
await yieldToMain();

if (document.readyState === 'loading') {
  document.addEventListener(
    'DOMContentLoaded',
    event => {
      loading?.hide();
    },
    { once: true }
  );
} else {
  loading?.hide();
}

const scrollMarginTop = 76;
const scrollIntoView = (hash, marginTop = 0, immediate = false) => {
  const id = decodeURI(hash); //decodeURI(this.getAttribute('href'));
  const target = document.querySelector(id);
  if (target instanceof HTMLElement) {
    scrollManager.scrollTo(0, target.getBoundingClientRect().top + window.scrollY - marginTop, immediate);
  }
};
window.addEventListener('hashchange', event => {
  const hash = window.location.hash;
  if (hash) {
    scrollIntoView(hash, scrollMarginTop);
  }
});
document.addEventListener(
  'DOMContentLoaded',
  event => {
    const hash = window.location.hash;
    if (hash) {
      scrollIntoView(hash, scrollMarginTop, true);
    }
  },
  { once: true }
);
anchorManager.register('hash', (event, target) => {
  const anchor = target;
  if (
    anchor.origin === window.location.origin &&
    anchor.pathname === window.location.pathname &&
    anchor.hash !== window.location.hash
  ) {
    window.history.pushState(null, '', anchor.hash);
    // pushState will not trigger hashchange event
    scrollIntoView(anchor.hash, scrollMarginTop);
    event.preventDefault();
  }
  if (anchor.pathname === window.location.pathname && anchor.hash === window.location.hash && anchor.hash !== '') {
    scrollIntoView(anchor.hash, scrollMarginTop);
    event.preventDefault();
  }
});

let renderMathInElement = null;

const renderMath = () => {
  if (renderMathInElement) {
    renderMathInElement(document.body, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\(', right: '\\)', display: false },
        { left: '\\[', right: '\\]', display: true },
      ],
    });
  }
};

if (config.katex.enable) {
  renderMathInElement = (await import('./auto-render-fe5dd33a.js')).default;
  // dynamic import katex to shrink bundle size
  renderMath();
}

if (config.pjax.enable) {
  const pjaxSelectors = [
    'title',
    'meta[name=description]',
    '#config-data',
    '#remixicon-symbols',
    '#header',
    '#footer',
    '#main',
    '.nav-right-drawer',
    '.fabs',
  ];
  const pjax = new P({
    defaultTrigger: false,
    selectors: pjaxSelectors,
    scrollTo: false,
  });
  let prevLocation = null;
  let prevLocationUpdate = null;
  document.addEventListener('pjax:send', async () => {
    loading?.show();
    prevLocationUpdate = pjax.location.href;
  });
  document.addEventListener('pjax:success', async () => {
    prevLocation = prevLocationUpdate;
    const oldConfig = clone();
    const newConfig = update();

    // console.log(oldConfig, newConfig);

    const updateMap = {
      header: [Header, header],
      navigator: [Navigator, navigator$1],
      sidebar: [Sidebar, sidebar],
      fabs: [Fabs, fabs],
    };
    [header, navigator$1, sidebar, fabs] = (
      await Promise.allSettled(
        Object.keys(updateMap).map(key => {
          const [Component, instance] = updateMap[key];
          if (!oldConfig[key].enable && newConfig[key].enable) {
            return new Component();
          } else if (oldConfig[key].enable && !newConfig[key].enable) {
            return (async () => {
              await instance?.destroy();
              return null;
            })();
          } else if (oldConfig[key].enable && newConfig[key].enable) {
            return (async () => {
              await instance?.reset();
              return instance;
            })();
          }
          return instance;
        })
      )
    ).map(result => {
      if (result.status === 'fulfilled') {
        return result.value;
      }
      return null;
    });
    loading?.hide();
    newConfig.katex.enable && renderMath();
    document.querySelectorAll('#header,#main,#footer').forEach(e => {
      applyTransition(e, {
        transition: 'transform .4s ease-out, opacity .4s ease-out',
        from: {
          transform: 'translateY(-100px)',
          opacity: 0,
        },
        to: {
          transform: 'translateY(0)',
          opacity: 1,
        },
        keep: false,
      });
    });

    // applyAnimation(document.querySelector('#header'), {
    //   className: 'slide-down-fade-in',
    // });
    // applyAnimation(document.querySelector('#main'), {
    //   className: 'slide-up-fade-in',
    // });
    scrollManager.scrollTo(0, 0, true);

    if (newConfig.layout === '404') {
      document.querySelector('.goback')?.addEventListener('click', () => {
        pjax.load(prevLocation);
      });
    }
  });

  // 对所有 a[href] 绑定 click 事件，此后 DOM 新增的 a[href] 也会自动监听
  // 只有站内跳转才会用到 pjax ，注意要取消事件的默认行为
  anchorManager.register('pjax', (event, target) => {
    const anchor = target;
    // 若网站只有hash部分改变，则不跳转
    if (anchor.origin === window.location.origin) {
      if (
        anchor.pathname !== window.location.pathname ||
        (anchor.pathname === window.location.pathname && anchor.hash === '' && window.location.hash === '')
      ) {
        event.preventDefault();
        pjax.load(anchor.href);
      }
    }
  });
}

export { commonjsGlobal as c };
