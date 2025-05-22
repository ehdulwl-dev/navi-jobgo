const cron = require('node-cron');
const {fetchSeoulJobs, fetchSeoulEducation, fetchWork24Jobs, fetchGovernmentJob} = require('./seoulApiFetcher');
const {upsertSeoulJobs, upsertWork24Jobs} = require('./jobService');
const upsertEducation = require('./educationService');

cron.schedule('0 1 * * *', async () => {
  console.log('[CRON] 새벽 1시: 서울시 채용 및 교육정보 수집 시작');

  try {
    const jobs = await fetchSeoulJobs();
    await upsertSeoulJobs(Array.isArray(jobs) ? jobs : [jobs]);
    console.log('[CRON] 채용 데이터 완료');

    const educations = await fetchSeoulEducation();
    await upsertEducation(Array.isArray(educations) ? educations : [educations]);
    console.log('[CRON] 교육 데이터 완료');

    const fetchWork24Jobs = await fetchWork24Jobs();
    await upsertWork24Jobs(Array.isArray(educations) ? educations : [educations]);
    console.log('[CRON] 고용 24 일자리 데이터 완료');

  } catch (err) {
    console.error('[CRON] 에러 발생:', err.message);
  }
});
