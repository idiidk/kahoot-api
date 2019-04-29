import cometd from 'cometd';
import cometdAdapter from 'cometd-nodejs-client';
import http from './http';
import { time, solve, shiftBits } from './helpers';

if (typeof window === 'undefined') {
  cometdAdapter.adapt();
}

export const check = async (pin) => {
  try {
    const response = await http.get(`https://kahoot.it/reserve/session/${pin}/?${time()}`);
    const info = response.data;
    info.token = response.headers['x-kahoot-session-token'];
    info.pin = pin;

    return info;
  } catch (error) {
    throw new Error('Game not found');
  }
};

export const connect = async (info) => {
  const socket = new cometd.CometD();
  const challenge = solve(info.challenge);
  const session = shiftBits(info.token, challenge);
  if (session.length !== 96 || session.includes('`')) {
    return check(info.pin).then(connect);
  }

  socket.configure({
    url: `https://kahoot.it/cometd/${info.pin}/${session}`,
  });
  socket.websocketEnabled = true;
  const handshake = () => new Promise(resolve => socket.handshake(resolve));

  return handshake().then((response) => {
    if (!response.successful) throw new Error('Session failed to connect');
    socket.info = info;
    return socket;
  });
};
