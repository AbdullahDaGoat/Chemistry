import express from 'express';
import got from 'got';
import { URL } from 'url';

const app = express();

app.use(async (req, res) => {
  const targetUrl = req.query.targetUrl;
  if (!targetUrl) {
    res.status(400).send('The Target url is missing please add the following to the end of your url with the domain you want to target "?targetUrl="');
    return;
  }

  let url;
  try {
    url = new URL(targetUrl);
  } catch (error) {
    res.status(400).send('Invalid targetUrl parameter please try again! Ensure your target url has https or http included');
    return;
  }

  try {
    const response = await got(url.href);
    res.send(response.body);
  } catch (error) {
    console.error('Error fetching target URL:', error.message);
    res.status(500).send(`Error fetching target URL: ${error.message}`);
  }
});

app.listen(8000, () => {
  console.log('Proxy server listening on port 8000');
});