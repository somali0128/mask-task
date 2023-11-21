const Twitter = require('./adapters/twitter/twitter.js');
const db = require('./helpers/db');
const { Web3Storage } = require('web3.storage');
const Data = require('./model/data');
const dotenv = require('dotenv');
const { default: axios } = require('axios');
const { namespaceWrapper } = require('./namespaceWrapper');
dotenv.config();

/**
 * TwitterTask is a class that handles the Twitter crawler and validator
 *
 * @description TwitterTask is a class that handles the Twitter crawler and validator
 *              In this task, the crawler asynchronously populates a database, which is later
 *              read by the validator. The validator then uses the database to prepare a submission CID
 *              for the current round, and submits that for rewards.
 *
 *              Four main functions control this process:
 *              @crawl crawls Twitter and populates the database
 *              @validate verifies the submissions of other nodes
 *              @getRoundCID returns the submission for a given round
 *              @stop stops the crawler
 *
 * @param {function} getRound - a function that returns the current round
 * @param {number} round - the current round
 * @param {string} searchTerm - the search term to use for the crawler
 * @param {string} adapter - the adapter to use for the crawler
 * @param {string} db - the database to use for the crawler
 *
 * @returns {TwitterTask} - a TwitterTask object
 *
 */

class TwitterTask {
  constructor(getRound, round) {
    this.round = round;
    this.lastRoundCheck = Date.now();
    this.isRunning = false;
    this.searchTerm = ['adot_web3', 'koii', 'Arweave'];
    this.adapter = null;
    this.db = new Data('db', []);
    this.db.initializeData();
    this.initialize();

    this.setAdapter = async () => {
      const username = process.env.TWITTER_USERNAME;
      const password = process.env.TWITTER_PASSWORD;

      if (!username || !password) {
        throw new Error(
          'Environment variables TWITTER_USERNAME and/or TWITTER_PASSWORD are not set',
        );
      }

      let credentials = {
        username: username,
        password: password,
      };
      this.adapter = new Twitter(credentials, this.db, 3);
      await this.adapter.negotiateSession();
    };

    this.updateRound = async () => {
      // if it has been more than 1 minute since the last round check, check the round and update this.round
      if (Date.now() - this.lastRoundCheck > 60000) {
        this.round = await getRound();
        this.lastRoundCheck = Date.now();
      }
      return this.round;
    };
    this.start();
  }

  async initialize() {
    console.log('initializing twitter task');
    this.searchTerm = await this.fetchSearchTerms();
    //Store this round searchTerm
    console.log('creating search term', this.searchTerm, this.round);
    this.db.createSearchTerm(this.searchTerm, this.round);
  }

  /**
   * fetchSearchTerms
   * @description return the search terms to use for the crawler
   * @returns {array} - an array of search terms
   */
  async fetchSearchTerms() {
    let keywords;

    try {
      const response = await axios.get(
        'https://crawltask-test-e4cfb6acc7b6.herokuapp.com/',
      );
      keywords = response.data;
    } catch (error) {
      console.log(
        'No Keywords from middle server, loading local keywords.json'
      );
      keywords = require('./keywords.json'); // Load local JSON data
    }

    let termCounts = {};
    for (let keyword of keywords) {
      let encodedKeyword = encodeURIComponent(keyword);
      termCounts[encodedKeyword] = 0;
    }

    let shuffled = Object.keys(termCounts).sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 10);
  }

  /**
   * strat
   * @description starts the crawler
   *
   * @returns {void}
   *
   */
  async start() {
    await this.setAdapter();

    // await db.initializeData();

    this.isRunning = true;
console.log(this.searchTerm)
    let limitPerTerm = Math.floor(500 / this.searchTerm.length);

    for (let term of this.searchTerm) {
      let query = {
        limit: limitPerTerm,
        searchTerm: term,
        query: `https://twitter.com/DonaldTNews`,
        depth: 3,
        updateRound: async () => {
          return this.updateRound();
        },
        recursive: true,
        round: this.round,
      };
      await this.adapter.crawl(query);
    }
  }

  /**
   * stop
   * @description stops the crawler
   *
   * @returns {void}
   */
  async stop() {
    this.isRunning = false;
    this.adapter.stop();
  }

  /**
   * getRoundCID
   * @param {*} roundID
   * @returns
   */
  async getRoundCID(roundID) {
    console.log('starting submission prep for round', roundID);
    let result = await this.adapter.getSubmissionCID(roundID);
    console.log('returning round CID', result, 'for round', roundID);
    return result;
  }

  /**
   * getJSONofCID
   * @description gets the JSON of a CID
   * @param {*} cid
   * @returns
   */
  async getJSONofCID(cid) {
    return await getJSONFromCID(cid);
  }

  /**
   * validate
   * @description validates a round of results from another node against the Twitter API
   * @param {*} proofCid
   * @returns
   */
  async validate(proofCid) {
    // in order to validate, we need to take the proofCid
    // and go get the results from web3.storage

    let data = await getJSONFromCID(proofCid); // check this
    // console.log(`validate got results for CID: ${ proofCid } for round ${ roundID }`, data, typeof(data), data[0]);

    // the data submitted should be an array of additional CIDs for individual tweets, so we'll try to parse it

    let proofThreshold = 4; // an arbitrary number of records to check

    for (let i = 0; i < proofThreshold; i++) {
      let randomIndex = Math.floor(Math.random() * data.length);
      let item = data[randomIndex];
      let result = await getJSONFromCID(item.cid);

      // then, we need to compare the CID result to the actual result on twitter
      // i.e.
      console.log('item was', item);

      // need to check if there's an active session and set one if not
      let twitterCheck;
      let sessionValid = await this.adapter.checkSession();
      if (item.id) {
        if (sessionValid) {
          console.log('about to parse item on twitter', item.id);
          twitterCheck = await this.adapter.parseItem(item.id); // update to suit the adapter
        } else {
          console.error('could not negotiate a twitter session to validate');
        }

        // TODO - revise this check to make sure it handles issues with type conversions
        console.log('ipfs', item);
        let ipfsCheck = await this.getJSONofCID(item.cid);
        console.log('ipfsCheck', ipfsCheck);
        console.log('twitterCheck', twitterCheck);
        console.log(
          'data !== twitterCheck',
          ipfsCheck.content !== twitterCheck.content,
        );
        if (ipfsCheck.content !== twitterCheck.content) {
          return false;
        }
      } else {
        console.log('invalid item id', item.id);
        return false;
      }
    }

    // if none of the random checks fail, return true
    return true;
  }
}

module.exports = TwitterTask;

/**
 * getJSONFromCID
 * @description gets the JSON from a CID
 * @param {*} cid
 * @returns promise<JSON>
 */
const getJSONFromCID = async cid => {
  return new Promise((resolve, reject) => {
    let url = `https://${cid}.ipfs.dweb.link/data.json`;
    // console.log('making call to ', url)
    axios.get(url).then(response => {
      if (response.status !== 200) {
        console.log('error', response);
        reject(response);
      } else {
        // console.log('response', response)
        resolve(response.data);
      }
    });
  });
};
