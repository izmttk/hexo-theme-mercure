import { q as serializePayload, j as createDocumentationMessageGenerator, _ as _warning, r as uniq, g as getPropertyByPath, b as getHighlightedParts, u as unescape, e as isEqual, n as noop, a as component, t as mergeSearchParameters, v as isPlainObject, m as algoliasearchHelper_1, w as capitalize, x as escapeHits, f as formatNumber, y as TAG_PLACEHOLDER, z as readDataAttributes, A as deserializePayload, B as hasDataAttributes, s as safelyRunOnBrowser, k as createDocumentationLink, T as TAG_REPLACEMENT, C as escapeFacets, p as deprecate } from './formatNumber-c6ea621d.js';
export { l as index } from './formatNumber-c6ea621d.js';

function getObjectType(object) {
  return Object.prototype.toString.call(object).slice(8, -1);
}

function checkRendering(rendering, usage) {
  if (rendering === undefined || typeof rendering !== 'function') {
    throw new Error("The render function is not valid (received type ".concat(getObjectType(rendering), ").\n\n").concat(usage));
  }
}

/**
 * Clears the refinements of a SearchParameters object based on rules provided.
 * The included attributes list is applied before the excluded attributes list. If the list
 * is not provided, this list of all the currently refined attributes is used as included attributes.
 * @returns search parameters with refinements cleared
 */
function clearRefinements$2(_ref) {
  var helper = _ref.helper,
      _ref$attributesToClea = _ref.attributesToClear,
      attributesToClear = _ref$attributesToClea === void 0 ? [] : _ref$attributesToClea;
  var finalState = helper.state.setPage(0);
  finalState = attributesToClear.reduce(function (state, attribute) {
    if (finalState.isNumericRefined(attribute)) {
      return state.removeNumericRefinement(attribute);
    }

    if (finalState.isHierarchicalFacet(attribute)) {
      return state.removeHierarchicalFacetRefinement(attribute);
    }

    if (finalState.isDisjunctiveFacet(attribute)) {
      return state.removeDisjunctiveFacetRefinement(attribute);
    }

    if (finalState.isConjunctiveFacet(attribute)) {
      return state.removeFacetRefinement(attribute);
    }

    return state;
  }, finalState);

  if (attributesToClear.indexOf('query') !== -1) {
    finalState = finalState.setQuery('');
  }

  return finalState;
}

// copied from
// https://github.com/algolia/autocomplete.js/blob/307a7acc4283e10a19cb7d067f04f1bea79dc56f/packages/autocomplete-core/src/utils/createConcurrentSafePromise.ts#L1:L1

/**
 * Creates a runner that executes promises in a concurrent-safe way.
 *
 * This is useful to prevent older promises to resolve after a newer promise,
 * otherwise resulting in stale resolved values.
 */
function createConcurrentSafePromise() {
  var basePromiseId = -1;
  var latestResolvedId = -1;
  var latestResolvedValue = undefined;
  return function runConcurrentSafePromise(promise) {
    var currentPromiseId = ++basePromiseId;
    return Promise.resolve(promise).then(function (x) {
      // The promise might take too long to resolve and get outdated. This would
      // result in resolving stale values.
      // When this happens, we ignore the promise value and return the one
      // coming from the latest resolved value.
      //
      // +----------------------------------+
      // |        100ms                     |
      // | run(1) +--->  R1                 |
      // |        300ms                     |
      // | run(2) +-------------> R2 (SKIP) |
      // |        200ms                     |
      // | run(3) +--------> R3             |
      // +----------------------------------+
      if (latestResolvedValue && currentPromiseId < latestResolvedId) {
        return latestResolvedValue;
      }

      latestResolvedId = currentPromiseId;
      latestResolvedValue = x;
      return x;
    });
  };
}

function isFacetRefined(helper, facet, value) {
  if (helper.state.isHierarchicalFacet(facet)) {
    return helper.state.isHierarchicalFacetRefined(facet, value);
  } else if (helper.state.isConjunctiveFacet(facet)) {
    return helper.state.isFacetRefined(facet, value);
  } else {
    return helper.state.isDisjunctiveFacetRefined(facet, value);
  }
}

function _typeof$a(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof$a = function _typeof(obj) { return typeof obj; }; } else { _typeof$a = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof$a(obj); }
function createSendEventForFacet(_ref) {
  var instantSearchInstance = _ref.instantSearchInstance,
      helper = _ref.helper,
      attr = _ref.attribute,
      widgetType = _ref.widgetType;

  var sendEventForFacet = function sendEventForFacet() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var eventType = args[0],
        facetValue = args[1],
        _args$ = args[2],
        eventName = _args$ === void 0 ? 'Filter Applied' : _args$;
    var attribute = typeof attr === 'string' ? attr : attr(facetValue);

    if (args.length === 1 && _typeof$a(args[0]) === 'object') {
      instantSearchInstance.sendEventToInsights(args[0]);
    } else if (eventType === 'click' && (args.length === 2 || args.length === 3)) {
      if (!isFacetRefined(helper, attribute, facetValue)) {
        // send event only when the facet is being checked "ON"
        instantSearchInstance.sendEventToInsights({
          insightsMethod: 'clickedFilters',
          widgetType: widgetType,
          eventType: eventType,
          payload: {
            eventName: eventName,
            index: helper.getIndex(),
            filters: ["".concat(attribute, ":").concat(facetValue)]
          },
          attribute: attribute
        });
      }
    } else {
      throw new Error("You need to pass two arguments like:\n  sendEvent('click', facetValue);\n\nIf you want to send a custom payload, you can pass one object: sendEvent(customPayload);\n");
    }
  };

  return sendEventForFacet;
}

function _typeof$9(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof$9 = function _typeof(obj) { return typeof obj; }; } else { _typeof$9 = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof$9(obj); }

function chunk(arr) {
  var chunkSize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 20;
  var chunks = [];

  for (var i = 0; i < Math.ceil(arr.length / chunkSize); i++) {
    chunks.push(arr.slice(i * chunkSize, (i + 1) * chunkSize));
  }

  return chunks;
}

var buildPayloads = function buildPayloads(_ref) {
  var index = _ref.index,
      widgetType = _ref.widgetType,
      methodName = _ref.methodName,
      args = _ref.args,
      isSearchStalled = _ref.isSearchStalled;

  // when there's only one argument, that means it's custom
  if (args.length === 1 && _typeof$9(args[0]) === 'object') {
    return [args[0]];
  }

  var eventType = args[0];
  var hits = args[1];
  var eventName = args[2];

  if (!hits) {
    {
      throw new Error("You need to pass hit or hits as the second argument like:\n  ".concat(methodName, "(eventType, hit);\n  "));
    }
  }

  if ((eventType === 'click' || eventType === 'conversion') && !eventName) {
    {
      throw new Error("You need to pass eventName as the third argument for 'click' or 'conversion' events like:\n  ".concat(methodName, "('click', hit, 'Product Purchased');\n\n  To learn more about event naming: https://www.algolia.com/doc/guides/getting-insights-and-analytics/search-analytics/click-through-and-conversions/in-depth/clicks-conversions-best-practices/\n  "));
    }
  }

  var hitsArray = Array.isArray(hits) ? removeEscapedFromHits(hits) : [hits];

  if (hitsArray.length === 0) {
    return [];
  }

  var queryID = hitsArray[0].__queryID;
  var hitsChunks = chunk(hitsArray);
  var objectIDsByChunk = hitsChunks.map(function (batch) {
    return batch.map(function (hit) {
      return hit.objectID;
    });
  });
  var positionsByChunk = hitsChunks.map(function (batch) {
    return batch.map(function (hit) {
      return hit.__position;
    });
  });

  if (eventType === 'view') {
    if (isSearchStalled) {
      return [];
    }

    return hitsChunks.map(function (batch, i) {
      return {
        insightsMethod: 'viewedObjectIDs',
        widgetType: widgetType,
        eventType: eventType,
        payload: {
          eventName: eventName || 'Hits Viewed',
          index: index,
          objectIDs: objectIDsByChunk[i]
        },
        hits: batch
      };
    });
  } else if (eventType === 'click') {
    return hitsChunks.map(function (batch, i) {
      return {
        insightsMethod: 'clickedObjectIDsAfterSearch',
        widgetType: widgetType,
        eventType: eventType,
        payload: {
          eventName: eventName,
          index: index,
          queryID: queryID,
          objectIDs: objectIDsByChunk[i],
          positions: positionsByChunk[i]
        },
        hits: batch
      };
    });
  } else if (eventType === 'conversion') {
    return hitsChunks.map(function (batch, i) {
      return {
        insightsMethod: 'convertedObjectIDsAfterSearch',
        widgetType: widgetType,
        eventType: eventType,
        payload: {
          eventName: eventName,
          index: index,
          queryID: queryID,
          objectIDs: objectIDsByChunk[i]
        },
        hits: batch
      };
    });
  } else {
    throw new Error("eventType(\"".concat(eventType, "\") is not supported.\n    If you want to send a custom payload, you can pass one object: ").concat(methodName, "(customPayload);\n    "));
  }
};

function removeEscapedFromHits(hits) {
  // remove `hits.__escaped` without mutating
  return hits.slice();
}

function createSendEventForHits(_ref2) {
  var instantSearchInstance = _ref2.instantSearchInstance,
      index = _ref2.index,
      widgetType = _ref2.widgetType;

  var sendEventForHits = function sendEventForHits() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var payloads = buildPayloads({
      widgetType: widgetType,
      index: index,
      methodName: 'sendEvent',
      args: args,
      isSearchStalled: instantSearchInstance.status === 'stalled'
    });
    payloads.forEach(function (payload) {
      return instantSearchInstance.sendEventToInsights(payload);
    });
  };

  return sendEventForHits;
}
function createBindEventForHits(_ref3) {
  var index = _ref3.index,
      widgetType = _ref3.widgetType;

  var bindEventForHits = function bindEventForHits() {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    var payloads = buildPayloads({
      widgetType: widgetType,
      index: index,
      methodName: 'bindEvent',
      args: args,
      isSearchStalled: false
    });
    return payloads.length ? "data-insights-event=".concat(serializePayload(payloads)) : '';
  };

  return bindEventForHits;
}

// Debounce a function call to the trailing edge.
// The debounced function returns a promise.
function debounce(func, wait) {
  var lastTimeout = null;
  return function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return new Promise(function (resolve, reject) {
      if (lastTimeout) {
        clearTimeout(lastTimeout);
      }

      lastTimeout = setTimeout(function () {
        lastTimeout = null;
        Promise.resolve(func.apply(void 0, args)).then(resolve).catch(reject);
      }, wait);
    });
  };
}

function unescapeFacetValue(value) {
  if (typeof value === 'string') {
    return value.replace(/^\\-/, '-');
  }

  return value;
}
function escapeFacetValue(value) {
  if (typeof value === 'number' && value < 0 || typeof value === 'string') {
    return String(value).replace(/^-/, '\\-');
  }

  return value;
}

// We aren't using the native `Array.prototype.find` because the refactor away from Lodash is not
// published as a major version.
// Relying on the `find` polyfill on user-land, which before was only required for niche use-cases,
// was decided as too risky.
// @MAJOR Replace with the native `Array.prototype.find` method
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
function find(items, predicate) {
  var value;

  for (var i = 0; i < items.length; i++) {
    value = items[i]; // inlined for performance: if (Call(predicate, thisArg, [value, i, list])) {

    if (predicate(value, i, items)) {
      return value;
    }
  }

  return undefined;
}

function _slicedToArray$a(arr, i) { return _arrayWithHoles$a(arr) || _iterableToArrayLimit$a(arr, i) || _unsupportedIterableToArray$j(arr, i) || _nonIterableRest$a(); }

function _nonIterableRest$a() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray$j(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$j(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$j(o, minLen); }

function _arrayLikeToArray$j(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit$a(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles$a(arr) { if (Array.isArray(arr)) return arr; }

var latLngRegExp = /^(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)$/;
function aroundLatLngToPosition(value) {
  var pattern = value.match(latLngRegExp); // Since the value provided is the one send with the request, the API should
  // throw an error due to the wrong format. So throw an error should be safe.

  if (!pattern) {
    throw new Error("Invalid value for \"aroundLatLng\" parameter: \"".concat(value, "\""));
  }

  return {
    lat: parseFloat(pattern[1]),
    lng: parseFloat(pattern[2])
  };
}

function insideBoundingBoxArrayToBoundingBox(value) {
  var _value = _slicedToArray$a(value, 1),
      _value$ = _value[0];

  _value$ = _value$ === void 0 ? [undefined, undefined, undefined, undefined] : _value$;

  var _value$2 = _slicedToArray$a(_value$, 4),
      neLat = _value$2[0],
      neLng = _value$2[1],
      swLat = _value$2[2],
      swLng = _value$2[3]; // Since the value provided is the one send with the request, the API should
  // throw an error due to the wrong format. So throw an error should be safe.


  if (!neLat || !neLng || !swLat || !swLng) {
    throw new Error("Invalid value for \"insideBoundingBox\" parameter: [".concat(value, "]"));
  }

  return {
    northEast: {
      lat: neLat,
      lng: neLng
    },
    southWest: {
      lat: swLat,
      lng: swLng
    }
  };
}

function insideBoundingBoxStringToBoundingBox(value) {
  var _value$split$map = value.split(',').map(parseFloat),
      _value$split$map2 = _slicedToArray$a(_value$split$map, 4),
      neLat = _value$split$map2[0],
      neLng = _value$split$map2[1],
      swLat = _value$split$map2[2],
      swLng = _value$split$map2[3]; // Since the value provided is the one send with the request, the API should
  // throw an error due to the wrong format. So throw an error should be safe.


  if (!neLat || !neLng || !swLat || !swLng) {
    throw new Error("Invalid value for \"insideBoundingBox\" parameter: \"".concat(value, "\""));
  }

  return {
    northEast: {
      lat: neLat,
      lng: neLng
    },
    southWest: {
      lat: swLat,
      lng: swLng
    }
  };
}

function insideBoundingBoxToBoundingBox(value) {
  if (Array.isArray(value)) {
    return insideBoundingBoxArrayToBoundingBox(value);
  }

  return insideBoundingBoxStringToBoundingBox(value);
}

function isDomElement(object) {
  return object instanceof HTMLElement || Boolean(object) && object.nodeType > 0;
}

/**
 * Return the container. If it's a string, it is considered a
 * css selector and retrieves the first matching element. Otherwise
 * test if it validates that it's a correct DOMElement.
 *
 * @param {string|HTMLElement} selectorOrHTMLElement CSS Selector or container node.
 * @return {HTMLElement} Container node
 * @throws Error when the type is not correct
 */

function getContainerNode(selectorOrHTMLElement) {
  var isSelectorString = typeof selectorOrHTMLElement === 'string';
  var domElement = isSelectorString ? document.querySelector(selectorOrHTMLElement) : selectorOrHTMLElement;

  if (!isDomElement(domElement)) {
    var errorMessage = 'Container must be `string` or `HTMLElement`.';

    if (isSelectorString) {
      errorMessage += " Unable to find ".concat(selectorOrHTMLElement);
    }

    throw new Error(errorMessage);
  }

  return domElement;
}

function getRefinement(state, type, attribute, name) {
  var resultsFacets = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [];
  var res = {
    type: type,
    attribute: attribute,
    name: name,
    escapedValue: escapeFacetValue(name)
  };
  var facet = find(resultsFacets, function (resultsFacet) {
    return resultsFacet.name === attribute;
  });
  var count;

  if (type === 'hierarchical') {
    (function () {
      var facetDeclaration = state.getHierarchicalFacetByName(attribute);
      var nameParts = name.split(facetDeclaration.separator);

      var getFacetRefinement = function getFacetRefinement(facetData) {
        return function (refinementKey) {
          return facetData[refinementKey];
        };
      };

      var _loop = function _loop(i) {
        facet = facet && facet.data && find(Object.keys(facet.data).map(getFacetRefinement(facet.data)), function (refinement) {
          return refinement.name === nameParts[i];
        });
      };

      for (var i = 0; facet !== undefined && i < nameParts.length; ++i) {
        _loop(i);
      }

      count = facet && facet.count;
    })();
  } else {
    count = facet && facet.data && facet.data[res.name];
  }

  if (count !== undefined) {
    res.count = count;
  }

  if (facet && facet.exhaustive !== undefined) {
    res.exhaustive = facet.exhaustive;
  }

  return res;
}

function getRefinements(results, state) {
  var includesQuery = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var refinements = [];
  var _state$facetsRefineme = state.facetsRefinements,
      facetsRefinements = _state$facetsRefineme === void 0 ? {} : _state$facetsRefineme,
      _state$facetsExcludes = state.facetsExcludes,
      facetsExcludes = _state$facetsExcludes === void 0 ? {} : _state$facetsExcludes,
      _state$disjunctiveFac = state.disjunctiveFacetsRefinements,
      disjunctiveFacetsRefinements = _state$disjunctiveFac === void 0 ? {} : _state$disjunctiveFac,
      _state$hierarchicalFa = state.hierarchicalFacetsRefinements,
      hierarchicalFacetsRefinements = _state$hierarchicalFa === void 0 ? {} : _state$hierarchicalFa,
      _state$numericRefinem = state.numericRefinements,
      numericRefinements = _state$numericRefinem === void 0 ? {} : _state$numericRefinem,
      _state$tagRefinements = state.tagRefinements,
      tagRefinements = _state$tagRefinements === void 0 ? [] : _state$tagRefinements;
  Object.keys(facetsRefinements).forEach(function (attribute) {
    var refinementNames = facetsRefinements[attribute];
    refinementNames.forEach(function (refinementName) {
      refinements.push(getRefinement(state, 'facet', attribute, refinementName, results.facets));
    });
  });
  Object.keys(facetsExcludes).forEach(function (attribute) {
    var refinementNames = facetsExcludes[attribute];
    refinementNames.forEach(function (refinementName) {
      refinements.push({
        type: 'exclude',
        attribute: attribute,
        name: refinementName,
        exclude: true
      });
    });
  });
  Object.keys(disjunctiveFacetsRefinements).forEach(function (attribute) {
    var refinementNames = disjunctiveFacetsRefinements[attribute];
    refinementNames.forEach(function (refinementName) {
      refinements.push(getRefinement(state, 'disjunctive', attribute, // We unescape any disjunctive refined values with `unescapeFacetValue` because
      // they can be escaped on negative numeric values with `escapeFacetValue`.
      unescapeFacetValue(refinementName), results.disjunctiveFacets));
    });
  });
  Object.keys(hierarchicalFacetsRefinements).forEach(function (attribute) {
    var refinementNames = hierarchicalFacetsRefinements[attribute];
    refinementNames.forEach(function (refinement) {
      refinements.push(getRefinement(state, 'hierarchical', attribute, refinement, results.hierarchicalFacets));
    });
  });
  Object.keys(numericRefinements).forEach(function (attribute) {
    var operators = numericRefinements[attribute];
    Object.keys(operators).forEach(function (operatorOriginal) {
      var operator = operatorOriginal;
      var valueOrValues = operators[operator];
      var refinementNames = Array.isArray(valueOrValues) ? valueOrValues : [valueOrValues];
      refinementNames.forEach(function (refinementName) {
        refinements.push({
          type: 'numeric',
          attribute: attribute,
          name: "".concat(refinementName),
          numericValue: refinementName,
          operator: operator
        });
      });
    });
  });
  tagRefinements.forEach(function (refinementName) {
    refinements.push({
      type: 'tag',
      attribute: '_tags',
      name: refinementName
    });
  });

  if (includesQuery && state.query && state.query.trim()) {
    refinements.push({
      attribute: 'query',
      type: 'query',
      name: state.query,
      query: state.query
    });
  }

  return refinements;
}

function getWidgetAttribute(widget, initOptions) {
  var _widget$getWidgetRend;

  var renderState = (_widget$getWidgetRend = widget.getWidgetRenderState) === null || _widget$getWidgetRend === void 0 ? void 0 : _widget$getWidgetRend.call(widget, initOptions);
  var attribute = null;

  if (renderState && renderState.widgetParams) {
    // casting as widgetParams is checked just before
    var widgetParams = renderState.widgetParams;

    if (widgetParams.attribute) {
      attribute = widgetParams.attribute;
    } else if (Array.isArray(widgetParams.attributes)) {
      attribute = widgetParams.attributes[0];
    }
  }

  if (typeof attribute !== 'string') {
    throw new Error("Could not find the attribute of the widget:\n\n".concat(JSON.stringify(widget), "\n\nPlease check whether the widget's getWidgetRenderState returns widgetParams.attribute correctly."));
  }

  return attribute;
}

function ownKeys$18(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$18(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$18(Object(source), true).forEach(function (key) { _defineProperty$1f(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$18(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$1f(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function addAbsolutePosition(hits, page, hitsPerPage) {
  return hits.map(function (hit, idx) {
    return _objectSpread$18(_objectSpread$18({}, hit), {}, {
      __position: hitsPerPage * page + idx + 1
    });
  });
}

function ownKeys$17(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$17(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$17(Object(source), true).forEach(function (key) { _defineProperty$1e(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$17(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$1e(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function addQueryID(hits, queryID) {
  if (!queryID) {
    return hits;
  }

  return hits.map(function (hit) {
    return _objectSpread$17(_objectSpread$17({}, hit), {}, {
      __queryID: queryID
    });
  });
}

// This is the `Number.isFinite()` polyfill recommended by MDN.
// We do not provide any tests for this function.
// See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isFinite#Polyfill
// @MAJOR Replace with the native `Number.isFinite` method
function isFiniteNumber(value) {
  return typeof value === 'number' && isFinite(value);
}

function isSpecialClick(event) {
  var isMiddleClick = event.button === 1;
  return isMiddleClick || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
}

function _toConsumableArray$9(arr) { return _arrayWithoutHoles$9(arr) || _iterableToArray$9(arr) || _unsupportedIterableToArray$i(arr) || _nonIterableSpread$9(); }

function _nonIterableSpread$9() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray$i(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$i(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$i(o, minLen); }

function _iterableToArray$9(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles$9(arr) { if (Array.isArray(arr)) return _arrayLikeToArray$i(arr); }

function _arrayLikeToArray$i(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function range(_ref) {
  var _ref$start = _ref.start,
      start = _ref$start === void 0 ? 0 : _ref$start,
      end = _ref.end,
      _ref$step = _ref.step,
      step = _ref$step === void 0 ? 1 : _ref$step;
  // We can't divide by 0 so we re-assign the step to 1 if it happens.
  var limitStep = step === 0 ? 1 : step; // In some cases the array to create has a decimal length.
  // We therefore need to round the value.
  // Example:
  //   { start: 1, end: 5000, step: 500 }
  //   => Array length = (5000 - 1) / 500 = 9.998

  var arrayLength = Math.round((end - start) / limitStep);
  return _toConsumableArray$9(Array(arrayLength)).map(function (_, current) {
    return start + current * limitStep;
  });
}

function toArray(value) {
  return Array.isArray(value) ? value : [value];
}

function ownKeys$16(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$16(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$16(Object(source), true).forEach(function (key) { _defineProperty$1d(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$16(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$1d(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var withUsage$R = createDocumentationMessageGenerator({
  name: 'analytics'
});

// @major this widget will be removed from the next major version.
var analytics = function analytics(widgetParams) {
  var _ref = widgetParams || {},
      pushFunction = _ref.pushFunction,
      _ref$delay = _ref.delay,
      delay = _ref$delay === void 0 ? 3000 : _ref$delay,
      _ref$triggerOnUIInter = _ref.triggerOnUIInteraction,
      triggerOnUIInteraction = _ref$triggerOnUIInter === void 0 ? false : _ref$triggerOnUIInter,
      _ref$pushInitialSearc = _ref.pushInitialSearch,
      pushInitialSearch = _ref$pushInitialSearc === void 0 ? true : _ref$pushInitialSearc,
      _ref$pushPagination = _ref.pushPagination,
      pushPagination = _ref$pushPagination === void 0 ? false : _ref$pushPagination;

  if (!pushFunction) {
    throw new Error(withUsage$R('The `pushFunction` option is required.'));
  }

  _warning(false, "`analytics` widget has been deprecated. It is still supported in 4.x releases, but not further. It is replaced by the `insights` middleware.\n\nFor the migration, visit https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/js/#analytics-widget") ;
  var cachedState = null;

  var serializeRefinements = function serializeRefinements(parameters) {
    var refinements = [];

    for (var parameter in parameters) {
      if (parameters.hasOwnProperty(parameter)) {
        var values = parameters[parameter].join('+');
        refinements.push("".concat(encodeURIComponent(parameter), "=").concat(encodeURIComponent(parameter), "_").concat(encodeURIComponent(values)));
      }
    }

    return refinements.join('&');
  };

  var serializeNumericRefinements = function serializeNumericRefinements(numericRefinements) {
    var refinements = [];

    for (var attribute in numericRefinements) {
      if (numericRefinements.hasOwnProperty(attribute)) {
        var filter = numericRefinements[attribute];

        if (filter.hasOwnProperty('>=') && filter.hasOwnProperty('<=')) {
          if (filter['>='] && filter['>='][0] === filter['<='] && filter['<='][0]) {
            refinements.push("".concat(attribute, "=").concat(attribute, "_").concat(filter['>=']));
          } else {
            refinements.push("".concat(attribute, "=").concat(attribute, "_").concat(filter['>='], "to").concat(filter['<=']));
          }
        } else if (filter.hasOwnProperty('>=')) {
          refinements.push("".concat(attribute, "=").concat(attribute, "_from").concat(filter['>=']));
        } else if (filter.hasOwnProperty('<=')) {
          refinements.push("".concat(attribute, "=").concat(attribute, "_to").concat(filter['<=']));
        } else if (filter.hasOwnProperty('=')) {
          var equals = [];

          for (var equal in filter['=']) {
            // eslint-disable-next-line max-depth
            if (filter['='].hasOwnProperty(equal)) {
              // @ts-ignore somehow 'equal' is a string, even though it's a number?
              equals.push(filter['='][equal]);
            }
          }

          refinements.push("".concat(attribute, "=").concat(attribute, "_").concat(equals.join('-')));
        }
      }
    }

    return refinements.join('&');
  };

  var lastSentData = '';

  var sendAnalytics = function sendAnalytics(analyticsState) {
    if (analyticsState === null) {
      return;
    }

    var serializedParams = [];
    var serializedRefinements = serializeRefinements(_objectSpread$16(_objectSpread$16(_objectSpread$16({}, analyticsState.state.disjunctiveFacetsRefinements), analyticsState.state.facetsRefinements), analyticsState.state.hierarchicalFacetsRefinements));
    var serializedNumericRefinements = serializeNumericRefinements(analyticsState.state.numericRefinements);

    if (serializedRefinements !== '') {
      serializedParams.push(serializedRefinements);
    }

    if (serializedNumericRefinements !== '') {
      serializedParams.push(serializedNumericRefinements);
    }

    var stringifiedParams = serializedParams.join('&');
    var dataToSend = "Query: ".concat(analyticsState.state.query || '', ", ").concat(stringifiedParams);

    if (pushPagination === true) {
      dataToSend += ", Page: ".concat(analyticsState.state.page || 0);
    }

    if (lastSentData !== dataToSend) {
      pushFunction(stringifiedParams, analyticsState.state, analyticsState.results);
      lastSentData = dataToSend;
    }
  };

  var pushTimeout;
  var isInitialSearch = true;

  if (pushInitialSearch === true) {
    isInitialSearch = false;
  }

  var onClick = function onClick() {
    sendAnalytics(cachedState);
  };

  var onUnload = function onUnload() {
    sendAnalytics(cachedState);
  };

  return {
    $$type: 'ais.analytics',
    $$widgetType: 'ais.analytics',
    init: function init() {
      if (triggerOnUIInteraction === true) {
        document.addEventListener('click', onClick);
        window.addEventListener('beforeunload', onUnload);
      }
    },
    render: function render(_ref2) {
      var results = _ref2.results,
          state = _ref2.state;

      if (isInitialSearch === true) {
        isInitialSearch = false;
        return;
      }

      cachedState = {
        results: results,
        state: state
      };

      if (pushTimeout) {
        clearTimeout(pushTimeout);
      }

      pushTimeout = window.setTimeout(function () {
        return sendAnalytics(cachedState);
      }, delay);
    },
    dispose: function dispose() {
      if (triggerOnUIInteraction === true) {
        document.removeEventListener('click', onClick);
        window.removeEventListener('beforeunload', onUnload);
      }
    },
    getRenderState: function getRenderState(renderState, renderOptions) {
      return _objectSpread$16(_objectSpread$16({}, renderState), {}, {
        analytics: this.getWidgetRenderState(renderOptions)
      });
    },
    getWidgetRenderState: function getWidgetRenderState() {
      return {
        widgetParams: widgetParams
      };
    }
  };
};

var analytics$1 = analytics;

var n$1,l$1,u$1,t$2,o$1,f$1={},e$2=[],c$1=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;function s(n,l){for(var u in l)n[u]=l[u];return n}function a$1(n){var l=n.parentNode;l&&l.removeChild(n);}function h$1(l,u,i){var t,o,r,f={};for(r in u)"key"==r?t=u[r]:"ref"==r?o=u[r]:f[r]=u[r];if(arguments.length>2&&(f.children=arguments.length>3?n$1.call(arguments,2):i),"function"==typeof l&&null!=l.defaultProps)for(r in l.defaultProps)void 0===f[r]&&(f[r]=l.defaultProps[r]);return v$1(l,f,t,o,null)}function v$1(n,i,t,o,r){var f={type:n,props:i,key:t,ref:o,__k:null,__:null,__b:0,__e:null,__d:void 0,__c:null,__h:null,constructor:void 0,__v:null==r?++u$1:r};return null==r&&null!=l$1.vnode&&l$1.vnode(f),f}function y$1(){return {current:null}}function p$1(n){return n.children}function d$1(n,l){this.props=n,this.context=l;}function _$1(n,l){if(null==l)return n.__?_$1(n.__,n.__.__k.indexOf(n)+1):null;for(var u;l<n.__k.length;l++)if(null!=(u=n.__k[l])&&null!=u.__e)return u.__e;return "function"==typeof n.type?_$1(n):null}function k$1(n){var l,u;if(null!=(n=n.__)&&null!=n.__c){for(n.__e=n.__c.base=null,l=0;l<n.__k.length;l++)if(null!=(u=n.__k[l])&&null!=u.__e){n.__e=n.__c.base=u.__e;break}return k$1(n)}}function b$1(n){(!n.__d&&(n.__d=!0)&&t$2.push(n)&&!g$1.__r++||o$1!==l$1.debounceRendering)&&((o$1=l$1.debounceRendering)||setTimeout)(g$1);}function g$1(){for(var n;g$1.__r=t$2.length;)n=t$2.sort(function(n,l){return n.__v.__b-l.__v.__b}),t$2=[],n.some(function(n){var l,u,i,t,o,r;n.__d&&(o=(t=(l=n).__v).__e,(r=l.__P)&&(u=[],(i=s({},t)).__v=t.__v+1,j$1(r,t,i,l.__n,void 0!==r.ownerSVGElement,null!=t.__h?[o]:null,u,null==o?_$1(t):o,t.__h),z$1(u,t),t.__e!=o&&k$1(t)));});}function w$1(n,l,u,i,t,o,r,c,s,a){var h,y,d,k,b,g,w,x=i&&i.__k||e$2,C=x.length;for(u.__k=[],h=0;h<l.length;h++)if(null!=(k=u.__k[h]=null==(k=l[h])||"boolean"==typeof k?null:"string"==typeof k||"number"==typeof k||"bigint"==typeof k?v$1(null,k,null,null,k):Array.isArray(k)?v$1(p$1,{children:k},null,null,null):k.__b>0?v$1(k.type,k.props,k.key,k.ref?k.ref:null,k.__v):k)){if(k.__=u,k.__b=u.__b+1,null===(d=x[h])||d&&k.key==d.key&&k.type===d.type)x[h]=void 0;else for(y=0;y<C;y++){if((d=x[y])&&k.key==d.key&&k.type===d.type){x[y]=void 0;break}d=null;}j$1(n,k,d=d||f$1,t,o,r,c,s,a),b=k.__e,(y=k.ref)&&d.ref!=y&&(w||(w=[]),d.ref&&w.push(d.ref,null,k),w.push(y,k.__c||b,k)),null!=b?(null==g&&(g=b),"function"==typeof k.type&&k.__k===d.__k?k.__d=s=m$2(k,s,n):s=A(n,k,d,x,b,s),"function"==typeof u.type&&(u.__d=s)):s&&d.__e==s&&s.parentNode!=n&&(s=_$1(d));}for(u.__e=g,h=C;h--;)null!=x[h]&&N(x[h],x[h]);if(w)for(h=0;h<w.length;h++)M(w[h],w[++h],w[++h]);}function m$2(n,l,u){for(var i,t=n.__k,o=0;t&&o<t.length;o++)(i=t[o])&&(i.__=n,l="function"==typeof i.type?m$2(i,l,u):A(u,i,i,t,i.__e,l));return l}function A(n,l,u,i,t,o){var r,f,e;if(void 0!==l.__d)r=l.__d,l.__d=void 0;else if(null==u||t!=o||null==t.parentNode)n:if(null==o||o.parentNode!==n)n.appendChild(t),r=null;else {for(f=o,e=0;(f=f.nextSibling)&&e<i.length;e+=1)if(f==t)break n;n.insertBefore(t,o),r=o;}return void 0!==r?r:t.nextSibling}function C(n,l,u,i,t){var o;for(o in u)"children"===o||"key"===o||o in l||H(n,o,null,u[o],i);for(o in l)t&&"function"!=typeof l[o]||"children"===o||"key"===o||"value"===o||"checked"===o||u[o]===l[o]||H(n,o,l[o],u[o],i);}function $(n,l,u){"-"===l[0]?n.setProperty(l,u):n[l]=null==u?"":"number"!=typeof u||c$1.test(l)?u:u+"px";}function H(n,l,u,i,t){var o;n:if("style"===l)if("string"==typeof u)n.style.cssText=u;else {if("string"==typeof i&&(n.style.cssText=i=""),i)for(l in i)u&&l in u||$(n.style,l,"");if(u)for(l in u)i&&u[l]===i[l]||$(n.style,l,u[l]);}else if("o"===l[0]&&"n"===l[1])o=l!==(l=l.replace(/Capture$/,"")),l=l.toLowerCase()in n?l.toLowerCase().slice(2):l.slice(2),n.l||(n.l={}),n.l[l+o]=u,u?i||n.addEventListener(l,o?T:I,o):n.removeEventListener(l,o?T:I,o);else if("dangerouslySetInnerHTML"!==l){if(t)l=l.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if("href"!==l&&"list"!==l&&"form"!==l&&"tabIndex"!==l&&"download"!==l&&l in n)try{n[l]=null==u?"":u;break n}catch(n){}"function"==typeof u||(null==u||!1===u&&-1==l.indexOf("-")?n.removeAttribute(l):n.setAttribute(l,u));}}function I(n){this.l[n.type+!1](l$1.event?l$1.event(n):n);}function T(n){this.l[n.type+!0](l$1.event?l$1.event(n):n);}function j$1(n,u,i,t,o,r,f,e,c){var a,h,v,y,_,k,b,g,m,x,A,C,$,H,I,T=u.type;if(void 0!==u.constructor)return null;null!=i.__h&&(c=i.__h,e=u.__e=i.__e,u.__h=null,r=[e]),(a=l$1.__b)&&a(u);try{n:if("function"==typeof T){if(g=u.props,m=(a=T.contextType)&&t[a.__c],x=a?m?m.props.value:a.__:t,i.__c?b=(h=u.__c=i.__c).__=h.__E:("prototype"in T&&T.prototype.render?u.__c=h=new T(g,x):(u.__c=h=new d$1(g,x),h.constructor=T,h.render=O),m&&m.sub(h),h.props=g,h.state||(h.state={}),h.context=x,h.__n=t,v=h.__d=!0,h.__h=[],h._sb=[]),null==h.__s&&(h.__s=h.state),null!=T.getDerivedStateFromProps&&(h.__s==h.state&&(h.__s=s({},h.__s)),s(h.__s,T.getDerivedStateFromProps(g,h.__s))),y=h.props,_=h.state,v)null==T.getDerivedStateFromProps&&null!=h.componentWillMount&&h.componentWillMount(),null!=h.componentDidMount&&h.__h.push(h.componentDidMount);else {if(null==T.getDerivedStateFromProps&&g!==y&&null!=h.componentWillReceiveProps&&h.componentWillReceiveProps(g,x),!h.__e&&null!=h.shouldComponentUpdate&&!1===h.shouldComponentUpdate(g,h.__s,x)||u.__v===i.__v){for(h.props=g,h.state=h.__s,u.__v!==i.__v&&(h.__d=!1),h.__v=u,u.__e=i.__e,u.__k=i.__k,u.__k.forEach(function(n){n&&(n.__=u);}),A=0;A<h._sb.length;A++)h.__h.push(h._sb[A]);h._sb=[],h.__h.length&&f.push(h);break n}null!=h.componentWillUpdate&&h.componentWillUpdate(g,h.__s,x),null!=h.componentDidUpdate&&h.__h.push(function(){h.componentDidUpdate(y,_,k);});}if(h.context=x,h.props=g,h.__v=u,h.__P=n,C=l$1.__r,$=0,"prototype"in T&&T.prototype.render){for(h.state=h.__s,h.__d=!1,C&&C(u),a=h.render(h.props,h.state,h.context),H=0;H<h._sb.length;H++)h.__h.push(h._sb[H]);h._sb=[];}else do{h.__d=!1,C&&C(u),a=h.render(h.props,h.state,h.context),h.state=h.__s;}while(h.__d&&++$<25);h.state=h.__s,null!=h.getChildContext&&(t=s(s({},t),h.getChildContext())),v||null==h.getSnapshotBeforeUpdate||(k=h.getSnapshotBeforeUpdate(y,_)),I=null!=a&&a.type===p$1&&null==a.key?a.props.children:a,w$1(n,Array.isArray(I)?I:[I],u,i,t,o,r,f,e,c),h.base=u.__e,u.__h=null,h.__h.length&&f.push(h),b&&(h.__E=h.__=null),h.__e=!1;}else null==r&&u.__v===i.__v?(u.__k=i.__k,u.__e=i.__e):u.__e=L(i.__e,u,i,t,o,r,f,c);(a=l$1.diffed)&&a(u);}catch(n){u.__v=null,(c||null!=r)&&(u.__e=e,u.__h=!!c,r[r.indexOf(e)]=null),l$1.__e(n,u,i);}}function z$1(n,u){l$1.__c&&l$1.__c(u,n),n.some(function(u){try{n=u.__h,u.__h=[],n.some(function(n){n.call(u);});}catch(n){l$1.__e(n,u.__v);}});}function L(l,u,i,t,o,r,e,c){var s,h,v,y=i.props,p=u.props,d=u.type,k=0;if("svg"===d&&(o=!0),null!=r)for(;k<r.length;k++)if((s=r[k])&&"setAttribute"in s==!!d&&(d?s.localName===d:3===s.nodeType)){l=s,r[k]=null;break}if(null==l){if(null===d)return document.createTextNode(p);l=o?document.createElementNS("http://www.w3.org/2000/svg",d):document.createElement(d,p.is&&p),r=null,c=!1;}if(null===d)y===p||c&&l.data===p||(l.data=p);else {if(r=r&&n$1.call(l.childNodes),h=(y=i.props||f$1).dangerouslySetInnerHTML,v=p.dangerouslySetInnerHTML,!c){if(null!=r)for(y={},k=0;k<l.attributes.length;k++)y[l.attributes[k].name]=l.attributes[k].value;(v||h)&&(v&&(h&&v.__html==h.__html||v.__html===l.innerHTML)||(l.innerHTML=v&&v.__html||""));}if(C(l,p,y,o,c),v)u.__k=[];else if(k=u.props.children,w$1(l,Array.isArray(k)?k:[k],u,i,t,o&&"foreignObject"!==d,r,e,r?r[0]:i.__k&&_$1(i,0),c),null!=r)for(k=r.length;k--;)null!=r[k]&&a$1(r[k]);c||("value"in p&&void 0!==(k=p.value)&&(k!==l.value||"progress"===d&&!k||"option"===d&&k!==y.value)&&H(l,"value",k,y.value,!1),"checked"in p&&void 0!==(k=p.checked)&&k!==l.checked&&H(l,"checked",k,y.checked,!1));}return l}function M(n,u,i){try{"function"==typeof n?n(u):n.current=u;}catch(n){l$1.__e(n,i);}}function N(n,u,i){var t,o;if(l$1.unmount&&l$1.unmount(n),(t=n.ref)&&(t.current&&t.current!==n.__e||M(t,null,u)),null!=(t=n.__c)){if(t.componentWillUnmount)try{t.componentWillUnmount();}catch(n){l$1.__e(n,u);}t.base=t.__P=null,n.__c=void 0;}if(t=n.__k)for(o=0;o<t.length;o++)t[o]&&N(t[o],u,i||"function"!=typeof n.type);i||null==n.__e||a$1(n.__e),n.__=n.__e=n.__d=void 0;}function O(n,l,u){return this.constructor(n,u)}function P(u,i,t){var o,r,e;l$1.__&&l$1.__(u,i),r=(o="function"==typeof t)?null:t&&t.__k||i.__k,e=[],j$1(i,u=(!o&&t||i).__k=h$1(p$1,null,[u]),r||f$1,f$1,void 0!==i.ownerSVGElement,!o&&t?[t]:r?null:i.firstChild?n$1.call(i.childNodes):null,e,!o&&t?t:r?r.__e:i.firstChild,o),z$1(e,u);}n$1=e$2.slice,l$1={__e:function(n,l,u,i){for(var t,o,r;l=l.__;)if((t=l.__c)&&!t.__)try{if((o=t.constructor)&&null!=o.getDerivedStateFromError&&(t.setState(o.getDerivedStateFromError(n)),r=t.__d),null!=t.componentDidCatch&&(t.componentDidCatch(n,i||{}),r=t.__d),r)return t.__E=t}catch(l){n=l;}throw n}},u$1=0,d$1.prototype.setState=function(n,l){var u;u=null!=this.__s&&this.__s!==this.state?this.__s:this.__s=s({},this.state),"function"==typeof n&&(n=n(s({},u),this.props)),n&&s(u,n),null!=n&&this.__v&&(l&&this._sb.push(l),b$1(this));},d$1.prototype.forceUpdate=function(n){this.__v&&(this.__e=!0,n&&this.__h.push(n),b$1(this));},d$1.prototype.render=p$1,t$2=[],g$1.__r=0;

function cx() {
  for (var _len = arguments.length, cssClasses = new Array(_len), _key = 0; _key < _len; _key++) {
    cssClasses[_key] = arguments[_key];
  }

  return cssClasses.reduce(function (acc, className) {
    if (Array.isArray(className)) {
      return acc.concat(className);
    }

    return acc.concat([className]);
  }, []).filter(Boolean).join(' ');
}

function ownKeys$15(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$15(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$15(Object(source), true).forEach(function (key) { _defineProperty$1c(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$15(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$1c(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray$8(arr) { return _arrayWithoutHoles$8(arr) || _iterableToArray$8(arr) || _unsupportedIterableToArray$h(arr) || _nonIterableSpread$8(); }

function _nonIterableSpread$8() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray$h(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$h(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$h(o, minLen); }

function _iterableToArray$8(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles$8(arr) { if (Array.isArray(arr)) return _arrayLikeToArray$h(arr); }

function _arrayLikeToArray$h(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function prepareTemplates( // can not use = {} here, since the template could have different constraints
defaultTemplates) {
  var templates = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var allKeys = uniq([].concat(_toConsumableArray$8(Object.keys(defaultTemplates || {})), _toConsumableArray$8(Object.keys(templates))));
  return allKeys.reduce(function (config, key) {
    var defaultTemplate = defaultTemplates ? defaultTemplates[key] : undefined;
    var customTemplate = templates[key];
    var isCustomTemplate = customTemplate !== undefined && customTemplate !== defaultTemplate;
    config.templates[key] = isCustomTemplate ? customTemplate // typescript doesn't recognize that this condition asserts customTemplate is defined
    : defaultTemplate;
    config.useCustomCompileOptions[key] = isCustomTemplate;
    return config;
  }, {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    templates: {},
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    useCustomCompileOptions: {}
  });
}
/**
 * Prepares an object to be passed to the Template widget
 */


function prepareTemplateProps(_ref) {
  var defaultTemplates = _ref.defaultTemplates,
      templates = _ref.templates,
      templatesConfig = _ref.templatesConfig;
  var preparedTemplates = prepareTemplates(defaultTemplates, templates);
  return _objectSpread$15({
    templatesConfig: templatesConfig
  }, preparedTemplates);
}

var compiler = {};

/*
 *  Copyright 2011 Twitter, Inc.
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

(function (exports) {
	(function (Hogan) {
	  // Setup regex  assignments
	  // remove whitespace according to Mustache spec
	  var rIsWhitespace = /\S/,
	      rQuot = /\"/g,
	      rNewline =  /\n/g,
	      rCr = /\r/g,
	      rSlash = /\\/g,
	      rLineSep = /\u2028/,
	      rParagraphSep = /\u2029/;

	  Hogan.tags = {
	    '#': 1, '^': 2, '<': 3, '$': 4,
	    '/': 5, '!': 6, '>': 7, '=': 8, '_v': 9,
	    '{': 10, '&': 11, '_t': 12
	  };

	  Hogan.scan = function scan(text, delimiters) {
	    var len = text.length,
	        IN_TEXT = 0,
	        IN_TAG_TYPE = 1,
	        IN_TAG = 2,
	        state = IN_TEXT,
	        tagType = null,
	        tag = null,
	        buf = '',
	        tokens = [],
	        seenTag = false,
	        i = 0,
	        lineStart = 0,
	        otag = '{{',
	        ctag = '}}';

	    function addBuf() {
	      if (buf.length > 0) {
	        tokens.push({tag: '_t', text: new String(buf)});
	        buf = '';
	      }
	    }

	    function lineIsWhitespace() {
	      var isAllWhitespace = true;
	      for (var j = lineStart; j < tokens.length; j++) {
	        isAllWhitespace =
	          (Hogan.tags[tokens[j].tag] < Hogan.tags['_v']) ||
	          (tokens[j].tag == '_t' && tokens[j].text.match(rIsWhitespace) === null);
	        if (!isAllWhitespace) {
	          return false;
	        }
	      }

	      return isAllWhitespace;
	    }

	    function filterLine(haveSeenTag, noNewLine) {
	      addBuf();

	      if (haveSeenTag && lineIsWhitespace()) {
	        for (var j = lineStart, next; j < tokens.length; j++) {
	          if (tokens[j].text) {
	            if ((next = tokens[j+1]) && next.tag == '>') {
	              // set indent to token value
	              next.indent = tokens[j].text.toString();
	            }
	            tokens.splice(j, 1);
	          }
	        }
	      } else if (!noNewLine) {
	        tokens.push({tag:'\n'});
	      }

	      seenTag = false;
	      lineStart = tokens.length;
	    }

	    function changeDelimiters(text, index) {
	      var close = '=' + ctag,
	          closeIndex = text.indexOf(close, index),
	          delimiters = trim(
	            text.substring(text.indexOf('=', index) + 1, closeIndex)
	          ).split(' ');

	      otag = delimiters[0];
	      ctag = delimiters[delimiters.length - 1];

	      return closeIndex + close.length - 1;
	    }

	    if (delimiters) {
	      delimiters = delimiters.split(' ');
	      otag = delimiters[0];
	      ctag = delimiters[1];
	    }

	    for (i = 0; i < len; i++) {
	      if (state == IN_TEXT) {
	        if (tagChange(otag, text, i)) {
	          --i;
	          addBuf();
	          state = IN_TAG_TYPE;
	        } else {
	          if (text.charAt(i) == '\n') {
	            filterLine(seenTag);
	          } else {
	            buf += text.charAt(i);
	          }
	        }
	      } else if (state == IN_TAG_TYPE) {
	        i += otag.length - 1;
	        tag = Hogan.tags[text.charAt(i + 1)];
	        tagType = tag ? text.charAt(i + 1) : '_v';
	        if (tagType == '=') {
	          i = changeDelimiters(text, i);
	          state = IN_TEXT;
	        } else {
	          if (tag) {
	            i++;
	          }
	          state = IN_TAG;
	        }
	        seenTag = i;
	      } else {
	        if (tagChange(ctag, text, i)) {
	          tokens.push({tag: tagType, n: trim(buf), otag: otag, ctag: ctag,
	                       i: (tagType == '/') ? seenTag - otag.length : i + ctag.length});
	          buf = '';
	          i += ctag.length - 1;
	          state = IN_TEXT;
	          if (tagType == '{') {
	            if (ctag == '}}') {
	              i++;
	            } else {
	              cleanTripleStache(tokens[tokens.length - 1]);
	            }
	          }
	        } else {
	          buf += text.charAt(i);
	        }
	      }
	    }

	    filterLine(seenTag, true);

	    return tokens;
	  };

	  function cleanTripleStache(token) {
	    if (token.n.substr(token.n.length - 1) === '}') {
	      token.n = token.n.substring(0, token.n.length - 1);
	    }
	  }

	  function trim(s) {
	    if (s.trim) {
	      return s.trim();
	    }

	    return s.replace(/^\s*|\s*$/g, '');
	  }

	  function tagChange(tag, text, index) {
	    if (text.charAt(index) != tag.charAt(0)) {
	      return false;
	    }

	    for (var i = 1, l = tag.length; i < l; i++) {
	      if (text.charAt(index + i) != tag.charAt(i)) {
	        return false;
	      }
	    }

	    return true;
	  }

	  // the tags allowed inside super templates
	  var allowedInSuper = {'_t': true, '\n': true, '$': true, '/': true};

	  function buildTree(tokens, kind, stack, customTags) {
	    var instructions = [],
	        opener = null,
	        tail = null,
	        token = null;

	    tail = stack[stack.length - 1];

	    while (tokens.length > 0) {
	      token = tokens.shift();

	      if (tail && tail.tag == '<' && !(token.tag in allowedInSuper)) {
	        throw new Error('Illegal content in < super tag.');
	      }

	      if (Hogan.tags[token.tag] <= Hogan.tags['$'] || isOpener(token, customTags)) {
	        stack.push(token);
	        token.nodes = buildTree(tokens, token.tag, stack, customTags);
	      } else if (token.tag == '/') {
	        if (stack.length === 0) {
	          throw new Error('Closing tag without opener: /' + token.n);
	        }
	        opener = stack.pop();
	        if (token.n != opener.n && !isCloser(token.n, opener.n, customTags)) {
	          throw new Error('Nesting error: ' + opener.n + ' vs. ' + token.n);
	        }
	        opener.end = token.i;
	        return instructions;
	      } else if (token.tag == '\n') {
	        token.last = (tokens.length == 0) || (tokens[0].tag == '\n');
	      }

	      instructions.push(token);
	    }

	    if (stack.length > 0) {
	      throw new Error('missing closing tag: ' + stack.pop().n);
	    }

	    return instructions;
	  }

	  function isOpener(token, tags) {
	    for (var i = 0, l = tags.length; i < l; i++) {
	      if (tags[i].o == token.n) {
	        token.tag = '#';
	        return true;
	      }
	    }
	  }

	  function isCloser(close, open, tags) {
	    for (var i = 0, l = tags.length; i < l; i++) {
	      if (tags[i].c == close && tags[i].o == open) {
	        return true;
	      }
	    }
	  }

	  function stringifySubstitutions(obj) {
	    var items = [];
	    for (var key in obj) {
	      items.push('"' + esc(key) + '": function(c,p,t,i) {' + obj[key] + '}');
	    }
	    return "{ " + items.join(",") + " }";
	  }

	  function stringifyPartials(codeObj) {
	    var partials = [];
	    for (var key in codeObj.partials) {
	      partials.push('"' + esc(key) + '":{name:"' + esc(codeObj.partials[key].name) + '", ' + stringifyPartials(codeObj.partials[key]) + "}");
	    }
	    return "partials: {" + partials.join(",") + "}, subs: " + stringifySubstitutions(codeObj.subs);
	  }

	  Hogan.stringify = function(codeObj, text, options) {
	    return "{code: function (c,p,i) { " + Hogan.wrapMain(codeObj.code) + " }," + stringifyPartials(codeObj) +  "}";
	  };

	  var serialNo = 0;
	  Hogan.generate = function(tree, text, options) {
	    serialNo = 0;
	    var context = { code: '', subs: {}, partials: {} };
	    Hogan.walk(tree, context);

	    if (options.asString) {
	      return this.stringify(context, text, options);
	    }

	    return this.makeTemplate(context, text, options);
	  };

	  Hogan.wrapMain = function(code) {
	    return 'var t=this;t.b(i=i||"");' + code + 'return t.fl();';
	  };

	  Hogan.template = Hogan.Template;

	  Hogan.makeTemplate = function(codeObj, text, options) {
	    var template = this.makePartials(codeObj);
	    template.code = new Function('c', 'p', 'i', this.wrapMain(codeObj.code));
	    return new this.template(template, text, this, options);
	  };

	  Hogan.makePartials = function(codeObj) {
	    var key, template = {subs: {}, partials: codeObj.partials, name: codeObj.name};
	    for (key in template.partials) {
	      template.partials[key] = this.makePartials(template.partials[key]);
	    }
	    for (key in codeObj.subs) {
	      template.subs[key] = new Function('c', 'p', 't', 'i', codeObj.subs[key]);
	    }
	    return template;
	  };

	  function esc(s) {
	    return s.replace(rSlash, '\\\\')
	            .replace(rQuot, '\\\"')
	            .replace(rNewline, '\\n')
	            .replace(rCr, '\\r')
	            .replace(rLineSep, '\\u2028')
	            .replace(rParagraphSep, '\\u2029');
	  }

	  function chooseMethod(s) {
	    return (~s.indexOf('.')) ? 'd' : 'f';
	  }

	  function createPartial(node, context) {
	    var prefix = "<" + (context.prefix || "");
	    var sym = prefix + node.n + serialNo++;
	    context.partials[sym] = {name: node.n, partials: {}};
	    context.code += 't.b(t.rp("' +  esc(sym) + '",c,p,"' + (node.indent || '') + '"));';
	    return sym;
	  }

	  Hogan.codegen = {
	    '#': function(node, context) {
	      context.code += 'if(t.s(t.' + chooseMethod(node.n) + '("' + esc(node.n) + '",c,p,1),' +
	                      'c,p,0,' + node.i + ',' + node.end + ',"' + node.otag + " " + node.ctag + '")){' +
	                      't.rs(c,p,' + 'function(c,p,t){';
	      Hogan.walk(node.nodes, context);
	      context.code += '});c.pop();}';
	    },

	    '^': function(node, context) {
	      context.code += 'if(!t.s(t.' + chooseMethod(node.n) + '("' + esc(node.n) + '",c,p,1),c,p,1,0,0,"")){';
	      Hogan.walk(node.nodes, context);
	      context.code += '};';
	    },

	    '>': createPartial,
	    '<': function(node, context) {
	      var ctx = {partials: {}, code: '', subs: {}, inPartial: true};
	      Hogan.walk(node.nodes, ctx);
	      var template = context.partials[createPartial(node, context)];
	      template.subs = ctx.subs;
	      template.partials = ctx.partials;
	    },

	    '$': function(node, context) {
	      var ctx = {subs: {}, code: '', partials: context.partials, prefix: node.n};
	      Hogan.walk(node.nodes, ctx);
	      context.subs[node.n] = ctx.code;
	      if (!context.inPartial) {
	        context.code += 't.sub("' + esc(node.n) + '",c,p,i);';
	      }
	    },

	    '\n': function(node, context) {
	      context.code += write('"\\n"' + (node.last ? '' : ' + i'));
	    },

	    '_v': function(node, context) {
	      context.code += 't.b(t.v(t.' + chooseMethod(node.n) + '("' + esc(node.n) + '",c,p,0)));';
	    },

	    '_t': function(node, context) {
	      context.code += write('"' + esc(node.text) + '"');
	    },

	    '{': tripleStache,

	    '&': tripleStache
	  };

	  function tripleStache(node, context) {
	    context.code += 't.b(t.t(t.' + chooseMethod(node.n) + '("' + esc(node.n) + '",c,p,0)));';
	  }

	  function write(s) {
	    return 't.b(' + s + ');';
	  }

	  Hogan.walk = function(nodelist, context) {
	    var func;
	    for (var i = 0, l = nodelist.length; i < l; i++) {
	      func = Hogan.codegen[nodelist[i].tag];
	      func && func(nodelist[i], context);
	    }
	    return context;
	  };

	  Hogan.parse = function(tokens, text, options) {
	    options = options || {};
	    return buildTree(tokens, '', [], options.sectionTags || []);
	  };

	  Hogan.cache = {};

	  Hogan.cacheKey = function(text, options) {
	    return [text, !!options.asString, !!options.disableLambda, options.delimiters, !!options.modelGet].join('||');
	  };

	  Hogan.compile = function(text, options) {
	    options = options || {};
	    var key = Hogan.cacheKey(text, options);
	    var template = this.cache[key];

	    if (template) {
	      var partials = template.partials;
	      for (var name in partials) {
	        delete partials[name].instance;
	      }
	      return template;
	    }

	    template = this.generate(this.parse(this.scan(text, options.delimiters), text, options), text, options);
	    return this.cache[key] = template;
	  };
	})(exports );
} (compiler));

var template = {};

/*
 *  Copyright 2011 Twitter, Inc.
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

(function (exports) {

	(function (Hogan) {
	  Hogan.Template = function (codeObj, text, compiler, options) {
	    codeObj = codeObj || {};
	    this.r = codeObj.code || this.r;
	    this.c = compiler;
	    this.options = options || {};
	    this.text = text || '';
	    this.partials = codeObj.partials || {};
	    this.subs = codeObj.subs || {};
	    this.buf = '';
	  };

	  Hogan.Template.prototype = {
	    // render: replaced by generated code.
	    r: function (context, partials, indent) { return ''; },

	    // variable escaping
	    v: hoganEscape,

	    // triple stache
	    t: coerceToString,

	    render: function render(context, partials, indent) {
	      return this.ri([context], partials || {}, indent);
	    },

	    // render internal -- a hook for overrides that catches partials too
	    ri: function (context, partials, indent) {
	      return this.r(context, partials, indent);
	    },

	    // ensurePartial
	    ep: function(symbol, partials) {
	      var partial = this.partials[symbol];

	      // check to see that if we've instantiated this partial before
	      var template = partials[partial.name];
	      if (partial.instance && partial.base == template) {
	        return partial.instance;
	      }

	      if (typeof template == 'string') {
	        if (!this.c) {
	          throw new Error("No compiler available.");
	        }
	        template = this.c.compile(template, this.options);
	      }

	      if (!template) {
	        return null;
	      }

	      // We use this to check whether the partials dictionary has changed
	      this.partials[symbol].base = template;

	      if (partial.subs) {
	        // Make sure we consider parent template now
	        if (!partials.stackText) partials.stackText = {};
	        for (key in partial.subs) {
	          if (!partials.stackText[key]) {
	            partials.stackText[key] = (this.activeSub !== undefined && partials.stackText[this.activeSub]) ? partials.stackText[this.activeSub] : this.text;
	          }
	        }
	        template = createSpecializedPartial(template, partial.subs, partial.partials,
	          this.stackSubs, this.stackPartials, partials.stackText);
	      }
	      this.partials[symbol].instance = template;

	      return template;
	    },

	    // tries to find a partial in the current scope and render it
	    rp: function(symbol, context, partials, indent) {
	      var partial = this.ep(symbol, partials);
	      if (!partial) {
	        return '';
	      }

	      return partial.ri(context, partials, indent);
	    },

	    // render a section
	    rs: function(context, partials, section) {
	      var tail = context[context.length - 1];

	      if (!isArray(tail)) {
	        section(context, partials, this);
	        return;
	      }

	      for (var i = 0; i < tail.length; i++) {
	        context.push(tail[i]);
	        section(context, partials, this);
	        context.pop();
	      }
	    },

	    // maybe start a section
	    s: function(val, ctx, partials, inverted, start, end, tags) {
	      var pass;

	      if (isArray(val) && val.length === 0) {
	        return false;
	      }

	      if (typeof val == 'function') {
	        val = this.ms(val, ctx, partials, inverted, start, end, tags);
	      }

	      pass = !!val;

	      if (!inverted && pass && ctx) {
	        ctx.push((typeof val == 'object') ? val : ctx[ctx.length - 1]);
	      }

	      return pass;
	    },

	    // find values with dotted names
	    d: function(key, ctx, partials, returnFound) {
	      var found,
	          names = key.split('.'),
	          val = this.f(names[0], ctx, partials, returnFound),
	          doModelGet = this.options.modelGet,
	          cx = null;

	      if (key === '.' && isArray(ctx[ctx.length - 2])) {
	        val = ctx[ctx.length - 1];
	      } else {
	        for (var i = 1; i < names.length; i++) {
	          found = findInScope(names[i], val, doModelGet);
	          if (found !== undefined) {
	            cx = val;
	            val = found;
	          } else {
	            val = '';
	          }
	        }
	      }

	      if (returnFound && !val) {
	        return false;
	      }

	      if (!returnFound && typeof val == 'function') {
	        ctx.push(cx);
	        val = this.mv(val, ctx, partials);
	        ctx.pop();
	      }

	      return val;
	    },

	    // find values with normal names
	    f: function(key, ctx, partials, returnFound) {
	      var val = false,
	          v = null,
	          found = false,
	          doModelGet = this.options.modelGet;

	      for (var i = ctx.length - 1; i >= 0; i--) {
	        v = ctx[i];
	        val = findInScope(key, v, doModelGet);
	        if (val !== undefined) {
	          found = true;
	          break;
	        }
	      }

	      if (!found) {
	        return (returnFound) ? false : "";
	      }

	      if (!returnFound && typeof val == 'function') {
	        val = this.mv(val, ctx, partials);
	      }

	      return val;
	    },

	    // higher order templates
	    ls: function(func, cx, partials, text, tags) {
	      var oldTags = this.options.delimiters;

	      this.options.delimiters = tags;
	      this.b(this.ct(coerceToString(func.call(cx, text)), cx, partials));
	      this.options.delimiters = oldTags;

	      return false;
	    },

	    // compile text
	    ct: function(text, cx, partials) {
	      if (this.options.disableLambda) {
	        throw new Error('Lambda features disabled.');
	      }
	      return this.c.compile(text, this.options).render(cx, partials);
	    },

	    // template result buffering
	    b: function(s) { this.buf += s; },

	    fl: function() { var r = this.buf; this.buf = ''; return r; },

	    // method replace section
	    ms: function(func, ctx, partials, inverted, start, end, tags) {
	      var textSource,
	          cx = ctx[ctx.length - 1],
	          result = func.call(cx);

	      if (typeof result == 'function') {
	        if (inverted) {
	          return true;
	        } else {
	          textSource = (this.activeSub && this.subsText && this.subsText[this.activeSub]) ? this.subsText[this.activeSub] : this.text;
	          return this.ls(result, cx, partials, textSource.substring(start, end), tags);
	        }
	      }

	      return result;
	    },

	    // method replace variable
	    mv: function(func, ctx, partials) {
	      var cx = ctx[ctx.length - 1];
	      var result = func.call(cx);

	      if (typeof result == 'function') {
	        return this.ct(coerceToString(result.call(cx)), cx, partials);
	      }

	      return result;
	    },

	    sub: function(name, context, partials, indent) {
	      var f = this.subs[name];
	      if (f) {
	        this.activeSub = name;
	        f(context, partials, this, indent);
	        this.activeSub = false;
	      }
	    }

	  };

	  //Find a key in an object
	  function findInScope(key, scope, doModelGet) {
	    var val;

	    if (scope && typeof scope == 'object') {

	      if (scope[key] !== undefined) {
	        val = scope[key];

	      // try lookup with get for backbone or similar model data
	      } else if (doModelGet && scope.get && typeof scope.get == 'function') {
	        val = scope.get(key);
	      }
	    }

	    return val;
	  }

	  function createSpecializedPartial(instance, subs, partials, stackSubs, stackPartials, stackText) {
	    function PartialTemplate() {}	    PartialTemplate.prototype = instance;
	    function Substitutions() {}	    Substitutions.prototype = instance.subs;
	    var key;
	    var partial = new PartialTemplate();
	    partial.subs = new Substitutions();
	    partial.subsText = {};  //hehe. substext.
	    partial.buf = '';

	    stackSubs = stackSubs || {};
	    partial.stackSubs = stackSubs;
	    partial.subsText = stackText;
	    for (key in subs) {
	      if (!stackSubs[key]) stackSubs[key] = subs[key];
	    }
	    for (key in stackSubs) {
	      partial.subs[key] = stackSubs[key];
	    }

	    stackPartials = stackPartials || {};
	    partial.stackPartials = stackPartials;
	    for (key in partials) {
	      if (!stackPartials[key]) stackPartials[key] = partials[key];
	    }
	    for (key in stackPartials) {
	      partial.partials[key] = stackPartials[key];
	    }

	    return partial;
	  }

	  var rAmp = /&/g,
	      rLt = /</g,
	      rGt = />/g,
	      rApos = /\'/g,
	      rQuot = /\"/g,
	      hChars = /[&<>\"\']/;

	  function coerceToString(val) {
	    return String((val === null || val === undefined) ? '' : val);
	  }

	  function hoganEscape(str) {
	    str = coerceToString(str);
	    return hChars.test(str) ?
	      str
	        .replace(rAmp, '&amp;')
	        .replace(rLt, '&lt;')
	        .replace(rGt, '&gt;')
	        .replace(rApos, '&#39;')
	        .replace(rQuot, '&quot;') :
	      str;
	  }

	  var isArray = Array.isArray || function(a) {
	    return Object.prototype.toString.call(a) === '[object Array]';
	  };

	})(exports );
} (template));

/*
 *  Copyright 2011 Twitter, Inc.
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

// This file is for use with Node.js. See dist/ for browser files.

var Hogan = compiler;
Hogan.Template = template.Template;
Hogan.template = Hogan.Template;
var hogan = Hogan;

var hogan$1 = hogan;

var n=function(t,s,r,e){var u;s[0]=0;for(var h=1;h<s.length;h++){var p=s[h++],a=s[h]?(s[0]|=p?1:2,r[s[h++]]):s[++h];3===p?e[0]=a:4===p?e[1]=Object.assign(e[1]||{},a):5===p?(e[1]=e[1]||{})[s[++h]]=a:6===p?e[1][s[++h]]+=a+"":p?(u=t.apply(a,n(t,a,r,["",null])),e.push(u),a[0]?s[0]|=2:(s[h-2]=0,s[h]=u)):e.push(a);}return e},t$1=new Map;function e$1(s){var r=t$1.get(this);return r||(r=new Map,t$1.set(this,r)),(r=n(this,r.get(s)||(r.set(s,r=function(n){for(var t,s,r=1,e="",u="",h=[0],p=function(n){1===r&&(n||(e=e.replace(/^\s*\n\s*|\s*\n\s*$/g,"")))?h.push(0,n,e):3===r&&(n||e)?(h.push(3,n,e),r=2):2===r&&"..."===e&&n?h.push(4,n,0):2===r&&e&&!n?h.push(5,0,!0,e):r>=5&&((e||!n&&5===r)&&(h.push(r,0,e,s),r=6),n&&(h.push(r,n,0,s),r=6)),e="";},a=0;a<n.length;a++){a&&(1===r&&p(),p(a));for(var l=0;l<n[a].length;l++)t=n[a][l],1===r?"<"===t?(p(),h=[h],r=3):e+=t:4===r?"--"===e&&">"===t?(r=1,e=""):e=t+e[0]:u?t===u?u="":e+=t:'"'===t||"'"===t?u=t:">"===t?(p(),r=1):r&&("="===t?(r=5,s=e,e=""):"/"===t&&(r<5||">"===n[a][l+1])?(p(),3===r&&(h=h[0]),r=h,(h=h[0]).push(2,0,r),r=0):" "===t||"\t"===t||"\n"===t||"\r"===t?(p(),r=2):e+=t),3===r&&"!--"===e&&(r=4,h=h[0]);}return p(),h}(s)),r),arguments,[])).length>1?r:r[0]}

var m$1=e$1.bind(h$1);

function _extends$n() {
  _extends$n = Object.assign ? Object.assign.bind() : function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$n.apply(this, arguments);
}

function _objectWithoutPropertiesLoose$h(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}

function _objectWithoutProperties$h(source, excluded) {
  if (source == null) return {};
  var target = _objectWithoutPropertiesLoose$h(source, excluded);
  var key, i;
  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }
  return target;
}

var _excluded = ["parts", "highlightedTagName", "nonHighlightedTagName", "separator", "className", "classNames"];
// This is a minimal subset of the actual types from the `JSX` namespace.

function createHighlightPartComponent(_ref) {
  var createElement = _ref.createElement;
  return function HighlightPart(_ref2) {
    var classNames = _ref2.classNames,
        children = _ref2.children,
        highlightedTagName = _ref2.highlightedTagName,
        isHighlighted = _ref2.isHighlighted,
        nonHighlightedTagName = _ref2.nonHighlightedTagName;
    var TagName = isHighlighted ? highlightedTagName : nonHighlightedTagName;
    return createElement(TagName, {
      className: isHighlighted ? classNames.highlighted : classNames.nonHighlighted
    }, children);
  };
}

function createHighlightComponent(_ref3) {
  var createElement = _ref3.createElement,
      Fragment = _ref3.Fragment;
  var HighlightPart = createHighlightPartComponent({
    createElement: createElement,
    Fragment: Fragment
  });
  return function Highlight(_ref4) {
    var parts = _ref4.parts,
        _ref4$highlightedTagN = _ref4.highlightedTagName,
        highlightedTagName = _ref4$highlightedTagN === void 0 ? 'mark' : _ref4$highlightedTagN,
        _ref4$nonHighlightedT = _ref4.nonHighlightedTagName,
        nonHighlightedTagName = _ref4$nonHighlightedT === void 0 ? 'span' : _ref4$nonHighlightedT,
        _ref4$separator = _ref4.separator,
        separator = _ref4$separator === void 0 ? ', ' : _ref4$separator,
        className = _ref4.className,
        _ref4$classNames = _ref4.classNames,
        classNames = _ref4$classNames === void 0 ? {} : _ref4$classNames,
        props = _objectWithoutProperties$h(_ref4, _excluded);

    return createElement("span", _extends$n({}, props, {
      className: cx(classNames.root, className)
    }), parts.map(function (part, partIndex) {
      var isLastPart = partIndex === parts.length - 1;
      return createElement(Fragment, {
        key: partIndex
      }, part.map(function (subPart, subPartIndex) {
        return createElement(HighlightPart, {
          key: subPartIndex,
          classNames: classNames,
          highlightedTagName: highlightedTagName,
          nonHighlightedTagName: nonHighlightedTagName,
          isHighlighted: subPart.isHighlighted
        }, subPart.value);
      }), !isLastPart && createElement("span", {
        className: classNames.separator
      }, separator));
    }));
  };
}

var InternalHighlight = createHighlightComponent({
  createElement: h$1,
  Fragment: p$1
});

function _extends$m() { _extends$m = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$m.apply(this, arguments); }

function _objectWithoutProperties$g(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose$g(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose$g(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
function Highlight$1(_ref) {
  var _ref$classNames = _ref.classNames,
      classNames = _ref$classNames === void 0 ? {} : _ref$classNames,
      props = _objectWithoutProperties$g(_ref, ["classNames"]);

  return h$1(InternalHighlight, _extends$m({
    classNames: {
      root: cx('ais-Highlight', classNames.root),
      highlighted: cx('ais-Highlight-highlighted', classNames.highlighted),
      nonHighlighted: cx('ais-Highlight-nonHighlighted', classNames.nonHighlighted),
      separator: cx('ais-Highlight-separator', classNames.separator)
    }
  }, props));
}

function _extends$l() { _extends$l = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$l.apply(this, arguments); }

function _objectWithoutProperties$f(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose$f(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose$f(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
function Highlight(_ref) {
  var hit = _ref.hit,
      attribute = _ref.attribute,
      cssClasses = _ref.cssClasses,
      props = _objectWithoutProperties$f(_ref, ["hit", "attribute", "cssClasses"]);

  var property = getPropertyByPath(hit._highlightResult, attribute) || [];
  var properties = toArray(property);
  _warning(Boolean(properties.length), "Could not enable highlight for \"".concat(attribute.toString(), "\", will display an empty string.\nPlease check whether this attribute exists and is either searchable or specified in `attributesToHighlight`.\n\nSee: https://alg.li/highlighting\n")) ;
  var parts = properties.map(function (_ref2) {
    var value = _ref2.value;
    return getHighlightedParts(unescape(value || ''));
  });
  return h$1(Highlight$1, _extends$l({}, props, {
    parts: parts,
    classNames: cssClasses
  }));
}

function _extends$k() { _extends$k = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$k.apply(this, arguments); }

function _objectWithoutProperties$e(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose$e(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose$e(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
function ReverseHighlight$1(_ref) {
  var _ref$classNames = _ref.classNames,
      classNames = _ref$classNames === void 0 ? {} : _ref$classNames,
      props = _objectWithoutProperties$e(_ref, ["classNames"]);

  return h$1(InternalHighlight, _extends$k({
    classNames: {
      root: cx('ais-ReverseHighlight', classNames.root),
      highlighted: cx('ais-ReverseHighlight-highlighted', classNames.highlighted),
      nonHighlighted: cx('ais-ReverseHighlight-nonHighlighted', classNames.nonHighlighted),
      separator: cx('ais-ReverseHighlight-separator', classNames.separator)
    }
  }, props));
}

function _extends$j() { _extends$j = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$j.apply(this, arguments); }

function ownKeys$14(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$14(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$14(Object(source), true).forEach(function (key) { _defineProperty$1b(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$14(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$1b(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties$d(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose$d(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose$d(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
function ReverseHighlight(_ref) {
  var hit = _ref.hit,
      attribute = _ref.attribute,
      cssClasses = _ref.cssClasses,
      props = _objectWithoutProperties$d(_ref, ["hit", "attribute", "cssClasses"]);

  var property = getPropertyByPath(hit._highlightResult, attribute) || [];
  var properties = toArray(property);
  _warning(Boolean(properties.length), "Could not enable highlight for \"".concat(attribute.toString(), "\", will display an empty string.\nPlease check whether this attribute exists and is either searchable or specified in `attributesToHighlight`.\n\nSee: https://alg.li/highlighting\n")) ;
  var parts = properties.map(function (_ref2) {
    var value = _ref2.value;
    return getHighlightedParts(unescape(value || '')).map(function (_ref3) {
      var isHighlighted = _ref3.isHighlighted,
          rest = _objectWithoutProperties$d(_ref3, ["isHighlighted"]);

      return _objectSpread$14(_objectSpread$14({}, rest), {}, {
        isHighlighted: !isHighlighted
      });
    });
  });
  return h$1(ReverseHighlight$1, _extends$j({}, props, {
    parts: parts,
    classNames: cssClasses
  }));
}

function _extends$i() { _extends$i = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$i.apply(this, arguments); }

function _objectWithoutProperties$c(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose$c(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose$c(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
function ReverseSnippet$1(_ref) {
  var _ref$classNames = _ref.classNames,
      classNames = _ref$classNames === void 0 ? {} : _ref$classNames,
      props = _objectWithoutProperties$c(_ref, ["classNames"]);

  return h$1(InternalHighlight, _extends$i({
    classNames: {
      root: cx('ais-ReverseSnippet', classNames.root),
      highlighted: cx('ais-ReverseSnippet-highlighted', classNames.highlighted),
      nonHighlighted: cx('ais-ReverseSnippet-nonHighlighted', classNames.nonHighlighted),
      separator: cx('ais-ReverseSnippet-separator', classNames.separator)
    }
  }, props));
}

function _extends$h() { _extends$h = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$h.apply(this, arguments); }

function ownKeys$13(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$13(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$13(Object(source), true).forEach(function (key) { _defineProperty$1a(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$13(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$1a(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties$b(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose$b(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose$b(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
function ReverseSnippet(_ref) {
  var hit = _ref.hit,
      attribute = _ref.attribute,
      cssClasses = _ref.cssClasses,
      props = _objectWithoutProperties$b(_ref, ["hit", "attribute", "cssClasses"]);

  var property = getPropertyByPath(hit._snippetResult, attribute) || [];
  var properties = toArray(property);
  _warning(Boolean(properties.length), "Could not enable snippet for \"".concat(attribute.toString(), "\", will display an empty string.\nPlease check whether this attribute exists and is specified in `attributesToSnippet`.\n\nSee: https://alg.li/highlighting\n")) ;
  var parts = properties.map(function (_ref2) {
    var value = _ref2.value;
    return getHighlightedParts(unescape(value || '')).map(function (_ref3) {
      var isHighlighted = _ref3.isHighlighted,
          rest = _objectWithoutProperties$b(_ref3, ["isHighlighted"]);

      return _objectSpread$13(_objectSpread$13({}, rest), {}, {
        isHighlighted: !isHighlighted
      });
    });
  });
  return h$1(ReverseSnippet$1, _extends$h({}, props, {
    parts: parts,
    classNames: cssClasses
  }));
}

function _extends$g() { _extends$g = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$g.apply(this, arguments); }

function _objectWithoutProperties$a(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose$a(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose$a(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
function Snippet$1(_ref) {
  var _ref$classNames = _ref.classNames,
      classNames = _ref$classNames === void 0 ? {} : _ref$classNames,
      props = _objectWithoutProperties$a(_ref, ["classNames"]);

  return h$1(InternalHighlight, _extends$g({
    classNames: {
      root: cx('ais-Snippet', classNames.root),
      highlighted: cx('ais-Snippet-highlighted', classNames.highlighted),
      nonHighlighted: cx('ais-Snippet-nonHighlighted', classNames.nonHighlighted),
      separator: cx('ais-Snippet-separator', classNames.separator)
    }
  }, props));
}

function _extends$f() { _extends$f = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$f.apply(this, arguments); }

function _objectWithoutProperties$9(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose$9(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose$9(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
function Snippet(_ref) {
  var hit = _ref.hit,
      attribute = _ref.attribute,
      cssClasses = _ref.cssClasses,
      props = _objectWithoutProperties$9(_ref, ["hit", "attribute", "cssClasses"]);

  var property = getPropertyByPath(hit._snippetResult, attribute) || [];
  var properties = toArray(property);
  _warning(Boolean(properties.length), "Could not enable snippet for \"".concat(attribute.toString(), "\", will display an empty string.\nPlease check whether this attribute exists and is specified in `attributesToSnippet`.\n\nSee: https://alg.li/highlighting\n")) ;
  var parts = properties.map(function (_ref2) {
    var value = _ref2.value;
    return getHighlightedParts(unescape(value || ''));
  });
  return h$1(Snippet$1, _extends$f({}, props, {
    parts: parts,
    classNames: cssClasses
  }));
}

function _typeof$8(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof$8 = function _typeof(obj) { return typeof obj; }; } else { _typeof$8 = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof$8(obj); }

function ownKeys$12(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$12(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$12(Object(source), true).forEach(function (key) { _defineProperty$19(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$12(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$19(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// We add all our template helper methods to the template as lambdas. Note
// that lambdas in Mustache are supposed to accept a second argument of
// `render` to get the rendered value, not the literal `{{value}}`. But
// this is currently broken (see https://github.com/twitter/hogan.js/issues/222).
function transformHelpersToHogan() {
  var helpers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var compileOptions = arguments.length > 1 ? arguments[1] : undefined;
  var data = arguments.length > 2 ? arguments[2] : undefined;
  return Object.keys(helpers).reduce(function (acc, helperKey) {
    return _objectSpread$12(_objectSpread$12({}, acc), {}, _defineProperty$19({}, helperKey, function () {
      var _this = this;

      return function (text) {
        var render = function render(value) {
          return hogan$1.compile(value, compileOptions).render(_this);
        };

        return helpers[helperKey].call(data, text, render);
      };
    }));
  }, {});
}

function renderTemplate(_ref) {
  var templates = _ref.templates,
      templateKey = _ref.templateKey,
      compileOptions = _ref.compileOptions,
      helpers = _ref.helpers,
      data = _ref.data,
      bindEvent = _ref.bindEvent,
      sendEvent = _ref.sendEvent;
  var template = templates[templateKey];

  if (typeof template !== 'string' && typeof template !== 'function') {
    throw new Error("Template must be 'string' or 'function', was '".concat(_typeof$8(template), "' (key: ").concat(templateKey, ")"));
  }

  if (typeof template === 'function') {
    // @MAJOR no longer pass bindEvent when string templates are removed
    var params = bindEvent || {};
    params.html = m$1;
    params.sendEvent = sendEvent;
    params.components = {
      Highlight: Highlight,
      ReverseHighlight: ReverseHighlight,
      Snippet: Snippet,
      ReverseSnippet: ReverseSnippet
    };
    return template(data, params);
  }

  var transformedHelpers = transformHelpersToHogan(helpers, compileOptions, data);
  return hogan$1.compile(template, compileOptions).render(_objectSpread$12(_objectSpread$12({}, data), {}, {
    helpers: transformedHelpers
  })).replace(/[ \n\r\t\f\xA0]+/g, function (spaces) {
    return spaces.replace(/(^|\xA0+)[^\xA0]+/g, '$1 ');
  }).trim();
}

function _extends$e() { _extends$e = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$e.apply(this, arguments); }

function _typeof$7(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof$7 = function _typeof(obj) { return typeof obj; }; } else { _typeof$7 = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof$7(obj); }

function _classCallCheck$7(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties$7(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass$7(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties$7(Constructor.prototype, protoProps); if (staticProps) _defineProperties$7(Constructor, staticProps); return Constructor; }

function _inherits$6(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf$6(subClass, superClass); }

function _setPrototypeOf$6(o, p) { _setPrototypeOf$6 = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf$6(o, p); }

function _createSuper$6(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$6(); return function _createSuperInternal() { var Super = _getPrototypeOf$6(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf$6(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn$6(this, result); }; }

function _possibleConstructorReturn$6(self, call) { if (call && (_typeof$7(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized$6(self); }

function _assertThisInitialized$6(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct$6() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf$6(o) { _getPrototypeOf$6 = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf$6(o); }

function _defineProperty$18(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var defaultProps$2 = {
  data: {},
  rootTagName: 'div',
  useCustomCompileOptions: {},
  templates: {},
  templatesConfig: {}
};

// @TODO: Template should be a generic and receive TData to pass to Templates (to avoid TTemplateData to be set as `any`)
var Template = /*#__PURE__*/function (_Component) {
  _inherits$6(Template, _Component);

  var _super = _createSuper$6(Template);

  function Template() {
    _classCallCheck$7(this, Template);

    return _super.apply(this, arguments);
  }

  _createClass$7(Template, [{
    key: "shouldComponentUpdate",
    value: function shouldComponentUpdate(nextProps) {
      return !isEqual(this.props.data, nextProps.data) || this.props.templateKey !== nextProps.templateKey || !isEqual(this.props.rootProps, nextProps.rootProps);
    }
  }, {
    key: "render",
    value: function render() {
      var _this = this;

      _warning(Object.keys(this.props.templates).every(function (key) {
        return typeof _this.props.templates[key] === 'function';
      }), "Hogan.js and string-based templates are deprecated and will not be supported in InstantSearch.js 5.x.\n\nYou can replace them with function-form templates and use either the provided `html` function or JSX templates.\n\nSee: https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/js/#upgrade-templates") ;
      var RootTagName = this.props.rootTagName;
      var useCustomCompileOptions = this.props.useCustomCompileOptions[this.props.templateKey];
      var compileOptions = useCustomCompileOptions ? this.props.templatesConfig.compileOptions : {};
      var content = renderTemplate({
        templates: this.props.templates,
        templateKey: this.props.templateKey,
        compileOptions: compileOptions,
        helpers: this.props.templatesConfig.helpers,
        data: this.props.data,
        bindEvent: this.props.bindEvent,
        sendEvent: this.props.sendEvent
      });

      if (content === null) {
        // Adds a noscript to the DOM but virtual DOM is null
        // See http://facebook.github.io/react/docs/component-specs.html#render
        return null;
      }

      if (_typeof$7(content) === 'object') {
        return h$1(RootTagName, this.props.rootProps, content);
      }

      return h$1(RootTagName, _extends$e({}, this.props.rootProps, {
        dangerouslySetInnerHTML: {
          __html: content
        }
      }));
    }
  }]);

  return Template;
}(d$1);

_defineProperty$18(Template, "defaultProps", defaultProps$2);

var Template$1 = Template;

function _extends$d() { _extends$d = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$d.apply(this, arguments); }

var Breadcrumb = function Breadcrumb(_ref) {
  var items = _ref.items,
      cssClasses = _ref.cssClasses,
      templateProps = _ref.templateProps,
      createURL = _ref.createURL,
      refine = _ref.refine;
  return h$1("div", {
    className: cx(cssClasses.root, items.length === 0 && cssClasses.noRefinementRoot)
  }, h$1("ul", {
    className: cssClasses.list
  }, h$1("li", {
    className: cx(cssClasses.item, items.length === 0 && cssClasses.selectedItem)
  }, h$1(Template$1, _extends$d({}, templateProps, {
    templateKey: "home",
    rootTagName: "a",
    rootProps: {
      className: cssClasses.link,
      href: createURL(undefined),
      onClick: function onClick(event) {
        event.preventDefault();
        refine(undefined);
      }
    }
  }))), items.map(function (item, idx) {
    var isLast = idx === items.length - 1;
    return h$1("li", {
      key: item.label + idx,
      className: cx(cssClasses.item, isLast && cssClasses.selectedItem)
    }, h$1(Template$1, _extends$d({}, templateProps, {
      templateKey: "separator",
      rootTagName: "span",
      rootProps: {
        className: cssClasses.separator,
        'aria-hidden': true
      }
    })), isLast ? item.label : h$1("a", {
      className: cssClasses.link,
      href: createURL(item.value),
      onClick: function onClick(event) {
        event.preventDefault();
        refine(item.value);
      }
    }, item.label));
  })));
};

var Breadcrumb$1 = Breadcrumb;

function ownKeys$11(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$11(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$11(Object(source), true).forEach(function (key) { _defineProperty$17(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$11(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$17(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray$9(arr, i) { return _arrayWithHoles$9(arr) || _iterableToArrayLimit$9(arr, i) || _unsupportedIterableToArray$g(arr, i) || _nonIterableRest$9(); }

function _nonIterableRest$9() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray$g(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$g(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$g(o, minLen); }

function _arrayLikeToArray$g(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit$9(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles$9(arr) { if (Array.isArray(arr)) return arr; }
var withUsage$Q = createDocumentationMessageGenerator({
  name: 'breadcrumb',
  connector: true
});

var connectBreadcrumb = function connectBreadcrumb(renderFn) {
  var unmountFn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : noop;
  checkRendering(renderFn, withUsage$Q());
  var connectorState = {};
  return function (widgetParams) {
    var _ref = widgetParams || {},
        attributes = _ref.attributes,
        _ref$separator = _ref.separator,
        separator = _ref$separator === void 0 ? ' > ' : _ref$separator,
        _ref$rootPath = _ref.rootPath,
        rootPath = _ref$rootPath === void 0 ? null : _ref$rootPath,
        _ref$transformItems = _ref.transformItems,
        transformItems = _ref$transformItems === void 0 ? function (items) {
      return items;
    } : _ref$transformItems;

    if (!attributes || !Array.isArray(attributes) || attributes.length === 0) {
      throw new Error(withUsage$Q('The `attributes` option expects an array of strings.'));
    }

    var _attributes = _slicedToArray$9(attributes, 1),
        hierarchicalFacetName = _attributes[0];

    function getRefinedState(state, facetValue) {
      if (!facetValue) {
        var breadcrumb = state.getHierarchicalFacetBreadcrumb(hierarchicalFacetName);

        if (breadcrumb.length === 0) {
          return state;
        } else {
          return state.resetPage().toggleFacetRefinement(hierarchicalFacetName, breadcrumb[0]);
        }
      }

      return state.resetPage().toggleFacetRefinement(hierarchicalFacetName, facetValue);
    }

    return {
      $$type: 'ais.breadcrumb',
      init: function init(initOptions) {
        renderFn(_objectSpread$11(_objectSpread$11({}, this.getWidgetRenderState(initOptions)), {}, {
          instantSearchInstance: initOptions.instantSearchInstance
        }), true);
      },
      render: function render(renderOptions) {
        renderFn(_objectSpread$11(_objectSpread$11({}, this.getWidgetRenderState(renderOptions)), {}, {
          instantSearchInstance: renderOptions.instantSearchInstance
        }), false);
      },
      dispose: function dispose() {
        unmountFn();
      },
      getRenderState: function getRenderState(renderState, renderOptions) {
        return _objectSpread$11(_objectSpread$11({}, renderState), {}, {
          breadcrumb: _objectSpread$11(_objectSpread$11({}, renderState.breadcrumb), {}, _defineProperty$17({}, hierarchicalFacetName, this.getWidgetRenderState(renderOptions)))
        });
      },
      getWidgetRenderState: function getWidgetRenderState(_ref2) {
        var helper = _ref2.helper,
            createURL = _ref2.createURL,
            results = _ref2.results,
            state = _ref2.state;

        function getItems() {
          // The hierarchicalFacets condition is required for flavors
          // that render immediately with empty results, without relying
          // on init() (like React InstantSearch Hooks).
          if (!results || state.hierarchicalFacets.length === 0) {
            return [];
          }

          var _state$hierarchicalFa = _slicedToArray$9(state.hierarchicalFacets, 1),
              facetName = _state$hierarchicalFa[0].name;

          var facetValues = results.getFacetValues(facetName, {});
          var data = Array.isArray(facetValues.data) ? facetValues.data : [];
          var items = transformItems(shiftItemsValues(prepareItems(data)), {
            results: results
          });
          return items;
        }

        var items = getItems();

        if (!connectorState.createURL) {
          connectorState.createURL = function (facetValue) {
            return createURL(getRefinedState(helper.state, facetValue));
          };
        }

        if (!connectorState.refine) {
          connectorState.refine = function (facetValue) {
            helper.setState(getRefinedState(helper.state, facetValue)).search();
          };
        }

        return {
          canRefine: items.length > 0,
          createURL: connectorState.createURL,
          items: items,
          refine: connectorState.refine,
          widgetParams: widgetParams
        };
      },
      getWidgetSearchParameters: function getWidgetSearchParameters(searchParameters) {
        if (searchParameters.isHierarchicalFacet(hierarchicalFacetName)) {
          var facet = searchParameters.getHierarchicalFacetByName(hierarchicalFacetName);
          _warning(isEqual(facet.attributes, attributes) && facet.separator === separator && facet.rootPath === rootPath, 'Using Breadcrumb and HierarchicalMenu on the same facet with different options overrides the configuration of the HierarchicalMenu.') ;
          return searchParameters;
        }

        return searchParameters.addHierarchicalFacet({
          name: hierarchicalFacetName,
          attributes: attributes,
          separator: separator,
          rootPath: rootPath
        });
      }
    };
  };
};

function prepareItems(data) {
  return data.reduce(function (result, currentItem) {
    if (currentItem.isRefined) {
      result.push({
        label: currentItem.name,
        value: currentItem.escapedValue
      });

      if (Array.isArray(currentItem.data)) {
        result = result.concat(prepareItems(currentItem.data));
      }
    }

    return result;
  }, []);
}

function shiftItemsValues(array) {
  return array.map(function (x, idx) {
    return {
      label: x.label,
      value: idx + 1 === array.length ? null : array[idx + 1].value
    };
  });
}

var connectBreadcrumb$1 = connectBreadcrumb;

var defaultTemplates$x = {
  home: function home() {
    return 'Home';
  },
  separator: function separator() {
    return '>';
  }
};
var defaultTemplates$y = defaultTemplates$x;

function ownKeys$10(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$10(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$10(Object(source), true).forEach(function (key) { _defineProperty$16(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$10(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$16(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var withUsage$P = createDocumentationMessageGenerator({
  name: 'breadcrumb'
});
var suit$q = component('Breadcrumb');

var renderer$q = function renderer(_ref) {
  var containerNode = _ref.containerNode,
      cssClasses = _ref.cssClasses,
      renderState = _ref.renderState,
      templates = _ref.templates;
  return function (_ref2, isFirstRendering) {
    var canRefine = _ref2.canRefine,
        createURL = _ref2.createURL,
        instantSearchInstance = _ref2.instantSearchInstance,
        items = _ref2.items,
        refine = _ref2.refine;

    if (isFirstRendering) {
      renderState.templateProps = prepareTemplateProps({
        defaultTemplates: defaultTemplates$y,
        templatesConfig: instantSearchInstance.templatesConfig,
        templates: templates
      });
      return;
    }

    P(h$1(Breadcrumb$1, {
      canRefine: canRefine,
      cssClasses: cssClasses,
      createURL: createURL,
      items: items,
      refine: refine,
      templateProps: renderState.templateProps
    }), containerNode);
  };
};

var breadcrumb = function breadcrumb(widgetParams) {
  var _ref3 = widgetParams || {},
      container = _ref3.container,
      attributes = _ref3.attributes,
      separator = _ref3.separator,
      rootPath = _ref3.rootPath,
      transformItems = _ref3.transformItems,
      _ref3$templates = _ref3.templates,
      templates = _ref3$templates === void 0 ? {} : _ref3$templates,
      _ref3$cssClasses = _ref3.cssClasses,
      userCssClasses = _ref3$cssClasses === void 0 ? {} : _ref3$cssClasses;

  if (!container) {
    throw new Error(withUsage$P('The `container` option is required.'));
  }

  var containerNode = getContainerNode(container);
  var cssClasses = {
    root: cx(suit$q(), userCssClasses.root),
    noRefinementRoot: cx(suit$q({
      modifierName: 'noRefinement'
    }), userCssClasses.noRefinementRoot),
    list: cx(suit$q({
      descendantName: 'list'
    }), userCssClasses.list),
    item: cx(suit$q({
      descendantName: 'item'
    }), userCssClasses.item),
    selectedItem: cx(suit$q({
      descendantName: 'item',
      modifierName: 'selected'
    }), userCssClasses.selectedItem),
    separator: cx(suit$q({
      descendantName: 'separator'
    }), userCssClasses.separator),
    link: cx(suit$q({
      descendantName: 'link'
    }), userCssClasses.link)
  };
  var specializedRenderer = renderer$q({
    containerNode: containerNode,
    cssClasses: cssClasses,
    renderState: {},
    templates: templates
  });
  var makeWidget = connectBreadcrumb$1(specializedRenderer, function () {
    return P(null, containerNode);
  });
  return _objectSpread$10(_objectSpread$10({}, makeWidget({
    attributes: attributes,
    separator: separator,
    rootPath: rootPath,
    transformItems: transformItems
  })), {}, {
    $$widgetType: 'ais.breadcrumb'
  });
};

var breadcrumb$1 = breadcrumb;

function _extends$c() { _extends$c = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$c.apply(this, arguments); }

var ClearRefinements = function ClearRefinements(_ref) {
  var hasRefinements = _ref.hasRefinements,
      refine = _ref.refine,
      cssClasses = _ref.cssClasses,
      templateProps = _ref.templateProps;
  return h$1("div", {
    className: cssClasses.root
  }, h$1(Template$1, _extends$c({}, templateProps, {
    templateKey: "resetLabel",
    rootTagName: "button",
    rootProps: {
      className: cx(cssClasses.button, !hasRefinements && cssClasses.disabledButton),
      onClick: refine,
      disabled: !hasRefinements
    },
    data: {
      hasRefinements: hasRefinements
    }
  })));
};

var ClearRefinements$1 = ClearRefinements;

function _toConsumableArray$7(arr) { return _arrayWithoutHoles$7(arr) || _iterableToArray$7(arr) || _unsupportedIterableToArray$f(arr) || _nonIterableSpread$7(); }

function _nonIterableSpread$7() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray$f(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$f(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$f(o, minLen); }

function _iterableToArray$7(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles$7(arr) { if (Array.isArray(arr)) return _arrayLikeToArray$f(arr); }

function _arrayLikeToArray$f(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys$$(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$$(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$$(Object(source), true).forEach(function (key) { _defineProperty$15(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$$(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$15(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var withUsage$O = createDocumentationMessageGenerator({
  name: 'clear-refinements',
  connector: true
});

var connectClearRefinements = function connectClearRefinements(renderFn) {
  var unmountFn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : noop;
  checkRendering(renderFn, withUsage$O());
  return function (widgetParams) {
    var _ref = widgetParams || {},
        _ref$includedAttribut = _ref.includedAttributes,
        includedAttributes = _ref$includedAttribut === void 0 ? [] : _ref$includedAttribut,
        _ref$excludedAttribut = _ref.excludedAttributes,
        excludedAttributes = _ref$excludedAttribut === void 0 ? ['query'] : _ref$excludedAttribut,
        _ref$transformItems = _ref.transformItems,
        transformItems = _ref$transformItems === void 0 ? function (items) {
      return items;
    } : _ref$transformItems;

    if (widgetParams && widgetParams.includedAttributes && widgetParams.excludedAttributes) {
      throw new Error(withUsage$O('The options `includedAttributes` and `excludedAttributes` cannot be used together.'));
    }

    var connectorState = {
      refine: noop,
      createURL: function createURL() {
        return '';
      },
      attributesToClear: []
    };

    var cachedRefine = function cachedRefine() {
      return connectorState.refine();
    };

    var cachedCreateURL = function cachedCreateURL() {
      return connectorState.createURL();
    };

    return {
      $$type: 'ais.clearRefinements',
      init: function init(initOptions) {
        var instantSearchInstance = initOptions.instantSearchInstance;
        renderFn(_objectSpread$$(_objectSpread$$({}, this.getWidgetRenderState(initOptions)), {}, {
          instantSearchInstance: instantSearchInstance
        }), true);
      },
      render: function render(renderOptions) {
        var instantSearchInstance = renderOptions.instantSearchInstance;
        renderFn(_objectSpread$$(_objectSpread$$({}, this.getWidgetRenderState(renderOptions)), {}, {
          instantSearchInstance: instantSearchInstance
        }), false);
      },
      dispose: function dispose() {
        unmountFn();
      },
      getRenderState: function getRenderState(renderState, renderOptions) {
        return _objectSpread$$(_objectSpread$$({}, renderState), {}, {
          clearRefinements: this.getWidgetRenderState(renderOptions)
        });
      },
      getWidgetRenderState: function getWidgetRenderState(_ref2) {
        var createURL = _ref2.createURL,
            scopedResults = _ref2.scopedResults,
            results = _ref2.results;
        connectorState.attributesToClear = scopedResults.reduce(function (attributesToClear, scopedResult) {
          return attributesToClear.concat(getAttributesToClear({
            scopedResult: scopedResult,
            includedAttributes: includedAttributes,
            excludedAttributes: excludedAttributes,
            transformItems: transformItems,
            results: results
          }));
        }, []);

        connectorState.refine = function () {
          connectorState.attributesToClear.forEach(function (_ref3) {
            var indexHelper = _ref3.helper,
                items = _ref3.items;
            indexHelper.setState(clearRefinements$2({
              helper: indexHelper,
              attributesToClear: items
            })).search();
          });
        };

        connectorState.createURL = function () {
          return createURL(mergeSearchParameters.apply(void 0, _toConsumableArray$7(connectorState.attributesToClear.map(function (_ref4) {
            var indexHelper = _ref4.helper,
                items = _ref4.items;
            return clearRefinements$2({
              helper: indexHelper,
              attributesToClear: items
            });
          }))));
        };

        var canRefine = connectorState.attributesToClear.some(function (attributeToClear) {
          return attributeToClear.items.length > 0;
        });
        return {
          canRefine: canRefine,
          hasRefinements: canRefine,
          refine: cachedRefine,
          createURL: cachedCreateURL,
          widgetParams: widgetParams
        };
      }
    };
  };
};

function getAttributesToClear(_ref5) {
  var scopedResult = _ref5.scopedResult,
      includedAttributes = _ref5.includedAttributes,
      excludedAttributes = _ref5.excludedAttributes,
      transformItems = _ref5.transformItems,
      results = _ref5.results;
  var includesQuery = includedAttributes.indexOf('query') !== -1 || excludedAttributes.indexOf('query') === -1;
  return {
    helper: scopedResult.helper,
    items: transformItems(uniq(getRefinements(scopedResult.results, scopedResult.helper.state, includesQuery).map(function (refinement) {
      return refinement.attribute;
    }).filter(function (attribute) {
      return (// If the array is empty (default case), we keep all the attributes
        includedAttributes.length === 0 || // Otherwise, only add the specified attributes
        includedAttributes.indexOf(attribute) !== -1
      );
    }).filter(function (attribute) {
      return (// If the query is included, we ignore the default `excludedAttributes = ['query']`
        attribute === 'query' && includesQuery || // Otherwise, ignore the excluded attributes
        excludedAttributes.indexOf(attribute) === -1
      );
    })), {
      results: results
    })
  };
}

var connectClearRefinements$1 = connectClearRefinements;

var defaultTemplates$v = {
  resetLabel: function resetLabel() {
    return 'Clear refinements';
  }
};
var defaultTemplates$w = defaultTemplates$v;

function ownKeys$_(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$_(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$_(Object(source), true).forEach(function (key) { _defineProperty$14(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$_(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$14(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var withUsage$N = createDocumentationMessageGenerator({
  name: 'clear-refinements'
});
var suit$p = component('ClearRefinements');

var renderer$p = function renderer(_ref) {
  var containerNode = _ref.containerNode,
      cssClasses = _ref.cssClasses,
      renderState = _ref.renderState,
      templates = _ref.templates;
  return function (_ref2, isFirstRendering) {
    var refine = _ref2.refine,
        canRefine = _ref2.canRefine,
        instantSearchInstance = _ref2.instantSearchInstance;

    if (isFirstRendering) {
      renderState.templateProps = prepareTemplateProps({
        defaultTemplates: defaultTemplates$w,
        templatesConfig: instantSearchInstance.templatesConfig,
        templates: templates
      });
      return;
    }

    P(h$1(ClearRefinements$1, {
      refine: refine,
      cssClasses: cssClasses,
      hasRefinements: canRefine,
      templateProps: renderState.templateProps
    }), containerNode);
  };
};

var clearRefinements = function clearRefinements(widgetParams) {
  var _ref3 = widgetParams || {},
      container = _ref3.container,
      _ref3$templates = _ref3.templates,
      templates = _ref3$templates === void 0 ? {} : _ref3$templates,
      includedAttributes = _ref3.includedAttributes,
      excludedAttributes = _ref3.excludedAttributes,
      transformItems = _ref3.transformItems,
      _ref3$cssClasses = _ref3.cssClasses,
      userCssClasses = _ref3$cssClasses === void 0 ? {} : _ref3$cssClasses;

  if (!container) {
    throw new Error(withUsage$N('The `container` option is required.'));
  }

  var containerNode = getContainerNode(container);
  var cssClasses = {
    root: cx(suit$p(), userCssClasses.root),
    button: cx(suit$p({
      descendantName: 'button'
    }), userCssClasses.button),
    disabledButton: cx(suit$p({
      descendantName: 'button',
      modifierName: 'disabled'
    }), userCssClasses.disabledButton)
  };
  var specializedRenderer = renderer$p({
    containerNode: containerNode,
    cssClasses: cssClasses,
    renderState: {},
    templates: templates
  });
  var makeWidget = connectClearRefinements$1(specializedRenderer, function () {
    return P(null, containerNode);
  });
  return _objectSpread$_(_objectSpread$_({}, makeWidget({
    includedAttributes: includedAttributes,
    excludedAttributes: excludedAttributes,
    transformItems: transformItems
  })), {}, {
    $$widgetType: 'ais.clearRefinements'
  });
};

var clearRefinements$1 = clearRefinements;

function ownKeys$Z(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$Z(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$Z(Object(source), true).forEach(function (key) { _defineProperty$13(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$Z(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$13(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
/**
 * Refine the given search parameters.
 */

var withUsage$M = createDocumentationMessageGenerator({
  name: 'configure',
  connector: true
});

function getInitialSearchParameters(state, widgetParams) {
  // We leverage the helper internals to remove the `widgetParams` from
  // the state. The function `setQueryParameters` omits the values that
  // are `undefined` on the next state.
  return state.setQueryParameters(Object.keys(widgetParams.searchParameters).reduce(function (acc, key) {
    return _objectSpread$Z(_objectSpread$Z({}, acc), {}, _defineProperty$13({}, key, undefined));
  }, {}));
}

var connectConfigure = function connectConfigure() {
  var renderFn = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : noop;
  var unmountFn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : noop;
  return function (widgetParams) {
    if (!widgetParams || !isPlainObject(widgetParams.searchParameters)) {
      throw new Error(withUsage$M('The `searchParameters` option expects an object.'));
    }

    var connectorState = {};

    function refine(helper) {
      return function (searchParameters) {
        // Merge new `searchParameters` with the ones set from other widgets
        var actualState = getInitialSearchParameters(helper.state, widgetParams);
        var nextSearchParameters = mergeSearchParameters(actualState, new algoliasearchHelper_1.SearchParameters(searchParameters)); // Update original `widgetParams.searchParameters` to the new refined one

        widgetParams.searchParameters = searchParameters; // Trigger a search with the resolved search parameters

        helper.setState(nextSearchParameters).search();
      };
    }

    return {
      $$type: 'ais.configure',
      init: function init(initOptions) {
        var instantSearchInstance = initOptions.instantSearchInstance;
        renderFn(_objectSpread$Z(_objectSpread$Z({}, this.getWidgetRenderState(initOptions)), {}, {
          instantSearchInstance: instantSearchInstance
        }), true);
      },
      render: function render(renderOptions) {
        var instantSearchInstance = renderOptions.instantSearchInstance;
        renderFn(_objectSpread$Z(_objectSpread$Z({}, this.getWidgetRenderState(renderOptions)), {}, {
          instantSearchInstance: instantSearchInstance
        }), false);
      },
      dispose: function dispose(_ref) {
        var state = _ref.state;
        unmountFn();
        return getInitialSearchParameters(state, widgetParams);
      },
      getRenderState: function getRenderState(renderState, renderOptions) {
        var _renderState$configur;

        var widgetRenderState = this.getWidgetRenderState(renderOptions);
        return _objectSpread$Z(_objectSpread$Z({}, renderState), {}, {
          configure: _objectSpread$Z(_objectSpread$Z({}, widgetRenderState), {}, {
            widgetParams: _objectSpread$Z(_objectSpread$Z({}, widgetRenderState.widgetParams), {}, {
              searchParameters: mergeSearchParameters(new algoliasearchHelper_1.SearchParameters((_renderState$configur = renderState.configure) === null || _renderState$configur === void 0 ? void 0 : _renderState$configur.widgetParams.searchParameters), new algoliasearchHelper_1.SearchParameters(widgetRenderState.widgetParams.searchParameters)).getQueryParams()
            })
          })
        });
      },
      getWidgetRenderState: function getWidgetRenderState(_ref2) {
        var helper = _ref2.helper;

        if (!connectorState.refine) {
          connectorState.refine = refine(helper);
        }

        return {
          refine: connectorState.refine,
          widgetParams: widgetParams
        };
      },
      getWidgetSearchParameters: function getWidgetSearchParameters(state, _ref3) {
        var uiState = _ref3.uiState;
        return mergeSearchParameters(state, new algoliasearchHelper_1.SearchParameters(_objectSpread$Z(_objectSpread$Z({}, uiState.configure), widgetParams.searchParameters)));
      },
      getWidgetUiState: function getWidgetUiState(uiState) {
        return _objectSpread$Z(_objectSpread$Z({}, uiState), {}, {
          configure: _objectSpread$Z(_objectSpread$Z({}, uiState.configure), widgetParams.searchParameters)
        });
      }
    };
  };
};

var connectConfigure$1 = connectConfigure;

function ownKeys$Y(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$Y(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$Y(Object(source), true).forEach(function (key) { _defineProperty$12(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$Y(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$12(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
/**
 * A list of [search parameters](https://www.algolia.com/doc/api-reference/search-api-parameters/)
 * to enable when the widget mounts.
 */

var configure = function configure(widgetParams) {
  // This is a renderless widget that falls back to the connector's
  // noop render and unmount functions.
  var makeWidget = connectConfigure$1(noop);
  return _objectSpread$Y(_objectSpread$Y({}, makeWidget({
    searchParameters: widgetParams
  })), {}, {
    $$widgetType: 'ais.configure'
  });
};

var configure$1 = configure;

var createItemKey = function createItemKey(_ref) {
  var attribute = _ref.attribute,
      value = _ref.value,
      type = _ref.type,
      operator = _ref.operator;
  return [attribute, type, value, operator].map(function (key) {
    return key;
  }).filter(Boolean).join(':');
};

var handleClick = function handleClick(callback) {
  return function (event) {
    if (isSpecialClick(event)) {
      return;
    }

    event.preventDefault();
    callback();
  };
};

var CurrentRefinements = function CurrentRefinements(_ref2) {
  var items = _ref2.items,
      cssClasses = _ref2.cssClasses,
      canRefine = _ref2.canRefine;
  return h$1("div", {
    className: cx(cssClasses.root, !canRefine && cssClasses.noRefinementRoot)
  }, h$1("ul", {
    className: cssClasses.list
  }, items.map(function (item, index) {
    return h$1("li", {
      key: "".concat(item.indexName, "-").concat(item.attribute, "-").concat(index),
      className: cssClasses.item
    }, h$1("span", {
      className: cssClasses.label
    }, capitalize(item.label), ":"), item.refinements.map(function (refinement) {
      return h$1("span", {
        key: createItemKey(refinement),
        className: cssClasses.category
      }, h$1("span", {
        className: cssClasses.categoryLabel
      }, refinement.attribute === 'query' ? h$1("q", null, refinement.label) : refinement.label), h$1("button", {
        className: cssClasses.delete,
        onClick: handleClick(item.refine.bind(null, refinement))
      }, "\u2715"));
    }));
  })));
};

var CurrentRefinements$1 = CurrentRefinements;

function _toConsumableArray$6(arr) { return _arrayWithoutHoles$6(arr) || _iterableToArray$6(arr) || _unsupportedIterableToArray$e(arr) || _nonIterableSpread$6(); }

function _nonIterableSpread$6() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray$e(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$e(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$e(o, minLen); }

function _iterableToArray$6(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles$6(arr) { if (Array.isArray(arr)) return _arrayLikeToArray$e(arr); }

function _arrayLikeToArray$e(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys$X(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$X(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$X(Object(source), true).forEach(function (key) { _defineProperty$11(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$X(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$11(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var withUsage$L = createDocumentationMessageGenerator({
  name: 'current-refinements',
  connector: true
});

var connectCurrentRefinements = function connectCurrentRefinements(renderFn) {
  var unmountFn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : noop;
  checkRendering(renderFn, withUsage$L());
  return function (widgetParams) {
    if ((widgetParams || {}).includedAttributes && (widgetParams || {}).excludedAttributes) {
      throw new Error(withUsage$L('The options `includedAttributes` and `excludedAttributes` cannot be used together.'));
    }

    var _ref = widgetParams || {},
        includedAttributes = _ref.includedAttributes,
        _ref$excludedAttribut = _ref.excludedAttributes,
        excludedAttributes = _ref$excludedAttribut === void 0 ? ['query'] : _ref$excludedAttribut,
        _ref$transformItems = _ref.transformItems,
        transformItems = _ref$transformItems === void 0 ? function (items) {
      return items;
    } : _ref$transformItems;

    return {
      $$type: 'ais.currentRefinements',
      init: function init(initOptions) {
        var instantSearchInstance = initOptions.instantSearchInstance;
        renderFn(_objectSpread$X(_objectSpread$X({}, this.getWidgetRenderState(initOptions)), {}, {
          instantSearchInstance: instantSearchInstance
        }), true);
      },
      render: function render(renderOptions) {
        var instantSearchInstance = renderOptions.instantSearchInstance;
        renderFn(_objectSpread$X(_objectSpread$X({}, this.getWidgetRenderState(renderOptions)), {}, {
          instantSearchInstance: instantSearchInstance
        }), false);
      },
      dispose: function dispose() {
        unmountFn();
      },
      getRenderState: function getRenderState(renderState, renderOptions) {
        return _objectSpread$X(_objectSpread$X({}, renderState), {}, {
          currentRefinements: this.getWidgetRenderState(renderOptions)
        });
      },
      getWidgetRenderState: function getWidgetRenderState(_ref2) {
        var results = _ref2.results,
            scopedResults = _ref2.scopedResults,
            _createURL = _ref2.createURL,
            helper = _ref2.helper;

        function getItems() {
          if (!results) {
            return transformItems(getRefinementsItems({
              results: {},
              helper: helper,
              includedAttributes: includedAttributes,
              excludedAttributes: excludedAttributes
            }), {
              results: results
            });
          }

          return scopedResults.reduce(function (accResults, scopedResult) {
            return accResults.concat(transformItems(getRefinementsItems({
              results: scopedResult.results,
              helper: scopedResult.helper,
              includedAttributes: includedAttributes,
              excludedAttributes: excludedAttributes
            }), {
              results: results
            }));
          }, []);
        }

        var items = getItems();
        return {
          items: items,
          canRefine: items.length > 0,
          refine: function refine(refinement) {
            return clearRefinement(helper, refinement);
          },
          createURL: function createURL(refinement) {
            return _createURL(clearRefinementFromState(helper.state, refinement));
          },
          widgetParams: widgetParams
        };
      }
    };
  };
};

function getRefinementsItems(_ref3) {
  var results = _ref3.results,
      helper = _ref3.helper,
      includedAttributes = _ref3.includedAttributes,
      excludedAttributes = _ref3.excludedAttributes;
  var includesQuery = (includedAttributes || []).indexOf('query') !== -1 || (excludedAttributes || []).indexOf('query') === -1;
  var filterFunction = includedAttributes ? function (item) {
    return includedAttributes.indexOf(item.attribute) !== -1;
  } : function (item) {
    return excludedAttributes.indexOf(item.attribute) === -1;
  };
  var items = getRefinements(results, helper.state, includesQuery).map(normalizeRefinement).filter(filterFunction);
  return items.reduce(function (allItems, currentItem) {
    return [].concat(_toConsumableArray$6(allItems.filter(function (item) {
      return item.attribute !== currentItem.attribute;
    })), [{
      indexName: helper.state.index,
      attribute: currentItem.attribute,
      label: currentItem.attribute,
      refinements: items.filter(function (result) {
        return result.attribute === currentItem.attribute;
      }) // We want to keep the order of refinements except the numeric ones.
      .sort(function (a, b) {
        return a.type === 'numeric' ? a.value - b.value : 0;
      }),
      refine: function refine(refinement) {
        return clearRefinement(helper, refinement);
      }
    }]);
  }, []);
}

function clearRefinementFromState(state, refinement) {
  state = state.resetPage();

  switch (refinement.type) {
    case 'facet':
      return state.removeFacetRefinement(refinement.attribute, String(refinement.value));

    case 'disjunctive':
      return state.removeDisjunctiveFacetRefinement(refinement.attribute, String(refinement.value));

    case 'hierarchical':
      return state.removeHierarchicalFacetRefinement(refinement.attribute);

    case 'exclude':
      return state.removeExcludeRefinement(refinement.attribute, String(refinement.value));

    case 'numeric':
      return state.removeNumericRefinement(refinement.attribute, refinement.operator, String(refinement.value));

    case 'tag':
      return state.removeTagRefinement(String(refinement.value));

    case 'query':
      return state.setQueryParameter('query', '');

    default:
      _warning(false, "The refinement type \"".concat(refinement.type, "\" does not exist and cannot be cleared from the current refinements.")) ;
      return state;
  }
}

function clearRefinement(helper, refinement) {
  helper.setState(clearRefinementFromState(helper.state, refinement)).search();
}

function getOperatorSymbol(operator) {
  switch (operator) {
    case '>=':
      return '≥';

    case '<=':
      return '≤';

    default:
      return operator;
  }
}

function normalizeRefinement(refinement) {
  var value = getValue$1(refinement);
  var label = refinement.operator ? "".concat(getOperatorSymbol(refinement.operator), " ").concat(refinement.name) : refinement.name;
  var normalizedRefinement = {
    attribute: refinement.attribute,
    type: refinement.type,
    value: value,
    label: label
  };

  if (refinement.operator !== undefined) {
    normalizedRefinement.operator = refinement.operator;
  }

  if (refinement.count !== undefined) {
    normalizedRefinement.count = refinement.count;
  }

  if (refinement.exhaustive !== undefined) {
    normalizedRefinement.exhaustive = refinement.exhaustive;
  }

  return normalizedRefinement;
}

function getValue$1(refinement) {
  if (refinement.type === 'numeric') {
    return Number(refinement.name);
  }

  if ('escapedValue' in refinement) {
    return refinement.escapedValue;
  }

  return refinement.name;
}

var connectCurrentRefinements$1 = connectCurrentRefinements;

function ownKeys$W(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$W(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$W(Object(source), true).forEach(function (key) { _defineProperty$10(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$W(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$10(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var withUsage$K = createDocumentationMessageGenerator({
  name: 'current-refinements'
});
var suit$o = component('CurrentRefinements');

var renderer$o = function renderer(_ref, isFirstRender) {
  var items = _ref.items,
      widgetParams = _ref.widgetParams,
      canRefine = _ref.canRefine;

  if (isFirstRender) {
    return;
  }

  var _ref2 = widgetParams,
      container = _ref2.container,
      cssClasses = _ref2.cssClasses;
  P(h$1(CurrentRefinements$1, {
    cssClasses: cssClasses,
    items: items,
    canRefine: canRefine
  }), container);
};

var currentRefinements = function currentRefinements(widgetParams) {
  var _ref3 = widgetParams || {},
      container = _ref3.container,
      includedAttributes = _ref3.includedAttributes,
      excludedAttributes = _ref3.excludedAttributes,
      _ref3$cssClasses = _ref3.cssClasses,
      userCssClasses = _ref3$cssClasses === void 0 ? {} : _ref3$cssClasses,
      transformItems = _ref3.transformItems;

  if (!container) {
    throw new Error(withUsage$K('The `container` option is required.'));
  }

  var containerNode = getContainerNode(container);
  var cssClasses = {
    root: cx(suit$o(), userCssClasses.root),
    noRefinementRoot: cx(suit$o({
      modifierName: 'noRefinement'
    }), userCssClasses.noRefinementRoot),
    list: cx(suit$o({
      descendantName: 'list'
    }), userCssClasses.list),
    item: cx(suit$o({
      descendantName: 'item'
    }), userCssClasses.item),
    label: cx(suit$o({
      descendantName: 'label'
    }), userCssClasses.label),
    category: cx(suit$o({
      descendantName: 'category'
    }), userCssClasses.category),
    categoryLabel: cx(suit$o({
      descendantName: 'categoryLabel'
    }), userCssClasses.categoryLabel),
    delete: cx(suit$o({
      descendantName: 'delete'
    }), userCssClasses.delete)
  };
  var makeWidget = connectCurrentRefinements$1(renderer$o, function () {
    return P(null, containerNode);
  });
  return _objectSpread$W(_objectSpread$W({}, makeWidget({
    container: containerNode,
    cssClasses: cssClasses,
    includedAttributes: includedAttributes,
    excludedAttributes: excludedAttributes,
    transformItems: transformItems
  })), {}, {
    $$widgetType: 'ais.currentRefinements'
  });
};

var currentRefinements$1 = currentRefinements;

var defaultTemplates$t = {
  header: function header() {
    return '';
  },
  loader: function loader() {
    return '';
  },
  item: function item(_item) {
    return JSON.stringify(_item);
  }
};
var defaultTemplates$u = defaultTemplates$t;

function ownKeys$V(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$V(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$V(Object(source), true).forEach(function (key) { _defineProperty$$(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$V(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$$(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _extends$b() { _extends$b = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$b.apply(this, arguments); }

var Answers = function Answers(_ref) {
  var hits = _ref.hits,
      isLoading = _ref.isLoading,
      cssClasses = _ref.cssClasses,
      templateProps = _ref.templateProps;
  return h$1("div", {
    className: cx(cssClasses.root, hits.length === 0 && cssClasses.emptyRoot)
  }, h$1(Template$1, _extends$b({}, templateProps, {
    templateKey: "header",
    rootProps: {
      className: cssClasses.header
    },
    data: {
      hits: hits,
      isLoading: isLoading
    }
  })), isLoading ? h$1(Template$1, _extends$b({}, templateProps, {
    templateKey: "loader",
    rootProps: {
      className: cssClasses.loader
    }
  })) : h$1("ul", {
    className: cssClasses.list
  }, hits.map(function (hit, position) {
    return h$1(Template$1, _extends$b({}, templateProps, {
      templateKey: "item",
      rootTagName: "li",
      rootProps: {
        className: cssClasses.item
      },
      key: hit.objectID,
      data: _objectSpread$V(_objectSpread$V({}, hit), {}, {
        __hitIndex: position
      })
    }));
  })));
};

var Answers$1 = Answers;

function ownKeys$U(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$U(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$U(Object(source), true).forEach(function (key) { _defineProperty$_(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$U(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$_(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function hasFindAnswersMethod(answersIndex) {
  return typeof answersIndex.findAnswers === 'function';
}

var withUsage$J = createDocumentationMessageGenerator({
  name: 'answers',
  connector: true
});

var connectAnswers = function connectAnswers(renderFn) {
  var unmountFn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : noop;
  checkRendering(renderFn, withUsage$J());
  return function (widgetParams) {
    var _ref = widgetParams || {},
        queryLanguages = _ref.queryLanguages,
        attributesForPrediction = _ref.attributesForPrediction,
        _ref$nbHits = _ref.nbHits,
        nbHits = _ref$nbHits === void 0 ? 1 : _ref$nbHits,
        _ref$renderDebounceTi = _ref.renderDebounceTime,
        renderDebounceTime = _ref$renderDebounceTi === void 0 ? 100 : _ref$renderDebounceTi,
        _ref$searchDebounceTi = _ref.searchDebounceTime,
        searchDebounceTime = _ref$searchDebounceTi === void 0 ? 100 : _ref$searchDebounceTi,
        _ref$escapeHTML = _ref.escapeHTML,
        escapeHTML = _ref$escapeHTML === void 0 ? true : _ref$escapeHTML,
        _ref$extraParameters = _ref.extraParameters,
        extraParameters = _ref$extraParameters === void 0 ? {} : _ref$extraParameters; // @ts-expect-error checking for the wrong value


    if (!queryLanguages || queryLanguages.length === 0) {
      throw new Error(withUsage$J('The `queryLanguages` expects an array of strings.'));
    }

    var runConcurrentSafePromise = createConcurrentSafePromise();
    var lastHits = [];
    var isLoading = false;
    var debouncedRender = debounce(renderFn, renderDebounceTime); // this does not directly use DebouncedFunction<findAnswers>, since then the generic will disappear

    var debouncedRefine;
    return {
      $$type: 'ais.answers',
      init: function init(initOptions) {
        var state = initOptions.state,
            instantSearchInstance = initOptions.instantSearchInstance;
        var answersIndex = instantSearchInstance.client.initIndex(state.index);

        if (!hasFindAnswersMethod(answersIndex)) {
          throw new Error(withUsage$J('`algoliasearch` >= 4.8.0 required.'));
        }

        debouncedRefine = debounce(answersIndex.findAnswers, searchDebounceTime);
        renderFn(_objectSpread$U(_objectSpread$U({}, this.getWidgetRenderState(initOptions)), {}, {
          instantSearchInstance: initOptions.instantSearchInstance
        }), true);
      },
      render: function render(renderOptions) {
        var _this = this;

        var query = renderOptions.state.query;

        if (!query) {
          // renders nothing with empty query
          lastHits = [];
          isLoading = false;
          renderFn(_objectSpread$U(_objectSpread$U({}, this.getWidgetRenderState(renderOptions)), {}, {
            instantSearchInstance: renderOptions.instantSearchInstance
          }), false);
          return;
        } // render the loader


        lastHits = [];
        isLoading = true;
        renderFn(_objectSpread$U(_objectSpread$U({}, this.getWidgetRenderState(renderOptions)), {}, {
          instantSearchInstance: renderOptions.instantSearchInstance
        }), false); // call /answers API

        runConcurrentSafePromise(debouncedRefine(query, queryLanguages, _objectSpread$U(_objectSpread$U({}, extraParameters), {}, {
          nbHits: nbHits,
          attributesForPrediction: attributesForPrediction
        }))).then(function (result) {
          if (!result) {
            // It's undefined when it's debounced.
            return;
          }

          if (escapeHTML && result.hits.length > 0) {
            result.hits = escapeHits(result.hits);
          }

          var hitsWithAbsolutePosition = addAbsolutePosition(result.hits, 0, nbHits);
          var hitsWithAbsolutePositionAndQueryID = addQueryID(hitsWithAbsolutePosition, result.queryID);
          lastHits = hitsWithAbsolutePositionAndQueryID;
          isLoading = false;
          debouncedRender(_objectSpread$U(_objectSpread$U({}, _this.getWidgetRenderState(renderOptions)), {}, {
            instantSearchInstance: renderOptions.instantSearchInstance
          }), false);
        });
      },
      getRenderState: function getRenderState(renderState, renderOptions) {
        return _objectSpread$U(_objectSpread$U({}, renderState), {}, {
          answers: this.getWidgetRenderState(renderOptions)
        });
      },
      getWidgetRenderState: function getWidgetRenderState() {
        return {
          hits: lastHits,
          isLoading: isLoading,
          widgetParams: widgetParams
        };
      },
      dispose: function dispose(_ref2) {
        var state = _ref2.state;
        unmountFn();
        return state;
      },
      getWidgetSearchParameters: function getWidgetSearchParameters(state) {
        return state;
      }
    };
  };
};

var connectAnswers$1 = connectAnswers;

function ownKeys$T(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$T(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$T(Object(source), true).forEach(function (key) { _defineProperty$Z(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$T(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$Z(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var withUsage$I = createDocumentationMessageGenerator({
  name: 'answers'
});
var suit$n = component('Answers');

var renderer$n = function renderer(_ref) {
  var containerNode = _ref.containerNode,
      cssClasses = _ref.cssClasses,
      renderState = _ref.renderState,
      templates = _ref.templates;
  return function (_ref2, isFirstRendering) {
    var hits = _ref2.hits,
        isLoading = _ref2.isLoading,
        instantSearchInstance = _ref2.instantSearchInstance;

    if (isFirstRendering) {
      renderState.templateProps = prepareTemplateProps({
        defaultTemplates: defaultTemplates$u,
        templatesConfig: instantSearchInstance.templatesConfig,
        templates: templates
      });
      return;
    }

    P(h$1(Answers$1, {
      cssClasses: cssClasses,
      hits: hits,
      isLoading: isLoading,
      templateProps: renderState.templateProps
    }), containerNode);
  };
};

var answersWidget = function answersWidget(widgetParams) {
  var _ref3 = widgetParams || {},
      container = _ref3.container,
      attributesForPrediction = _ref3.attributesForPrediction,
      queryLanguages = _ref3.queryLanguages,
      nbHits = _ref3.nbHits,
      searchDebounceTime = _ref3.searchDebounceTime,
      renderDebounceTime = _ref3.renderDebounceTime,
      escapeHTML = _ref3.escapeHTML,
      extraParameters = _ref3.extraParameters,
      _ref3$templates = _ref3.templates,
      templates = _ref3$templates === void 0 ? {} : _ref3$templates,
      _ref3$cssClasses = _ref3.cssClasses,
      userCssClasses = _ref3$cssClasses === void 0 ? {} : _ref3$cssClasses;

  if (!container) {
    throw new Error(withUsage$I('The `container` option is required.'));
  }

  var containerNode = getContainerNode(container);
  var cssClasses = {
    root: cx(suit$n(), userCssClasses.root),
    emptyRoot: cx(suit$n({
      modifierName: 'empty'
    }), userCssClasses.emptyRoot),
    header: cx(suit$n({
      descendantName: 'header'
    }), userCssClasses.header),
    loader: cx(suit$n({
      descendantName: 'loader'
    }), userCssClasses.loader),
    list: cx(suit$n({
      descendantName: 'list'
    }), userCssClasses.list),
    item: cx(suit$n({
      descendantName: 'item'
    }), userCssClasses.item)
  };
  var specializedRenderer = renderer$n({
    containerNode: containerNode,
    cssClasses: cssClasses,
    templates: templates,
    renderState: {}
  });
  var makeWidget = connectAnswers$1(specializedRenderer, function () {
    return P(null, containerNode);
  });
  return _objectSpread$T(_objectSpread$T({}, makeWidget({
    attributesForPrediction: attributesForPrediction,
    queryLanguages: queryLanguages,
    nbHits: nbHits,
    searchDebounceTime: searchDebounceTime,
    renderDebounceTime: renderDebounceTime,
    escapeHTML: escapeHTML,
    extraParameters: extraParameters
  })), {}, {
    $$widgetType: 'ais.answers'
  });
};

var answersWidget$1 = answersWidget;

function ownKeys$S(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$S(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$S(Object(source), true).forEach(function (key) { _defineProperty$Y(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$S(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$Y(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray$5(arr) { return _arrayWithoutHoles$5(arr) || _iterableToArray$5(arr) || _unsupportedIterableToArray$d(arr) || _nonIterableSpread$5(); }

function _nonIterableSpread$5() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray$d(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$d(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$d(o, minLen); }

function _iterableToArray$5(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles$5(arr) { if (Array.isArray(arr)) return _arrayLikeToArray$d(arr); }

function _arrayLikeToArray$d(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
var withUsage$H = createDocumentationMessageGenerator({
  name: 'configure-related-items',
  connector: true
});

function createOptionalFilter(_ref) {
  var attributeName = _ref.attributeName,
      attributeValue = _ref.attributeValue,
      attributeScore = _ref.attributeScore;
  return "".concat(attributeName, ":").concat(attributeValue, "<score=").concat(attributeScore || 1, ">");
}

var connectConfigureRelatedItems = function connectConfigureRelatedItems(renderFn, unmountFn) {
  return function (widgetParams) {
    var _ref2 = widgetParams || {},
        hit = _ref2.hit,
        matchingPatterns = _ref2.matchingPatterns,
        _ref2$transformSearch = _ref2.transformSearchParameters,
        transformSearchParameters = _ref2$transformSearch === void 0 ? function (x) {
      return x;
    } : _ref2$transformSearch;

    if (!hit) {
      throw new Error(withUsage$H('The `hit` option is required.'));
    }

    if (!matchingPatterns) {
      throw new Error(withUsage$H('The `matchingPatterns` option is required.'));
    }

    var optionalFilters = Object.keys(matchingPatterns).reduce(function (acc, attributeName) {
      var attribute = matchingPatterns[attributeName];
      var attributeValue = getPropertyByPath(hit, attributeName);
      var attributeScore = attribute.score;

      if (Array.isArray(attributeValue)) {
        return [].concat(_toConsumableArray$5(acc), [attributeValue.map(function (attributeSubValue) {
          return createOptionalFilter({
            attributeName: attributeName,
            attributeValue: attributeSubValue,
            attributeScore: attributeScore
          });
        })]);
      }

      if (typeof attributeValue === 'string') {
        return [].concat(_toConsumableArray$5(acc), [createOptionalFilter({
          attributeName: attributeName,
          attributeValue: attributeValue,
          attributeScore: attributeScore
        })]);
      }

      _warning(false, "\nThe `matchingPatterns` option returned a value of type ".concat(getObjectType(attributeValue), " for the \"").concat(attributeName, "\" key. This value was not sent to Algolia because `optionalFilters` only supports strings and array of strings.\n\nYou can remove the \"").concat(attributeName, "\" key from the `matchingPatterns` option.\n\nSee https://www.algolia.com/doc/api-reference/api-parameters/optionalFilters/\n            ")) ;
      return acc;
    }, []);

    var searchParameters = _objectSpread$S({}, transformSearchParameters(new algoliasearchHelper_1.SearchParameters({
      sumOrFiltersScores: true,
      facetFilters: ["objectID:-".concat(hit.objectID)],
      optionalFilters: optionalFilters
    })));

    var makeWidget = connectConfigure$1(renderFn, unmountFn);
    return _objectSpread$S(_objectSpread$S({}, makeWidget({
      searchParameters: searchParameters
    })), {}, {
      $$type: 'ais.configureRelatedItems'
    });
  };
};

var connectConfigureRelatedItems$1 = connectConfigureRelatedItems;

function ownKeys$R(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$R(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$R(Object(source), true).forEach(function (key) { _defineProperty$X(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$R(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$X(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var configureRelatedItems = function configureRelatedItems(widgetParams) {
  var makeWidget = connectConfigureRelatedItems$1(noop);
  return _objectSpread$R(_objectSpread$R({}, makeWidget(widgetParams)), {}, {
    $$widgetType: 'ais.configureRelatedItems'
  });
};

var configureRelatedItems$1 = configureRelatedItems;

function ownKeys$Q(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$Q(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$Q(Object(source), true).forEach(function (key) { _defineProperty$W(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$Q(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$W(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof$6(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof$6 = function _typeof(obj) { return typeof obj; }; } else { _typeof$6 = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof$6(obj); }
var withUsage$G = createDocumentationMessageGenerator({
  name: 'dynamic-widgets',
  connector: true
});
var MAX_WILDCARD_FACETS = 20;

var connectDynamicWidgets = function connectDynamicWidgets(renderFn) {
  var unmountFn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : noop;
  checkRendering(renderFn, withUsage$G());
  return function (widgetParams) {
    var widgets = widgetParams.widgets,
        _widgetParams$maxValu = widgetParams.maxValuesPerFacet,
        maxValuesPerFacet = _widgetParams$maxValu === void 0 ? 20 : _widgetParams$maxValu,
        _widgetParams$facets = widgetParams.facets,
        facets = _widgetParams$facets === void 0 ? ['*'] : _widgetParams$facets,
        _widgetParams$transfo = widgetParams.transformItems,
        transformItems = _widgetParams$transfo === void 0 ? function (items) {
      return items;
    } : _widgetParams$transfo,
        fallbackWidget = widgetParams.fallbackWidget;

    if (!(widgets && Array.isArray(widgets) && widgets.every(function (widget) {
      return _typeof$6(widget) === 'object';
    }))) {
      throw new Error(withUsage$G('The `widgets` option expects an array of widgets.'));
    }

    if (!(Array.isArray(facets) && facets.length <= 1 && (facets[0] === '*' || facets[0] === undefined))) {
      throw new Error(withUsage$G("The `facets` option only accepts [] or [\"*\"], you passed ".concat(JSON.stringify(facets))));
    }

    var localWidgets = new Map();
    return {
      $$type: 'ais.dynamicWidgets',
      init: function init(initOptions) {
        widgets.forEach(function (widget) {
          var attribute = getWidgetAttribute(widget, initOptions);
          localWidgets.set(attribute, {
            widget: widget,
            isMounted: false
          });
        });
        renderFn(_objectSpread$Q(_objectSpread$Q({}, this.getWidgetRenderState(initOptions)), {}, {
          instantSearchInstance: initOptions.instantSearchInstance
        }), true);
      },
      render: function render(renderOptions) {
        var parent = renderOptions.parent;
        var renderState = this.getWidgetRenderState(renderOptions);
        var widgetsToUnmount = [];
        var widgetsToMount = [];

        if (fallbackWidget) {
          renderState.attributesToRender.forEach(function (attribute) {
            if (!localWidgets.has(attribute)) {
              var widget = fallbackWidget({
                attribute: attribute
              });
              localWidgets.set(attribute, {
                widget: widget,
                isMounted: false
              });
            }
          });
        }

        localWidgets.forEach(function (_ref, attribute) {
          var widget = _ref.widget,
              isMounted = _ref.isMounted;
          var shouldMount = renderState.attributesToRender.indexOf(attribute) > -1;

          if (!isMounted && shouldMount) {
            widgetsToMount.push(widget);
            localWidgets.set(attribute, {
              widget: widget,
              isMounted: true
            });
          } else if (isMounted && !shouldMount) {
            widgetsToUnmount.push(widget);
            localWidgets.set(attribute, {
              widget: widget,
              isMounted: false
            });
          }
        });
        parent.addWidgets(widgetsToMount); // make sure this only happens after the regular render, otherwise it
        // happens too quick, since render is "deferred" for the next microtask,
        // so this needs to be a whole task later

        setTimeout(function () {
          return parent.removeWidgets(widgetsToUnmount);
        }, 0);
        renderFn(_objectSpread$Q(_objectSpread$Q({}, renderState), {}, {
          instantSearchInstance: renderOptions.instantSearchInstance
        }), false);
      },
      dispose: function dispose(_ref2) {
        var parent = _ref2.parent;
        var toRemove = [];
        localWidgets.forEach(function (_ref3) {
          var widget = _ref3.widget,
              isMounted = _ref3.isMounted;

          if (isMounted) {
            toRemove.push(widget);
          }
        });
        parent.removeWidgets(toRemove);
        unmountFn();
      },
      getWidgetSearchParameters: function getWidgetSearchParameters(state) {
        // broadening the scope of facets to avoid conflict between never and *
        return facets.reduce(function (acc, curr) {
          return acc.addFacet(curr);
        }, state.setQueryParameters({
          maxValuesPerFacet: Math.max(maxValuesPerFacet || 0, state.maxValuesPerFacet || 0)
        }));
      },
      getRenderState: function getRenderState(renderState, renderOptions) {
        return _objectSpread$Q(_objectSpread$Q({}, renderState), {}, {
          dynamicWidgets: this.getWidgetRenderState(renderOptions)
        });
      },
      getWidgetRenderState: function getWidgetRenderState(_ref4) {
        var _results$renderingCon, _results$renderingCon2, _results$renderingCon3, _results$renderingCon4;

        var results = _ref4.results,
            state = _ref4.state;

        if (!results) {
          return {
            attributesToRender: [],
            widgetParams: widgetParams
          };
        }

        var attributesToRender = transformItems((_results$renderingCon = (_results$renderingCon2 = results.renderingContent) === null || _results$renderingCon2 === void 0 ? void 0 : (_results$renderingCon3 = _results$renderingCon2.facetOrdering) === null || _results$renderingCon3 === void 0 ? void 0 : (_results$renderingCon4 = _results$renderingCon3.facets) === null || _results$renderingCon4 === void 0 ? void 0 : _results$renderingCon4.order) !== null && _results$renderingCon !== void 0 ? _results$renderingCon : [], {
          results: results
        });

        if (!Array.isArray(attributesToRender)) {
          throw new Error(withUsage$G('The `transformItems` option expects a function that returns an Array.'));
        }

        _warning(maxValuesPerFacet >= (state.maxValuesPerFacet || 0), "The maxValuesPerFacet set by dynamic widgets (".concat(maxValuesPerFacet, ") is smaller than one of the limits set by a widget (").concat(state.maxValuesPerFacet, "). This causes a mismatch in query parameters and thus an extra network request when that widget is mounted.")) ;
        _warning(attributesToRender.length <= MAX_WILDCARD_FACETS || widgetParams.facets !== undefined, "More than ".concat(MAX_WILDCARD_FACETS, " facets are requested to be displayed without explicitly setting which facets to retrieve. This could have a performance impact. Set \"facets\" to [] to do two smaller network requests, or explicitly to ['*'] to avoid this warning.")) ;
        return {
          attributesToRender: attributesToRender,
          widgetParams: widgetParams
        };
      }
    };
  };
};

var connectDynamicWidgets$1 = connectDynamicWidgets;

function ownKeys$P(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$P(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$P(Object(source), true).forEach(function (key) { _defineProperty$V(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$P(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$V(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties$8(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose$8(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose$8(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
var withUsage$F = createDocumentationMessageGenerator({
  name: 'dynamic-widgets'
});
var suit$m = component('DynamicWidgets');

function createContainer(rootContainer) {
  var container = document.createElement('div');
  container.className = suit$m({
    descendantName: 'widget'
  });
  rootContainer.appendChild(container);
  return container;
}

var dynamicWidgets = function dynamicWidgets(widgetParams) {
  var _ref = widgetParams || {},
      containerSelector = _ref.container,
      widgets = _ref.widgets,
      fallbackWidget = _ref.fallbackWidget,
      otherWidgetParams = _objectWithoutProperties$8(_ref, ["container", "widgets", "fallbackWidget"]);

  if (!containerSelector) {
    throw new Error(withUsage$F('The `container` option is required.'));
  }

  if (!(widgets && Array.isArray(widgets) && widgets.every(function (widget) {
    return typeof widget === 'function';
  }))) {
    throw new Error(withUsage$F('The `widgets` option expects an array of callbacks.'));
  }

  var userContainer = getContainerNode(containerSelector);
  var rootContainer = document.createElement('div');
  rootContainer.className = suit$m();
  var containers = new Map();
  var connectorWidgets = [];
  var makeWidget = connectDynamicWidgets$1(function (_ref2, isFirstRender) {
    var attributesToRender = _ref2.attributesToRender;

    if (isFirstRender) {
      userContainer.appendChild(rootContainer);
    }

    attributesToRender.forEach(function (attribute) {
      if (!containers.has(attribute)) {
        return;
      }

      var container = containers.get(attribute);
      rootContainer.appendChild(container);
    });
  }, function () {
    userContainer.removeChild(rootContainer);
  });
  var widget = makeWidget(_objectSpread$P(_objectSpread$P({}, otherWidgetParams), {}, {
    widgets: connectorWidgets,
    fallbackWidget: typeof fallbackWidget === 'function' ? function (_ref3) {
      var attribute = _ref3.attribute;
      var container = createContainer(rootContainer);
      containers.set(attribute, container);
      return fallbackWidget({
        attribute: attribute,
        container: container
      });
    } : undefined
  }));
  return _objectSpread$P(_objectSpread$P({}, widget), {}, {
    init: function init(initOptions) {
      widgets.forEach(function (cb) {
        var container = createContainer(rootContainer);
        var childWidget = cb(container);
        var attribute = getWidgetAttribute(childWidget, initOptions);
        containers.set(attribute, container);
        connectorWidgets.push(childWidget);
      });
      widget.init(initOptions);
    },
    $$widgetType: 'ais.dynamicWidgets'
  });
};

var dynamicWidgets$1 = dynamicWidgets;

function ownKeys$O(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$O(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$O(Object(source), true).forEach(function (key) { _defineProperty$U(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$O(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$U(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var withUsage$E = createDocumentationMessageGenerator({
  name: 'geo-search',
  connector: true
}); // in this connector, we assume insideBoundingBox is only a string,
// even though in the helper it's defined as number[][] alone.
// This can be done, since the connector assumes "control" of the parameter

function getBoundingBoxAsString(state) {
  return state.insideBoundingBox || '';
}

function setBoundingBoxAsString(state, value) {
  return state.setQueryParameter('insideBoundingBox', value);
}

var $$type$4 = 'ais.geoSearch';

/**
 * The **GeoSearch** connector provides the logic to build a widget that will display the results on a map. It also provides a way to search for results based on their position. The connector provides functions to manage the search experience (search on map interaction or control the interaction for example).
 *
 * @requirements
 *
 * Note that the GeoSearch connector uses the [geosearch](https://www.algolia.com/doc/guides/searching/geo-search) capabilities of Algolia. Your hits **must** have a `_geoloc` attribute in order to be passed to the rendering function.
 *
 * Currently, the feature is not compatible with multiple values in the _geoloc attribute.
 */
var connectGeoSearch = function connectGeoSearch(renderFn) {
  var unmountFn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : noop;
  checkRendering(renderFn, withUsage$E());
  return function (widgetParams) {
    var _ref = widgetParams || {},
        _ref$enableRefineOnMa = _ref.enableRefineOnMapMove,
        enableRefineOnMapMove = _ref$enableRefineOnMa === void 0 ? true : _ref$enableRefineOnMa,
        _ref$transformItems = _ref.transformItems,
        transformItems = _ref$transformItems === void 0 ? function (items) {
      return items;
    } : _ref$transformItems;

    var widgetState = {
      isRefineOnMapMove: enableRefineOnMapMove,
      // @MAJOR hasMapMoveSinceLastRefine -> hasMapMovedSinceLastRefine
      hasMapMoveSinceLastRefine: false,
      lastRefinePosition: '',
      lastRefineBoundingBox: '',
      internalToggleRefineOnMapMove: noop,
      internalSetMapMoveSinceLastRefine: noop
    };

    var getPositionFromState = function getPositionFromState(state) {
      return state.aroundLatLng ? aroundLatLngToPosition(state.aroundLatLng) : undefined;
    };

    var getCurrentRefinementFromState = function getCurrentRefinementFromState(state) {
      return state.insideBoundingBox && insideBoundingBoxToBoundingBox(state.insideBoundingBox);
    };

    var refine = function refine(helper) {
      return function (_ref2) {
        var ne = _ref2.northEast,
            sw = _ref2.southWest;
        var boundingBox = [ne.lat, ne.lng, sw.lat, sw.lng].join();
        helper.setState(setBoundingBoxAsString(helper.state, boundingBox).resetPage()).search();
        widgetState.hasMapMoveSinceLastRefine = false;
        widgetState.lastRefineBoundingBox = boundingBox;
      };
    };

    var clearMapRefinement = function clearMapRefinement(helper) {
      return function () {
        helper.setQueryParameter('insideBoundingBox', undefined).search();
      };
    };

    var isRefinedWithMap = function isRefinedWithMap(state) {
      return function () {
        return Boolean(state.insideBoundingBox);
      };
    };

    var toggleRefineOnMapMove = function toggleRefineOnMapMove() {
      return widgetState.internalToggleRefineOnMapMove();
    };

    var createInternalToggleRefinementOnMapMove = function createInternalToggleRefinementOnMapMove(renderOptions, render) {
      return function () {
        widgetState.isRefineOnMapMove = !widgetState.isRefineOnMapMove;
        render(renderOptions);
      };
    };

    var isRefineOnMapMove = function isRefineOnMapMove() {
      return widgetState.isRefineOnMapMove;
    };

    var setMapMoveSinceLastRefine = function setMapMoveSinceLastRefine() {
      return widgetState.internalSetMapMoveSinceLastRefine();
    };

    var createInternalSetMapMoveSinceLastRefine = function createInternalSetMapMoveSinceLastRefine(renderOptions, render) {
      return function () {
        var shouldTriggerRender = widgetState.hasMapMoveSinceLastRefine !== true;
        widgetState.hasMapMoveSinceLastRefine = true;

        if (shouldTriggerRender) {
          render(renderOptions);
        }
      };
    };

    var hasMapMoveSinceLastRefine = function hasMapMoveSinceLastRefine() {
      return widgetState.hasMapMoveSinceLastRefine;
    };

    var sendEvent;
    return {
      $$type: $$type$4,
      init: function init(initArgs) {
        var instantSearchInstance = initArgs.instantSearchInstance;
        var isFirstRendering = true;
        widgetState.internalToggleRefineOnMapMove = createInternalToggleRefinementOnMapMove(initArgs, noop);
        widgetState.internalSetMapMoveSinceLastRefine = createInternalSetMapMoveSinceLastRefine(initArgs, noop);
        renderFn(_objectSpread$O(_objectSpread$O({}, this.getWidgetRenderState(initArgs)), {}, {
          instantSearchInstance: instantSearchInstance
        }), isFirstRendering);
      },
      render: function render(renderArgs) {
        var helper = renderArgs.helper,
            instantSearchInstance = renderArgs.instantSearchInstance;
        var isFirstRendering = false; // We don't use the state provided by the render function because we need
        // to be sure that the state is the latest one for the following condition

        var state = helper.state;
        var positionChangedSinceLastRefine = Boolean(state.aroundLatLng) && Boolean(widgetState.lastRefinePosition) && state.aroundLatLng !== widgetState.lastRefinePosition;
        var boundingBoxChangedSinceLastRefine = !state.insideBoundingBox && Boolean(widgetState.lastRefineBoundingBox) && state.insideBoundingBox !== widgetState.lastRefineBoundingBox;

        if (positionChangedSinceLastRefine || boundingBoxChangedSinceLastRefine) {
          widgetState.hasMapMoveSinceLastRefine = false;
        }

        widgetState.lastRefinePosition = state.aroundLatLng || '';
        widgetState.lastRefineBoundingBox = getBoundingBoxAsString(state);
        widgetState.internalToggleRefineOnMapMove = createInternalToggleRefinementOnMapMove(renderArgs, this.render.bind(this));
        widgetState.internalSetMapMoveSinceLastRefine = createInternalSetMapMoveSinceLastRefine(renderArgs, this.render.bind(this));
        var widgetRenderState = this.getWidgetRenderState(renderArgs);
        sendEvent('view', widgetRenderState.items);
        renderFn(_objectSpread$O(_objectSpread$O({}, widgetRenderState), {}, {
          instantSearchInstance: instantSearchInstance
        }), isFirstRendering);
      },
      getWidgetRenderState: function getWidgetRenderState(renderOptions) {
        var helper = renderOptions.helper,
            results = renderOptions.results,
            instantSearchInstance = renderOptions.instantSearchInstance;
        var state = helper.state;
        var items = results ? transformItems(results.hits.filter(function (hit) {
          return hit._geoloc;
        }), {
          results: results
        }) : [];

        if (!sendEvent) {
          sendEvent = createSendEventForHits({
            instantSearchInstance: instantSearchInstance,
            index: helper.getIndex(),
            widgetType: $$type$4
          });
        }

        return {
          items: items,
          position: getPositionFromState(state),
          currentRefinement: getCurrentRefinementFromState(state),
          refine: refine(helper),
          sendEvent: sendEvent,
          clearMapRefinement: clearMapRefinement(helper),
          isRefinedWithMap: isRefinedWithMap(state),
          toggleRefineOnMapMove: toggleRefineOnMapMove,
          isRefineOnMapMove: isRefineOnMapMove,
          setMapMoveSinceLastRefine: setMapMoveSinceLastRefine,
          hasMapMoveSinceLastRefine: hasMapMoveSinceLastRefine,
          widgetParams: widgetParams
        };
      },
      getRenderState: function getRenderState(renderState, renderOptions) {
        return _objectSpread$O(_objectSpread$O({}, renderState), {}, {
          geoSearch: this.getWidgetRenderState(renderOptions)
        });
      },
      dispose: function dispose(_ref3) {
        var state = _ref3.state;
        unmountFn();
        return state.setQueryParameter('insideBoundingBox', undefined);
      },
      getWidgetUiState: function getWidgetUiState(uiState, _ref4) {
        var searchParameters = _ref4.searchParameters;
        var boundingBox = getBoundingBoxAsString(searchParameters);

        if (!boundingBox || uiState && uiState.geoSearch && uiState.geoSearch.boundingBox === boundingBox) {
          return uiState;
        }

        return _objectSpread$O(_objectSpread$O({}, uiState), {}, {
          geoSearch: {
            boundingBox: boundingBox
          }
        });
      },
      getWidgetSearchParameters: function getWidgetSearchParameters(searchParameters, _ref5) {
        var uiState = _ref5.uiState;

        if (!uiState || !uiState.geoSearch) {
          return searchParameters.setQueryParameter('insideBoundingBox', undefined);
        }

        return setBoundingBoxAsString(searchParameters, uiState.geoSearch.boundingBox);
      }
    };
  };
};

var connectGeoSearch$1 = connectGeoSearch;

var GeoSearchButton = function GeoSearchButton(_ref) {
  var className = _ref.className,
      _ref$disabled = _ref.disabled,
      disabled = _ref$disabled === void 0 ? false : _ref$disabled,
      onClick = _ref.onClick,
      children = _ref.children;
  return h$1("button", {
    className: className,
    onClick: onClick,
    disabled: disabled
  }, children);
};

var GeoSearchButton$1 = GeoSearchButton;

var GeoSearchToggle = function GeoSearchToggle(_ref) {
  var classNameLabel = _ref.classNameLabel,
      classNameInput = _ref.classNameInput,
      checked = _ref.checked,
      onToggle = _ref.onToggle,
      children = _ref.children;
  return h$1("label", {
    className: classNameLabel
  }, h$1("input", {
    className: classNameInput,
    type: "checkbox",
    checked: checked,
    onChange: onToggle
  }), children);
};

var GeoSearchToggle$1 = GeoSearchToggle;

function _extends$a() { _extends$a = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$a.apply(this, arguments); }

var GeoSearchControls = function GeoSearchControls(_ref) {
  var cssClasses = _ref.cssClasses,
      enableRefine = _ref.enableRefine,
      enableRefineControl = _ref.enableRefineControl,
      enableClearMapRefinement = _ref.enableClearMapRefinement,
      isRefineOnMapMove = _ref.isRefineOnMapMove,
      isRefinedWithMap = _ref.isRefinedWithMap,
      hasMapMoveSinceLastRefine = _ref.hasMapMoveSinceLastRefine,
      onRefineToggle = _ref.onRefineToggle,
      onRefineClick = _ref.onRefineClick,
      onClearClick = _ref.onClearClick,
      templateProps = _ref.templateProps;
  return h$1(p$1, null, enableRefine && h$1("div", null, enableRefineControl && h$1("div", {
    className: cssClasses.control
  }, isRefineOnMapMove || !hasMapMoveSinceLastRefine ? h$1(GeoSearchToggle$1, {
    classNameLabel: cx(cssClasses.label, isRefineOnMapMove && cssClasses.selectedLabel),
    classNameInput: cssClasses.input,
    checked: isRefineOnMapMove,
    onToggle: onRefineToggle
  }, h$1(Template$1, _extends$a({}, templateProps, {
    templateKey: "toggle",
    rootTagName: "span"
  }))) : h$1(GeoSearchButton$1, {
    className: cssClasses.redo,
    disabled: !hasMapMoveSinceLastRefine,
    onClick: onRefineClick
  }, h$1(Template$1, _extends$a({}, templateProps, {
    templateKey: "redo",
    rootTagName: "span"
  })))), !enableRefineControl && !isRefineOnMapMove && h$1("div", {
    className: cssClasses.control
  }, h$1(GeoSearchButton$1, {
    className: cx(cssClasses.redo, !hasMapMoveSinceLastRefine && cssClasses.disabledRedo),
    disabled: !hasMapMoveSinceLastRefine,
    onClick: onRefineClick
  }, h$1(Template$1, _extends$a({}, templateProps, {
    templateKey: "redo",
    rootTagName: "span"
  })))), enableClearMapRefinement && isRefinedWithMap && h$1(GeoSearchButton$1, {
    className: cssClasses.reset,
    onClick: onClearClick
  }, h$1(Template$1, _extends$a({}, templateProps, {
    templateKey: "reset",
    rootTagName: "span"
  })))));
};

var GeoSearchControls$1 = GeoSearchControls;

function ownKeys$N(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$N(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$N(Object(source), true).forEach(function (key) { _defineProperty$T(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$N(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$T(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray$8(arr, i) { return _arrayWithHoles$8(arr) || _iterableToArrayLimit$8(arr, i) || _unsupportedIterableToArray$c(arr, i) || _nonIterableRest$8(); }

function _nonIterableRest$8() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray$c(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$c(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$c(o, minLen); }

function _arrayLikeToArray$c(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit$8(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles$8(arr) { if (Array.isArray(arr)) return arr; }

var refineWithMap = function refineWithMap(_ref) {
  var refine = _ref.refine,
      mapInstance = _ref.mapInstance;
  return refine({
    northEast: mapInstance.getBounds().getNorthEast().toJSON(),
    southWest: mapInstance.getBounds().getSouthWest().toJSON()
  });
};

var collectMarkersForNextRender = function collectMarkersForNextRender(markers, nextIds) {
  return markers.reduce(function (_ref2, marker) {
    var _ref3 = _slicedToArray$8(_ref2, 2),
        update = _ref3[0],
        exit = _ref3[1];

    var persist = nextIds.includes(marker.__id);
    return persist ? [update.concat(marker), exit] : [update, exit.concat(marker)];
  }, [[], []]);
};

var createBoundingBoxFromMarkers = function createBoundingBoxFromMarkers(google, markers) {
  var latLngBounds = markers.reduce(function (acc, marker) {
    return acc.extend(marker.getPosition());
  }, new google.maps.LatLngBounds());
  return {
    northEast: latLngBounds.getNorthEast().toJSON(),
    southWest: latLngBounds.getSouthWest().toJSON()
  };
};

var lockUserInteraction = function lockUserInteraction(renderState, functionThatAltersTheMapPosition) {
  renderState.isUserInteraction = false;
  functionThatAltersTheMapPosition();
  renderState.isUserInteraction = true;
};

var renderer$l = function renderer(_ref4, isFirstRendering) {
  var items = _ref4.items,
      position = _ref4.position,
      currentRefinement = _ref4.currentRefinement,
      refine = _ref4.refine,
      clearMapRefinement = _ref4.clearMapRefinement,
      toggleRefineOnMapMove = _ref4.toggleRefineOnMapMove,
      isRefineOnMapMove = _ref4.isRefineOnMapMove,
      setMapMoveSinceLastRefine = _ref4.setMapMoveSinceLastRefine,
      hasMapMoveSinceLastRefine = _ref4.hasMapMoveSinceLastRefine,
      isRefinedWithMap = _ref4.isRefinedWithMap,
      widgetParams = _ref4.widgetParams,
      instantSearchInstance = _ref4.instantSearchInstance;
  var container = widgetParams.container,
      googleReference = widgetParams.googleReference,
      cssClasses = widgetParams.cssClasses,
      templates = widgetParams.templates,
      initialZoom = widgetParams.initialZoom,
      initialPosition = widgetParams.initialPosition,
      enableRefine = widgetParams.enableRefine,
      enableClearMapRefinement = widgetParams.enableClearMapRefinement,
      enableRefineControl = widgetParams.enableRefineControl,
      mapOptions = widgetParams.mapOptions,
      createMarker = widgetParams.createMarker,
      markerOptions = widgetParams.markerOptions,
      renderState = widgetParams.renderState;

  if (isFirstRendering) {
    renderState.isUserInteraction = true;
    renderState.isPendingRefine = false;
    renderState.markers = [];
    var rootElement = document.createElement('div');
    rootElement.className = cssClasses.root;
    container.appendChild(rootElement);
    var mapElement = document.createElement('div');
    mapElement.className = cssClasses.map;
    rootElement.appendChild(mapElement);
    var treeElement = document.createElement('div');
    treeElement.className = cssClasses.tree;
    rootElement.appendChild(treeElement);
    renderState.mapInstance = new googleReference.maps.Map(mapElement, _objectSpread$N({
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      clickableIcons: false,
      zoomControlOptions: {
        position: googleReference.maps.ControlPosition.LEFT_TOP
      }
    }, mapOptions));

    var setupListenersWhenMapIsReady = function setupListenersWhenMapIsReady() {
      var onChange = function onChange() {
        if (renderState.isUserInteraction && enableRefine) {
          setMapMoveSinceLastRefine();

          if (isRefineOnMapMove()) {
            renderState.isPendingRefine = true;
          }
        }
      };

      renderState.mapInstance.addListener('center_changed', onChange);
      renderState.mapInstance.addListener('zoom_changed', onChange);
      renderState.mapInstance.addListener('dragstart', onChange);
      renderState.mapInstance.addListener('idle', function () {
        if (renderState.isUserInteraction && renderState.isPendingRefine) {
          renderState.isPendingRefine = false;
          refineWithMap({
            mapInstance: renderState.mapInstance,
            refine: refine
          });
        }
      });
    };

    googleReference.maps.event.addListenerOnce(renderState.mapInstance, 'idle', setupListenersWhenMapIsReady);
    renderState.templateProps = prepareTemplateProps({
      templatesConfig: instantSearchInstance.templatesConfig,
      templates: templates
    });
    return;
  } // Collect markers that need to be updated or removed


  var nextItemsIds = items.map(function (_) {
    return _.objectID;
  });

  var _collectMarkersForNex = collectMarkersForNextRender(renderState.markers, nextItemsIds),
      _collectMarkersForNex2 = _slicedToArray$8(_collectMarkersForNex, 2),
      updateMarkers = _collectMarkersForNex2[0],
      exitMarkers = _collectMarkersForNex2[1]; // Collect items that will be added


  var updateMarkerIds = updateMarkers.map(function (_) {
    return _.__id;
  });
  var nextPendingItems = items.filter(function (item) {
    return !updateMarkerIds.includes(item.objectID);
  }); // Remove all markers that need to be removed

  exitMarkers.forEach(function (marker) {
    return marker.setMap(null);
  }); // Create the markers from the items

  renderState.markers = updateMarkers.concat(nextPendingItems.map(function (item) {
    var marker = createMarker({
      map: renderState.mapInstance,
      item: item
    });
    Object.keys(markerOptions.events).forEach(function (eventName) {
      marker.addListener(eventName, function (event) {
        markerOptions.events[eventName]({
          map: renderState.mapInstance,
          event: event,
          item: item,
          marker: marker
        });
      });
    });
    return marker;
  }));
  var shouldUpdate = !hasMapMoveSinceLastRefine(); // We use this value for differentiate the padding to apply during
  // fitBounds. When we don't have a currenRefinement (boundingBox)
  // we let Google Maps compute the automatic padding. But when we
  // provide the currentRefinement we explicitly set the padding
  // to `0` otherwise the map will decrease the zoom on each refine.

  var boundingBoxPadding = currentRefinement ? 0 : null;
  var boundingBox = !currentRefinement && Boolean(renderState.markers.length) ? createBoundingBoxFromMarkers(googleReference, renderState.markers) : currentRefinement;

  if (boundingBox && shouldUpdate) {
    lockUserInteraction(renderState, function () {
      renderState.mapInstance.fitBounds(new googleReference.maps.LatLngBounds(boundingBox.southWest, boundingBox.northEast), boundingBoxPadding);
    });
  } else if (shouldUpdate) {
    lockUserInteraction(renderState, function () {
      renderState.mapInstance.setCenter(position || initialPosition);
      renderState.mapInstance.setZoom(initialZoom);
    });
  }

  P(h$1(GeoSearchControls$1, {
    cssClasses: cssClasses,
    enableRefine: enableRefine,
    enableRefineControl: enableRefineControl,
    enableClearMapRefinement: enableClearMapRefinement,
    isRefineOnMapMove: isRefineOnMapMove(),
    isRefinedWithMap: isRefinedWithMap(),
    hasMapMoveSinceLastRefine: hasMapMoveSinceLastRefine(),
    onRefineToggle: toggleRefineOnMapMove,
    onRefineClick: function onRefineClick() {
      return refineWithMap({
        mapInstance: renderState.mapInstance,
        refine: refine
      });
    },
    onClearClick: clearMapRefinement,
    templateProps: renderState.templateProps
  }), container.querySelector(".".concat(cssClasses.tree)));
};

var renderer$m = renderer$l;

var _ref = h$1("p", null, "Your custom HTML Marker");

var defaultTemplates$r = {
  HTMLMarker: function HTMLMarker() {
    return _ref;
  },
  reset: function reset() {
    return 'Clear the map refinement';
  },
  toggle: function toggle() {
    return 'Search as I move the map';
  },
  redo: function redo() {
    return 'Redo search here';
  }
};
var defaultTemplates$s = defaultTemplates$r;

function _typeof$5(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof$5 = function _typeof(obj) { return typeof obj; }; } else { _typeof$5 = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof$5(obj); }

function _classCallCheck$6(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties$6(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass$6(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties$6(Constructor.prototype, protoProps); if (staticProps) _defineProperties$6(Constructor, staticProps); return Constructor; }

function _inherits$5(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf$5(subClass, superClass); }

function _setPrototypeOf$5(o, p) { _setPrototypeOf$5 = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf$5(o, p); }

function _createSuper$5(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$5(); return function _createSuperInternal() { var Super = _getPrototypeOf$5(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf$5(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn$5(this, result); }; }

function _possibleConstructorReturn$5(self, call) { if (call && (_typeof$5(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized$5(self); }

function _assertThisInitialized$5(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct$5() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf$5(o) { _getPrototypeOf$5 = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf$5(o); }

function _defineProperty$S(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var createHTMLMarker = function createHTMLMarker(googleReference) {
  var HTMLMarker = /*#__PURE__*/function (_googleReference$maps) {
    _inherits$5(HTMLMarker, _googleReference$maps);

    var _super = _createSuper$5(HTMLMarker);

    function HTMLMarker(_ref) {
      var _this;

      var __id = _ref.__id,
          position = _ref.position,
          map = _ref.map,
          template = _ref.template,
          className = _ref.className,
          _ref$anchor = _ref.anchor,
          anchor = _ref$anchor === void 0 ? {
        x: 0,
        y: 0
      } : _ref$anchor;

      _classCallCheck$6(this, HTMLMarker);

      _this = _super.call(this);

      _defineProperty$S(_assertThisInitialized$5(_this), "__id", void 0);

      _defineProperty$S(_assertThisInitialized$5(_this), "anchor", void 0);

      _defineProperty$S(_assertThisInitialized$5(_this), "offset", void 0);

      _defineProperty$S(_assertThisInitialized$5(_this), "listeners", void 0);

      _defineProperty$S(_assertThisInitialized$5(_this), "latLng", void 0);

      _defineProperty$S(_assertThisInitialized$5(_this), "element", void 0);

      _this.__id = __id;
      _this.anchor = anchor;
      _this.listeners = {};
      _this.latLng = new googleReference.maps.LatLng(position);
      _this.element = document.createElement('div');
      _this.element.className = className;
      _this.element.style.position = 'absolute';

      if (_typeof$5(template) === 'object') {
        P(template, _this.element);
      } else {
        _this.element.innerHTML = template;
      }

      _this.setMap(map);

      return _this;
    }

    _createClass$6(HTMLMarker, [{
      key: "onAdd",
      value: function onAdd() {
        // Append the element to the map
        this.getPanes().overlayMouseTarget.appendChild(this.element); // Compute the offset onAdd & cache it because afterwards
        // it won't retrieve the correct values, we also avoid
        // to read the values on every draw

        var bbBox = this.element.getBoundingClientRect();
        this.offset = {
          x: this.anchor.x + bbBox.width / 2,
          y: this.anchor.y + bbBox.height
        }; // Force the width of the element will avoid the
        // content to collapse when we move the map

        this.element.style.width = "".concat(bbBox.width, "px");
      }
    }, {
      key: "draw",
      value: function draw() {
        var position = this.getProjection().fromLatLngToDivPixel(this.latLng);
        this.element.style.left = "".concat(Math.round(position.x - this.offset.x), "px");
        this.element.style.top = "".concat(Math.round(position.y - this.offset.y), "px"); // Markers to the south are in front of markers to the north
        // This is the default behaviour of Google Maps

        this.element.style.zIndex = String(parseInt(this.element.style.top, 10));
      }
    }, {
      key: "onRemove",
      value: function onRemove() {
        var _this2 = this;

        if (this.element) {
          this.element.parentNode.removeChild(this.element);
          Object.keys(this.listeners).forEach(function (eventName) {
            _this2.element.removeEventListener(eventName, _this2.listeners[eventName]);
          }); // after onRemove the class is no longer used, thus it can be deleted
          // @ts-expect-error

          delete this.element; // @ts-expect-error

          delete this.listeners;
        }
      }
    }, {
      key: "addListener",
      value: function addListener(eventName, listener) {
        this.listeners[eventName] = listener;
        var element = this.element;
        element.addEventListener(eventName, listener);
        return {
          remove: function remove() {
            return element.removeEventListener(eventName, listener);
          }
        };
      }
    }, {
      key: "getPosition",
      value: function getPosition() {
        return this.latLng;
      }
    }]);

    return HTMLMarker;
  }(googleReference.maps.OverlayView);

  return HTMLMarker;
};

var createHTMLMarker$1 = createHTMLMarker;

function ownKeys$M(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$M(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$M(Object(source), true).forEach(function (key) { _defineProperty$R(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$M(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$R(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties$7(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose$7(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose$7(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
var withUsage$D = createDocumentationMessageGenerator({
  name: 'geo-search'
});
var suit$l = component('GeoSearch');

/**
 * The **GeoSearch** widget displays the list of results from the search on a Google Maps. It also provides a way to search for results based on their position. The widget also provide some of the common GeoSearch patterns like search on map interaction.
 *
 * @requirements
 *
 * Note that the GeoSearch widget uses the [geosearch](https://www.algolia.com/doc/guides/searching/geo-search) capabilities of Algolia. Your hits **must** have a `_geoloc` attribute in order to be displayed on the map.
 *
 * Currently, the feature is not compatible with multiple values in the _geoloc attribute.
 *
 * You are also responsible for loading the Google Maps library, it's not shipped with InstantSearch. You need to load the Google Maps library and pass a reference to the widget. You can find more information about how to install the library in [the Google Maps documentation](https://developers.google.com/maps/documentation/javascript/tutorial).
 *
 * Don't forget to explicitly set the `height` of the map container (default class `.ais-geo-search--map`), otherwise it won't be shown (it's a requirement of Google Maps).
 */
var geoSearch = function geoSearch(widgetParams) {
  var _ref = widgetParams || {},
      _ref$initialZoom = _ref.initialZoom,
      initialZoom = _ref$initialZoom === void 0 ? 1 : _ref$initialZoom,
      _ref$initialPosition = _ref.initialPosition,
      initialPosition = _ref$initialPosition === void 0 ? {
    lat: 0,
    lng: 0
  } : _ref$initialPosition,
      _ref$templates = _ref.templates,
      userTemplates = _ref$templates === void 0 ? {} : _ref$templates,
      _ref$cssClasses = _ref.cssClasses,
      userCssClasses = _ref$cssClasses === void 0 ? {} : _ref$cssClasses,
      _ref$builtInMarker = _ref.builtInMarker,
      userBuiltInMarker = _ref$builtInMarker === void 0 ? {} : _ref$builtInMarker,
      userCustomHTMLMarker = _ref.customHTMLMarker,
      _ref$enableRefine = _ref.enableRefine,
      enableRefine = _ref$enableRefine === void 0 ? true : _ref$enableRefine,
      _ref$enableClearMapRe = _ref.enableClearMapRefinement,
      enableClearMapRefinement = _ref$enableClearMapRe === void 0 ? true : _ref$enableClearMapRe,
      _ref$enableRefineCont = _ref.enableRefineControl,
      enableRefineControl = _ref$enableRefineCont === void 0 ? true : _ref$enableRefineCont,
      container = _ref.container,
      googleReference = _ref.googleReference,
      otherWidgetParams = _objectWithoutProperties$7(_ref, ["initialZoom", "initialPosition", "templates", "cssClasses", "builtInMarker", "customHTMLMarker", "enableRefine", "enableClearMapRefinement", "enableRefineControl", "container", "googleReference"]);

  var defaultBuiltInMarker = {
    createOptions: function createOptions() {
      return {};
    },
    events: {}
  };
  var defaultCustomHTMLMarker = {
    createOptions: function createOptions() {
      return {};
    },
    events: {}
  };

  if (!container) {
    throw new Error(withUsage$D('The `container` option is required.'));
  }

  if (!googleReference) {
    throw new Error(withUsage$D('The `googleReference` option is required.'));
  }

  var containerNode = getContainerNode(container);
  var cssClasses = {
    root: cx(suit$l(), userCssClasses.root),
    // Required only to mount / unmount the Preact tree
    tree: suit$l({
      descendantName: 'tree'
    }),
    map: cx(suit$l({
      descendantName: 'map'
    }), userCssClasses.map),
    control: cx(suit$l({
      descendantName: 'control'
    }), userCssClasses.control),
    label: cx(suit$l({
      descendantName: 'label'
    }), userCssClasses.label),
    selectedLabel: cx(suit$l({
      descendantName: 'label',
      modifierName: 'selected'
    }), userCssClasses.selectedLabel),
    input: cx(suit$l({
      descendantName: 'input'
    }), userCssClasses.input),
    redo: cx(suit$l({
      descendantName: 'redo'
    }), userCssClasses.redo),
    disabledRedo: cx(suit$l({
      descendantName: 'redo',
      modifierName: 'disabled'
    }), userCssClasses.disabledRedo),
    reset: cx(suit$l({
      descendantName: 'reset'
    }), userCssClasses.reset)
  };

  var templates = _objectSpread$M(_objectSpread$M({}, defaultTemplates$s), userTemplates);

  var builtInMarker = _objectSpread$M(_objectSpread$M({}, defaultBuiltInMarker), userBuiltInMarker);

  var isCustomHTMLMarker = Boolean(userCustomHTMLMarker) || Boolean(userTemplates.HTMLMarker);

  var customHTMLMarker = isCustomHTMLMarker && _objectSpread$M(_objectSpread$M({}, defaultCustomHTMLMarker), userCustomHTMLMarker);

  var createBuiltInMarker = function createBuiltInMarker(_ref2) {
    var item = _ref2.item,
        rest = _objectWithoutProperties$7(_ref2, ["item"]);

    return new googleReference.maps.Marker(_objectSpread$M(_objectSpread$M(_objectSpread$M({}, builtInMarker.createOptions(item)), rest), {}, {
      // @ts-expect-error @types/googlemaps doesn't document this
      __id: item.objectID,
      position: item._geoloc
    }));
  };

  var HTMLMarker = createHTMLMarker$1(googleReference);

  var createCustomHTMLMarker = function createCustomHTMLMarker(_ref3) {
    var item = _ref3.item,
        rest = _objectWithoutProperties$7(_ref3, ["item"]);

    return new HTMLMarker(_objectSpread$M(_objectSpread$M(_objectSpread$M({}, customHTMLMarker.createOptions(item)), rest), {}, {
      __id: item.objectID,
      position: item._geoloc,
      className: cx(suit$l({
        descendantName: 'marker'
      })),
      template: renderTemplate({
        templateKey: 'HTMLMarker',
        templates: templates,
        data: item
      })
    }));
  };

  var createMarker = !customHTMLMarker ? createBuiltInMarker : createCustomHTMLMarker;
  var markerOptions = !customHTMLMarker ? builtInMarker : customHTMLMarker;
  var makeWidget = connectGeoSearch$1(renderer$m, function () {
    return P(null, containerNode);
  });
  return _objectSpread$M(_objectSpread$M({}, makeWidget(_objectSpread$M(_objectSpread$M({}, otherWidgetParams), {}, {
    renderState: {},
    container: containerNode,
    googleReference: googleReference,
    initialZoom: initialZoom,
    initialPosition: initialPosition,
    templates: templates,
    cssClasses: cssClasses,
    createMarker: createMarker,
    markerOptions: markerOptions,
    enableRefine: enableRefine,
    enableClearMapRefinement: enableClearMapRefinement,
    enableRefineControl: enableRefineControl
  }))), {}, {
    $$widgetType: 'ais.geoSearch'
  });
};

var geoSearch$1 = geoSearch;

function _extends$9() { _extends$9 = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$9.apply(this, arguments); }

function RefinementListItem(_ref) {
  var className = _ref.className,
      handleClick = _ref.handleClick,
      facetValueToRefine = _ref.facetValueToRefine,
      isRefined = _ref.isRefined,
      templateProps = _ref.templateProps,
      templateKey = _ref.templateKey,
      templateData = _ref.templateData,
      subItems = _ref.subItems;
  return h$1("li", {
    className: className,
    onClick: function onClick(originalEvent) {
      handleClick({
        facetValueToRefine: facetValueToRefine,
        isRefined: isRefined,
        originalEvent: originalEvent
      });
    }
  }, h$1(Template$1, _extends$9({}, templateProps, {
    templateKey: templateKey,
    data: templateData
  })), subItems);
}

function _typeof$4(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof$4 = function _typeof(obj) { return typeof obj; }; } else { _typeof$4 = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof$4(obj); }

function _classCallCheck$5(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties$5(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass$5(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties$5(Constructor.prototype, protoProps); if (staticProps) _defineProperties$5(Constructor, staticProps); return Constructor; }

function _inherits$4(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf$4(subClass, superClass); }

function _setPrototypeOf$4(o, p) { _setPrototypeOf$4 = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf$4(o, p); }

function _createSuper$4(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$4(); return function _createSuperInternal() { var Super = _getPrototypeOf$4(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf$4(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn$4(this, result); }; }

function _possibleConstructorReturn$4(self, call) { if (call && (_typeof$4(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized$4(self); }

function _assertThisInitialized$4(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct$4() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf$4(o) { _getPrototypeOf$4 = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf$4(o); }

function _defineProperty$Q(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var defaultProps$1 = {
  query: '',
  showSubmit: true,
  showReset: true,
  showLoadingIndicator: true,
  autofocus: false,
  searchAsYouType: true,
  isSearchStalled: false,
  disabled: false,
  onChange: noop,
  onSubmit: noop,
  onReset: noop,
  refine: noop
};

var SearchBox = /*#__PURE__*/function (_Component) {
  _inherits$4(SearchBox, _Component);

  var _super = _createSuper$4(SearchBox);

  function SearchBox() {
    var _this;

    _classCallCheck$5(this, SearchBox);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty$Q(_assertThisInitialized$4(_this), "state", {
      query: _this.props.query,
      focused: false
    });

    _defineProperty$Q(_assertThisInitialized$4(_this), "input", y$1());

    _defineProperty$Q(_assertThisInitialized$4(_this), "onInput", function (event) {
      var _this$props = _this.props,
          searchAsYouType = _this$props.searchAsYouType,
          refine = _this$props.refine,
          onChange = _this$props.onChange;
      var query = event.target.value;

      if (searchAsYouType) {
        refine(query);
      }

      _this.setState({
        query: query
      });

      onChange(event);
    });

    _defineProperty$Q(_assertThisInitialized$4(_this), "onSubmit", function (event) {
      var _this$props2 = _this.props,
          searchAsYouType = _this$props2.searchAsYouType,
          refine = _this$props2.refine,
          onSubmit = _this$props2.onSubmit;
      event.preventDefault();
      event.stopPropagation();

      if (_this.input.current) {
        _this.input.current.blur();
      }

      if (!searchAsYouType) {
        refine(_this.state.query);
      }

      onSubmit(event);
      return false;
    });

    _defineProperty$Q(_assertThisInitialized$4(_this), "onReset", function (event) {
      var _this$props3 = _this.props,
          refine = _this$props3.refine,
          onReset = _this$props3.onReset;
      var query = '';

      if (_this.input.current) {
        _this.input.current.focus();
      }

      refine(query);

      _this.setState({
        query: query
      });

      onReset(event);
    });

    _defineProperty$Q(_assertThisInitialized$4(_this), "onBlur", function () {
      _this.setState({
        focused: false
      });
    });

    _defineProperty$Q(_assertThisInitialized$4(_this), "onFocus", function () {
      _this.setState({
        focused: true
      });
    });

    return _this;
  }

  _createClass$5(SearchBox, [{
    key: "resetInput",
    value:
    /**
     * This public method is used in the RefinementList SFFV search box
     * to reset the input state when an item is selected.
     *
     * @see RefinementList#componentWillReceiveProps
     * @return {undefined}
     */
    function resetInput() {
      this.setState({
        query: ''
      });
    }
  }, {
    key: "componentWillReceiveProps",
    value: function componentWillReceiveProps(nextProps) {
      /**
       * when the user is typing, we don't want to replace the query typed
       * by the user (state.query) with the query exposed by the connector (props.query)
       * see: https://github.com/algolia/instantsearch.js/issues/4141
       */
      if (!this.state.focused && nextProps.query !== this.state.query) {
        this.setState({
          query: nextProps.query
        });
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props4 = this.props,
          cssClasses = _this$props4.cssClasses,
          placeholder = _this$props4.placeholder,
          autofocus = _this$props4.autofocus,
          showSubmit = _this$props4.showSubmit,
          showReset = _this$props4.showReset,
          showLoadingIndicator = _this$props4.showLoadingIndicator,
          templates = _this$props4.templates,
          isSearchStalled = _this$props4.isSearchStalled;
      return h$1("div", {
        className: cssClasses.root
      }, h$1("form", {
        action: "",
        role: "search",
        className: cssClasses.form,
        noValidate: true,
        onSubmit: this.onSubmit,
        onReset: this.onReset
      }, h$1("input", {
        ref: this.input,
        value: this.state.query,
        disabled: this.props.disabled,
        className: cssClasses.input,
        type: "search",
        placeholder: placeholder,
        autoFocus: autofocus,
        autoComplete: "off",
        autoCorrect: "off",
        autoCapitalize: "off" // @ts-expect-error `spellCheck` attribute is missing in preact JSX types
        ,
        spellCheck: "false",
        maxLength: 512,
        onInput: this.onInput,
        onBlur: this.onBlur,
        onFocus: this.onFocus
      }), h$1(Template$1, {
        templateKey: "submit",
        rootTagName: "button",
        rootProps: {
          className: cssClasses.submit,
          type: 'submit',
          title: 'Submit the search query.',
          hidden: !showSubmit
        },
        templates: templates,
        data: {
          cssClasses: cssClasses
        }
      }), h$1(Template$1, {
        templateKey: "reset",
        rootTagName: "button",
        rootProps: {
          className: cssClasses.reset,
          type: 'reset',
          title: 'Clear the search query.',
          hidden: !(showReset && this.state.query.trim() && !isSearchStalled)
        },
        templates: templates,
        data: {
          cssClasses: cssClasses
        }
      }), showLoadingIndicator && h$1(Template$1, {
        templateKey: "loadingIndicator",
        rootTagName: "span",
        rootProps: {
          className: cssClasses.loadingIndicator,
          hidden: !isSearchStalled
        },
        templates: templates,
        data: {
          cssClasses: cssClasses
        }
      })));
    }
  }]);

  return SearchBox;
}(d$1);

_defineProperty$Q(SearchBox, "defaultProps", defaultProps$1);

var SearchBox$1 = SearchBox;

function _typeof$3(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof$3 = function _typeof(obj) { return typeof obj; }; } else { _typeof$3 = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof$3(obj); }

function ownKeys$L(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$L(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$L(Object(source), true).forEach(function (key) { _defineProperty$P(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$L(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _extends$8() { _extends$8 = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$8.apply(this, arguments); }

function _objectWithoutProperties$6(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose$6(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose$6(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _classCallCheck$4(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties$4(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass$4(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties$4(Constructor.prototype, protoProps); if (staticProps) _defineProperties$4(Constructor, staticProps); return Constructor; }

function _inherits$3(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf$3(subClass, superClass); }

function _setPrototypeOf$3(o, p) { _setPrototypeOf$3 = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf$3(o, p); }

function _createSuper$3(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$3(); return function _createSuperInternal() { var Super = _getPrototypeOf$3(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf$3(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn$3(this, result); }; }

function _possibleConstructorReturn$3(self, call) { if (call && (_typeof$3(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized$3(self); }

function _assertThisInitialized$3(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct$3() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf$3(o) { _getPrototypeOf$3 = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf$3(o); }

function _defineProperty$P(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var defaultProps = {
  cssClasses: {},
  depth: 0
};

function isHierarchicalMenuItem(facetValue) {
  return facetValue.data !== undefined;
}

var RefinementList = /*#__PURE__*/function (_Component) {
  _inherits$3(RefinementList, _Component);

  var _super = _createSuper$3(RefinementList);

  function RefinementList(props) {
    var _this;

    _classCallCheck$4(this, RefinementList);

    _this = _super.call(this, props);

    _defineProperty$P(_assertThisInitialized$3(_this), "searchBox", y$1());

    _this.handleItemClick = _this.handleItemClick.bind(_assertThisInitialized$3(_this));
    return _this;
  }

  _createClass$4(RefinementList, [{
    key: "shouldComponentUpdate",
    value: function shouldComponentUpdate(nextProps) {
      var areFacetValuesDifferent = !isEqual(this.props.facetValues, nextProps.facetValues);
      return areFacetValuesDifferent;
    }
  }, {
    key: "refine",
    value: function refine(facetValueToRefine) {
      this.props.toggleRefinement(facetValueToRefine);
    }
  }, {
    key: "_generateFacetItem",
    value: function _generateFacetItem(facetValue) {
      var subItems;

      if (isHierarchicalMenuItem(facetValue) && Array.isArray(facetValue.data) && facetValue.data.length > 0) {
        var _this$props$cssClasse = this.props.cssClasses;
            _this$props$cssClasse.root;
            var cssClasses = _objectWithoutProperties$6(_this$props$cssClasse, ["root"]);

        subItems = h$1(RefinementList, _extends$8({}, this.props, {
          // We want to keep `root` required for external usage but not for the
          // sub items.
          cssClasses: cssClasses,
          depth: this.props.depth + 1,
          facetValues: facetValue.data,
          showMore: false,
          className: this.props.cssClasses.childList
        }));
      }

      var url = this.props.createURL(facetValue.value);

      var templateData = _objectSpread$L(_objectSpread$L({}, facetValue), {}, {
        url: url,
        attribute: this.props.attribute,
        cssClasses: this.props.cssClasses,
        isFromSearch: this.props.isFromSearch
      });

      var key = facetValue.value;

      if (facetValue.isRefined !== undefined) {
        key += "/".concat(facetValue.isRefined);
      }

      if (facetValue.count !== undefined) {
        key += "/".concat(facetValue.count);
      }

      var refinementListItemClassName = cx(this.props.cssClasses.item, facetValue.isRefined && this.props.cssClasses.selectedItem, !facetValue.count && this.props.cssClasses.disabledItem, Boolean(isHierarchicalMenuItem(facetValue) && Array.isArray(facetValue.data) && facetValue.data.length > 0) && this.props.cssClasses.parentItem);
      return h$1(RefinementListItem, {
        templateKey: "item",
        key: key,
        facetValueToRefine: facetValue.value,
        handleClick: this.handleItemClick,
        isRefined: facetValue.isRefined,
        className: refinementListItemClassName,
        subItems: subItems,
        templateData: templateData,
        templateProps: this.props.templateProps
      });
    } // Click events on DOM tree like LABEL > INPUT will result in two click events
    // instead of one.
    // No matter the framework, see https://www.google.com/search?q=click+label+twice
    //
    // Thus making it hard to distinguish activation from deactivation because both click events
    // are very close. Debounce is a solution but hacky.
    //
    // So the code here checks if the click was done on or in a LABEL. If this LABEL
    // has a checkbox inside, we ignore the first click event because we will get another one.
    //
    // We also check if the click was done inside a link and then e.preventDefault() because we already
    // handle the url
    //
    // Finally, we always stop propagation of the event to avoid multiple levels RefinementLists to fail: click
    // on child would click on parent also

  }, {
    key: "handleItemClick",
    value: function handleItemClick(_ref) {
      var facetValueToRefine = _ref.facetValueToRefine,
          isRefined = _ref.isRefined,
          originalEvent = _ref.originalEvent;

      if (isSpecialClick(originalEvent)) {
        // do not alter the default browser behavior
        // if one special key is down
        return;
      }

      if (!(originalEvent.target instanceof HTMLElement) || !(originalEvent.target.parentNode instanceof HTMLElement)) {
        return;
      }

      if (isRefined && originalEvent.target.parentNode.querySelector('input[type="radio"]:checked')) {
        // Prevent refinement for being reset if the user clicks on an already checked radio button
        return;
      }

      if (originalEvent.target.tagName === 'INPUT') {
        this.refine(facetValueToRefine);
        return;
      }

      var parent = originalEvent.target;

      while (parent !== originalEvent.currentTarget) {
        if (parent.tagName === 'LABEL' && (parent.querySelector('input[type="checkbox"]') || parent.querySelector('input[type="radio"]'))) {
          return;
        }

        if (parent.tagName === 'A' && parent.href) {
          originalEvent.preventDefault();
        }

        parent = parent.parentNode;
      }

      originalEvent.stopPropagation();
      this.refine(facetValueToRefine);
    }
  }, {
    key: "componentWillReceiveProps",
    value: function componentWillReceiveProps(nextProps) {
      if (this.searchBox.current && !nextProps.isFromSearch) {
        this.searchBox.current.resetInput();
      }
    }
  }, {
    key: "refineFirstValue",
    value: function refineFirstValue() {
      var firstValue = this.props.facetValues && this.props.facetValues[0];

      if (firstValue) {
        var actualValue = firstValue.value;
        this.props.toggleRefinement(actualValue);
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      var showMoreButtonClassName = cx(this.props.cssClasses.showMore, !(this.props.showMore === true && this.props.canToggleShowMore) && this.props.cssClasses.disabledShowMore);
      var showMoreButton = this.props.showMore === true && h$1(Template$1, _extends$8({}, this.props.templateProps, {
        templateKey: "showMoreText",
        rootTagName: "button",
        rootProps: {
          className: showMoreButtonClassName,
          disabled: !this.props.canToggleShowMore,
          onClick: this.props.toggleShowMore
        },
        data: {
          isShowingMore: this.props.isShowingMore
        }
      }));
      var shouldDisableSearchBox = this.props.searchIsAlwaysActive !== true && !(this.props.isFromSearch || !this.props.hasExhaustiveItems);
      var searchBox = this.props.searchFacetValues && h$1("div", {
        className: this.props.cssClasses.searchBox
      }, h$1(SearchBox$1, {
        ref: this.searchBox,
        placeholder: this.props.searchPlaceholder,
        disabled: shouldDisableSearchBox,
        cssClasses: this.props.cssClasses.searchable,
        templates: this.props.searchBoxTemplateProps.templates,
        onChange: function onChange(event) {
          return _this2.props.searchFacetValues(event.target.value);
        },
        onReset: function onReset() {
          return _this2.props.searchFacetValues('');
        },
        onSubmit: function onSubmit() {
          return _this2.refineFirstValue();
        } // This sets the search box to a controlled state because
        // we don't rely on the `refine` prop but on `onChange`.
        ,
        searchAsYouType: false
      }));
      var facetValues = this.props.facetValues && this.props.facetValues.length > 0 && h$1("ul", {
        className: this.props.cssClasses.list
      }, this.props.facetValues.map(this._generateFacetItem, this));
      var noResults = this.props.searchFacetValues && this.props.isFromSearch && (!this.props.facetValues || this.props.facetValues.length === 0) && h$1(Template$1, _extends$8({}, this.props.templateProps, {
        templateKey: "searchableNoResults",
        rootProps: {
          className: this.props.cssClasses.noResults
        }
      }));
      var rootClassName = cx(this.props.cssClasses.root, (!this.props.facetValues || this.props.facetValues.length === 0) && this.props.cssClasses.noRefinementRoot, this.props.className);
      return h$1("div", {
        className: rootClassName
      }, this.props.children, searchBox, facetValues, noResults, showMoreButton);
    }
  }]);

  return RefinementList;
}(d$1);

_defineProperty$P(RefinementList, "defaultProps", defaultProps);

var RefinementList$1 = RefinementList;

function ownKeys$K(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$K(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$K(Object(source), true).forEach(function (key) { _defineProperty$O(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$K(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$O(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties$5(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose$5(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose$5(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _slicedToArray$7(arr, i) { return _arrayWithHoles$7(arr) || _iterableToArrayLimit$7(arr, i) || _unsupportedIterableToArray$b(arr, i) || _nonIterableRest$7(); }

function _nonIterableRest$7() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray$b(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$b(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$b(o, minLen); }

function _arrayLikeToArray$b(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit$7(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles$7(arr) { if (Array.isArray(arr)) return arr; }
var withUsage$C = createDocumentationMessageGenerator({
  name: 'hierarchical-menu',
  connector: true
});
var DEFAULT_SORT$2 = ['name:asc'];

/**
 * **HierarchicalMenu** connector provides the logic to build a custom widget
 * that will give the user the ability to explore facets in a tree-like structure.
 *
 * This is commonly used for multi-level categorization of products on e-commerce
 * websites. From a UX point of view, we suggest not displaying more than two
 * levels deep.
 *
 * @type {Connector}
 * @param {function(HierarchicalMenuRenderingOptions, boolean)} renderFn Rendering function for the custom **HierarchicalMenu** widget.
 * @param {function} unmountFn Unmount function called when the widget is disposed.
 * @return {function(CustomHierarchicalMenuWidgetParams)} Re-usable widget factory for a custom **HierarchicalMenu** widget.
 */
var connectHierarchicalMenu = function connectHierarchicalMenu(renderFn) {
  var unmountFn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : noop;
  checkRendering(renderFn, withUsage$C());
  return function (widgetParams) {
    var _ref = widgetParams || {},
        attributes = _ref.attributes,
        _ref$separator = _ref.separator,
        separator = _ref$separator === void 0 ? ' > ' : _ref$separator,
        _ref$rootPath = _ref.rootPath,
        rootPath = _ref$rootPath === void 0 ? null : _ref$rootPath,
        _ref$showParentLevel = _ref.showParentLevel,
        showParentLevel = _ref$showParentLevel === void 0 ? true : _ref$showParentLevel,
        _ref$limit = _ref.limit,
        limit = _ref$limit === void 0 ? 10 : _ref$limit,
        _ref$showMore = _ref.showMore,
        showMore = _ref$showMore === void 0 ? false : _ref$showMore,
        _ref$showMoreLimit = _ref.showMoreLimit,
        showMoreLimit = _ref$showMoreLimit === void 0 ? 20 : _ref$showMoreLimit,
        _ref$sortBy = _ref.sortBy,
        sortBy = _ref$sortBy === void 0 ? DEFAULT_SORT$2 : _ref$sortBy,
        _ref$transformItems = _ref.transformItems,
        transformItems = _ref$transformItems === void 0 ? function (items) {
      return items;
    } : _ref$transformItems;

    if (!attributes || !Array.isArray(attributes) || attributes.length === 0) {
      throw new Error(withUsage$C('The `attributes` option expects an array of strings.'));
    }

    if (showMore === true && showMoreLimit <= limit) {
      throw new Error(withUsage$C('The `showMoreLimit` option must be greater than `limit`.'));
    }

    // we need to provide a hierarchicalFacet name for the search state
    // so that we can always map $hierarchicalFacetName => real attributes
    // we use the first attribute name
    var _attributes = _slicedToArray$7(attributes, 1),
        hierarchicalFacetName = _attributes[0];

    var sendEvent; // Provide the same function to the `renderFn` so that way the user
    // has to only bind it once when `isFirstRendering` for instance

    var toggleShowMore = function toggleShowMore() {};

    function cachedToggleShowMore() {
      toggleShowMore();
    }

    var _refine;

    var isShowingMore = false;

    function createToggleShowMore(renderOptions, widget) {
      return function () {
        isShowingMore = !isShowingMore;
        widget.render(renderOptions);
      };
    }

    function getLimit() {
      return isShowingMore ? showMoreLimit : limit;
    }

    function _prepareFacetValues(facetValues) {
      return facetValues.slice(0, getLimit()).map(function (_ref2) {
        var label = _ref2.name,
            value = _ref2.escapedValue,
            data = _ref2.data;
            _ref2.path;
            var subValue = _objectWithoutProperties$5(_ref2, ["name", "escapedValue", "data", "path"]);

        var item = _objectSpread$K(_objectSpread$K({}, subValue), {}, {
          value: value,
          label: label,
          data: null
        });

        if (Array.isArray(data)) {
          item.data = _prepareFacetValues(data);
        }

        return item;
      });
    }

    return {
      $$type: 'ais.hierarchicalMenu',
      init: function init(initOptions) {
        var instantSearchInstance = initOptions.instantSearchInstance;
        renderFn(_objectSpread$K(_objectSpread$K({}, this.getWidgetRenderState(initOptions)), {}, {
          instantSearchInstance: instantSearchInstance
        }), true);
      },
      render: function render(renderOptions) {
        var instantSearchInstance = renderOptions.instantSearchInstance;
        toggleShowMore = createToggleShowMore(renderOptions, this);
        renderFn(_objectSpread$K(_objectSpread$K({}, this.getWidgetRenderState(renderOptions)), {}, {
          instantSearchInstance: instantSearchInstance
        }), false);
      },
      dispose: function dispose(_ref3) {
        var state = _ref3.state;
        unmountFn();
        return state.removeHierarchicalFacet(hierarchicalFacetName).setQueryParameter('maxValuesPerFacet', undefined);
      },
      getRenderState: function getRenderState(renderState, renderOptions) {
        return _objectSpread$K(_objectSpread$K({}, renderState), {}, {
          hierarchicalMenu: _objectSpread$K(_objectSpread$K({}, renderState.hierarchicalMenu), {}, _defineProperty$O({}, hierarchicalFacetName, this.getWidgetRenderState(renderOptions)))
        });
      },
      getWidgetRenderState: function getWidgetRenderState(_ref4) {
        var results = _ref4.results,
            state = _ref4.state,
            createURL = _ref4.createURL,
            instantSearchInstance = _ref4.instantSearchInstance,
            helper = _ref4.helper;
        var items = [];
        var canToggleShowMore = false; // Bind createURL to this specific attribute

        function _createURL(facetValue) {
          return createURL(state.resetPage().toggleFacetRefinement(hierarchicalFacetName, facetValue));
        }

        if (!sendEvent) {
          sendEvent = createSendEventForFacet({
            instantSearchInstance: instantSearchInstance,
            helper: helper,
            attribute: function attribute(facetValue) {
              var index = facetValue.split(separator).length - 1;
              return attributes[index];
            },
            widgetType: this.$$type
          });
        }

        if (!_refine) {
          _refine = function _refine(facetValue) {
            sendEvent('click', facetValue);
            helper.toggleFacetRefinement(hierarchicalFacetName, facetValue).search();
          };
        }

        if (results) {
          var facetValues = results.getFacetValues(hierarchicalFacetName, {
            sortBy: sortBy,
            facetOrdering: sortBy === DEFAULT_SORT$2
          });
          var facetItems = facetValues && !Array.isArray(facetValues) && facetValues.data ? facetValues.data : []; // If the limit is the max number of facet retrieved it is impossible to know
          // if the facets are exhaustive. The only moment we are sure it is exhaustive
          // is when it is strictly under the number requested unless we know that another
          // widget has requested more values (maxValuesPerFacet > getLimit()).
          // Because this is used for making the search of facets unable or not, it is important
          // to be conservative here.

          var hasExhaustiveItems = (state.maxValuesPerFacet || 0) > getLimit() ? facetItems.length <= getLimit() : facetItems.length < getLimit();
          canToggleShowMore = showMore && (isShowingMore || !hasExhaustiveItems);
          items = transformItems(_prepareFacetValues(facetItems), {
            results: results
          });
        }

        return {
          items: items,
          refine: _refine,
          canRefine: items.length > 0,
          createURL: _createURL,
          sendEvent: sendEvent,
          widgetParams: widgetParams,
          isShowingMore: isShowingMore,
          toggleShowMore: cachedToggleShowMore,
          canToggleShowMore: canToggleShowMore
        };
      },
      getWidgetUiState: function getWidgetUiState(uiState, _ref5) {
        var searchParameters = _ref5.searchParameters;
        var path = searchParameters.getHierarchicalFacetBreadcrumb(hierarchicalFacetName);

        if (!path.length) {
          return uiState;
        }

        return _objectSpread$K(_objectSpread$K({}, uiState), {}, {
          hierarchicalMenu: _objectSpread$K(_objectSpread$K({}, uiState.hierarchicalMenu), {}, _defineProperty$O({}, hierarchicalFacetName, path))
        });
      },
      getWidgetSearchParameters: function getWidgetSearchParameters(searchParameters, _ref6) {
        var uiState = _ref6.uiState;
        var values = uiState.hierarchicalMenu && uiState.hierarchicalMenu[hierarchicalFacetName];

        if (searchParameters.isHierarchicalFacet(hierarchicalFacetName)) {
          var facet = searchParameters.getHierarchicalFacetByName(hierarchicalFacetName);
          _warning(isEqual(facet.attributes, attributes) && facet.separator === separator && facet.rootPath === rootPath, 'Using Breadcrumb and HierarchicalMenu on the same facet with different options overrides the configuration of the HierarchicalMenu.') ;
        }

        var withFacetConfiguration = searchParameters.removeHierarchicalFacet(hierarchicalFacetName).addHierarchicalFacet({
          name: hierarchicalFacetName,
          attributes: attributes,
          separator: separator,
          rootPath: rootPath,
          showParentLevel: showParentLevel
        });
        var currentMaxValuesPerFacet = withFacetConfiguration.maxValuesPerFacet || 0;
        var nextMaxValuesPerFacet = Math.max(currentMaxValuesPerFacet, showMore ? showMoreLimit : limit);
        var withMaxValuesPerFacet = withFacetConfiguration.setQueryParameter('maxValuesPerFacet', nextMaxValuesPerFacet);

        if (!values) {
          return withMaxValuesPerFacet.setQueryParameters({
            hierarchicalFacetsRefinements: _objectSpread$K(_objectSpread$K({}, withMaxValuesPerFacet.hierarchicalFacetsRefinements), {}, _defineProperty$O({}, hierarchicalFacetName, []))
          });
        }

        return withMaxValuesPerFacet.addHierarchicalFacetRefinement(hierarchicalFacetName, values.join(separator));
      }
    };
  };
};

var connectHierarchicalMenu$1 = connectHierarchicalMenu;

var defaultTemplates$p = {
  item: function item(_ref) {
    var url = _ref.url,
        label = _ref.label,
        count = _ref.count,
        cssClasses = _ref.cssClasses,
        isRefined = _ref.isRefined;
    return h$1("a", {
      className: cx(cx(cssClasses.link), cx(isRefined ? cssClasses.selectedItemLink : undefined)),
      href: url
    }, h$1("span", {
      className: cx(cssClasses.label)
    }, label), h$1("span", {
      className: cx(cssClasses.count)
    }, formatNumber(count)));
  },
  showMoreText: function showMoreText(_ref2) {
    var isShowingMore = _ref2.isShowingMore;
    return isShowingMore ? 'Show less' : 'Show more';
  }
};
var defaultTemplates$q = defaultTemplates$p;

function ownKeys$J(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$J(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$J(Object(source), true).forEach(function (key) { _defineProperty$N(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$J(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$N(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var withUsage$B = createDocumentationMessageGenerator({
  name: 'hierarchical-menu'
});
var suit$k = component('HierarchicalMenu');

var renderer$k = function renderer(_ref) {
  var cssClasses = _ref.cssClasses,
      containerNode = _ref.containerNode,
      showMore = _ref.showMore,
      templates = _ref.templates,
      renderState = _ref.renderState;
  return function (_ref2, isFirstRendering) {
    var createURL = _ref2.createURL,
        items = _ref2.items,
        refine = _ref2.refine,
        instantSearchInstance = _ref2.instantSearchInstance,
        isShowingMore = _ref2.isShowingMore,
        toggleShowMore = _ref2.toggleShowMore,
        canToggleShowMore = _ref2.canToggleShowMore;

    if (isFirstRendering) {
      renderState.templateProps = prepareTemplateProps({
        defaultTemplates: defaultTemplates$q,
        templatesConfig: instantSearchInstance.templatesConfig,
        templates: templates
      });
      return;
    }

    P(h$1(RefinementList$1, {
      createURL: createURL,
      cssClasses: cssClasses,
      facetValues: items,
      templateProps: renderState.templateProps,
      toggleRefinement: refine,
      showMore: showMore,
      toggleShowMore: toggleShowMore,
      isShowingMore: isShowingMore,
      canToggleShowMore: canToggleShowMore
    }), containerNode);
  };
};
/**
 * The hierarchical menu widget is used to create a navigation based on a hierarchy of facet attributes.
 *
 * It is commonly used for categories with subcategories.
 *
 * All attributes (lvl0, lvl1 here) must be declared as [attributes for faceting](https://www.algolia.com/doc/guides/searching/faceting/#declaring-attributes-for-faceting) in your
 * Algolia settings.
 *
 * By default, the separator we expect is ` > ` (with spaces) but you can use
 * a different one by using the `separator` option.
 * @requirements
 * Your objects must be formatted in a specific way to be
 * able to display hierarchical menus. Here's an example:
 *
 * ```javascript
 * {
 *   "objectID": "123",
 *   "name": "orange",
 *   "categories": {
 *     "lvl0": "fruits",
 *     "lvl1": "fruits > citrus"
 *   }
 * }
 * ```
 *
 * Every level must be specified entirely.
 * It's also possible to have multiple values per level, for example:
 *
 * ```javascript
 * {
 *   "objectID": "123",
 *   "name": "orange",
 *   "categories": {
 *     "lvl0": ["fruits", "vitamins"],
 *     "lvl1": ["fruits > citrus", "vitamins > C"]
 *   }
 * }
 * ```
 * @type {WidgetFactory}
 * @devNovel HierarchicalMenu
 * @category filter
 * @param {HierarchicalMenuWidgetParams} widgetParams The HierarchicalMenu widget options.
 * @return {Widget} A new HierarchicalMenu widget instance.
 * @example
 * search.addWidgets([
 *   instantsearch.widgets.hierarchicalMenu({
 *     container: '#hierarchical-categories',
 *     attributes: ['hierarchicalCategories.lvl0', 'hierarchicalCategories.lvl1', 'hierarchicalCategories.lvl2'],
 *   })
 * ]);
 */


var hierarchicalMenu = function hierarchicalMenu(widgetParams) {
  var _ref3 = widgetParams || {},
      container = _ref3.container,
      attributes = _ref3.attributes,
      separator = _ref3.separator,
      rootPath = _ref3.rootPath,
      showParentLevel = _ref3.showParentLevel,
      limit = _ref3.limit,
      _ref3$showMore = _ref3.showMore,
      showMore = _ref3$showMore === void 0 ? false : _ref3$showMore,
      showMoreLimit = _ref3.showMoreLimit,
      sortBy = _ref3.sortBy,
      transformItems = _ref3.transformItems,
      _ref3$templates = _ref3.templates,
      templates = _ref3$templates === void 0 ? {} : _ref3$templates,
      _ref3$cssClasses = _ref3.cssClasses,
      userCssClasses = _ref3$cssClasses === void 0 ? {} : _ref3$cssClasses;

  if (!container) {
    throw new Error(withUsage$B('The `container` option is required.'));
  }

  var containerNode = getContainerNode(container);
  var cssClasses = {
    root: cx(suit$k(), userCssClasses.root),
    noRefinementRoot: cx(suit$k({
      modifierName: 'noRefinement'
    }), userCssClasses.noRefinementRoot),
    list: cx(suit$k({
      descendantName: 'list'
    }), userCssClasses.list),
    childList: cx(suit$k({
      descendantName: 'list',
      modifierName: 'child'
    }), userCssClasses.childList),
    item: cx(suit$k({
      descendantName: 'item'
    }), userCssClasses.item),
    selectedItem: cx(suit$k({
      descendantName: 'item',
      modifierName: 'selected'
    }), userCssClasses.selectedItem),
    parentItem: cx(suit$k({
      descendantName: 'item',
      modifierName: 'parent'
    }), userCssClasses.parentItem),
    link: cx(suit$k({
      descendantName: 'link'
    }), userCssClasses.link),
    selectedItemLink: cx(suit$k({
      descendantName: 'link',
      modifierName: 'selected'
    }), userCssClasses.selectedItemLink),
    label: cx(suit$k({
      descendantName: 'label'
    }), userCssClasses.label),
    count: cx(suit$k({
      descendantName: 'count'
    }), userCssClasses.count),
    showMore: cx(suit$k({
      descendantName: 'showMore'
    }), userCssClasses.showMore),
    disabledShowMore: cx(suit$k({
      descendantName: 'showMore',
      modifierName: 'disabled'
    }), userCssClasses.disabledShowMore)
  };
  var specializedRenderer = renderer$k({
    cssClasses: cssClasses,
    containerNode: containerNode,
    templates: templates,
    showMore: showMore,
    renderState: {}
  });
  var makeWidget = connectHierarchicalMenu$1(specializedRenderer, function () {
    return P(null, containerNode);
  });
  return _objectSpread$J(_objectSpread$J({}, makeWidget({
    attributes: attributes,
    separator: separator,
    rootPath: rootPath,
    showParentLevel: showParentLevel,
    limit: limit,
    showMore: showMore,
    showMoreLimit: showMoreLimit,
    sortBy: sortBy,
    transformItems: transformItems
  })), {}, {
    $$widgetType: 'ais.hierarchicalMenu'
  });
};

var hierarchicalMenu$1 = hierarchicalMenu;

function ownKeys$I(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$I(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$I(Object(source), true).forEach(function (key) { _defineProperty$M(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$I(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$M(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var withUsage$A = createDocumentationMessageGenerator({
  name: 'hits',
  connector: true
});

var connectHits = function connectHits(renderFn) {
  var unmountFn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : noop;
  checkRendering(renderFn, withUsage$A());
  return function (widgetParams) {
    var _ref = widgetParams || {},
        _ref$escapeHTML = _ref.escapeHTML,
        escapeHTML = _ref$escapeHTML === void 0 ? true : _ref$escapeHTML,
        _ref$transformItems = _ref.transformItems,
        transformItems = _ref$transformItems === void 0 ? function (items) {
      return items;
    } : _ref$transformItems;

    var sendEvent;
    var bindEvent;
    return {
      $$type: 'ais.hits',
      init: function init(initOptions) {
        renderFn(_objectSpread$I(_objectSpread$I({}, this.getWidgetRenderState(initOptions)), {}, {
          instantSearchInstance: initOptions.instantSearchInstance
        }), true);
      },
      render: function render(renderOptions) {
        var renderState = this.getWidgetRenderState(renderOptions);
        renderFn(_objectSpread$I(_objectSpread$I({}, renderState), {}, {
          instantSearchInstance: renderOptions.instantSearchInstance
        }), false);
        renderState.sendEvent('view', renderState.hits);
      },
      getRenderState: function getRenderState(renderState, renderOptions) {
        return _objectSpread$I(_objectSpread$I({}, renderState), {}, {
          hits: this.getWidgetRenderState(renderOptions)
        });
      },
      getWidgetRenderState: function getWidgetRenderState(_ref2) {
        var results = _ref2.results,
            helper = _ref2.helper,
            instantSearchInstance = _ref2.instantSearchInstance;

        if (!sendEvent) {
          sendEvent = createSendEventForHits({
            instantSearchInstance: instantSearchInstance,
            index: helper.getIndex(),
            widgetType: this.$$type
          });
        }

        if (!bindEvent) {
          bindEvent = createBindEventForHits({
            index: helper.getIndex(),
            widgetType: this.$$type
          });
        }

        if (!results) {
          return {
            hits: [],
            results: undefined,
            sendEvent: sendEvent,
            bindEvent: bindEvent,
            widgetParams: widgetParams
          };
        }

        if (escapeHTML && results.hits.length > 0) {
          results.hits = escapeHits(results.hits);
        }

        var hitsWithAbsolutePosition = addAbsolutePosition(results.hits, results.page, results.hitsPerPage);
        var hitsWithAbsolutePositionAndQueryID = addQueryID(hitsWithAbsolutePosition, results.queryID);
        var transformedHits = transformItems(hitsWithAbsolutePositionAndQueryID, {
          results: results
        });
        return {
          hits: transformedHits,
          results: results,
          sendEvent: sendEvent,
          bindEvent: bindEvent,
          widgetParams: widgetParams
        };
      },
      dispose: function dispose(_ref3) {
        var state = _ref3.state;
        unmountFn();

        if (!escapeHTML) {
          return state;
        }

        return state.setQueryParameters(Object.keys(TAG_PLACEHOLDER).reduce(function (acc, key) {
          return _objectSpread$I(_objectSpread$I({}, acc), {}, _defineProperty$M({}, key, undefined));
        }, {}));
      },
      getWidgetSearchParameters: function getWidgetSearchParameters(state) {
        if (!escapeHTML) {
          return state;
        }

        return state.setQueryParameters(TAG_PLACEHOLDER);
      }
    };
  };
};

var connectHits$1 = connectHits;

function ownKeys$H(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$H(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$H(Object(source), true).forEach(function (key) { _defineProperty$L(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$H(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$L(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _extends$7() { _extends$7 = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$7.apply(this, arguments); }

var Hits = function Hits(_ref) {
  var results = _ref.results,
      hits = _ref.hits,
      bindEvent = _ref.bindEvent,
      sendEvent = _ref.sendEvent,
      cssClasses = _ref.cssClasses,
      templateProps = _ref.templateProps;

  if (results.hits.length === 0) {
    return h$1(Template$1, _extends$7({}, templateProps, {
      templateKey: "empty",
      rootProps: {
        className: cx(cssClasses.root, cssClasses.emptyRoot)
      },
      data: results
    }));
  }

  return h$1("div", {
    className: cssClasses.root
  }, h$1("ol", {
    className: cssClasses.list
  }, hits.map(function (hit, index) {
    return h$1(Template$1, _extends$7({}, templateProps, {
      templateKey: "item",
      rootTagName: "li",
      rootProps: {
        className: cssClasses.item
      },
      key: hit.objectID,
      data: _objectSpread$H(_objectSpread$H({}, hit), {}, {
        __hitIndex: index
      }),
      bindEvent: bindEvent,
      sendEvent: sendEvent
    }));
  })));
};

var Hits$1 = Hits;

var defaultTemplates$n = {
  empty: function empty() {
    return 'No results';
  },
  item: function item(data) {
    return JSON.stringify(data, null, 2);
  }
};
var defaultTemplates$o = defaultTemplates$n;

function ownKeys$G(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$G(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$G(Object(source), true).forEach(function (key) { _defineProperty$K(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$G(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$K(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var getSelectedHits = function getSelectedHits(hits, selectedObjectIDs) {
  return selectedObjectIDs.map(function (objectID) {
    var hit = find(hits, function (h) {
      return h.objectID === objectID;
    });

    if (typeof hit === 'undefined') {
      throw new Error("Could not find objectID \"".concat(objectID, "\" passed to `clickedObjectIDsAfterSearch` in the returned hits. This is necessary to infer the absolute position and the query ID."));
    }

    return hit;
  });
};

var getQueryID = function getQueryID(selectedHits) {
  var queryIDs = uniq(selectedHits.map(function (hit) {
    return hit.__queryID;
  }));

  if (queryIDs.length > 1) {
    throw new Error('Insights currently allows a single `queryID`. The `objectIDs` provided map to multiple `queryID`s.');
  }

  var queryID = queryIDs[0];

  if (typeof queryID !== 'string') {
    throw new Error("Could not infer `queryID`. Ensure InstantSearch `clickAnalytics: true` was added with the Configure widget.\n\nSee: https://alg.li/lNiZZ7");
  }

  return queryID;
};

var getPositions = function getPositions(selectedHits) {
  return selectedHits.map(function (hit) {
    return hit.__position;
  });
};

var inferPayload = function inferPayload(_ref) {
  var method = _ref.method,
      results = _ref.results,
      hits = _ref.hits,
      objectIDs = _ref.objectIDs;
  var index = results.index;
  var selectedHits = getSelectedHits(hits, objectIDs);
  var queryID = getQueryID(selectedHits);

  switch (method) {
    case 'clickedObjectIDsAfterSearch':
      {
        var positions = getPositions(selectedHits);
        return {
          index: index,
          queryID: queryID,
          objectIDs: objectIDs,
          positions: positions
        };
      }

    case 'convertedObjectIDsAfterSearch':
      return {
        index: index,
        queryID: queryID,
        objectIDs: objectIDs
      };

    default:
      throw new Error("Unsupported method passed to insights: \"".concat(method, "\"."));
  }
};

var wrapInsightsClient = function wrapInsightsClient(aa, results, hits) {
  return function (method) {
    for (var _len = arguments.length, payloads = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      payloads[_key - 1] = arguments[_key];
    }

    var payload = payloads[0];
    _warning(false, "`insights` function has been deprecated. It is still supported in 4.x releases, but not further. It is replaced by the `insights` middleware.\n\nFor more information, visit https://www.algolia.com/doc/guides/getting-insights-and-analytics/search-analytics/click-through-and-conversions/how-to/send-click-and-conversion-events-with-instantsearch/js/") ;

    if (!aa) {
      var withInstantSearchUsage = createDocumentationMessageGenerator({
        name: 'instantsearch'
      });
      throw new Error(withInstantSearchUsage('The `insightsClient` option has not been provided to `instantsearch`.'));
    }

    if (!Array.isArray(payload.objectIDs)) {
      throw new TypeError('Expected `objectIDs` to be an array.');
    }

    var inferredPayload = inferPayload({
      method: method,
      results: results,
      hits: hits,
      objectIDs: payload.objectIDs
    });
    aa(method, _objectSpread$G(_objectSpread$G({}, inferredPayload), payload));
  };
};
/**
 * @deprecated This function will be still supported in 4.x releases, but not further. It is replaced by the `insights` middleware. For more information, visit https://www.algolia.com/doc/guides/getting-insights-and-analytics/search-analytics/click-through-and-conversions/how-to/send-click-and-conversion-events-with-instantsearch/js/
 * It passes `insights` to `HitsWithInsightsListener` and `InfiniteHitsWithInsightsListener`.
 */


function withInsights(connector) {
  return function (renderFn, unmountFn) {
    return connector(function (renderOptions, isFirstRender) {
      var results = renderOptions.results,
          hits = renderOptions.hits,
          instantSearchInstance = renderOptions.instantSearchInstance;

      if (results && hits && instantSearchInstance) {
        var insights = wrapInsightsClient(instantSearchInstance.insightsClient, results, hits);
        return renderFn(_objectSpread$G(_objectSpread$G({}, renderOptions), {}, {
          insights: insights
        }), isFirstRender);
      }

      return renderFn(renderOptions, isFirstRender);
    }, unmountFn);
  };
}

var findInsightsTarget = function findInsightsTarget(startElement, endElement, validator) {
  var element = startElement;

  while (element && !validator(element)) {
    if (element === endElement) {
      return null;
    }

    element = element.parentElement;
  }

  return element;
};

var parseInsightsEvent = function parseInsightsEvent(element) {
  var serializedPayload = element.getAttribute('data-insights-event');

  if (typeof serializedPayload !== 'string') {
    throw new Error('The insights middleware expects `data-insights-event` to be a base64-encoded JSON string.');
  }

  try {
    return deserializePayload(serializedPayload);
  } catch (error) {
    throw new Error('The insights middleware was unable to parse `data-insights-event`.');
  }
};

var insightsListener = function insightsListener(BaseComponent) {
  function WithInsightsListener(props) {
    var handleClick = function handleClick(event) {
      if (props.sendEvent) {
        // new way with insights middleware
        var targetWithEvent = findInsightsTarget(event.target, event.currentTarget, function (element) {
          return element.hasAttribute('data-insights-event');
        });

        if (targetWithEvent) {
          var payload = parseInsightsEvent(targetWithEvent);
          payload.forEach(function (single) {
            return props.sendEvent(single);
          });
        }
      } // old way, e.g. instantsearch.insights("clickedObjectIDsAfterSearch", { .. })


      var insightsTarget = findInsightsTarget(event.target, event.currentTarget, function (element) {
        return hasDataAttributes(element);
      });

      if (insightsTarget) {
        var _readDataAttributes = readDataAttributes(insightsTarget),
            method = _readDataAttributes.method,
            _payload = _readDataAttributes.payload;

        props.insights(method, _payload);
      }
    };

    return h$1("div", {
      onClick: handleClick
    }, h$1(BaseComponent, props));
  }

  return WithInsightsListener;
};

var withInsightsListener = insightsListener;

function ownKeys$F(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$F(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$F(Object(source), true).forEach(function (key) { _defineProperty$J(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$F(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$J(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var withUsage$z = createDocumentationMessageGenerator({
  name: 'hits'
});
var suit$j = component('Hits');
var HitsWithInsightsListener = withInsightsListener(Hits$1);

var renderer$j = function renderer(_ref) {
  var renderState = _ref.renderState,
      cssClasses = _ref.cssClasses,
      containerNode = _ref.containerNode,
      templates = _ref.templates;
  return function (_ref2, isFirstRendering) {
    var receivedHits = _ref2.hits,
        results = _ref2.results,
        instantSearchInstance = _ref2.instantSearchInstance,
        insights = _ref2.insights,
        bindEvent = _ref2.bindEvent;

    if (isFirstRendering) {
      renderState.templateProps = prepareTemplateProps({
        defaultTemplates: defaultTemplates$o,
        templatesConfig: instantSearchInstance.templatesConfig,
        templates: templates
      });
      return;
    }

    P(h$1(HitsWithInsightsListener, {
      cssClasses: cssClasses,
      hits: receivedHits,
      results: results,
      templateProps: renderState.templateProps,
      insights: insights,
      sendEvent: function sendEvent(event) {
        instantSearchInstance.sendEventToInsights(event);
      },
      bindEvent: bindEvent
    }), containerNode);
  };
};

var hits = function hits(widgetParams) {
  var _ref3 = widgetParams || {},
      container = _ref3.container,
      escapeHTML = _ref3.escapeHTML,
      transformItems = _ref3.transformItems,
      _ref3$templates = _ref3.templates,
      templates = _ref3$templates === void 0 ? {} : _ref3$templates,
      _ref3$cssClasses = _ref3.cssClasses,
      userCssClasses = _ref3$cssClasses === void 0 ? {} : _ref3$cssClasses;

  if (!container) {
    throw new Error(withUsage$z('The `container` option is required.'));
  }

  var containerNode = getContainerNode(container);
  var cssClasses = {
    root: cx(suit$j(), userCssClasses.root),
    emptyRoot: cx(suit$j({
      modifierName: 'empty'
    }), userCssClasses.emptyRoot),
    list: cx(suit$j({
      descendantName: 'list'
    }), userCssClasses.list),
    item: cx(suit$j({
      descendantName: 'item'
    }), userCssClasses.item)
  };
  var specializedRenderer = renderer$j({
    containerNode: containerNode,
    cssClasses: cssClasses,
    renderState: {},
    templates: templates
  });
  var makeWidget = withInsights(connectHits$1)(specializedRenderer, function () {
    return P(null, containerNode);
  });
  return _objectSpread$F(_objectSpread$F({}, makeWidget({
    escapeHTML: escapeHTML,
    transformItems: transformItems
  })), {}, {
    $$widgetType: 'ais.hits'
  });
};

var hits$1 = hits;

function Selector(_ref) {
  var currentValue = _ref.currentValue,
      options = _ref.options,
      cssClasses = _ref.cssClasses,
      setValue = _ref.setValue;
  return h$1("select", {
    className: cx(cssClasses.select),
    onChange: function onChange(event) {
      return setValue(event.target.value);
    },
    value: "".concat(currentValue)
  }, options.map(function (option) {
    return h$1("option", {
      className: cx(cssClasses.option),
      key: option.label + option.value,
      value: "".concat(option.value)
    }, option.label);
  }));
}

function _toConsumableArray$4(arr) { return _arrayWithoutHoles$4(arr) || _iterableToArray$4(arr) || _unsupportedIterableToArray$a(arr) || _nonIterableSpread$4(); }

function _nonIterableSpread$4() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray$a(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$a(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$a(o, minLen); }

function _iterableToArray$4(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles$4(arr) { if (Array.isArray(arr)) return _arrayLikeToArray$a(arr); }

function _arrayLikeToArray$a(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys$E(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$E(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$E(Object(source), true).forEach(function (key) { _defineProperty$I(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$E(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$I(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var withUsage$y = createDocumentationMessageGenerator({
  name: 'hits-per-page',
  connector: true
});

var connectHitsPerPage = function connectHitsPerPage(renderFn) {
  var unmountFn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : noop;
  checkRendering(renderFn, withUsage$y());
  return function (widgetParams) {
    var _ref = widgetParams || {},
        userItems = _ref.items,
        _ref$transformItems = _ref.transformItems,
        transformItems = _ref$transformItems === void 0 ? function (items) {
      return items;
    } : _ref$transformItems;

    if (!Array.isArray(userItems)) {
      throw new Error(withUsage$y('The `items` option expects an array of objects.'));
    }

    var items = userItems;
    var defaultItems = items.filter(function (item) {
      return item.default === true;
    });

    if (defaultItems.length === 0) {
      throw new Error(withUsage$y("A default value must be specified in `items`."));
    }

    if (defaultItems.length > 1) {
      throw new Error(withUsage$y('More than one default value is specified in `items`.'));
    }

    var defaultItem = defaultItems[0];

    var normalizeItems = function normalizeItems(_ref2) {
      var hitsPerPage = _ref2.hitsPerPage;
      return items.map(function (item) {
        return _objectSpread$E(_objectSpread$E({}, item), {}, {
          isRefined: Number(item.value) === Number(hitsPerPage)
        });
      });
    };

    var connectorState = {
      getRefine: function getRefine(helper) {
        return function (value) {
          return !value && value !== 0 ? helper.setQueryParameter('hitsPerPage', undefined).search() : helper.setQueryParameter('hitsPerPage', value).search();
        };
      },
      createURLFactory: function createURLFactory(_ref3) {
        var state = _ref3.state,
            createURL = _ref3.createURL;
        return function (value) {
          return createURL(state.resetPage().setQueryParameter('hitsPerPage', !value && value !== 0 ? undefined : value));
        };
      }
    };
    return {
      $$type: 'ais.hitsPerPage',
      init: function init(initOptions) {
        var state = initOptions.state,
            instantSearchInstance = initOptions.instantSearchInstance;
        var isCurrentInOptions = items.some(function (item) {
          return Number(state.hitsPerPage) === Number(item.value);
        });

        if (!isCurrentInOptions) {
          _warning(state.hitsPerPage !== undefined, "\n`hitsPerPage` is not defined.\nThe option `hitsPerPage` needs to be set using the `configure` widget.\n\nLearn more: https://www.algolia.com/doc/api-reference/widgets/hits-per-page/js/\n            ") ;
          _warning(false, "\nThe `items` option of `hitsPerPage` does not contain the \"hits per page\" value coming from the state: ".concat(state.hitsPerPage, ".\n\nYou may want to add another entry to the `items` option with this value.")) ;
          items = [// The helper will convert the empty string to `undefined`.
          {
            value: '',
            label: ''
          }].concat(_toConsumableArray$4(items));
        }

        renderFn(_objectSpread$E(_objectSpread$E({}, this.getWidgetRenderState(initOptions)), {}, {
          instantSearchInstance: instantSearchInstance
        }), true);
      },
      render: function render(initOptions) {
        var instantSearchInstance = initOptions.instantSearchInstance;
        renderFn(_objectSpread$E(_objectSpread$E({}, this.getWidgetRenderState(initOptions)), {}, {
          instantSearchInstance: instantSearchInstance
        }), false);
      },
      dispose: function dispose(_ref4) {
        var state = _ref4.state;
        unmountFn();
        return state.setQueryParameter('hitsPerPage', undefined);
      },
      getRenderState: function getRenderState(renderState, renderOptions) {
        return _objectSpread$E(_objectSpread$E({}, renderState), {}, {
          hitsPerPage: this.getWidgetRenderState(renderOptions)
        });
      },
      getWidgetRenderState: function getWidgetRenderState(_ref5) {
        var state = _ref5.state,
            results = _ref5.results,
            createURL = _ref5.createURL,
            helper = _ref5.helper;
        var canRefine = results ? results.nbHits > 0 : false;
        return {
          items: transformItems(normalizeItems(state), {
            results: results
          }),
          refine: connectorState.getRefine(helper),
          createURL: connectorState.createURLFactory({
            state: state,
            createURL: createURL
          }),
          hasNoResults: !canRefine,
          canRefine: canRefine,
          widgetParams: widgetParams
        };
      },
      getWidgetUiState: function getWidgetUiState(uiState, _ref6) {
        var searchParameters = _ref6.searchParameters;
        var hitsPerPage = searchParameters.hitsPerPage;

        if (hitsPerPage === undefined || hitsPerPage === defaultItem.value) {
          return uiState;
        }

        return _objectSpread$E(_objectSpread$E({}, uiState), {}, {
          hitsPerPage: hitsPerPage
        });
      },
      getWidgetSearchParameters: function getWidgetSearchParameters(searchParameters, _ref7) {
        var uiState = _ref7.uiState;
        return searchParameters.setQueryParameters({
          hitsPerPage: uiState.hitsPerPage || defaultItem.value
        });
      }
    };
  };
};

var connectHitsPerPage$1 = connectHitsPerPage;

function ownKeys$D(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$D(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$D(Object(source), true).forEach(function (key) { _defineProperty$H(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$D(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$H(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var withUsage$x = createDocumentationMessageGenerator({
  name: 'hits-per-page'
});
var suit$i = component('HitsPerPage');

var renderer$i = function renderer(_ref) {
  var containerNode = _ref.containerNode,
      cssClasses = _ref.cssClasses;
  return function (_ref2, isFirstRendering) {
    var items = _ref2.items,
        refine = _ref2.refine;
    if (isFirstRendering) return;

    var _ref3 = find(items, function (_ref4) {
      var isRefined = _ref4.isRefined;
      return isRefined;
    }) || {},
        currentValue = _ref3.value;

    P(h$1("div", {
      className: cssClasses.root
    }, h$1(Selector, {
      cssClasses: cssClasses,
      currentValue: currentValue,
      options: items,
      setValue: refine
    })), containerNode);
  };
};

var hitsPerPage = function hitsPerPage(widgetParams) {
  var _ref5 = widgetParams || {},
      container = _ref5.container,
      items = _ref5.items,
      _ref5$cssClasses = _ref5.cssClasses,
      userCssClasses = _ref5$cssClasses === void 0 ? {} : _ref5$cssClasses,
      transformItems = _ref5.transformItems;

  if (!container) {
    throw new Error(withUsage$x('The `container` option is required.'));
  }

  var containerNode = getContainerNode(container);
  var cssClasses = {
    root: cx(suit$i(), userCssClasses.root),
    select: cx(suit$i({
      descendantName: 'select'
    }), userCssClasses.select),
    option: cx(suit$i({
      descendantName: 'option'
    }), userCssClasses.option)
  };
  var specializedRenderer = renderer$i({
    containerNode: containerNode,
    cssClasses: cssClasses
  });
  var makeWidget = connectHitsPerPage$1(specializedRenderer, function () {
    return P(null, containerNode);
  });
  return _objectSpread$D(_objectSpread$D({}, makeWidget({
    items: items,
    transformItems: transformItems
  })), {}, {
    $$widgetType: 'ais.hitsPerPage'
  });
};

var hitsPerPage$1 = hitsPerPage;

function ownKeys$C(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$C(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$C(Object(source), true).forEach(function (key) { _defineProperty$G(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$C(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$G(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _extends$6() { _extends$6 = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$6.apply(this, arguments); }

var InfiniteHits = function InfiniteHits(_ref) {
  var results = _ref.results,
      hits = _ref.hits,
      bindEvent = _ref.bindEvent,
      sendEvent = _ref.sendEvent,
      hasShowPrevious = _ref.hasShowPrevious,
      showPrevious = _ref.showPrevious,
      showMore = _ref.showMore,
      isFirstPage = _ref.isFirstPage,
      isLastPage = _ref.isLastPage,
      cssClasses = _ref.cssClasses,
      templateProps = _ref.templateProps;

  if (results.hits.length === 0) {
    return h$1(Template$1, _extends$6({}, templateProps, {
      templateKey: "empty",
      rootProps: {
        className: cx(cssClasses.root, cssClasses.emptyRoot)
      },
      data: results
    }));
  }

  return h$1("div", {
    className: cssClasses.root
  }, hasShowPrevious && h$1(Template$1, _extends$6({}, templateProps, {
    templateKey: "showPreviousText",
    rootTagName: "button",
    rootProps: {
      className: cx(cssClasses.loadPrevious, isFirstPage && cssClasses.disabledLoadPrevious),
      disabled: isFirstPage,
      onClick: showPrevious
    }
  })), h$1("ol", {
    className: cssClasses.list
  }, hits.map(function (hit, position) {
    return h$1(Template$1, _extends$6({}, templateProps, {
      templateKey: "item",
      rootTagName: "li",
      rootProps: {
        className: cssClasses.item
      },
      key: hit.objectID,
      data: _objectSpread$C(_objectSpread$C({}, hit), {}, {
        __hitIndex: position
      }),
      bindEvent: bindEvent,
      sendEvent: sendEvent
    }));
  })), h$1(Template$1, _extends$6({}, templateProps, {
    templateKey: "showMoreText",
    rootTagName: "button",
    rootProps: {
      className: cx(cssClasses.loadMore, isLastPage && cssClasses.disabledLoadMore),
      disabled: isLastPage,
      onClick: showMore
    }
  })));
};

var InfiniteHits$1 = InfiniteHits;

function ownKeys$B(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$B(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$B(Object(source), true).forEach(function (key) { _defineProperty$F(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$B(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$F(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray$3(arr) { return _arrayWithoutHoles$3(arr) || _iterableToArray$3(arr) || _unsupportedIterableToArray$9(arr) || _nonIterableSpread$3(); }

function _nonIterableSpread$3() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray$9(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$9(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$9(o, minLen); }

function _iterableToArray$3(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles$3(arr) { if (Array.isArray(arr)) return _arrayLikeToArray$9(arr); }

function _arrayLikeToArray$9(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _objectWithoutProperties$4(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose$4(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose$4(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
var withUsage$w = createDocumentationMessageGenerator({
  name: 'infinite-hits',
  connector: true
});

function getStateWithoutPage(state) {
  var _ref = state || {};
      _ref.page;
      var rest = _objectWithoutProperties$4(_ref, ["page"]);

  return rest;
}

function getInMemoryCache() {
  var cachedHits = null;
  var cachedState = null;
  return {
    read: function read(_ref2) {
      var state = _ref2.state;
      return isEqual(cachedState, getStateWithoutPage(state)) ? cachedHits : null;
    },
    write: function write(_ref3) {
      var state = _ref3.state,
          hits = _ref3.hits;
      cachedState = getStateWithoutPage(state);
      cachedHits = hits;
    }
  };
}

function extractHitsFromCachedHits(cachedHits) {
  return Object.keys(cachedHits).map(Number).sort(function (a, b) {
    return a - b;
  }).reduce(function (acc, page) {
    return acc.concat(cachedHits[page]);
  }, []);
}

var connectInfiniteHits = function connectInfiniteHits(renderFn) {
  var unmountFn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : noop;
  checkRendering(renderFn, withUsage$w()); // @TODO: this should be a generic, but a Connector can not yet be generic itself

  return function (widgetParams) {
    var _ref4 = widgetParams || {},
        _ref4$escapeHTML = _ref4.escapeHTML,
        escapeHTML = _ref4$escapeHTML === void 0 ? true : _ref4$escapeHTML,
        _ref4$transformItems = _ref4.transformItems,
        transformItems = _ref4$transformItems === void 0 ? function (items) {
      return items;
    } : _ref4$transformItems,
        _ref4$cache = _ref4.cache,
        cache = _ref4$cache === void 0 ? getInMemoryCache() : _ref4$cache;

    var showPrevious;
    var showMore;
    var sendEvent;
    var bindEvent;

    var getFirstReceivedPage = function getFirstReceivedPage(state, cachedHits) {
      var _state$page = state.page,
          page = _state$page === void 0 ? 0 : _state$page;
      var pages = Object.keys(cachedHits).map(Number);

      if (pages.length === 0) {
        return page;
      } else {
        return Math.min.apply(Math, [page].concat(_toConsumableArray$3(pages)));
      }
    };

    var getLastReceivedPage = function getLastReceivedPage(state, cachedHits) {
      var _state$page2 = state.page,
          page = _state$page2 === void 0 ? 0 : _state$page2;
      var pages = Object.keys(cachedHits).map(Number);

      if (pages.length === 0) {
        return page;
      } else {
        return Math.max.apply(Math, [page].concat(_toConsumableArray$3(pages)));
      }
    };

    var getShowPrevious = function getShowPrevious(helper) {
      return function () {
        // Using the helper's `overrideStateWithoutTriggeringChangeEvent` method
        // avoid updating the browser URL when the user displays the previous page.
        helper.overrideStateWithoutTriggeringChangeEvent(_objectSpread$B(_objectSpread$B({}, helper.state), {}, {
          page: getFirstReceivedPage(helper.state, cache.read({
            state: helper.state
          }) || {}) - 1
        })).searchWithoutTriggeringOnStateChange();
      };
    };

    var getShowMore = function getShowMore(helper) {
      return function () {
        helper.setPage(getLastReceivedPage(helper.state, cache.read({
          state: helper.state
        }) || {}) + 1).search();
      };
    };

    return {
      $$type: 'ais.infiniteHits',
      init: function init(initOptions) {
        renderFn(_objectSpread$B(_objectSpread$B({}, this.getWidgetRenderState(initOptions)), {}, {
          instantSearchInstance: initOptions.instantSearchInstance
        }), true);
      },
      render: function render(renderOptions) {
        var instantSearchInstance = renderOptions.instantSearchInstance;
        var widgetRenderState = this.getWidgetRenderState(renderOptions);
        renderFn(_objectSpread$B(_objectSpread$B({}, widgetRenderState), {}, {
          instantSearchInstance: instantSearchInstance
        }), false);
        sendEvent('view', widgetRenderState.currentPageHits);
      },
      getRenderState: function getRenderState(renderState, renderOptions) {
        return _objectSpread$B(_objectSpread$B({}, renderState), {}, {
          infiniteHits: this.getWidgetRenderState(renderOptions)
        });
      },
      getWidgetRenderState: function getWidgetRenderState(_ref5) {
        var results = _ref5.results,
            helper = _ref5.helper,
            state = _ref5.state,
            instantSearchInstance = _ref5.instantSearchInstance;
        var isFirstPage;
        var currentPageHits = [];
        var cachedHits = cache.read({
          state: state
        }) || {};

        if (!results) {
          showPrevious = getShowPrevious(helper);
          showMore = getShowMore(helper);
          sendEvent = createSendEventForHits({
            instantSearchInstance: instantSearchInstance,
            index: helper.getIndex(),
            widgetType: this.$$type
          });
          bindEvent = createBindEventForHits({
            index: helper.getIndex(),
            widgetType: this.$$type
          });
          isFirstPage = state.page === undefined || getFirstReceivedPage(state, cachedHits) === 0;
        } else {
          var _state$page3 = state.page,
              _page = _state$page3 === void 0 ? 0 : _state$page3;

          if (escapeHTML && results.hits.length > 0) {
            results.hits = escapeHits(results.hits);
          }

          var hitsWithAbsolutePosition = addAbsolutePosition(results.hits, results.page, results.hitsPerPage);
          var hitsWithAbsolutePositionAndQueryID = addQueryID(hitsWithAbsolutePosition, results.queryID);
          var transformedHits = transformItems(hitsWithAbsolutePositionAndQueryID, {
            results: results
          });

          if (cachedHits[_page] === undefined && !results.__isArtificial) {
            cachedHits[_page] = transformedHits;
            cache.write({
              state: state,
              hits: cachedHits
            });
          }

          currentPageHits = transformedHits;
          isFirstPage = getFirstReceivedPage(state, cachedHits) === 0;
        }

        var hits = extractHitsFromCachedHits(cachedHits);
        var isLastPage = results ? results.nbPages <= getLastReceivedPage(state, cachedHits) + 1 : true;
        return {
          hits: hits,
          currentPageHits: currentPageHits,
          sendEvent: sendEvent,
          bindEvent: bindEvent,
          results: results,
          showPrevious: showPrevious,
          showMore: showMore,
          isFirstPage: isFirstPage,
          isLastPage: isLastPage,
          widgetParams: widgetParams
        };
      },
      dispose: function dispose(_ref6) {
        var state = _ref6.state;
        unmountFn();
        var stateWithoutPage = state.setQueryParameter('page', undefined);

        if (!escapeHTML) {
          return stateWithoutPage;
        }

        return stateWithoutPage.setQueryParameters(Object.keys(TAG_PLACEHOLDER).reduce(function (acc, key) {
          return _objectSpread$B(_objectSpread$B({}, acc), {}, _defineProperty$F({}, key, undefined));
        }, {}));
      },
      getWidgetUiState: function getWidgetUiState(uiState, _ref7) {
        var searchParameters = _ref7.searchParameters;
        var page = searchParameters.page || 0;

        if (!page) {
          // return without adding `page` to uiState
          // because we don't want `page=1` in the URL
          return uiState;
        }

        return _objectSpread$B(_objectSpread$B({}, uiState), {}, {
          // The page in the UI state is incremented by one
          // to expose the user value (not `0`).
          page: page + 1
        });
      },
      getWidgetSearchParameters: function getWidgetSearchParameters(searchParameters, _ref8) {
        var uiState = _ref8.uiState;
        var widgetSearchParameters = searchParameters;

        if (escapeHTML) {
          widgetSearchParameters = searchParameters.setQueryParameters(TAG_PLACEHOLDER);
        } // The page in the search parameters is decremented by one
        // to get to the actual parameter value from the UI state.


        var page = uiState.page ? uiState.page - 1 : 0;
        return widgetSearchParameters.setQueryParameter('page', page);
      }
    };
  };
};

var connectInfiniteHits$1 = connectInfiniteHits;

var defaultTemplates$l = {
  empty: function empty() {
    return 'No results';
  },
  showPreviousText: function showPreviousText() {
    return 'Show previous results';
  },
  showMoreText: function showMoreText() {
    return 'Show more results';
  },
  item: function item(data) {
    return JSON.stringify(data, null, 2);
  }
};
var defaultTemplates$m = defaultTemplates$l;

function ownKeys$A(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$A(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$A(Object(source), true).forEach(function (key) { _defineProperty$E(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$A(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$E(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var withUsage$v = createDocumentationMessageGenerator({
  name: 'infinite-hits'
});
var suit$h = component('InfiniteHits');
var InfiniteHitsWithInsightsListener = withInsightsListener(InfiniteHits$1);

var renderer$h = function renderer(_ref) {
  var containerNode = _ref.containerNode,
      cssClasses = _ref.cssClasses,
      renderState = _ref.renderState,
      templates = _ref.templates,
      hasShowPrevious = _ref.showPrevious;
  return function (_ref2, isFirstRendering) {
    var hits = _ref2.hits,
        results = _ref2.results,
        showMore = _ref2.showMore,
        showPrevious = _ref2.showPrevious,
        isFirstPage = _ref2.isFirstPage,
        isLastPage = _ref2.isLastPage,
        instantSearchInstance = _ref2.instantSearchInstance,
        insights = _ref2.insights,
        bindEvent = _ref2.bindEvent;

    if (isFirstRendering) {
      renderState.templateProps = prepareTemplateProps({
        defaultTemplates: defaultTemplates$m,
        templatesConfig: instantSearchInstance.templatesConfig,
        templates: templates
      });
      return;
    }

    P(h$1(InfiniteHitsWithInsightsListener, {
      cssClasses: cssClasses,
      hits: hits,
      results: results,
      hasShowPrevious: hasShowPrevious,
      showPrevious: showPrevious,
      showMore: showMore,
      templateProps: renderState.templateProps,
      isFirstPage: isFirstPage,
      isLastPage: isLastPage,
      insights: insights,
      sendEvent: function sendEvent(event) {
        instantSearchInstance.sendEventToInsights(event);
      },
      bindEvent: bindEvent
    }), containerNode);
  };
};

var infiniteHits = function infiniteHits(widgetParams) {
  var _ref3 = widgetParams || {},
      container = _ref3.container,
      escapeHTML = _ref3.escapeHTML,
      transformItems = _ref3.transformItems,
      _ref3$templates = _ref3.templates,
      templates = _ref3$templates === void 0 ? {} : _ref3$templates,
      _ref3$cssClasses = _ref3.cssClasses,
      userCssClasses = _ref3$cssClasses === void 0 ? {} : _ref3$cssClasses,
      showPrevious = _ref3.showPrevious,
      cache = _ref3.cache;

  if (!container) {
    throw new Error(withUsage$v('The `container` option is required.'));
  }

  var containerNode = getContainerNode(container);
  var cssClasses = {
    root: cx(suit$h(), userCssClasses.root),
    emptyRoot: cx(suit$h({
      modifierName: 'empty'
    }), userCssClasses.emptyRoot),
    item: cx(suit$h({
      descendantName: 'item'
    }), userCssClasses.item),
    list: cx(suit$h({
      descendantName: 'list'
    }), userCssClasses.list),
    loadPrevious: cx(suit$h({
      descendantName: 'loadPrevious'
    }), userCssClasses.loadPrevious),
    disabledLoadPrevious: cx(suit$h({
      descendantName: 'loadPrevious',
      modifierName: 'disabled'
    }), userCssClasses.disabledLoadPrevious),
    loadMore: cx(suit$h({
      descendantName: 'loadMore'
    }), userCssClasses.loadMore),
    disabledLoadMore: cx(suit$h({
      descendantName: 'loadMore',
      modifierName: 'disabled'
    }), userCssClasses.disabledLoadMore)
  };
  var specializedRenderer = renderer$h({
    containerNode: containerNode,
    cssClasses: cssClasses,
    templates: templates,
    showPrevious: showPrevious,
    renderState: {}
  });
  var makeWidget = withInsights(connectInfiniteHits$1)(specializedRenderer, function () {
    return P(null, containerNode);
  });
  return _objectSpread$A(_objectSpread$A({}, makeWidget({
    escapeHTML: escapeHTML,
    transformItems: transformItems,
    showPrevious: showPrevious,
    cache: cache
  })), {}, {
    $$widgetType: 'ais.infiniteHits'
  });
};

var infiniteHits$1 = infiniteHits;

function _objectWithoutProperties$3(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose$3(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose$3(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _slicedToArray$6(arr, i) { return _arrayWithHoles$6(arr) || _iterableToArrayLimit$6(arr, i) || _unsupportedIterableToArray$8(arr, i) || _nonIterableRest$6(); }

function _nonIterableRest$6() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray$8(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$8(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$8(o, minLen); }

function _arrayLikeToArray$8(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit$6(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles$6(arr) { if (Array.isArray(arr)) return arr; }

function ownKeys$z(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$z(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$z(Object(source), true).forEach(function (key) { _defineProperty$D(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$z(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$D(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var withUsage$u = createDocumentationMessageGenerator({
  name: 'menu',
  connector: true
});
var DEFAULT_SORT$1 = ['isRefined', 'name:asc'];

/**
 * **Menu** connector provides the logic to build a widget that will give the user the ability to choose a single value for a specific facet. The typical usage of menu is for navigation in categories.
 *
 * This connector provides a `toggleShowMore()` function to display more or less items and a `refine()`
 * function to select an item. While selecting a new element, the `refine` will also unselect the
 * one that is currently selected.
 *
 * **Requirement:** the attribute passed as `attribute` must be present in "attributes for faceting" on the Algolia dashboard or configured as attributesForFaceting via a set settings call to the Algolia API.
 */
var connectMenu = function connectMenu(renderFn) {
  var unmountFn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : noop;
  checkRendering(renderFn, withUsage$u());
  return function (widgetParams) {
    var _ref = widgetParams || {},
        attribute = _ref.attribute,
        _ref$limit = _ref.limit,
        limit = _ref$limit === void 0 ? 10 : _ref$limit,
        _ref$showMore = _ref.showMore,
        showMore = _ref$showMore === void 0 ? false : _ref$showMore,
        _ref$showMoreLimit = _ref.showMoreLimit,
        showMoreLimit = _ref$showMoreLimit === void 0 ? 20 : _ref$showMoreLimit,
        _ref$sortBy = _ref.sortBy,
        sortBy = _ref$sortBy === void 0 ? DEFAULT_SORT$1 : _ref$sortBy,
        _ref$transformItems = _ref.transformItems,
        transformItems = _ref$transformItems === void 0 ? function (items) {
      return items;
    } : _ref$transformItems;

    if (!attribute) {
      throw new Error(withUsage$u('The `attribute` option is required.'));
    }

    if (showMore === true && showMoreLimit <= limit) {
      throw new Error(withUsage$u('The `showMoreLimit` option must be greater than `limit`.'));
    }

    var sendEvent;

    var _createURL;

    var _refine; // Provide the same function to the `renderFn` so that way the user
    // has to only bind it once when `isFirstRendering` for instance


    var isShowingMore = false;

    var toggleShowMore = function toggleShowMore() {};

    function createToggleShowMore(renderOptions, widget) {
      return function () {
        isShowingMore = !isShowingMore;
        widget.render(renderOptions);
      };
    }

    function cachedToggleShowMore() {
      toggleShowMore();
    }

    function getLimit() {
      return isShowingMore ? showMoreLimit : limit;
    }

    return {
      $$type: 'ais.menu',
      init: function init(initOptions) {
        var instantSearchInstance = initOptions.instantSearchInstance;
        renderFn(_objectSpread$z(_objectSpread$z({}, this.getWidgetRenderState(initOptions)), {}, {
          instantSearchInstance: instantSearchInstance
        }), true);
      },
      render: function render(renderOptions) {
        var instantSearchInstance = renderOptions.instantSearchInstance;
        renderFn(_objectSpread$z(_objectSpread$z({}, this.getWidgetRenderState(renderOptions)), {}, {
          instantSearchInstance: instantSearchInstance
        }), false);
      },
      dispose: function dispose(_ref2) {
        var state = _ref2.state;
        unmountFn();
        return state.removeHierarchicalFacet(attribute).setQueryParameter('maxValuesPerFacet', undefined);
      },
      getRenderState: function getRenderState(renderState, renderOptions) {
        return _objectSpread$z(_objectSpread$z({}, renderState), {}, {
          menu: _objectSpread$z(_objectSpread$z({}, renderState.menu), {}, _defineProperty$D({}, attribute, this.getWidgetRenderState(renderOptions)))
        });
      },
      getWidgetRenderState: function getWidgetRenderState(renderOptions) {
        var results = renderOptions.results,
            createURL = renderOptions.createURL,
            instantSearchInstance = renderOptions.instantSearchInstance,
            helper = renderOptions.helper;
        var items = [];
        var canToggleShowMore = false;

        if (!sendEvent) {
          sendEvent = createSendEventForFacet({
            instantSearchInstance: instantSearchInstance,
            helper: helper,
            attribute: attribute,
            widgetType: this.$$type
          });
        }

        if (!_createURL) {
          _createURL = function _createURL(facetValue) {
            return createURL(helper.state.resetPage().toggleFacetRefinement(attribute, facetValue));
          };
        }

        if (!_refine) {
          _refine = function _refine(facetValue) {
            var _helper$getHierarchic = helper.getHierarchicalFacetBreadcrumb(attribute),
                _helper$getHierarchic2 = _slicedToArray$6(_helper$getHierarchic, 1),
                refinedItem = _helper$getHierarchic2[0];

            sendEvent('click', facetValue ? facetValue : refinedItem);
            helper.toggleFacetRefinement(attribute, facetValue ? facetValue : refinedItem).search();
          };
        }

        if (renderOptions.results) {
          toggleShowMore = createToggleShowMore(renderOptions, this);
        }

        if (results) {
          var facetValues = results.getFacetValues(attribute, {
            sortBy: sortBy,
            facetOrdering: sortBy === DEFAULT_SORT$1
          });
          var facetItems = facetValues && !Array.isArray(facetValues) && facetValues.data ? facetValues.data : [];
          canToggleShowMore = showMore && (isShowingMore || facetItems.length > getLimit());
          items = transformItems(facetItems.slice(0, getLimit()).map(function (_ref3) {
            var label = _ref3.name,
                value = _ref3.escapedValue;
                _ref3.path;
                var item = _objectWithoutProperties$3(_ref3, ["name", "escapedValue", "path"]);

            return _objectSpread$z(_objectSpread$z({}, item), {}, {
              label: label,
              value: value
            });
          }), {
            results: results
          });
        }

        return {
          items: items,
          createURL: _createURL,
          refine: _refine,
          sendEvent: sendEvent,
          canRefine: items.length > 0,
          widgetParams: widgetParams,
          isShowingMore: isShowingMore,
          toggleShowMore: cachedToggleShowMore,
          canToggleShowMore: canToggleShowMore
        };
      },
      getWidgetUiState: function getWidgetUiState(uiState, _ref4) {
        var searchParameters = _ref4.searchParameters;

        var _searchParameters$get = searchParameters.getHierarchicalFacetBreadcrumb(attribute),
            _searchParameters$get2 = _slicedToArray$6(_searchParameters$get, 1),
            value = _searchParameters$get2[0];

        if (!value) {
          return uiState;
        }

        return _objectSpread$z(_objectSpread$z({}, uiState), {}, {
          menu: _objectSpread$z(_objectSpread$z({}, uiState.menu), {}, _defineProperty$D({}, attribute, value))
        });
      },
      getWidgetSearchParameters: function getWidgetSearchParameters(searchParameters, _ref5) {
        var uiState = _ref5.uiState;
        var value = uiState.menu && uiState.menu[attribute];
        var withFacetConfiguration = searchParameters.removeHierarchicalFacet(attribute).addHierarchicalFacet({
          name: attribute,
          attributes: [attribute]
        });
        var currentMaxValuesPerFacet = withFacetConfiguration.maxValuesPerFacet || 0;
        var nextMaxValuesPerFacet = Math.max(currentMaxValuesPerFacet, showMore ? showMoreLimit : limit);
        var withMaxValuesPerFacet = withFacetConfiguration.setQueryParameter('maxValuesPerFacet', nextMaxValuesPerFacet);

        if (!value) {
          return withMaxValuesPerFacet.setQueryParameters({
            hierarchicalFacetsRefinements: _objectSpread$z(_objectSpread$z({}, withMaxValuesPerFacet.hierarchicalFacetsRefinements), {}, _defineProperty$D({}, attribute, []))
          });
        }

        return withMaxValuesPerFacet.addHierarchicalFacetRefinement(attribute, value);
      }
    };
  };
};

var connectMenu$1 = connectMenu;

var defaultTemplates$j = {
  item: function item(_ref) {
    var cssClasses = _ref.cssClasses,
        url = _ref.url,
        label = _ref.label,
        count = _ref.count;
    return h$1("a", {
      className: cx(cssClasses.link),
      href: url
    }, h$1("span", {
      className: cx(cssClasses.label)
    }, label), h$1("span", {
      className: cx(cssClasses.count)
    }, formatNumber(count)));
  },
  showMoreText: function showMoreText(_ref2) {
    var isShowingMore = _ref2.isShowingMore;
    return isShowingMore ? 'Show less' : 'Show more';
  }
};
var defaultTemplates$k = defaultTemplates$j;

function ownKeys$y(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$y(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$y(Object(source), true).forEach(function (key) { _defineProperty$C(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$y(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$C(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var withUsage$t = createDocumentationMessageGenerator({
  name: 'menu'
});
var suit$g = component('Menu');

var renderer$g = function renderer(_ref) {
  var containerNode = _ref.containerNode,
      cssClasses = _ref.cssClasses,
      renderState = _ref.renderState,
      templates = _ref.templates,
      showMore = _ref.showMore;
  return function (_ref2, isFirstRendering) {
    var refine = _ref2.refine,
        items = _ref2.items,
        createURL = _ref2.createURL,
        instantSearchInstance = _ref2.instantSearchInstance,
        isShowingMore = _ref2.isShowingMore,
        toggleShowMore = _ref2.toggleShowMore,
        canToggleShowMore = _ref2.canToggleShowMore;

    if (isFirstRendering) {
      renderState.templateProps = prepareTemplateProps({
        defaultTemplates: defaultTemplates$k,
        templatesConfig: instantSearchInstance.templatesConfig,
        templates: templates
      });
      return;
    }

    var facetValues = items.map(function (facetValue) {
      return _objectSpread$y(_objectSpread$y({}, facetValue), {}, {
        url: createURL(facetValue.value)
      });
    });
    P(h$1(RefinementList$1, {
      createURL: createURL,
      cssClasses: cssClasses,
      facetValues: facetValues,
      showMore: showMore,
      templateProps: renderState.templateProps,
      toggleRefinement: refine,
      toggleShowMore: toggleShowMore,
      isShowingMore: isShowingMore,
      canToggleShowMore: canToggleShowMore
    }), containerNode);
  };
};

var menu = function menu(widgetParams) {
  var _ref3 = widgetParams || {},
      container = _ref3.container,
      attribute = _ref3.attribute,
      sortBy = _ref3.sortBy,
      limit = _ref3.limit,
      showMore = _ref3.showMore,
      showMoreLimit = _ref3.showMoreLimit,
      _ref3$cssClasses = _ref3.cssClasses,
      userCssClasses = _ref3$cssClasses === void 0 ? {} : _ref3$cssClasses,
      _ref3$templates = _ref3.templates,
      templates = _ref3$templates === void 0 ? {} : _ref3$templates,
      transformItems = _ref3.transformItems;

  if (!container) {
    throw new Error(withUsage$t('The `container` option is required.'));
  }

  var containerNode = getContainerNode(container);
  var cssClasses = {
    root: cx(suit$g(), userCssClasses.root),
    noRefinementRoot: cx(suit$g({
      modifierName: 'noRefinement'
    }), userCssClasses.noRefinementRoot),
    list: cx(suit$g({
      descendantName: 'list'
    }), userCssClasses.list),
    item: cx(suit$g({
      descendantName: 'item'
    }), userCssClasses.item),
    selectedItem: cx(suit$g({
      descendantName: 'item',
      modifierName: 'selected'
    }), userCssClasses.selectedItem),
    link: cx(suit$g({
      descendantName: 'link'
    }), userCssClasses.link),
    label: cx(suit$g({
      descendantName: 'label'
    }), userCssClasses.label),
    count: cx(suit$g({
      descendantName: 'count'
    }), userCssClasses.count),
    showMore: cx(suit$g({
      descendantName: 'showMore'
    }), userCssClasses.showMore),
    disabledShowMore: cx(suit$g({
      descendantName: 'showMore',
      modifierName: 'disabled'
    }), userCssClasses.disabledShowMore)
  };
  var specializedRenderer = renderer$g({
    containerNode: containerNode,
    cssClasses: cssClasses,
    renderState: {},
    templates: templates,
    showMore: showMore
  });
  var makeWidget = connectMenu$1(specializedRenderer, function () {
    return P(null, containerNode);
  });
  return _objectSpread$y(_objectSpread$y({}, makeWidget({
    attribute: attribute,
    limit: limit,
    showMore: showMore,
    showMoreLimit: showMoreLimit,
    sortBy: sortBy,
    transformItems: transformItems
  })), {}, {
    $$widgetType: 'ais.menu'
  });
};

var menu$1 = menu;

function _extends$5() { _extends$5 = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$5.apply(this, arguments); }

function MenuSelect(_ref) {
  var cssClasses = _ref.cssClasses,
      templateProps = _ref.templateProps,
      items = _ref.items,
      refine = _ref.refine;

  var _ref2 = find(items, function (item) {
    return item.isRefined;
  }) || {
    value: ''
  },
      selectedValue = _ref2.value;

  return h$1("div", {
    className: cx(cssClasses.root, items.length === 0 && cssClasses.noRefinementRoot)
  }, h$1("select", {
    className: cssClasses.select,
    value: selectedValue,
    onChange: function onChange(event) {
      refine(event.target.value);
    }
  }, h$1(Template$1, _extends$5({}, templateProps, {
    templateKey: "defaultOption",
    rootTagName: "option",
    rootProps: {
      value: '',
      className: cssClasses.option
    }
  })), items.map(function (item) {
    return h$1(Template$1, _extends$5({}, templateProps, {
      templateKey: "item",
      rootTagName: "option",
      rootProps: {
        value: item.value,
        className: cssClasses.option
      },
      key: item.value,
      data: item
    }));
  })));
}

var defaultTemplates$h = {
  item: function item(_ref) {
    var label = _ref.label,
        count = _ref.count;
    return "".concat(label, " (").concat(formatNumber(count), ")");
  },
  defaultOption: function defaultOption() {
    return 'See all';
  }
};
var defaultTemplates$i = defaultTemplates$h;

function ownKeys$x(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$x(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$x(Object(source), true).forEach(function (key) { _defineProperty$B(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$x(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$B(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var withUsage$s = createDocumentationMessageGenerator({
  name: 'menu-select'
});
var suit$f = component('MenuSelect');

var renderer$f = function renderer(_ref) {
  var containerNode = _ref.containerNode,
      cssClasses = _ref.cssClasses,
      renderState = _ref.renderState,
      templates = _ref.templates;
  return function (_ref2, isFirstRendering) {
    var refine = _ref2.refine,
        items = _ref2.items,
        instantSearchInstance = _ref2.instantSearchInstance;

    if (isFirstRendering) {
      renderState.templateProps = prepareTemplateProps({
        defaultTemplates: defaultTemplates$i,
        templatesConfig: instantSearchInstance.templatesConfig,
        templates: templates
      });
      return;
    }

    P(h$1(MenuSelect, {
      cssClasses: cssClasses,
      items: items,
      refine: refine,
      templateProps: renderState.templateProps
    }), containerNode);
  };
};

var menuSelect = function menuSelect(widgetParams) {
  var _ref3 = widgetParams || {},
      container = _ref3.container,
      attribute = _ref3.attribute,
      _ref3$sortBy = _ref3.sortBy,
      sortBy = _ref3$sortBy === void 0 ? ['name:asc'] : _ref3$sortBy,
      _ref3$limit = _ref3.limit,
      limit = _ref3$limit === void 0 ? 10 : _ref3$limit,
      _ref3$cssClasses = _ref3.cssClasses,
      userCssClasses = _ref3$cssClasses === void 0 ? {} : _ref3$cssClasses,
      _ref3$templates = _ref3.templates,
      templates = _ref3$templates === void 0 ? {} : _ref3$templates,
      transformItems = _ref3.transformItems;

  if (!container) {
    throw new Error(withUsage$s('The `container` option is required.'));
  }

  var containerNode = getContainerNode(container);
  var cssClasses = {
    root: cx(suit$f(), userCssClasses.root),
    noRefinementRoot: cx(suit$f({
      modifierName: 'noRefinement'
    }), userCssClasses.noRefinementRoot),
    select: cx(suit$f({
      descendantName: 'select'
    }), userCssClasses.select),
    option: cx(suit$f({
      descendantName: 'option'
    }), userCssClasses.option)
  };
  var specializedRenderer = renderer$f({
    containerNode: containerNode,
    cssClasses: cssClasses,
    renderState: {},
    templates: templates
  });
  var makeWidget = connectMenu$1(specializedRenderer, function () {
    return P(null, containerNode);
  });
  return _objectSpread$x(_objectSpread$x({}, makeWidget({
    attribute: attribute,
    limit: limit,
    sortBy: sortBy,
    transformItems: transformItems
  })), {}, {
    $$widgetType: 'ais.menuSelect'
  });
};

var menuSelect$1 = menuSelect;

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$7(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _slicedToArray$5(arr, i) { return _arrayWithHoles$5(arr) || _iterableToArrayLimit$5(arr, i) || _unsupportedIterableToArray$7(arr, i) || _nonIterableRest$5(); }

function _nonIterableRest$5() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray$7(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$7(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$7(o, minLen); }

function _arrayLikeToArray$7(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit$5(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles$5(arr) { if (Array.isArray(arr)) return arr; }

function ownKeys$w(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$w(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$w(Object(source), true).forEach(function (key) { _defineProperty$A(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$w(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$A(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var withUsage$r = createDocumentationMessageGenerator({
  name: 'numeric-menu',
  connector: true
});
var $$type$3 = 'ais.numericMenu';

var createSendEvent$2 = function createSendEvent(_ref) {
  var instantSearchInstance = _ref.instantSearchInstance;
  return function () {
    if (arguments.length === 1) {
      instantSearchInstance.sendEventToInsights(arguments.length <= 0 ? undefined : arguments[0]);
      return;
    }
  };
};

var connectNumericMenu = function connectNumericMenu(renderFn) {
  var unmountFn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : noop;
  checkRendering(renderFn, withUsage$r());
  return function (widgetParams) {
    var _ref2 = widgetParams || {},
        _ref2$attribute = _ref2.attribute,
        attribute = _ref2$attribute === void 0 ? '' : _ref2$attribute,
        _ref2$items = _ref2.items,
        items = _ref2$items === void 0 ? [] : _ref2$items,
        _ref2$transformItems = _ref2.transformItems,
        transformItems = _ref2$transformItems === void 0 ? function (item) {
      return item;
    } : _ref2$transformItems;

    if (attribute === '') {
      throw new Error(withUsage$r('The `attribute` option is required.'));
    }

    if (!items || items.length === 0) {
      throw new Error(withUsage$r('The `items` option expects an array of objects.'));
    }

    var prepareItems = function prepareItems(state) {
      return items.map(function (_ref3) {
        var start = _ref3.start,
            end = _ref3.end,
            label = _ref3.label;
        return {
          label: label,
          value: encodeURI(JSON.stringify({
            start: start,
            end: end
          })),
          isRefined: isRefined(state, attribute, {
            start: start,
            end: end,
            label: label
          })
        };
      });
    };

    var connectorState = {};
    return {
      $$type: $$type$3,
      init: function init(initOptions) {
        var instantSearchInstance = initOptions.instantSearchInstance;
        renderFn(_objectSpread$w(_objectSpread$w({}, this.getWidgetRenderState(initOptions)), {}, {
          instantSearchInstance: instantSearchInstance
        }), true);
      },
      render: function render(renderOptions) {
        var instantSearchInstance = renderOptions.instantSearchInstance;
        renderFn(_objectSpread$w(_objectSpread$w({}, this.getWidgetRenderState(renderOptions)), {}, {
          instantSearchInstance: instantSearchInstance
        }), false);
      },
      dispose: function dispose(_ref4) {
        var state = _ref4.state;
        unmountFn();
        return state.clearRefinements(attribute);
      },
      getWidgetUiState: function getWidgetUiState(uiState, _ref5) {
        var searchParameters = _ref5.searchParameters;
        var values = searchParameters.getNumericRefinements(attribute);
        var equal = values['='] && values['='][0];

        if (equal || equal === 0) {
          return _objectSpread$w(_objectSpread$w({}, uiState), {}, {
            numericMenu: _objectSpread$w(_objectSpread$w({}, uiState.numericMenu), {}, _defineProperty$A({}, attribute, "".concat(values['='])))
          });
        }

        var min = values['>='] && values['>='][0] || '';
        var max = values['<='] && values['<='][0] || '';

        if (min === '' && max === '') {
          return uiState;
        }

        return _objectSpread$w(_objectSpread$w({}, uiState), {}, {
          numericMenu: _objectSpread$w(_objectSpread$w({}, uiState.numericMenu), {}, _defineProperty$A({}, attribute, "".concat(min, ":").concat(max)))
        });
      },
      getWidgetSearchParameters: function getWidgetSearchParameters(searchParameters, _ref6) {
        var uiState = _ref6.uiState;
        var value = uiState.numericMenu && uiState.numericMenu[attribute];
        var withoutRefinements = searchParameters.clearRefinements(attribute);

        if (!value) {
          return withoutRefinements.setQueryParameters({
            numericRefinements: _objectSpread$w(_objectSpread$w({}, withoutRefinements.numericRefinements), {}, _defineProperty$A({}, attribute, {}))
          });
        }

        var isExact = value.indexOf(':') === -1;

        if (isExact) {
          return withoutRefinements.addNumericRefinement(attribute, '=', Number(value));
        }

        var _value$split$map = value.split(':').map(parseFloat),
            _value$split$map2 = _slicedToArray$5(_value$split$map, 2),
            min = _value$split$map2[0],
            max = _value$split$map2[1];

        var withMinRefinement = isFiniteNumber(min) ? withoutRefinements.addNumericRefinement(attribute, '>=', min) : withoutRefinements;
        var withMaxRefinement = isFiniteNumber(max) ? withMinRefinement.addNumericRefinement(attribute, '<=', max) : withMinRefinement;
        return withMaxRefinement;
      },
      getRenderState: function getRenderState(renderState, renderOptions) {
        return _objectSpread$w(_objectSpread$w({}, renderState), {}, {
          numericMenu: _objectSpread$w(_objectSpread$w({}, renderState.numericMenu), {}, _defineProperty$A({}, attribute, this.getWidgetRenderState(renderOptions)))
        });
      },
      getWidgetRenderState: function getWidgetRenderState(_ref7) {
        var results = _ref7.results,
            state = _ref7.state,
            instantSearchInstance = _ref7.instantSearchInstance,
            helper = _ref7.helper,
            createURL = _ref7.createURL;

        if (!connectorState.refine) {
          connectorState.refine = function (facetValue) {
            var refinedState = getRefinedState(helper.state, attribute, facetValue);
            connectorState.sendEvent('click', facetValue);
            helper.setState(refinedState).search();
          };
        }

        if (!connectorState.createURL) {
          connectorState.createURL = function (newState) {
            return function (facetValue) {
              return createURL(getRefinedState(newState, attribute, facetValue));
            };
          };
        }

        if (!connectorState.sendEvent) {
          connectorState.sendEvent = createSendEvent$2({
            instantSearchInstance: instantSearchInstance
          });
        }

        var hasNoResults = results ? results.nbHits === 0 : true;
        var preparedItems = prepareItems(state);
        var allIsSelected = true;

        var _iterator = _createForOfIteratorHelper(preparedItems),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var item = _step.value;

            if (item.isRefined && decodeURI(item.value) !== '{}') {
              allIsSelected = false;
              break;
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }

        return {
          createURL: connectorState.createURL(state),
          items: transformItems(preparedItems, {
            results: results
          }),
          hasNoResults: hasNoResults,
          canRefine: !(hasNoResults && allIsSelected),
          refine: connectorState.refine,
          sendEvent: connectorState.sendEvent,
          widgetParams: widgetParams
        };
      }
    };
  };
};

function isRefined(state, attribute, option) {
  // @TODO: same as another spot, why is this mixing arrays & elements?
  var currentRefinements = state.getNumericRefinements(attribute);

  if (option.start !== undefined && option.end !== undefined) {
    if (option.start === option.end) {
      return hasNumericRefinement(currentRefinements, '=', option.start);
    } else {
      return hasNumericRefinement(currentRefinements, '>=', option.start) && hasNumericRefinement(currentRefinements, '<=', option.end);
    }
  }

  if (option.start !== undefined) {
    return hasNumericRefinement(currentRefinements, '>=', option.start);
  }

  if (option.end !== undefined) {
    return hasNumericRefinement(currentRefinements, '<=', option.end);
  }

  if (option.start === undefined && option.end === undefined) {
    return Object.keys(currentRefinements).every(function (operator) {
      return (currentRefinements[operator] || []).length === 0;
    });
  }

  return false;
}

function getRefinedState(state, attribute, facetValue) {
  var resolvedState = state;
  var refinedOption = JSON.parse(decodeURI(facetValue)); // @TODO: why is array / element mixed here & hasRefinements; seems wrong?

  var currentRefinements = resolvedState.getNumericRefinements(attribute);

  if (refinedOption.start === undefined && refinedOption.end === undefined) {
    return resolvedState.removeNumericRefinement(attribute);
  }

  if (!isRefined(resolvedState, attribute, refinedOption)) {
    resolvedState = resolvedState.removeNumericRefinement(attribute);
  }

  if (refinedOption.start !== undefined && refinedOption.end !== undefined) {
    if (refinedOption.start > refinedOption.end) {
      throw new Error('option.start should be > to option.end');
    }

    if (refinedOption.start === refinedOption.end) {
      if (hasNumericRefinement(currentRefinements, '=', refinedOption.start)) {
        resolvedState = resolvedState.removeNumericRefinement(attribute, '=', refinedOption.start);
      } else {
        resolvedState = resolvedState.addNumericRefinement(attribute, '=', refinedOption.start);
      }

      return resolvedState;
    }
  }

  if (refinedOption.start !== undefined) {
    if (hasNumericRefinement(currentRefinements, '>=', refinedOption.start)) {
      resolvedState = resolvedState.removeNumericRefinement(attribute, '>=', refinedOption.start);
    }

    resolvedState = resolvedState.addNumericRefinement(attribute, '>=', refinedOption.start);
  }

  if (refinedOption.end !== undefined) {
    if (hasNumericRefinement(currentRefinements, '<=', refinedOption.end)) {
      resolvedState = resolvedState.removeNumericRefinement(attribute, '<=', refinedOption.end);
    }

    resolvedState = resolvedState.addNumericRefinement(attribute, '<=', refinedOption.end);
  }

  if (typeof resolvedState.page === 'number') {
    resolvedState.page = 0;
  }

  return resolvedState;
}

function hasNumericRefinement(currentRefinements, operator, value) {
  return currentRefinements[operator] !== undefined && currentRefinements[operator].includes(value);
}

var connectNumericMenu$1 = connectNumericMenu;

var defaultTemplates$f = {
  item: function item(_ref) {
    var cssClasses = _ref.cssClasses,
        attribute = _ref.attribute,
        label = _ref.label,
        isRefined = _ref.isRefined;
    return h$1("label", {
      className: cssClasses.label
    }, h$1("input", {
      type: "radio",
      className: cssClasses.radio,
      name: attribute,
      defaultChecked: isRefined
    }), h$1("span", {
      className: cssClasses.labelText
    }, label));
  }
};
var defaultTemplates$g = defaultTemplates$f;

function ownKeys$v(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$v(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$v(Object(source), true).forEach(function (key) { _defineProperty$z(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$v(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$z(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var withUsage$q = createDocumentationMessageGenerator({
  name: 'numeric-menu'
});
var suit$e = component('NumericMenu');

var renderer$e = function renderer(_ref) {
  var containerNode = _ref.containerNode,
      attribute = _ref.attribute,
      cssClasses = _ref.cssClasses,
      renderState = _ref.renderState,
      templates = _ref.templates;
  return function (_ref2, isFirstRendering) {
    var createURL = _ref2.createURL,
        instantSearchInstance = _ref2.instantSearchInstance,
        refine = _ref2.refine,
        items = _ref2.items;

    if (isFirstRendering) {
      renderState.templateProps = prepareTemplateProps({
        defaultTemplates: defaultTemplates$g,
        templatesConfig: instantSearchInstance.templatesConfig,
        templates: templates
      });
      return;
    }

    P(h$1(RefinementList$1, {
      createURL: createURL,
      cssClasses: cssClasses,
      facetValues: items,
      templateProps: renderState.templateProps,
      toggleRefinement: refine,
      attribute: attribute
    }), containerNode);
  };
};

var numericMenu = function numericMenu(widgetParams) {
  var _ref3 = widgetParams || {},
      container = _ref3.container,
      attribute = _ref3.attribute,
      items = _ref3.items,
      _ref3$cssClasses = _ref3.cssClasses,
      userCssClasses = _ref3$cssClasses === void 0 ? {} : _ref3$cssClasses,
      _ref3$templates = _ref3.templates,
      templates = _ref3$templates === void 0 ? {} : _ref3$templates,
      transformItems = _ref3.transformItems;

  if (!container) {
    throw new Error(withUsage$q('The `container` option is required.'));
  }

  var containerNode = getContainerNode(container);
  var cssClasses = {
    root: cx(suit$e(), userCssClasses.root),
    noRefinementRoot: cx(suit$e({
      modifierName: 'noRefinement'
    }), userCssClasses.noRefinementRoot),
    list: cx(suit$e({
      descendantName: 'list'
    }), userCssClasses.list),
    item: cx(suit$e({
      descendantName: 'item'
    }), userCssClasses.item),
    selectedItem: cx(suit$e({
      descendantName: 'item',
      modifierName: 'selected'
    }), userCssClasses.selectedItem),
    label: cx(suit$e({
      descendantName: 'label'
    }), userCssClasses.label),
    radio: cx(suit$e({
      descendantName: 'radio'
    }), userCssClasses.radio),
    labelText: cx(suit$e({
      descendantName: 'labelText'
    }), userCssClasses.labelText)
  };
  var specializedRenderer = renderer$e({
    containerNode: containerNode,
    attribute: attribute,
    cssClasses: cssClasses,
    renderState: {},
    templates: templates
  });
  var makeWidget = connectNumericMenu$1(specializedRenderer, function () {
    return P(null, containerNode);
  });
  return _objectSpread$v(_objectSpread$v({}, makeWidget({
    attribute: attribute,
    items: items,
    transformItems: transformItems
  })), {}, {
    $$widgetType: 'ais.numericMenu'
  });
};

var numericMenu$1 = numericMenu;

function Pagination(props) {
  function createClickHandler(pageNumber) {
    return function (event) {
      if (isSpecialClick(event)) {
        // do not alter the default browser behavior
        // if one special key is down
        return;
      }

      event.preventDefault();
      props.setCurrentPage(pageNumber);
    };
  }

  return h$1("div", {
    className: cx(props.cssClasses.root, props.nbPages <= 1 && props.cssClasses.noRefinementRoot)
  }, h$1("ul", {
    className: props.cssClasses.list
  }, props.showFirst && h$1(PaginationLink, {
    ariaLabel: "First",
    className: props.cssClasses.firstPageItem,
    isDisabled: props.isFirstPage,
    label: props.templates.first,
    pageNumber: 0,
    createURL: props.createURL,
    cssClasses: props.cssClasses,
    createClickHandler: createClickHandler
  }), props.showPrevious && h$1(PaginationLink, {
    ariaLabel: "Previous",
    className: props.cssClasses.previousPageItem,
    isDisabled: props.isFirstPage,
    label: props.templates.previous,
    pageNumber: props.currentPage - 1,
    createURL: props.createURL,
    cssClasses: props.cssClasses,
    createClickHandler: createClickHandler
  }), props.pages.map(function (pageNumber) {
    return h$1(PaginationLink, {
      key: pageNumber,
      ariaLabel: "".concat(pageNumber + 1),
      className: props.cssClasses.pageItem,
      isSelected: pageNumber === props.currentPage,
      label: "".concat(pageNumber + 1),
      pageNumber: pageNumber,
      createURL: props.createURL,
      cssClasses: props.cssClasses,
      createClickHandler: createClickHandler
    });
  }), props.showNext && h$1(PaginationLink, {
    ariaLabel: "Next",
    className: props.cssClasses.nextPageItem,
    isDisabled: props.isLastPage,
    label: props.templates.next,
    pageNumber: props.currentPage + 1,
    createURL: props.createURL,
    cssClasses: props.cssClasses,
    createClickHandler: createClickHandler
  }), props.showLast && h$1(PaginationLink, {
    ariaLabel: "Last",
    className: props.cssClasses.lastPageItem,
    isDisabled: props.isLastPage,
    label: props.templates.last,
    pageNumber: props.nbPages - 1,
    createURL: props.createURL,
    cssClasses: props.cssClasses,
    createClickHandler: createClickHandler
  })));
}

function PaginationLink(_ref) {
  var label = _ref.label,
      ariaLabel = _ref.ariaLabel,
      pageNumber = _ref.pageNumber,
      className = _ref.className,
      _ref$isDisabled = _ref.isDisabled,
      isDisabled = _ref$isDisabled === void 0 ? false : _ref$isDisabled,
      _ref$isSelected = _ref.isSelected,
      isSelected = _ref$isSelected === void 0 ? false : _ref$isSelected,
      cssClasses = _ref.cssClasses,
      createURL = _ref.createURL,
      createClickHandler = _ref.createClickHandler;
  return h$1("li", {
    className: cx(cssClasses.item, className, isDisabled && cssClasses.disabledItem, isSelected && cssClasses.selectedItem)
  }, isDisabled ? h$1("span", {
    className: cssClasses.link,
    dangerouslySetInnerHTML: {
      __html: label
    }
  }) : h$1("a", {
    className: cssClasses.link,
    "aria-label": ariaLabel,
    href: createURL(pageNumber),
    onClick: createClickHandler(pageNumber),
    dangerouslySetInnerHTML: {
      __html: label
    }
  }));
}

function _classCallCheck$3(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties$3(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass$3(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties$3(Constructor.prototype, protoProps); if (staticProps) _defineProperties$3(Constructor, staticProps); return Constructor; }

function _defineProperty$y(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Paginator = /*#__PURE__*/function () {
  function Paginator(params) {
    _classCallCheck$3(this, Paginator);

    _defineProperty$y(this, "currentPage", void 0);

    _defineProperty$y(this, "total", void 0);

    _defineProperty$y(this, "padding", void 0);

    this.currentPage = params.currentPage;
    this.total = params.total;
    this.padding = params.padding;
  }

  _createClass$3(Paginator, [{
    key: "pages",
    value: function pages() {
      var total = this.total,
          currentPage = this.currentPage,
          padding = this.padding;
      if (total === 0) return [0];
      var totalDisplayedPages = this.nbPagesDisplayed(padding, total);

      if (totalDisplayedPages === total) {
        return range({
          end: total
        });
      }

      var paddingLeft = this.calculatePaddingLeft(currentPage, padding, total, totalDisplayedPages);
      var paddingRight = totalDisplayedPages - paddingLeft;
      var first = currentPage - paddingLeft;
      var last = currentPage + paddingRight;
      return range({
        start: first,
        end: last
      });
    }
  }, {
    key: "nbPagesDisplayed",
    value: function nbPagesDisplayed(padding, total) {
      return Math.min(2 * padding + 1, total);
    }
  }, {
    key: "calculatePaddingLeft",
    value: function calculatePaddingLeft(current, padding, total, totalDisplayedPages) {
      if (current <= padding) {
        return current;
      }

      if (current >= total - padding) {
        return totalDisplayedPages - (total - current);
      }

      return padding;
    }
  }, {
    key: "isLastPage",
    value: function isLastPage() {
      return this.currentPage === this.total - 1 || this.total === 0;
    }
  }, {
    key: "isFirstPage",
    value: function isFirstPage() {
      return this.currentPage === 0;
    }
  }]);

  return Paginator;
}();

var Paginator$1 = Paginator;

function ownKeys$u(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$u(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$u(Object(source), true).forEach(function (key) { _defineProperty$x(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$u(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$x(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var withUsage$p = createDocumentationMessageGenerator({
  name: 'pagination',
  connector: true
});

/**
 * **Pagination** connector provides the logic to build a widget that will let the user
 * choose the current page of the results.
 *
 * When using the pagination with Algolia, you should be aware that the engine won't provide you pages
 * beyond the 1000th hits by default. You can find more information on the [Algolia documentation](https://www.algolia.com/doc/guides/searching/pagination/#pagination-limitations).
 */
var connectPagination = function connectPagination(renderFn) {
  var unmountFn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : noop;
  checkRendering(renderFn, withUsage$p());
  return function (widgetParams) {
    var _ref = widgetParams || {},
        totalPages = _ref.totalPages,
        _ref$padding = _ref.padding,
        padding = _ref$padding === void 0 ? 3 : _ref$padding;

    var pager = new Paginator$1({
      currentPage: 0,
      total: 0,
      padding: padding
    });
    var connectorState = {};

    function getMaxPage(_ref2) {
      var nbPages = _ref2.nbPages;
      return totalPages !== undefined ? Math.min(totalPages, nbPages) : nbPages;
    }

    return {
      $$type: 'ais.pagination',
      init: function init(initOptions) {
        var instantSearchInstance = initOptions.instantSearchInstance;
        renderFn(_objectSpread$u(_objectSpread$u({}, this.getWidgetRenderState(initOptions)), {}, {
          instantSearchInstance: instantSearchInstance
        }), true);
      },
      render: function render(renderOptions) {
        var instantSearchInstance = renderOptions.instantSearchInstance;
        renderFn(_objectSpread$u(_objectSpread$u({}, this.getWidgetRenderState(renderOptions)), {}, {
          instantSearchInstance: instantSearchInstance
        }), false);
      },
      dispose: function dispose(_ref3) {
        var state = _ref3.state;
        unmountFn();
        return state.setQueryParameter('page', undefined);
      },
      getWidgetUiState: function getWidgetUiState(uiState, _ref4) {
        var searchParameters = _ref4.searchParameters;
        var page = searchParameters.page || 0;

        if (!page) {
          return uiState;
        }

        return _objectSpread$u(_objectSpread$u({}, uiState), {}, {
          page: page + 1
        });
      },
      getWidgetSearchParameters: function getWidgetSearchParameters(searchParameters, _ref5) {
        var uiState = _ref5.uiState;
        var page = uiState.page ? uiState.page - 1 : 0;
        return searchParameters.setQueryParameter('page', page);
      },
      getWidgetRenderState: function getWidgetRenderState(_ref6) {
        var results = _ref6.results,
            helper = _ref6.helper,
            state = _ref6.state,
            createURL = _ref6.createURL;

        if (!connectorState.refine) {
          connectorState.refine = function (page) {
            helper.setPage(page);
            helper.search();
          };
        }

        if (!connectorState.createURL) {
          connectorState.createURL = function (helperState) {
            return function (page) {
              return createURL(helperState.setPage(page));
            };
          };
        }

        var page = state.page || 0;
        var nbPages = getMaxPage(results || {
          nbPages: 0
        });
        pager.currentPage = page;
        pager.total = nbPages;
        return {
          createURL: connectorState.createURL(state),
          refine: connectorState.refine,
          canRefine: nbPages > 1,
          currentRefinement: page,
          nbHits: (results === null || results === void 0 ? void 0 : results.nbHits) || 0,
          nbPages: nbPages,
          pages: results ? pager.pages() : [],
          isFirstPage: pager.isFirstPage(),
          isLastPage: pager.isLastPage(),
          widgetParams: widgetParams
        };
      },
      getRenderState: function getRenderState(renderState, renderOptions) {
        return _objectSpread$u(_objectSpread$u({}, renderState), {}, {
          pagination: this.getWidgetRenderState(renderOptions)
        });
      }
    };
  };
};

var connectPagination$1 = connectPagination;

function ownKeys$t(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$t(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$t(Object(source), true).forEach(function (key) { _defineProperty$w(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$t(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$w(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var suit$d = component('Pagination');
var withUsage$o = createDocumentationMessageGenerator({
  name: 'pagination'
});
var defaultTemplates$e = {
  previous: '‹',
  next: '›',
  first: '«',
  last: '»'
};

var renderer$d = function renderer(_ref) {
  var containerNode = _ref.containerNode,
      cssClasses = _ref.cssClasses,
      templates = _ref.templates,
      showFirst = _ref.showFirst,
      showLast = _ref.showLast,
      showPrevious = _ref.showPrevious,
      showNext = _ref.showNext,
      scrollToNode = _ref.scrollToNode;
  return function (_ref2, isFirstRendering) {
    var createURL = _ref2.createURL,
        currentRefinement = _ref2.currentRefinement,
        nbPages = _ref2.nbPages,
        pages = _ref2.pages,
        isFirstPage = _ref2.isFirstPage,
        isLastPage = _ref2.isLastPage,
        refine = _ref2.refine;
    if (isFirstRendering) return;

    var setCurrentPage = function setCurrentPage(pageNumber) {
      refine(pageNumber);

      if (scrollToNode !== false) {
        scrollToNode.scrollIntoView();
      }
    };

    P(h$1(Pagination, {
      createURL: createURL,
      cssClasses: cssClasses,
      currentPage: currentRefinement,
      templates: templates,
      nbPages: nbPages,
      pages: pages,
      isFirstPage: isFirstPage,
      isLastPage: isLastPage,
      setCurrentPage: setCurrentPage,
      showFirst: showFirst,
      showLast: showLast,
      showPrevious: showPrevious,
      showNext: showNext
    }), containerNode);
  };
};

var pagination = function pagination(widgetParams) {
  var _ref3 = widgetParams || {},
      container = _ref3.container,
      _ref3$templates = _ref3.templates,
      userTemplates = _ref3$templates === void 0 ? {} : _ref3$templates,
      _ref3$cssClasses = _ref3.cssClasses,
      userCssClasses = _ref3$cssClasses === void 0 ? {} : _ref3$cssClasses,
      totalPages = _ref3.totalPages,
      padding = _ref3.padding,
      _ref3$showFirst = _ref3.showFirst,
      showFirst = _ref3$showFirst === void 0 ? true : _ref3$showFirst,
      _ref3$showLast = _ref3.showLast,
      showLast = _ref3$showLast === void 0 ? true : _ref3$showLast,
      _ref3$showPrevious = _ref3.showPrevious,
      showPrevious = _ref3$showPrevious === void 0 ? true : _ref3$showPrevious,
      _ref3$showNext = _ref3.showNext,
      showNext = _ref3$showNext === void 0 ? true : _ref3$showNext,
      _ref3$scrollTo = _ref3.scrollTo,
      userScrollTo = _ref3$scrollTo === void 0 ? 'body' : _ref3$scrollTo;

  if (!container) {
    throw new Error(withUsage$o('The `container` option is required.'));
  }

  var containerNode = getContainerNode(container);
  var scrollTo = userScrollTo === true ? 'body' : userScrollTo;
  var scrollToNode = scrollTo !== false ? getContainerNode(scrollTo) : false;
  var cssClasses = {
    root: cx(suit$d(), userCssClasses.root),
    noRefinementRoot: cx(suit$d({
      modifierName: 'noRefinement'
    }), userCssClasses.noRefinementRoot),
    list: cx(suit$d({
      descendantName: 'list'
    }), userCssClasses.list),
    item: cx(suit$d({
      descendantName: 'item'
    }), userCssClasses.item),
    firstPageItem: cx(suit$d({
      descendantName: 'item',
      modifierName: 'firstPage'
    }), userCssClasses.firstPageItem),
    lastPageItem: cx(suit$d({
      descendantName: 'item',
      modifierName: 'lastPage'
    }), userCssClasses.lastPageItem),
    previousPageItem: cx(suit$d({
      descendantName: 'item',
      modifierName: 'previousPage'
    }), userCssClasses.previousPageItem),
    nextPageItem: cx(suit$d({
      descendantName: 'item',
      modifierName: 'nextPage'
    }), userCssClasses.nextPageItem),
    pageItem: cx(suit$d({
      descendantName: 'item',
      modifierName: 'page'
    }), userCssClasses.pageItem),
    selectedItem: cx(suit$d({
      descendantName: 'item',
      modifierName: 'selected'
    }), userCssClasses.selectedItem),
    disabledItem: cx(suit$d({
      descendantName: 'item',
      modifierName: 'disabled'
    }), userCssClasses.disabledItem),
    link: cx(suit$d({
      descendantName: 'link'
    }), userCssClasses.link)
  };

  var templates = _objectSpread$t(_objectSpread$t({}, defaultTemplates$e), userTemplates);

  var specializedRenderer = renderer$d({
    containerNode: containerNode,
    cssClasses: cssClasses,
    templates: templates,
    showFirst: showFirst,
    showLast: showLast,
    showPrevious: showPrevious,
    showNext: showNext,
    scrollToNode: scrollToNode
  });
  var makeWidget = connectPagination$1(specializedRenderer, function () {
    return P(null, containerNode);
  });
  return _objectSpread$t(_objectSpread$t({}, makeWidget({
    totalPages: totalPages,
    padding: padding
  })), {}, {
    $$widgetType: 'ais.pagination'
  });
};

var pagination$1 = pagination;

var t,r,u,i,o=0,f=[],c=[],e=l$1.__b,a=l$1.__r,v=l$1.diffed,l=l$1.__c,m=l$1.unmount;function d(t,u){l$1.__h&&l$1.__h(r,t,o||u),o=0;var i=r.__H||(r.__H={__:[],__h:[]});return t>=i.__.length&&i.__.push({__V:c}),i.__[t]}function p(n){return o=1,y(B,n)}function y(n,u,i){var o=d(t++,2);if(o.t=n,!o.__c&&(o.__=[i?i(u):B(void 0,u),function(n){var t=o.__N?o.__N[0]:o.__[0],r=o.t(t,n);t!==r&&(o.__N=[r,o.__[1]],o.__c.setState({}));}],o.__c=r,!r.u)){r.u=!0;var f=r.shouldComponentUpdate;r.shouldComponentUpdate=function(n,t,r){if(!o.__c.__H)return !0;var u=o.__c.__H.__.filter(function(n){return n.__c});if(u.every(function(n){return !n.__N}))return !f||f.call(this,n,t,r);var i=!1;return u.forEach(function(n){if(n.__N){var t=n.__[0];n.__=n.__N,n.__N=void 0,t!==n.__[0]&&(i=!0);}}),!(!i&&o.__c.props===n)&&(!f||f.call(this,n,t,r))};}return o.__N||o.__}function h(u,i){var o=d(t++,3);!l$1.__s&&z(o.__H,i)&&(o.__=u,o.i=i,r.__H.__h.push(o));}function _(n){return o=5,F(function(){return {current:n}},[])}function F(n,r){var u=d(t++,7);return z(u.__H,r)?(u.__V=n(),u.i=r,u.__h=n,u.__V):u.__}function b(){for(var t;t=f.shift();)if(t.__P&&t.__H)try{t.__H.__h.forEach(k),t.__H.__h.forEach(w),t.__H.__h=[];}catch(r){t.__H.__h=[],l$1.__e(r,t.__v);}}l$1.__b=function(n){r=null,e&&e(n);},l$1.__r=function(n){a&&a(n),t=0;var i=(r=n.__c).__H;i&&(u===r?(i.__h=[],r.__h=[],i.__.forEach(function(n){n.__N&&(n.__=n.__N),n.__V=c,n.__N=n.i=void 0;})):(i.__h.forEach(k),i.__h.forEach(w),i.__h=[])),u=r;},l$1.diffed=function(t){v&&v(t);var o=t.__c;o&&o.__H&&(o.__H.__h.length&&(1!==f.push(o)&&i===l$1.requestAnimationFrame||((i=l$1.requestAnimationFrame)||j)(b)),o.__H.__.forEach(function(n){n.i&&(n.__H=n.i),n.__V!==c&&(n.__=n.__V),n.i=void 0,n.__V=c;})),u=r=null;},l$1.__c=function(t,r){r.some(function(t){try{t.__h.forEach(k),t.__h=t.__h.filter(function(n){return !n.__||w(n)});}catch(u){r.some(function(n){n.__h&&(n.__h=[]);}),r=[],l$1.__e(u,t.__v);}}),l&&l(t,r);},l$1.unmount=function(t){m&&m(t);var r,u=t.__c;u&&u.__H&&(u.__H.__.forEach(function(n){try{k(n);}catch(n){r=n;}}),u.__H=void 0,r&&l$1.__e(r,u.__v));};var g="function"==typeof requestAnimationFrame;function j(n){var t,r=function(){clearTimeout(u),g&&cancelAnimationFrame(t),setTimeout(n);},u=setTimeout(r,100);g&&(t=requestAnimationFrame(r));}function k(n){var t=r,u=n.__c;"function"==typeof u&&(n.__c=void 0,u()),r=t;}function w(n){var t=r;n.__c=n.__(),r=t;}function z(n,t){return !n||n.length!==t.length||t.some(function(t,r){return t!==n[r]})}function B(n,t){return "function"==typeof t?t(n):t}

function _slicedToArray$4(arr, i) { return _arrayWithHoles$4(arr) || _iterableToArrayLimit$4(arr, i) || _unsupportedIterableToArray$6(arr, i) || _nonIterableRest$4(); }

function _nonIterableRest$4() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray$6(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$6(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$6(o, minLen); }

function _arrayLikeToArray$6(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit$4(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles$4(arr) { if (Array.isArray(arr)) return arr; }

function Panel(props) {
  var _useState = p(props.isCollapsed),
      _useState2 = _slicedToArray$4(_useState, 2),
      isCollapsed = _useState2[0],
      setIsCollapsed = _useState2[1];

  var _useState3 = p(false),
      _useState4 = _slicedToArray$4(_useState3, 2),
      isControlled = _useState4[0],
      setIsControlled = _useState4[1];

  var bodyRef = _(null);
  h(function () {
    var node = bodyRef.current;

    if (!node) {
      return undefined;
    }

    node.appendChild(props.bodyElement);
    return function () {
      node.removeChild(props.bodyElement);
    };
  }, [bodyRef, props.bodyElement]);

  if (!isControlled && props.isCollapsed !== isCollapsed) {
    setIsCollapsed(props.isCollapsed);
  }

  return h$1("div", {
    className: cx(props.cssClasses.root, props.hidden && props.cssClasses.noRefinementRoot, props.collapsible && props.cssClasses.collapsibleRoot, isCollapsed && props.cssClasses.collapsedRoot),
    hidden: props.hidden
  }, props.templates.header && h$1("div", {
    className: props.cssClasses.header
  }, h$1(Template$1, {
    templates: props.templates,
    templateKey: "header",
    rootTagName: "span",
    data: props.data
  }), props.collapsible && h$1("button", {
    className: props.cssClasses.collapseButton,
    "aria-expanded": !isCollapsed,
    onClick: function onClick(event) {
      event.preventDefault();
      setIsControlled(true);
      setIsCollapsed(function (prevIsCollapsed) {
        return !prevIsCollapsed;
      });
    }
  }, h$1(Template$1, {
    templates: props.templates,
    templateKey: "collapseButtonText",
    rootTagName: "span",
    data: {
      collapsed: isCollapsed
    }
  }))), h$1("div", {
    className: props.cssClasses.body,
    ref: bodyRef
  }), props.templates.footer && h$1(Template$1, {
    templates: props.templates,
    templateKey: "footer",
    rootProps: {
      className: props.cssClasses.footer
    },
    data: props.data
  }));
}

function ownKeys$s(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$s(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$s(Object(source), true).forEach(function (key) { _defineProperty$v(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$s(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$v(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var withUsage$n = createDocumentationMessageGenerator({
  name: 'panel'
});
var suit$c = component('Panel');

var renderer$c = function renderer(_ref) {
  var containerNode = _ref.containerNode,
      bodyContainerNode = _ref.bodyContainerNode,
      cssClasses = _ref.cssClasses,
      templates = _ref.templates;
  return function (_ref2) {
    var options = _ref2.options,
        hidden = _ref2.hidden,
        collapsible = _ref2.collapsible,
        collapsed = _ref2.collapsed;
    P(h$1(Panel, {
      cssClasses: cssClasses,
      hidden: hidden,
      collapsible: collapsible,
      isCollapsed: collapsed,
      templates: templates,
      data: options,
      bodyElement: bodyContainerNode
    }), containerNode);
  };
};

/**
 * The panel widget wraps other widgets in a consistent panel design.
 * It also reacts, indicates and sets CSS classes when widgets are no longer relevant for refining.
 */
var panel = function panel(panelWidgetParams) {
  var _ref3 = panelWidgetParams || {},
      _ref3$templates = _ref3.templates,
      templates = _ref3$templates === void 0 ? {} : _ref3$templates,
      _ref3$hidden = _ref3.hidden,
      hidden = _ref3$hidden === void 0 ? function () {
    return false;
  } : _ref3$hidden,
      collapsed = _ref3.collapsed,
      _ref3$cssClasses = _ref3.cssClasses,
      userCssClasses = _ref3$cssClasses === void 0 ? {} : _ref3$cssClasses;

  _warning(typeof hidden === 'function', "The `hidden` option in the \"panel\" widget expects a function returning a boolean (received type ".concat(getObjectType(hidden), ").")) ;
  _warning(typeof collapsed === 'undefined' || typeof collapsed === 'function', "The `collapsed` option in the \"panel\" widget expects a function returning a boolean (received type ".concat(getObjectType(collapsed), ").")) ;
  var bodyContainerNode = document.createElement('div');
  var collapsible = Boolean(collapsed);
  var collapsedFn = typeof collapsed === 'function' ? collapsed : function () {
    return false;
  };
  var cssClasses = {
    root: cx(suit$c(), userCssClasses.root),
    noRefinementRoot: cx(suit$c({
      modifierName: 'noRefinement'
    }), userCssClasses.noRefinementRoot),
    collapsibleRoot: cx(suit$c({
      modifierName: 'collapsible'
    }), userCssClasses.collapsibleRoot),
    collapsedRoot: cx(suit$c({
      modifierName: 'collapsed'
    }), userCssClasses.collapsedRoot),
    collapseButton: cx(suit$c({
      descendantName: 'collapseButton'
    }), userCssClasses.collapseButton),
    collapseIcon: cx(suit$c({
      descendantName: 'collapseIcon'
    }), userCssClasses.collapseIcon),
    body: cx(suit$c({
      descendantName: 'body'
    }), userCssClasses.body),
    header: cx(suit$c({
      descendantName: 'header'
    }), userCssClasses.header),
    footer: cx(suit$c({
      descendantName: 'footer'
    }), userCssClasses.footer)
  };
  return function (widgetFactory) {
    return function (widgetParams) {
      if (!(widgetParams && widgetParams.container)) {
        throw new Error(withUsage$n("The `container` option is required in the widget within the panel."));
      }

      var containerNode = getContainerNode(widgetParams.container);
      var defaultTemplates = {
        header: '',
        footer: '',
        collapseButtonText: function collapseButtonText(_ref4) {
          var isCollapsed = _ref4.collapsed;
          return "<svg\n          class=\"".concat(cssClasses.collapseIcon, "\"\n          width=\"1em\"\n          height=\"1em\"\n          viewBox=\"0 0 500 500\"\n        >\n        <path d=\"").concat(isCollapsed ? 'M100 250l300-150v300z' : 'M250 400l150-300H100z', "\" fill=\"currentColor\" />\n        </svg>");
        }
      };
      var renderPanel = renderer$c({
        containerNode: containerNode,
        bodyContainerNode: bodyContainerNode,
        cssClasses: cssClasses,
        templates: _objectSpread$s(_objectSpread$s({}, defaultTemplates), templates)
      });
      var widget = widgetFactory(_objectSpread$s(_objectSpread$s({}, widgetParams), {}, {
        container: bodyContainerNode
      })); // TypeScript somehow loses track of the ...widget type, since it's
      // not directly returned. Eventually the "as AugmentedWidget<typeof widgetFactory>"
      // will not be needed anymore.
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions

      return _objectSpread$s(_objectSpread$s({}, widget), {}, {
        init: function init() {
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          var renderOptions = args[0];

          var options = _objectSpread$s(_objectSpread$s({}, widget.getWidgetRenderState ? widget.getWidgetRenderState(renderOptions) : {}), renderOptions);

          renderPanel({
            options: options,
            hidden: true,
            collapsible: collapsible,
            collapsed: false
          });

          if (typeof widget.init === 'function') {
            var _widget$init;

            (_widget$init = widget.init).call.apply(_widget$init, [this].concat(args));
          }
        },
        render: function render() {
          for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }

          var renderOptions = args[0];

          var options = _objectSpread$s(_objectSpread$s({}, widget.getWidgetRenderState ? widget.getWidgetRenderState(renderOptions) : {}), renderOptions);

          renderPanel({
            options: options,
            hidden: Boolean(hidden(options)),
            collapsible: collapsible,
            collapsed: Boolean(collapsedFn(options))
          });

          if (typeof widget.render === 'function') {
            var _widget$render;

            (_widget$render = widget.render).call.apply(_widget$render, [this].concat(args));
          }
        },
        dispose: function dispose() {
          P(null, containerNode);

          if (typeof widget.dispose === 'function') {
            var _widget$dispose;

            for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
              args[_key3] = arguments[_key3];
            }

            return (_widget$dispose = widget.dispose).call.apply(_widget$dispose, [this].concat(args));
          }

          return undefined;
        }
      });
    };
  };
};

var panel$1 = panel;

function ownKeys$r(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$r(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$r(Object(source), true).forEach(function (key) { _defineProperty$u(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$r(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$u(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties$2(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose$2(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose$2(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

/** @ts-ignore */
// using the type like this requires only one ts-ignore

/**
 * This widget sets the geolocation value for the search based on the selected
 * result in the Algolia Places autocomplete.
 */
var placesWidget = function placesWidget(widgetParams) {
  var _ref = widgetParams || {},
      placesReference = _ref.placesReference,
      _ref$defaultPosition = _ref.defaultPosition,
      defaultPosition = _ref$defaultPosition === void 0 ? [] : _ref$defaultPosition,
      placesOptions = _objectWithoutProperties$2(_ref, ["placesReference", "defaultPosition"]);

  if (typeof placesReference !== 'function') {
    throw new Error('The `placesReference` option requires a valid Places.js reference.');
  }

  var placesAutocomplete = placesReference(placesOptions);
  var state = {
    query: '',
    initialLatLngViaIP: undefined,
    isInitialLatLngViaIPSet: false
  };
  return {
    $$type: 'ais.places',
    $$widgetType: 'ais.places',
    init: function init(_ref2) {
      var helper = _ref2.helper;
      placesAutocomplete.on('change', function (eventOptions) {
        var _eventOptions$suggest = eventOptions.suggestion,
            value = _eventOptions$suggest.value,
            _eventOptions$suggest2 = _eventOptions$suggest.latlng,
            lat = _eventOptions$suggest2.lat,
            lng = _eventOptions$suggest2.lng;
        state.query = value;
        helper.setQueryParameter('insideBoundingBox', undefined).setQueryParameter('aroundLatLngViaIP', false).setQueryParameter('aroundLatLng', "".concat(lat, ",").concat(lng)).search();
      });
      placesAutocomplete.on('clear', function () {
        state.query = '';
        helper.setQueryParameter('insideBoundingBox', undefined);

        if (defaultPosition.length > 1) {
          helper.setQueryParameter('aroundLatLngViaIP', false).setQueryParameter('aroundLatLng', defaultPosition.join(','));
        } else {
          helper.setQueryParameter('aroundLatLngViaIP', state.initialLatLngViaIP).setQueryParameter('aroundLatLng', undefined);
        }

        helper.search();
      });
    },
    getWidgetUiState: function getWidgetUiState(uiState, _ref3) {
      var searchParameters = _ref3.searchParameters;
      var position = searchParameters.aroundLatLng || defaultPosition.join(',');
      var hasPositionSet = position !== defaultPosition.join(',');

      if (!hasPositionSet && !state.query) {
        uiState.places;
            var uiStateWithoutPlaces = _objectWithoutProperties$2(uiState, ["places"]);

        return uiStateWithoutPlaces;
      }

      return _objectSpread$r(_objectSpread$r({}, uiState), {}, {
        places: {
          query: state.query,
          position: position
        }
      });
    },
    getWidgetSearchParameters: function getWidgetSearchParameters(searchParameters, _ref4) {
      var uiState = _ref4.uiState;

      var _ref5 = uiState.places || {},
          _ref5$query = _ref5.query,
          query = _ref5$query === void 0 ? '' : _ref5$query,
          _ref5$position = _ref5.position,
          position = _ref5$position === void 0 ? defaultPosition.join(',') : _ref5$position;

      state.query = query;

      if (!state.isInitialLatLngViaIPSet) {
        state.isInitialLatLngViaIPSet = true;
        state.initialLatLngViaIP = searchParameters.aroundLatLngViaIP;
      }

      placesAutocomplete.setVal(query);
      placesAutocomplete.close();
      return searchParameters.setQueryParameter('insideBoundingBox', undefined).setQueryParameter('aroundLatLngViaIP', false).setQueryParameter('aroundLatLng', position || undefined);
    },
    getRenderState: function getRenderState(renderState, renderOptions) {
      return _objectSpread$r(_objectSpread$r({}, renderState), {}, {
        places: this.getWidgetRenderState(renderOptions)
      });
    },
    getWidgetRenderState: function getWidgetRenderState() {
      return {
        widgetParams: widgetParams
      };
    }
  };
};

var placesWidget$1 = placesWidget;

var PoweredBy = function PoweredBy(_ref) {
  var url = _ref.url,
      theme = _ref.theme,
      cssClasses = _ref.cssClasses;
  return h$1("div", {
    className: cssClasses.root
  }, h$1("a", {
    href: url,
    target: "_blank",
    className: cssClasses.link,
    "aria-label": "Search by Algolia",
    rel: "noopener noreferrer"
  }, h$1("svg", {
    height: "1.2em",
    className: cssClasses.logo,
    viewBox: "0 0 572 64" // This style is necessary as long as it's not included in InstantSearch.css.
    // For now, InstantSearch.css sets a maximum width of 70px.
    ,
    style: {
      width: 'auto'
    }
  }, h$1("path", {
    fill: theme === 'dark' ? '#FFF' : '#36395A',
    d: "M16 48.3c-3.4 0-6.3-.6-8.7-1.7A12.4 12.4 0 0 1 1.9 42C.6 40 0 38 0 35.4h6.5a6.7 6.7 0 0 0 3.9 6c1.4.7 3.3 1.1 5.6 1.1 2.2 0 4-.3 5.4-1a7 7 0 0 0 3-2.4 6 6 0 0 0 1-3.4c0-1.5-.6-2.8-1.9-3.7-1.3-1-3.3-1.6-5.9-1.8l-4-.4c-3.7-.3-6.6-1.4-8.8-3.4a10 10 0 0 1-3.3-7.9c0-2.4.6-4.6 1.8-6.4a12 12 0 0 1 5-4.3c2.2-1 4.7-1.6 7.5-1.6s5.5.5 7.6 1.6a12 12 0 0 1 5 4.4c1.2 1.8 1.8 4 1.8 6.7h-6.5a6.4 6.4 0 0 0-3.5-5.9c-1-.6-2.6-1-4.4-1s-3.2.3-4.4 1c-1.1.6-2 1.4-2.6 2.4-.5 1-.8 2-.8 3.1a5 5 0 0 0 1.5 3.6c1 1 2.6 1.7 4.7 1.9l4 .3c2.8.2 5.2.8 7.2 1.8 2.1 1 3.7 2.2 4.9 3.8a9.7 9.7 0 0 1 1.7 5.8c0 2.5-.7 4.7-2 6.6a13 13 0 0 1-5.6 4.4c-2.4 1-5.2 1.6-8.4 1.6Zm35.6 0c-2.6 0-4.8-.4-6.7-1.3a13 13 0 0 1-4.7-3.5 17.1 17.1 0 0 1-3.6-10.4v-1c0-2 .3-3.8 1-5.6a13 13 0 0 1 7.3-8.3 15 15 0 0 1 6.3-1.4A13.2 13.2 0 0 1 64 24.3c1 2.2 1.6 4.6 1.6 7.2V34H39.4v-4.3h21.8l-1.8 2.2c0-2-.3-3.7-.9-5.1a7.3 7.3 0 0 0-2.7-3.4c-1.2-.7-2.7-1.1-4.6-1.1s-3.4.4-4.7 1.3a8 8 0 0 0-2.9 3.6c-.6 1.5-.9 3.3-.9 5.4 0 2 .3 3.7 1 5.3a7.9 7.9 0 0 0 2.8 3.7c1.3.8 3 1.3 5 1.3s3.8-.5 5.1-1.3c1.3-1 2.1-2 2.4-3.2h6a11.8 11.8 0 0 1-7 8.7 16 16 0 0 1-6.4 1.2ZM80 48c-2.2 0-4-.3-5.7-1a8.4 8.4 0 0 1-3.7-3.3 9.7 9.7 0 0 1-1.3-5.2c0-2 .5-3.8 1.5-5.2a9 9 0 0 1 4.3-3.1c1.8-.7 4-1 6.7-1H89v4.1h-7.5c-2 0-3.4.5-4.4 1.4-1 1-1.6 2.1-1.6 3.6s.5 2.7 1.6 3.6c1 1 2.5 1.4 4.4 1.4 1.1 0 2.2-.2 3.2-.7 1-.4 1.9-1 2.6-2 .6-1 1-2.4 1-4.2l1.7 2.1c-.2 2-.7 3.8-1.5 5.2a9 9 0 0 1-3.4 3.3 12 12 0 0 1-5.3 1Zm9.5-.7v-8.8h-1v-10c0-1.8-.5-3.2-1.4-4.1-1-1-2.4-1.4-4.2-1.4a142.9 142.9 0 0 0-10.2.4v-5.6a74.8 74.8 0 0 1 8.6-.4c3 0 5.5.4 7.5 1.2s3.4 2 4.4 3.6c1 1.7 1.4 4 1.4 6.7v18.4h-5Zm12.9 0V17.8h5v12.3h-.2c0-4.2 1-7.4 2.8-9.5a11 11 0 0 1 8.3-3.1h1v5.6h-2a9 9 0 0 0-6.3 2.2c-1.5 1.5-2.2 3.6-2.2 6.4v15.6h-6.4Zm34.4 1a15 15 0 0 1-6.6-1.3c-1.9-.9-3.4-2-4.7-3.5a15.5 15.5 0 0 1-2.7-5c-.6-1.7-1-3.6-1-5.4v-1c0-2 .4-3.8 1-5.6a15 15 0 0 1 2.8-4.9c1.3-1.5 2.8-2.6 4.6-3.5a16.4 16.4 0 0 1 13.3.2c2 1 3.5 2.3 4.8 4a12 12 0 0 1 2 6H144c-.2-1.6-1-3-2.2-4.1a7.5 7.5 0 0 0-5.2-1.7 8 8 0 0 0-4.7 1.3 8 8 0 0 0-2.8 3.6 13.8 13.8 0 0 0 0 10.3c.6 1.5 1.5 2.7 2.8 3.6s2.8 1.3 4.8 1.3c1.5 0 2.7-.2 3.8-.8a7 7 0 0 0 2.6-2c.7-1 1-2 1.2-3.2h6.2a11 11 0 0 1-2 6.2 15.1 15.1 0 0 1-11.8 5.5Zm19.7-1v-40h6.4V31h-1.3c0-3 .4-5.5 1.1-7.6a9.7 9.7 0 0 1 3.5-4.8A9.9 9.9 0 0 1 172 17h.3c3.5 0 6 1.1 7.9 3.5 1.7 2.3 2.6 5.7 2.6 10v16.8h-6.4V29.6c0-2.1-.6-3.8-1.8-5a6.4 6.4 0 0 0-4.8-1.8c-2 0-3.7.7-5 2a7.8 7.8 0 0 0-1.9 5.5v17h-6.4Zm63.8 1a12.2 12.2 0 0 1-10.9-6.2 19 19 0 0 1-1.8-7.3h1.4v12.5h-5.1v-40h6.4v19.8l-2 3.5c.2-3.1.8-5.7 1.9-7.7a11 11 0 0 1 4.4-4.5c1.8-1 3.9-1.5 6.1-1.5a13.4 13.4 0 0 1 12.8 9.1c.7 1.9 1 3.8 1 6v1c0 2.2-.3 4.1-1 6a13.6 13.6 0 0 1-13.2 9.4Zm-1.2-5.5a8.4 8.4 0 0 0 7.9-5c.7-1.5 1.1-3.3 1.1-5.3s-.4-3.8-1.1-5.3a8.7 8.7 0 0 0-3.2-3.6 9.6 9.6 0 0 0-9.2-.2 8.5 8.5 0 0 0-3.3 3.2c-.8 1.4-1.3 3-1.3 5v2.3a9 9 0 0 0 1.3 4.8 9 9 0 0 0 3.4 3c1.4.7 2.8 1 4.4 1Zm27.3 3.9-10-28.9h6.5l9.5 28.9h-6Zm-7.5 12.2v-5.7h4.9c1 0 2-.1 2.9-.4a4 4 0 0 0 2-1.4c.4-.7.9-1.6 1.2-2.7l8.6-30.9h6.2l-9.3 32.4a14 14 0 0 1-2.5 5 8.9 8.9 0 0 1-4 2.8c-1.5.6-3.4.9-5.6.9h-4.4Zm9-12.2v-5.2h6.4v5.2H248Z"
  }), h$1("path", {
    fill: theme === 'dark' ? '#FFF' : '#003DFF',
    d: "M534.4 9.1H528a.8.8 0 0 1-.7-.7V1.8c0-.4.2-.7.6-.8l6.5-1c.4 0 .8.2.9.6v7.8c0 .4-.4.7-.8.7zM428 35.2V.8c0-.5-.3-.8-.7-.8h-.2l-6.4 1c-.4 0-.7.4-.7.8v35c0 1.6 0 11.8 12.3 12.2.5 0 .8-.4.8-.8V43c0-.4-.3-.7-.6-.8-4.5-.5-4.5-6-4.5-7zm106.5-21.8H528c-.4 0-.7.4-.7.8v34c0 .4.3.8.7.8h6.5c.4 0 .8-.4.8-.8v-34c0-.5-.4-.8-.8-.8zm-17.7 21.8V.8c0-.5-.3-.8-.8-.8l-6.5 1c-.4 0-.7.4-.7.8v35c0 1.6 0 11.8 12.3 12.2.4 0 .8-.4.8-.8V43c0-.4-.3-.7-.7-.8-4.4-.5-4.4-6-4.4-7zm-22.2-20.6a16.5 16.5 0 0 1 8.6 9.3c.8 2.2 1.3 4.8 1.3 7.5a19.4 19.4 0 0 1-4.6 12.6 14.8 14.8 0 0 1-5.2 3.6c-2 .9-5.2 1.4-6.8 1.4a21 21 0 0 1-6.7-1.4 15.4 15.4 0 0 1-8.6-9.3 21.3 21.3 0 0 1 0-14.4 15.2 15.2 0 0 1 8.6-9.3c2-.8 4.3-1.2 6.7-1.2s4.6.4 6.7 1.2zm-6.7 27.6c2.7 0 4.7-1 6.2-3s2.2-4.3 2.2-7.8-.7-6.3-2.2-8.3-3.5-3-6.2-3-4.7 1-6.1 3c-1.5 2-2.2 4.8-2.2 8.3s.7 5.8 2.2 7.8 3.5 3 6.2 3zm-88.8-28.8c-6.2 0-11.7 3.3-14.8 8.2a18.6 18.6 0 0 0 4.8 25.2c1.8 1.2 4 1.8 6.2 1.7s.1 0 .1 0h.9c4.2-.7 8-4 9.1-8.1v7.4c0 .4.3.7.8.7h6.4a.7.7 0 0 0 .7-.7V14.2c0-.5-.3-.8-.7-.8h-13.5zm6.3 26.5a9.8 9.8 0 0 1-5.7 2h-.5a10 10 0 0 1-9.2-14c1.4-3.7 5-6.3 9-6.3h6.4v18.3zm152.3-26.5h13.5c.5 0 .8.3.8.7v33.7c0 .4-.3.7-.8.7h-6.4a.7.7 0 0 1-.8-.7v-7.4c-1.2 4-4.8 7.4-9 8h-.1a4.2 4.2 0 0 1-.5.1h-.9a10.3 10.3 0 0 1-7-2.6c-4-3.3-6.5-8.4-6.5-14.2 0-3.7 1-7.2 3-10 3-5 8.5-8.3 14.7-8.3zm.6 28.4c2.2-.1 4.2-.6 5.7-2V21.7h-6.3a9.8 9.8 0 0 0-9 6.4 10.2 10.2 0 0 0 9.1 13.9h.5zM452.8 13.4c-6.2 0-11.7 3.3-14.8 8.2a18.5 18.5 0 0 0 3.6 24.3 10.4 10.4 0 0 0 13 .6c2.2-1.5 3.8-3.7 4.5-6.1v7.8c0 2.8-.8 5-2.2 6.3-1.5 1.5-4 2.2-7.5 2.2l-6-.3c-.3 0-.7.2-.8.5l-1.6 5.5c-.1.4.1.8.5 1h.1c2.8.4 5.5.6 7 .6 6.3 0 11-1.4 14-4.1 2.7-2.5 4.2-6.3 4.5-11.4V14.2c0-.5-.4-.8-.8-.8h-13.5zm6.3 8.2v18.3a9.6 9.6 0 0 1-5.6 2h-1a10.3 10.3 0 0 1-8.8-14c1.4-3.7 5-6.3 9-6.3h6.4zM291 31.5A32 32 0 0 1 322.8 0h30.8c.6 0 1.2.5 1.2 1.2v61.5c0 1.1-1.3 1.7-2.2 1l-19.2-17a18 18 0 0 1-11 3.4 18.1 18.1 0 1 1 18.2-14.8c-.1.4-.5.7-.9.6-.1 0-.3 0-.4-.2l-3.8-3.4c-.4-.3-.6-.8-.7-1.4a12 12 0 1 0-2.4 8.3c.4-.4 1-.5 1.6-.2l14.7 13.1v-46H323a26 26 0 1 0 10 49.7c.8-.4 1.6-.2 2.3.3l3 2.7c.3.2.3.7 0 1l-.2.2a32 32 0 0 1-47.2-28.6z"
  }))));
};

var PoweredBy$1 = PoweredBy;

function ownKeys$q(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$q(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$q(Object(source), true).forEach(function (key) { _defineProperty$t(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$q(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$t(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var withUsage$m = createDocumentationMessageGenerator({
  name: 'powered-by',
  connector: true
});

/**
 * **PoweredBy** connector provides the logic to build a custom widget that will displays
 * the logo to redirect to Algolia.
 */
var connectPoweredBy = function connectPoweredBy(renderFn) {
  var unmountFn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : noop;
  checkRendering(renderFn, withUsage$m());
  var defaultUrl = 'https://www.algolia.com/?' + 'utm_source=instantsearch.js&' + 'utm_medium=website&' + "utm_content=".concat(safelyRunOnBrowser(function (_ref) {
    var _window$location;

    var window = _ref.window;
    return ((_window$location = window.location) === null || _window$location === void 0 ? void 0 : _window$location.hostname) || '';
  }, {
    fallback: function fallback() {
      return '';
    }
  }), "&") + 'utm_campaign=poweredby';
  return function (widgetParams) {
    var _ref2 = widgetParams || {},
        _ref2$url = _ref2.url,
        url = _ref2$url === void 0 ? defaultUrl : _ref2$url;

    return {
      $$type: 'ais.poweredBy',
      init: function init(initOptions) {
        var instantSearchInstance = initOptions.instantSearchInstance;
        renderFn(_objectSpread$q(_objectSpread$q({}, this.getWidgetRenderState(initOptions)), {}, {
          instantSearchInstance: instantSearchInstance
        }), true);
      },
      render: function render(renderOptions) {
        var instantSearchInstance = renderOptions.instantSearchInstance;
        renderFn(_objectSpread$q(_objectSpread$q({}, this.getWidgetRenderState(renderOptions)), {}, {
          instantSearchInstance: instantSearchInstance
        }), false);
      },
      getRenderState: function getRenderState(renderState, renderOptions) {
        return _objectSpread$q(_objectSpread$q({}, renderState), {}, {
          poweredBy: this.getWidgetRenderState(renderOptions)
        });
      },
      getWidgetRenderState: function getWidgetRenderState() {
        return {
          url: url,
          widgetParams: widgetParams
        };
      },
      dispose: function dispose() {
        unmountFn();
      }
    };
  };
};

var connectPoweredBy$1 = connectPoweredBy;

function ownKeys$p(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$p(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$p(Object(source), true).forEach(function (key) { _defineProperty$s(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$p(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$s(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var suit$b = component('PoweredBy');
var withUsage$l = createDocumentationMessageGenerator({
  name: 'powered-by'
});

var renderer$b = function renderer(_ref) {
  var containerNode = _ref.containerNode,
      cssClasses = _ref.cssClasses;
  return function (_ref2, isFirstRendering) {
    var url = _ref2.url,
        widgetParams = _ref2.widgetParams;

    if (isFirstRendering) {
      var _widgetParams$theme = widgetParams.theme,
          theme = _widgetParams$theme === void 0 ? 'light' : _widgetParams$theme;
      P(h$1(PoweredBy$1, {
        cssClasses: cssClasses,
        url: url,
        theme: theme
      }), containerNode);
      return;
    }
  };
};

var poweredBy = function poweredBy(widgetParams) {
  var _ref3 = widgetParams || {},
      container = _ref3.container,
      _ref3$cssClasses = _ref3.cssClasses,
      userCssClasses = _ref3$cssClasses === void 0 ? {} : _ref3$cssClasses,
      _ref3$theme = _ref3.theme,
      theme = _ref3$theme === void 0 ? 'light' : _ref3$theme;

  if (!container) {
    throw new Error(withUsage$l('The `container` option is required.'));
  }

  var containerNode = getContainerNode(container);
  var cssClasses = {
    root: cx(suit$b(), suit$b({
      modifierName: theme === 'dark' ? 'dark' : 'light'
    }), userCssClasses.root),
    link: cx(suit$b({
      descendantName: 'link'
    }), userCssClasses.link),
    logo: cx(suit$b({
      descendantName: 'logo'
    }), userCssClasses.logo)
  };
  var specializedRenderer = renderer$b({
    containerNode: containerNode,
    cssClasses: cssClasses
  });
  var makeWidget = connectPoweredBy$1(specializedRenderer, function () {
    return P(null, containerNode);
  });
  return _objectSpread$p(_objectSpread$p({}, makeWidget({
    theme: theme
  })), {}, {
    $$widgetType: 'ais.poweredBy'
  });
};

var poweredBy$1 = poweredBy;

function ownKeys$o(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$o(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$o(Object(source), true).forEach(function (key) { _defineProperty$r(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$o(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$r(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray$2(arr) { return _arrayWithoutHoles$2(arr) || _iterableToArray$2(arr) || _unsupportedIterableToArray$5(arr) || _nonIterableSpread$2(); }

function _nonIterableSpread$2() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray$5(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$5(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$5(o, minLen); }

function _iterableToArray$2(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles$2(arr) { if (Array.isArray(arr)) return _arrayLikeToArray$5(arr); }

function _arrayLikeToArray$5(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
var withUsage$k = createDocumentationMessageGenerator({
  name: 'query-rules',
  connector: true
});

function hasStateRefinements(state) {
  return [state.disjunctiveFacetsRefinements, state.facetsRefinements, state.hierarchicalFacetsRefinements, state.numericRefinements].some(function (refinement) {
    return Boolean(refinement && Object.keys(refinement).length > 0);
  });
} // A context rule must consist only of alphanumeric characters, hyphens, and underscores.
// See https://www.algolia.com/doc/guides/managing-results/refine-results/merchandising-and-promoting/in-depth/implementing-query-rules/#context


function escapeRuleContext(ruleName) {
  return ruleName.replace(/[^a-z0-9-_]+/gi, '_');
}

function getRuleContextsFromTrackedFilters(_ref) {
  var helper = _ref.helper,
      sharedHelperState = _ref.sharedHelperState,
      trackedFilters = _ref.trackedFilters;
  var ruleContexts = Object.keys(trackedFilters).reduce(function (facets, facetName) {
    var facetRefinements = getRefinements(helper.lastResults || {}, sharedHelperState, true).filter(function (refinement) {
      return refinement.attribute === facetName;
    }).map(function (refinement) {
      return refinement.numericValue || refinement.name;
    });
    var getTrackedFacetValues = trackedFilters[facetName];
    var trackedFacetValues = getTrackedFacetValues(facetRefinements);
    return [].concat(_toConsumableArray$2(facets), _toConsumableArray$2(facetRefinements.filter(function (facetRefinement) {
      return trackedFacetValues.includes(facetRefinement);
    }).map(function (facetValue) {
      return escapeRuleContext("ais-".concat(facetName, "-").concat(facetValue));
    })));
  }, []);
  return ruleContexts;
}

function applyRuleContexts(event) {
  var helper = this.helper,
      initialRuleContexts = this.initialRuleContexts,
      trackedFilters = this.trackedFilters,
      transformRuleContexts = this.transformRuleContexts;
  var sharedHelperState = event.state;
  var previousRuleContexts = sharedHelperState.ruleContexts || [];
  var newRuleContexts = getRuleContextsFromTrackedFilters({
    helper: helper,
    sharedHelperState: sharedHelperState,
    trackedFilters: trackedFilters
  });
  var nextRuleContexts = [].concat(_toConsumableArray$2(initialRuleContexts), _toConsumableArray$2(newRuleContexts));
  _warning(nextRuleContexts.length <= 10, "\nThe maximum number of `ruleContexts` is 10. They have been sliced to that limit.\nConsider using `transformRuleContexts` to minimize the number of rules sent to Algolia.\n") ;
  var ruleContexts = transformRuleContexts(nextRuleContexts).slice(0, 10);

  if (!isEqual(previousRuleContexts, ruleContexts)) {
    helper.overrideStateWithoutTriggeringChangeEvent(_objectSpread$o(_objectSpread$o({}, sharedHelperState), {}, {
      ruleContexts: ruleContexts
    }));
  }
}

var connectQueryRules = function connectQueryRules(_render) {
  var unmount = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : noop;
  checkRendering(_render, withUsage$k());
  return function (widgetParams) {
    var _ref2 = widgetParams || {},
        _ref2$trackedFilters = _ref2.trackedFilters,
        trackedFilters = _ref2$trackedFilters === void 0 ? {} : _ref2$trackedFilters,
        _ref2$transformRuleCo = _ref2.transformRuleContexts,
        transformRuleContexts = _ref2$transformRuleCo === void 0 ? function (rules) {
      return rules;
    } : _ref2$transformRuleCo,
        _ref2$transformItems = _ref2.transformItems,
        transformItems = _ref2$transformItems === void 0 ? function (items) {
      return items;
    } : _ref2$transformItems;

    Object.keys(trackedFilters).forEach(function (facetName) {
      if (typeof trackedFilters[facetName] !== 'function') {
        throw new Error(withUsage$k("'The \"".concat(facetName, "\" filter value in the `trackedFilters` option expects a function.")));
      }
    });
    var hasTrackedFilters = Object.keys(trackedFilters).length > 0; // We store the initial rule contexts applied before creating the widget
    // so that we do not override them with the rules created from `trackedFilters`.

    var initialRuleContexts = [];
    var onHelperChange;
    return {
      $$type: 'ais.queryRules',
      init: function init(initOptions) {
        var helper = initOptions.helper,
            state = initOptions.state,
            instantSearchInstance = initOptions.instantSearchInstance;
        initialRuleContexts = state.ruleContexts || [];
        onHelperChange = applyRuleContexts.bind({
          helper: helper,
          initialRuleContexts: initialRuleContexts,
          trackedFilters: trackedFilters,
          transformRuleContexts: transformRuleContexts
        });

        if (hasTrackedFilters) {
          // We need to apply the `ruleContexts` based on the `trackedFilters`
          // before the helper changes state in some cases:
          //   - Some filters are applied on the first load (e.g. using `configure`)
          //   - The `transformRuleContexts` option sets initial `ruleContexts`.
          if (hasStateRefinements(state) || Boolean(widgetParams.transformRuleContexts)) {
            onHelperChange({
              state: state
            });
          } // We track every change in the helper to override its state and add
          // any `ruleContexts` needed based on the `trackedFilters`.


          helper.on('change', onHelperChange);
        }

        _render(_objectSpread$o(_objectSpread$o({}, this.getWidgetRenderState(initOptions)), {}, {
          instantSearchInstance: instantSearchInstance
        }), true);
      },
      render: function render(renderOptions) {
        var instantSearchInstance = renderOptions.instantSearchInstance;

        _render(_objectSpread$o(_objectSpread$o({}, this.getWidgetRenderState(renderOptions)), {}, {
          instantSearchInstance: instantSearchInstance
        }), false);
      },
      getWidgetRenderState: function getWidgetRenderState(_ref3) {
        var results = _ref3.results;

        var _ref4 = results || {},
            _ref4$userData = _ref4.userData,
            userData = _ref4$userData === void 0 ? [] : _ref4$userData;

        var items = transformItems(userData, {
          results: results
        });
        return {
          items: items,
          widgetParams: widgetParams
        };
      },
      getRenderState: function getRenderState(renderState, renderOptions) {
        return _objectSpread$o(_objectSpread$o({}, renderState), {}, {
          queryRules: this.getWidgetRenderState(renderOptions)
        });
      },
      dispose: function dispose(_ref5) {
        var helper = _ref5.helper,
            state = _ref5.state;
        unmount();

        if (hasTrackedFilters) {
          helper.removeListener('change', onHelperChange);
          return state.setQueryParameter('ruleContexts', initialRuleContexts);
        }

        return state;
      }
    };
  };
};

var connectQueryRules$1 = connectQueryRules;

function ownKeys$n(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$n(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$n(Object(source), true).forEach(function (key) { _defineProperty$q(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$n(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$q(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var withUsage$j = createDocumentationMessageGenerator({
  name: 'query-rule-context'
});

var queryRuleContext = function queryRuleContext() {
  var widgetParams = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  if (!widgetParams.trackedFilters) {
    throw new Error(withUsage$j('The `trackedFilters` option is required.'));
  }

  return _objectSpread$n(_objectSpread$n({}, connectQueryRules$1(noop)(widgetParams)), {}, {
    $$widgetType: 'ais.queryRuleContext'
  });
};

var queryRuleContext$1 = queryRuleContext;

var QueryRuleCustomData = function QueryRuleCustomData(_ref) {
  var cssClasses = _ref.cssClasses,
      templates = _ref.templates,
      items = _ref.items;
  return h$1(Template$1, {
    templateKey: "default",
    templates: templates,
    rootProps: {
      className: cssClasses.root
    },
    data: {
      items: items
    }
  });
};

var CustomData = QueryRuleCustomData;

function ownKeys$m(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$m(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$m(Object(source), true).forEach(function (key) { _defineProperty$p(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$m(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$p(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var defaultTemplates$d = {
  default: function _default(_ref) {
    var items = _ref.items;
    return JSON.stringify(items, null, 2);
  }
};
var withUsage$i = createDocumentationMessageGenerator({
  name: 'query-rule-custom-data'
});
var suit$a = component('QueryRuleCustomData');

var renderer$a = function renderer(_ref2) {
  var containerNode = _ref2.containerNode,
      cssClasses = _ref2.cssClasses,
      templates = _ref2.templates;
  return function (_ref3) {
    var items = _ref3.items;
    P(h$1(CustomData, {
      cssClasses: cssClasses,
      templates: templates,
      items: items
    }), containerNode);
  };
};

var queryRuleCustomData = function queryRuleCustomData(widgetParams) {
  var _ref4 = widgetParams || {},
      container = _ref4.container,
      _ref4$cssClasses = _ref4.cssClasses,
      userCssClasses = _ref4$cssClasses === void 0 ? {} : _ref4$cssClasses,
      _ref4$templates = _ref4.templates,
      userTemplates = _ref4$templates === void 0 ? {} : _ref4$templates,
      _ref4$transformItems = _ref4.transformItems,
      transformItems = _ref4$transformItems === void 0 ? function (items) {
    return items;
  } : _ref4$transformItems;

  if (!container) {
    throw new Error(withUsage$i('The `container` option is required.'));
  }

  var cssClasses = {
    root: cx(suit$a(), userCssClasses.root)
  };
  var containerNode = getContainerNode(container);

  var templates = _objectSpread$m(_objectSpread$m({}, defaultTemplates$d), userTemplates);

  var specializedRenderer = renderer$a({
    containerNode: containerNode,
    cssClasses: cssClasses,
    renderState: {},
    templates: templates
  });
  var makeWidget = connectQueryRules$1(specializedRenderer, function () {
    P(null, containerNode);
  });
  return _objectSpread$m(_objectSpread$m({}, makeWidget({
    transformItems: transformItems
  })), {}, {
    $$widgetType: 'ais.queryRuleCustomData'
  });
};

var queryRuleCustomData$1 = queryRuleCustomData;

function _typeof$2(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof$2 = function _typeof(obj) { return typeof obj; }; } else { _typeof$2 = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof$2(obj); }

function _extends$4() { _extends$4 = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$4.apply(this, arguments); }

function _classCallCheck$2(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties$2(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass$2(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties$2(Constructor.prototype, protoProps); if (staticProps) _defineProperties$2(Constructor, staticProps); return Constructor; }

function _inherits$2(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf$2(subClass, superClass); }

function _setPrototypeOf$2(o, p) { _setPrototypeOf$2 = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf$2(o, p); }

function _createSuper$2(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$2(); return function _createSuperInternal() { var Super = _getPrototypeOf$2(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf$2(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn$2(this, result); }; }

function _possibleConstructorReturn$2(self, call) { if (call && (_typeof$2(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized$2(self); }

function _assertThisInitialized$2(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct$2() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf$2(o) { _getPrototypeOf$2 = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf$2(o); }

function _defineProperty$o(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var RangeInput = /*#__PURE__*/function (_Component) {
  _inherits$2(RangeInput, _Component);

  var _super = _createSuper$2(RangeInput);

  function RangeInput() {
    var _this;

    _classCallCheck$2(this, RangeInput);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty$o(_assertThisInitialized$2(_this), "state", {
      min: _this.props.values.min,
      max: _this.props.values.max
    });

    _defineProperty$o(_assertThisInitialized$2(_this), "onInput", function (key) {
      return function (event) {
        var _ref = event.currentTarget,
            value = _ref.value;

        _this.setState(_defineProperty$o({}, key, Number(value)));
      };
    });

    _defineProperty$o(_assertThisInitialized$2(_this), "onSubmit", function (event) {
      event.preventDefault();

      _this.props.refine([_this.state.min, _this.state.max]);
    });

    return _this;
  }

  _createClass$2(RangeInput, [{
    key: "componentWillReceiveProps",
    value: function componentWillReceiveProps(nextProps) {
      this.setState({
        min: nextProps.values.min,
        max: nextProps.values.max
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this$state = this.state,
          minValue = _this$state.min,
          maxValue = _this$state.max;
      var _this$props = this.props,
          min = _this$props.min,
          max = _this$props.max,
          step = _this$props.step,
          cssClasses = _this$props.cssClasses,
          templateProps = _this$props.templateProps;
      var isDisabled = min && max ? min >= max : false;
      var hasRefinements = Boolean(minValue || maxValue);
      var rootClassNames = cx(cssClasses.root, !hasRefinements && cssClasses.noRefinement);
      return h$1("div", {
        className: rootClassNames
      }, h$1("form", {
        className: cssClasses.form,
        onSubmit: this.onSubmit
      }, h$1("label", {
        className: cssClasses.label
      }, h$1("input", {
        className: cx(cssClasses.input, cssClasses.inputMin),
        type: "number",
        min: min,
        max: max,
        step: step,
        value: minValue !== null && minValue !== void 0 ? minValue : '',
        onInput: this.onInput('min'),
        placeholder: min === null || min === void 0 ? void 0 : min.toString(),
        disabled: isDisabled
      })), h$1(Template$1, _extends$4({}, templateProps, {
        templateKey: "separatorText",
        rootTagName: "span",
        rootProps: {
          className: cssClasses.separator
        }
      })), h$1("label", {
        className: cssClasses.label
      }, h$1("input", {
        className: cx(cssClasses.input, cssClasses.inputMax),
        type: "number",
        min: min,
        max: max,
        step: step,
        value: maxValue !== null && maxValue !== void 0 ? maxValue : '',
        onInput: this.onInput('max'),
        placeholder: max === null || max === void 0 ? void 0 : max.toString(),
        disabled: isDisabled
      })), h$1(Template$1, _extends$4({}, templateProps, {
        templateKey: "submitText",
        rootTagName: "button",
        rootProps: {
          type: 'submit',
          className: cssClasses.submit,
          disabled: isDisabled
        }
      }))));
    }
  }]);

  return RangeInput;
}(d$1);

var RangeInput$1 = RangeInput;

function ownKeys$l(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$l(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$l(Object(source), true).forEach(function (key) { _defineProperty$n(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$l(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$n(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray$3(arr, i) { return _arrayWithHoles$3(arr) || _iterableToArrayLimit$3(arr, i) || _unsupportedIterableToArray$4(arr, i) || _nonIterableRest$3(); }

function _nonIterableRest$3() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray$4(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$4(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$4(o, minLen); }

function _arrayLikeToArray$4(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit$3(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles$3(arr) { if (Array.isArray(arr)) return arr; }
var withUsage$h = createDocumentationMessageGenerator({
  name: 'range-input',
  connector: true
}, {
  name: 'range-slider',
  connector: true
});
var $$type$2 = 'ais.range';

function toPrecision(_ref) {
  var min = _ref.min,
      max = _ref.max,
      precision = _ref.precision;
  var pow = Math.pow(10, precision);
  return {
    min: min ? Math.floor(min * pow) / pow : min,
    max: max ? Math.ceil(max * pow) / pow : max
  };
}
/**
 * **Range** connector provides the logic to create custom widget that will let
 * the user refine results using a numeric range.
 *
 * This connectors provides a `refine()` function that accepts bounds. It will also provide
 * information about the min and max bounds for the current result set.
 */


var connectRange = function connectRange(renderFn) {
  var unmountFn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : noop;
  checkRendering(renderFn, withUsage$h());
  return function (widgetParams) {
    var _ref2 = widgetParams || {},
        _ref2$attribute = _ref2.attribute,
        attribute = _ref2$attribute === void 0 ? '' : _ref2$attribute,
        minBound = _ref2.min,
        maxBound = _ref2.max,
        _ref2$precision = _ref2.precision,
        precision = _ref2$precision === void 0 ? 0 : _ref2$precision;

    if (!attribute) {
      throw new Error(withUsage$h('The `attribute` option is required.'));
    }

    if (isFiniteNumber(minBound) && isFiniteNumber(maxBound) && minBound > maxBound) {
      throw new Error(withUsage$h("The `max` option can't be lower than `min`."));
    }

    var formatToNumber = function formatToNumber(v) {
      return Number(Number(v).toFixed(precision));
    };

    var rangeFormatter = {
      from: function from(v) {
        return v.toLocaleString();
      },
      to: function to(v) {
        return formatToNumber(v).toLocaleString();
      }
    }; // eslint-disable-next-line complexity

    var getRefinedState = function getRefinedState(helper, currentRange, nextMin, nextMax) {
      var resolvedState = helper.state;
      var currentRangeMin = currentRange.min,
          currentRangeMax = currentRange.max;

      var _ref3 = resolvedState.getNumericRefinement(attribute, '>=') || [],
          _ref4 = _slicedToArray$3(_ref3, 1),
          min = _ref4[0];

      var _ref5 = resolvedState.getNumericRefinement(attribute, '<=') || [],
          _ref6 = _slicedToArray$3(_ref5, 1),
          max = _ref6[0];

      var isResetMin = nextMin === undefined || nextMin === '';
      var isResetMax = nextMax === undefined || nextMax === '';

      var _toPrecision = toPrecision({
        min: !isResetMin ? parseFloat(nextMin) : undefined,
        max: !isResetMax ? parseFloat(nextMax) : undefined,
        precision: precision
      }),
          nextMinAsNumber = _toPrecision.min,
          nextMaxAsNumber = _toPrecision.max;

      var newNextMin;

      if (!isFiniteNumber(minBound) && currentRangeMin === nextMinAsNumber) {
        newNextMin = undefined;
      } else if (isFiniteNumber(minBound) && isResetMin) {
        newNextMin = minBound;
      } else {
        newNextMin = nextMinAsNumber;
      }

      var newNextMax;

      if (!isFiniteNumber(maxBound) && currentRangeMax === nextMaxAsNumber) {
        newNextMax = undefined;
      } else if (isFiniteNumber(maxBound) && isResetMax) {
        newNextMax = maxBound;
      } else {
        newNextMax = nextMaxAsNumber;
      }

      var isResetNewNextMin = newNextMin === undefined;
      var isGreaterThanCurrentRange = isFiniteNumber(currentRangeMin) && currentRangeMin <= newNextMin;
      var isMinValid = isResetNewNextMin || isFiniteNumber(newNextMin) && (!isFiniteNumber(currentRangeMin) || isGreaterThanCurrentRange);
      var isResetNewNextMax = newNextMax === undefined;
      var isLowerThanRange = isFiniteNumber(newNextMax) && currentRangeMax >= newNextMax;
      var isMaxValid = isResetNewNextMax || isFiniteNumber(newNextMax) && (!isFiniteNumber(currentRangeMax) || isLowerThanRange);
      var hasMinChange = min !== newNextMin;
      var hasMaxChange = max !== newNextMax;

      if ((hasMinChange || hasMaxChange) && isMinValid && isMaxValid) {
        resolvedState = resolvedState.removeNumericRefinement(attribute);

        if (isFiniteNumber(newNextMin)) {
          resolvedState = resolvedState.addNumericRefinement(attribute, '>=', newNextMin);
        }

        if (isFiniteNumber(newNextMax)) {
          resolvedState = resolvedState.addNumericRefinement(attribute, '<=', newNextMax);
        }

        return resolvedState.resetPage();
      }

      return null;
    };

    var createSendEvent = function createSendEvent(instantSearchInstance) {
      return function () {
        if (arguments.length === 1) {
          instantSearchInstance.sendEventToInsights(arguments.length <= 0 ? undefined : arguments[0]);
          return;
        }
      };
    };

    function _getCurrentRange(stats) {
      var min;

      if (isFiniteNumber(minBound)) {
        min = minBound;
      } else if (isFiniteNumber(stats.min)) {
        min = stats.min;
      } else {
        min = 0;
      }

      var max;

      if (isFiniteNumber(maxBound)) {
        max = maxBound;
      } else if (isFiniteNumber(stats.max)) {
        max = stats.max;
      } else {
        max = 0;
      }

      return toPrecision({
        min: min,
        max: max,
        precision: precision
      });
    }

    function _getCurrentRefinement(helper) {
      var _ref7 = helper.getNumericRefinement(attribute, '>=') || [],
          _ref8 = _slicedToArray$3(_ref7, 1),
          minValue = _ref8[0];

      var _ref9 = helper.getNumericRefinement(attribute, '<=') || [],
          _ref10 = _slicedToArray$3(_ref9, 1),
          maxValue = _ref10[0];

      var min = isFiniteNumber(minValue) ? minValue : -Infinity;
      var max = isFiniteNumber(maxValue) ? maxValue : Infinity;
      return [min, max];
    }

    function _refine(helper, currentRange) {
      return function () {
        var _ref11 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [undefined, undefined],
            _ref12 = _slicedToArray$3(_ref11, 2),
            nextMin = _ref12[0],
            nextMax = _ref12[1];

        var refinedState = getRefinedState(helper, currentRange, nextMin, nextMax);

        if (refinedState) {
          helper.setState(refinedState).search();
        }
      };
    }

    return {
      $$type: $$type$2,
      init: function init(initOptions) {
        renderFn(_objectSpread$l(_objectSpread$l({}, this.getWidgetRenderState(initOptions)), {}, {
          instantSearchInstance: initOptions.instantSearchInstance
        }), true);
      },
      render: function render(renderOptions) {
        renderFn(_objectSpread$l(_objectSpread$l({}, this.getWidgetRenderState(renderOptions)), {}, {
          instantSearchInstance: renderOptions.instantSearchInstance
        }), false);
      },
      getRenderState: function getRenderState(renderState, renderOptions) {
        return _objectSpread$l(_objectSpread$l({}, renderState), {}, {
          range: _objectSpread$l(_objectSpread$l({}, renderState.range), {}, _defineProperty$n({}, attribute, this.getWidgetRenderState(renderOptions)))
        });
      },
      getWidgetRenderState: function getWidgetRenderState(_ref13) {
        var results = _ref13.results,
            helper = _ref13.helper,
            instantSearchInstance = _ref13.instantSearchInstance;
        var facetsFromResults = results && results.disjunctiveFacets || [];
        var facet = find(facetsFromResults, function (facetResult) {
          return facetResult.name === attribute;
        });
        var stats = facet && facet.stats || {
          min: undefined,
          max: undefined
        };

        var currentRange = _getCurrentRange(stats);

        var start = _getCurrentRefinement(helper);

        var refine;

        if (!results) {
          // On first render pass an empty range
          // to be able to bypass the validation
          // related to it
          refine = _refine(helper, {
            min: undefined,
            max: undefined
          });
        } else {
          refine = _refine(helper, currentRange);
        }

        return {
          refine: refine,
          canRefine: currentRange.min !== currentRange.max,
          format: rangeFormatter,
          range: currentRange,
          sendEvent: createSendEvent(instantSearchInstance),
          widgetParams: _objectSpread$l(_objectSpread$l({}, widgetParams), {}, {
            precision: precision
          }),
          start: start
        };
      },
      dispose: function dispose(_ref14) {
        var state = _ref14.state;
        unmountFn();
        return state.removeDisjunctiveFacet(attribute).removeNumericRefinement(attribute);
      },
      getWidgetUiState: function getWidgetUiState(uiState, _ref15) {
        var searchParameters = _ref15.searchParameters;

        var _searchParameters$get = searchParameters.getNumericRefinements(attribute),
            _searchParameters$get2 = _searchParameters$get['>='],
            min = _searchParameters$get2 === void 0 ? [] : _searchParameters$get2,
            _searchParameters$get3 = _searchParameters$get['<='],
            max = _searchParameters$get3 === void 0 ? [] : _searchParameters$get3;

        if (min.length === 0 && max.length === 0) {
          return uiState;
        }

        return _objectSpread$l(_objectSpread$l({}, uiState), {}, {
          range: _objectSpread$l(_objectSpread$l({}, uiState.range), {}, _defineProperty$n({}, attribute, "".concat(min, ":").concat(max)))
        });
      },
      getWidgetSearchParameters: function getWidgetSearchParameters(searchParameters, _ref16) {
        var uiState = _ref16.uiState;
        var widgetSearchParameters = searchParameters.addDisjunctiveFacet(attribute).setQueryParameters({
          numericRefinements: _objectSpread$l(_objectSpread$l({}, searchParameters.numericRefinements), {}, _defineProperty$n({}, attribute, {}))
        });

        if (isFiniteNumber(minBound)) {
          widgetSearchParameters = widgetSearchParameters.addNumericRefinement(attribute, '>=', minBound);
        }

        if (isFiniteNumber(maxBound)) {
          widgetSearchParameters = widgetSearchParameters.addNumericRefinement(attribute, '<=', maxBound);
        }

        var value = uiState.range && uiState.range[attribute];

        if (!value || value.indexOf(':') === -1) {
          return widgetSearchParameters;
        }

        var _value$split$map = value.split(':').map(parseFloat),
            _value$split$map2 = _slicedToArray$3(_value$split$map, 2),
            lowerBound = _value$split$map2[0],
            upperBound = _value$split$map2[1];

        if (isFiniteNumber(lowerBound) && (!isFiniteNumber(minBound) || minBound < lowerBound)) {
          widgetSearchParameters = widgetSearchParameters.removeNumericRefinement(attribute, '>=');
          widgetSearchParameters = widgetSearchParameters.addNumericRefinement(attribute, '>=', lowerBound);
        }

        if (isFiniteNumber(upperBound) && (!isFiniteNumber(maxBound) || upperBound < maxBound)) {
          widgetSearchParameters = widgetSearchParameters.removeNumericRefinement(attribute, '<=');
          widgetSearchParameters = widgetSearchParameters.addNumericRefinement(attribute, '<=', upperBound);
        }

        return widgetSearchParameters;
      }
    };
  };
};

var connectRange$1 = connectRange;

function ownKeys$k(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$k(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$k(Object(source), true).forEach(function (key) { _defineProperty$m(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$k(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$m(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray$2(arr, i) { return _arrayWithHoles$2(arr) || _iterableToArrayLimit$2(arr, i) || _unsupportedIterableToArray$3(arr, i) || _nonIterableRest$2(); }

function _nonIterableRest$2() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray$3(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$3(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$3(o, minLen); }

function _arrayLikeToArray$3(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit$2(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles$2(arr) { if (Array.isArray(arr)) return arr; }
var withUsage$g = createDocumentationMessageGenerator({
  name: 'range-input'
});
var suit$9 = component('RangeInput');
var defaultTemplates$c = {
  separatorText: function separatorText() {
    return 'to';
  },
  submitText: function submitText() {
    return 'Go';
  }
};

var renderer$9 = function renderer(_ref) {
  var containerNode = _ref.containerNode,
      cssClasses = _ref.cssClasses,
      renderState = _ref.renderState,
      templates = _ref.templates;
  return function (_ref2, isFirstRendering) {
    var refine = _ref2.refine,
        range = _ref2.range,
        start = _ref2.start,
        widgetParams = _ref2.widgetParams,
        instantSearchInstance = _ref2.instantSearchInstance;

    if (isFirstRendering) {
      renderState.templateProps = prepareTemplateProps({
        defaultTemplates: defaultTemplates$c,
        templatesConfig: instantSearchInstance.templatesConfig,
        templates: templates
      });
      return;
    }

    var rangeMin = range.min,
        rangeMax = range.max;

    var _start = _slicedToArray$2(start, 2),
        minValue = _start[0],
        maxValue = _start[1];

    var step = 1 / Math.pow(10, widgetParams.precision || 0);
    var values = {
      min: minValue !== -Infinity && minValue !== rangeMin ? minValue : undefined,
      max: maxValue !== Infinity && maxValue !== rangeMax ? maxValue : undefined
    };
    P(h$1(RangeInput$1, {
      min: rangeMin,
      max: rangeMax,
      step: step,
      values: values,
      cssClasses: cssClasses,
      refine: refine,
      templateProps: renderState.templateProps
    }), containerNode);
  };
};

var rangeInput = function rangeInput(widgetParams) {
  var _ref3 = widgetParams || {},
      container = _ref3.container,
      attribute = _ref3.attribute,
      min = _ref3.min,
      max = _ref3.max,
      _ref3$precision = _ref3.precision,
      precision = _ref3$precision === void 0 ? 0 : _ref3$precision,
      _ref3$cssClasses = _ref3.cssClasses,
      userCssClasses = _ref3$cssClasses === void 0 ? {} : _ref3$cssClasses,
      _ref3$templates = _ref3.templates,
      templates = _ref3$templates === void 0 ? {} : _ref3$templates;

  if (!container) {
    throw new Error(withUsage$g('The `container` option is required.'));
  }

  var containerNode = getContainerNode(container);
  var cssClasses = {
    root: cx(suit$9(), userCssClasses.root),
    noRefinement: cx(suit$9({
      modifierName: 'noRefinement'
    })),
    form: cx(suit$9({
      descendantName: 'form'
    }), userCssClasses.form),
    label: cx(suit$9({
      descendantName: 'label'
    }), userCssClasses.label),
    input: cx(suit$9({
      descendantName: 'input'
    }), userCssClasses.input),
    inputMin: cx(suit$9({
      descendantName: 'input',
      modifierName: 'min'
    }), userCssClasses.inputMin),
    inputMax: cx(suit$9({
      descendantName: 'input',
      modifierName: 'max'
    }), userCssClasses.inputMax),
    separator: cx(suit$9({
      descendantName: 'separator'
    }), userCssClasses.separator),
    submit: cx(suit$9({
      descendantName: 'submit'
    }), userCssClasses.submit)
  };
  var specializedRenderer = renderer$9({
    containerNode: containerNode,
    cssClasses: cssClasses,
    templates: templates,
    renderState: {}
  });
  var makeWidget = connectRange$1(specializedRenderer, function () {
    return P(null, containerNode);
  });
  return _objectSpread$k(_objectSpread$k({}, makeWidget({
    attribute: attribute,
    min: min,
    max: max,
    precision: precision
  })), {}, {
    $$type: 'ais.rangeInput',
    $$widgetType: 'ais.rangeInput'
  });
};

var rangeInput$1 = rangeInput;

function _typeof$1(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof$1 = function _typeof(obj) { return typeof obj; }; } else { _typeof$1 = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof$1(obj); }

function _classCallCheck$1(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties$1(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass$1(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties$1(Constructor.prototype, protoProps); if (staticProps) _defineProperties$1(Constructor, staticProps); return Constructor; }

function _inherits$1(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf$1(subClass, superClass); }

function _setPrototypeOf$1(o, p) { _setPrototypeOf$1 = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf$1(o, p); }

function _createSuper$1(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$1(); return function _createSuperInternal() { var Super = _getPrototypeOf$1(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf$1(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn$1(this, result); }; }

function _possibleConstructorReturn$1(self, call) { if (call && (_typeof$1(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized$1(self); }

function _assertThisInitialized$1(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct$1() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf$1(o) { _getPrototypeOf$1 = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf$1(o); }

function _defineProperty$l(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _extends$3() { _extends$3 = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$3.apply(this, arguments); }
var KEYS = {
  DOWN: 40,
  END: 35,
  ESC: 27,
  HOME: 36,
  LEFT: 37,
  PAGE_DOWN: 34,
  PAGE_UP: 33,
  RIGHT: 39,
  UP: 38
};
var PERCENT_EMPTY = 0;
var PERCENT_FULL = 100;

function getPosition(value, min, max) {
  return (value - min) / (max - min) * 100;
}

function getValue(pos, min, max) {
  var decimal = pos / 100;

  if (pos === 0) {
    return min;
  } else if (pos === 100) {
    return max;
  }

  return Math.round((max - min) * decimal + min);
}

function getClassName(props) {
  var orientation = props.orientation === 'vertical' ? 'rheostat-vertical' : 'rheostat-horizontal';
  return ['rheostat', orientation].concat(props.className.split(' ')).join(' ');
}

function getHandleFor(ev) {
  return Number(ev.currentTarget.getAttribute('data-handle-key'));
}

function killEvent(ev) {
  ev.stopPropagation();
  ev.preventDefault();
}

function Button(props) {
  return h$1("button", _extends$3({}, props, {
    type: "button"
  }));
} // Preact doesn't have builtin types for Style, JSX.HTMLAttributes['style'] is just object
// maybe migrate to csstype later?


var _ref6$1 = h$1("div", {
  className: "rheostat-background"
});

var Rheostat = /*#__PURE__*/function (_Component) {
  _inherits$1(Rheostat, _Component);

  var _super = _createSuper$1(Rheostat);

  function Rheostat(props) {
    var _this;

    _classCallCheck$1(this, Rheostat);

    _this = _super.call(this, props);

    _defineProperty$l(_assertThisInitialized$1(_this), "state", {
      className: getClassName(_this.props),
      // non-null thanks to defaultProps
      handlePos: _this.props.values.map(function (value) {
        return getPosition(value, _this.props.min, _this.props.max);
      }),
      handleDimensions: 0,
      mousePos: null,
      sliderBox: {},
      slidingIndex: null,
      // non-null thanks to defaultProps
      values: _this.props.values
    });

    _defineProperty$l(_assertThisInitialized$1(_this), "rheostat", y$1());

    _this.getPublicState = _this.getPublicState.bind(_assertThisInitialized$1(_this));
    _this.getSliderBoundingBox = _this.getSliderBoundingBox.bind(_assertThisInitialized$1(_this));
    _this.getProgressStyle = _this.getProgressStyle.bind(_assertThisInitialized$1(_this));
    _this.getMinValue = _this.getMinValue.bind(_assertThisInitialized$1(_this));
    _this.getMaxValue = _this.getMaxValue.bind(_assertThisInitialized$1(_this));
    _this.getHandleDimensions = _this.getHandleDimensions.bind(_assertThisInitialized$1(_this));
    _this.getClosestSnapPoint = _this.getClosestSnapPoint.bind(_assertThisInitialized$1(_this));
    _this.getSnapPosition = _this.getSnapPosition.bind(_assertThisInitialized$1(_this));
    _this.getNextPositionForKey = _this.getNextPositionForKey.bind(_assertThisInitialized$1(_this));
    _this.getNextState = _this.getNextState.bind(_assertThisInitialized$1(_this));
    _this.handleClick = _this.handleClick.bind(_assertThisInitialized$1(_this));
    _this.getClosestHandle = _this.getClosestHandle.bind(_assertThisInitialized$1(_this));
    _this.setStartSlide = _this.setStartSlide.bind(_assertThisInitialized$1(_this));
    _this.startMouseSlide = _this.startMouseSlide.bind(_assertThisInitialized$1(_this));
    _this.startTouchSlide = _this.startTouchSlide.bind(_assertThisInitialized$1(_this));
    _this.handleMouseSlide = _this.handleMouseSlide.bind(_assertThisInitialized$1(_this));
    _this.handleTouchSlide = _this.handleTouchSlide.bind(_assertThisInitialized$1(_this));
    _this.handleSlide = _this.handleSlide.bind(_assertThisInitialized$1(_this));
    _this.endSlide = _this.endSlide.bind(_assertThisInitialized$1(_this));
    _this.handleKeydown = _this.handleKeydown.bind(_assertThisInitialized$1(_this));
    _this.validatePosition = _this.validatePosition.bind(_assertThisInitialized$1(_this));
    _this.validateValues = _this.validateValues.bind(_assertThisInitialized$1(_this));
    _this.canMove = _this.canMove.bind(_assertThisInitialized$1(_this));
    _this.fireChangeEvent = _this.fireChangeEvent.bind(_assertThisInitialized$1(_this));
    _this.slideTo = _this.slideTo.bind(_assertThisInitialized$1(_this));
    _this.updateNewValues = _this.updateNewValues.bind(_assertThisInitialized$1(_this));
    return _this;
  }

  _createClass$1(Rheostat, [{
    key: "componentWillReceiveProps",
    value: function componentWillReceiveProps(nextProps) {
      var _this$props = this.props,
          className = _this$props.className,
          disabled = _this$props.disabled,
          min = _this$props.min,
          max = _this$props.max,
          orientation = _this$props.orientation;
      var _this$state = this.state,
          values = _this$state.values,
          slidingIndex = _this$state.slidingIndex;
      var minMaxChanged = nextProps.min !== min || nextProps.max !== max;
      var valuesChanged = values.length !== nextProps.values.length || values.some(function (value, idx) {
        return nextProps.values[idx] !== value;
      });
      var orientationChanged = nextProps.className !== className || nextProps.orientation !== orientation;
      var willBeDisabled = nextProps.disabled && !disabled;

      if (orientationChanged) {
        this.setState({
          className: getClassName(nextProps)
        });
      }

      if (minMaxChanged || valuesChanged) this.updateNewValues(nextProps);

      if (willBeDisabled && slidingIndex !== null) {
        this.endSlide();
      }
    }
  }, {
    key: "getPublicState",
    value: function getPublicState() {
      var _this$props2 = this.props,
          min = _this$props2.min,
          max = _this$props2.max;
      var values = this.state.values;
      return {
        max: max,
        min: min,
        values: values
      };
    }
  }, {
    key: "getSliderBoundingBox",
    value: function getSliderBoundingBox() {
      // only gets called after render, so it will always be defined
      var node = this.rheostat.current;
      var rect = node.getBoundingClientRect();
      return {
        height: rect.height || node.clientHeight,
        left: rect.left,
        top: rect.top,
        width: rect.width || node.clientWidth
      };
    }
  }, {
    key: "getProgressStyle",
    value: function getProgressStyle(idx) {
      var handlePos = this.state.handlePos;
      var value = handlePos[idx];

      if (idx === 0) {
        return this.props.orientation === 'vertical' ? {
          height: "".concat(value, "%"),
          top: 0
        } : {
          left: 0,
          width: "".concat(value, "%")
        };
      }

      var prevValue = handlePos[idx - 1];
      var diffValue = value - prevValue;
      return this.props.orientation === 'vertical' ? {
        height: "".concat(diffValue, "%"),
        top: "".concat(prevValue, "%")
      } : {
        left: "".concat(prevValue, "%"),
        width: "".concat(diffValue, "%")
      };
    }
  }, {
    key: "getMinValue",
    value: function getMinValue(idx) {
      return this.state.values[idx - 1] ? Math.max(this.props.min, this.state.values[idx - 1]) : this.props.min;
    }
  }, {
    key: "getMaxValue",
    value: function getMaxValue(idx) {
      return this.state.values[idx + 1] ? Math.min(this.props.max, this.state.values[idx + 1]) : this.props.max;
    }
  }, {
    key: "getHandleDimensions",
    value: function getHandleDimensions(ev, sliderBox) {
      var handleNode = ev.currentTarget || null;
      if (!handleNode) return 0;
      return this.props.orientation === 'vertical' ? handleNode.clientHeight / sliderBox.height * PERCENT_FULL / 2 : handleNode.clientWidth / sliderBox.width * PERCENT_FULL / 2;
    }
  }, {
    key: "getClosestSnapPoint",
    value: function getClosestSnapPoint(value) {
      // non-null thanks to defaultProps
      if (!this.props.snapPoints.length) return value;
      return this.props.snapPoints.reduce(function (snapTo, snap) {
        return Math.abs(snapTo - value) < Math.abs(snap - value) ? snapTo : snap;
      });
    }
  }, {
    key: "getSnapPosition",
    value: function getSnapPosition(positionPercent) {
      if (!this.props.snap) return positionPercent;
      var _ref = this.props,
          max = _ref.max,
          min = _ref.min;
      var value = getValue(positionPercent, min, max);
      var snapValue = this.getClosestSnapPoint(value);
      return getPosition(snapValue, min, max);
    }
  }, {
    key: "getNextPositionForKey",
    value: function getNextPositionForKey(idx, keyCode) {
      var _stepMultiplier;

      var _this$state2 = this.state,
          handlePos = _this$state2.handlePos,
          values = _this$state2.values;
      var _ref2 = this.props,
          max = _ref2.max,
          min = _ref2.min,
          snapPoints = _ref2.snapPoints;
      var shouldSnap = this.props.snap;
      var proposedValue = values[idx];
      var proposedPercentage = handlePos[idx];
      var originalPercentage = proposedPercentage;
      var stepValue = 1;

      if (max >= 100) {
        proposedPercentage = Math.round(proposedPercentage);
      } else {
        stepValue = 100 / (max - min);
      }

      var currentIndex = null;

      if (shouldSnap) {
        currentIndex = snapPoints.indexOf(this.getClosestSnapPoint(values[idx]));
      }

      var stepMultiplier = (_stepMultiplier = {}, _defineProperty$l(_stepMultiplier, KEYS.LEFT, function (v) {
        return v * -1;
      }), _defineProperty$l(_stepMultiplier, KEYS.RIGHT, function (v) {
        return v;
      }), _defineProperty$l(_stepMultiplier, KEYS.UP, function (v) {
        return v;
      }), _defineProperty$l(_stepMultiplier, KEYS.DOWN, function (v) {
        return v * -1;
      }), _defineProperty$l(_stepMultiplier, KEYS.PAGE_DOWN, function (v) {
        return v > 1 ? -v : v * -10;
      }), _defineProperty$l(_stepMultiplier, KEYS.PAGE_UP, function (v) {
        return v > 1 ? v : v * 10;
      }), _stepMultiplier);

      if (Object.prototype.hasOwnProperty.call(stepMultiplier, keyCode)) {
        proposedPercentage += stepMultiplier[keyCode](stepValue);

        if (shouldSnap) {
          if (!currentIndex) ; else if (proposedPercentage > originalPercentage) {
            // move cursor right unless overflow
            if (currentIndex < snapPoints.length - 1) {
              proposedValue = snapPoints[currentIndex + 1];
            } // move cursor left unless there is overflow

          } else if (currentIndex > 0) {
            proposedValue = snapPoints[currentIndex - 1];
          }
        }
      } else if (keyCode === KEYS.HOME) {
        proposedPercentage = PERCENT_EMPTY;

        if (shouldSnap) {
          proposedValue = snapPoints[0];
        }
      } else if (keyCode === KEYS.END) {
        proposedPercentage = PERCENT_FULL;

        if (shouldSnap) {
          proposedValue = snapPoints[snapPoints.length - 1];
        }
      } else {
        return null;
      }

      return shouldSnap ? getPosition(proposedValue, min, max) : proposedPercentage;
    }
  }, {
    key: "getNextState",
    value: function getNextState(idx, proposedPosition) {
      var handlePos = this.state.handlePos;
      var _ref3 = this.props,
          max = _ref3.max,
          min = _ref3.min;
      var actualPosition = this.validatePosition(idx, proposedPosition);
      var nextHandlePos = handlePos.map(function (pos, index) {
        return index === idx ? actualPosition : pos;
      });
      return {
        handlePos: nextHandlePos,
        values: nextHandlePos.map(function (pos) {
          return getValue(pos, min, max);
        })
      };
    }
  }, {
    key: "getClosestHandle",
    value: function getClosestHandle(positionPercent) {
      var handlePos = this.state.handlePos;
      return handlePos.reduce(function (closestIdx, _node, idx) {
        var challenger = Math.abs(handlePos[idx] - positionPercent);
        var current = Math.abs(handlePos[closestIdx] - positionPercent);
        return challenger < current ? idx : closestIdx;
      }, 0);
    }
  }, {
    key: "setStartSlide",
    value: function setStartSlide(ev, x, y) {
      var sliderBox = this.getSliderBoundingBox();
      this.setState({
        handleDimensions: this.getHandleDimensions(ev, sliderBox),
        mousePos: {
          x: x,
          y: y
        },
        sliderBox: sliderBox,
        slidingIndex: getHandleFor(ev)
      });
    }
  }, {
    key: "startMouseSlide",
    value: function startMouseSlide(ev) {
      this.setStartSlide(ev, ev.clientX, ev.clientY);
      document.addEventListener('mousemove', this.handleMouseSlide, false);
      document.addEventListener('mouseup', this.endSlide, false);
      killEvent(ev);
    }
  }, {
    key: "startTouchSlide",
    value: function startTouchSlide(ev) {
      if (ev.changedTouches.length > 1) return;
      var touch = ev.changedTouches[0];
      this.setStartSlide(ev, touch.clientX, touch.clientY);
      document.addEventListener('touchmove', this.handleTouchSlide, false);
      document.addEventListener('touchend', this.endSlide, false);
      if (this.props.onSliderDragStart) this.props.onSliderDragStart();
      killEvent(ev);
    }
  }, {
    key: "handleMouseSlide",
    value: function handleMouseSlide(ev) {
      if (this.state.slidingIndex === null) return;
      this.handleSlide(ev.clientX, ev.clientY);
      killEvent(ev);
    }
  }, {
    key: "handleTouchSlide",
    value: function handleTouchSlide(ev) {
      if (this.state.slidingIndex === null) return;

      if (ev.changedTouches.length > 1) {
        this.endSlide();
        return;
      }

      var touch = ev.changedTouches[0];
      this.handleSlide(touch.clientX, touch.clientY);
      killEvent(ev);
    }
  }, {
    key: "handleSlide",
    value: function handleSlide(x, y) {
      var _this$state3 = this.state,
          idx = _this$state3.slidingIndex,
          sliderBox = _this$state3.sliderBox;
      var positionPercent = this.props.orientation === 'vertical' ? (y - sliderBox.top) / sliderBox.height * PERCENT_FULL : (x - sliderBox.left) / sliderBox.width * PERCENT_FULL;
      this.slideTo(idx, positionPercent);

      if (this.canMove(idx, positionPercent)) {
        // update mouse positions
        this.setState({
          mousePos: {
            x: x,
            y: y
          }
        });
        if (this.props.onSliderDragMove) this.props.onSliderDragMove();
      }
    }
  }, {
    key: "endSlide",
    value: function endSlide() {
      var _this2 = this;

      var idx = this.state.slidingIndex;
      this.setState({
        slidingIndex: null
      });
      document.removeEventListener('mouseup', this.endSlide, false);
      document.removeEventListener('touchend', this.endSlide, false);
      document.removeEventListener('touchmove', this.handleTouchSlide, false);
      document.removeEventListener('mousemove', this.handleMouseSlide, false);
      if (this.props.onSliderDragEnd) this.props.onSliderDragEnd();

      if (this.props.snap) {
        var positionPercent = this.getSnapPosition(this.state.handlePos[idx]);
        this.slideTo(idx, positionPercent, function () {
          return _this2.fireChangeEvent();
        });
      } else {
        this.fireChangeEvent();
      }
    }
  }, {
    key: "handleClick",
    value: function handleClick(ev) {
      var _this3 = this;

      if (ev.target.getAttribute('data-handle-key')) {
        return;
      } // Calculate the position of the slider on the page so we can determine
      // the position where you click in relativity.


      var sliderBox = this.getSliderBoundingBox();
      var positionDecimal = this.props.orientation === 'vertical' ? (ev.clientY - sliderBox.top) / sliderBox.height : (ev.clientX - sliderBox.left) / sliderBox.width;
      var positionPercent = positionDecimal * PERCENT_FULL;
      var handleId = this.getClosestHandle(positionPercent);
      var validPositionPercent = this.getSnapPosition(positionPercent); // Move the handle there

      this.slideTo(handleId, validPositionPercent, function () {
        return _this3.fireChangeEvent();
      });
      if (this.props.onClick) this.props.onClick();
    }
  }, {
    key: "handleKeydown",
    value: function handleKeydown(ev) {
      var _this4 = this;

      var idx = getHandleFor(ev);

      if (ev.keyCode === KEYS.ESC) {
        ev.currentTarget.blur();
        return;
      }

      var proposedPercentage = this.getNextPositionForKey(idx, ev.keyCode);
      if (proposedPercentage === null) return;

      if (this.canMove(idx, proposedPercentage)) {
        this.slideTo(idx, proposedPercentage, function () {
          return _this4.fireChangeEvent();
        });
        if (this.props.onKeyPress) this.props.onKeyPress();
      }

      killEvent(ev);
    } // Make sure the proposed position respects the bounds and
    // does not collide with other handles too much.

  }, {
    key: "validatePosition",
    value: function validatePosition(idx, proposedPosition) {
      var _this$state4 = this.state,
          handlePos = _this$state4.handlePos,
          handleDimensions = _this$state4.handleDimensions;
      return Math.max(Math.min(proposedPosition, handlePos[idx + 1] !== undefined ? handlePos[idx + 1] - handleDimensions : PERCENT_FULL // 100% is the highest value
      ), handlePos[idx - 1] !== undefined ? handlePos[idx - 1] + handleDimensions : PERCENT_EMPTY // 0% is the lowest value
      );
    }
  }, {
    key: "validateValues",
    value: function validateValues(proposedValues, props) {
      var _ref4 = props || this.props,
          max = _ref4.max,
          min = _ref4.min;

      return proposedValues.map(function (value, idx, values) {
        var realValue = Math.max(Math.min(value, max), min);

        if (values.length && realValue < values[idx - 1]) {
          return values[idx - 1];
        }

        return realValue;
      });
    }
  }, {
    key: "canMove",
    value: function canMove(idx, proposedPosition) {
      var _this$state5 = this.state,
          handlePos = _this$state5.handlePos,
          handleDimensions = _this$state5.handleDimensions;
      if (proposedPosition < PERCENT_EMPTY) return false;
      if (proposedPosition > PERCENT_FULL) return false;
      var nextHandlePosition = handlePos[idx + 1] !== undefined ? handlePos[idx + 1] - handleDimensions : Infinity;
      if (proposedPosition > nextHandlePosition) return false;
      var prevHandlePosition = handlePos[idx - 1] !== undefined ? handlePos[idx - 1] + handleDimensions : -Infinity;
      if (proposedPosition < prevHandlePosition) return false;
      return true;
    }
  }, {
    key: "fireChangeEvent",
    value: function fireChangeEvent() {
      var onChange = this.props.onChange;
      if (onChange) onChange(this.getPublicState());
    }
  }, {
    key: "slideTo",
    value: function slideTo(idx, proposedPosition, onAfterSet) {
      var _this5 = this;

      var nextState = this.getNextState(idx, proposedPosition);
      this.setState(nextState, function () {
        var onValuesUpdated = _this5.props.onValuesUpdated;
        if (onValuesUpdated) onValuesUpdated(_this5.getPublicState());
        if (onAfterSet) onAfterSet();
      });
    }
  }, {
    key: "updateNewValues",
    value: function updateNewValues(nextProps) {
      var _this6 = this;

      var slidingIndex = this.state.slidingIndex; // Don't update while the slider is sliding

      if (slidingIndex !== null) {
        return;
      }

      var max = nextProps.max,
          min = nextProps.min,
          values = nextProps.values;
      var nextValues = this.validateValues(values, nextProps);
      this.setState({
        handlePos: nextValues.map(function (value) {
          return getPosition(value, min, max);
        }),
        values: nextValues
      }, function () {
        return _this6.fireChangeEvent();
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this7 = this;

      var _ref5 = this.props,
          children = _ref5.children,
          disabled = _ref5.disabled,
          Handle = _ref5.handle,
          max = _ref5.max,
          min = _ref5.min,
          orientation = _ref5.orientation,
          PitComponent = _ref5.pitComponent,
          pitPoints = _ref5.pitPoints,
          ProgressBar = _ref5.progressBar; // all required thanks to defaultProps

      var _this$state6 = this.state,
          className = _this$state6.className,
          handlePos = _this$state6.handlePos,
          values = _this$state6.values;
      return h$1("div", {
        className: className,
        ref: this.rheostat,
        onClick: disabled ? undefined : this.handleClick,
        style: {
          position: 'relative'
        }
      }, _ref6$1, handlePos.map(function (pos, idx) {
        var handleStyle = orientation === 'vertical' ? {
          top: "".concat(pos, "%"),
          position: 'absolute'
        } : {
          left: "".concat(pos, "%"),
          position: 'absolute'
        };
        return h$1(Handle, {
          "aria-valuemax": _this7.getMaxValue(idx),
          "aria-valuemin": _this7.getMinValue(idx),
          "aria-valuenow": values[idx],
          "aria-disabled": disabled,
          "data-handle-key": idx,
          className: "rheostat-handle",
          key: "handle-".concat(idx),
          onClick: killEvent,
          onKeyDown: disabled ? undefined : _this7.handleKeydown,
          onMouseDown: disabled ? undefined : _this7.startMouseSlide,
          onTouchStart: disabled ? undefined : _this7.startTouchSlide,
          role: "slider",
          style: handleStyle,
          tabIndex: 0
        });
      }), handlePos.map(function (_node, idx, arr) {
        if (idx === 0 && arr.length > 1) {
          return null;
        }

        return h$1(ProgressBar, {
          className: "rheostat-progress",
          key: "progress-bar-".concat(idx),
          style: _this7.getProgressStyle(idx)
        });
      }), PitComponent && pitPoints.map(function (n) {
        var pos = getPosition(n, min, max);
        var pitStyle = orientation === 'vertical' ? {
          top: "".concat(pos, "%"),
          position: 'absolute'
        } : {
          left: "".concat(pos, "%"),
          position: 'absolute'
        };
        return h$1(PitComponent, {
          key: "pit-".concat(n),
          style: pitStyle
        }, n);
      }), children);
    }
  }]);

  return Rheostat;
}(d$1);

_defineProperty$l(Rheostat, "defaultProps", {
  className: '',
  children: null,
  disabled: false,
  handle: Button,
  max: PERCENT_FULL,
  min: PERCENT_EMPTY,
  onClick: null,
  onChange: null,
  onKeyPress: null,
  onSliderDragEnd: null,
  onSliderDragMove: null,
  onSliderDragStart: null,
  onValuesUpdated: null,
  orientation: 'horizontal',
  pitComponent: null,
  pitPoints: [],
  progressBar: 'div',
  snap: false,
  snapPoints: [],
  values: [PERCENT_EMPTY]
});

var Rheostat$1 = Rheostat;

function ownKeys$j(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$j(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$j(Object(source), true).forEach(function (key) { _defineProperty$k(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$j(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$k(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Pit = function Pit(_ref) {
  var style = _ref.style,
      children = _ref.children;
  // first, end & middle
  var positionValue = Math.round(parseFloat(style.left));
  var shouldDisplayValue = [0, 50, 100].includes(positionValue);
  var value = children;
  var pitValue = Math.round(parseInt(value, 10) * 100) / 100;
  return h$1("div", {
    style: _objectSpread$j(_objectSpread$j({}, style), {}, {
      marginLeft: positionValue === 100 ? '-2px' : 0
    }),
    className: cx('rheostat-marker', 'rheostat-marker-horizontal', shouldDisplayValue && 'rheostat-marker-large')
  }, shouldDisplayValue && h$1("div", {
    className: 'rheostat-value'
  }, pitValue));
};

var Pit$1 = Pit;

function _toConsumableArray$1(arr) { return _arrayWithoutHoles$1(arr) || _iterableToArray$1(arr) || _unsupportedIterableToArray$2(arr) || _nonIterableSpread$1(); }

function _nonIterableSpread$1() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray$2(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$2(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$2(o, minLen); }

function _iterableToArray$1(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles$1(arr) { if (Array.isArray(arr)) return _arrayLikeToArray$2(arr); }

function _arrayLikeToArray$2(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _extends$2() { _extends$2 = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$2.apply(this, arguments); }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty$j(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Slider = /*#__PURE__*/function (_Component) {
  _inherits(Slider, _Component);

  var _super = _createSuper(Slider);

  function Slider() {
    var _this;

    _classCallCheck(this, Slider);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty$j(_assertThisInitialized(_this), "handleChange", function (_ref) {
      var values = _ref.values;

      if (!_this.isDisabled) {
        _this.props.refine(values);
      }
    });

    _defineProperty$j(_assertThisInitialized(_this), "createHandleComponent", function (tooltips) {
      return function (props) {
        // display only two decimals after comma,
        // and apply `tooltips.format()` if any
        var roundedValue = Math.round( // have to cast as a string, as the value given to the prop is a number, but becomes a string when read
        parseFloat(props['aria-valuenow']) * 100) / 100;
        var value = _typeof(tooltips) === 'object' && tooltips.format ? tooltips.format(roundedValue) : roundedValue;
        var className = cx(props.className, props['data-handle-key'] === 0 && 'rheostat-handle-lower', props['data-handle-key'] === 1 && 'rheostat-handle-upper');
        return h$1("div", _extends$2({}, props, {
          className: className
        }), tooltips && h$1("div", {
          className: "rheostat-tooltip"
        }, value));
      };
    });

    return _this;
  }

  _createClass(Slider, [{
    key: "isDisabled",
    get: function get() {
      return this.props.min >= this.props.max;
    }
  }, {
    key: "computeDefaultPitPoints",
    value: // creates an array number where to display a pit point on the slider
    function computeDefaultPitPoints(_ref2) {
      var min = _ref2.min,
          max = _ref2.max;
      var totalLength = max - min;
      var steps = 34;
      var stepsLength = totalLength / steps;
      var pitPoints = [min].concat(_toConsumableArray$1(range({
        end: steps - 1
      }).map(function (step) {
        return min + stepsLength * (step + 1);
      })), [max]);
      return pitPoints;
    } // creates an array of values where the slider should snap to

  }, {
    key: "computeSnapPoints",
    value: function computeSnapPoints(_ref3) {
      var min = _ref3.min,
          max = _ref3.max,
          step = _ref3.step;
      if (!step) return undefined;
      return [].concat(_toConsumableArray$1(range({
        start: min,
        end: max,
        step: step
      })), [max]);
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props = this.props,
          tooltips = _this$props.tooltips,
          step = _this$props.step,
          pips = _this$props.pips,
          values = _this$props.values,
          cssClasses = _this$props.cssClasses; // @TODO: figure out why this.props needs to be non-null asserted

      var _ref4 = this.isDisabled ? {
        min: this.props.min,
        max: this.props.max + 0.001
      } : this.props,
          min = _ref4.min,
          max = _ref4.max;

      var snapPoints = this.computeSnapPoints({
        min: min,
        max: max,
        step: step
      });
      var pitPoints = pips === false ? [] : this.computeDefaultPitPoints({
        min: min,
        max: max
      });
      return h$1("div", {
        className: cx(cssClasses.root, this.isDisabled && cssClasses.disabledRoot)
      }, h$1(Rheostat$1, {
        handle: this.createHandleComponent(tooltips),
        onChange: this.handleChange,
        min: min,
        max: max,
        pitComponent: Pit$1,
        pitPoints: pitPoints,
        snap: true,
        snapPoints: snapPoints,
        values: this.isDisabled ? [min, max] : values,
        disabled: this.isDisabled
      }));
    }
  }]);

  return Slider;
}(d$1);

var Slider$1 = Slider;

function ownKeys$i(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$i(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$i(Object(source), true).forEach(function (key) { _defineProperty$i(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$i(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$i(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray$1(arr, i) { return _arrayWithHoles$1(arr) || _iterableToArrayLimit$1(arr, i) || _unsupportedIterableToArray$1(arr, i) || _nonIterableRest$1(); }

function _nonIterableRest$1() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray$1(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$1(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$1(o, minLen); }

function _arrayLikeToArray$1(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit$1(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles$1(arr) { if (Array.isArray(arr)) return arr; }
var withUsage$f = createDocumentationMessageGenerator({
  name: 'range-slider'
});
var suit$8 = component('RangeSlider');

var renderer$8 = function renderer(_ref) {
  var containerNode = _ref.containerNode,
      cssClasses = _ref.cssClasses,
      pips = _ref.pips,
      step = _ref.step,
      tooltips = _ref.tooltips;
  return function (_ref2, isFirstRendering) {
    var refine = _ref2.refine,
        range = _ref2.range,
        start = _ref2.start;

    if (isFirstRendering) {
      // There's no information at this point, let's render nothing.
      return;
    }

    var minRange = range.min,
        maxRange = range.max;

    var _start = _slicedToArray$1(start, 2),
        minStart = _start[0],
        maxStart = _start[1];

    var minFinite = minStart === -Infinity ? minRange : minStart;
    var maxFinite = maxStart === Infinity ? maxRange : maxStart; // Clamp values to the range for avoid extra rendering & refinement
    // Should probably be done on the connector side, but we need to stay
    // backward compatible so we still need to pass [-Infinity, Infinity]

    var values = [minFinite > maxRange ? maxRange : minFinite, maxFinite < minRange ? minRange : maxFinite];
    P(h$1(Slider$1, {
      cssClasses: cssClasses,
      refine: refine,
      min: minRange,
      max: maxRange,
      values: values,
      tooltips: tooltips,
      step: step,
      pips: pips
    }), containerNode);
  };
};

/**
 * The range slider is a widget which provides a user-friendly way to filter the
 * results based on a single numeric range.
 *
 * @requirements
 * The attribute passed to `attribute` must be declared as an
 * [attribute for faceting](https://www.algolia.com/doc/guides/searching/faceting/#declaring-attributes-for-faceting)
 * in your Algolia settings.
 *
 * The values inside this attribute must be JavaScript numbers (not strings).
 */
var rangeSlider = function rangeSlider(widgetParams) {
  var _ref3 = widgetParams || {},
      container = _ref3.container,
      attribute = _ref3.attribute,
      min = _ref3.min,
      max = _ref3.max,
      _ref3$cssClasses = _ref3.cssClasses,
      userCssClasses = _ref3$cssClasses === void 0 ? {} : _ref3$cssClasses,
      step = _ref3.step,
      _ref3$pips = _ref3.pips,
      pips = _ref3$pips === void 0 ? true : _ref3$pips,
      _ref3$precision = _ref3.precision,
      precision = _ref3$precision === void 0 ? 0 : _ref3$precision,
      _ref3$tooltips = _ref3.tooltips,
      tooltips = _ref3$tooltips === void 0 ? true : _ref3$tooltips;

  if (!container) {
    throw new Error(withUsage$f('The `container` option is required.'));
  }

  var containerNode = getContainerNode(container);
  var cssClasses = {
    root: cx(suit$8(), userCssClasses.root),
    disabledRoot: cx(suit$8({
      modifierName: 'disabled'
    }), userCssClasses.disabledRoot)
  };
  var specializedRenderer = renderer$8({
    containerNode: containerNode,
    step: step,
    pips: pips,
    tooltips: tooltips,
    cssClasses: cssClasses
  });
  var makeWidget = connectRange$1(specializedRenderer, function () {
    return P(null, containerNode);
  });
  return _objectSpread$i(_objectSpread$i({}, makeWidget({
    attribute: attribute,
    min: min,
    max: max,
    precision: precision
  })), {}, {
    $$type: 'ais.rangeSlider',
    $$widgetType: 'ais.rangeSlider'
  });
};

var rangeSlider$1 = rangeSlider;

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function ownKeys$h(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$h(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$h(Object(source), true).forEach(function (key) { _defineProperty$h(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$h(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$h(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
var withUsage$e = createDocumentationMessageGenerator({
  name: 'rating-menu',
  connector: true
});
var $$type$1 = 'ais.ratingMenu';
var MAX_VALUES_PER_FACET_API_LIMIT = 1000;
var STEP = 1;

var createSendEvent$1 = function createSendEvent(_ref) {
  var instantSearchInstance = _ref.instantSearchInstance,
      helper = _ref.helper,
      getRefinedStar = _ref.getRefinedStar,
      attribute = _ref.attribute;
  return function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    if (args.length === 1) {
      instantSearchInstance.sendEventToInsights(args[0]);
      return;
    }

    var eventType = args[0],
        facetValue = args[1],
        _args$ = args[2],
        eventName = _args$ === void 0 ? 'Filter Applied' : _args$;

    if (eventType !== 'click') {
      return;
    }

    var isRefined = getRefinedStar() === Number(facetValue);

    if (!isRefined) {
      instantSearchInstance.sendEventToInsights({
        insightsMethod: 'clickedFilters',
        widgetType: $$type$1,
        eventType: eventType,
        payload: {
          eventName: eventName,
          index: helper.getIndex(),
          filters: ["".concat(attribute, ">=").concat(facetValue)]
        },
        attribute: attribute
      });
    }
  };
};

/**
 * **StarRating** connector provides the logic to build a custom widget that will let
 * the user refine search results based on ratings.
 *
 * The connector provides to the rendering: `refine()` to select a value and
 * `items` that are the values that can be selected. `refine` should be used
 * with `items.value`.
 */
var connectRatingMenu = function connectRatingMenu(renderFn) {
  var unmountFn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : noop;
  checkRendering(renderFn, withUsage$e());
  return function (widgetParams) {
    var _ref2 = widgetParams || {},
        attribute = _ref2.attribute,
        _ref2$max = _ref2.max,
        max = _ref2$max === void 0 ? 5 : _ref2$max;

    var sendEvent;

    if (!attribute) {
      throw new Error(withUsage$e('The `attribute` option is required.'));
    }

    var _getRefinedStar = function getRefinedStar(state) {
      var _values$;

      var values = state.getNumericRefinements(attribute);

      if (!((_values$ = values['>=']) !== null && _values$ !== void 0 && _values$.length)) {
        return undefined;
      }

      return values['>='][0];
    };

    var getFacetsMaxDecimalPlaces = function getFacetsMaxDecimalPlaces(facetResults) {
      var maxDecimalPlaces = 0;
      facetResults.forEach(function (facetResult) {
        var _facetResult$name$spl = facetResult.name.split('.'),
            _facetResult$name$spl2 = _slicedToArray(_facetResult$name$spl, 2),
            _facetResult$name$spl3 = _facetResult$name$spl2[1],
            decimal = _facetResult$name$spl3 === void 0 ? '' : _facetResult$name$spl3;

        maxDecimalPlaces = Math.max(maxDecimalPlaces, decimal.length);
      });
      return maxDecimalPlaces;
    };

    var getFacetValuesWarningMessage = function getFacetValuesWarningMessage(_ref3) {
      var maxDecimalPlaces = _ref3.maxDecimalPlaces,
          maxFacets = _ref3.maxFacets,
          maxValuesPerFacet = _ref3.maxValuesPerFacet;
      var maxDecimalPlacesInRange = Math.max(0, Math.floor(Math.log10(MAX_VALUES_PER_FACET_API_LIMIT / max)));
      var maxFacetsInRange = Math.min(MAX_VALUES_PER_FACET_API_LIMIT, Math.pow(10, maxDecimalPlacesInRange) * max);
      var solutions = [];

      if (maxFacets > MAX_VALUES_PER_FACET_API_LIMIT) {
        solutions.push("- Update your records to lower the precision of the values in the \"".concat(attribute, "\" attribute (for example: ").concat(5.123456789.toPrecision(maxDecimalPlaces + 1), " to ").concat(5.123456789.toPrecision(maxDecimalPlacesInRange + 1), ")"));
      }

      if (maxValuesPerFacet < maxFacetsInRange) {
        solutions.push("- Increase the maximum number of facet values to ".concat(maxFacetsInRange, " using the \"configure\" widget ").concat(createDocumentationLink({
          name: 'configure'
        }), " and the \"maxValuesPerFacet\" parameter https://www.algolia.com/doc/api-reference/api-parameters/maxValuesPerFacet/"));
      }

      return "The ".concat(attribute, " attribute can have ").concat(maxFacets, " different values (0 to ").concat(max, " with a maximum of ").concat(maxDecimalPlaces, " decimals = ").concat(maxFacets, ") but you retrieved only ").concat(maxValuesPerFacet, " facet values. Therefore the number of results that match the refinements can be incorrect.\n    ").concat(solutions.length ? "To resolve this problem you can:\n".concat(solutions.join('\n')) : "");
    };

    function getRefinedState(state, facetValue) {
      var isRefined = _getRefinedStar(state) === Number(facetValue);
      var emptyState = state.resetPage().removeNumericRefinement(attribute);

      if (!isRefined) {
        return emptyState.addNumericRefinement(attribute, '<=', max).addNumericRefinement(attribute, '>=', Number(facetValue));
      }

      return emptyState;
    }

    var toggleRefinement = function toggleRefinement(helper, facetValue) {
      sendEvent('click', facetValue);
      helper.setState(getRefinedState(helper.state, facetValue)).search();
    };

    var connectorState = {
      toggleRefinementFactory: function toggleRefinementFactory(helper) {
        return toggleRefinement.bind(null, helper);
      },
      createURLFactory: function createURLFactory(_ref4) {
        var state = _ref4.state,
            createURL = _ref4.createURL;
        return function (value) {
          return createURL(getRefinedState(state, value));
        };
      }
    };
    return {
      $$type: $$type$1,
      init: function init(initOptions) {
        var instantSearchInstance = initOptions.instantSearchInstance;
        renderFn(_objectSpread$h(_objectSpread$h({}, this.getWidgetRenderState(initOptions)), {}, {
          instantSearchInstance: instantSearchInstance
        }), true);
      },
      render: function render(renderOptions) {
        var instantSearchInstance = renderOptions.instantSearchInstance;
        renderFn(_objectSpread$h(_objectSpread$h({}, this.getWidgetRenderState(renderOptions)), {}, {
          instantSearchInstance: instantSearchInstance
        }), false);
      },
      getRenderState: function getRenderState(renderState, renderOptions) {
        return _objectSpread$h(_objectSpread$h({}, renderState), {}, {
          ratingMenu: _objectSpread$h(_objectSpread$h({}, renderState.ratingMenu), {}, _defineProperty$h({}, attribute, this.getWidgetRenderState(renderOptions)))
        });
      },
      getWidgetRenderState: function getWidgetRenderState(_ref5) {
        var helper = _ref5.helper,
            results = _ref5.results,
            state = _ref5.state,
            instantSearchInstance = _ref5.instantSearchInstance,
            createURL = _ref5.createURL;
        var facetValues = [];

        if (!sendEvent) {
          sendEvent = createSendEvent$1({
            instantSearchInstance: instantSearchInstance,
            helper: helper,
            getRefinedStar: function getRefinedStar() {
              return _getRefinedStar(helper.state);
            },
            attribute: attribute
          });
        }

        var refinementIsApplied = false;
        var totalCount = 0;
        var facetResults = results === null || results === void 0 ? void 0 : results.getFacetValues(attribute, {});

        if (results && facetResults) {
          var maxValuesPerFacet = facetResults.length;
          var maxDecimalPlaces = getFacetsMaxDecimalPlaces(facetResults);
          var maxFacets = Math.pow(10, maxDecimalPlaces) * max;
          _warning(maxFacets <= maxValuesPerFacet || Boolean(results.__isArtificial), getFacetValuesWarningMessage({
            maxDecimalPlaces: maxDecimalPlaces,
            maxFacets: maxFacets,
            maxValuesPerFacet: maxValuesPerFacet
          })) ;

          var refinedStar = _getRefinedStar(state);

          var _loop = function _loop(star) {
            var isRefined = refinedStar === star;
            refinementIsApplied = refinementIsApplied || isRefined;
            var count = facetResults.filter(function (f) {
              return Number(f.name) >= star && Number(f.name) <= max;
            }).map(function (f) {
              return f.count;
            }).reduce(function (sum, current) {
              return sum + current;
            }, 0);
            totalCount += count;

            if (refinedStar && !isRefined && count === 0) {
              // skip count==0 when at least 1 refinement is enabled
              // eslint-disable-next-line no-continue
              return "continue";
            }

            var stars = _toConsumableArray(new Array(Math.floor(max / STEP))).map(function (_v, i) {
              return i * STEP < star;
            });

            facetValues.push({
              stars: stars,
              name: String(star),
              label: String(star),
              value: String(star),
              count: count,
              isRefined: isRefined
            });
          };

          for (var star = STEP; star < max; star += STEP) {
            var _ret = _loop(star);

            if (_ret === "continue") continue;
          }
        }

        facetValues = facetValues.reverse();
        var hasNoResults = results ? results.nbHits === 0 : true;
        return {
          items: facetValues,
          hasNoResults: hasNoResults,
          canRefine: (!hasNoResults || refinementIsApplied) && totalCount > 0,
          refine: connectorState.toggleRefinementFactory(helper),
          sendEvent: sendEvent,
          createURL: connectorState.createURLFactory({
            state: state,
            createURL: createURL
          }),
          widgetParams: widgetParams
        };
      },
      dispose: function dispose(_ref6) {
        var state = _ref6.state;
        unmountFn();
        return state.removeNumericRefinement(attribute);
      },
      getWidgetUiState: function getWidgetUiState(uiState, _ref7) {
        var searchParameters = _ref7.searchParameters;

        var value = _getRefinedStar(searchParameters);

        if (typeof value !== 'number') {
          return uiState;
        }

        return _objectSpread$h(_objectSpread$h({}, uiState), {}, {
          ratingMenu: _objectSpread$h(_objectSpread$h({}, uiState.ratingMenu), {}, _defineProperty$h({}, attribute, value))
        });
      },
      getWidgetSearchParameters: function getWidgetSearchParameters(searchParameters, _ref8) {
        var uiState = _ref8.uiState;
        var value = uiState.ratingMenu && uiState.ratingMenu[attribute];
        var withoutRefinements = searchParameters.clearRefinements(attribute);
        var withDisjunctiveFacet = withoutRefinements.addDisjunctiveFacet(attribute);

        if (!value) {
          return withDisjunctiveFacet.setQueryParameters({
            numericRefinements: _objectSpread$h(_objectSpread$h({}, withDisjunctiveFacet.numericRefinements), {}, _defineProperty$h({}, attribute, {}))
          });
        }

        return withDisjunctiveFacet.addNumericRefinement(attribute, '<=', max).addNumericRefinement(attribute, '>=', value);
      }
    };
  };
};

var connectRatingMenu$1 = connectRatingMenu;

function ItemWrapper(_ref) {
  var children = _ref.children,
      count = _ref.count,
      value = _ref.value,
      url = _ref.url,
      cssClasses = _ref.cssClasses;

  if (count) {
    return h$1("a", {
      className: cx(cssClasses.link),
      "aria-label": "".concat(value, " & up"),
      href: url
    }, children);
  }

  return h$1("div", {
    className: cx(cssClasses.link),
    "aria-label": "".concat(value, " & up"),
    disabled: true
  }, children);
}

var defaultTemplates$a = {
  item: function item(_ref2) {
    var count = _ref2.count,
        value = _ref2.value,
        url = _ref2.url,
        stars = _ref2.stars,
        cssClasses = _ref2.cssClasses;
    return h$1(ItemWrapper, {
      count: count,
      value: value,
      url: url,
      cssClasses: cssClasses
    }, stars.map(function (isFull, index) {
      return h$1("svg", {
        key: index,
        className: cx(cssClasses.starIcon, isFull ? cssClasses.fullStarIcon : cssClasses.emptyStarIcon),
        "aria-hidden": "true",
        width: "24",
        height: "24"
      }, h$1("use", {
        xlinkHref: isFull ? '#ais-RatingMenu-starSymbol' : '#ais-RatingMenu-starEmptySymbol'
      }));
    }), h$1("span", {
      className: cx(cssClasses.label)
    }, "& Up"), count && h$1("span", {
      className: cx(cssClasses.count)
    }, formatNumber(count)));
  }
};
var defaultTemplates$b = defaultTemplates$a;

function ownKeys$g(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$g(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$g(Object(source), true).forEach(function (key) { _defineProperty$g(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$g(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$g(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var withUsage$d = createDocumentationMessageGenerator({
  name: 'rating-menu'
});
var suit$7 = component('RatingMenu');

var _ref3$1 = h$1("path", {
  d: "M12 .288l2.833 8.718h9.167l-7.417 5.389 2.833 8.718-7.416-5.388-7.417 5.388 2.833-8.718-7.416-5.389h9.167z"
});

var _ref4$2 = h$1("path", {
  d: "M12 6.76l1.379 4.246h4.465l-3.612 2.625 1.379 4.246-3.611-2.625-3.612 2.625 1.379-4.246-3.612-2.625h4.465l1.38-4.246zm0-6.472l-2.833 8.718h-9.167l7.416 5.389-2.833 8.718 7.417-5.388 7.416 5.388-2.833-8.718 7.417-5.389h-9.167l-2.833-8.718z"
});

var renderer$7 = function renderer(_ref) {
  var containerNode = _ref.containerNode,
      cssClasses = _ref.cssClasses,
      templates = _ref.templates,
      renderState = _ref.renderState;
  return function (_ref2, isFirstRendering) {
    var refine = _ref2.refine,
        items = _ref2.items,
        createURL = _ref2.createURL,
        instantSearchInstance = _ref2.instantSearchInstance;

    if (isFirstRendering) {
      renderState.templateProps = prepareTemplateProps({
        defaultTemplates: defaultTemplates$b,
        templatesConfig: instantSearchInstance.templatesConfig,
        templates: templates
      });
      return;
    }

    P(h$1(RefinementList$1, {
      createURL: createURL,
      cssClasses: cssClasses,
      facetValues: items,
      templateProps: renderState.templateProps,
      toggleRefinement: refine
    }, h$1("svg", {
      style: "display:none;"
    }, h$1("symbol", {
      id: suit$7({
        descendantName: 'starSymbol'
      }),
      viewBox: "0 0 24 24"
    }, _ref3$1), h$1("symbol", {
      id: suit$7({
        descendantName: 'starEmptySymbol'
      }),
      viewBox: "0 0 24 24"
    }, _ref4$2))), containerNode);
  };
};
/**
 * Rating menu is used for displaying grade like filters. The values are normalized within boundaries.
 *
 * The maximum value can be set (with `max`), the minimum is always 0.
 *
 * @requirements
 * The attribute passed to `attribute` must be declared as an
 * [attribute for faceting](https://www.algolia.com/doc/guides/searching/faceting/#declaring-attributes-for-faceting)
 * in your Algolia settings.
 *
 * The values inside this attribute must be JavaScript numbers (not strings).
 *
 * @type {WidgetFactory}
 * @devNovel RatingMenu
 * @category filter
 * @param {RatingMenuWidgetParams} widgetParams RatingMenu widget options.
 * @return {Widget} A new RatingMenu widget instance.
 * @example
 * search.addWidgets([
 *   instantsearch.widgets.ratingMenu({
 *     container: '#stars',
 *     attribute: 'rating',
 *     max: 5,
 *   })
 * ]);
 */


var ratingMenu = function ratingMenu(widgetParams) {
  var _ref5 = widgetParams || {},
      container = _ref5.container,
      attribute = _ref5.attribute,
      _ref5$max = _ref5.max,
      max = _ref5$max === void 0 ? 5 : _ref5$max,
      _ref5$cssClasses = _ref5.cssClasses,
      userCssClasses = _ref5$cssClasses === void 0 ? {} : _ref5$cssClasses,
      _ref5$templates = _ref5.templates,
      templates = _ref5$templates === void 0 ? {} : _ref5$templates;

  if (!container) {
    throw new Error(withUsage$d('The `container` option is required.'));
  }

  var containerNode = getContainerNode(container);
  var cssClasses = {
    root: cx(suit$7(), userCssClasses.root),
    noRefinementRoot: cx(suit$7({
      modifierName: 'noRefinement'
    }), userCssClasses.noRefinementRoot),
    list: cx(suit$7({
      descendantName: 'list'
    }), userCssClasses.list),
    item: cx(suit$7({
      descendantName: 'item'
    }), userCssClasses.item),
    selectedItem: cx(suit$7({
      descendantName: 'item',
      modifierName: 'selected'
    }), userCssClasses.selectedItem),
    disabledItem: cx(suit$7({
      descendantName: 'item',
      modifierName: 'disabled'
    }), userCssClasses.disabledItem),
    link: cx(suit$7({
      descendantName: 'link'
    }), userCssClasses.link),
    starIcon: cx(suit$7({
      descendantName: 'starIcon'
    }), userCssClasses.starIcon),
    fullStarIcon: cx(suit$7({
      descendantName: 'starIcon',
      modifierName: 'full'
    }), userCssClasses.fullStarIcon),
    emptyStarIcon: cx(suit$7({
      descendantName: 'starIcon',
      modifierName: 'empty'
    }), userCssClasses.emptyStarIcon),
    label: cx(suit$7({
      descendantName: 'label'
    }), userCssClasses.label),
    count: cx(suit$7({
      descendantName: 'count'
    }), userCssClasses.count)
  };
  var specializedRenderer = renderer$7({
    containerNode: containerNode,
    cssClasses: cssClasses,
    renderState: {},
    templates: templates
  });
  var makeWidget = connectRatingMenu$1(specializedRenderer, function () {
    return P(null, containerNode);
  });
  return _objectSpread$g(_objectSpread$g({}, makeWidget({
    attribute: attribute,
    max: max
  })), {}, {
    $$widgetType: 'ais.ratingMenu'
  });
};

var ratingMenu$1 = ratingMenu;

function ownKeys$f(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$f(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$f(Object(source), true).forEach(function (key) { _defineProperty$f(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$f(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$f(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties$1(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose$1(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose$1(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
var withUsage$c = createDocumentationMessageGenerator({
  name: 'refinement-list',
  connector: true
});
var DEFAULT_SORT = ['isRefined', 'count:desc', 'name:asc'];

/**
 * **RefinementList** connector provides the logic to build a custom widget that
 * will let the user filter the results based on the values of a specific facet.
 *
 * **Requirement:** the attribute passed as `attribute` must be present in
 * attributesForFaceting of the searched index.
 *
 * This connector provides:
 * - a `refine()` function to select an item.
 * - a `toggleShowMore()` function to display more or less items
 * - a `searchForItems()` function to search within the items.
 */
var connectRefinementList = function connectRefinementList(renderFn) {
  var unmountFn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : noop;
  checkRendering(renderFn, withUsage$c());
  return function (widgetParams) {
    var _ref = widgetParams || {},
        attribute = _ref.attribute,
        _ref$operator = _ref.operator,
        operator = _ref$operator === void 0 ? 'or' : _ref$operator,
        _ref$limit = _ref.limit,
        limit = _ref$limit === void 0 ? 10 : _ref$limit,
        _ref$showMore = _ref.showMore,
        showMore = _ref$showMore === void 0 ? false : _ref$showMore,
        _ref$showMoreLimit = _ref.showMoreLimit,
        showMoreLimit = _ref$showMoreLimit === void 0 ? 20 : _ref$showMoreLimit,
        _ref$sortBy = _ref.sortBy,
        sortBy = _ref$sortBy === void 0 ? DEFAULT_SORT : _ref$sortBy,
        _ref$escapeFacetValue = _ref.escapeFacetValues,
        escapeFacetValues = _ref$escapeFacetValue === void 0 ? true : _ref$escapeFacetValue,
        _ref$transformItems = _ref.transformItems,
        transformItems = _ref$transformItems === void 0 ? function (items) {
      return items;
    } : _ref$transformItems;

    if (!attribute) {
      throw new Error(withUsage$c('The `attribute` option is required.'));
    }

    if (!/^(and|or)$/.test(operator)) {
      throw new Error(withUsage$c("The `operator` must one of: `\"and\"`, `\"or\"` (got \"".concat(operator, "\").")));
    }

    if (showMore === true && showMoreLimit <= limit) {
      throw new Error(withUsage$c('`showMoreLimit` should be greater than `limit`.'));
    }

    var formatItems = function formatItems(_ref2) {
      var label = _ref2.name,
          value = _ref2.escapedValue,
          item = _objectWithoutProperties$1(_ref2, ["name", "escapedValue"]);

      return _objectSpread$f(_objectSpread$f({}, item), {}, {
        value: value,
        label: label,
        highlighted: label
      });
    };

    var lastResultsFromMainSearch;
    var lastItemsFromMainSearch = [];
    var hasExhaustiveItems = true;
    var triggerRefine;
    var sendEvent;
    var isShowingMore = false; // Provide the same function to the `renderFn` so that way the user
    // has to only bind it once when `isFirstRendering` for instance

    var toggleShowMore = function toggleShowMore() {};

    function cachedToggleShowMore() {
      toggleShowMore();
    }

    function createToggleShowMore(renderOptions, widget) {
      return function () {
        isShowingMore = !isShowingMore;
        widget.render(renderOptions);
      };
    }

    function getLimit() {
      return isShowingMore ? showMoreLimit : limit;
    }

    var searchForFacetValues = function searchForFacetValues() {
      return function () {};
    };

    var createSearchForFacetValues = function createSearchForFacetValues(helper, widget) {
      return function (renderOptions) {
        return function (query) {
          var instantSearchInstance = renderOptions.instantSearchInstance,
              searchResults = renderOptions.results;

          if (query === '' && lastItemsFromMainSearch) {
            // render with previous data from the helper.
            renderFn(_objectSpread$f(_objectSpread$f({}, widget.getWidgetRenderState(_objectSpread$f(_objectSpread$f({}, renderOptions), {}, {
              results: lastResultsFromMainSearch
            }))), {}, {
              instantSearchInstance: instantSearchInstance
            }), false);
          } else {
            var tags = {
              highlightPreTag: escapeFacetValues ? TAG_PLACEHOLDER.highlightPreTag : TAG_REPLACEMENT.highlightPreTag,
              highlightPostTag: escapeFacetValues ? TAG_PLACEHOLDER.highlightPostTag : TAG_REPLACEMENT.highlightPostTag
            };
            helper.searchForFacetValues(attribute, query, // We cap the `maxFacetHits` value to 100 because the Algolia API
            // doesn't support a greater number.
            // See https://www.algolia.com/doc/api-reference/api-parameters/maxFacetHits/
            Math.min(getLimit(), 100), tags).then(function (results) {
              var facetValues = escapeFacetValues ? escapeFacets(results.facetHits) : results.facetHits;
              var normalizedFacetValues = transformItems(facetValues.map(function (_ref3) {
                var escapedValue = _ref3.escapedValue,
                    value = _ref3.value,
                    item = _objectWithoutProperties$1(_ref3, ["escapedValue", "value"]);

                return _objectSpread$f(_objectSpread$f({}, item), {}, {
                  value: escapedValue,
                  label: value
                });
              }), {
                results: searchResults
              });
              renderFn(_objectSpread$f(_objectSpread$f({}, widget.getWidgetRenderState(_objectSpread$f(_objectSpread$f({}, renderOptions), {}, {
                results: lastResultsFromMainSearch
              }))), {}, {
                items: normalizedFacetValues,
                canToggleShowMore: false,
                canRefine: true,
                isFromSearch: true,
                instantSearchInstance: instantSearchInstance
              }), false);
            });
          }
        };
      };
    };

    return {
      $$type: 'ais.refinementList',
      init: function init(initOptions) {
        renderFn(_objectSpread$f(_objectSpread$f({}, this.getWidgetRenderState(initOptions)), {}, {
          instantSearchInstance: initOptions.instantSearchInstance
        }), true);
      },
      render: function render(renderOptions) {
        renderFn(_objectSpread$f(_objectSpread$f({}, this.getWidgetRenderState(renderOptions)), {}, {
          instantSearchInstance: renderOptions.instantSearchInstance
        }), false);
      },
      getRenderState: function getRenderState(renderState, renderOptions) {
        return _objectSpread$f(_objectSpread$f({}, renderState), {}, {
          refinementList: _objectSpread$f(_objectSpread$f({}, renderState.refinementList), {}, _defineProperty$f({}, attribute, this.getWidgetRenderState(renderOptions)))
        });
      },
      getWidgetRenderState: function getWidgetRenderState(renderOptions) {
        var results = renderOptions.results,
            state = renderOptions.state,
            _createURL = renderOptions.createURL,
            instantSearchInstance = renderOptions.instantSearchInstance,
            helper = renderOptions.helper;
        var items = [];
        var facetValues = [];

        if (!sendEvent || !triggerRefine || !searchForFacetValues) {
          sendEvent = createSendEventForFacet({
            instantSearchInstance: instantSearchInstance,
            helper: helper,
            attribute: attribute,
            widgetType: this.$$type
          });

          triggerRefine = function triggerRefine(facetValue) {
            sendEvent('click', facetValue);
            helper.toggleFacetRefinement(attribute, facetValue).search();
          };

          searchForFacetValues = createSearchForFacetValues(helper, this);
        }

        if (results) {
          var values = results.getFacetValues(attribute, {
            sortBy: sortBy,
            facetOrdering: sortBy === DEFAULT_SORT
          });
          facetValues = values && Array.isArray(values) ? values : [];
          items = transformItems(facetValues.slice(0, getLimit()).map(formatItems), {
            results: results
          });
          var maxValuesPerFacetConfig = state.maxValuesPerFacet;
          var currentLimit = getLimit(); // If the limit is the max number of facet retrieved it is impossible to know
          // if the facets are exhaustive. The only moment we are sure it is exhaustive
          // is when it is strictly under the number requested unless we know that another
          // widget has requested more values (maxValuesPerFacet > getLimit()).
          // Because this is used for making the search of facets unable or not, it is important
          // to be conservative here.

          hasExhaustiveItems = maxValuesPerFacetConfig > currentLimit ? facetValues.length <= currentLimit : facetValues.length < currentLimit;
          lastResultsFromMainSearch = results;
          lastItemsFromMainSearch = items;

          if (renderOptions.results) {
            toggleShowMore = createToggleShowMore(renderOptions, this);
          }
        } // Do not mistake searchForFacetValues and searchFacetValues which is the actual search
        // function


        var searchFacetValues = searchForFacetValues && searchForFacetValues(renderOptions);
        var canShowLess = isShowingMore && lastItemsFromMainSearch.length > limit;
        var canShowMore = showMore && !hasExhaustiveItems;
        var canToggleShowMore = canShowLess || canShowMore;
        return {
          createURL: function createURL(facetValue) {
            return _createURL(state.resetPage().toggleFacetRefinement(attribute, facetValue));
          },
          items: items,
          refine: triggerRefine,
          searchForItems: searchFacetValues,
          isFromSearch: false,
          canRefine: items.length > 0,
          widgetParams: widgetParams,
          isShowingMore: isShowingMore,
          canToggleShowMore: canToggleShowMore,
          toggleShowMore: cachedToggleShowMore,
          sendEvent: sendEvent,
          hasExhaustiveItems: hasExhaustiveItems
        };
      },
      dispose: function dispose(_ref4) {
        var state = _ref4.state;
        unmountFn();
        var withoutMaxValuesPerFacet = state.setQueryParameter('maxValuesPerFacet', undefined);

        if (operator === 'and') {
          return withoutMaxValuesPerFacet.removeFacet(attribute);
        }

        return withoutMaxValuesPerFacet.removeDisjunctiveFacet(attribute);
      },
      getWidgetUiState: function getWidgetUiState(uiState, _ref5) {
        var searchParameters = _ref5.searchParameters;
        var values = operator === 'or' ? searchParameters.getDisjunctiveRefinements(attribute) : searchParameters.getConjunctiveRefinements(attribute);

        if (!values.length) {
          return uiState;
        }

        return _objectSpread$f(_objectSpread$f({}, uiState), {}, {
          refinementList: _objectSpread$f(_objectSpread$f({}, uiState.refinementList), {}, _defineProperty$f({}, attribute, values))
        });
      },
      getWidgetSearchParameters: function getWidgetSearchParameters(searchParameters, _ref6) {
        var uiState = _ref6.uiState;
        var isDisjunctive = operator === 'or';
        var values = uiState.refinementList && uiState.refinementList[attribute];
        var withoutRefinements = searchParameters.clearRefinements(attribute);
        var withFacetConfiguration = isDisjunctive ? withoutRefinements.addDisjunctiveFacet(attribute) : withoutRefinements.addFacet(attribute);
        var currentMaxValuesPerFacet = withFacetConfiguration.maxValuesPerFacet || 0;
        var nextMaxValuesPerFacet = Math.max(currentMaxValuesPerFacet, showMore ? showMoreLimit : limit);
        var withMaxValuesPerFacet = withFacetConfiguration.setQueryParameter('maxValuesPerFacet', nextMaxValuesPerFacet);

        if (!values) {
          var key = isDisjunctive ? 'disjunctiveFacetsRefinements' : 'facetsRefinements';
          return withMaxValuesPerFacet.setQueryParameters(_defineProperty$f({}, key, _objectSpread$f(_objectSpread$f({}, withMaxValuesPerFacet[key]), {}, _defineProperty$f({}, attribute, []))));
        }

        return values.reduce(function (parameters, value) {
          return isDisjunctive ? parameters.addDisjunctiveFacetRefinement(attribute, value) : parameters.addFacetRefinement(attribute, value);
        }, withMaxValuesPerFacet);
      }
    };
  };
};

var connectRefinementList$1 = connectRefinementList;

var _ref2$1 = h$1("path", {
  d: "M8.114 10L.944 2.83 0 1.885 1.886 0l.943.943L10 8.113l7.17-7.17.944-.943L20 1.886l-.943.943-7.17 7.17 7.17 7.17.943.944L18.114 20l-.943-.943-7.17-7.17-7.17 7.17-.944.943L0 18.114l.943-.943L8.113 10z"
});

var _ref4$1 = h$1("path", {
  d: "M26.804 29.01c-2.832 2.34-6.465 3.746-10.426 3.746C7.333 32.756 0 25.424 0 16.378 0 7.333 7.333 0 16.378 0c9.046 0 16.378 7.333 16.378 16.378 0 3.96-1.406 7.594-3.746 10.426l10.534 10.534c.607.607.61 1.59-.004 2.202-.61.61-1.597.61-2.202.004L26.804 29.01zm-10.426.627c7.323 0 13.26-5.936 13.26-13.26 0-7.32-5.937-13.257-13.26-13.257C9.056 3.12 3.12 9.056 3.12 16.378c0 7.323 5.936 13.26 13.258 13.26z"
});

var _ref6 = h$1("g", {
  fill: "none",
  fillRule: "evenodd"
}, h$1("g", {
  transform: "translate(1 1)",
  strokeWidth: "2"
}, h$1("circle", {
  strokeOpacity: ".5",
  cx: "18",
  cy: "18",
  r: "18"
}), h$1("path", {
  d: "M36 18c0-9.94-8.06-18-18-18"
}, h$1("animateTransform", {
  attributeName: "transform",
  type: "rotate",
  from: "0 18 18",
  to: "360 18 18",
  dur: "1s",
  repeatCount: "indefinite"
}))));

var defaultTemplate = {
  reset: function reset(_ref) {
    var cssClasses = _ref.cssClasses;
    return h$1("svg", {
      className: cssClasses.resetIcon,
      viewBox: "0 0 20 20",
      width: "10",
      height: "10"
    }, _ref2$1);
  },
  submit: function submit(_ref3) {
    var cssClasses = _ref3.cssClasses;
    return h$1("svg", {
      className: cssClasses.submitIcon,
      width: "10",
      height: "10",
      viewBox: "0 0 40 40"
    }, _ref4$1);
  },
  loadingIndicator: function loadingIndicator(_ref5) {
    var cssClasses = _ref5.cssClasses;
    return h$1("svg", {
      className: cssClasses.loadingIcon,
      width: "16",
      height: "16",
      viewBox: "0 0 38 38",
      stroke: "#444"
    }, _ref6);
  }
};
var defaultTemplates$9 = defaultTemplate;

var defaultTemplates$7 = {
  item: function item(_ref) {
    var cssClasses = _ref.cssClasses,
        count = _ref.count,
        value = _ref.value,
        highlighted = _ref.highlighted,
        isRefined = _ref.isRefined,
        isFromSearch = _ref.isFromSearch;
    return h$1("label", {
      className: cx(cssClasses.label)
    }, h$1("input", {
      type: "checkbox",
      className: cx(cssClasses.checkbox),
      value: value,
      defaultChecked: isRefined
    }), h$1("span", {
      className: cx(cssClasses.labelText),
      dangerouslySetInnerHTML: isFromSearch ? {
        __html: highlighted
      } : undefined
    }, !isFromSearch && highlighted), h$1("span", {
      className: cx(cssClasses.count)
    }, formatNumber(count)));
  },
  showMoreText: function showMoreText(_ref2) {
    var isShowingMore = _ref2.isShowingMore;
    return isShowingMore ? 'Show less' : 'Show more';
  },
  searchableNoResults: function searchableNoResults() {
    return 'No results';
  }
};
var defaultTemplates$8 = defaultTemplates$7;

function ownKeys$e(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$e(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$e(Object(source), true).forEach(function (key) { _defineProperty$e(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$e(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$e(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var withUsage$b = createDocumentationMessageGenerator({
  name: 'refinement-list'
});
var suit$6 = component('RefinementList');
var searchBoxSuit = component('SearchBox');

var renderer$6 = function renderer(_ref) {
  var containerNode = _ref.containerNode,
      cssClasses = _ref.cssClasses,
      templates = _ref.templates,
      searchBoxTemplates = _ref.searchBoxTemplates,
      renderState = _ref.renderState,
      showMore = _ref.showMore,
      searchable = _ref.searchable,
      searchablePlaceholder = _ref.searchablePlaceholder,
      searchableIsAlwaysActive = _ref.searchableIsAlwaysActive;
  return function (_ref2, isFirstRendering) {
    var refine = _ref2.refine,
        items = _ref2.items,
        createURL = _ref2.createURL,
        searchForItems = _ref2.searchForItems,
        isFromSearch = _ref2.isFromSearch,
        instantSearchInstance = _ref2.instantSearchInstance,
        toggleShowMore = _ref2.toggleShowMore,
        isShowingMore = _ref2.isShowingMore,
        hasExhaustiveItems = _ref2.hasExhaustiveItems,
        canToggleShowMore = _ref2.canToggleShowMore;

    if (isFirstRendering) {
      renderState.templateProps = prepareTemplateProps({
        defaultTemplates: defaultTemplates$8,
        templatesConfig: instantSearchInstance.templatesConfig,
        templates: templates
      });
      renderState.searchBoxTemplateProps = prepareTemplateProps({
        defaultTemplates: defaultTemplates$9,
        templatesConfig: instantSearchInstance.templatesConfig,
        templates: searchBoxTemplates
      });
      return;
    }

    P(h$1(RefinementList$1, {
      createURL: createURL,
      cssClasses: cssClasses,
      facetValues: items,
      templateProps: renderState.templateProps,
      searchBoxTemplateProps: renderState.searchBoxTemplateProps,
      toggleRefinement: refine,
      searchFacetValues: searchable ? searchForItems : undefined,
      searchPlaceholder: searchablePlaceholder,
      searchIsAlwaysActive: searchableIsAlwaysActive,
      isFromSearch: isFromSearch,
      showMore: showMore && !isFromSearch && items.length > 0,
      toggleShowMore: toggleShowMore,
      isShowingMore: isShowingMore,
      hasExhaustiveItems: hasExhaustiveItems,
      canToggleShowMore: canToggleShowMore
    }), containerNode);
  };
};

/**
 * The refinement list widget is one of the most common widget that you can find
 * in a search UI. With this widget, the user can filter the dataset based on facets.
 *
 * The refinement list displays only the most relevant facets for the current search
 * context. The sort option only affects the facet that are returned by the engine,
 * not which facets are returned.
 *
 * This widget also implements search for facet values, which is a mini search inside the
 * values of the facets. This makes easy to deal with uncommon facet values.
 *
 * @requirements
 *
 * The attribute passed to `attribute` must be declared as an
 * [attribute for faceting](https://www.algolia.com/doc/guides/searching/faceting/#declaring-attributes-for-faceting)
 * in your Algolia settings.
 *
 * If you also want to use search for facet values on this attribute, you need to make it searchable using the [dashboard](https://www.algolia.com/explorer/display/) or using the [API](https://www.algolia.com/doc/guides/searching/faceting/#search-for-facet-values).
 */
var refinementList = function refinementList(widgetParams) {
  var _ref3 = widgetParams || {},
      container = _ref3.container,
      attribute = _ref3.attribute,
      operator = _ref3.operator,
      sortBy = _ref3.sortBy,
      limit = _ref3.limit,
      showMore = _ref3.showMore,
      showMoreLimit = _ref3.showMoreLimit,
      _ref3$searchable = _ref3.searchable,
      searchable = _ref3$searchable === void 0 ? false : _ref3$searchable,
      _ref3$searchablePlace = _ref3.searchablePlaceholder,
      searchablePlaceholder = _ref3$searchablePlace === void 0 ? 'Search...' : _ref3$searchablePlace,
      _ref3$searchableEscap = _ref3.searchableEscapeFacetValues,
      searchableEscapeFacetValues = _ref3$searchableEscap === void 0 ? true : _ref3$searchableEscap,
      _ref3$searchableIsAlw = _ref3.searchableIsAlwaysActive,
      searchableIsAlwaysActive = _ref3$searchableIsAlw === void 0 ? true : _ref3$searchableIsAlw,
      _ref3$cssClasses = _ref3.cssClasses,
      userCssClasses = _ref3$cssClasses === void 0 ? {} : _ref3$cssClasses,
      _ref3$templates = _ref3.templates,
      templates = _ref3$templates === void 0 ? {} : _ref3$templates,
      transformItems = _ref3.transformItems;

  if (!container) {
    throw new Error(withUsage$b('The `container` option is required.'));
  }

  var escapeFacetValues = searchable ? Boolean(searchableEscapeFacetValues) : false;
  var containerNode = getContainerNode(container);
  var cssClasses = {
    root: cx(suit$6(), userCssClasses.root),
    noRefinementRoot: cx(suit$6({
      modifierName: 'noRefinement'
    }), userCssClasses.noRefinementRoot),
    list: cx(suit$6({
      descendantName: 'list'
    }), userCssClasses.list),
    item: cx(suit$6({
      descendantName: 'item'
    }), userCssClasses.item),
    selectedItem: cx(suit$6({
      descendantName: 'item',
      modifierName: 'selected'
    }), userCssClasses.selectedItem),
    searchBox: cx(suit$6({
      descendantName: 'searchBox'
    }), userCssClasses.searchBox),
    label: cx(suit$6({
      descendantName: 'label'
    }), userCssClasses.label),
    checkbox: cx(suit$6({
      descendantName: 'checkbox'
    }), userCssClasses.checkbox),
    labelText: cx(suit$6({
      descendantName: 'labelText'
    }), userCssClasses.labelText),
    count: cx(suit$6({
      descendantName: 'count'
    }), userCssClasses.count),
    noResults: cx(suit$6({
      descendantName: 'noResults'
    }), userCssClasses.noResults),
    showMore: cx(suit$6({
      descendantName: 'showMore'
    }), userCssClasses.showMore),
    disabledShowMore: cx(suit$6({
      descendantName: 'showMore',
      modifierName: 'disabled'
    }), userCssClasses.disabledShowMore),
    searchable: {
      root: cx(searchBoxSuit(), userCssClasses.searchableRoot),
      form: cx(searchBoxSuit({
        descendantName: 'form'
      }), userCssClasses.searchableForm),
      input: cx(searchBoxSuit({
        descendantName: 'input'
      }), userCssClasses.searchableInput),
      submit: cx(searchBoxSuit({
        descendantName: 'submit'
      }), userCssClasses.searchableSubmit),
      submitIcon: cx(searchBoxSuit({
        descendantName: 'submitIcon'
      }), userCssClasses.searchableSubmitIcon),
      reset: cx(searchBoxSuit({
        descendantName: 'reset'
      }), userCssClasses.searchableReset),
      resetIcon: cx(searchBoxSuit({
        descendantName: 'resetIcon'
      }), userCssClasses.searchableResetIcon),
      loadingIndicator: cx(searchBoxSuit({
        descendantName: 'loadingIndicator'
      }), userCssClasses.searchableLoadingIndicator),
      loadingIcon: cx(searchBoxSuit({
        descendantName: 'loadingIcon'
      }), userCssClasses.searchableLoadingIcon)
    }
  };
  var specializedRenderer = renderer$6({
    containerNode: containerNode,
    cssClasses: cssClasses,
    templates: templates,
    searchBoxTemplates: {
      submit: templates.searchableSubmit,
      reset: templates.searchableReset,
      loadingIndicator: templates.searchableLoadingIndicator
    },
    renderState: {},
    searchable: searchable,
    searchablePlaceholder: searchablePlaceholder,
    searchableIsAlwaysActive: searchableIsAlwaysActive,
    showMore: showMore
  });
  var makeWidget = connectRefinementList$1(specializedRenderer, function () {
    return P(null, containerNode);
  });
  return _objectSpread$e(_objectSpread$e({}, makeWidget({
    attribute: attribute,
    operator: operator,
    limit: limit,
    showMore: showMore,
    showMoreLimit: showMoreLimit,
    sortBy: sortBy,
    escapeFacetValues: escapeFacetValues,
    transformItems: transformItems
  })), {}, {
    $$widgetType: 'ais.refinementList'
  });
};

var refinementList$1 = refinementList;

function ownKeys$d(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$d(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$d(Object(source), true).forEach(function (key) { _defineProperty$d(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$d(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$d(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var connectRelevantSort = function connectRelevantSort() {
  var renderFn = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : noop;
  var unmountFn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : noop;
  return function (widgetParams) {
    var connectorState = {};
    return {
      $$type: 'ais.relevantSort',
      init: function init(initOptions) {
        var instantSearchInstance = initOptions.instantSearchInstance;
        renderFn(_objectSpread$d(_objectSpread$d({}, this.getWidgetRenderState(initOptions)), {}, {
          instantSearchInstance: instantSearchInstance
        }), true);
      },
      render: function render(renderOptions) {
        var instantSearchInstance = renderOptions.instantSearchInstance;
        renderFn(_objectSpread$d(_objectSpread$d({}, this.getWidgetRenderState(renderOptions)), {}, {
          instantSearchInstance: instantSearchInstance
        }), false);
      },
      dispose: function dispose(_ref) {
        var state = _ref.state;
        unmountFn();
        return state.setQueryParameter('relevancyStrictness', undefined);
      },
      getRenderState: function getRenderState(renderState, renderOptions) {
        return _objectSpread$d(_objectSpread$d({}, renderState), {}, {
          relevantSort: this.getWidgetRenderState(renderOptions)
        });
      },
      getWidgetRenderState: function getWidgetRenderState(_ref2) {
        var results = _ref2.results,
            helper = _ref2.helper;

        if (!connectorState.refine) {
          connectorState.refine = function (relevancyStrictness) {
            helper.setQueryParameter('relevancyStrictness', relevancyStrictness).search();
          };
        }

        var _ref3 = results || {},
            appliedRelevancyStrictness = _ref3.appliedRelevancyStrictness;

        var isVirtualReplica = appliedRelevancyStrictness !== undefined;
        return {
          isRelevantSorted: typeof appliedRelevancyStrictness !== 'undefined' && appliedRelevancyStrictness > 0,
          isVirtualReplica: isVirtualReplica,
          canRefine: isVirtualReplica,
          refine: connectorState.refine,
          widgetParams: widgetParams
        };
      },
      getWidgetSearchParameters: function getWidgetSearchParameters(state, _ref4) {
        var _uiState$relevantSort;

        var uiState = _ref4.uiState;
        return state.setQueryParameter('relevancyStrictness', (_uiState$relevantSort = uiState.relevantSort) !== null && _uiState$relevantSort !== void 0 ? _uiState$relevantSort : state.relevancyStrictness);
      },
      getWidgetUiState: function getWidgetUiState(uiState, _ref5) {
        var searchParameters = _ref5.searchParameters;
        return _objectSpread$d(_objectSpread$d({}, uiState), {}, {
          relevantSort: searchParameters.relevancyStrictness || uiState.relevantSort
        });
      }
    };
  };
};

var connectRelevantSort$1 = connectRelevantSort;

var RelevantSort = function RelevantSort(_ref) {
  var cssClasses = _ref.cssClasses,
      templates = _ref.templates,
      isRelevantSorted = _ref.isRelevantSorted,
      isVirtualReplica = _ref.isVirtualReplica,
      refine = _ref.refine;
  return isVirtualReplica ? h$1("div", {
    className: cssClasses.root
  }, h$1(Template$1, {
    templateKey: "text",
    templates: templates,
    rootProps: {
      className: cssClasses.text
    },
    data: {
      isRelevantSorted: isRelevantSorted
    }
  }), h$1("button", {
    type: "button",
    className: cssClasses.button,
    onClick: function onClick() {
      if (isRelevantSorted) {
        refine(0);
      } else {
        refine(undefined);
      }
    }
  }, h$1(Template$1, {
    rootTagName: "span",
    templateKey: "button",
    templates: templates,
    data: {
      isRelevantSorted: isRelevantSorted
    }
  }))) : null;
};

var RelevantSort$1 = RelevantSort;

var defaultTemplates$5 = {
  text: function text() {
    return '';
  },
  button: function button(_ref) {
    var isRelevantSorted = _ref.isRelevantSorted;
    return isRelevantSorted ? 'See all results' : 'See relevant results';
  }
};
var defaultTemplates$6 = defaultTemplates$5;

function ownKeys$c(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$c(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$c(Object(source), true).forEach(function (key) { _defineProperty$c(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$c(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$c(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var withUsage$a = createDocumentationMessageGenerator({
  name: 'relevant-sort'
});
var suit$5 = component('RelevantSort');

var renderer$5 = function renderer(_ref) {
  var containerNode = _ref.containerNode,
      cssClasses = _ref.cssClasses,
      templates = _ref.templates;
  return function (_ref2) {
    var isRelevantSorted = _ref2.isRelevantSorted,
        isVirtualReplica = _ref2.isVirtualReplica,
        refine = _ref2.refine;
    P(h$1(RelevantSort$1, {
      cssClasses: cssClasses,
      templates: templates,
      isRelevantSorted: isRelevantSorted,
      isVirtualReplica: isVirtualReplica,
      refine: refine
    }), containerNode);
  };
};

var relevantSort = function relevantSort(widgetParams) {
  var container = widgetParams.container,
      _widgetParams$templat = widgetParams.templates,
      userTemplates = _widgetParams$templat === void 0 ? {} : _widgetParams$templat,
      _widgetParams$cssClas = widgetParams.cssClasses,
      userCssClasses = _widgetParams$cssClas === void 0 ? {} : _widgetParams$cssClas;

  if (!container) {
    throw new Error(withUsage$a('The `container` option is required.'));
  }

  var containerNode = getContainerNode(container);
  var cssClasses = {
    root: cx(suit$5(), userCssClasses.root),
    text: cx(suit$5({
      descendantName: 'text'
    }), userCssClasses.text),
    button: cx(suit$5({
      descendantName: 'button'
    }), userCssClasses.button)
  };

  var templates = _objectSpread$c(_objectSpread$c({}, defaultTemplates$6), userTemplates);

  var specializedRenderer = renderer$5({
    containerNode: containerNode,
    cssClasses: cssClasses,
    renderState: {},
    templates: templates
  });
  var makeWidget = connectRelevantSort$1(specializedRenderer, function () {
    P(null, containerNode);
  });
  return _objectSpread$c(_objectSpread$c({}, makeWidget({})), {}, {
    $$widgetType: 'ais.relevantSort'
  });
};

var relevantSort$1 = relevantSort;

function ownKeys$b(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$b(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$b(Object(source), true).forEach(function (key) { _defineProperty$b(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$b(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$b(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var withUsage$9 = createDocumentationMessageGenerator({
  name: 'search-box',
  connector: true
});

var defaultQueryHook = function defaultQueryHook(query, hook) {
  return hook(query);
};
/**
 * **SearchBox** connector provides the logic to build a widget that will let the user search for a query.
 *
 * The connector provides to the rendering: `refine()` to set the query. The behaviour of this function
 * may be impacted by the `queryHook` widget parameter.
 */


var connectSearchBox = function connectSearchBox(renderFn) {
  var unmountFn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : noop;
  checkRendering(renderFn, withUsage$9());
  return function (widgetParams) {
    var _ref = widgetParams || {},
        _ref$queryHook = _ref.queryHook,
        queryHook = _ref$queryHook === void 0 ? defaultQueryHook : _ref$queryHook;

    var _refine;

    var _clear;

    return {
      $$type: 'ais.searchBox',
      init: function init(initOptions) {
        var instantSearchInstance = initOptions.instantSearchInstance;
        renderFn(_objectSpread$b(_objectSpread$b({}, this.getWidgetRenderState(initOptions)), {}, {
          instantSearchInstance: instantSearchInstance
        }), true);
      },
      render: function render(renderOptions) {
        var instantSearchInstance = renderOptions.instantSearchInstance;
        renderFn(_objectSpread$b(_objectSpread$b({}, this.getWidgetRenderState(renderOptions)), {}, {
          instantSearchInstance: instantSearchInstance
        }), false);
      },
      dispose: function dispose(_ref2) {
        var state = _ref2.state;
        unmountFn();
        return state.setQueryParameter('query', undefined);
      },
      getRenderState: function getRenderState(renderState, renderOptions) {
        return _objectSpread$b(_objectSpread$b({}, renderState), {}, {
          searchBox: this.getWidgetRenderState(renderOptions)
        });
      },
      getWidgetRenderState: function getWidgetRenderState(_ref3) {
        var helper = _ref3.helper,
            searchMetadata = _ref3.searchMetadata,
            state = _ref3.state;

        if (!_refine) {
          _refine = function _refine(query) {
            queryHook(query, function (q) {
              return helper.setQuery(q).search();
            });
          };

          _clear = function _clear() {
            helper.setQuery('').search();
          };
        }

        return {
          query: state.query || '',
          refine: _refine,
          clear: _clear,
          widgetParams: widgetParams,
          isSearchStalled: searchMetadata.isSearchStalled
        };
      },
      getWidgetUiState: function getWidgetUiState(uiState, _ref4) {
        var searchParameters = _ref4.searchParameters;
        var query = searchParameters.query || '';

        if (query === '' || uiState && uiState.query === query) {
          return uiState;
        }

        return _objectSpread$b(_objectSpread$b({}, uiState), {}, {
          query: query
        });
      },
      getWidgetSearchParameters: function getWidgetSearchParameters(searchParameters, _ref5) {
        var uiState = _ref5.uiState;
        return searchParameters.setQueryParameter('query', uiState.query || '');
      }
    };
  };
};

var connectSearchBox$1 = connectSearchBox;

function ownKeys$a(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$a(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$a(Object(source), true).forEach(function (key) { _defineProperty$a(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$a(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$a(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var withUsage$8 = createDocumentationMessageGenerator({
  name: 'search-box'
});
var suit$4 = component('SearchBox');

var renderer$4 = function renderer(_ref) {
  var containerNode = _ref.containerNode,
      cssClasses = _ref.cssClasses,
      placeholder = _ref.placeholder,
      templates = _ref.templates,
      autofocus = _ref.autofocus,
      searchAsYouType = _ref.searchAsYouType,
      showReset = _ref.showReset,
      showSubmit = _ref.showSubmit,
      showLoadingIndicator = _ref.showLoadingIndicator;
  return function (_ref2) {
    var refine = _ref2.refine,
        query = _ref2.query,
        isSearchStalled = _ref2.isSearchStalled;
    P(h$1(SearchBox$1, {
      query: query,
      placeholder: placeholder,
      autofocus: autofocus,
      refine: refine,
      searchAsYouType: searchAsYouType,
      templates: templates,
      showSubmit: showSubmit,
      showReset: showReset,
      showLoadingIndicator: showLoadingIndicator,
      isSearchStalled: isSearchStalled,
      cssClasses: cssClasses
    }), containerNode);
  };
};
/**
 * The searchbox widget is used to let the user set a text based query.
 *
 * This is usually the  main entry point to start the search in an instantsearch context. For that
 * reason is usually placed on top, and not hidden so that the user can start searching right
 * away.
 *
 */


var searchBox = function searchBox(widgetParams) {
  var _ref3 = widgetParams || {},
      container = _ref3.container,
      _ref3$placeholder = _ref3.placeholder,
      placeholder = _ref3$placeholder === void 0 ? '' : _ref3$placeholder,
      _ref3$cssClasses = _ref3.cssClasses,
      userCssClasses = _ref3$cssClasses === void 0 ? {} : _ref3$cssClasses,
      _ref3$autofocus = _ref3.autofocus,
      autofocus = _ref3$autofocus === void 0 ? false : _ref3$autofocus,
      _ref3$searchAsYouType = _ref3.searchAsYouType,
      searchAsYouType = _ref3$searchAsYouType === void 0 ? true : _ref3$searchAsYouType,
      _ref3$showReset = _ref3.showReset,
      showReset = _ref3$showReset === void 0 ? true : _ref3$showReset,
      _ref3$showSubmit = _ref3.showSubmit,
      showSubmit = _ref3$showSubmit === void 0 ? true : _ref3$showSubmit,
      _ref3$showLoadingIndi = _ref3.showLoadingIndicator,
      showLoadingIndicator = _ref3$showLoadingIndi === void 0 ? true : _ref3$showLoadingIndi,
      queryHook = _ref3.queryHook,
      _ref3$templates = _ref3.templates,
      userTemplates = _ref3$templates === void 0 ? {} : _ref3$templates;

  if (!container) {
    throw new Error(withUsage$8('The `container` option is required.'));
  }

  var containerNode = getContainerNode(container);
  var cssClasses = {
    root: cx(suit$4(), userCssClasses.root),
    form: cx(suit$4({
      descendantName: 'form'
    }), userCssClasses.form),
    input: cx(suit$4({
      descendantName: 'input'
    }), userCssClasses.input),
    submit: cx(suit$4({
      descendantName: 'submit'
    }), userCssClasses.submit),
    submitIcon: cx(suit$4({
      descendantName: 'submitIcon'
    }), userCssClasses.submitIcon),
    reset: cx(suit$4({
      descendantName: 'reset'
    }), userCssClasses.reset),
    resetIcon: cx(suit$4({
      descendantName: 'resetIcon'
    }), userCssClasses.resetIcon),
    loadingIndicator: cx(suit$4({
      descendantName: 'loadingIndicator'
    }), userCssClasses.loadingIndicator),
    loadingIcon: cx(suit$4({
      descendantName: 'loadingIcon'
    }), userCssClasses.loadingIcon)
  };

  var templates = _objectSpread$a(_objectSpread$a({}, defaultTemplates$9), userTemplates);

  var specializedRenderer = renderer$4({
    containerNode: containerNode,
    cssClasses: cssClasses,
    placeholder: placeholder,
    templates: templates,
    autofocus: autofocus,
    searchAsYouType: searchAsYouType,
    showReset: showReset,
    showSubmit: showSubmit,
    showLoadingIndicator: showLoadingIndicator
  });
  var makeWidget = connectSearchBox$1(specializedRenderer, function () {
    return P(null, containerNode);
  });
  return _objectSpread$a(_objectSpread$a({}, makeWidget({
    queryHook: queryHook
  })), {}, {
    $$widgetType: 'ais.searchBox'
  });
};

var searchBox$1 = searchBox;

function ownKeys$9(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$9(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$9(Object(source), true).forEach(function (key) { _defineProperty$9(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$9(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$9(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var withUsage$7 = createDocumentationMessageGenerator({
  name: 'sort-by',
  connector: true
});
/**
 * The **SortBy** connector provides the logic to build a custom widget that will display a
 * list of indices. With Algolia, this is most commonly used for changing ranking strategy. This allows
 * a user to change how the hits are being sorted.
 */

var connectSortBy = function connectSortBy(renderFn) {
  var unmountFn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : noop;
  checkRendering(renderFn, withUsage$7());
  var connectorState = {};
  return function (widgetParams) {
    var _ref = widgetParams || {},
        items = _ref.items,
        _ref$transformItems = _ref.transformItems,
        transformItems = _ref$transformItems === void 0 ? function (x) {
      return x;
    } : _ref$transformItems;

    if (!Array.isArray(items)) {
      throw new Error(withUsage$7('The `items` option expects an array of objects.'));
    }

    return {
      $$type: 'ais.sortBy',
      init: function init(initOptions) {
        var instantSearchInstance = initOptions.instantSearchInstance;
        var widgetRenderState = this.getWidgetRenderState(initOptions);
        var currentIndex = widgetRenderState.currentRefinement;
        var isCurrentIndexInItems = find(items, function (item) {
          return item.value === currentIndex;
        });
        _warning(isCurrentIndexInItems !== undefined, "The index named \"".concat(currentIndex, "\" is not listed in the `items` of `sortBy`.")) ;
        renderFn(_objectSpread$9(_objectSpread$9({}, widgetRenderState), {}, {
          instantSearchInstance: instantSearchInstance
        }), true);
      },
      render: function render(renderOptions) {
        var instantSearchInstance = renderOptions.instantSearchInstance;
        renderFn(_objectSpread$9(_objectSpread$9({}, this.getWidgetRenderState(renderOptions)), {}, {
          instantSearchInstance: instantSearchInstance
        }), false);
      },
      dispose: function dispose(_ref2) {
        var state = _ref2.state;
        unmountFn();
        return connectorState.initialIndex ? state.setIndex(connectorState.initialIndex) : state;
      },
      getRenderState: function getRenderState(renderState, renderOptions) {
        return _objectSpread$9(_objectSpread$9({}, renderState), {}, {
          sortBy: this.getWidgetRenderState(renderOptions)
        });
      },
      getWidgetRenderState: function getWidgetRenderState(_ref3) {
        var results = _ref3.results,
            helper = _ref3.helper,
            state = _ref3.state,
            parent = _ref3.parent;

        if (!connectorState.initialIndex && parent) {
          connectorState.initialIndex = parent.getIndexName();
        }

        if (!connectorState.setIndex) {
          connectorState.setIndex = function (indexName) {
            helper.setIndex(indexName).search();
          };
        }

        var hasNoResults = results ? results.nbHits === 0 : true;
        return {
          currentRefinement: state.index,
          options: transformItems(items, {
            results: results
          }),
          refine: connectorState.setIndex,
          hasNoResults: hasNoResults,
          canRefine: !hasNoResults && items.length > 0,
          widgetParams: widgetParams
        };
      },
      getWidgetUiState: function getWidgetUiState(uiState, _ref4) {
        var searchParameters = _ref4.searchParameters;
        var currentIndex = searchParameters.index;
        return _objectSpread$9(_objectSpread$9({}, uiState), {}, {
          sortBy: currentIndex !== connectorState.initialIndex ? currentIndex : undefined
        });
      },
      getWidgetSearchParameters: function getWidgetSearchParameters(searchParameters, _ref5) {
        var uiState = _ref5.uiState;
        return searchParameters.setQueryParameter('index', uiState.sortBy || connectorState.initialIndex || searchParameters.index);
      }
    };
  };
};

var connectSortBy$1 = connectSortBy;

function ownKeys$8(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$8(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$8(Object(source), true).forEach(function (key) { _defineProperty$8(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$8(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$8(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var withUsage$6 = createDocumentationMessageGenerator({
  name: 'sort-by'
});
var suit$3 = component('SortBy');

var renderer$3 = function renderer(_ref) {
  var containerNode = _ref.containerNode,
      cssClasses = _ref.cssClasses;
  return function (_ref2, isFirstRendering) {
    var currentRefinement = _ref2.currentRefinement,
        options = _ref2.options,
        refine = _ref2.refine;

    if (isFirstRendering) {
      return;
    }

    P(h$1("div", {
      className: cssClasses.root
    }, h$1(Selector, {
      cssClasses: cssClasses,
      currentValue: currentRefinement,
      options: options,
      setValue: refine
    })), containerNode);
  };
};
/**
 * Sort by selector is a widget used for letting the user choose between different
 * indices that contains the same data with a different order / ranking formula.
 */


var sortBy = function sortBy(widgetParams) {
  var _ref3 = widgetParams || {},
      container = _ref3.container,
      items = _ref3.items,
      _ref3$cssClasses = _ref3.cssClasses,
      userCssClasses = _ref3$cssClasses === void 0 ? {} : _ref3$cssClasses,
      transformItems = _ref3.transformItems;

  if (!container) {
    throw new Error(withUsage$6('The `container` option is required.'));
  }

  var containerNode = getContainerNode(container);
  var cssClasses = {
    root: cx(suit$3(), userCssClasses.root),
    select: cx(suit$3({
      descendantName: 'select'
    }), userCssClasses.select),
    option: cx(suit$3({
      descendantName: 'option'
    }), userCssClasses.option)
  };
  var specializedRenderer = renderer$3({
    containerNode: containerNode,
    cssClasses: cssClasses
  });
  var makeWidget = connectSortBy$1(specializedRenderer, function () {
    return P(null, containerNode);
  });
  return _objectSpread$8(_objectSpread$8({}, makeWidget({
    container: containerNode,
    items: items,
    transformItems: transformItems
  })), {}, {
    $$widgetType: 'ais.sortBy'
  });
};

var sortBy$1 = sortBy;

function _extends$1() { _extends$1 = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$1.apply(this, arguments); }

function ownKeys$7(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$7(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$7(Object(source), true).forEach(function (key) { _defineProperty$7(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$7(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$7(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

var Stats = function Stats(_ref) {
  var nbHits = _ref.nbHits,
      nbSortedHits = _ref.nbSortedHits,
      cssClasses = _ref.cssClasses,
      templateProps = _ref.templateProps,
      rest = _objectWithoutProperties(_ref, ["nbHits", "nbSortedHits", "cssClasses", "templateProps"]);

  return h$1("div", {
    className: cx(cssClasses.root)
  }, h$1(Template$1, _extends$1({}, templateProps, {
    templateKey: "text",
    rootTagName: "span",
    rootProps: {
      className: cssClasses.text
    },
    data: _objectSpread$7({
      hasManySortedResults: nbSortedHits && nbSortedHits > 1,
      hasNoSortedResults: nbSortedHits === 0,
      hasOneSortedResults: nbSortedHits === 1,
      hasManyResults: nbHits > 1,
      hasNoResults: nbHits === 0,
      hasOneResult: nbHits === 1,
      nbHits: nbHits,
      nbSortedHits: nbSortedHits,
      cssClasses: cssClasses
    }, rest)
  })));
};

var Stats$1 = Stats;

function ownKeys$6(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$6(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$6(Object(source), true).forEach(function (key) { _defineProperty$6(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$6(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$6(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var withUsage$5 = createDocumentationMessageGenerator({
  name: 'stats',
  connector: true
});
/**
 * **Stats** connector provides the logic to build a custom widget that will displays
 * search statistics (hits number and processing time).
 */

var connectStats = function connectStats(renderFn) {
  var unmountFn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : noop;
  checkRendering(renderFn, withUsage$5());
  return function (widgetParams) {
    return {
      $$type: 'ais.stats',
      init: function init(initOptions) {
        var instantSearchInstance = initOptions.instantSearchInstance;
        renderFn(_objectSpread$6(_objectSpread$6({}, this.getWidgetRenderState(initOptions)), {}, {
          instantSearchInstance: instantSearchInstance
        }), true);
      },
      render: function render(renderOptions) {
        var instantSearchInstance = renderOptions.instantSearchInstance;
        renderFn(_objectSpread$6(_objectSpread$6({}, this.getWidgetRenderState(renderOptions)), {}, {
          instantSearchInstance: instantSearchInstance
        }), false);
      },
      dispose: function dispose() {
        unmountFn();
      },
      getRenderState: function getRenderState(renderState, renderOptions) {
        return _objectSpread$6(_objectSpread$6({}, renderState), {}, {
          stats: this.getWidgetRenderState(renderOptions)
        });
      },
      getWidgetRenderState: function getWidgetRenderState(_ref) {
        var results = _ref.results,
            state = _ref.state;

        if (!results) {
          return {
            hitsPerPage: state.hitsPerPage,
            nbHits: 0,
            nbSortedHits: undefined,
            areHitsSorted: false,
            nbPages: 0,
            page: state.page || 0,
            processingTimeMS: -1,
            query: state.query || '',
            widgetParams: widgetParams
          };
        }

        return {
          hitsPerPage: results.hitsPerPage,
          nbHits: results.nbHits,
          nbSortedHits: results.nbSortedHits,
          areHitsSorted: typeof results.appliedRelevancyStrictness !== 'undefined' && results.appliedRelevancyStrictness > 0 && results.nbSortedHits !== results.nbHits,
          nbPages: results.nbPages,
          page: results.page,
          processingTimeMS: results.processingTimeMS,
          query: results.query,
          widgetParams: widgetParams
        };
      }
    };
  };
};

var connectStats$1 = connectStats;

function ownKeys$5(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$5(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$5(Object(source), true).forEach(function (key) { _defineProperty$5(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$5(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$5(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var withUsage$4 = createDocumentationMessageGenerator({
  name: 'stats'
});
var suit$2 = component('Stats');
var defaultTemplates$4 = {
  text: function text(props) {
    return "".concat(props.areHitsSorted ? getSortedResultsSentence(props) : getResultsSentence(props), " found in ").concat(props.processingTimeMS, "ms");
  }
};

function getSortedResultsSentence(_ref) {
  var nbHits = _ref.nbHits,
      hasNoSortedResults = _ref.hasNoSortedResults,
      hasOneSortedResults = _ref.hasOneSortedResults,
      hasManySortedResults = _ref.hasManySortedResults,
      nbSortedHits = _ref.nbSortedHits;
  var suffix = "sorted out of ".concat(formatNumber(nbHits));

  if (hasNoSortedResults) {
    return "No relevant results ".concat(suffix);
  }

  if (hasOneSortedResults) {
    return "1 relevant result ".concat(suffix);
  }

  if (hasManySortedResults) {
    return "".concat(formatNumber(nbSortedHits || 0), " relevant results ").concat(suffix);
  }

  return '';
}

function getResultsSentence(_ref2) {
  var nbHits = _ref2.nbHits,
      hasNoResults = _ref2.hasNoResults,
      hasOneResult = _ref2.hasOneResult,
      hasManyResults = _ref2.hasManyResults;

  if (hasNoResults) {
    return 'No results';
  }

  if (hasOneResult) {
    return '1 result';
  }

  if (hasManyResults) {
    return "".concat(formatNumber(nbHits), " results");
  }

  return '';
}

var renderer$2 = function renderer(_ref3) {
  var renderState = _ref3.renderState,
      cssClasses = _ref3.cssClasses,
      containerNode = _ref3.containerNode,
      templates = _ref3.templates;
  return function (_ref4, isFirstRendering) {
    var hitsPerPage = _ref4.hitsPerPage,
        nbHits = _ref4.nbHits,
        nbSortedHits = _ref4.nbSortedHits,
        areHitsSorted = _ref4.areHitsSorted,
        nbPages = _ref4.nbPages,
        page = _ref4.page,
        processingTimeMS = _ref4.processingTimeMS,
        query = _ref4.query,
        instantSearchInstance = _ref4.instantSearchInstance;

    if (isFirstRendering) {
      renderState.templateProps = prepareTemplateProps({
        defaultTemplates: defaultTemplates$4,
        templatesConfig: instantSearchInstance.templatesConfig,
        templates: templates
      });
      return;
    }

    P(h$1(Stats$1, {
      cssClasses: cssClasses,
      hitsPerPage: hitsPerPage,
      nbHits: nbHits,
      nbSortedHits: nbSortedHits,
      areHitsSorted: areHitsSorted,
      nbPages: nbPages,
      page: page,
      processingTimeMS: processingTimeMS,
      query: query,
      templateProps: renderState.templateProps
    }), containerNode);
  };
};
/**
 * The `stats` widget is used to display useful insights about the current results.
 *
 * By default, it will display the **number of hits** and the time taken to compute the
 * results inside the engine.
 */


var stats = function stats(widgetParams) {
  var _ref5 = widgetParams || {},
      container = _ref5.container,
      _ref5$cssClasses = _ref5.cssClasses,
      userCssClasses = _ref5$cssClasses === void 0 ? {} : _ref5$cssClasses,
      _ref5$templates = _ref5.templates,
      templates = _ref5$templates === void 0 ? {} : _ref5$templates;

  if (!container) {
    throw new Error(withUsage$4('The `container` option is required.'));
  }

  var containerNode = getContainerNode(container);
  var cssClasses = {
    root: cx(suit$2(), userCssClasses.root),
    text: cx(suit$2({
      descendantName: 'text'
    }), userCssClasses.text)
  };
  var specializedRenderer = renderer$2({
    containerNode: containerNode,
    cssClasses: cssClasses,
    templates: templates,
    renderState: {}
  });
  var makeWidget = connectStats$1(specializedRenderer, function () {
    return P(null, containerNode);
  });
  return _objectSpread$5(_objectSpread$5({}, makeWidget({})), {}, {
    $$widgetType: 'ais.stats'
  });
};

var stats$1 = stats;

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

var ToggleRefinement = function ToggleRefinement(_ref) {
  var currentRefinement = _ref.currentRefinement,
      refine = _ref.refine,
      cssClasses = _ref.cssClasses,
      templateProps = _ref.templateProps;
  return h$1("div", {
    className: cssClasses.root
  }, h$1("label", {
    className: cssClasses.label
  }, h$1("input", {
    className: cssClasses.checkbox,
    type: "checkbox",
    checked: currentRefinement.isRefined,
    onChange: function onChange(event) {
      return refine({
        isRefined: !event.target.checked
      });
    }
  }), h$1(Template$1, _extends({}, templateProps, {
    rootTagName: "span",
    rootProps: {
      className: cssClasses.labelText
    },
    templateKey: "labelText",
    data: currentRefinement
  }))));
};

var ToggleRefinement$1 = ToggleRefinement;

function ownKeys$4(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$4(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$4(Object(source), true).forEach(function (key) { _defineProperty$4(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$4(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$4(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var withUsage$3 = createDocumentationMessageGenerator({
  name: 'toggle-refinement',
  connector: true
});
var $$type = 'ais.toggleRefinement';

var createSendEvent = function createSendEvent(_ref) {
  var instantSearchInstance = _ref.instantSearchInstance,
      helper = _ref.helper,
      attribute = _ref.attribute,
      on = _ref.on;

  var sendEventForToggle = function sendEventForToggle() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    if (args.length === 1) {
      instantSearchInstance.sendEventToInsights(args[0]);
      return;
    }

    var eventType = args[0],
        isRefined = args[1],
        _args$ = args[2],
        eventName = _args$ === void 0 ? 'Filter Applied' : _args$;

    if (eventType !== 'click' || on === undefined) {
      return;
    } // only send an event when the refinement gets applied,
    // not when it gets removed


    if (!isRefined) {
      instantSearchInstance.sendEventToInsights({
        insightsMethod: 'clickedFilters',
        widgetType: $$type,
        eventType: eventType,
        payload: {
          eventName: eventName,
          index: helper.getIndex(),
          filters: on.map(function (value) {
            return "".concat(attribute, ":").concat(value);
          })
        },
        attribute: attribute
      });
    }
  };

  return sendEventForToggle;
};

/**
 * **Toggle** connector provides the logic to build a custom widget that will provide
 * an on/off filtering feature based on an attribute value or values.
 *
 * Two modes are implemented in the custom widget:
 *  - with or without the value filtered
 *  - switch between two values.
 */
var connectToggleRefinement = function connectToggleRefinement(renderFn) {
  var unmountFn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : noop;
  checkRendering(renderFn, withUsage$3());
  return function (widgetParams) {
    var _ref2 = widgetParams || {},
        attribute = _ref2.attribute,
        _ref2$on = _ref2.on,
        userOn = _ref2$on === void 0 ? true : _ref2$on,
        userOff = _ref2.off;

    if (!attribute) {
      throw new Error(withUsage$3('The `attribute` option is required.'));
    }

    var hasAnOffValue = userOff !== undefined; // even though facet values can be numbers and boolean,
    // the helper methods only accept string in the type

    var on = toArray(userOn).map(escapeFacetValue);
    var off = hasAnOffValue ? toArray(userOff).map(escapeFacetValue) : undefined;
    var sendEvent;

    var toggleRefinementFactory = function toggleRefinementFactory(helper) {
      return function () {
        var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
          isRefined: false
        },
            isRefined = _ref3.isRefined;

        if (!isRefined) {
          sendEvent('click', isRefined);

          if (hasAnOffValue) {
            off.forEach(function (v) {
              return helper.removeDisjunctiveFacetRefinement(attribute, v);
            });
          }

          on.forEach(function (v) {
            return helper.addDisjunctiveFacetRefinement(attribute, v);
          });
        } else {
          on.forEach(function (v) {
            return helper.removeDisjunctiveFacetRefinement(attribute, v);
          });

          if (hasAnOffValue) {
            off.forEach(function (v) {
              return helper.addDisjunctiveFacetRefinement(attribute, v);
            });
          }
        }

        helper.search();
      };
    };

    var connectorState = {
      createURLFactory: function createURLFactory(isRefined, _ref4) {
        var state = _ref4.state,
            createURL = _ref4.createURL;
        return function () {
          state = state.resetPage();
          var valuesToRemove = isRefined ? on : off;

          if (valuesToRemove) {
            valuesToRemove.forEach(function (v) {
              state = state.removeDisjunctiveFacetRefinement(attribute, v);
            });
          }

          var valuesToAdd = isRefined ? off : on;

          if (valuesToAdd) {
            valuesToAdd.forEach(function (v) {
              state = state.addDisjunctiveFacetRefinement(attribute, v);
            });
          }

          return createURL(state);
        };
      }
    };
    return {
      $$type: $$type,
      init: function init(initOptions) {
        var instantSearchInstance = initOptions.instantSearchInstance;
        renderFn(_objectSpread$4(_objectSpread$4({}, this.getWidgetRenderState(initOptions)), {}, {
          instantSearchInstance: instantSearchInstance
        }), true);
      },
      render: function render(renderOptions) {
        var instantSearchInstance = renderOptions.instantSearchInstance;
        renderFn(_objectSpread$4(_objectSpread$4({}, this.getWidgetRenderState(renderOptions)), {}, {
          instantSearchInstance: instantSearchInstance
        }), false);
      },
      dispose: function dispose(_ref5) {
        var state = _ref5.state;
        unmountFn();
        return state.removeDisjunctiveFacet(attribute);
      },
      getRenderState: function getRenderState(renderState, renderOptions) {
        return _objectSpread$4(_objectSpread$4({}, renderState), {}, {
          toggleRefinement: _objectSpread$4(_objectSpread$4({}, renderState.toggleRefinement), {}, _defineProperty$4({}, attribute, this.getWidgetRenderState(renderOptions)))
        });
      },
      getWidgetRenderState: function getWidgetRenderState(_ref6) {
        var state = _ref6.state,
            helper = _ref6.helper,
            results = _ref6.results,
            createURL = _ref6.createURL,
            instantSearchInstance = _ref6.instantSearchInstance;
        var isRefined = results ? on.every(function (v) {
          return state.isDisjunctiveFacetRefined(attribute, v);
        }) : on.every(function (v) {
          return state.isDisjunctiveFacetRefined(attribute, v);
        });
        var onFacetValue = {
          isRefined: isRefined,
          count: 0
        };
        var offFacetValue = {
          isRefined: hasAnOffValue && !isRefined,
          count: 0
        };

        if (results) {
          var offValue = toArray(off || false);
          var allFacetValues = results.getFacetValues(attribute, {}) || [];
          var onData = on.map(function (v) {
            return find(allFacetValues, function (_ref7) {
              var escapedValue = _ref7.escapedValue;
              return escapedValue === escapeFacetValue(String(v));
            });
          }).filter(function (v) {
            return v !== undefined;
          });
          var offData = hasAnOffValue ? offValue.map(function (v) {
            return find(allFacetValues, function (_ref8) {
              var escapedValue = _ref8.escapedValue;
              return escapedValue === escapeFacetValue(String(v));
            });
          }).filter(function (v) {
            return v !== undefined;
          }) : [];
          onFacetValue = {
            isRefined: onData.length ? onData.every(function (v) {
              return v.isRefined;
            }) : false,
            count: onData.reduce(function (acc, v) {
              return acc + v.count;
            }, 0) || null
          };
          offFacetValue = {
            isRefined: offData.length ? offData.every(function (v) {
              return v.isRefined;
            }) : false,
            count: offData.reduce(function (acc, v) {
              return acc + v.count;
            }, 0) || allFacetValues.reduce(function (total, _ref9) {
              var count = _ref9.count;
              return total + count;
            }, 0)
          };
        }

        if (!sendEvent) {
          sendEvent = createSendEvent({
            instantSearchInstance: instantSearchInstance,
            attribute: attribute,
            on: on,
            helper: helper
          });
        }

        var nextRefinement = isRefined ? offFacetValue : onFacetValue;
        return {
          value: {
            name: attribute,
            isRefined: isRefined,
            count: results ? nextRefinement.count : null,
            onFacetValue: onFacetValue,
            offFacetValue: offFacetValue
          },
          createURL: connectorState.createURLFactory(isRefined, {
            state: state,
            createURL: createURL
          }),
          sendEvent: sendEvent,
          canRefine: Boolean(results ? nextRefinement.count : null),
          refine: toggleRefinementFactory(helper),
          widgetParams: widgetParams
        };
      },
      getWidgetUiState: function getWidgetUiState(uiState, _ref10) {
        var searchParameters = _ref10.searchParameters;
        var isRefined = on && on.every(function (v) {
          return searchParameters.isDisjunctiveFacetRefined(attribute, v);
        });

        if (!isRefined) {
          return uiState;
        }

        return _objectSpread$4(_objectSpread$4({}, uiState), {}, {
          toggle: _objectSpread$4(_objectSpread$4({}, uiState.toggle), {}, _defineProperty$4({}, attribute, isRefined))
        });
      },
      getWidgetSearchParameters: function getWidgetSearchParameters(searchParameters, _ref11) {
        var uiState = _ref11.uiState;
        var withFacetConfiguration = searchParameters.clearRefinements(attribute).addDisjunctiveFacet(attribute);
        var isRefined = Boolean(uiState.toggle && uiState.toggle[attribute]);

        if (isRefined) {
          if (on) {
            on.forEach(function (v) {
              withFacetConfiguration = withFacetConfiguration.addDisjunctiveFacetRefinement(attribute, v);
            });
          }

          return withFacetConfiguration;
        } // It's not refined with an `off` value


        if (hasAnOffValue) {
          if (off) {
            off.forEach(function (v) {
              withFacetConfiguration = withFacetConfiguration.addDisjunctiveFacetRefinement(attribute, v);
            });
          }

          return withFacetConfiguration;
        } // It's not refined without an `off` value


        return withFacetConfiguration.setQueryParameters({
          disjunctiveFacetsRefinements: _objectSpread$4(_objectSpread$4({}, searchParameters.disjunctiveFacetsRefinements), {}, _defineProperty$4({}, attribute, []))
        });
      }
    };
  };
};

var connectToggleRefinement$1 = connectToggleRefinement;

var defaultTemplates$2 = {
  labelText: function labelText(_ref) {
    var name = _ref.name;
    return name;
  }
};
var defaultTemplates$3 = defaultTemplates$2;

function ownKeys$3(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$3(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$3(Object(source), true).forEach(function (key) { _defineProperty$3(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$3(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$3(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var withUsage$2 = createDocumentationMessageGenerator({
  name: 'toggle-refinement'
});
var suit$1 = component('ToggleRefinement');

var renderer$1 = function renderer(_ref) {
  var containerNode = _ref.containerNode,
      cssClasses = _ref.cssClasses,
      renderState = _ref.renderState,
      templates = _ref.templates;
  return function (_ref2, isFirstRendering) {
    var value = _ref2.value,
        refine = _ref2.refine,
        instantSearchInstance = _ref2.instantSearchInstance;

    if (isFirstRendering) {
      renderState.templateProps = prepareTemplateProps({
        defaultTemplates: defaultTemplates$3,
        templatesConfig: instantSearchInstance.templatesConfig,
        templates: templates
      });
      return;
    }

    P(h$1(ToggleRefinement$1, {
      cssClasses: cssClasses,
      currentRefinement: value,
      templateProps: renderState.templateProps,
      refine: refine
    }), containerNode);
  };
};

/**
 * The toggleRefinement widget lets the user either:
 *  - switch between two values for a single facetted attribute (free_shipping / not_free_shipping)
 *  - toggleRefinement a faceted value on and off (only 'canon' for brands)
 *
 * This widget is particularly useful if you have a boolean value in the records.
 *
 * @requirements
 * The attribute passed to `attribute` must be declared as an
 * [attribute for faceting](https://www.algolia.com/doc/guides/searching/faceting/#declaring-attributes-for-faceting)
 * in your Algolia settings.
 */
var toggleRefinement = function toggleRefinement(widgetParams) {
  var _ref3 = widgetParams || {},
      container = _ref3.container,
      attribute = _ref3.attribute,
      _ref3$cssClasses = _ref3.cssClasses,
      userCssClasses = _ref3$cssClasses === void 0 ? {} : _ref3$cssClasses,
      _ref3$templates = _ref3.templates,
      templates = _ref3$templates === void 0 ? {} : _ref3$templates,
      _ref3$on = _ref3.on,
      on = _ref3$on === void 0 ? true : _ref3$on,
      off = _ref3.off;

  if (!container) {
    throw new Error(withUsage$2('The `container` option is required.'));
  }

  var containerNode = getContainerNode(container);
  var cssClasses = {
    root: cx(suit$1(), userCssClasses.root),
    label: cx(suit$1({
      descendantName: 'label'
    }), userCssClasses.label),
    checkbox: cx(suit$1({
      descendantName: 'checkbox'
    }), userCssClasses.checkbox),
    labelText: cx(suit$1({
      descendantName: 'labelText'
    }), userCssClasses.labelText)
  };
  var specializedRenderer = renderer$1({
    containerNode: containerNode,
    cssClasses: cssClasses,
    renderState: {},
    templates: templates
  });
  var makeWidget = connectToggleRefinement$1(specializedRenderer, function () {
    return P(null, containerNode);
  });
  return _objectSpread$3(_objectSpread$3({}, makeWidget({
    attribute: attribute,
    on: on,
    off: off
  })), {}, {
    $$widgetType: 'ais.toggleRefinement'
  });
};

var toggleRefinement$1 = toggleRefinement;

function ownKeys$2(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$2(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$2(Object(source), true).forEach(function (key) { _defineProperty$2(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$2(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$2(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// `SpeechRecognition` is an API used on the browser so we can safely disable
// the `window` check.

/* eslint-disable no-restricted-globals */

/* global SpeechRecognition SpeechRecognitionEvent */
var createVoiceSearchHelper = function createVoiceSearchHelper(_ref) {
  var searchAsYouSpeak = _ref.searchAsYouSpeak,
      language = _ref.language,
      onQueryChange = _ref.onQueryChange,
      onStateChange = _ref.onStateChange;
  var SpeechRecognitionAPI = window.webkitSpeechRecognition || window.SpeechRecognition;

  var getDefaultState = function getDefaultState(status) {
    return {
      status: status,
      transcript: '',
      isSpeechFinal: false,
      errorCode: undefined
    };
  };

  var state = getDefaultState('initial');
  var recognition;

  var isBrowserSupported = function isBrowserSupported() {
    return Boolean(SpeechRecognitionAPI);
  };

  var isListening = function isListening() {
    return state.status === 'askingPermission' || state.status === 'waiting' || state.status === 'recognizing';
  };

  var setState = function setState() {
    var newState = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    state = _objectSpread$2(_objectSpread$2({}, state), newState);
    onStateChange();
  };

  var getState = function getState() {
    return state;
  };

  var resetState = function resetState() {
    var status = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'initial';
    setState(getDefaultState(status));
  };

  var onStart = function onStart() {
    setState({
      status: 'waiting'
    });
  };

  var onError = function onError(event) {
    setState({
      status: 'error',
      errorCode: event.error
    });
  };

  var onResult = function onResult(event) {
    setState({
      status: 'recognizing',
      transcript: event.results[0] && event.results[0][0] && event.results[0][0].transcript || '',
      isSpeechFinal: event.results[0] && event.results[0].isFinal
    });

    if (searchAsYouSpeak && state.transcript) {
      onQueryChange(state.transcript);
    }
  };

  var onEnd = function onEnd() {
    if (!state.errorCode && state.transcript && !searchAsYouSpeak) {
      onQueryChange(state.transcript);
    }

    if (state.status !== 'error') {
      setState({
        status: 'finished'
      });
    }
  };

  var startListening = function startListening() {
    recognition = new SpeechRecognitionAPI();

    if (!recognition) {
      return;
    }

    resetState('askingPermission');
    recognition.interimResults = true;

    if (language) {
      recognition.lang = language;
    }

    recognition.addEventListener('start', onStart);
    recognition.addEventListener('error', onError);
    recognition.addEventListener('result', onResult);
    recognition.addEventListener('end', onEnd);
    recognition.start();
  };

  var dispose = function dispose() {
    if (!recognition) {
      return;
    }

    recognition.stop();
    recognition.removeEventListener('start', onStart);
    recognition.removeEventListener('error', onError);
    recognition.removeEventListener('result', onResult);
    recognition.removeEventListener('end', onEnd);
    recognition = undefined;
  };

  var stopListening = function stopListening() {
    dispose(); // Because `dispose` removes event listeners, `end` listener is not called.
    // So we're setting the `status` as `finished` here.
    // If we don't do it, it will be still `waiting` or `recognizing`.

    resetState('finished');
  };

  return {
    getState: getState,
    isBrowserSupported: isBrowserSupported,
    isListening: isListening,
    startListening: startListening,
    stopListening: stopListening,
    dispose: dispose
  };
};

var builtInCreateVoiceSearchHelper = createVoiceSearchHelper;

function ownKeys$1(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$1(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$1(Object(source), true).forEach(function (key) { _defineProperty$1(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$1(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$1(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var withUsage$1 = createDocumentationMessageGenerator({
  name: 'voice-search',
  connector: true
});

var connectVoiceSearch = function connectVoiceSearch(renderFn) {
  var unmountFn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : noop;
  checkRendering(renderFn, withUsage$1());
  return function (widgetParams) {
    var _widgetParams$searchA = widgetParams.searchAsYouSpeak,
        searchAsYouSpeak = _widgetParams$searchA === void 0 ? false : _widgetParams$searchA,
        language = widgetParams.language,
        additionalQueryParameters = widgetParams.additionalQueryParameters,
        _widgetParams$createV = widgetParams.createVoiceSearchHelper,
        createVoiceSearchHelper = _widgetParams$createV === void 0 ? builtInCreateVoiceSearchHelper : _widgetParams$createV;
    return {
      $$type: 'ais.voiceSearch',
      init: function init(initOptions) {
        var instantSearchInstance = initOptions.instantSearchInstance;
        renderFn(_objectSpread$1(_objectSpread$1({}, this.getWidgetRenderState(initOptions)), {}, {
          instantSearchInstance: instantSearchInstance
        }), true);
      },
      render: function render(renderOptions) {
        var instantSearchInstance = renderOptions.instantSearchInstance;
        renderFn(_objectSpread$1(_objectSpread$1({}, this.getWidgetRenderState(renderOptions)), {}, {
          instantSearchInstance: instantSearchInstance
        }), false);
      },
      getRenderState: function getRenderState(renderState, renderOptions) {
        return _objectSpread$1(_objectSpread$1({}, renderState), {}, {
          voiceSearch: this.getWidgetRenderState(renderOptions)
        });
      },
      getWidgetRenderState: function getWidgetRenderState(renderOptions) {
        var _this = this;

        var helper = renderOptions.helper,
            instantSearchInstance = renderOptions.instantSearchInstance;

        if (!this._refine) {
          this._refine = function (query) {
            if (query !== helper.state.query) {
              var queryLanguages = language ? [language.split('-')[0]] : undefined;
              helper.setQueryParameter('queryLanguages', queryLanguages);

              if (typeof additionalQueryParameters === 'function') {
                helper.setState(helper.state.setQueryParameters(_objectSpread$1({
                  ignorePlurals: true,
                  removeStopWords: true,
                  // @ts-ignore (optionalWords only allows array in v3, while string is also valid)
                  optionalWords: query
                }, additionalQueryParameters({
                  query: query
                }))));
              }

              helper.setQuery(query).search();
            }
          };
        }

        if (!this._voiceSearchHelper) {
          this._voiceSearchHelper = createVoiceSearchHelper({
            searchAsYouSpeak: searchAsYouSpeak,
            language: language,
            onQueryChange: function onQueryChange(query) {
              return _this._refine(query);
            },
            onStateChange: function onStateChange() {
              renderFn(_objectSpread$1(_objectSpread$1({}, _this.getWidgetRenderState(renderOptions)), {}, {
                instantSearchInstance: instantSearchInstance
              }), false);
            }
          });
        }

        var _voiceSearchHelper = this._voiceSearchHelper,
            isBrowserSupported = _voiceSearchHelper.isBrowserSupported,
            isListening = _voiceSearchHelper.isListening,
            startListening = _voiceSearchHelper.startListening,
            stopListening = _voiceSearchHelper.stopListening,
            getState = _voiceSearchHelper.getState;
        return {
          isBrowserSupported: isBrowserSupported(),
          isListening: isListening(),
          toggleListening: function toggleListening() {
            if (!isBrowserSupported()) {
              return;
            }

            if (isListening()) {
              stopListening();
            } else {
              startListening();
            }
          },
          voiceListeningState: getState(),
          widgetParams: widgetParams
        };
      },
      dispose: function dispose(_ref) {
        var state = _ref.state;

        this._voiceSearchHelper.dispose();

        unmountFn();
        var newState = state;

        if (typeof additionalQueryParameters === 'function') {
          var additional = additionalQueryParameters({
            query: ''
          });
          var toReset = additional ? Object.keys(additional).reduce(function (acc, current) {
            // @ts-ignore search parameters is typed as readonly in v4
            acc[current] = undefined;
            return acc;
          }, {}) : {};
          newState = state.setQueryParameters(_objectSpread$1({
            // @ts-ignore (queryLanguages is not added to algoliasearch v3)
            queryLanguages: undefined,
            ignorePlurals: undefined,
            removeStopWords: undefined,
            optionalWords: undefined
          }, toReset));
        }

        return newState.setQueryParameter('query', undefined);
      },
      getWidgetUiState: function getWidgetUiState(uiState, _ref2) {
        var searchParameters = _ref2.searchParameters;
        var query = searchParameters.query || '';

        if (!query) {
          return uiState;
        }

        return _objectSpread$1(_objectSpread$1({}, uiState), {}, {
          query: query
        });
      },
      getWidgetSearchParameters: function getWidgetSearchParameters(searchParameters, _ref3) {
        var uiState = _ref3.uiState;
        return searchParameters.setQueryParameter('query', uiState.query || '');
      }
    };
  };
};

var connectVoiceSearch$1 = connectVoiceSearch;

var VoiceSearch = function VoiceSearch(_ref) {
  var cssClasses = _ref.cssClasses,
      isBrowserSupported = _ref.isBrowserSupported,
      isListening = _ref.isListening,
      toggleListening = _ref.toggleListening,
      voiceListeningState = _ref.voiceListeningState,
      templates = _ref.templates;

  var handleClick = function handleClick(event) {
    if (event.currentTarget instanceof HTMLElement) {
      event.currentTarget.blur();
    }

    toggleListening();
  };

  var status = voiceListeningState.status,
      transcript = voiceListeningState.transcript,
      isSpeechFinal = voiceListeningState.isSpeechFinal,
      errorCode = voiceListeningState.errorCode;
  return h$1("div", {
    className: cssClasses.root
  }, h$1(Template$1, {
    templateKey: "buttonText",
    rootTagName: "button",
    rootProps: {
      className: cssClasses.button,
      type: 'button',
      title: "Search by voice".concat(isBrowserSupported ? '' : ' (not supported on this browser)'),
      onClick: handleClick,
      disabled: !isBrowserSupported
    },
    data: {
      status: status,
      errorCode: errorCode,
      isListening: isListening,
      transcript: transcript,
      isSpeechFinal: isSpeechFinal,
      isBrowserSupported: isBrowserSupported
    },
    templates: templates
  }), h$1(Template$1, {
    templateKey: "status",
    rootProps: {
      className: cssClasses.status
    },
    data: {
      status: status,
      errorCode: errorCode,
      isListening: isListening,
      transcript: transcript,
      isSpeechFinal: isSpeechFinal,
      isBrowserSupported: isBrowserSupported
    },
    templates: templates
  }));
};

var VoiceSearchComponent = VoiceSearch;

var _ref2 = h$1(p$1, null, h$1("line", {
  x1: "1",
  y1: "1",
  x2: "23",
  y2: "23"
}), h$1("path", {
  d: "M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"
}), h$1("path", {
  d: "M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"
}), h$1("line", {
  x1: "12",
  y1: "19",
  x2: "12",
  y2: "23"
}), h$1("line", {
  x1: "8",
  y1: "23",
  x2: "16",
  y2: "23"
}));

var _ref3 = h$1("path", {
  d: "M19 10v2a7 7 0 0 1-14 0v-2"
});

var _ref4 = h$1("line", {
  x1: "12",
  y1: "19",
  x2: "12",
  y2: "23"
});

var _ref5 = h$1("line", {
  x1: "8",
  y1: "23",
  x2: "16",
  y2: "23"
});

var ButtonInnerElement = function ButtonInnerElement(_ref) {
  var status = _ref.status,
      errorCode = _ref.errorCode,
      isListening = _ref.isListening;

  if (status === 'error' && errorCode === 'not-allowed') {
    return _ref2;
  }

  return h$1(p$1, null, h$1("path", {
    d: "M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z",
    fill: isListening ? 'currentColor' : 'none'
  }), _ref3, _ref4, _ref5);
};

var defaultTemplates = {
  buttonText: function buttonText(_ref6) {
    var status = _ref6.status,
        errorCode = _ref6.errorCode,
        isListening = _ref6.isListening;
    return h$1("svg", {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor"
      /* eslint-disable react/no-unknown-property */
      // Preact supports kebab case attributes, and using camel case would
      // require using `preact/compat`.
      // @TODO: reconsider using the `react` ESLint preset
      ,
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round"
      /* eslint-enable react/no-unknown-property */

    }, h$1(ButtonInnerElement, {
      status: status,
      errorCode: errorCode,
      isListening: isListening
    }));
  },
  status: function status(_ref7) {
    var transcript = _ref7.transcript;
    return h$1("p", null, transcript);
  }
};
var defaultTemplates$1 = defaultTemplates;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var withUsage = createDocumentationMessageGenerator({
  name: 'voice-search'
});
var suit = component('VoiceSearch');

var renderer = function renderer(_ref) {
  var containerNode = _ref.containerNode,
      cssClasses = _ref.cssClasses,
      templates = _ref.templates;
  return function (_ref2) {
    var isBrowserSupported = _ref2.isBrowserSupported,
        isListening = _ref2.isListening,
        toggleListening = _ref2.toggleListening,
        voiceListeningState = _ref2.voiceListeningState;
    P(h$1(VoiceSearchComponent, {
      cssClasses: cssClasses,
      templates: templates,
      isBrowserSupported: isBrowserSupported,
      isListening: isListening,
      toggleListening: toggleListening,
      voiceListeningState: voiceListeningState
    }), containerNode);
  };
};

var voiceSearch = function voiceSearch(widgetParams) {
  var _ref3 = widgetParams || {},
      container = _ref3.container,
      _ref3$cssClasses = _ref3.cssClasses,
      userCssClasses = _ref3$cssClasses === void 0 ? {} : _ref3$cssClasses,
      _ref3$templates = _ref3.templates,
      userTemplates = _ref3$templates === void 0 ? {} : _ref3$templates,
      _ref3$searchAsYouSpea = _ref3.searchAsYouSpeak,
      searchAsYouSpeak = _ref3$searchAsYouSpea === void 0 ? false : _ref3$searchAsYouSpea,
      language = _ref3.language,
      additionalQueryParameters = _ref3.additionalQueryParameters,
      createVoiceSearchHelper = _ref3.createVoiceSearchHelper;

  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  var containerNode = getContainerNode(container);
  var cssClasses = {
    root: cx(suit(), userCssClasses.root),
    button: cx(suit({
      descendantName: 'button'
    }), userCssClasses.button),
    status: cx(suit({
      descendantName: 'status'
    }), userCssClasses.status)
  };

  var templates = _objectSpread(_objectSpread({}, defaultTemplates$1), userTemplates);

  var specializedRenderer = renderer({
    containerNode: containerNode,
    cssClasses: cssClasses,
    templates: templates
  });
  var makeWidget = connectVoiceSearch$1(specializedRenderer, function () {
    return P(null, containerNode);
  });
  return _objectSpread(_objectSpread({}, makeWidget({
    container: containerNode,
    cssClasses: cssClasses,
    templates: templates,
    searchAsYouSpeak: searchAsYouSpeak,
    language: language,
    additionalQueryParameters: additionalQueryParameters,
    createVoiceSearchHelper: createVoiceSearchHelper
  })), {}, {
    $$widgetType: 'ais.voiceSearch'
  });
};

var voiceSearch$1 = voiceSearch;

/** @deprecated use dynamicWidgets */

var EXPERIMENTAL_dynamicWidgets = deprecate(dynamicWidgets$1, 'use dynamicWidgets');

export { answersWidget$1 as EXPERIMENTAL_answers, configureRelatedItems$1 as EXPERIMENTAL_configureRelatedItems, EXPERIMENTAL_dynamicWidgets, analytics$1 as analytics, breadcrumb$1 as breadcrumb, clearRefinements$1 as clearRefinements, configure$1 as configure, currentRefinements$1 as currentRefinements, dynamicWidgets$1 as dynamicWidgets, geoSearch$1 as geoSearch, hierarchicalMenu$1 as hierarchicalMenu, hits$1 as hits, hitsPerPage$1 as hitsPerPage, infiniteHits$1 as infiniteHits, menu$1 as menu, menuSelect$1 as menuSelect, numericMenu$1 as numericMenu, pagination$1 as pagination, panel$1 as panel, placesWidget$1 as places, poweredBy$1 as poweredBy, queryRuleContext$1 as queryRuleContext, queryRuleCustomData$1 as queryRuleCustomData, rangeInput$1 as rangeInput, rangeSlider$1 as rangeSlider, ratingMenu$1 as ratingMenu, refinementList$1 as refinementList, relevantSort$1 as relevantSort, searchBox$1 as searchBox, sortBy$1 as sortBy, stats$1 as stats, toggleRefinement$1 as toggleRefinement, voiceSearch$1 as voiceSearch };
