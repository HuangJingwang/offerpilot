// ====== Settings ======

function initSettings(){
  var cfg=D.plan_config||{rounds:5,intervals:[1,3,7,14],daily_new:5,daily_review:10,deadline:''};
  // Populate problem list selector
  var listSelect=document.getElementById('set-problem-list');
  var lists=D.available_lists||{};
  Object.keys(lists).forEach(function(k){
    var o=document.createElement('option');
    o.value=k;
    o.textContent=lists[k].name+' ('+lists[k].count+')';
    listSelect.appendChild(o);
  });
  listSelect.value=cfg.problem_list||'hot100';

  document.getElementById('set-rounds').value=cfg.rounds;
  document.getElementById('set-intervals').value=cfg.intervals.join(', ');
  document.getElementById('set-daily-new').value=cfg.daily_new;
  document.getElementById('set-daily-review').value=cfg.daily_review;
  document.getElementById('set-deadline').value=cfg.deadline||'';

  function updatePace(){
    var card=document.getElementById('pace-card');
    var r1Done=D.per_round[0]||0;
    var total=D.total;
    var r1Remaining=total-r1Done;
    var deadline=document.getElementById('set-deadline').value;
    var dailyNew=parseInt(document.getElementById('set-daily-new').value)||5;
    var html='<h3 data-i18n="settings_daily_pace">'+t('settings_daily_pace')+'</h3>';
    html+='<div class="pace-row"><span>R1 '+t('settings_remaining')+'</span><span>'+r1Remaining+' / '+total+'</span></div>';
    if(deadline){
      var today=new Date();
      var dl=new Date(deadline);
      var daysLeft=Math.max(1,Math.ceil((dl-today)/(1000*60*60*24)));
      var pace=Math.ceil(r1Remaining/daysLeft);
      html+='<div class="pace-row"><span>'+t('settings_days_left')+'</span><span>'+daysLeft+'</span></div>';
      html+='<div class="pace-row"><span style="color:var(--accent)">R1 '+t('settings_daily_new')+'</span><span style="color:var(--accent);font-weight:bold">'+pace+' / day</span></div>';
    } else {
      var daysNeeded=Math.ceil(r1Remaining/dailyNew);
      html+='<div class="pace-row"><span>'+t('settings_daily_new')+' = '+dailyNew+'</span><span>~'+daysNeeded+' days</span></div>';
    }
    card.innerHTML=html;
  }
  updatePace();

  // AI Usage display
  var usageEl=document.getElementById('ai-usage-display');
  if(usageEl&&D.ai_usage){
    var u=D.ai_usage;
    var todayCalls=0,todayTokens=0;
    var today=new Date().toISOString().slice(0,10);
    if(u.daily&&u.daily[today]){todayCalls=u.daily[today].calls;todayTokens=u.daily[today].tokens;}
    usageEl.innerHTML=
      '<div class="usage-card"><div class="usage-value">'+u.total_calls+'</div><div class="usage-label">Total Calls</div></div>'
      +'<div class="usage-card"><div class="usage-value">'+(u.total_tokens>1000?(u.total_tokens/1000).toFixed(1)+'k':u.total_tokens)+'</div><div class="usage-label">Total Tokens</div></div>'
      +'<div class="usage-card"><div class="usage-value">'+todayCalls+'</div><div class="usage-label">Today Calls</div></div>'
      +'<div class="usage-card"><div class="usage-value">'+(todayTokens>1000?(todayTokens/1000).toFixed(1)+'k':todayTokens)+'</div><div class="usage-label">Today Tokens</div></div>';
  }
  document.getElementById('set-deadline').addEventListener('change',updatePace);
  document.getElementById('set-daily-new').addEventListener('change',updatePace);

  // Push config
  var pc=D.push_config||{};
  document.getElementById('set-smtp-to').value=pc.smtp_to||'';
  document.getElementById('set-smtp-host').value=pc.smtp_host||'';
  document.getElementById('set-smtp-user').value=pc.smtp_user||'';
  document.getElementById('set-smtp-port').value=pc.smtp_port||587;
  document.getElementById('set-webhook').value=pc.webhook_url||'';

  document.getElementById('push-config-save').addEventListener('click',function(){
    var pushCfg={
      smtp_to:document.getElementById('set-smtp-to').value,
      smtp_host:document.getElementById('set-smtp-host').value,
      smtp_user:document.getElementById('set-smtp-user').value,
      smtp_pass:document.getElementById('set-smtp-pass').value,
      smtp_port:parseInt(document.getElementById('set-smtp-port').value)||587,
      webhook_url:document.getElementById('set-webhook').value,
    };
    fetch('/api/push-config',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({action:'save',config:pushCfg})
    }).then(function(r){return r.json()}).then(function(d){
      document.getElementById('push-status').textContent=d.ok?'Saved!':'Error';
    });
  });

  document.getElementById('push-test-btn').addEventListener('click',function(){
    var pushCfg={
      smtp_to:document.getElementById('set-smtp-to').value,
      smtp_host:document.getElementById('set-smtp-host').value,
      smtp_user:document.getElementById('set-smtp-user').value,
      smtp_pass:document.getElementById('set-smtp-pass').value,
      smtp_port:parseInt(document.getElementById('set-smtp-port').value)||587,
      webhook_url:document.getElementById('set-webhook').value,
    };
    document.getElementById('push-status').textContent='Sending...';
    fetch('/api/push-config',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({action:'save',config:pushCfg})
    }).then(function(){
      return fetch('/api/push-config',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({action:'test'})});
    }).then(function(r){return r.json()}).then(function(d){
      document.getElementById('push-status').textContent=d.ok?'Test sent! Check your inbox.':'Failed';
    });
  });

  document.getElementById('settings-save-btn').addEventListener('click',function(){
    var intervals=document.getElementById('set-intervals').value.split(',').map(function(s){return parseInt(s.trim())}).filter(function(n){return !isNaN(n)&&n>0});
    var newCfg={
      problem_list:document.getElementById('set-problem-list').value||'hot100',
      rounds:parseInt(document.getElementById('set-rounds').value)||5,
      intervals:intervals,
      daily_new:parseInt(document.getElementById('set-daily-new').value)||5,
      daily_review:parseInt(document.getElementById('set-daily-review').value)||10,
      deadline:document.getElementById('set-deadline').value||''
    };
    fetch('/api/settings',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify(newCfg)
    }).then(function(r){return r.json()}).then(function(d){
      if(d.ok){ location.hash='settings'; location.reload(); }
    });
  });
}
