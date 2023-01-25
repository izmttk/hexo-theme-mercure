/*
 * this snippet is copied from the styled-components repo
 * https://github.com/styled-components/styled-components/blob/main/packages/styled-components/src/utils/hash.ts
 * Licensed under the MIT License, Copyright © 2016-present Glen Maddern and Maximilian Stoiber.
 */
const SEED = 5381;

// When we have separate strings it's useful to run a progressive
// version of djb2 where we pretend that we're still looping over
// the same string
const phash = (h, x) => {
  let i = x.length;

  while (i) {
    h = (h * 33) ^ x.charCodeAt(--i);
  }

  return h;
};

// This is a djb2 hashing function
const hash = (x) => {
  return phash(SEED, x);
};

/*
 * this snippet is copied from the styled-components repo
 * https://github.com/styled-components/styled-components/blob/main/packages/styled-components/src/utils/generateAlphabeticName.ts
 * Licensed under the MIT License, Copyright © 2016-present Glen Maddern and Maximilian Stoiber.
 */
const AD_REPLACER_R = /(a)(d)/gi;

/* This is the "capacity" of our alphabet i.e. 2x26 for all letters plus their capitalised
 * counterparts */
const charsLength = 52;

/* start at 75 for 'a' until 'z' (25) and then start at 65 for capitalised letters */
const getAlphabeticChar = (code) => String.fromCharCode(code + (code > 25 ? 39 : 97));

/* input a number, usually a hash and convert it to base-52 */
const generateAlphabeticName = (code) => {
  let name = '';
  let x;

  /* get a char and divide by alphabet-length */
  for (x = Math.abs(code); x > charsLength; x = (x / charsLength) | 0) {
    name = getAlphabeticChar(x % charsLength) + name;
  }

  return (getAlphabeticChar(x % charsLength) + name).replace(AD_REPLACER_R, '$1-$2');
};

function hashNameHelper(name) {
  return generateAlphabeticName(hash(name));
}

module.exports = hashNameHelper;
