# Twitter Crawler CLI Tool for Koii Network

## Project Overview

The Twitter Crawler is a specialized command-line interface (CLI) tool designed for community-driven data archival and gathering on the Koii Network. It provides a robust, ethical method for collecting Twitter data using headless browsers and distributed task processing.

🔍 **Key Features:**
- Automated Twitter search and data collection
- Configurable crawling depth and search parameters
- Decentralized task execution via Koii Network
- Ethical data gathering with strict usage guidelines

### Use Cases
- Academic research and social media trend analysis
- Personal social media archiving
- Content tracking for community projects
- Public interest data preservation

## Installation

### Prerequisites
- Node.js (v14+ recommended)
- Yarn or npm package manager

### Install Methods

#### Option 1: Direct Installation
```bash
# Clone the repository
git clone https://github.com/your-org/twitter-crawler.git
cd twitter-crawler

# Install dependencies
yarn install
# or
npm install
```

#### Option 2: Koii Task CLI
```bash
# Install Koii Task CLI globally
npm install -g @_koii/create-task-cli
```

## Usage

### Basic Search
```bash
# Search for tweets with a specific hashtag
node twitter-task.js --search "#koii" --limit 100
```

### Advanced Crawling
```bash
# Perform a recursive search with custom depth
node twitter-task.js \
  --search "#web3" \
  --limit 250 \
  --depth 3 \
  --recursive true
```

### Configuration Options
You can modify the crawler's behavior by editing the `query` object in `twitter-task.js`:

```javascript
let query = {
    limit: 100,        // Total records to return
    searchTerm: "#koii", 
    query: "https://twitter.com/search?q=#koii&src=typed_query",
    depth: 3,          // Recursive layers
    recursive: true,   // Enable recursive searching
    round: 1           // Current processing round
}
```

## Command Reference

| Option         | Description                     | Default | Type    |
|----------------|----------------------------------|---------|---------|
| `--search`     | Search term/hashtag             | None    | String  |
| `--limit`      | Maximum records to retrieve     | 100     | Number  |
| `--depth`      | Recursive search depth          | 1       | Number  |
| `--recursive`  | Enable multi-level searching    | false   | Boolean |

## Deployment to Koii Network

```bash
# Build task executable
yarn webpack

# Deploy to Koii Network
npx @_koii/create-task-cli@latest
```

## Project Structure
- `index.js`: Main application entry point
- `twitter-task.js`: Core task implementation
- `adapters/twitter/twitter.js`: Twitter interaction logic
- `tests/`: Comprehensive test suite

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Running Tests
```bash
yarn test
```

## Ethical Guidelines

🚨 **Important**: This tool is intended for legitimate, legal, and ethical data gathering. Prohibited uses include:
- Commercial data exploitation
- Personal privacy invasion
- Unauthorized mass data collection

Always consult legal professionals and respect platform terms of service.

## License

This project is licensed under the ISC License. See the LICENSE file for details.

## Resources
- [Koii Network Documentation](https://docs.koii.network)
- [Task Deployment Guide](https://blog.koii.network/How-to-deploy-a-koii-task-in-less-than-5mins/)

---

*Developed with ❤️ by the Koii Network Community*