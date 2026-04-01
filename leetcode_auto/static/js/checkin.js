// ====== Check-in ======

function initCheckin(){
  var container=document.getElementById('checkin-timeline');
  if(D.checkins.length===0){
    container.innerHTML='<div class="empty-state"><div class="icon">&#128197;</div><p>'+t('empty')+'</p></div>';
    document.getElementById('checkin-trend').innerHTML='<div class="empty-state"><p>'+t('empty')+'</p></div>';
    return;
  }
  var html='';
  D.checkins.forEach(function(c){
    html+='<div class="timeline-item'+(c.total===0?' empty':'')+'">'
      +'<div class="timeline-date">'+c.date+'</div>'
      +'<div class="timeline-stats">'
      +'<span class="timeline-new">'+t('chart_new')+' '+c.new+'</span>'
      +'<span class="timeline-review">'+t('chart_review')+' '+c.review+'</span>'
      +'<span class="timeline-total">Total '+c.total+'</span>'
      +'</div>'
      +'</div>';
  });
  container.innerHTML=html;

  // Checkin trend chart
  var dates=D.checkins.slice().reverse().slice(-30).map(function(c){return c.date.slice(5)});
  var newC=D.checkins.slice().reverse().slice(-30).map(function(c){return c.new});
  var revC=D.checkins.slice().reverse().slice(-30).map(function(c){return c.review});
  echarts.init(document.getElementById('checkin-trend')).setOption({
    tooltip:{trigger:'axis'},
    legend:{data:[t('chart_new'),t('chart_review')],textStyle:{color:'#8b949e'}},
    xAxis:{type:'category',data:dates,axisLabel:{color:'#8b949e',rotate:45},axisLine:{lineStyle:{color:'#30363d'}}},
    yAxis:{type:'value',axisLabel:{color:'#8b949e'},splitLine:{lineStyle:{color:'#21262d'}}},
    series:[
      {name:t('chart_new'),type:'line',data:newC,smooth:true,itemStyle:{color:'#58a6ff'},areaStyle:{color:'rgba(88,166,255,0.1)'}},
      {name:t('chart_review'),type:'line',data:revC,smooth:true,itemStyle:{color:'#3fb950'},areaStyle:{color:'rgba(63,185,80,0.1)'}}
    ]
  });
}
