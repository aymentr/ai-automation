const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "data", "waitlist.json");
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function readWaitlist() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch (_) {
    return [];
  }
}

function writeWaitlist(list) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2));
}

app.post("/api/waitlist", (req, res) => {
  const email = String(req.body && req.body.email ? req.body.email : "")
    .trim()
    .toLowerCase();

  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }

  const list = readWaitlist();
  const existing = list.some((entry) => entry.email === email);

  if (existing) {
    return res.status(200).json({ ok: true, alreadyJoined: true, count: list.length });
  }

  list.push({ email, joinedAt: new Date().toISOString() });
  writeWaitlist(list);

  res.status(201).json({ ok: true, count: list.length });
});

app.get("/api/waitlist/count", (req, res) => {
  res.json({ count: readWaitlist().length });
});

app.listen(PORT, () => {
  console.log(`Autonoma landing page running at http://localhost:${PORT}`);
});
