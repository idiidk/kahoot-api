/* eslint-env node, mocha */
import { expect } from 'chai';
import pin from './pin';
import * as Kahoot from '../dist';

// Change pin first in pin.js

describe('Kahoot', () => {
  let socket;

  describe('Session', () => {
    let info;
    describe('#check', () => {
      it('Should be able to retrieve game info', async () => {
        info = await Kahoot.Session.check(pin);
        expect(typeof info.twoFactorAuth).to.equal('boolean');
      });
    });

    describe('#connect', () => {
      it('Should be able to solve the challenge and connect', async () => {
        try {
          socket = await Kahoot.Session.connect(info);
        } catch (error) {
          socket.disconnect();
          throw error;
        }
        expect(socket.isDisconnected()).to.equal(false);
      });
    });
  });

  describe('Player', () => {
    describe('#join', () => {
      it('Should be able to join with the created socket', () => {
        const player = new Kahoot.Player(socket);
        expect(socket.playerBound).to.equal(player);

        player.join('mereltjelief');
        return new Promise((resolve) => {
          player.on('status', (message) => {
            if (message.data.status === 'ACTIVE') {
              socket.disconnect();
              resolve();
            }
          });
        });
      });
    });
  });
});
