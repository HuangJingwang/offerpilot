// ====== Progress Table ======

function renderTable(){
  var search=document.getElementById('search-input').value.toLowerCase();
  var diffF=document.getElementById('filter-difficulty').value;
  var catF=document.getElementById('filter-category').value;
  var statusF=document.getElementById('filter-status').value;
  var hasFilter=search||diffF||catF||statusF;
  document.getElementById('clear-filters').style.display=hasFilter?'inline-block':'none';

  var filtered=D.rows.filter(function(r){
    if(search && r.title.toLowerCase().indexOf(search)===-1 && r.num.toString().indexOf(search)===-1) return false;
    if(diffF){
      var d=r.difficulty;
      if(diffF==='easy'&&d!=='简单') return false;
      if(diffF==='medium'&&d!=='中等') return false;
      if(diffF==='hard'&&d!=='困难') return false;
    }
    if(catF && r.category!==catF) return false;
    if(statusF){
      var hasR1=r.r1&&r.r1!=='—'&&r.r1.trim()!=='';
      var rKeys2=[];Object.keys(r).forEach(function(k){if(k.match(/^r\d+$/))rKeys2.push(k)});
      var allDone=rKeys2.every(function(k){return r[k]&&r[k]!=='—'&&r[k].trim()!==''});
      if(statusF==='not-started'&&hasR1) return false;
      if(statusF==='in-progress'&&(!hasR1||allDone)) return false;
      if(statusF==='completed'&&!allDone) return false;
      if(statusF==='must-repeat'&&!ensureProblemDataEntry(r.slug).must_repeat) return false;
    }
    return true;
  });

  document.getElementById('table-count').textContent=t('table_count')
    .replace('{problems_done}', D.started_problems||0)
    .replace('{problems_total}', D.total||0)
    .replace('{done}', D.done_rounds||0)
    .replace('{rounds}', D.total_rounds||0)
    .replace('{shown}', filtered.length)
    .replace('{total}', D.rows.length);
  var html='';
  var rKeys3=[];
  if(D.rows.length>0){Object.keys(D.rows[0]).forEach(function(k){if(k.match(/^r\d+$/))rKeys3.push(k)});rKeys3.sort();}
  filtered.forEach(function(r,idx){
    var diffClass=r.difficulty==='简单'?'diff-easy':r.difficulty==='困难'?'diff-hard':'diff-medium';
    function rc(v){
      if(v&&v!=='—'&&v.trim()!=='') return '<td class="round-cell"><span class="round-done">'+v+'</span></td>';
      return '<td class="round-cell"><span class="round-empty">-</span></td>';
    }
    var statusClass=r.status==='已完成'?'status-done':'status-progress';
    var statusText=r.status||'-';
    var roundCells=rKeys3.map(function(k){return rc(r[k])}).join('');
    var pdata=ensureProblemDataEntry(r.slug);
    var viewed=!!pdata.solution_viewed;
    var repeat=!!pdata.must_repeat;
    var solutionTag=viewed?'<span class="tag tag-solution" style="margin-left:8px">'+t('solution_viewed')+'</span>':'';
    var repeatTag=repeat?'<span class="tag tag-repeat" style="margin-left:8px">'+t('must_repeat')+'</span>':'';
    html+='<tr style="cursor:pointer" data-slug="'+r.slug+'">'
      +'<td>'+r.num+'</td>'
      +'<td><a href="https://leetcode.cn/problems/'+r.slug+'/" target="_blank" onclick="event.stopPropagation()">'+r.title+'</a>'+solutionTag+repeatTag+'</td>'
      +'<td class="'+diffClass+'">'+r.difficulty+'</td>'
      +'<td><span class="cat-tag">'+r.category+'</span></td>'
      +roundCells
      +'<td class="'+statusClass+'">'+statusText+'</td>'
      +'</tr>';
    // Note row
    var note=pdata.notes||'';
    var reviews=pdata.ai_reviews||[];
    var reviewHtml='';
    if(reviews.length>0){
      reviewHtml='<details class="note-ai-reviews"><summary>AI 分析历史 ('+reviews.length+')</summary>';
      reviews.forEach(function(rv){reviewHtml+='<div style="margin:6px 0;padding:6px;background:var(--bg);border-radius:4px"><strong>'+rv.round+' ('+rv.date+')</strong><br>'+rv.analysis+'</div>';});
      reviewHtml+='</details>';
    }
    html+='<tr class="note-row"><td colspan="'+(4+rKeys3.length+1)+'">'
      +'<textarea class="note-textarea" data-slug="'+r.slug+'" placeholder="'+t('notes_ph')+'">'+note.replace(/</g,'&lt;')+'</textarea>'
      +'<div class="note-actions"><button class="note-save-btn" onclick="saveNote(this)" data-i18n="notes_save">'+t('notes_save')+'</button><button class="repeat-btn'+(repeat?' active':'')+'" onclick="toggleMustRepeat(event,\''+r.slug+'\')">'+mustRepeatText(repeat)+'</button><button class="solution-btn'+(viewed?' active':'')+'" onclick="toggleSolutionViewed(event,\''+r.slug+'\')">'+solutionViewedText(viewed)+'</button></div>'
      +reviewHtml
      +'</td></tr>';
  });
  document.getElementById('progress-body').innerHTML=html;
  // Click to toggle notes
  document.querySelectorAll('#progress-body tr[data-slug]').forEach(function(tr){
    tr.addEventListener('click',function(){
      var noteRow=tr.nextElementSibling;
      if(noteRow) noteRow.classList.toggle('show');
    });
  });
}

