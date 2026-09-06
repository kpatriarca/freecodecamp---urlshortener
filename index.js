require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const dns = require("dns");
const { URL } = require("url");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

const urls = [];
let shortUrlId = 1;

app.post("/api/shorturl", function (req, res) {
  const originalUrl = req.body.url;

  let hostname;

  try {
    const parsedUrl = new URL(originalUrl);

    // Only allow http and https
    if (
      parsedUrl.protocol !== "http:" &&
      parsedUrl.protocol !== "https:"
    ) {
      return res.json({ error: "invalid url" });
    }

    hostname = parsedUrl.hostname;
  } catch (error) {
    return res.json({ error: "invalid url" });
  }

  dns.lookup(hostname, function (err) {
    if (err) {
      return res.json({ error: "invalid url" });
    }

    const existingUrl = urls.find(
      (item) => item.original_url === originalUrl
    );

    if (existingUrl) {
      return res.json(existingUrl);
    }

    const newUrl = {
      original_url: originalUrl,
      short_url: shortUrlId
    };

    urls.push(newUrl);
    shortUrlId++;

    res.json(newUrl);
  });
});

app.get("/api/shorturl/:short_url", function (req, res) {
  const shortUrl = Number(req.params.short_url);

  const urlData = urls.find(
    (item) => item.short_url === shortUrl
  );

  if (!urlData) {
    return res.json({ error: "No short URL found" });
  }

  res.redirect(urlData.original_url);
});

const port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
