import Helpers from './helpers';
import Session from './session';
import Events from './events';
import Web from './web/api';

import Adapter from './adapters/adapter';
import Player from './adapters/player';

const Adapters = {
  Player,
  Generic: Adapter,
};

export {
  Session, Helpers, Events, Adapters, Web,
};
