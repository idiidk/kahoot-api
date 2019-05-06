import atob from 'atob';

export default class Helpers {
  static time() {
    return new Date().getTime();
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
        .split('+ ')[1]
        .split(')')[0],
      0,
    );
    let final = '';

    [...decode].forEach((char, index) => {
      final += String.fromCharCode(((char.charCodeAt(0) * index + offset) % mod) + plus);
    });

    return final;
  }

  static toBinary(raw) {
    const codes = [...raw].map(char => char.charCodeAt(0));
    return codes;
  }

  static shiftBits(token, challenge) {
    const sessionBytes = this.toBinary(atob(token));
    const challengeBytes = this.toBinary(challenge);
    const bytes = [];
    for (let i = 0; i < sessionBytes.length; i += 1) {
      bytes.push(
        // eslint-disable-next-line no-bitwise
        String.fromCharCode(sessionBytes[i] ^ challengeBytes[i % challengeBytes.length]),
      );
    }
    return bytes.join('');
  }
}
