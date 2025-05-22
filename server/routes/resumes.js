const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// 목록 조회
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('TB_USER')
    .select('*');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// 생성
router.post('/', async (req, res) => {
  const { name, email, phone } = req.body;
  const { data, error } = await supabase
    .from('TB_USER')
    .insert([{ name, email, phone }])
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
});

// 수정
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, phone } = req.body;
  const { data, error } = await supabase
    .from('TB_USER')
    .update({ name, email, phone })
    .eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

// 삭제
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase
    .from('TB_USER')
    .delete()
    .eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
});

module.exports = router;
