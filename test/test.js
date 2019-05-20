/* eslint-env node, mocha */
import { expect } from 'chai';
import { pin, proxy } from './config';
import { Session, Adapters } from '..';

// Change pin first in pin.js

describe('Kahoot', () => {
  const session = new Session(pin, proxy);
  let socket;

  describe('Session', () => {
    describe('#check', () => {
      it('Should be able to retrieve game info', async () => {
        const info = await session.check(pin);
        expect(typeof info.twoFactorAuth).to.equal('boolean');
      });
    });

    describe('#connect', () => {
      it('Should be able to solve the challenge and connect', async () => {
        try {
          socket = await session.openSocket();
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
        const player = new Adapters.Player(socket);
        expect(socket.playerBound).to.equal(player);

        return player.join('mereltjeliefs').then(() => {
          socket.disconnect();
        });
      });
    });
  });
});
