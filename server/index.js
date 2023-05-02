const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const PORT = process.env.PORT || 3000;

const app = express();
const dataFile = path.join(__dirname, "data.json");

//support POSTing from data wwith URL encoded
app.use(express.urlencoded({ extended: true }));

//Enable CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/poll", async (req, res) => {
  let data = JSON.parse(await fs.readFile(dataFile, "utf-8"));
  const totalVotes = Object.values(data).reduce((total, n) => (total += n), 0);

  data = Object.entries(data).map(([label, votes]) => {
    return {
      label,
      votes,
      percentage: (totalVotes === 0 || votes === 0) ? 0 : ((100 * votes) / totalVotes).toFixed(1),
    };
  });

  res.json(data);
});

app.post("/poll", async (req, res) => {
  const data = JSON.parse(await fs.readFile(dataFile, "utf-8"));
  console.log("hello",data);
  data[req.body.add]++;

  await fs.writeFile(dataFile, JSON.stringify(data));

  res.end();
});

app.post("/poll/reset", async (req, res) => {
  const data = JSON.parse(await fs.readFile(dataFile, "utf-8"));

  for (const prop in data) {
    data[prop] = 0;
  }

  await fs.writeFile(dataFile, JSON.stringify(data));

  res.end();
});

app.listen(PORT, () => console.log("Server is running..."));
