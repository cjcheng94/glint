import _ from "lodash";
import fs from "fs";
import CLI from "clui";
import touch from "touch";
import Octokit = require("@octokit/rest");
import simplegit from "simple-git/promise";
import { askRepodetails, askIgnoreFiles } from "./inquirer";

const git = simplegit();
const Spinner = CLI.Spinner;

export const createRemoteRepo = async (instance: Octokit) => {
  const github = instance;
  const answers = await askRepodetails();

  const data = {
    name: answers.name,
    description: answers.description,
    private: answers.visibility === "private"
  };
  const status = new Spinner("Creating remote repo...");

  status.start();

  try {
    const response = await github.repos.createForAuthenticatedUser(data);
    return response.data.ssh_url;
  } catch (err) {
    throw err;
  } finally {
    status.stop();
  }
};

export const createGitIgnore = async () => {
  const fileList = _.without(fs.readdirSync("."), ".git", ".gitignore");

  if (fileList.length) {
    const answers = await askIgnoreFiles(fileList);
    if (answers.ignore.length) {
      fs.writeFileSync(".gitignore", answers.ignore.join("\n"));
    } else {
      touch(".gitignore");
    }
  } else {
    touch(".gitignore");
  }
};

// These are the repetitive tasks we’ll use it to automate:
// 1. run git init
// 2. add the .gitignore file
// 3. add the remaining contents of the working directory
// 4. perform an initial commit
// 5. add the newly-created remote repository
// 6. push the working directory up to the remote.
export const setupRepo = async (url: string) => {
  const status = new Spinner(
    "Initializing local repository and pushing to remote"
  );
  status.start();

  try {
    await git.init();
    await git.add(".gitignore");
    await git.add("./*");
    await git.commit("Initial commit");
    await git.addRemote("origin", url);
    await git.push("origin", "master");
    return true;
  } catch (err) {
    throw err;
  } finally {
    status.stop();
  }
};
