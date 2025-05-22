const express = require("express");
const router = express.Router();

//session 조회
router.get("/", (req, res) => {
  if (req.session.user) {
    console.log("세션 조회 성공:", req.session.user);
    return res.status(200).json(req.session.user);
  } else {
    console.log("세션 없음");
    return res.status(401).json({ message: "Not logged in" });
  }
});

//session 저장
router.post("/", (req, res) => {
  const { user } = req.body;
  if (!user || !user.email) {
    return res.status(400).json({ message: "User email is required" });
  }

  req.session.user = {
    email: user.email,
    name: user.name || "사용자",
  };

  console.log("세션 설정:", req.session.user);

  return res.status(200).json({ message: "Session saved" });
});

module.exports = router;
