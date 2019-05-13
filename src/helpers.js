export default class Helpers {
  static time() {
    return new Date().getTime();
  }

  static atob(str) {
    return Buffer.from(str, 'base64').toString('binary');
  }

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
    const plus = parseInt(
      challenge
        .split(mod)[1]
        .split(challenge.includes('+') ? '+ ' : '- ')[1]
        .split(')')[0],
      0,
    );
    let final = '';

    [...decode].forEach((char, index) => {
      final += String.fromCharCode(((char.charCodeAt(0) * index + offset) % mod) + plus);
    });

    return final;
  }

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
}
