// ====== Dashboard ======

function renderTodayFocus(){
  var list=document.getElementById('today-focus-list');
  var count=document.getElementById('today-focus-count');
  var category=document.getElementById('today-focus-category');
  if(!list||!count||!category) return;
  var items=D.today_focus||[];
  var target=D.today_focus_target||5;
  count.textContent=items.length+'/'+target;
  category.textContent=D.today_focus_category?t('focus_type_hint').replace('{category}',D.today_focus_category):'';
  if(items.length===0){
    list.innerHTML='<li class="focus-item"><div class="focus-main" style="color:var(--dim)">'+t('focus_empty')+'</div></li>';
    return;
  }
  var h='';
  items.forEach(function(item){
    var dc=item.difficulty==='简单'?'diff-easy':item.difficulty==='困难'?'diff-hard':'diff-medium';
    var pdata=ensureProblemDataEntry(item.slug);
    var viewed=!!pdata.solution_viewed;
    var repeat=!!pdata.must_repeat;
    h+='<li class="focus-item"><div class="focus-main">'
      +'<a href="https://leetcode.cn/problems/'+item.slug+'/" target="_blank">'+item.title+'</a>'
      +'<div class="today-meta"><span class="tag tag-cat">'+item.category+'</span><span class="tag '+dc+'">'+item.difficulty+'</span>'+(viewed?'<span class="tag tag-solution">'+t('solution_viewed')+'</span>':'')+(repeat?'<span class="tag tag-repeat">'+t('must_repeat')+'</span>':'')+'</div>'
      +'</div><div class="focus-actions">'
      +'<button class="repeat-btn'+(repeat?' active':'')+'" onclick="toggleMustRepeat(event,\''+item.slug+'\')">'+mustRepeatText(repeat)+'</button>'
      +'<button class="solution-btn'+(viewed?' active':'')+'" onclick="toggleSolutionViewed(event,\''+item.slug+'\')">'+solutionViewedText(viewed)+'</button>'
      +'<button class="focus-done-btn" onclick="checkTodayFocusDone(this,\''+item.slug+'\')">'+t('focus_done')+'</button>'
      +'</div></li>';
  });
  list.innerHTML=h;
}

function checkTodayFocusDone(btn, slug){
  if(!btn||btn.disabled) return;
  var oldText=btn.textContent;
  btn.disabled=true;
  btn.textContent=t('focus_checking');
  fetch('/api/today-focus',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({action:'check_done',slug:slug})
  }).then(function(r){return r.json()}).then(function(data){
    if(data&&data.ok&&data.completed_today){
      location.reload();
      return;
    }
    alert((data&&data.message)||t('focus_not_done'));
    btn.disabled=false;
    btn.textContent=oldText;
  }).catch(function(){
    alert(t('net_error'));
    btn.disabled=false;
    btn.textContent=oldText;
  });
}

function renderTodayPlan(){
  // New todos (R1 not done)
  var newList=document.getElementById('today-new');
  var newCount=document.getElementById('new-count');
  var todos=D.new_todo||[];
  newCount.textContent=todos.length;
  if(todos.length===0){
    newList.innerHTML='<li style="color:var(--dim)">'+t('r1_done')+'</li>';
  } else {
    var h='';
    todos.forEach(function(item){
      var dc=item.difficulty==='简单'?'diff-easy':item.difficulty==='困难'?'diff-hard':'diff-medium';
      var pdata=ensureProblemDataEntry(item.slug);
      var viewed=!!pdata.solution_viewed;
      var repeat=!!pdata.must_repeat;
      h+='<li><div class="today-main">'
        +'<a href="https://leetcode.cn/problems/'+item.slug+'/" target="_blank">'+item.title+'</a>'
        +'<div class="today-meta"><span class="tag tag-cat">'+item.category+'</span><span class="tag '+dc+'">'+item.difficulty+'</span>'+(viewed?'<span class="tag tag-solution">'+t('solution_viewed')+'</span>':'')+(repeat?'<span class="tag tag-repeat">'+t('must_repeat')+'</span>':'')+'</div>'
        +'</div>'
        +'<button class="repeat-btn'+(repeat?' active':'')+'" onclick="toggleMustRepeat(event,\''+item.slug+'\')">'+mustRepeatText(repeat)+'</button>'
        +'<button class="solution-btn'+(viewed?' active':'')+'" onclick="toggleSolutionViewed(event,\''+item.slug+'\')">'+solutionViewedText(viewed)+'</button></li>';
    });
    newList.innerHTML=h;
  }

  // Review due
  var revList=document.getElementById('today-review');
  var revCount=document.getElementById('review-count-dash');
  var reviews=D.review_due||[];
  revCount.textContent=reviews.length;
  if(reviews.length===0){
    revList.innerHTML='<li style="color:var(--green)">'+t('no_review')+'</li>';
  } else {
    var h='';
    reviews.forEach(function(r){
      var status=r.overdue>0?'<span class="tag tag-review">'+t('overdue').replace('{n}',r.overdue)+'</span>':'<span class="tag tag-new">'+t('due_today')+'</span>';
      var titleHtml=r.slug?'<a href="https://leetcode.cn/problems/'+r.slug+'/" target="_blank">'+r.title+'</a>':r.title;
      h+='<li><span>'+titleHtml+'</span><div class="today-meta"><span class="tag tag-cat">'+r.round+'</span>'+status+'</div></li>';
    });
    revList.innerHTML=h;
  }
}

