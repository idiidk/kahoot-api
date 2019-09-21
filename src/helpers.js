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
    const decode = challenge.split("'")[1].split("'")[0];
    // eslint-disable-next-line no-eval
    const offset = eval(challenge.split('var offset = ')[1].split(';')[0]);
    const mod = parseInt(
      challenge
        .split(') % ')[1]
        .split(')')[0]
        .trim(),
      0,
    );

    let plus = '';
    let final = '';

    try {
      plus = parseInt(
        challenge
          .split(mod)[1]
          .split(challenge.includes('+') ? '+ ' : '- ')[1]
          .split(')')[0],
        0,
      );
    } catch (error) {
      return error;
    }

    [...decode].forEach((char, index) => {
      final += String.fromCharCode(((char.charCodeAt(0) * index + offset) % mod) + plus);
    });

    return final;
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
