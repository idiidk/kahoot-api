import Helpers from '../helpers';
import Adapter from './adapter';

/**
 * Ghost player
 */
export default class Ghost extends Adapter {
  /**
   * @param {CometD} socket - CometD instance
   */
  constructor(socket) {
    super(socket);

    this.socket = socket;
    this.cid = Helpers.cid();
  }

  /**
   * Join the game
   * @param {String} name
   */
  join(name) {
    return this.send(`/controller/${this.socket.info.pin}`, {
      type: 'joined',
      name,
      cid: this.cid,
      isGhost: true,
    });
  }

  /**
   * Leave the game
   */
  leave() {
    this.send(`/controller/${this.socket.info.pin}`, {
      type: 'left',
      cid: this.cid,
    });
  }
}
