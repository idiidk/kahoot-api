import Helpers from '../helpers';
import Adapter from './adapter';

export default class Ghost extends Adapter {
  constructor(socket) {
    super(socket);

    this.socket = socket;
    this.cid = Helpers.cid();
  }

  join(name) {
    return this.send(`/controller/${this.socket.info.pin}`, {
      type: 'joined',
      name,
      cid: this.cid,
      isGhost: true,
    });
  }

  leave() {
    this.send(`/controller/${this.socket.info.pin}`, {
      type: 'left',
      cid: this.cid,
    });
  }
}
