// ====== Optimize ======

function initOptimize(){
  var container=document.getElementById('optimize-list');
  var count=document.getElementById('opt-count');
  if(!D.optimizations||D.optimizations.length===0){
    container.innerHTML='<div class="empty-state"><div class="icon">&#9889;</div><p>'+t('no_opt')+'</p></div>';
    count.textContent='(0)';
    return;
  }
  count.textContent='('+D.optimizations.length+')';
  var html='';
  D.optimizations.forEach(function(o,i){
    var rtPct=o.runtime_pct||0;
    var memPct=o.memory_pct||0;
    var rtClass=rtPct<30?'pct-low':rtPct<50?'pct-mid':'pct-high';
    var memClass=memPct<30?'pct-low':memPct<50?'pct-mid':'pct-high';
    var sugs='';
    if(o.suggestions){o.suggestions.forEach(function(s){sugs+='<li>'+s+'</li>';});}

    var aiHtml='';
    if(o.ai_analysis){
      aiHtml='<div class="ai-section">'
        +'<div class="ai-label">'+t('ai_analysis')+' <button class="ai-toggle" onclick="var b=document.getElementById(\'ai-'+i+'\');b.style.display=b.style.display===\'none\'?\'block\':\'none\';this.textContent=b.style.display===\'none\'?t(\'btn_expand\'):t(\'btn_collapse\');">'+t('btn_collapse')+'</button></div>'
        +'<div class="ai-content" id="ai-'+i+'">'+mdToHtml(o.ai_analysis)+'</div>'
        +'</div>';
    }

    html+='<div class="opt-card">'
      +'<div class="opt-header"><span class="opt-title">'+o.title+'</span><span class="opt-lang">'+(o.lang||'')+'</span></div>'
      +'<div class="opt-metrics">'
      +'<div class="opt-metric">'+t('runtime')+(o.runtime||'N/A')+' <div class="pct-bar"><div class="pct-fill '+rtClass+'" style="width:'+rtPct+'%"></div></div> '+rtPct.toFixed(1)+'%</div>'
      +'<div class="opt-metric">'+t('memory')+(o.memory||'N/A')+' <div class="pct-bar"><div class="pct-fill '+memClass+'" style="width:'+memPct+'%"></div></div> '+memPct.toFixed(1)+'%</div>'
      +'</div>'
      +(sugs?'<ul class="opt-suggestions">'+sugs+'</ul>':'')
      +aiHtml
      +(o.code?'<button class="code-toggle" onclick="var b=document.getElementById(\'code-'+i+'\');b.classList.toggle(\'show\');this.textContent=b.classList.contains(\'show\')?t(\'hide_code\'):t(\'show_code\');">'+t('show_code')+'</button><pre class="code-block" id="code-'+i+'">'+o.code.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</pre>':'')
      +'</div>';
  });
  container.innerHTML=html;
}
