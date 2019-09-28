import http from '../http';

export default class WebApi {
  constructor(endpoint = 'https://create.kahoot.it/rest', proxy) {
    this.endpoint = endpoint;
    this.proxy = proxy;

    this.accessToken = null;
  }

  authenticate(username, password) {
    return http.post(`${this.proxy}${this.endpoint}/authenticate`, {
      grant_type: 'password',
      username,
      password,
    }).then((res) => {
      if (res.error) {
        throw new Error(res.error);
      } else if (res.access_token) {
        this.accessToken = res.access_token;
      }

      http.defaults.headers.common.Authorization = `Bearer ${this.accessToken}`;
      return this.accessToken;
    });
  }

  getKahoot(uuid) {
    return http.get(`${this.proxy}${this.endpoint}/kahoots/${uuid}`).then((res) => res.data);
  }

  searchKahoots(query, limit = 25) {
    return http.get(`${this.proxy}${this.endpoint}/kahoots/?query=${query}&cursor=0&limit=${limit}&orderBy=relevance`)
      .then((res) => res.data);
  }
}
