import Adapter from './adapter';
import Events from '../events';

/**
 * Normal player
 */
export default class Player extends Adapter {
  /**
   * @param {CometD} socket - CometD instance
   */
  constructor(socket) {
    super(socket);
    if (socket.playerBound) {
      throw new Error('Socket can only be used for one player');
    }

    this.cid = '';

    this.socket = socket;
    this.socket.playerBound = this;
    this.socket.subscribe('/service/controller', m => this.emit('controller', m));
    this.socket.subscribe('/service/player', m => this.emit('player', m));
    this.socket.subscribe('/service/status', m => this.emit('status', m));
  }

  /**
   * Attempt two factor login
   * @param {String} code - Code of the symbol pattern
   * @return {Promise}
   */
  twoFactorLogin(code) {
    return this.send('/service/controller', {
      id: Events.submitTwoFactorAuth,
      type: 'message',
      content: JSON.stringify({
        sequence: code,
      }),
    });
  }

  /**
   * Tries all combinations of 2FA codes
   */
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

  /**
   * Join the game
   * @param {String} name
   */
  join(name) {
    return new Promise((resolve) => {
      this.once('controller', (statusMessage) => {
        if (statusMessage.data.type === 'loginResponse') {
          this.cid = statusMessage.data.cid;

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

      this.send('/service/controller', {
        type: 'login',
        name,
      });
    });
  }

  /**
   * Leave the game and disconnect socket
   */
  leave() {
    this.socket.playerBound = false;
    this.socket.disconnect();
  }
}
