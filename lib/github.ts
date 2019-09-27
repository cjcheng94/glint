import chalk from 'chalk';
import CLI from 'clui';
import Configstore from 'configstore';
import Octokit = require('@octokit/rest');
import _ from 'lodash';
import pkg from '../package.json';

const conf = new Configstore(pkg.name);
const Spinner = CLI.Spinner;

export const getStoredGithubToken = () => conf.get('github.token');

// 3. we attempt to register a new access token for our application
export const registerNewToken = async (octokit: Octokit) => {
  const status = new Spinner('Authenticating, please wait...');
  status.start();
  status.stop();
  try {
    const res = await octokit.oauthAuthorizations.createAuthorization({
      scopes: ['user', 'public_repo', 'repo', 'repo:status'],
      note: 'ginits, the command-line tool for initalizing Git repos',
    });

    const token = res.data.token;
    if (token) {
      // 4. if we manage to get an access token, we set it in the configstore for next time.
      conf.set('github.token', token);

      // 5. we then return the token.
      return token;
    } else {
      throw new Error('Sksksks, GitHub token was not found in the response');
    }
  } catch (err) {
    throw err;
  } finally {
    status.stop();
  }
};

export const githubAuth = (token: string) => new Octokit({ auth: token });
