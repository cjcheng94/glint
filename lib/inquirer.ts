import _ from "lodash";
import inquirer from "inquirer";
import minimist from "minimist";
import { getCurrentDirectoryBase } from "./files";

export const askGithubCredentials = (): Promise<{
  username: string;
  password: string;
}> => {
  const questions = [
    {
      name: "username",
      type: "input",
      message: "Enter your github username or Email",
      validate(value: string) {
        if (value.length) {
          return true;
        } else {
          return "Please enter your username/Email";
        }
      }
    },
    {
      name: "password",
      type: "password",
      mask: "$",
      message: "Enter your password",
      validate(value: string) {
        if (value.length) {
          return true;
        } else {
          return "Please enter your password";
        }
      }
    }
  ];
  return inquirer.prompt(questions);
};

export const askTwoFactorAuthCode = async (): Promise<string> => {
  return inquirer.prompt([
    {
      name: "accessToken",
      type: "input",
      message: "Enter your github access token",
      validate(value: string) {
        if (value.length) {
          return true;
        } else {
          return "Enter your github access token";
        }
      }
    }
  ]);
};

export const askRepodetails = (): Promise<{
  name: string;
  description?: string;
  visibility: string;
}> => {
  const argv = minimist(process.argv.slice(2));
  const questions = [
    {
      type: "input",
      name: "name",
      message: "Enter a name for the repository",
      default: argv._[0] || getCurrentDirectoryBase(),
      validate(value: string) {
        if (value.length) {
          return true;
        } else {
          return "Please enter a name for the repo";
        }
      }
    },
    {
      type: "input",
      name: "description",
      default: argv._[1] || null,
      message: "Enter a description of the repo (optional)"
    },
    {
      type: "list",
      name: "visibility",
      message: "Public or private:",
      choices: ["public", "private"],
      default: "public"
    }
  ];
  return inquirer.prompt(questions);
};

export const askIgnoreFiles = (
  fileList: string[]
): Promise<{ ignore: string[] }> => {
  const questions = [
    {
      name: "ignore",
      type: "checkbox",
      message: "Select the files/folders you'd like to ignore:",
      choices: fileList,
      default: ["node_modules", "bower_components"]
    }
  ];
  return inquirer.prompt(questions);
};
