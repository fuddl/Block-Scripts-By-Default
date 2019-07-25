'use strict';
//console.log('debug');
var background = browser.extension.getBackgroundPage();
var host_list = {};

function get_hosts() {
  let db = browser.storage.local.get();
  db.then(set_host_list);
}

function set_host_list(o) {
  host_list = o;
  set_list(o);
  var qty = Object.keys(o).length ? Object.keys(o).length - 1 : '0';
  var txt = document.createTextNode(qty + ' ');
  document.getElementById('domain_qty').appendChild(txt);
}

function set_list(o) {
  o = sort_list(o);
  if (o) {
    var html = '';
    var e = document.getElementById('tbody');
    for (var i in o) {
      if (i == 'list_type') {
        continue;
      }
      var tr = document.createElement("tr");
      var td = document.createElement("TD");
      var text = document.createTextNode(i);
      td.appendChild(text);
      tr.appendChild(td);
      var td = document.createElement("TD");
      var button = document.createElement("BUTTON");
      if (o[i]['wild']) {
        var text = document.createTextNode("yes");
      } else {
        var text = document.createTextNode("no");
      }
      button.appendChild(text);
      td.appendChild(button);
      tr.appendChild(td);
      button.addEventListener('click', toggle_wildcard);

      var td = document.createElement("TD");
      var button = document.createElement("BUTTON");
      var text = document.createTextNode("Remove");
      button.appendChild(text);
      td.appendChild(button);
      tr.appendChild(td);
      button.addEventListener('click', delete_host);
      e.appendChild(tr);
    }
    if ('list_type' in o) {
      document.getElementById('list_type').value = o['list_type'];
    } else {
      document.getElementById('list_type').value = 'whitelist';
      browser.storage.local.set({
        'list_type': 'whitelist'
      });
    }
  } else {
    document.getElementById('list_type').value = 'whitelist';
    browser.storage.local.set({
      'list_type': 'whitelist'
    });
  }
}



function delete_hosts() {
  browser.storage.local.clear();
  clear_list();
}

function clear_list() {
  var tbody = document.getElementById("tbody");
  while (tbody.firstChild) {
    tbody.removeChild(tbody.firstChild);
  }
  background.main.get_whitelist();
}


function add_host(e) {
  var hostname = document.getElementById("host").value;
  var wildcard = document.getElementById("wild").value;
  var wild = (wildcard == 'yes') ? 1 : 0;
  if (check_valid_host(hostname)) {
    var item = {};
    item[hostname] = {
      'wild': wild
    };
    browser.storage.local.set(item);
    clear_whitelist();
    get_hosts();
  }
}

function delete_host(e) {
  var tr = e.target.parentElement.parentElement;
  var table = e.target.parentElement.parentElement.parentElement;
  var hostname = tr.firstElementChild.innerText;
  browser.storage.local.remove(hostname);
  table.removeChild(tr);
  background.main.get_whitelist();
}

function toggle_wildcard(e) {
  var hostname = e.target.parentElement.parentElement.firstElementChild.innerText;
  var wildcard = e.target.innerText;
  e.target.innerText = (wildcard == 'yes') ? 'no' : 'yes';
  var wild = (wildcard == 'yes') ? 0 : 1;
  var item = {};
  item[hostname] = {
    'wild': wild
  };
  browser.storage.local.set(item);
  background.main.get_whitelist();
}


function get_date() {
  var d = new Date();
  var str = pad_str(d.getFullYear()) +
    pad_str(1 + d.getMonth()) +
    pad_str(d.getDate()) +
    pad_str(d.getHours()) +
    pad_str(d.getMinutes()) +
    pad_str(d.getSeconds());
  return (str);
}

function pad_str(i) {
  return (i < 10) ? "0" + i : "" + i;
}

function check_valid_host(string) {
  if (/^((2[0-4]|1[0-9]|[1-9])?[0-9]|25[0-5])(\.((2[0-4]|1[0-9]|[1-9])?[0-9]|25[0-5])){3}$/.test(string)) {
    var octets = string.split('.');
    if ((octets[0] == 0) || (octets[0] == 10) || (octets[0] == 127) || (octets[3] == 255) ||
      (octets[3] == 0) ||
      ((octets[0] == 169) && (octets[1] == 254)) ||
      ((octets[0] == 172) && (octets[1] & 0xf0 == 16)) ||
      ((octets[0] == 192) && (octets[1] == 0) && (octets[2] == 2)) ||
      ((octets[0] == 192) && (octets[1] == 88) && (octets[3] == 99)) ||
      ((octets[0] == 192) && (octets[1] == 168)) ||
      ((octets[0] == 198) && (octets[1] & 0xfe == 18)) ||
      (octets[0] & 0xf0 == 224) ||
      (octets[0] & 0xf0 == 240))
      return false;
  } else if (!/^([a-z0-9][a-z0-9-]*[a-z0-9]\.)+[a-z]{2,}$/.test(string)) {
    return false;
  }
  return true;
}

/******************************************
Import Export Functions
*******************************************/
function import_hosts(e) {
  var file = e.target.files[0];
  var reader = new FileReader();
  reader.onload = function() {
    var s = reader.result;
    var o = JSON.parse(s);
    let db = browser.storage.local.set(o);
    db.then(get_hosts);
  };
  reader.readAsText(file);
}

function export_hosts() {
  browser.storage.local.get(null, function(items) {
    var result = JSON.stringify(items);
    var blob = new Blob([result], {
      type: "text/csv;charset=utf-8"
    })
    var d = get_date();
    chrome.downloads.download({
      url: URL.createObjectURL(blob),
      filename: 'javascript_whitelist_' + d + '.json'
    });
  });
}

/******************************************
Sorting
*******************************************/
function sort_list(o) {
  let so = {};
  Object.keys(o).sort().forEach(function(k, i) {
    so[k] = o[k];
  });
  return so;
}

/******************************************
Search
*******************************************/
function search(e) {
  clear_list();
  let o = {};
  Object.keys(host_list).sort().forEach(function(k, i) {
    if (k.toLowerCase().indexOf(e.target.value.toLowerCase()) > -1) {
      o[k] = host_list[k];
    }
  });

  let txt = document.createTextNode(Object.keys(o).length + ' ');
  let qty = document.getElementById('domain_qty');
  qty.replaceChild(txt, qty.childNodes[0]);
  set_list(o);
}

/******************************************
Events
*******************************************/
function event_list_type(e) {
  var list_type = e.target.options[e.target.selectedIndex].value;
  browser.storage.local.set({
    'list_type': list_type
  });
  background.main.list_type = list_type;
}

document.addEventListener('DOMContentLoaded', get_hosts);
document.getElementById('add_host').addEventListener('click', add_host);
document.getElementById('delete_hosts').addEventListener('click', delete_hosts);
document.getElementById('export_hosts').addEventListener('click', export_hosts);
document.getElementById('import_hosts').addEventListener('change', import_hosts);
document.getElementById('list_type').addEventListener('change', event_list_type);
document.getElementById("search").addEventListener("keyup", search);

//document.getElementById('fill').addEventListener('click',fill_random_hosts);

function fill_random_hosts() {
  var db = {};
  for (var x = 0; x < 100; x++) {
    var txt = make_text(make_no(3, 20));
    db[txt + '.com'] = {
      'wild': make_no(0, 1)
    };
  }
  browser.storage.local.set(db);
}


/* helping to generate a random range */
function make_no(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function make_text(length) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}