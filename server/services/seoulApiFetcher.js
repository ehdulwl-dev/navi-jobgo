const axios = require('axios');
const xml2js = require('xml2js');
require('dotenv').config({ path: __dirname + '/../.env.loc' }); 

//서울일자리 
async function fetchSeoulJobs(start,end) {
  const API_URL = `http://openapi.seoul.go.kr:8088/${process.env.SEOUL_JOB_API_KEY}/xml/GetJobInfo/${start}/${end}/ / /서울/ /`;
  const { data } = await axios.get(API_URL, { responseType: 'text' });
  const parser = new xml2js.Parser({ explicitArray: false });
  const parsed = await parser.parseStringPromise(data);
  return parsed.GetJobInfo.row;
}

//고용24일자리
async function fetchWork24Jobs(start, limit) {
  const API_URL = `https://www.work24.go.kr/cm/openApi/call/wk/callOpenApiSvcInfo210L01.do?authKey=${process.env.WORK24_JOB_API_KEY}&callTp=L&returnType=XML&startPage=${start}&display=${limit}&region=11000`;
  const { data } = await axios.get(API_URL, { responseType: 'text' });
  const parser = new xml2js.Parser({ explicitArray: false });
  const parsed = await parser.parseStringPromise(data);

  return parsed.wantedRoot.wanted;
}

//고용24정부지원일자리
async function fetchGovernmentJob() {
  const API_URL = `https://www.work24.go.kr/cm/openApi/call/wk/callOpenApiSvcInfo211L01.do?authKey=${process.env.WORK24_GVNM_API_KEY}&returnType=XML&srchBgnDt=20230101&srchEndDt=20260501`;
  const { data } = await axios.get(API_URL, { responseType: 'text' });
  const parser = new xml2js.Parser({ explicitArray: false });
  const parsed = await parser.parseStringPromise(data);

  return parsed.ilmoaJobsList.ilmoaJob;
}


//서울일자리시설
async function fetchSeoulFclt(start, end) {
  const API_URL = `http://openapi.seoul.go.kr:8088/${process.env.SEOUL_FCLT_API_KEY}/xml/fcltOpenInfo_OMWSI/${start}/${end}/`;
  const { data } = await axios.get(API_URL, { responseType: 'text' });
  const parser = new xml2js.Parser({ explicitArray: false });
  const parsed = await parser.parseStringPromise(data);

  return parsed.fcltOpenInfo_OMWSI.row;
}


//서울일자리 교육 정보
async function fetchSeoulEducation() {
  const API_URL = `http://openapi.seoul.go.kr:8088/${process.env.SEOUL_EDUCATION_API_KEY}/xml/jobEduCenterOpenInfo/1/1000/`;
  const { data } = await axios.get(API_URL, { responseType: 'text' });
  const parser = new xml2js.Parser({ explicitArray: false });
  const parsed = await parser.parseStringPromise(data);

  return parsed.jobEduCenterOpenInfo.row;
}
  
//서울일자리 교육 정보
async function fetchSeoul50Education(start,end) {
  
  const API_URL = `http://openapi.seoul.go.kr:8088/${process.env.SEOUL_50_EDUCATION_API_KEY}/xml/FiftyPotalEduInfo/${start}/${end}/`;
  const { data } = await axios.get(API_URL, { responseType: 'text' });
  const parser = new xml2js.Parser({ explicitArray: false });
  const parsed = await parser.parseStringPromise(data);

  return parsed.FiftyPotalEduInfo.row;
}
  

module.exports = {
fetchSeoulJobs,
fetchWork24Jobs,
fetchGovernmentJob,
fetchSeoulFclt,
fetchSeoulEducation,
fetchSeoul50Education
};
