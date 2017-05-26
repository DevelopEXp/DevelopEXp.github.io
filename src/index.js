import _ from 'lodash';
import Vinyl from 'vinyl';
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

const convertToFile = stream => stream
    .map(data => (new Vinyl({
        base: `./${data.publish ? 'blog' : 'drafts'}/`,
        path: `./${data.publish ? 'blog' : 'drafts'}/${data.name}.json`,
        contents: new Buffer(JSON.stringify(data, null, 4)),
    })));

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
    .filter(service => _.includes(_.keys(prompts), service.command))
    .map(service => prompts[service.command]);

Observable
    .of(process.argv.slice(2))
    .map(minimist)
    .let(discoverSubCommand)
    .let(getPrompts)
    .mergeMap(prompts => Observable
        .fromPromise(inquirer.prompt(prompts))
    )
    .let(convertToFile)
    .subscribe(console.log);
