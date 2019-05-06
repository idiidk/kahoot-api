import EventEmitter from 'events';
import events from './events';

export default class Player extends EventEmitter {
  constructor(socket) {
    super();
    if (socket.playerBound) {
      throw new Error('Socket can only be used for one player');
    }

    this.socket = socket;
    this.socket.playerBound = this;

    this.socket.subscribe('/service/controller', m => this.emit('controller', m));
    this.socket.subscribe('/service/player', m => this.emit('player', m));
    this.socket.subscribe('/service/status', m => this.emit('status', m));
  }

  send(channel, data = {}) {
    const final = data;
    return new Promise((resolve) => {
      final.host = 'play.kahoot.it';
      final.gameid = this.socket.info.pin;
      this.socket.publish(channel, final, resolve);
    });
  }

  twoFactorLogin(code) {
    this.send('/service/controller', {
      id: events.submitTwoFactorAuth,
      type: 'message',
      content: JSON.stringify({
        sequence: code,
      }),
    });
  }

  bruteForceTwoFactor() {
    const combinations = [
      '0123',
      '0132',
      '0213',
      '0231',
      '0321',
      '0312',
      '1023',
      '1032',
      '1203',
      '1230',
      '1302',
      '1320',
      '2013',
      '2031',
      '2103',
      '2130',
      '2301',
      '2310',
      '3012',
      '3021',
      '3102',
      '3120',
      '3201',
      '3210',
    ];
    combinations.forEach((combi) => {
      this.twoFactorLogin(combi);
    });
  }

  join(name) {
    return this.send('/service/controller', {
      type: 'login',
      name,
    }).then(() => {
      if (this.socket.info.twoFactorAuth) {
        this.bruteForceTwoFactor();
      }
      return true;
    });
  }
}
