const {fetchEducationData} = require('./seoulApiFetcher');
const upsertJobsEducatios = require('./educationService');

(async () => {
  try {
    console.log('[TEST] 채용 정보 수집 시작');
    const jobs = await fetchEducationData();
    await upsertJobsEducatios(Array.isArray(jobs) ? jobs : [jobs]);
    console.log('[TEST] 채용 정보 저장 완료');
  } catch (err) {
    console.error('[TEST] 에러 발생:', err.message);
  }
})();
