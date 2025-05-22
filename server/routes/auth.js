const router = require("express").Router();
const kakaoRouter = require("../auth/kakao");

router.use("/kakao", kakaoRouter);

// DB에서 로그인 정보를 통해 profile 플로팅
router.get("/me", (req, res) => {
  // console.log("세션 정보:", req.session);
  if (req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(401).json({ message: "Not logged in" });
  }
});

// 로그아웃 처리
router.post("/logout", (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error("세션 삭제 오류:", err);
        return res.status(500).json({ message: "로그아웃 중 오류가 발생했습니다." });
      }
      
      res.clearCookie("connect.sid"); // 세션 쿠키 삭제
      res.status(200).json({ message: "로그아웃 성공" });
    });
  } else {
    res.status(200).json({ message: "이미 로그아웃 상태입니다." });
  }
});

module.exports = router;
