
const supabase = require('../supabaseClient');

function formatFcltData(raw) {
    return {
        fclt_cd: raw.FCLT_CD || null,
        fclt_nm: raw.FCLT_NM || null,
        fclt_kind_nm: raw.FCLT_KIND_NM || null,
        fclt_kind_dtl_nm: raw.FCLT_KIND_DTL_NM || null,
        fclt_zipcd: raw.FCLT_ZIPCD || null,
        fclt_addr: raw.FCLT_ADDR || null,
        fclt_tel_no: raw.FCLT_TEL_NO || null,
        jrsd_sgg_cd: raw.JRSD_SGG_CD || null,
        jrsd_sgg_nm: raw.JRSD_SGG_NM || null,
        jrsd_sgg_se: raw.JRSD_SGG_SE || null,
    };
}


async function upsertFcltJobs(fcltList) {
  for (const row of fcltList) {
    const formatted = formatFcltData(row);
    const { error } = await supabase
      .from('TB_SENIOR_FCLT')
      .upsert(formatted, { onConflict: ['fclt_cd'] });

    if (error) {
      console.error(`[ERROR] ${formatted.fclt_cd} 업서트 실패:`, error.message);
    }
  }
  console.log(`[JOB] ${fcltList.length}개 채용정보 upsert 완료`);
}

module.exports = {upsertFcltJobs};
