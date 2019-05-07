# Kahoot API

An API for the kahoot.it quiz platform. ~~Includes~~ Will include all the features of [kahoot-tools](https://github.com/idiidk/kahoot-tools)

## Installation

Install with npm or yarn

```bash
yarn add kahoot-api
# or
npm install kahoot-api
```

## Usage

To get you started, here is a basic example of the Player authentication flow:

```JavaScript
/** 
 * import * as Kahoot from 'kahoot-api' for node
 * import * as Kahoot from 'kahoot-api/browser' for browser support
*/

import { Session, Player } from 'kahoot-api';

const session = new Session(/** optional cors proxy, url string */)
session.check(123456) //Get pin info
  .then(info => session.connect)
  .then(socket => {
    const player = new Player(socket); //Create player class
    player.join('test'); //Join with name
    player.on('status', (message) => { //Listen to status messages
        if (message.data.status === 'ACTIVE') { //If session active
          console.log('Success!');
        }
    });
  });
```

For usage please refer to the [~~documentation~~](https://idiidk.site/kahoot-api) (WIP, probably old)

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
