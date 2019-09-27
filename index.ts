#!/usr/bin/env npx ts-node

import chalk from "chalk";
import clear from "clear";
import figlet from "figlet";
import Octokit from "@octokit/rest";

import {
  directoryExists,
  askGithubCredentials,
  getStoredGithubToken,
  askTwoFactorAuthCode,
  registerNewToken,
  githubAuth,
  createRemoteRepo,
  createGitIgnore,
  setupRepo
} from "./lib";
let octokit: Octokit;
clear();

// logo
console.log(
  chalk.hex("8167ea")(
    figlet.textSync("Glint", { horizontalLayout: "full", font: "Isometric1" })
  )
);

// check for the existence of a .git folder
if (directoryExists(".git")) {
  console.log(chalk.red("And I oop-, already a git repo"));
  process.exit();
}

const setGithubCredentials = async () => {
  const credentials = await askGithubCredentials();
  octokit = new Octokit({
    auth: {
      ...credentials,
      async on2fa(): Promise<string> {
        return await askTwoFactorAuthCode();
      }
    }
  });
  return octokit;
};

const getGithubToken = async () => {
  let token = await getStoredGithubToken();
  if (token) {
    return token;
  }
  // No token found, use credentials to access github account
  await setGithubCredentials();

  // Register new token
  token = await registerNewToken(octokit);
  return token;
};

const run = async () => {
  try {
    // Retrieve and Set authentication token
    const token = await getGithubToken();
    octokit = await githubAuth(token);

    // Create remote repository
    const url = await createRemoteRepo(octokit);

    // Create .gitignore file
    await createGitIgnore();

    // Set up local repository and push to remote
    const done = await setupRepo(url);

    if (done) {
      console.log(
        chalk.hex("ff8cff")(
          figlet.textSync("DONE!", {
            horizontalLayout: "full",
            font: "Ghost"
          })
        )
      );
    }
  } catch (err) {
    if (err) {
      const errMessage = `Error code: ${err.status}. `;
      switch (err.status) {
        case 401:
          console.log(
            chalk.red(
              `${errMessage}Couldn't log you in. Please provide correct credentials/token.`
            )
          );
          break;
        case 422:
          console.log(
            chalk.red(
              `${errMessage}There already exists a remote repository with the same name`
            )
          );
          break;
        default:
          console.log(err);
      }
    }
  }
};

run();
