import _ from 'lodash';
import minimist from 'minimist';
import inquirer from 'inquirer';
import { Observable } from 'rxjs';

const discoverSubCommand = stream => stream
    .map(args => ({
        command: args._[0] || '',
        params: _.extend(args, {
            _: args._.slice(1),
        }),
    }));

const prompts = {
    blog: [
        {
            name: 'post',
            message: 'Write the blog post...',
            type: 'editor',
        },
        {
            name: 'name',
            message: 'What is the name of this post?',
            type: 'input',
        },
        {
            name: 'publish',
            message: 'Would you like to publish this post?',
            type: 'confirm',
            default: false,
        },
    ],
};

const getPrompts = stream => stream
    .map(service => prompts[service.command]);

Observable
    .of(process.argv.slice(2))
    .map(minimist)
    .let(discoverSubCommand)
    .let(getPrompts)
    .subscribe(prompts => inquirer
        .prompt(prompts)
        .then(console.log)
    );
