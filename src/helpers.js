/**
 * Contains functions commonly used in login
 */
export default class Helpers {
  /**
   * Get unix time
   * @return {Integer} Time
   */
  static time() {
    return new Date().getTime();
  }

  /**
   * Convert base64 to ascii
   * @param {String} str - Base64 string
   * @return {String} Decoded string
   */
  static atob(str) {
    return Buffer.from(str, 'base64').toString('binary');
  }

  /**
   * Solves kahoot challenge
   * @param {String} challenge
   * @return {String} CometD id
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
   * Does some bit magic
   * @param {String} rawToken
   * @param {String} session
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
   * Get a random valid cid
   */
  static cid() {
    let final = '';
    for (let i = 0; i < 9; i += 1) {
      final += Math.floor(Math.random() * 9) + 1;
    }
    return final;
  }
}
