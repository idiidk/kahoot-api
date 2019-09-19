# Kahoot API

An API for the kahoot.it quiz platform. WIP, will support all live game functions.

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
import { Session, Adapters } from 'kahoot-api';

const session = new Session(000000 /** pin */, /** optional cors proxy, url string */)
session.openSocket() //Connect
  .then(socket => {
    const player = new Adapters.Player(socket); //Create player class
    player.join('test') //Join with name
      .then(() => {
         console.log('Success!');
      });
  });
```

For usage please refer to the [documentation](https://idiidk.app/kahoot-api)

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
