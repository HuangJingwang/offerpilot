// ====== Resume ======

function initResume(){
  var input=document.getElementById('resume-input');
  var analyzeBtn=document.getElementById('resume-analyze-btn');
  var saveBtn=document.getElementById('resume-save-btn');
  var previewToggle=document.getElementById('resume-preview-toggle');
  var previewContent=document.getElementById('resume-preview-content');
  var resumeLayout=document.querySelector('.resume-layout');
  var analysisDiv=document.getElementById('resume-analysis');
  var chatMsgs=document.getElementById('resume-chat-messages');
  var chatInput=document.getElementById('resume-chat-input');
  var resumeSelector=document.getElementById('resume-selector');
  var resumeNewBtn=document.getElementById('resume-new-btn');
  var resumeDelBtn=document.getElementById('resume-del-btn');

  function populateResumeSelector(rl){
    resumeSelector.innerHTML='';
    (rl.list||[]).forEach(function(r){
      var o=document.createElement('option');
      o.value=r.id;o.textContent=r.name;
      resumeSelector.appendChild(o);
    });
    resumeSelector.value=rl.current||'default';
  }

  resumeSelector.addEventListener('change',function(){
    fetch('/api/resume',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({action:'switch_resume',resume_id:resumeSelector.value})
    }).then(function(){location.hash='resume';location.reload();});
  });

  resumeNewBtn.addEventListener('click',function(){
    var name=prompt('简历名称：');
    if(!name) return;
    fetch('/api/resume',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({action:'create_resume',name:name})
    }).then(function(){location.hash='resume';location.reload();});
  });

  resumeDelBtn.addEventListener('click',function(){
    var id=resumeSelector.value;
    if(id==='default'){alert('默认简历不能删除');return;}
    if(!confirm('确定删除这份简历？')) return;
    fetch('/api/resume',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({action:'delete_resume',resume_id:id})
    }).then(function(){location.hash='resume';location.reload();});
  });
  var chatSend=document.getElementById('resume-chat-send');
  var chatClear=document.getElementById('resume-chat-clear');
  var resumeHistory=[];

  // Load saved resume
  fetch('/api/resume').then(function(r){return r.json()}).then(function(d){
    if(d.resume_list) populateResumeSelector(d.resume_list);
    if(d.content) input.value=d.content;
    if(d.analysis) analysisDiv.innerHTML=mdToHtml(d.analysis);
    if(d.chat_history&&d.chat_history.length>0){
      resumeHistory=d.chat_history;
      resumeHistory.forEach(function(m){appendResumeMsg(m.role,m.content);});
    }
  }).catch(function(){});

  function appendResumeMsg(role,text){
    var div=document.createElement('div');
    div.className='chat-msg '+role;
    var bubble=document.createElement('div');
    bubble.className='chat-bubble';
    bubble.innerHTML=role==='assistant'?mdToHtml(text):text.replace(/&/g,'&amp;').replace(/</g,'&lt;');
    div.appendChild(bubble);
    chatMsgs.appendChild(div);
    chatMsgs.scrollTop=chatMsgs.scrollHeight;
  }

  // Version history
  document.getElementById('resume-versions-btn').addEventListener('click',function(){
    fetch('/api/resume',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({action:'list_versions'})
    }).then(function(r){return r.json()}).then(function(d){
      var vs=d.versions||[];
      if(!vs.length){alert('No version history yet');return;}
      var msg=vs.map(function(v,i){return (i+1)+'. '+v.display+' - '+v.preview}).join('\n');
      var idx=prompt('Select version to restore (1-'+vs.length+'):\n\n'+msg);
      if(!idx) return;
      var v=vs[parseInt(idx)-1];
      if(!v) return;
      fetch('/api/resume',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({action:'restore_version',file:v.file})
      }).then(function(r){return r.json()}).then(function(d2){
        if(d2.content!==undefined){input.value=d2.content;if(resumeLayout.classList.contains('preview-mode')){previewContent.innerHTML=typeof marked!=='undefined'?marked.parse(d2.content):d2.content;}}
      });
    });
  });

  // Preview toggle
  previewToggle.addEventListener('click',function(){
    var isPreview=resumeLayout.classList.toggle('preview-mode');
    previewToggle.classList.toggle('active',isPreview);
    previewToggle.textContent=isPreview?t('resume_edit'):t('resume_preview');
    if(isPreview){
      var md=input.value||'';
      previewContent.innerHTML=typeof marked!=='undefined'?marked.parse(md):md.replace(/</g,'&lt;').replace(/\n/g,'<br>');
    }
  });

  // Auto-update preview on input
  input.addEventListener('input',function(){
    if(resumeLayout.classList.contains('preview-mode')){
      previewContent.innerHTML=typeof marked!=='undefined'?marked.parse(input.value||''):input.value;
    }
  });

  saveBtn.addEventListener('click',function(){
    fetch('/api/resume',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({action:'save',content:input.value})
    }).then(function(r){return r.json()}).then(function(){saveBtn.textContent=t('resume_saved');setTimeout(function(){saveBtn.textContent=t('resume_save');},1500);});
  });

  analyzeBtn.addEventListener('click',function(){
    var content=input.value.trim();
    if(!content){alert(t('paste_first'));return;}
    analyzeBtn.disabled=true;
    analyzeBtn.textContent=t('resume_analyzing');
    analysisDiv.innerHTML='<div class="resume-empty"><div class="chat-typing">'+t('resume_analyzing')+'</div></div>';
    fetch('/api/resume',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({action:'analyze',content:content})
    }).then(function(r){return r.json()}).then(function(d){
      analyzeBtn.disabled=false;
      analyzeBtn.textContent=t('resume_analyze');
      if(d.analysis) analysisDiv.innerHTML=mdToHtml(d.analysis);
      else analysisDiv.innerHTML='<div class="resume-empty"><p>'+(d.error||t('analysis_fail'))+'</p></div>';
    }).catch(function(){
      analyzeBtn.disabled=false;
      analyzeBtn.textContent=t('resume_analyze');
      analysisDiv.innerHTML='<div class="resume-empty"><p>'+t('net_error')+'</p></div>';
    });
  });

  function sendResumeChat(){
    var text=chatInput.value.trim();
    if(!text) return;
    chatInput.value='';
    appendResumeMsg('user',text);
    chatSend.disabled=true;
    var typing=document.createElement('div');
    typing.className='chat-msg assistant';
    typing.innerHTML='<div class="chat-bubble chat-typing">'+t('thinking')+'</div>';
    chatMsgs.appendChild(typing);
    chatMsgs.scrollTop=chatMsgs.scrollHeight;
    fetch('/api/resume',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({action:'chat',message:text,history:resumeHistory,content:input.value})
    }).then(function(r){return r.json()}).then(function(d){
      chatMsgs.removeChild(typing);
      chatSend.disabled=false;
      if(d.reply){
        var resumeMatch=d.reply.match(/```resume\n([\s\S]*?)```/);
        var displayReply=d.reply;
        if(resumeMatch){
          var newResume=resumeMatch[1].trim();
          input.value=newResume;
          fetch('/api/resume',{method:'POST',headers:{'Content-Type':'application/json'},
            body:JSON.stringify({action:'save',content:newResume})});
          if(resumeLayout.classList.contains('preview-mode')){
            previewContent.innerHTML=typeof marked!=='undefined'?marked.parse(newResume):newResume;
          }
          displayReply=d.reply.replace(/```resume\n[\s\S]*?```/,t('resume_updated'));
        } else if(/改|修改|优化|帮我|更新|重写|调整|替换|rewrite|update|modify|change|improve|edit/i.test(text) && input.value.trim()){
          displayReply+='<div style="margin-top:8px;padding:8px 12px;background:#fff3cd;border-radius:6px;font-size:13px;color:#856404;">'+t('resume_extract_hint')+'</div>';
        }
        appendResumeMsg('assistant',displayReply);
        resumeHistory.push({role:'user',content:text});
        resumeHistory.push({role:'assistant',content:d.reply});
      } else {
        appendResumeMsg('assistant',d.error||'Failed');
      }
    }).catch(function(){chatMsgs.removeChild(typing);chatSend.disabled=false;appendResumeMsg('assistant',''+t('net_error')+'');});
  }
  chatSend.addEventListener('click',sendResumeChat);
  chatInput.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendResumeChat();}});
  chatClear.addEventListener('click',function(){
    if(!confirm(t('confirm_clear_resume'))) return;
    fetch('/api/resume',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({action:'clear_chat'})
    }).then(function(){resumeHistory=[];chatMsgs.innerHTML='';});
  });
}

