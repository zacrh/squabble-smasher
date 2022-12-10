const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const { range } = require('rxjs');
const inquirer = require('./inquirer');
const { default: Squabble } = require('./squabble');
const squabble = require('./squabble');
const { ConcurrentTaskQueue } = require('./tasks');
const Configstore = require('configstore');

const conf = new Configstore('account');

clear();

console.log(
    chalk.magenta(
      figlet.textSync('Squabble Smasher', { font: 'roman', horizontalLayout: 'default' })
    )
  );

var originalConsoleLog = console.log;
console.log = function() {
    args = [];
    args.push( "[SQUABBLE BOT]" + "[" + new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') + "]" );
    // Note: arguments is part of the prototype
    for( var i = 0; i < arguments.length; i++ ) {
        args.push( arguments[i] );
    }
    originalConsoleLog.apply( console, args );
};
const run = async () => {
  const account = await inquirer.askAccount();
  let credentials = {}
  if (account.account === true) {
    credentials = await inquirer.askSquabbleCredentials();
    conf.set('account.credentials', credentials)
    console.log(conf.get('account.credentials'))
    //console.log(credentials)
  }
  const method = await inquirer.askMethod();
  let security = {}
  let code = {}
  let gameMode = {}
  if (method.method === "Create") {
    security = await inquirer.askSecurity();
    gameMode = await inquirer.askGameMode();
    //console.log(security)
  } else if (method.method === "Join") {
    code = await inquirer.askCode();
  } else if (method.method === "Find") {
    gameMode = await inquirer.askGameMode();
  }
  const displayName = await inquirer.askDisplayName();
  //console.log(account, gameMode, displayName);

  //const tasks = await inquirer.askTasks();

//   let tasks_arr = []
//     for (i in range(0, tasks)) {
//         tasks_arr.push(new squabble.Squabble(gameMode.gameMode, displayName.displayName, method.method, security.security, credentials.credentials))
//     }

//     const batchSize = 2;
//     const taskQueue = new ConcurrentTaskQueue(tasks_arr, batchSize)

//     taskQueue.runTasks()
//         .then(([res1, res2, res3, res4]) => {
//             console.log(res1, res2, res3, res4);
//         });
  new squabble.Squabble(gameMode.gameMode, displayName.displayName, method.method, security.security, code.code, credentials.credentials);
};



// const batchSize = 2;
// const taskQueue = new ConcurrentTaskQueue([
//   // wrap all functions to prevent direct execution
//   () => costlyFunction(10),
//   () => costlyFunction(20),
//   () => costlyFunction(100),
//   () => costlyFunction(50),
// ], batchSize);
// taskQueue.runTasks()
//   .then(([res1, res2, res3, res4]) => {
//     console.log(res1, res2, res3, res4);
//   });

run();