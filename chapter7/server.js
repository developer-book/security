const crypto = require("crypto");
const express = require("express");
const api = require("./routes/api");
const csrf = require("./routes/csrf");
const app = express();
const port = 3000;

app.set("view engine", "ejs");

app.use(
  express.static("public", {
    setHeaders: (res, path, stat) => {
      res.header("X-Frame-Options", "SAMEORIGIN");
    },
  })
);

app.use("/api", api);
app.use("/csrf", csrf);

app.get("/", (req, res, next) => {
  res.end("Top Page");
});

app.get("/csp", (req, res) => {
  const nonceValue = crypto.randomBytes(16).toString("base64");
  res.header(
    "Content-Security-Policy",
    `script-src 'nonce-${nonceValue}' 'strict-dynamic';` +
      "object-src 'none';" +
      "base-uri 'none';" +
      "require-trusted-types-for 'script'"
  );
  res.render("csp", { nonce: nonceValue });
});

// 폼 내용을 해석하여 req.body에 넣기
app.use(express.urlencoded({ extended: true }));

app.post("/signup", (req, res) => {
  console.log(req.body);
  res.send("계정이 등록되었습니다.");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
