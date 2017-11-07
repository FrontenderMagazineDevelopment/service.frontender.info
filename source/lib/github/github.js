const fetch = require('isomorphic-fetch');

/**
 * @class Github — set of methods to work with github api using promises
 */
export default class Github {
  /**
   * @constructor
   */
  constructor() {

    this.urls = {
      api: 'https://api.github.com/',
      search_users: 'search/users',
      users: 'users/',
    };

    this.headers = {
      Authorization: `token ${  process.env.GITHUB_SECRET_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      userAgent: `UserCrowler/${  process.env.VERSION}`,
    };
  }

  /**
   * Search for users
   * @param {Array} keywords
   * @return {Promise}
   */
  searchForUsers(keywordsList) {
    const keywords = (!Array.isArray(keywordsList) && typeof keywordsList === 'string') ? new Array(keywordsList) : keywordsList;
    const promises = keywords.map((keyword)=>this.searchForUser(keyword));
    return Promise.all(promises);
  }

  /**
   * Search for user
   * @param {String} keyword
   * @return {Promise}
   */
  async searchForUser(keyword) {
    const options = {
      method: 'GET',
      headers: this.headers,
    };
    const response = await fetch(`${this.urls.api + this.urls.search_users  }?q=${encodeURIComponent(keyword)}`, options);
    if (response.ok) {
      const user = await response.json();
      return user.items;
    }
    throw new Error(`${response.status} ${response.statusText}`);
  }

  /**
   * Get user information
   * @param {String} login
   * @return {Promise}
   */
  async getUser(userLogin) {
    const options = {
      method: 'GET',
      headers: this.headers,
    };
    const response = await fetch(this.urls.api + this.urls.users + encodeURIComponent(userLogin), options);
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const json = await response.json();
    const { login, blog, name, email, avatar_url, gravatar_id, company } = json;
    return { login, blog, name, email, avatar_url, gravatar_id, company };
  }
}
