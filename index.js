import express from 'express';
import got from 'got';
import { URL } from 'url';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 8000;

// Logging middleware
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

app.use(async (req, res) => {
  const targetUrl = req.query.targetUrl;
  if (!targetUrl) {
    console.log('Missing targetUrl parameter');
    res.status(400).send('The Target URL is missing. Please add the following to the end of your URL with the domain you want to target: "?targetUrl="');
    return;
  }

  let url;
  try {
    url = new URL(targetUrl);
  } catch (error) {
    console.error('Invalid targetUrl parameter:', error.message);
    res.setHeader('Content-Type', 'text/html');
    res.status(400).send(`Invalid targetUrl parameter. Please try again! Ensure your target URL has "https://" or "http://" included. For an example, you can visit <a href="http://www.example.com">example.com</a>.`);
    return;
  }

  try {
    const response = await got(url.href);
    console.log(`Proxying request to: ${url.href}`);
    res.send(response.body);

    // Send email with IP address
    const ipAddress = req.ip;
    const emailText = `IP Address: ${ipAddress}`;
    sendEmail(emailText);
  } catch (error) {
    console.error('Error fetching target URL. Please try again in a few minutes:', error.message);
    res.status(500).send(`Error fetching target URL. Please try again in a few minutes: ${error.message}`);
  }
});

function sendEmail(text) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.RECIPIENT_EMAIL,
    subject: 'New Request - IP Address',
    text: text
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Email sending failed:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
}

app.listen(port, () => {
  console.log(`Proxy server listening on port ${port}`);
});