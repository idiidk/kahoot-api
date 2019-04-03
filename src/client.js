import axios from "axios"
import emitter from "tiny-emitter/instance"
import cometd from "cometd"
import cometdAdapter from "cometd-nodejs-client"

import Helpers from "./helpers"
import Player from "./player"

if (typeof window === "undefined") {
  cometdAdapter.adapt()
}

/**
 * Client class, used as controller for players.
 * Also initializes the socket communication.
 *
 * @class Client
 */
export default class Client extends Player {
  /**
   * @param {Number} pin The game pin
   * @param {String} proxy Optional cors proxy url for the browser
   */
  constructor(pin, proxy = "") {
    super(null, Helpers.randomCid(), pin)

    this.pin = pin
    this.proxy = proxy
    this.emitter = emitter
    this.cometd = null
    this.twoFactor = null
  }

  /**
   * Checks session and initializes communication, must be called first!
   * 
   * @return {Promise<Object>} Returns CometD client
   */
  initialize() {
    return this.checkSession()
      .then(this.createSocket)
      .then(e => this.cometd = e)
  }

  /**
   * Initializes CometD client
   * 
   * @return {Promise<Object>} Returns CometD client
   */
  createSocket(parsed) {
    const socket = new cometd.CometD()
    socket.configure({
      url: `https://kahoot.it/cometd/${parsed.pin}/${parsed.session}`
    })
    socket.websocketEnabled = true

    return new Promise((resolve, reject) => {
      socket.handshake((h) => {
        if (!h.successful) return reject(Error("session failed decoding"))
        socket.subscribe("/service/controller", m => emitter.emit("controller", m))
        socket.subscribe("/service/player", m => emitter.emit("player", m))
        socket.subscribe("/service/status", m => emitter.emit("status", m))

        resolve(socket)
      })
    })
  }

  /**
   * Checks existance of pin
   * 
   * @return {Promise<Object>} Returns object containing session information
   */
  checkSession() {
    return axios.get(`${this.proxy}https://www.kahoot.it/reserve/session/${this.pin}/?${Helpers.getTime()}`)
      .then((res) => {
        const sessionInfo = res.data
        const headers = res.headers
        const rawSession = headers["x-kahoot-session-token"]
        const solvedChallenge = Helpers.solveChallenge(sessionInfo.challenge)
        const twoFactor = sessionInfo.twoFactorAuth
        const session = Helpers.shiftBits(rawSession, solvedChallenge)

        this.twoFactor = twoFactor

        return {
          pin: this.pin,
          twoFactor: twoFactor,
          session: session
        }
      })
  }

  /**
   * Adds main player to the game, this is normally called after initialize to get other functions working.
   * Automatically bruteforces 2FA
   * 
   * @return {Promise<>} Returns when complete
   */
  doLogin(name) {
    this.sendPacket(
        "/service/controller", {
          gameid: this.pin,
          host: "kahoot.it",
          name: name,
          type: "login"
        })
      .then(() => {
        return new Promise((resolve, _) => {
          if (this.twoFactor) {
            setTimeout(() => {
              this.bruteForceTwoFactor()
              resolve()
            }, 350)
          }
        })
      })
  }

  /**
   * Adds a player to the game
   * 
   * @param {String} name The name of the player
   * @param {String} cid The unique id of the player, helper function randomCid can be used for this
   * @param {Boolean} isGhost Makes player ghost or normal
   * 
   * @return {Player} Returns object containing session information
   */
  addPlayer(name, cid, isGhost) {
    this.sendPacket(`/controller/${this.pin}`, {
      type: "joined",
      cid: cid,
      image: "@idiidk",
      name: name,
      isGhost: isGhost,
      completedTwoFactorAuth: 1
    })

    return new Player(this.cometd, cid, this.pin);
  }
}