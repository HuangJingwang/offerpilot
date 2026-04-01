// ====== AI Chat ======

function initChat(){
  var messages=document.getElementById('chat-messages');
  var input=document.getElementById('chat-input');
  var btn=document.getElementById('chat-send');
  var clearBtn=document.getElementById('chat-clear');
  var history=[];

  function appendMsg(role,text){
    var div=document.createElement('div');
    div.className='chat-msg '+role;
    var bubble=document.createElement('div');
    bubble.className='chat-bubble';
    if(role==='assistant'){
      bubble.innerHTML=mdToHtml(text);
    } else {
      bubble.textContent=text;
    }
    div.appendChild(bubble);
    messages.appendChild(div);
    messages.scrollTop=messages.scrollHeight;
  }

  // Load chat history
  fetch('/api/chat/history').then(function(r){return r.json()}).then(function(data){
    if(data.history&&data.history.length>0){
      history=data.history;
      history.forEach(function(m){appendMsg(m.role,m.content);});
    }
  }).catch(function(){});

  function send(){
    var text=input.value.trim();
    if(!text) return;
    input.value='';
    appendMsg('user',text);
    btn.disabled=true;
    var typing=document.createElement('div');
    typing.className='chat-msg assistant';
    typing.innerHTML='<div class="chat-bubble chat-typing">'+t('thinking')+'</div>';
    messages.appendChild(typing);
    messages.scrollTop=messages.scrollHeight;

    fetch('/api/chat',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({message:text,history:history})
    }).then(function(r){return r.json()}).then(function(data){
      messages.removeChild(typing);
      btn.disabled=false;
      if(data.reply){
        appendMsg('assistant',data.reply);
        history.push({role:'user',content:text});
        history.push({role:'assistant',content:data.reply});
      } else {
        appendMsg('assistant',data.error||'请求失败，请重试。');
      }
    }).catch(function(){
      messages.removeChild(typing);
      btn.disabled=false;
      appendMsg('assistant',''+t('net_error')+'，请重试。');
    });
  }

  clearBtn.addEventListener('click',function(){
    if(!confirm(t('confirm_clear'))) return;
    fetch('/api/chat/history',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({action:'clear'})
    }).then(function(){
      history=[];
      messages.innerHTML='<div class="chat-msg assistant"><div class="chat-bubble">'+t('chat_cleared')+'</div></div>';
    });
  });

  btn.addEventListener('click',send);
  input.addEventListener('keydown',function(e){
    if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}
  });
}