// ====== Interview ======

function initInterview(){
  var questionsDiv=document.getElementById('interview-questions');
  var chatMsgs=document.getElementById('interview-chat-messages');
  var chatInput=document.getElementById('interview-chat-input');
  var chatSend=document.getElementById('interview-chat-send');
  var chatClear=document.getElementById('interview-chat-clear');
  var startBtn=document.getElementById('interview-start-btn');
  var statusEl=document.getElementById('interview-status');
  var genBtn=document.getElementById('resume-gen-interview-btn');
  var interviewHistory=[];
  var interviewActive=false;

  // Load saved questions & chat
  fetch('/api/interview').then(function(r){return r.json()}).then(function(d){
    if(d.questions) questionsDiv.innerHTML=mdToHtml(d.questions);
    if(d.chat_history&&d.chat_history.length>0){
      interviewHistory=d.chat_history;
      interviewHistory.forEach(function(m){appendInterviewMsg(m.role,m.content);});
      setActive(true);
    }
  }).catch(function(){});

  function appendInterviewMsg(role,text){
    var div=document.createElement('div');
    div.className='chat-msg '+(role==='user'?'user':'assistant');
    var bubble=document.createElement('div');
    bubble.className='chat-bubble';
    bubble.innerHTML=role==='user'?text.replace(/&/g,'&amp;').replace(/</g,'&lt;'):mdToHtml(text);
    div.appendChild(bubble);
    chatMsgs.appendChild(div);
    chatMsgs.scrollTop=chatMsgs.scrollHeight;
  }

  function setActive(on){
    interviewActive=on;
    chatInput.disabled=!on;
    chatSend.disabled=!on;
    if(on){
      statusEl.textContent=t('interview_status_active');
      statusEl.className='interview-status status-active';
      startBtn.style.display='none';
    } else {
      statusEl.textContent=t('interview_status_idle');
      statusEl.className='interview-status status-idle';
      startBtn.style.display='';
    }
  }

  // Generate questions button (on Resume page)
  genBtn.addEventListener('click',function(){
    var content=document.getElementById('resume-input').value.trim();
    if(!content){alert(t('paste_first'));return;}
    genBtn.disabled=true;
    genBtn.textContent=t('interview_gen_ing');
    fetch('/api/interview',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({action:'generate',content:content})
    }).then(function(r){return r.json()}).then(function(d){
      genBtn.disabled=false;genBtn.textContent=t('resume_gen');
      if(d.questions){
        questionsDiv.innerHTML=mdToHtml(d.questions);
        document.querySelectorAll('.nav-item').forEach(function(n){n.classList.remove('active')});
        document.querySelectorAll('.tab-content').forEach(function(tc){tc.classList.remove('active')});
        document.querySelector('[data-tab="interview"]').classList.add('active');
        document.getElementById('tab-interview').classList.add('active');
      } else {
        alert(d.error||'生成失败');
      }
    }).catch(function(){genBtn.disabled=false;genBtn.textContent=t('resume_gen');});
  });

  // Start mock interview
  startBtn.addEventListener('click',function(){
    var resumeContent=document.getElementById('resume-input').value.trim();
    if(!resumeContent){alert('请先在简历优化页面粘贴简历内容');return;}
    startBtn.disabled=true;
    startBtn.textContent=t('interview_starting');
    fetch('/api/interview',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({action:'start'})
    }).then(function(r){return r.json()}).then(function(d){
      startBtn.disabled=false;startBtn.textContent=t('interview_start');
      if(d.reply){
        interviewHistory=[];
        chatMsgs.innerHTML='';
        appendInterviewMsg('assistant',d.reply);
        interviewHistory.push({role:'assistant',content:d.reply});
        setActive(true);
      }
    }).catch(function(){startBtn.disabled=false;startBtn.textContent=t('interview_start');});
  });

  // Send answer
  function sendAnswer(){
    var text=chatInput.value.trim();
    if(!text||!interviewActive) return;
    chatInput.value='';
    appendInterviewMsg('user',text);
    chatSend.disabled=true;
    var typing=document.createElement('div');
    typing.className='chat-msg assistant';
    typing.innerHTML='<div class="chat-bubble chat-typing">'+t('thinking')+'</div>';
    chatMsgs.appendChild(typing);
    chatMsgs.scrollTop=chatMsgs.scrollHeight;
    fetch('/api/interview',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({action:'chat',message:text,history:interviewHistory})
    }).then(function(r){return r.json()}).then(function(d){
      chatMsgs.removeChild(typing);
      chatSend.disabled=false;
      if(d.reply){
        appendInterviewMsg('assistant',d.reply);
        interviewHistory.push({role:'user',content:text});
        interviewHistory.push({role:'assistant',content:d.reply});
      } else {
        appendInterviewMsg('assistant',d.error||'请求失败');
      }
    }).catch(function(){chatMsgs.removeChild(typing);chatSend.disabled=false;});
  }
  chatSend.addEventListener('click',sendAnswer);
  chatInput.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendAnswer();}});

  // Reset
  chatClear.addEventListener('click',function(){
    if(!confirm(t('interview_confirm_reset'))) return;
    fetch('/api/interview',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({action:'clear'})
    }).then(function(){
      interviewHistory=[];chatMsgs.innerHTML='';setActive(false);
    });
  });

  // Interview Report
  var reportBtn=document.getElementById('interview-report-btn');
  var reportArea=document.getElementById('interview-report-area');
  if(reportBtn&&reportArea){
    fetch('/api/interview').then(function(r){return r.json()}).then(function(d){
      if(d.report){reportArea.innerHTML=mdToHtml(d.report);reportArea.style.display='block';}
    }).catch(function(){});
    reportBtn.addEventListener('click',function(){
      reportBtn.disabled=true;reportBtn.textContent='Generating...';
      fetch('/api/interview',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'report'})
      }).then(function(r){return r.json()}).then(function(d){
        reportBtn.disabled=false;reportBtn.textContent='Report';
        if(d.report){reportArea.innerHTML=mdToHtml(d.report);reportArea.style.display='block';}
        else{alert(d.error||'Failed');}
      }).catch(function(){reportBtn.disabled=false;reportBtn.textContent='Report';});
    });
  }
}