function initCharts(){
  // Gauge
  echarts.init(document.getElementById('gauge')).setOption({
    series: [{
      type:'gauge', startAngle:200, endAngle:-20, min:0, max:100,
      axisLine:{lineStyle:{width:20,color:[[0.2,'#007ec6'],[0.5,'#dfb317'],[0.8,'#97ca00'],[1,'#4c1']]}},
      pointer:{itemStyle:{color:'#58a6ff'}},
      axisTick:{show:false}, splitLine:{show:false},
      axisLabel:{color:'#8b949e',fontSize:12},
      detail:{valueAnimation:true,formatter:'{value}%',color:'#e6edf3',fontSize:28,offsetCenter:[0,'70%']},
      data:[{value:D.rate}]
    }]
  });

  // Rounds bar
  echarts.init(document.getElementById('rounds')).setOption({
    tooltip:{trigger:'axis'},
    xAxis:{type:'category',data:['R1','R2','R3','R4','R5'],axisLabel:{color:'#8b949e'},axisLine:{lineStyle:{color:'#30363d'}}},
    yAxis:{type:'value',max:D.total,axisLabel:{color:'#8b949e'},splitLine:{lineStyle:{color:'#21262d'}}},
    series:[{
      type:'bar',data:D.per_round,barWidth:'50%',
      itemStyle:{borderRadius:[6,6,0,0],color:function(p){return['#4c1','#97ca00','#dfb317','#007ec6','#e34c26'][p.dataIndex]}},
      label:{show:true,position:'top',color:'#e6edf3'}
    }]
  });

  // Radar
  var catNames=D.categories.map(function(c){return c[0]});
  var catR1=D.categories.map(function(c){return c[1]});
  echarts.init(document.getElementById('radar')).setOption({
    radar:{
      indicator:catNames.map(function(n){return {name:n,max:100}}),
      axisName:{color:'#8b949e',fontSize:11},
      splitArea:{areaStyle:{color:['#161b22','#1a2030']}},
      axisLine:{lineStyle:{color:'#30363d'}},
      splitLine:{lineStyle:{color:'#30363d'}},
    },
    series:[{type:'radar',data:[{
      value:catR1,name:'R1 rate',
      areaStyle:{color:'rgba(88,166,255,0.25)'},
      lineStyle:{color:'#58a6ff'},itemStyle:{color:'#58a6ff'}
    }]}]
  });

  // Trend
  if(D.daily.length>0){
    var dates=D.daily.map(function(d){return d[0]});
    var newC=D.daily.map(function(d){return d[1]});
    var revC=D.daily.map(function(d){return d[2]});
    echarts.init(document.getElementById('trend')).setOption({
      tooltip:{trigger:'axis'},
      legend:{data:[t('chart_new'),t('chart_review')],textStyle:{color:'#8b949e'}},
      xAxis:{type:'category',data:dates,axisLabel:{color:'#8b949e'},axisLine:{lineStyle:{color:'#30363d'}}},
      yAxis:{type:'value',axisLabel:{color:'#8b949e'},splitLine:{lineStyle:{color:'#21262d'}}},
      series:[
        {name:t('chart_new'),type:'bar',stack:'total',data:newC,itemStyle:{color:'#58a6ff'}},
        {name:t('chart_review'),type:'bar',stack:'total',data:revC,itemStyle:{color:'#3fb950'}}
      ]
    });
  } else {
    document.getElementById('trend').innerHTML='<div class="empty-state"><p>'+t('empty')+'</p></div>';
  }

  // Heatmap
  (function(){
    var el=document.getElementById('heatmap');
    var chart=echarts.init(el);
    var today=new Date();
    var start=new Date(today);start.setDate(start.getDate()-365);
    var isLight=document.body.classList.contains('light');
    var bgColor=isLight?'#ebedf0':'#161b22';
    var colors=isLight?['#ebedf0','#9be9a8','#40c463','#30a14e','#216e39']:['#2d333b','#0e4429','#006d32','#26a641','#39d353'];
    chart.setOption({
      tooltip:{
        formatter:function(p){
          if(!p.value) return '';
          var d=p.value[0],n=p.value[1]||0;
          return '<div style="font-size:12px;padding:2px 4px"><strong>'+d+'</strong><br/>'+n+' problem'+(n!==1?'s':'')+'</div>';
        },
        backgroundColor:isLight?'#fff':'#1c2129',
        borderColor:isLight?'#d0d7de':'#30363d',
        textStyle:{color:isLight?'#1f2328':'#e6edf3'},
      },
      visualMap:{
        min:0,max:6,show:true,orient:'horizontal',
        right:20,bottom:10,
        itemWidth:12,itemHeight:12,
        text:['More','Less'],
        textStyle:{color:'#8b949e',fontSize:10},
        inRange:{color:colors},
      },
      calendar:{
        range:[start.toISOString().slice(0,10),today.toISOString().slice(0,10)],
        cellSize:[14,14],
        itemStyle:{color:isLight?'#ebedf0':'#2d333b',borderWidth:3,borderColor:isLight?'#fff':'#161b22',borderRadius:2},
        splitLine:{show:false},
        dayLabel:{color:'#8b949e',nameMap:['','Mon','','Wed','','Fri',''],fontSize:10,margin:8},
        monthLabel:{color:'#8b949e',fontSize:11,margin:12},
        yearLabel:{show:false},
        top:30,left:50,right:40,
      },
      series:[{
        type:'heatmap',coordinateSystem:'calendar',data:D.heatmap_data,
        itemStyle:{borderRadius:2},
      }]
    });
  })();

  // Trend Stats
  (function(){
    var ts=D.trend_stats||{};
    var el=document.getElementById('trend-stats');
    if(!el) return;
    function card(label,val,sub,subClass){
      return '<div class="trend-item"><div class="trend-value">'+val+'</div><div class="trend-label">'+label+'</div>'
        +(sub?'<div class="trend-sub '+subClass+'">'+sub+'</div>':'')+'</div>';
    }
    var wc=ts.week_change||0;
    var wcText=wc>0?'+'+wc+'%':wc+'%';
    var wcClass=wc>0?'trend-up':wc<0?'trend-down':'trend-neutral';
    el.className='trend-grid';
    el.innerHTML=card('This Week',ts.this_week||0,wcText,wcClass)
      +card('Last Week',ts.last_week||0,'','')
      +card('This Month',ts.this_month||0,'','')
      +card('Last Month',ts.last_month||0,'','')
      +card('Avg Daily',ts.avg_daily||0,'last 30 days','trend-neutral');
  })();

  // Review Calendar
  (function(){
    var cal=document.getElementById('review-calendar');
    if(!cal||!D.review_due) return;
    var byDate={};
    D.review_due.forEach(function(r){
      var dd=r.due_date||'';
      if(!dd) return;
      if(!byDate[dd]) byDate[dd]=[];
      byDate[dd].push(r);
    });
    var today=new Date();
    var html='';
    for(var i=0;i<14;i++){
      var d=new Date(today);d.setDate(d.getDate()+i);
      var ds=d.toISOString().slice(0,10);
      var count=0;
      D.review_due.forEach(function(r){
        var dueD=r.due_date||ds;
        if(dueD<=ds) count++;
      });
      if(i>0){ count=(byDate[ds]||[]).length; }
      var countClass=count===0?'cal-0':count<=2?'cal-low':count<=5?'cal-mid':'cal-high';
      var label=ds.slice(5);
      var dayName=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
      html+='<div class="cal-day">'
        +'<div class="cal-day-name">'+dayName+'</div>'
        +'<div class="cal-day-date">'+label+'</div>'
        +'<div class="cal-day-count '+countClass+'">'+count+'</div>'
        +'</div>';
    }
    cal.className='cal-grid';
    cal.innerHTML=html;
  })();

  // Window resize handler
  window.addEventListener('resize',function(){
    ['gauge','rounds','radar','trend','heatmap','checkin-trend'].forEach(function(id){
      var el=document.getElementById(id);
      if(el){var c=echarts.getInstanceByDom(el);if(c)c.resize();}
    });
  });
}

function initDashboard(){
  renderTodayFocus();
  renderTodayPlan();
  initCharts();
}
