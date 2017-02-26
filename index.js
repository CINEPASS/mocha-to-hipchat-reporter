#!/usr/bin/env node

const path = require('path')
const Hipchatter = require('hipchatter')
const program = require('commander')
const configValidator = require('./config-validator')
const colors = require('colors')

program._name = ' ' // hack usage output

program
  .version(require('./package.json').version)
  .usage('mocha test --reporter json | index.js [options]')
  .option('-v, --verbose', 'Enable verbose logging')
  .option('-d, --dry-run', 'Skip posting to HipChat if errors occoured')
  .option('-c, --config <config_file>', 'Config for the HipChat connection')
  .parse(process.argv)


function notifyHipchat (msg, config) {
  var hipchatter = new Hipchatter(config.hipchat.token)
  hipchatter.notify(config.hipchat.channel, {
    message: msg,
    color: config.hipchat.color || 'red',
    token: config.hipchat.token,
    notify: true
  }, function (err) {
    if (err == null) {
      if (program.verbose >= 1) {
        console.log('Successfully posted to HipChat room')
      }
    } else {
      console.error('Failed to notify HipChat room. Error: ', err)
    }
  })
}

function main (params) {
  if (!program.config) {
    console.log()
    console.error('  Error: Missing config')
    program.outputHelp()
    process.exit(1)
  }

  var config = require(path.join(path.resolve(), program.config))
  configValidator.validateConfig(config)

  process.stdin.resume()
  process.stdin.setEncoding('utf8')

  var parsedData = ''

  process.stdin.on('data', function (data) {
    parsedData += data
  })

  process.stdin.on('end', function () {
    var dataJson = JSON.parse(parsedData)
    if (program.verbose) console.log('Found ' + dataJson.failures.length + ' failed tests')

    if (dataJson.failures.length === 0) {
      program.verbose && console.log('No errors found')
      return
    }

    var msg = '<b>Found ' + dataJson.failures.length + ' failed tests</b>'
    msg = msg.concat('<br>')
    dataJson.failures.forEach(function (entry) {
      if (program.verbose) {
        console.log(colors.red('✕'), entry.fullTitle)
        console.log(colors.gray(entry.err.message))
      }
      msg = msg.concat('<span style="color: red">✕</span> ', entry.fullTitle + '<br><span style="color: gray">' + entry.err.message + '</span><br><br>')
    })

    program.verbose && console.log()
    if (!program.dryRun) {
      program.verbose && console.log('Notifying via Hipchat')
      notifyHipchat(msg, config)
    } else {
      console.log('Skip posting to HipChat due to dry run.')
    }
  })
}

main()
