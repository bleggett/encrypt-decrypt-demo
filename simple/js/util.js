// MIT License
//
// Copyright (c) 2019 Virtru Corporation
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

/* eslint-disable no-unused-vars */

const BASE_URL = new RegExp(/^.*\//).exec(window.location.href);
const getById = (id) => document.getElementById(id);
const getQueryParam = (id) => new URL(window.location.href).searchParams.get(id);

let client;
let kcClient;

const isSupportedBrowser = () => {
  const supportedBrowserStrings = ['Chrome', 'Firefox'];
  let supported = false;
  supportedBrowserStrings.forEach((browser) => {
    if (navigator.userAgent.search(browser) >= 0) {
      supported = true;
    }
  });

  return supported;
};

// Builds a new client (if needed)
function buildClient() {
  // client = client || new Virtru.Client({organizationName, oidcRefreshToken});
  client = client || new Virtru.Client({ email: getUser() });
  return client;
}

// Builds a new client (if needed)
function buildKCClient() {
  // client = client || new Virtru.Client({organizationName, oidcRefreshToken});
  kcClient = kcClient || Keycloak(
    {
      realm: 'tdf',
      url: 'http://127.0.0.1:8080/auth/',
      clientId: 'browsertest',
    },
  );
  return kcClient;
}

// Log out a currently logged in user and redirect back to the login
async function logout() {
  const keycloak = buildKCClient();
  await keycloak.logout({ redirectUri: `${BASE_URL}logout.html` });
}

// Redirect the user if they don't have a current, valid saved appIdBundle
async function forceLoginIfNecessary() {
  const keycloak = buildKCClient();
  if (!keycloak.authenticated) {
    console.log('forceLoginIfNecessary KC');
    try {
      const authInfo = await keycloak.init({
        onLoad: 'login-required',
        promiseType: 'native',
      });
      console.log(`GOT KC INFO: ${JSON.stringify(keycloak)}`);
      console.log(authInfo ? 'User Is Authenticated With Keycloak' : 'User Is Not Authenticated With Keycloak');
    } catch (error) {
      console.log('failed to initialize');
    }
  }
}

if (!isSupportedBrowser()) {
  window.location.href = `${BASE_URL}incompatible-browser.html`;
}

window.addEventListener('DOMContentLoaded', () => {
  const maxTries = 100;
  const timeout = 100;
  let tries = 0;
  function checkOnVirtru() {
    console.log(`GOT KC INFO: ${JSON.stringify(buildKCClient())}`);
    if (window.Virtru) {
      console.log('Initialized Virtru SDK');
      virtruInitalized = true;
    } else if (tries++ < maxTries) {
      setTimeout(checkOnVirtru, timeout);
    } else {
      console.error('Virtru was not initialized');
    }
  }
  checkOnVirtru();
});
