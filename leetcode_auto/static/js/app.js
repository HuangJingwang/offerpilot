// ====== Global State ======
window.D = {};

// ====== i18n ======
var I18N={
  zh:{
    nav_dashboard:'总览',nav_chat:'AI 对话',nav_progress:'进度表',nav_review:'待复习',
    nav_checkin:'打卡记录',nav_optimize:'代码优化',nav_resume:'简历优化',nav_interview:'模拟面试',
    stat_rounds:'已完成轮次',stat_rate:'完成率',stat_today_ac:'今日 AC',stat_pass:'5 轮全通',
    stat_streak:'连续打卡',stat_total_days:'累计打卡',stat_est:'预估完成',
    today_new:'今日新题',today_review:'今日复习',focus_today_title:'今日 5 题',focus_type_hint:'尽量同类型：{category}',focus_done:'做完了',focus_checking:'检查中...',focus_empty:'今天没有可分配的新题了',focus_not_done:'还没检测到你今天完成这道题，先提交 AC 再点这个按钮。',
    card_rate:'完成率',card_rounds:'各轮进度',card_radar:'分类能力',
    card_trend:'每日趋势',card_heatmap:'刷题热力图（近 365 天）',card_checkin_trend:'每日趋势',
    search_ph:'搜索题目...',diff_all:'全部难度',diff_easy:'简单',diff_medium:'中等',diff_hard:'困难',
    cat_all:'全部分类',status_all:'全部状态',status_ns:'未开始',status_ip:'进行中',status_done:'已完成',status_repeat:'反复刷',
    clear_filter:'清除筛选',table_count:'整体进度 {problems_done}/{problems_total} 题 · 轮次 {done}/{rounds} · 显示 {shown}/{total} 题',
    th_title:'题目',th_diff:'难度',th_cat:'分类',th_status:'状态',
    chart_new:'新题',chart_review:'复习',
    r1_done:'R1 已全部完成！',remaining:'共 {n} 题待完成',
    overdue:'逾期 {n} 天',due_today:'今日到期',
    empty:'暂无数据',no_review:'今日无待复习题目，继续保持！',no_opt:'所有提交性能表现良好，无需优化',
    ai_analysis:'AI 分析',btn_expand:'展开',btn_collapse:'收起',
    runtime:'运行时间：',memory:'内存：',show_code:'查看代码',hide_code:'收起代码',
    resume_dl:'下载简历模板',resume_preview:'预览',resume_edit:'编辑',resume_updated:'> ✅ 简历已更新，请查看左侧编辑器或切换到预览查看效果。',resume_analyze:'AI 分析',resume_gen:'生成面试题',resume_save:'保存',
    resume_saved:'已保存',resume_analyzing:'分析中...',resume_ph:'在此粘贴简历内容（Markdown 格式）...\n\n可下载 LapisCV 模板，填入信息后粘贴，点击 Preview 预览。',
    resume_empty:'在左侧粘贴简历内容，然后点击「AI 分析」',resume_chat_ph:'向 AI 提问改进建议...',resume_extract_hint:'⚠️ AI 未返回完整简历更新。请尝试更明确地要求，例如："请帮我修改并输出完整的新简历"',
    interview_empty:'在「简历优化」页面粘贴简历后，点击「生成面试题」',
    interview_start:'开始面试',interview_starting:'启动中...',interview_status_idle:'未开始',
    interview_status_active:'进行中',interview_ans_ph:'输入你的回答...',
    interview_gen_ing:'生成中...',interview_confirm_reset:'确定重置模拟面试？',
    chat_welcome:'你好！我是 BrushUp AI 助手，可以帮你：<br>- 查看刷题进度和统计<br>- 推荐今天该刷的题<br>- 分析薄弱环节<br>- 制定学习计划<br>- 解答算法问题<br><br>有什么想问的？',
    chat_ph:'输入问题...',btn_send:'发送',btn_clear:'清空',
    confirm_clear:'确定清空所有对话记录？',confirm_clear_resume:'确定清空简历对话记录？',
    chat_cleared:'对话已清空，有什么想问的？',thinking:'思考中...',net_error:'网络错误',
    analysis_fail:'分析失败',paste_first:'请先粘贴简历内容',
    data_updated:'数据更新：',
    nav_settings:'设置',settings_list:'题单',settings_list_warn:'切换题单将创建新的进度表，已有数据不受影响',
    settings_rounds:'复习轮数',settings_intervals:'复习间隔（天）',
    settings_daily_new:'每日新题建议',settings_daily_review:'每日复习建议',
    settings_deadline:'截止日期',settings_deadline_hint:'留空 = 不限制',
    settings_save:'保存设置',settings_saved:'已保存！需重启 Web 服务生效',
    settings_daily_pace:'每日建议进度',settings_remaining:'剩余',settings_days_left:'剩余天数',
    theme_dark:'深色',theme_light:'浅色',
    nav_achievements:'成就',
    export_csv:'导出 CSV',
    focus_mode:'专项突破',focus_select:'选择薄弱分类',
    session_expired:'登录已过期，同步功能不可用',session_relogin:'重新登录',
    notes_ph:'添加笔记...',notes_save:'保存笔记',solution_viewed:'看过题解',solution_unviewed:'未看题解',must_repeat:'反复刷',must_repeat_off:'标记反复刷',
    achievement_streak7:'连续打卡 7 天',achievement_streak30:'连续打卡 30 天',
    achievement_r1_all:'R1 全部完成',achievement_r1_half:'R1 完成一半',
    shortcut_hint:'快捷键：1-9 切换标签页',
  },
  en:{
    nav_dashboard:'Dashboard',nav_chat:'AI Chat',nav_progress:'Progress',nav_review:'Review',
    nav_checkin:'Check-in',nav_optimize:'Optimize',nav_resume:'Resume',nav_interview:'Mock Interview',
    stat_rounds:'Completed Rounds',stat_rate:'Completion Rate',stat_today_ac:'Today AC',stat_pass:'5-Round Pass',
    stat_streak:'Streak Days',stat_total_days:'Total Days',stat_est:'Est. Completion',
    today_new:'Today: New',today_review:'Today: Review',focus_today_title:'Today\'s 5',focus_type_hint:'Prefer same type: {category}',focus_done:'Done',focus_checking:'Checking...',focus_empty:'No new problems to assign today.',focus_not_done:'No AC detected for this problem today yet. Submit it first, then click again.',
    card_rate:'Completion Rate',card_rounds:'Round Progress',card_radar:'Category Radar',
    card_trend:'Daily Trend',card_heatmap:'Heatmap (365 days)',card_checkin_trend:'Daily Trend',
    search_ph:'Search...',diff_all:'All Difficulty',diff_easy:'Easy',diff_medium:'Medium',diff_hard:'Hard',
    cat_all:'All Categories',status_all:'All Status',status_ns:'Not Started',status_ip:'In Progress',status_done:'Completed',status_repeat:'Must Repeat',
    clear_filter:'Clear',table_count:'Overall {problems_done}/{problems_total} problems · {done}/{rounds} rounds · Showing {shown}/{total}',
    th_title:'Title',th_diff:'Difficulty',th_cat:'Category',th_status:'Status',
    chart_new:'New',chart_review:'Review',
    r1_done:'R1 all completed!',remaining:'{n} problems remaining',
    overdue:'Overdue {n}d',due_today:'Due today',
    empty:'No data yet',no_review:'No reviews due. Keep it up!',no_opt:'All submissions are well optimized!',
    ai_analysis:'AI Analysis',btn_expand:'Show',btn_collapse:'Hide',
    runtime:'Runtime: ',memory:'Memory: ',show_code:'Show Code',hide_code:'Hide Code',
    resume_dl:'Download Template',resume_preview:'Preview',resume_edit:'Edit',resume_updated:'> ✅ Resume updated. Check the editor or switch to Preview.',resume_analyze:'AI Analyze',resume_gen:'Generate Questions',resume_save:'Save',
    resume_saved:'Saved!',resume_analyzing:'Analyzing...',resume_ph:'Paste resume content (Markdown)...\n\nDownload LapisCV template, fill in, paste here, click Preview.',
    resume_empty:'Paste your resume on the left, then click "AI Analyze"',resume_chat_ph:'Ask AI for resume improvement...',resume_extract_hint:'⚠️ AI did not return a full resume update. Try being more explicit, e.g. "Please rewrite and output the complete updated resume"',
    interview_empty:'Paste resume in "Resume" tab, then click "Generate Questions"',
    interview_start:'Start Interview',interview_starting:'Starting...',interview_status_idle:'Not Started',
    interview_status_active:'In Progress',interview_ans_ph:'Type your answer...',
    interview_gen_ing:'Generating...',interview_confirm_reset:'Reset mock interview?',
    chat_welcome:'Hi! I\'m the BrushUp AI assistant. I can help you:<br>- Check study progress<br>- Recommend problems to solve<br>- Analyze weak areas<br>- Create study plans<br>- Answer algorithm questions<br><br>What would you like to know?',
    chat_ph:'Type a question...',btn_send:'Send',btn_clear:'Clear',
    confirm_clear:'Clear all chat history?',confirm_clear_resume:'Clear resume chat history?',
    chat_cleared:'Chat cleared. What would you like to ask?',thinking:'Thinking...',net_error:'Network error',
    analysis_fail:'Analysis failed',paste_first:'Please paste your resume first',
    data_updated:'Data: ',
    nav_settings:'Settings',settings_list:'Problem List',settings_list_warn:'Switching list creates a new progress table. Existing data is preserved.',
    settings_rounds:'Review Rounds',settings_intervals:'Review Intervals (days)',
    settings_daily_new:'Daily New Suggestion',settings_daily_review:'Daily Review Suggestion',
    settings_deadline:'Deadline',settings_deadline_hint:'Empty = no limit',
    settings_save:'Save Settings',settings_saved:'Saved! Restart web server to apply',
    settings_daily_pace:'Suggested Daily Pace',settings_remaining:'Remaining',settings_days_left:'Days Left',
    theme_dark:'Dark',theme_light:'Light',
    nav_achievements:'Achievements',
    export_csv:'Export CSV',
    focus_mode:'Focus Mode',focus_select:'Select weak category',
    session_expired:'Session expired, sync unavailable',session_relogin:'Re-login',
    notes_ph:'Add notes...',notes_save:'Save Note',solution_viewed:'Viewed Solution',solution_unviewed:'No Solution Viewed',must_repeat:'Must Repeat',must_repeat_off:'Mark Repeat',
    achievement_streak7:'7-day streak',achievement_streak30:'30-day streak',
    achievement_r1_all:'R1 all done',achievement_r1_half:'R1 half done',
    shortcut_hint:'Shortcuts: 1-9 to switch tabs',
  }
};
// Clean up old keys from previous project names
['leetforge_lang','offerpilot_lang'].forEach(function(k){localStorage.removeItem(k)});
var currentLang=localStorage.getItem('brushup_lang')||'en';

