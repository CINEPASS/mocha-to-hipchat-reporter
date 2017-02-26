# mocha-to-hipchat-reporter
Command-line tool that parses mocha json output and reports failed test to Hipchat

## Install

`[sudo] npm install -g mocha-to-hipchat-reporter`

## Usage

All it needs is running the mocha tests with the `json` reporter and pipe it into `mocha-to-hipchat-reporter`, 
which requires a config for connecting to hipchat.

`mocha --reporter json | mocha-to-hipchat-reporter -c config.json`

### Config template

```json
{
  "hipchat": {
    "token": "",
    "channel": ""
  }
}
```
