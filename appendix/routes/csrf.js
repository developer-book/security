const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const router = express.Router();

router.use(
  session({
    secret: "session",
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 60 * 1000 * 5,
    },
  })
);
router.use(express.urlencoded({ extended: true }));
router.use(cookieParser());

// 세션 데이터 저장
let sessionData = {};

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  // 확인용이므로 사용자명과 비밀번호를 고정
  if (username !== "user1" || password !== "Passw0rd!#") {
    res.status(403);
    res.send("로그인 실패");
    return;
  }
  // 세션에 사용자명 저장
  sessionData = req.session;
  sessionData.username = username;
  const token = crypto.randomUUID();
  res.cookie("csrf_token", token, {
    secure: true,
  });
  // CSRF 확인 페이지로 이동
  res.redirect("/csrf_test.html");
});

router.post("/remit", (req, res) => {
  // 세션에 저장된 정보에서 로그인 상태 확인
  if (!req.session.username || req.session.username !== sessionData.username) {
    res.status(403);
    res.send("로그인이 필요합니다.");
    return;
  }
  if (req.cookies["csrf_token"] !== req.body["csrf_token"]) {
    res.status(400);
    res.send("잘못된 요청입니다.");
    return;
  }

  // 보통은 데이터베이스 업데이트 등 중요한 처리를 진행
  const { to, amount } = req.body;
  res.send(`「${to}」 에게 ${amount}원을 송금하였습니다.`);
});

module.exports = router;