function t(key){return (I18N[currentLang]||I18N.en)[key]||(I18N.en[key]||key);}

function applyLang(){
  document.querySelectorAll('[data-i18n]').forEach(function(el){
    var key=el.getAttribute('data-i18n');
    var val=t(key);
    if(el.tagName==='INPUT'||el.tagName==='TEXTAREA') el.placeholder=val;
    else if(key==='chat_welcome') el.innerHTML=val;
    else if(key==='data_updated') {
      el.innerHTML=val + '<span id="sidebar-today">'+(D.today||new Date().toISOString().slice(0,10))+'</span>';
    }
    else el.textContent=val;
  });
  document.getElementById('lang-en').className='lang-btn'+(currentLang==='en'?' active':'');
  document.getElementById('lang-zh').className='lang-btn'+(currentLang==='zh'?' active':'');
}

function switchLang(lang){
  currentLang=lang;
  localStorage.setItem('brushup_lang',lang);
  applyLang();
}

var currentTheme=localStorage.getItem('brushup_theme')||'dark';
function switchTheme(theme){
  currentTheme=theme;
  localStorage.setItem('brushup_theme',theme);
  document.body.className=theme==='light'?'light':'';
  document.getElementById('theme-dark').className='theme-btn'+(theme==='dark'?' active':'');
  document.getElementById('theme-light').className='theme-btn'+(theme==='light'?' active':'');
}
switchTheme(currentTheme);

