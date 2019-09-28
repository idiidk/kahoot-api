import Adapter from './adapter';
import Events from '../events';

/**
 * The player adapter, used for connecting to a game
 *
 * @export
 * @class Player
 * @extends {Adapter}
 */
export default class Player extends Adapter {
  /**
   * Creates an instance of Player.
   *
   * @param {CometD} socket
   * @memberof Player
   */
  constructor(socket) {
    super(socket);
    if (socket.playerBound) {
      throw new Error('Socket can only be used for one player');
    }

    this.cid = '';
    this.name = '';
    this.loggedIn = false;
    this.timeouts = [];

    this.socket = socket;
    this.socket.playerBound = this;
  }


  /**
   * Attempt two factor login with specified code
   *
   * @param {String} code
   * @returns {Promise}
   * @memberof Player
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
      const timeout = setTimeout(() => {
        if (!this.loggedIn) {
          this.twoFactorLogin(combi);
        }

        this.timeouts.splice(this.timeouts.indexOf(timeout), 1);
      }, index * (1000 / combinations.length));

      this.timeouts.push(timeout);
    });
  }

  /**
   * Stop the current brute force attempt
   */
  stopBruteForce() {
    this.timeouts.forEach((timeout, index) => {
      clearTimeout(timeout);
      this.timeouts.splice(index, 1);
    });
  }

  /**
   * Join the game
   *
   * @param {String} name
   * @returns {Promise}
   * @memberof Player
   */
  join(name) {
    const twoFactor = this.socket.info.twoFactorAuth;
    const deviceInfo = { participantUserId: null, device: { userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.75 Safari/537.36', screen: { width: 1920, height: 1080 } } };

    return new Promise((resolve, rejects) => {
      this.on('controller', (res) => {
        const { data } = res;
        if (data.type === 'loginResponse') {
          if (data.error) rejects(new Error(data.description));

          this.cid = data.cid;
          if (!twoFactor) {
            this.loggedIn = true;
            resolve();
          }
        }
      });

      if (twoFactor) {
        this.once('status', (statusRes) => {
          const statusData = statusRes.data;
          const { status } = statusData;
          if (status === 'ACTIVE') {
            this.on('player', (playerRes) => {
              const playerData = playerRes.data;
              const { id } = playerData;

              if (id === Events.resetTwoFactorAuth && !this.loggedIn) {
                this.stopBruteForce();
                this.bruteForceTwoFactor();
              }

              if (id === Events.twoFactorAuthCorrect) {
                this.loggedIn = true;
                this.stopBruteForce();
                resolve();
              }

              if (id === Events.userNameAccepted) {
                this.bruteForceTwoFactor();
              }
            });
          } else {
            rejects(new Error(`Status not active: ${status}`));
          }
        });
      }

      this.send('/service/controller', {
        content: JSON.stringify(deviceInfo),
        name,
        type: 'login',
        status: 'VERIFIED',
      });
    }).then(() => { this.name = name; }).then(this.initListeners());
  }

  initListeners() {
    this.on('player', (message) => {
      const { data } = message;
      const { type } = data;

      switch (type) {
        case 'message': {
          const { id, content } = data;
          const parsedContent = content ? JSON.parse(content) : '';

          this.emit('message', {
            id,
            content: parsedContent,
          });
          break;
        }

        default: {
          break;
        }
      }
    });
  }

  /**
   * Answer a question
   *
   * @param {Number} choice - 0 - 3
   * @returns {Promise}
   * @memberof Player
   */
  answer(choice) {
    const content = { choice, questionIndex: 0, meta: { lag: 50 } };

    return this.send('/service/controller', {
      content: JSON.stringify(content),
      id: 45,
      type: 'message',
    });
  }

  /**
   * Leave the game and disconnect socket
   */
  leave() {
    this.stopBruteForce();
    this.socket.playerBound = false;
    this.socket.disconnect();
  }
}
