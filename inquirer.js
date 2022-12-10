const inquirer = require('inquirer');

module.exports = {
    askAccount: () => {
			const questions = [
				{
					type: 'confirm',
					name: 'account',
					message: 'Do you have an account you want to use?',
					default: false
				}
			];
			return inquirer.prompt(questions);
    },
    askSquabbleCredentials: () => {
			const questions = [
				{
					name: 'email',
					type: 'input',
					message: 'Enter your Squabble.me e-mail address:',
					validate: function( value ) {
						if (value.length) {
						return true;
						} else {
						return 'Please enter your Squabble.me e-mail address:';
						}
					}
				},
				{
					name: 'password',
					type: 'password',
					mask: '*',
					message: 'Enter your password:',
					validate: function(value) {
						if (value.length) {
						return true;
						} else {
						return 'Please enter your password.';
						}
					}
				}
			];
			return inquirer.prompt(questions);
    },
  askMethod: () => {
    const questions = [
      {
        type: 'list',
        name: 'method',
        message: "Select whether you'd like to create or find a game.",
        choices: ["Find", "Join", "Create"],
        default: ['Find']
      }
    ];
    return inquirer.prompt(questions);
  },
  askCode: () => {
    const questions = [
      {
        type: 'input',
        name: 'code',
        message: 'Enter the code of the game you would like to join.',
        validate: function( value ) {
          if (value.length) {
            return true;
          } else {
            return 'Please enter the code of the game you would like to join.';
          }
        }
      }
    ];
    return inquirer.prompt(questions);
  },
  askGameMode: () => {
    const questions = [
      {
        type: 'list',
        name: 'gameMode',
        message: 'Select the gamemode you want to play:',
        choices: ["Blitz", "Squabble Royale"],
        default: ['Blitz']
      }
    ];
    return inquirer.prompt(questions);
  },
  askSecurity: () => {
    const questions = [
      {
        type: 'list',
        name: 'security',
        message: 'Select the lobby security:',
        choices: ["Public", "Private"],
        default: ['Public']
      }
    ];
    return inquirer.prompt(questions);
  },
  askDisplayName: () => {
    const questions = [
      {
        type: 'input',
        name: 'displayName',
        message: 'Enter a name for the accounts.',
        validate: function( value ) {
          if (value.length) {
            return true;
          } else {
            return 'Please enter a name for the accounts.';
          }
        }
      }
    ];
    return inquirer.prompt(questions);
  },
	askTasks: () => {
    const questions = [
      {
        type: 'number',
        name: 'tasks',
        message: 'Enter the ammount of tasks you want to run. (1-20)',
        validate: function( value ) {
          if (value.length) {
						if (value >= 1 && value <= 20) {
							return true;
						} else {
							value = ""
							return 'Please enter a valid amount of tasks. (1-20)';
						}
          } else {
            return 'Please enter the amount of tasks you want to run. (1-20)';
          }
        }
      }
    ];
    return inquirer.prompt(questions);
	},
}