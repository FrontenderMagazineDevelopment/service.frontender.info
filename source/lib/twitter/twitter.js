import fetch from 'isomorphic-fetch';
import crypto from 'crypto';
import OAuth from 'oauth-1.0a';

/**
 * @class Twitter — set of methods to work with twitter api using promises
 */
export default class Twitter {
  /**
     * @constructor
     */
  constructor() {

    this.config = {
      consumer_key: process.env.TWITTER_CUSTOMER_KEY,
      consumer_key_secret: process.env.TWITTER_CUSTOMER_KEY_SECRET,
      access_tocken: process.env.TWITTER_TOKEN,
      access_tocken_secret: process.env.TWITTER_TOKEN_SECRET,
    };

    this.oauth = OAuth({
      consumer: {
        key: this.config.consumer_key,
        secret: this.config.consumer_key_secret,
      },
      signature_method: 'HMAC-SHA1',
      hash_function: (baseString, key) =>
        crypto
          .createHmac('sha1', key)
          .update(baseString)
          .digest('base64'),
    });

    this.token = {
      key: this.config.access_tocken,
      secret: this.config.access_tocken_secret,
    };

    this.urls = {
      api: 'https://api.twitter.com/1.1/',
      search_users: 'users/search.json?page=1&count=2&q=',
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
    const url = this.urls.api + this.urls.search_users + encodeURIComponent(keyword);
    const options = {
      headers: this.oauth.toHeader(this.oauth.authorize({ url, method: 'GET' }, this.token)),
      json: true,
    };
    const response = await fetch(url, options);
    if (response.ok) {
      const json = await response.json();
      const users = json.map((user)=>{
        const { name, screen_name, entities, profile_image_url } = user;
        const urls = Object.values(entities).map((entitie)=> entitie.urls.map((uri)=>uri.expanded_url)).reduce((a, b)=>a.concat(b));
        return {
          name,
          login: screen_name,
          urls,
          profile_image_url,
        };
      });
      return users;
    }
    throw new Error(`${response.status} ${response.statusText}`);
  }
}
