import cometdAdapter from 'cometd-nodejs-client';
import http from './http';
import Helpers from './helpers';
import WebApi from './web/api';

if (typeof window === 'undefined') {
  cometdAdapter.adapt();
}

// Old school require to fix adapter not adapting :)
const cometd = require('cometd');

/**
 * Wrapper to open sockets
 *
 * @export
 * @class Session
 */
export default class Session {
  /**
   * Creates an instance of Session.
   *
   * @param {String} pin
   * @param {String} [proxy] - Optional cors proxy server url
   * @memberof Session
   */
  constructor(pin, proxy) {
    this.pin = pin;
    this.proxy = proxy;
    this.web = new WebApi();

    this.web.proxy = proxy;
  }

  /**
   * Open a socket to the current game
   *
   * @returns {Promise<CometD>}
   * @memberof Session
   */
  openSocket() {
    return this.check(this.pin).then((info) => this.connect(info));
  }

  /**
   * Get session info
   *
   * @param {Number|String} pin
   * @returns {Promise<Object>} Game info
   * @memberof Session
   */
  check(pin) {
    return http
      .get(`${this.proxy}https://kahoot.it/reserve/session/${pin}/?${Helpers.time()}`)
      .then((response) => {
        const info = response.data;
        info.token = response.headers['x-kahoot-session-token'];
        info.pin = pin;

        return info;
      })
      .catch(() => {
        throw new Error('Game not found');
      });
  }


  /**
   * Open a socket using the game info provided by the check function
   *
   * @param {Object} info
   * @returns {Promise<CometD>}
   * @memberof Session
   */
  connect(info) {
    const socket = new cometd.CometD();
    const challenge = Helpers.solve(info.challenge);
    const session = Helpers.shiftBits(info.token, challenge);
    const validated = /([A-Z,0-9])\w+/g.exec(session);
    if (validated && validated[0].length !== 96) {
      return this.check(info.pin).then((secondInfo) => this.connect(secondInfo));
    }

    socket.configure({
      url: `https://kahoot.it/cometd/${info.pin}/${validated[0]}`,
    });
    socket.websocketEnabled = true;
    const handshake = new Promise((resolve) => socket.handshake(resolve));

    return handshake.then((response) => {
      if (!response.successful) throw new Error('Session failed to connect');
      socket.info = info;
      return socket;
    });
  }
}
