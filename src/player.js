import EVENTS from "./events"

/**
 * Player class, created when calling addPlayer. 
 * Contains player related functions
 *
 * @class Player
 */
export default class Player {
  /**
   * @param {Object} cometd CometD instance
   * @param {String} cid Cid of the player
   * @param {String} pin Pin of the current game
   */
  constructor(cometd, cid, pin) {
    this.cometd = cometd
    this.cid = cid
    this.pin = pin
  }

  /**
   * Sends a packet to Kahoot
   * 
   * @param {String} channel Channel to send to
   * @param {Object} data Data to send to channel specified
   * 
   * @return {Promise} Resolves when done
   */
  sendPacket(channel, data = {}) {
    return new Promise((resolve, _) => {
      data.host = "play.kahoot.it"
      data.gameid = this.pin
      this.cometd.publish(channel, data, resolve)
    })
  }

  /**
   * Attempts 2FA login using code, 0000 to 3333
   * 
   * @param {String} code 0000 to 3333
   */
  twoFactorLogin(code) {
    this.sendPacket(
      "/service/controller", {
        id: EVENTS.submitTwoFactorAuth,
        type: "message",
        cid: this.cid,
        gameid: this.pin,
        host: "kahoot.it",
        content: JSON.stringify({
          sequence: code
        })
      }
    )
  }

  /**
   * Attempts all 2FA codes until logged in
   */
  bruteForceTwoFactor() {
    let combinations = [
      "0123",
      "0132",
      "0213",
      "0231",
      "0321",
      "0312",
      "1023",
      "1032",
      "1203",
      "1230",
      "1302",
      "1320",
      "2013",
      "2031",
      "2103",
      "2130",
      "2301",
      "2310",
      "3012",
      "3021",
      "3102",
      "3120",
      "3201",
      "3210"
    ];
    combinations.forEach(c => {
      this.twoFactorLogin(c);
    })
  }

  /**
   * Remove this player from the game
   */
  removeFromGame() {
    this.send(`/controller/${this.pin}`, {
      type: "left",
      cid: this.cid,
      client: "@idiidk"
    })
  }

  /**
   * Send team name array, only works when the game is a team game
   * 
   * @param {Array} names The names of teammates you want to add
   */
  sendTeam(names) {
    this.send(`/controller/${this.pin}`, {
      id: EVENTS.joinTeamMembers,
      type: "message",
      cid: this.cid,
      content: JSON.stringify(names)
    })
  }

  /**
   * Sends a game answer for the current question
   * 
   * @param {Number} answerId 0 to 3
   */
  sendGameAnswer(answerId) {
    this.send(`/controller/${this.pin}`, {
      id: EVENTS.gameBlockAnswer,
      type: "message",
      cid: this.cid,
      content: JSON.stringify({
        choice: answerId,
        meta: {
          lag: 15,
          device: {
            userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/61.0.3163.79 Chrome/61.0.3163.79 Safari/537.36",
            screen: {
              width: 1920,
              height: 1080
            }
          }
        }
      })
    })
  }

  /**
   * Disconnect from the game
   */
  disconnect() {
    this.cometd.disconnect();
  }
}