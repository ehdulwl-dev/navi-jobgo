const express = require("express");
const router = express.Router();
const passport = require("passport");
const supabase = require("../supabaseClient");
const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, `../.env.${process.env.NODE_ENV || "loc"}`),
});

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:8081";

router.get("/", passport.authenticate("kakao"));

router.get(
  "/callback",
  passport.authenticate("kakao", {
    failureRedirect: `${FRONTEND_URL}/Index`,
  }),
  async (req, res) => {
    const { _json } = req.user;
    const email = _json.kakao_account.email;

    const { data: userData, error } = await supabase
      .from("TB_USER")
      .select("name")
      .eq("email", email)
      .single();

    if (error) {
      console.error("DB 이름 조회 실패:", error.message);
    }

    req.session.user = {
      email,
      name: userData?.name || _json.properties.nickname || "이름없음",
    };

    res.redirect(`${FRONTEND_URL}/index`);
  }
);

module.exports = router;