function saveNote(btn){
  var textarea=btn.parentElement.previousElementSibling;
  var slug=textarea.getAttribute('data-slug');
  fetch('/api/problem',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({action:'save_note',slug:slug,note:textarea.value})
  }).then(function(){btn.textContent='✓';setTimeout(function(){btn.textContent=t('notes_save')},1000)});
}

function initProgress(){
  // Populate category dropdown
  var allCategories=[...new Set(D.rows.map(function(r){return r.category}))].sort();
  var catSelect=document.getElementById('filter-category');
  allCategories.forEach(function(c){var o=document.createElement('option');o.value=c;o.textContent=c;catSelect.appendChild(o);});

  // Filter event listeners
  document.getElementById('search-input').addEventListener('input',function(){renderTable()});
  document.getElementById('filter-difficulty').addEventListener('change',function(){renderTable()});
  document.getElementById('filter-category').addEventListener('change',function(){renderTable()});
  document.getElementById('filter-status').addEventListener('change',function(){renderTable()});
  document.getElementById('clear-filters').addEventListener('click',function(){
    document.getElementById('search-input').value='';
    document.getElementById('filter-difficulty').value='';
    document.getElementById('filter-category').value='';
    document.getElementById('filter-status').value='';
    renderTable();
  });

  // CSV Export
  document.getElementById('export-csv-btn').addEventListener('click',function(){
    var rKeys=[];
    if(D.rows.length>0){
      Object.keys(D.rows[0]).forEach(function(k){if(k.match(/^r\d+$/))rKeys.push(k)});
      rKeys.sort();
    }
    var csv='#,Title,Slug,Difficulty,Category,'+rKeys.map(function(k){return k.toUpperCase()}).join(',')+',Status\n';
    D.rows.forEach(function(r){
      var rounds=rKeys.map(function(k){return '"'+(r[k]||'')+'"'}).join(',');
      csv+=r.num+',"'+r.title+'",'+r.slug+','+r.difficulty+','+r.category+','+rounds+','+(r.status||'')+'\n';
    });
    var blob=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'});
    var a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download='brushup_progress_'+new Date().toISOString().slice(0,10)+'.csv';
    a.click();
  });

  // Initial render
  renderTable();
}
