'use strict';
//console.log('debug');
var bg = browser.extension.getBackgroundPage();

function set_host_list()
{
  var txt = document.createTextNode(bg.main.list_type);
  document.getElementById('list_type').appendChild(txt);
  if((bg.tab_id  in bg.tabs))
  {
    let s = bg.tabs[bg.tab_id]['scripts'];
    let html ='';	
    let e = document.getElementById('list');
    for (var i in s)
    {
      var li  = document.createElement("LI");
      var btn  = document.createElement("button");
      btn.setAttribute('content', 'test content');
      var t = document.createTextNode(s[i]);
      btn.appendChild(t);
      li.appendChild(btn);
      //console.log(btn);
      e.append(li); 
    }
  }	
}    
document.addEventListener('DOMContentLoaded', set_host_list);
    


