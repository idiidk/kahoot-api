/* eslint-env node, mocha */
import { expect } from 'chai';
import { pin, proxy, protocol } from './config';
import { Session, Adapters } from '../src';

// Change pin first in pin.js

describe('Kahoot', () => {
  const session = new Session(pin, proxy, protocol);
  let socket;
  let player;

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
        player = new Adapters.Player(socket);
        expect(socket.playerBound).to.equal(player);

        return player.join(Math.random().toString()).then(() => {
          expect(player.cid).to.not.equal('');
        });
      });

      it('(optional) Should be able to add team members', () => {
        const members = 'idiidk'.split('');

        return player.team(members);
      });

      it('Should be able to disconnect', () => new Promise((resolve) => {
        setTimeout(() => {
          player.leave().then(resolve);
        }, 1000);
      }));
    });
  });
});
