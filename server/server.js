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

// HTTP and HTTPS Static File Server
const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');
const path = require('path');

const port = process.env.VIRTRU_SECURE_READER_PORT || 80;
const portSSL = process.env.VIRTRU_SECURE_READER_PORTSSL || 443;

const options = {
  key: fs.readFileSync(path.join(__dirname, './ssl/server.key')),
  cert: fs.readFileSync(path.join(__dirname, './ssl/server.crt')),
};

const app = express();

app.use(express.static(path.join(__dirname, '../simple')));

https.createServer(options, app).listen(portSSL, () => {
  console.log(`Express server listening on port ${portSSL}`);
});

const server = http.createServer(app, (req, res) => {
  res.writeHead(301, {
    'Content-Type': 'text/plain',
    Location: `https://${req.headers.host + req.url}`,
  });
  res.end();
});

server.listen(port, () => {
  console.log(`HTTP Redirect ${port}`);
});

module.exports = server;
