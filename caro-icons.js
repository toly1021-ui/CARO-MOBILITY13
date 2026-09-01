/* ════════════════════════════════════════════════════════════
   CARO ICONS v1 — 이모지 → 라인 아이콘 전면 교체
   ────────────────────────────────────────────────────────────
   화면에 표시되는 이모지를 CARO 톤의 얇은 선(stroke) 아이콘으로
   실시간 치환. 새로 그려지는 화면도 자동 적용(MutationObserver).
   색은 글자색(currentColor)을 따라감 → 어디서든 자연스럽게 어울림.
   ════════════════════════════════════════════════════════════ */
(function(){
'use strict';

var P={
  '✅':'<circle cx="12" cy="12" r="9"/><path d="m8.3 12.3 2.5 2.5 4.9-5.2"/>',
  '❌':'<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/>',
  '⚠':'<path d="M12 4 21 19H3L12 4Z"/><path d="M12 10v4"/><path d="M12 16.8v.2"/>',
  '🚗':'<path d="M5 12 6.5 7.5A2 2 0 0 1 8.4 6h7.2a2 2 0 0 1 1.9 1.5L19 12"/><path d="M4 12h16a1 1 0 0 1 1 1v3h-2M3 16H2v-3a1 1 0 0 1 1-1"/><circle cx="7.5" cy="16.5" r="1.8"/><circle cx="16.5" cy="16.5" r="1.8"/><path d="M9.3 16.5h5.4"/>',
  '🚘':'<path d="M5 12 6.5 7.5A2 2 0 0 1 8.4 6h7.2a2 2 0 0 1 1.9 1.5L19 12"/><path d="M4 12h16a1 1 0 0 1 1 1v3h-2M3 16H2v-3a1 1 0 0 1 1-1"/><circle cx="7.5" cy="16.5" r="1.8"/><circle cx="16.5" cy="16.5" r="1.8"/><path d="M9.3 16.5h5.4"/>',
  '🚙':'<path d="M5 12 6.5 7.5A2 2 0 0 1 8.4 6h7.2a2 2 0 0 1 1.9 1.5L19 12"/><path d="M4 12h16a1 1 0 0 1 1 1v3h-2M3 16H2v-3a1 1 0 0 1 1-1"/><circle cx="7.5" cy="16.5" r="1.8"/><circle cx="16.5" cy="16.5" r="1.8"/><path d="M9.3 16.5h5.4"/>',
  '📍':'<path d="M12 21s-6.5-6.2-6.5-10.7a6.5 6.5 0 0 1 13 0C18.5 14.8 12 21 12 21Z"/><circle cx="12" cy="10" r="2.3"/>',
  '📱':'<rect x="7" y="3" width="10" height="18" rx="2.2"/><path d="M11 17.6h2"/>',
  '📷':'<path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2L9 5h6l1.5 2h2A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-9Z"/><circle cx="12" cy="13" r="3.2"/>',
  '🔒':'<rect x="5.5" y="10.5" width="13" height="9" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/><path d="M12 14v2"/>',
  '🔓':'<rect x="5.5" y="10.5" width="13" height="9" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 6.8-1.2"/><path d="M12 14v2"/>',
  '🔄':'<path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.5"/><path d="M20 4v4.5h-4.5"/><path d="M20 12a8 8 0 0 1-13.7 5.6L4 15.5"/><path d="M4 20v-4.5h4.5"/>',
  '⭐':'<path d="m12 4 2.3 4.9 5.2.7-3.8 3.7.9 5.2L12 16l-4.6 2.5.9-5.2L4.5 9.6l5.2-.7L12 4Z"/>',
  '🎉':'<path d="M6 14 4 20l6-2"/><path d="M6 14a7 7 0 0 1 4 4"/><path d="m13 5 .4 1.6M18.9 10.6 20.5 11M15.5 8.3l3-3"/><circle cx="19" cy="5.5" r=".4"/><circle cx="13.8" cy="12" r=".4"/>',
  '👋':'<circle cx="12" cy="12" r="9"/><path d="M9 10v.2M15 10v.2"/><path d="M8.6 14.2a4.4 4.4 0 0 0 6.8 0"/>',
  '🙂':'<circle cx="12" cy="12" r="9"/><path d="M9 10v.2M15 10v.2"/><path d="M8.6 14.2a4.4 4.4 0 0 0 6.8 0"/>',
  '🙋':'<circle cx="12" cy="8" r="3.4"/><path d="M5.5 20a6.5 6.5 0 0 1 13 0"/>',
  '👤':'<circle cx="12" cy="8" r="3.4"/><path d="M5.5 20a6.5 6.5 0 0 1 13 0"/>',
  '🗑':'<path d="M5 7h14"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7"/><path d="M7 7l.8 12a1.5 1.5 0 0 0 1.5 1.4h5.4a1.5 1.5 0 0 0 1.5-1.4L17 7"/><path d="M10 11v5M14 11v5"/>',
  '📝':'<path d="M5 20h4l10-10-4-4L5 16v4Z"/><path d="m13.5 7.5 3 3"/>',
  '✏':'<path d="M5 20h4l10-10-4-4L5 16v4Z"/><path d="m13.5 7.5 3 3"/>',
  '📋':'<rect x="6" y="5" width="12" height="16" rx="1.8"/><path d="M9.5 5a2.5 2.5 0 0 1 5 0"/><path d="M9 10.5h6M9 14h6M9 17.5h3.5"/>',
  '💳':'<rect x="3.5" y="6" width="17" height="12" rx="2"/><path d="M3.5 10h17"/><path d="M7 14.5h4"/>',
  '💡':'<path d="M9.5 18a6.5 6.5 0 1 1 5 0v1.5a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1V18Z"/><path d="M10.5 22h3"/>',
  '📢':'<path d="M4 10v4a1 1 0 0 0 1 1h2l7 4V5L7 9H5a1 1 0 0 0-1 1Z"/><path d="M17.5 9.5a4 4 0 0 1 0 5"/>',
  '🚫':'<circle cx="12" cy="12" r="9"/><path d="m5.7 5.7 12.6 12.6"/>',
  '⛔':'<circle cx="12" cy="12" r="9"/><path d="M7 12h10"/>',
  '🌐':'<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a13 13 0 0 1 0 18 13 13 0 0 1 0-18Z"/>',
  '🔧':'<path d="M14.7 6.3a4 4 0 0 0-5.4 5L4 16.6V20h3.4l5.3-5.3a4 4 0 0 0 5-5.4L14.6 12l-2.6-2.6 2.7-3.1Z"/>',
  '💬':'<path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4V6Z"/><path d="M8 9h8M8 12.5h5"/>',
  '📅':'<rect x="4" y="5.5" width="16" height="15" rx="2"/><path d="M4 10h16"/><path d="M8.5 3.5v4M15.5 3.5v4"/>',
  '⚡':'<path d="M13 3 5 13.5h5.5L10 21l8-10.5h-5.5L13 3Z"/>',
  '💰':'<circle cx="12" cy="13" r="7.5"/><path d="M9 11l3 3 3-3M9 15.5h6M9 13.2h6"/>',
  '🎯':'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>',
  '📎':'<path d="m8.5 12.5 6-6a3 3 0 0 1 4.2 4.2l-7.6 7.6a4.7 4.7 0 0 1-6.6-6.6l7.4-7.4"/>',
  '📡':'<path d="M5 19a14 14 0 0 1 14-14"/><path d="M5 13a8 8 0 0 1 8-8"/><circle cx="6.5" cy="17.5" r="1.4"/>',
  '🔑':'<circle cx="8" cy="14.5" r="4"/><path d="m11 11.5 8-8"/><path d="m16 6.5 3 3M13.5 9l2 2"/>',
  '⏱':'<circle cx="12" cy="13.5" r="7"/><path d="M12 10v3.8l2.6 1.5"/><path d="M10 3.5h4"/>',
  'ℹ':'<circle cx="12" cy="12" r="9"/><path d="M12 8.2v.2M12 11.4V16"/>',
  '📞':'<path d="M5 4h3.2L9.8 8l-2.1 1.7a12 12 0 0 0 6.6 6.6L16 14.2l4 1.6V19a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2Z"/>',
  '☎':'<path d="M5 4h3.2L9.8 8l-2.1 1.7a12 12 0 0 0 6.6 6.6L16 14.2l4 1.6V19a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2Z"/>',
  '🔔':'<path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2.5H4.5L6 16Z"/><path d="M10.3 21a2 2 0 0 0 3.4 0"/>',
  '📊':'<path d="M4 20h16"/><path d="M7 20v-6M12 20V8M17 20v-9"/>',
  '⛽':'<rect x="4.5" y="4" width="9" height="16" rx="1.6"/><path d="M6.8 7.5h4.4v4H6.8Z"/><path d="M13.5 9.5h2a2 2 0 0 1 2 2V16a1.5 1.5 0 0 0 3 0V9l-2.5-2.5"/>',
  '🔋':'<rect x="3.5" y="8" width="15" height="8" rx="1.8"/><path d="M20.5 10.8v2.4"/><path d="M6.5 10.5v3M9.5 10.5v3M12.5 10.5v3"/>',
  '🅿':'<rect x="4" y="4" width="16" height="16" rx="3.5"/><path d="M9.5 17V7h3.6a3 3 0 0 1 0 6H9.5"/>',
  '🧾':'<path d="M6 3.5h12V21l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4L6 21V3.5Z"/><path d="M9 8h6M9 11.5h6M9 15h3.5"/>',
  '🎫':'<path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z"/><path d="M14 6.5v11" stroke-dasharray="2.2 2.2"/>',
  '🏠':'<path d="m4 11 8-7 8 7"/><path d="M6 9.5V20h12V9.5"/><path d="M10 20v-5h4v5"/>',
  '🛡':'<path d="M12 3.5 19 6v5.5c0 4.6-2.8 7.6-7 9.5-4.2-1.9-7-4.9-7-9.5V6l7-2.5Z"/>',
  '🚨':'<path d="M6 17v-4a6 6 0 0 1 12 0v4"/><path d="M4 17h16v2.5H4Z"/><path d="M12 4v2M5.5 6.5 7 8M18.5 6.5 17 8"/>',
  '🕐':'<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/>',
  '💺':'<path d="M8 4v9a2 2 0 0 0 2 2h6"/><path d="M8 13h6a2 2 0 0 1 2 2v5"/><path d="M6 20h8"/>',
  '🎨':'<path d="M12 3a9 9 0 0 0 0 18c1.2 0 2-.9 2-2s.8-2 2-2h1.6A3.4 3.4 0 0 0 21 13.6 9.6 9.6 0 0 0 12 3Z"/><circle cx="8" cy="10" r=".5"/><circle cx="12" cy="7.5" r=".5"/><circle cx="16" cy="10" r=".5"/>'
};

function svgFor(ch){
  return '<svg class="caro-li" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+P[ch]+'</svg>';
}

/* 스타일 */
var st=document.createElement('style');
st.textContent='.caro-li{width:1.06em;height:1.06em;display:inline-block;vertical-align:-0.17em;flex:none;}';
document.head.appendChild(st);

var KEYS=Object.keys(P).sort(function(a,b){return b.length-a.length;});
var RE=new RegExp('('+KEYS.map(function(k){return k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}).join('|')+')\uFE0F?','g');

var SKIP_TAG={SCRIPT:1,STYLE:1,TEXTAREA:1,INPUT:1,SELECT:1,OPTION:1,NOSCRIPT:1,SVG:1,CANVAS:1};

function replaceIn(root){
  if(!root) return;
  var walker,list=[];
  try{
    walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{
      acceptNode:function(n){
        var p=n.parentNode;
        if(!p||SKIP_TAG[p.nodeName]) return NodeFilter.FILTER_REJECT;
        if(p.closest&&p.closest('[contenteditable="true"]')) return NodeFilter.FILTER_REJECT;
        RE.lastIndex=0;
        return RE.test(n.nodeValue)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP;
      }
    });
  }catch(e){ return; }
  var n; while((n=walker.nextNode())) list.push(n);
  list.forEach(function(tn){
    try{
      var span=document.createElement('span');
      RE.lastIndex=0;
      span.innerHTML=tn.nodeValue
        .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
        .replace(RE,function(m,ch){ return svgFor(ch); });
      var frag=document.createDocumentFragment();
      while(span.firstChild) frag.appendChild(span.firstChild);
      tn.parentNode.replaceChild(frag,tn);
    }catch(e){}
  });
}

/* 초기 적용 + 동적 화면 자동 적용 */
var pending=new Set(), timer=null;
function flush(){
  timer=null;
  var roots=Array.from(pending); pending.clear();
  roots.forEach(function(r){ if(r&&r.isConnected!==false) replaceIn(r); });
}
function queue(root){
  pending.add(root);
  if(!timer) timer=setTimeout(flush,180);
}

function boot(){
  replaceIn(document.body);
  try{
    new MutationObserver(function(muts){
      muts.forEach(function(m){
        if(m.type==='childList'){
          m.addedNodes.forEach(function(nd){
            if(nd.nodeType===1) queue(nd);
            else if(nd.nodeType===3&&nd.parentNode) queue(nd.parentNode);
          });
        }else if(m.type==='characterData'&&m.target.parentNode){
          queue(m.target.parentNode);
        }
      });
    }).observe(document.body,{childList:true,subtree:true,characterData:true});
  }catch(e){}
  setTimeout(function(){ replaceIn(document.body); },1600); /* 늦게 그려지는 화면 재적용 */
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);
else boot();

console.log('🎨 CARO ICONS v1 — 이모지 → 라인 아이콘 치환 활성 ('+KEYS.length+'종)');
})();
