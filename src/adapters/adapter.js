import Emitter from 'tiny-emitter';

export default class Adapter extends Emitter {
  constructor(socket) {
    super();

    this.socket = socket;
  }

  send(channel, data = {}) {
    const final = data;
    return new Promise((resolve) => {
      if (!this.socket.isDisconnected()) {
        final.host = 'play.kahoot.it';
        final.gameid = this.socket.info.pin;
        this.socket.publish(channel, final, resolve);
      } else {
        resolve();
      }
    });
  }
}
