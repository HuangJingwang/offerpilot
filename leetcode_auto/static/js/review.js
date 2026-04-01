// ====== Review ======

function initReview(){
  var list=document.getElementById('review-list');
  var count=document.getElementById('review-count');
  if(!D.review_due||D.review_due.length===0){
    document.getElementById('review-card').innerHTML='<div class="empty-state"><div class="icon">&#9989;</div><p>'+t('no_review')+'</p></div>';
    count.textContent='(0)';
    return;
  }
  count.textContent='('+D.review_due.length+')';
  var html='';
  D.review_due.forEach(function(r){
    var status=r.overdue>0?'<span class="overdue">'+t('overdue').replace('{n}',r.overdue)+'</span>':'<span class="due-today">'+t('due_today')+'</span>';
    var titleHtml=r.slug?'<a class="review-link" href="https://leetcode.cn/problems/'+r.slug+'/" target="_blank">'+r.title+'</a>':r.title;
    html+='<li><div><span class="review-round">'+r.round+'</span> '+titleHtml+'</div>'+status+'</li>';
  });
  list.innerHTML=html;
}
