import axios from "axios"

/**
 * Information class, used for communication with
 * Kahoot quiz gateway
 *
 * @class Information
 */
export default class Information {

    constructor() {
        this.client = axios.create({
            baseURL: 'https://create.kahoot.com'
        });
    }
    /**
     * Authenticates to kahoot, must be called first
    * @param {String} username Username to login to create.kahoot.com
    * @param {String} password Password to login to create.kahoot.com
    * @return {Promise<Error>} Error
    */
    authenticate(username, password, callback) {
        headers = {
            "x-kahoot-login-gate": "enabled",
            "Content-Type": "application/json"
        }
        data = {
            user_name: username,
            password: password,
            grant_type: "password"
        }
        this.client.post("/rest/authenticate", data, {headers: headers})
        .catch((error) => {
            callback(error);
        })
        .then((resp) => {
            const response = resp.response.data;
            this.bearer_token = response.access_token;
            this.token_expiration = response.expires;
            this.client.headers["Authorization"] = "Bearer " + response.access_token;
            callback(null);
        })
    }
    /**
     * Searches kahoots for the specified term
     * @param {String} query search term
     * @param {Promise<Object>} callback axios response
     */
    search(query, callback) {
        params = {
            query: query.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ""),
            _: new Date().getTime(),
            limit: 100
        }
        callback(this.client.get("/rest/kahoots/search/public", {params: params}))
    }
    /**
     * Searches kahoots for the specified term
     * @param {String} uuid game id
     * @param {Promise<Object>} callback axios response
     */
    getGame(callback) {
        params = {
            _: new Date().getTime()
        }
        callback(this.client.get("/rest/kahoots/uuid", {params: params}))
    }
}