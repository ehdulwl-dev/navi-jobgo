const supabase = require('../supabaseClient');

// function formatEducationData(raw) {
//     return {
//         id: raw.JO_REGIST_NO,
//         edc_sn: raw.EDC_SN,
//         edc_nm: raw.EDC_NM,
//         edc_begin_de_dt: raw.EDC_BEGIN_DE_DT,
//         edc_end_de_dt: raw.EDC_END_DE_DT,
//         edc_time_hm: raw.EDC_TIME_HM,
//         lctrum_info_cn: raw.LCTRUM_INFO_CN,
//         edc_amount_at_nm: raw.EDC_AMOUNT_AT_NM,
//         matrl_amount_at_nm: raw.MATRL_AMOUNT_AT_NM,
//         psncpa_co: parseInt(raw.PSNCPA_CO, 10),
//         rcrit_begin_de_dt: raw.RCRIT_BEGIN_DE_DT,
//         rcrit_end_de_dt: raw.RCRIT_END_DE_DT,
//         age_co_nm: raw.AGE_CO_NM,
//         sex_qualf_cn: raw.SEX_QUALF_CN,
//         sttus_nm: raw.STTUS_NM,
//     };
// };
  
function formatEducationData(raw) {
    return {
        id: raw.LCT_NO,
        edc_sn: raw.LCT_NO,
        edc_nm: raw.LCT_NM,
        edc_begin_de_dt: raw.CR_STDE,
        edc_end_de_dt: raw.CR_EDDE,
        edc_time_hm: raw.HR,
        lctrum_info_cn: raw.CR_URL,
        edc_amount_at_nm: raw.LCT_COST,
        matrl_amount_at_nm: raw.LCT_COST,
        psncpa_co: parseInt(raw.CR_PPL_STAT, 10),
        rcrit_begin_de_dt: raw.REG_STDE,
        rcrit_end_de_dt: raw.REG_EDDE,
        age_co_nm: '',
        sex_qualf_cn: '',
        sttus_nm: raw.LCT_STAT,
    };
};


async function upsertJobsEducations(educationList){
    for (const education of educationList) {
        const formatted = formatEducationData(education);
        await supabase.from('TB_EDUCATIONS').upsert(formatted, { onConflict: ['id'] });
      }

    console.log(`[EDUCATION] ${educationList.length}개 채용정보 upsert 완료`);
};

module.exports = upsertJobsEducations;
