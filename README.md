# Adot Task

**Not for illegal use**

This tool is designed exclusively for theoretical use in public archival projects and is not intended to be used for for-profit activities.

Examples of fair use:
 - tracking your own social media presence
 - archiving or backing up sensitive content to protect against persecution

Examples of bad use:
 - stealing data (i.e. selling large scale analytics)
 - infringing on personal privacy (i.e. "stalking")

Please consult with a legal professional before engaging in any form of web-crawling or data-gathering activities.

## Koii Tasks

Koii tasks are community based activities where participants run common code on their local machines. This repo provides an example of how to use headless browsers and DOM manipulation to automate user actions, using tasks, to provide new possibilities for community coordination.

In the Koii architecture, community nodes run tasks and generate 'submissions' which they submit to claim rewards. When a submission is posted to the network, other nodes verify, or 'audit' that submission, and then choose whether to approve rewards. See `twitter-task.js` for the task implementation. 

## What's in the Project?
This is an implementation of the default data-gatherer class of Koii tasks.

There are four main components, detailed in the adapter file: `adapters/twitter/twitter.js`
1. Negotiate Session
2. Fetch a list
3. Fetch an item
4. Fetch a list from an item

The repo also contains a host of test files, most importantly `test/test-one-round.js` which details the full flow of one [gradual consensus](https://docs.koii.network/develop/koii-task-101/what-are-tasks/gradual-consensus) round. 

Run the test with 
```
yarn or npm install
yarn test or npm run test
```

## Using The Crawler
To modify the crawler query, or change how it uses the local database, open `twitter-task.js`.

The `query` object manages the key parts of the crawler.

```javascript
let searchTerm = "#web3";
let query = {
    limit: 100, // total number of records to return
    searchTerm: searchTerm, // the keyword to look for
    query: `https://twitter.com/search?q=${ searchTerm }&src=typed_query`, // the query string (including said keyword)
    depth: 3, // the depth of recursive layers to follow 
    recursive: true, // descend recursively?
    updateRound: () => {} // a function that returns the current round
    round: 1 // the current round
}
```

## Modifying the Task
Check `config-task.yaml` for the deployment config. Check [here](https://docs.koii.network/develop/command-line-tool/create-task-cli#using-config-yml) for more information on the config file.

## Deploying to Koii
Use the `create-task-cli` to build and deploy your task. Check [here](https://docs.koii.network/develop/command-line-tool/create-task-cli) for more information on the cli.

```bash
 #uploads your task executable to IPFS and starts it on Koii Node
npx @_koii/create-task-cli@latest
```

## Running on Koii Node

After deploying your task, you can run it on the Koii Node with your task ID. Check [here](https://docs.koii.network/run-a-node/task-nodes/how-to-run-a-koii-node) for more information about the how to install and run the Koii Node.
