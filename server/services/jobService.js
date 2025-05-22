const supabase = require('../supabaseClient');

function formatJobData(raw) {
  // 날짜 전처리
  let receiptClose = raw.RCEPT_CLOS_NM?.trim();

  if (receiptClose) {
    // '마감일 (2025-02-26)' → '2025-02-26'
    if (/^마감일 \(\d{4}-\d{2}-\d{2}\)$/.test(receiptClose)) {
      receiptClose = receiptClose.match(/\((\d{4}-\d{2}-\d{2})\)/)?.[1];
    }

    // '채용시까지 25-06-24' → '2025-06-24'
    else if (/^채용시까지 \d{2}-\d{2}-\d{2}$/.test(receiptClose)) {
      const datePart = receiptClose.match(/\d{2}-\d{2}-\d{2}/)?.[0];
      if (datePart) {
        receiptClose = `20${datePart}`;
      }
    }

    // '채용시까지' → null
    else if (receiptClose === '채용시까지') {
      receiptClose = '9999-99-99';
    }

    // '25-06-27' → '2025-06-27'
    else if (/^\d{2}-\d{2}-\d{2}$/.test(receiptClose)) {
      receiptClose = `20${receiptClose}`;
    }

    // 예외 처리: 인식 불가 형식 → null
    else {
      receiptClose = null;
    }
  }

  return {
    id: raw.JO_REGIST_NO,
    company: raw.CMPNY_NM,
    title: raw.JO_SJ,
    description: raw.DTY_CN,
    summary: raw.GUI_LN,
    location: raw.BASS_ADRES_CN,
    work_address: raw.WORK_PARAR_BASS_ADRES_CN,
    wage: raw.HOPE_WAGE,
    employment_type: raw.EMPLYM_STLE_CMMN_MM,
    career_required: raw.CAREER_CND_NM,
    education_required: raw.ACDMCR_NM,
    work_time: raw.WORK_TIME_NM,
    holiday: raw.HOLIDAY_NM,
    week_hours: raw.WEEK_WORK_HR ? parseInt(raw.WEEK_WORK_HR) : null,
    insurance: raw.JO_FEINSR_SBSCRB_NM,
    receipt_close: receiptClose,
    receipt_method: raw.RCEPT_MTH_NM,
    selection_method: raw.MODEL_MTH_NM,
    papers_required: raw.PRESENTN_PAPERS_NM,
    manager_name: raw.MNGR_NM,
    manage_phone: raw.MNGR_PHON_NO,
    manager_org: raw.MNGR_INSTT_NM,
    reg_date: raw.JO_REG_DT,
    api_type: 'seoul'
  };
}

function formatJobDataFromWork24(raw) {
  let receiptClose = raw.closeDt?.trim();

  if (receiptClose) {
    // '채용시까지 25-07-01' → '2025-07-01'
    if (/^채용시까지 \d{2}-\d{2}-\d{2}$/.test(receiptClose)) {
      const datePart = receiptClose.match(/\d{2}-\d{2}-\d{2}/)?.[0];
      receiptClose = `20${datePart}`;
    }
    // '채용시까지' 단독 → 9999-12-31
    else if (receiptClose === '채용시까지') {
      receiptClose = '9999-12-31';
    }
    // '25-07-01' → '2025-07-01'
    else if (/^\d{2}-\d{2}-\d{2}$/.test(receiptClose)) {
      receiptClose = `20${receiptClose}`;
    }
    // 예외
    else {
      receiptClose = null;
    }
  }

  // 등록일 처리 (regDt: '25-05-02' → '2025-05-02')
  let regDate = raw.regDt?.trim();
  if (regDate && /^\d{2}-\d{2}-\d{2}$/.test(regDate)) {
    regDate = `20${regDate}`;
  } else {
    regDate = null;
  }

  return {
    id: raw.wantedAuthNo,
    company: raw.company,
    title: raw.title,
    description: null, // 별도 상세 내용 없음
    summary: null, // 없음
    location: raw.region,
    work_address: `${raw.basicAddr ?? ""} ${raw.detailAddr ?? ""}`.trim(),
    wage: raw.sal, // '209만원'
    employment_type: raw.salTpNm, // '월급'
    career_required: raw.career, // '관계없음'
    education_required: raw.minEdubg, // '학력무관'
    work_time: null, // 없음
    holiday: raw.holidayTpNm, // '주5일근무'
    week_hours: null,
    insurance: null,
    receipt_close: receiptClose,
    receipt_method: null,
    selection_method: null,
    papers_required: null,
    manager_name: null,
    manage_phone: null,
    manager_org: null,
    reg_date: regDate,
    api_type: 'work24'
  };
}



async function upsertSeoulJobs(jobList) {
  for (const job of jobList) {
    const formatted = formatJobData(job);
    const { error } = await supabase
      .from('TB_JOBS')
      .upsert(formatted, { onConflict: 'id'});

    if (error) {
      console.error(`[ERROR] ${formatted.id} 업서트 실패:`, error.message);
    }
  }
  console.log(`[JOB] ${jobList.length}개 채용정보 upsert 완료`);
}

async function upsertWork24Jobs(jobList) {
  for (const job of jobList) {
    const formatted = formatJobDataFromWork24(job);
    const {error} = await supabase.from('TB_JOBS').upsert(formatted, { onConflict: ['id'] });

    if (error) {
      console.error(`[ERROR] ${formatted.id} 업서트 실패:`, error.message);
    }
  }
  console.log(`[JOB] ${jobList.length}개 채용정보 upsert 완료`);
}


module.exports = {upsertSeoulJobs,upsertWork24Jobs};