// ====== Shared Utilities ======
function setText(id, text) {
  var el = document.getElementById(id);
  if (el) el.textContent = text;
}

function mdToHtml(md){
  if(!md) return '';
  if(typeof marked!=='undefined'){
    marked.setOptions({breaks:true,gfm:true});
    return marked.parse(md);
  }
  // fallback: basic escaping
  return '<p>'+md.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>')+'</p>';
}

function ensureProblemDataEntry(slug){
  if(!D.problem_data) D.problem_data={};
  if(!D.problem_data[slug]){
    D.problem_data[slug]={notes:'',time_spent:[],ai_reviews:[],solution_viewed:false,must_repeat:false};
  }
  if(typeof D.problem_data[slug].solution_viewed==='undefined'){
    D.problem_data[slug].solution_viewed=false;
  }
  if(typeof D.problem_data[slug].must_repeat==='undefined'){
    D.problem_data[slug].must_repeat=false;
  }
  return D.problem_data[slug];
}

function solutionViewedText(viewed){
  return t(viewed?'solution_viewed':'solution_unviewed');
}

function mustRepeatText(repeat){
  return t(repeat?'must_repeat':'must_repeat_off');
}

function setSolutionViewed(slug, viewed){
  ensureProblemDataEntry(slug).solution_viewed=!!viewed;
}

