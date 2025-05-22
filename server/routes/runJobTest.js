const {fetchSeoulJobs} = require('./seoulApiFetcher');
const upsertJobs = require('./jobService');

(async () => {
  try {
    console.log('[TEST] 채용 정보 수집 시작');
    const jobs = await fetchSeoulJobs();
    await upsertJobs(Array.isArray(jobs) ? jobs : [jobs]);
    console.log('[TEST] 채용 정보 저장 완료');
  } catch (err) {
    console.error('[TEST] 에러 발생:', err.message);
  }
})();
