/* eslint-disable no-unused-vars */

/**
 * Patched polyfill for lodash replace
 *
 * @param {String} message
 * @param {RegExp} regex - Unused
 * @param {Function} replacer
 */
function loReplace(message, _, replacer) {
  const chars = message.split('');
  const final = [];

  for (let i = 0; i < chars.length; i += 1) {
    const char = chars[i];
    final.push(replacer(char, i));
  }

  return final.join('');
}

/**
 * Contains functions commonly used in login
 */
export default class Helpers {
  /**
   * Get unix time
   *
   * @static
   * @returns {Number} - Time
   * @memberof Helpers
   */
  static time() {
    return new Date().getTime();
  }


  /**
   * Convert base64 to ascii
   *
   * @static
   * @param {String} base64
   * @returns {String} - Decoded value
   * @memberof Helpers
   */
  static atob(base64) {
    return Buffer.from(base64, 'base64').toString('binary');
  }

  /**
   * Solves kahoot challenge
   *
   * @static
   * @param {String} challenge
   * @returns {String} - Solved challenge
   * @memberof Helpers
   */
  static solve(challenge) {
    const patch = /(if\()(.*)(this)(.+?(?=\())/g;
    const no = () => false;
    const _ = { replace: loReplace };

    const patched = challenge.replace(patch, 'if(no');

    // eslint-disable-next-line no-eval
    return eval(patched);
  }

  /**
   * Shifts the token and session bits (magic)
   *
   * @static
   * @param {String} rawToken
   * @param {String} session
   * @returns {String}
   * @memberof Helpers
   */
  static shiftBits(rawToken, session) {
    let final = '';
    const token = this.atob(rawToken);

    for (let i = 0; i < token.length; i += 1) {
      const tokenChar = token.charCodeAt(i);
      const charCode = session.charCodeAt(i % session.length);
      // eslint-disable-next-line no-bitwise
      const shifted = tokenChar ^ charCode;
      final += String.fromCharCode(shifted);
    }

    return final;
  }

  /**
   * Get a random valid cid (unique id)
   *
   * @static
   * @returns {String}
   * @memberof Helpers
   */
  static cid() {
    let final = '';
    for (let i = 0; i < 9; i += 1) {
      final += Math.floor(Math.random() * 9) + 1;
    }
    return final;
  }
}
