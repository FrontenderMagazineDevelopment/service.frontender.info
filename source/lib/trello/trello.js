const fetch = require('node-fetch');

/**
 * @class Trello — set of methods to work with trello api using promises
 */
export default class Trello {
  /**
     * @constructor
     */
  constructor() {
    this.options = {
      key: process.env.TRELLO_KEY,
      token: process.env.TRELLO_TOKEN,
    };

    this.urls = {
      api: 'https://api.trello.com/1/',
      search_users: `search/members/?key=${ this.options.key }&token=${ this.options.token }`,
    };
  }

  /**
     * Search for users
     * @param {Array} keywords
     * @return {Promise}
     */
  searchForUsers(keywordsList) {
    const keywords = (!Array.isArray(keywordsList) && typeof keywordsList === 'string') ? new Array(keywordsList) : keywordsList;
    const promises = keywords.map((keyword)=> this.searchForUser(keyword));
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
    };
    const response = await fetch(
      `${this.urls.api + this.urls.search_users}&query=${encodeURIComponent(keyword)}`,
      options,
    )
    if (response.ok) {
      const json = await response.json();
      const users = json.map((user)=>{
        const { username, fullName, email, avatarHash, gravatarHash } = user;
        return { login: username, name: fullName, email, avatarHash, gravatarHash };
      });
      return users;
    }
    throw new Error(`${response.status} ${response.statusText}`);
  }
}
