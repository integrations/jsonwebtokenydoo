# jsonwebtokenydoo

Command line utility that assists with GitHub App Authentication

![jsonwebtokenydoo](https://user-images.githubusercontent.com/7718702/39935423-debeff6a-5540-11e8-8f4c-e3a347c415a4.gif)

## Installation

* Install as dev dependency: `npm install --save-dev jsonwebtokenydoo`
* Run using `ghtoken`

This installation assumes that the current `/node_modules/.bin` is in your `PATH`. If you don't have this set up already you can add the following to your `~/.bashrc` or `~/.zshrc`:

```
export PATH=${PATH}:node_modules/.bin/
```

`jsonwebtokenydoo` assumes that you have a private key (.pem file) in your current directory or that you have a `PRIVATE_KEY` or `PRIVATE_KEY_PATH` environment variable set via your `.env` file. This is the default pattern for [Probot apps](https://github.com/probot/probot).

`jsonwebtokenydoo` will automatically detect your app id if it's set as an `APP_ID` environment variable via your `.env` file. If it can't detect your app id, it will ask you for it.

## Run directly

Don't want to install `jsonwebtokenydoo` as a dev dependency?
You can run it directly with `npx jsonwebtokenydoo`

Note that `jsonwebtokenydoo` still expects a private key (.pem file) in your current directory or a `PRIVATE_KEY` or `PRIVATE_KEY_PATH` environment variable set via your `.env` file.
