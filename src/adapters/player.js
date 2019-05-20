import Adapter from './adapter';
import Events from '../events';

export default class Player extends Adapter {
  constructor(socket) {
    super(socket);
    if (socket.playerBound) {
      throw new Error('Socket can only be used for one player');
    }

    this.socket = socket;
    this.socket.playerBound = this;
    this.socket.subscribe('/service/controller', m => this.emit('controller', m));
    this.socket.subscribe('/service/player', m => this.emit('player', m));
    this.socket.subscribe('/service/status', m => this.emit('status', m));
  }

  twoFactorLogin(code) {
    this.send('/service/controller', {
      id: Events.submitTwoFactorAuth,
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
    combinations.forEach((combi, index) => {
      setTimeout(() => {
        this.twoFactorLogin(combi);
      }, index * (5000 / combinations.length));
    });
  }

  join(name) {
    return this.send('/service/controller', {
      type: 'login',
      name,
    }).then(
      () => new Promise((resolve) => {
        this.once('status', (statusMessage) => {
          if (statusMessage.data.status === 'ACTIVE') {
            if (this.socket.info.twoFactorAuth) {
              const twoFactorListener = (playerMessage) => {
                const { id } = playerMessage.data;
                if (id === Events.twoFactorAuthCorrect) {
                  this.off('player', twoFactorListener);
                  resolve();
                } else if (id === Events.resetTwoFactorAuth) {
                  this.bruteForceTwoFactor();
                }
              };

              this.on('player', twoFactorListener);
              this.bruteForceTwoFactor();
            } else {
              resolve();
            }
          }
        });
      }),
    );
  }

  leave() {
    this.socket.playerBound = false;
    this.socket.disconnect();
  }
}
