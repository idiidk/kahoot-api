/* eslint-env node, mocha */
import { expect } from 'chai';
import { pin, proxy } from './config';
import { Session, Player } from '..';

// Change pin first in pin.js

describe('Kahoot', () => {
  const session = new Session(proxy);
  let socket;

  describe('Session', () => {
    let info;
    describe('#check', () => {
      it('Should be able to retrieve game info', async () => {
        info = await session.check(pin);
        expect(typeof info.twoFactorAuth).to.equal('boolean');
      });
    });

    describe('#connect', () => {
      it('Should be able to solve the challenge and connect', async () => {
        try {
          socket = await session.connect(info);
        } catch (error) {
          if (socket) {
            socket.disconnect();
          }
          throw error;
        }
        expect(socket.isDisconnected()).to.equal(false);
      });
    });
  });

  describe('Player', () => {
    describe('#join', () => {
      it('Should be able to join with the created socket', () => {
        const player = new Player(socket);
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