function toggleSolutionViewed(event, slug){
  if(event){event.preventDefault();event.stopPropagation();}
  var current=!!ensureProblemDataEntry(slug).solution_viewed;
  var next=!current;
  fetch('/api/problem',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({action:'set_solution_viewed',slug:slug,viewed:next})
  }).then(function(r){return r.json()}).then(function(data){
    if(data&&data.ok){
      setSolutionViewed(slug, next);
      renderTodayFocus();
      renderTodayPlan();
      renderTable();
    }
  }).catch(function(){});
}

function toggleMustRepeat(event, slug){
  if(event){event.preventDefault();event.stopPropagation();}
  var current=!!ensureProblemDataEntry(slug).must_repeat;
  var next=!current;
  fetch('/api/problem',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({action:'set_must_repeat',slug:slug,repeat:next})
  }).then(function(r){return r.json()}).then(function(data){
    if(data&&data.ok){
      ensureProblemDataEntry(slug).must_repeat=!!next;
      renderTodayFocus();
      renderTodayPlan();
      renderTable();
    }
  }).catch(function(){});
}

// ====== Tab Navigation ======
function switchTab(tabName){
  document.querySelectorAll('.nav-item').forEach(function(n){n.classList.remove('active')});
  document.querySelectorAll('.tab-content').forEach(function(tc){tc.classList.remove('active')});
  var navEl=document.querySelector('[data-tab="'+tabName+'"]');
  if(navEl) navEl.classList.add('active');
  var tabEl=document.getElementById('tab-'+tabName);
  if(tabEl) tabEl.classList.add('active');
  location.hash=tabName;
}
document.querySelectorAll('.nav-item').forEach(function(item){
  item.addEventListener('click', function(){
    switchTab(item.dataset.tab);
    // Resize charts when switching to dashboard
    if (item.dataset.tab === 'dashboard') {
      setTimeout(function(){
        ['gauge','rounds','radar','trend','heatmap'].forEach(function(id){
          var c = echarts.getInstanceByDom(document.getElementById(id));
          if(c) c.resize();
        });
      }, 50);
    }
    if (item.dataset.tab === 'checkin') {
      setTimeout(function(){
        var c = echarts.getInstanceByDom(document.getElementById('checkin-trend'));
        if(c) c.resize();
      }, 50);
    }
  });
});

