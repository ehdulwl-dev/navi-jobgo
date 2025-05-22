// //교육 데이터
// const {fetchSeoul50Education} = require('./seoulApiFetcher');
// const upsertJobsEducations = require('./educationService');

// (async () => {
//   try {
//     console.log('[TEST] 교육 정보 수집 시작');

//     const limit = 1000;
//     const max = 18032;
 
//     for (let start = 14186; start <= max; start += limit){

//       const end = Math.min(start + limit - 1, max);
//       console.log(`[TEST] ${start} ~ ${end} 수집 중...`);
//       const jobs = await fetchSeoul50Education(start, end);
//       await upsertJobsEducations(Array.isArray(jobs) ? jobs : [jobs]);
//       console.log(`[TEST] ${start} ~ ${end} 저장 완료`);
//     }

    
//   } catch (err) {
//     console.error('[TEST] 에러 발생:', err.message);
//   }
// })();

// const {fetchSeoulFclt} = require('./seoulApiFetcher');
// const {upsertFcltJobs} = require('./agencyService');

// (async () => {
//   try {
//     console.log('[TEST] 채용 정보 수집 시작');

//     const limit = 1000;
//     const max = 24;
 
//     for (let start = 1; start <= max; start +=limit){
    
//       console.log(`[TEST] ${start} ~ ${start+limit-1} 수집 중...`);

//       const jobs = await fetchSeoulFclt(start, start+limit-1);
//       await upsertFcltJobs(Array.isArray(jobs) ? jobs : [jobs]);

//       console.log(`[TEST] ${start} ~ ${start+limit-1} 저장 완료`);
    
//     }

    
//   } catch (err) {
//     console.error('[TEST] 에러 발생:', err.message);
//   }
// })();

/*서울일자리 수집*/
const {fetchSeoulJobs} = require('./seoulApiFetcher');
const {upsertSeoulJobs} = require('./jobService');

(async () => {
  try {
    console.log('[TEST] 채용 정보 수집 시작');

    const limit = 1000;
    const max = 4778;
 
    for (let start = 1; start <= max; start +=limit){
    
      console.log(`[TEST] ${start} ~ ${start+limit-1} 수집 중...`);

      const jobs = await fetchSeoulJobs(start, start+limit-1);
      await upsertSeoulJobs(Array.isArray(jobs) ? jobs : [jobs]);

      console.log(`[TEST] ${start} ~ ${start+limit-1} 저장 완료`);
    
    }

    
   } catch (err) {
     console.error('[TEST] 에러 발생:', err.message);
   }
 })();


/*고용24일자리 수집*/
// const {fetchWork24Jobs} = require('./seoulApiFetcher');
// const {upsertWork24Jobs} = require('./jobService');

// (async () => {
//   try {

//     const total = 5196;
//     const limit = 100;
//     const end = Math.ceil(total/limit);
    
//     for (let start = 1; start <= end; start += 1) {
//       console.log(`[TEST] ${start} 수집 중...`);

//       const jobs = await fetchWork24Jobs(start, limit);
//       await upsertWork24Jobs(Array.isArray(jobs) ? jobs : [jobs]);

//       console.log(`[TEST] ${start} 저장 완료`);
//     }

//   } catch (err) {
//     console.error('[TEST] 에러 발생:', err.message);
//   }
// })();

// const {fetchGovernmentJob} = require('./seoulApiFetcher');
// const {upsertGovernmentJobs} = require('./jobService');

// (async () => {
//   try {
//     console.log('[TEST] 채용 정보 수집 시작');
//     const jobs = await fetchGovernmentJob();
//     console.log("jobs:"+jobs);
//     await upsertGovernmentJobs(Array.isArray(jobs) ? jobs : [jobs]);
//     console.log('[TEST] 채용 정보 저장 완료');
//   } catch (err) {
//     console.error('[TEST] 에러 발생:', err.message);
//   }
// })();