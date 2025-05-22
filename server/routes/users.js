var express = require("express");
var router = express.Router();
const supabase = require("../supabaseClient");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

// 프로필 조회
router.get("/profile", async (req, res) => {
  // Check if email is provided
  const email = req.query.email;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const { data, error } = await supabase
      .from("TB_USER")
      .select("*")
      .eq("email", email)
      .single();

    if (error) {
      console.error("Supabase error fetching profile:", error);
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: "User not found" });
    }

    const mapped = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      gender: data.gender,
      birthDate: data.birthdate,
      desiredJob: data.preferjob,
      desiredLocation: data.preferlocate,
      desiredWorkingHours: data.prefertime,
      personality: data.personality,
      address: data.address,
    };

    res.json(mapped);
  } catch (err) {
    console.error("Server error fetching profile:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 프로필 수정
router.put("/profile", async (req, res) => {
  console.log("📦 받은 요청 바디:", req.body);
  const updated = req.body;

  const supabasePayload = {
    name: updated.name,
    phone: updated.phone || null,
    gender: updated.gender || null,
    birthdate: updated.birthDate ? updated.birthDate.replace(/\./g, "-") : null,
    preferjob: updated.desiredJob || null,
    preferlocate: updated.desiredLocation || null,
    prefertime: updated.desiredWorkingHours || null,
    personality: updated.personality || null,
  };

  const { data, error } = await supabase
    .from("TB_USER")
    .update(supabasePayload)
    .eq("email", updated.email)
    .select();

  if (error) {
    console.error("❌ Supabase 업데이트 에러:", error);
    return res.status(500).json({ error });
  }

  res.json(data);
});

module.exports = router;