// ====== Keyboard Shortcuts ======
document.addEventListener('keydown',function(e){
  if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'||e.target.tagName==='SELECT') return;
  var tabs=['dashboard','chat','progress','review','checkin','optimize','resume','interview','settings'];
  var num=parseInt(e.key);
  if(num>=1&&num<=tabs.length){ switchTab(tabs[num-1]); }
});

// ====== User Profile ======
function setupUserProfile(){
  var p=D.user_profile;
  var profileEl=document.getElementById('user-profile');
  var loginBar=document.getElementById('user-login-bar');
  var expiredBar=document.getElementById('session-expired-bar');
  var sessionValid=D.session_valid!==false;
  if(p&&p.username&&sessionValid){
    document.getElementById('user-avatar').src=p.avatar||'';
    document.getElementById('user-name').textContent=p.username;
    profileEl.style.display='flex';
    if(!p.avatar) document.getElementById('user-avatar').style.display='none';
  } else if(p&&p.username&&!sessionValid){
    document.getElementById('user-avatar').src=p.avatar||'';
    document.getElementById('user-name').textContent=p.username;
    profileEl.style.display='flex';
    if(!p.avatar) document.getElementById('user-avatar').style.display='none';
    expiredBar.innerHTML=t('session_expired')+'<br><button onclick="document.getElementById(\'user-logout-btn\').click()">'+t('session_relogin')+'</button>';
    expiredBar.style.display='block';
  } else {
    loginBar.style.display='flex';
  }
}

// ====== Sync ======
function setupSync(){
  var syncNav=document.getElementById('sync-btn-nav');
  var syncSep=document.getElementById('sync-sep');
  var syncText=document.getElementById('sync-btn-text');
  var p=D.user_profile;
  var sessionValid=D.session_valid!==false;
  if(p&&p.username&&sessionValid){
    syncNav.style.display='flex';
    syncSep.style.display='';
  }
  syncNav.addEventListener('click',function(){
    if(!confirm('Sync now? This will fetch latest submissions from LeetCode.')) return;
    syncText.textContent='Syncing...';
    syncNav.style.pointerEvents='none';
    syncNav.style.opacity='0.5';
    fetch('/api/sync',{method:'POST'}).then(function(){
      var oldRounds=D.done_rounds;
      var poll=setInterval(function(){
        fetch('/api/data').then(function(r){return r.json()}).then(function(nd){
          if(nd.done_rounds!==oldRounds||nd.total!==D.total){
            clearInterval(poll);
            location.reload();
          }
        }).catch(function(){});
      },3000);
      setTimeout(function(){clearInterval(poll);syncText.textContent='Sync Now';syncNav.style.pointerEvents='';syncNav.style.opacity='1';location.reload();},30000);
    });
  });
}

// ====== Logout / Login ======
function setupAuth(){
  document.getElementById('user-logout-btn').addEventListener('click',function(){
    if(!confirm('Log out and switch account?')) return;
    fetch('/api/logout',{method:'POST'}).then(function(){location.reload();});
  });
  document.getElementById('user-login-btn').addEventListener('click',function(){
    var btn=this;
    btn.disabled=true;
    btn.textContent='Opening browser...';
    fetch('/api/login',{method:'POST'}).then(function(){
      btn.textContent='Complete login in browser, then wait...';
      var poll=setInterval(function(){
        fetch('/api/data').then(function(r){return r.json()}).then(function(d){
          if(d.user_profile&&d.user_profile.username){
            clearInterval(poll);
            location.reload();
          }
        }).catch(function(){});
      },3000);
    });
  });
}

