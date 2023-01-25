import { tabbable } from 'tabbable';

// wait for all animations to complete their promises
export function animationsComplete(
  element,
  options = {
    subtree: false,
  }
) {
  return Promise.allSettled(element.getAnimations(options).map(animation => animation.finished));
}

// finish all animations
export function finishAnimations(
  element,
  options = {
    subtree: false,
  }
) {
  element.getAnimations(options).forEach(animation => {
    animation.finish();
  });
}

export const applyAnimation = async (element, options = {}) => {
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
export const applyTransition = async (element, options = {}) => {
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
export function focusTrap(container, event) {
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
export function now() {
  return Date.now() || new Date().getTime();
}
// Some functions take a variable number of arguments, or a few expected
// arguments at the beginning and then a variable number of values to operate
// on. This helper accumulates all remaining arguments past the function’s
// argument length (or an explicit `startIndex`), into an array that becomes
// the last argument. Similar to ES6’s "rest parameter".
export function restArguments(func, startIndex) {
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
export function debounce(func, wait, immediate) {
  let timeout, previous, args, result, context;
  const later = function () {
    const passed = now() - previous;
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
    previous = now();
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
export function throttle(func, wait, options) {
  let timeout, context, args, result;
  let previous = 0;
  if (!options) options = {};
  const later = function () {
    previous = options.leading === false ? 0 : now();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) context = args = null;
  };
  const throttled = function () {
    const _now = now();
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
export function isVisible(element) {
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
export const yieldToMain = () => {
  return new Promise(resolve => {
    setTimeout(resolve, 0);
  });
};
