#!/usr/bin/env node

const inquirer = require("inquirer");
const jwt = require("jsonwebtoken");
const chalk = require("chalk");
const axios = require("axios");
require("dotenv").config();

const { findPrivateKey } = require("../lib/private-key");

function printInstallationCurl(jwt, url, resourceNameOrId) {
  const completeUrl = url.replace(":something", chalk.bold(resourceNameOrId));
  console.log(
    chalk.grey("\nMaking request to get installation id:\n"),
    "curl -i \\\n",
    `-H "Authorization: Bearer ${chalk.green(jwt)}" \\\n`,
    '-H "Accept: application/vnd.github.machine-man-preview+json" \\\n',
    completeUrl
  );
}

async function main() {
  let appId = process.env.APP_ID;
  if (!appId) {
    ({ appId } = await inquirer.prompt([
      {
        type: "input",
        name: "appId",
        message:
          "Could not automatically find your APP_ID. Please enter your app id"
      }
    ]));
  }
  if (!appId) {
    console.log("You need to enter an app id to use this tool.");
    process.exit(1);
  }
  const cert = findPrivateKey();
  const signedJWT = jwt.sign(
    {
      iat: Math.floor(new Date() / 1000), // Issued at time
      exp: Math.floor(new Date() / 1000) + 60, // JWT expiration time
      iss: appId
    },
    cert,
    { algorithm: "RS256" }
  );
  const config = {
    headers: {
      Authorization: `Bearer ${signedJWT}`,
      Accept: "application/vnd.github.machine-man-preview+json"
    }
  };
  console.log(
    `${chalk.bold("Signed JWT (valid for 60 minutes)")}\n${chalk.green(
      signedJWT
    )}\n\n`
  );
  let { installationId } = await inquirer.prompt([
    {
      type: "input",
      name: "installationId",
      message: "Do you know the installation id? (Leave blank if not)"
    }
  ]);
  if (!installationId) {
    const { resource } = await inquirer.prompt([
      {
        type: "list",
        name: "resource",
        message:
          "Based on which resource do you want to generate an installation token?",
        choices: ["user", "org", "repo"]
      }
    ]);
    const idQuestion = {
      type: "list",
      name: "idAnswer",
      message: `Do you have the ${resource} id or the ${resource} name?`,
      choices: ["id", "name"]
    };
    let idAnswer;
    if (resource === "user" || resource === "org") {
      ({ idAnswer } = await inquirer.prompt(idQuestion));
    }

    const { resourceNameOrId } = await inquirer.prompt([
      {
        type: "input",
        name: "resourceNameOrId",
        message: `Please enter the ${resource} ${idAnswer}`
      }
    ]);
    let response;
    try {
      if (resource === "user") {
        if (idAnswer === "name") {
          printInstallationCurl(
            signedJWT,
            "https://api.github.com/users/:something/installation",
            resourceNameOrId
          );
          response = await axios.get(
            `https://api.github.com/users/${resourceNameOrId}/installation`,
            config
          );
        } else {
          printInstallationCurl(
            signedJWT,
            "https://api.github.com/user/:something/installation",
            resourceNameOrId
          );
          response = await axios.get(
            `https://api.github.com/user/${resourceNameOrId}/installation`,
            config
          );
        }
      } else if (resource == "org") {
        if (idAnswer === "name") {
          printInstallationCurl(
            signedJWT,
            "https://api.github.com/orgs/:something/installation",
            resourceNameOrId
          );
          response = await axios.get(
            `https://api.github.com/orgs/${resourceNameOrId}/installation`,
            config
          );
        } else {
          printInstallationCurl(
            signedJWT,
            "https://api.github.com/organizations/:something/installation",
            resourceNameOrId
          );
          response = await axios.get(
            `https://api.github.com/organizations/${resourceNameOrId}/installation`,
            config
          );
        }
      } else {
        printInstallationCurl(
          signedJWT,
          "https://api.github.com/repositories/:something/installation",
          resourceNameOrId
        );
        response = await axios.get(
          `https://api.github.com/repositories/${resourceNameOrId}/installation`,
          config
        );
      }
    } catch (e) {
      console.log(e.response);
      process.exit(1);
    }
    installationId = response.data.id;
    console.log(chalk.bold("Installation id:"), installationId);
  }
  console.log(
    chalk.grey("\nMaking request to generate installation token:\n"),
    "curl -i -X POST \\\n",
    `-H "Authorization: Bearer ${chalk.green(signedJWT)}" \\\n`,
    '-H "Accept: application/vnd.github.machine-man-preview+json" \\\n',
    `https://api.github.com/installations/${chalk.bold(
      installationId
    )}/access_tokens`
  );
  let data;
  try {
    ({ data } = await axios.post(
      `https://api.github.com/installations/${installationId}/access_tokens`,
      null,
      config
    ));
  } catch (e) {
    console.log(e.response);
    process.exit(1);
  }
  console.log(
    chalk.bold("\nYour installation token"),
    "\n",
    JSON.stringify(data, null, 4)
  );
  console.log(
    `Go forth and make requests with your ✨ ${chalk.keyword("orange")(
      "tokens"
    )} ✨`
    // here is a request you can make to get you started
  );
}

main();
