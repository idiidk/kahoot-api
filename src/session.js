import cometd from 'cometd';
import cometdAdapter from 'cometd-nodejs-client';
import http from './http';
import Helpers from './helpers';

if (typeof window === 'undefined') {
  cometdAdapter.adapt();
}

export default class Session {
  constructor(proxy) {
    this.proxy = proxy;
  }

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

  connect(info) {
    const socket = new cometd.CometD();
    const challenge = Helpers.solve(info.challenge);
    const session = Helpers.shiftBits(info.token, challenge);
    const validated = /([A-Z,0-9])\w+/g.exec(session)[0];
    if (validated.length !== 96) {
      return this.check(info.pin).then(secondInfo => this.connect(secondInfo));
    }

    socket.configure({
      url: `https://kahoot.it/cometd/${info.pin}/${validated}`,
    });
    socket.websocketEnabled = true;
    const handshake = new Promise(resolve => socket.handshake(resolve));

    return handshake.then((response) => {
      if (!response.successful) throw new Error('Session failed to connect');
      socket.info = info;
      return socket;
    });
  }
}