// ====== Badge Counts ======
function setupBadges(){
  if (D.review_due && D.review_due.length > 0) {
    var navReview = document.getElementById('nav-review');
    // Remove existing badges first
    var existing = navReview.querySelector('.badge');
    if (existing) existing.remove();
    var badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = D.review_due.length;
    navReview.appendChild(badge);
  }
  if (D.optimizations && D.optimizations.length > 0) {
    var navOpt = document.getElementById('nav-optimize');
    var existing2 = navOpt.querySelector('.badge');
    if (existing2) existing2.remove();
    var badge2 = document.createElement('span');
    badge2.className = 'badge';
    badge2.style.background = '#d29922';
    badge2.textContent = D.optimizations.length;
    navOpt.appendChild(badge2);
  }
}

// ====== Auto Refresh ======
function setupAutoRefresh(){
  var fingerprint=D.done_rounds+'|'+D.done_problems+'|'+(D.review_due?D.review_due.length:0)+'|'+(D.optimizations?D.optimizations.length:0)+'|'+(D.new_todo?D.new_todo.length:0);
  setInterval(function(){
    fetch('/api/data').then(function(r){return r.json()}).then(function(nd){
      var nf=nd.done_rounds+'|'+nd.done_problems+'|'+(nd.review_due?nd.review_due.length:0)+'|'+(nd.optimizations?nd.optimizations.length:0)+'|'+(nd.new_todo?nd.new_todo.length:0);
      if(nf!==fingerprint){
        fingerprint=nf;
        location.reload();
      }
    }).catch(function(){});
  }, 30000);
}

// ====== Data Loading ======
async function fetchData() {
  try {
    var resp = await fetch('/api/data');
    window.D = await resp.json();

    // Populate stat cards
    setText('stat-done-rounds', D.done_rounds);
    setText('stat-total-rounds', D.total_rounds);
    setText('stat-rate', D.rate);
    setText('stat-today-ac', D.today_ac);
    setText('stat-done-all', D.done_all);
    setText('stat-total', D.total);
    setText('stat-streak', D.streak);
    setText('stat-total-days', D.total_days);
    setText('stat-est', D.est);

    // Streak class
    var streakContainer = document.getElementById('stat-streak-container');
    if (streakContainer && D.streak_class) {
      streakContainer.className = 'num ' + D.streak_class;
    }

    // Today's date in sidebar
    var todayEl = document.getElementById('sidebar-today');
    if (todayEl) todayEl.textContent = D.today || new Date().toISOString().slice(0,10);

    // Setup user profile, sync, auth, badges
    setupUserProfile();
    setupSync();
    setupAuth();
    setupBadges();

    // Init all modules
    if (typeof initDashboard === 'function') initDashboard();
    if (typeof initProgress === 'function') initProgress();
    if (typeof initReview === 'function') initReview();
    if (typeof initChat === 'function') initChat();
    if (typeof initCheckin === 'function') initCheckin();
    if (typeof initOptimize === 'function') initOptimize();
    if (typeof initResume === 'function') initResume();
    if (typeof initInterview === 'function') initInterview();
    if (typeof initSettings === 'function') initSettings();

    // Apply language
    applyLang();

    // Restore tab from hash
    if(location.hash){var ht=location.hash.slice(1);if(document.getElementById('tab-'+ht)) switchTab(ht);}

    // Auto refresh
    setupAutoRefresh();
  } catch(e) {
    console.error('Failed to load data:', e);
  }
}

document.addEventListener('DOMContentLoaded', fetchData);
