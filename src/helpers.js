import atob from "atob"

/**
 * Helper class, contains static functions used when authenticating
 *
 * @class Helpers
 */
export default class Helpers {
  /**
   * Gets unix time
   * 
   * @return {String} Time in macroseconds
   */
  static getTime() {
    return new Date().getTime()
  }

  /**
   * Does some magic by xor'ing the session and challenge to generate a url
   * 
   * @param {String} session Session string
   * @param {String} challenge Challenge string
   * 
   * @return {String} Parsed session
   */
  static shiftBits(session, challenge) {
    const sessionBytes = this.convertDataToBinary(atob(session))
    const challengeBytes = this.convertDataToBinary(challenge)
    const bytesList = []
    for (let i = 0; i < sessionBytes.length; i++) {
      bytesList.push(
        String.fromCharCode(
          sessionBytes[i] ^ challengeBytes[i % challengeBytes.length]
        )
      )
    }
    return bytesList.join("");
  }

  /**
   * Converts any data to binary data
   * 
   * @param raw Data to convert
   * 
   * @return {String} Parsed session
   */
  static convertDataToBinary(raw) {
    const rawLength = raw.length;
    const tempArray = new Uint8Array(new ArrayBuffer(rawLength));

    for (let i = 0; i < rawLength; i++) {
      tempArray[i] = raw.charCodeAt(i);
    }
    return tempArray;
  }

  /**
   * Solves challenge to get the first part of authentication out of the way
   * 
   * @param {String} challenge Challenge code
   * 
   * @return {String} Parsed challenge
   */
  static solveChallenge(challenge) {
    let toDecode = challenge.split("'")[1].split("'")[0];
    const offset = eval(challenge.split("var offset = ")[1].split(";")[0]);
    const decodeMod = parseInt(
      challenge
      .split(") % ")[1]
      .split(")")[0]
      .trim()
    );
    const decodePlus = parseInt(
      challenge
      .split(decodeMod)[1]
      .split("+ ")[1]
      .split(")")[0]
    );
    let final = "";

    for (let i = 0; i < toDecode.length; i++) {
      const char = toDecode[i];
      final += String.fromCharCode(
        ((char.charCodeAt(0) * i + offset) % decodeMod) + decodePlus
      );
    }

    return final;
  }

  /**
   * Generates random id for players
   * 
   * @return {String} Random cid
   */
  static randomCid() {
    return 10000 + Math.floor(Math.random() * 10000)
  }
}