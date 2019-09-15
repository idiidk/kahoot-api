import Emitter from 'tiny-emitter';

/**
 * Class used as a base for all adapters
 */
export default class Adapter extends Emitter {
  /**
   * @param {CometD} socket - CometD instance
   */
  constructor(socket) {
    super();

    this.socket = socket;
  }

  /**
   * Send data over the socket
   * @param {String} channel - CometD channel to send data to
   * @param {Object} data - Data to send
   */
  send(channel, data = {}) {
    const final = data;
    return new Promise((resolve) => {
      if (!this.socket.isDisconnected()) {
        final.host = 'kahoot.it';
        final.gameid = this.socket.info.pin;
        this.socket.publish(channel, final, resolve);
      } else {
        resolve();
      }
    });
  }
}
