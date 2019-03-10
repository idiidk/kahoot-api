import Client from "./client"
import Helpers from "./helpers"

class Kahoot {
  constructor() {
    this.Client = Client
    this.Helpers = Helpers
  }
}

export default new Kahoot()