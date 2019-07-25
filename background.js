'use strict';

//browser.storage.local.clear();
var TLDs = ["ac", "ad", "ae", "aero", "af", "ag", "ai", "al", "am", "an", "ao", "aq", "ar", "arpa", "as", "asia", "at", "au", "aw", "ax", "az", "ba", "bb", "bd", "be", "bf", "bg", "bh", "bi", "biz", "bj", "bm", "bn", "bo", "br", "bs", "bt", "bv", "bw", "by", "bz", "ca", "cat", "cc", "cd", "cf", "cg", "ch", "ci", "ck", "cl", "cm", "cn", "co", "com", "coop", "cr", "cu", "cv", "cx", "cy", "cz", "de", "dj", "dk", "dm", "do", "dz", "ec", "edu", "ee", "eg", "er", "es", "et", "eu", "fi", "fj", "fk", "fm", "fo", "fr", "ga", "gb", "gd", "ge", "gf", "gg", "gh", "gi", "gl", "gm", "gn", "gov", "gp", "gq", "gr", "gs", "gt", "gu", "gw", "gy", "hk", "hm", "hn", "hr", "ht", "hu", "id", "ie", "il", "im", "in", "info", "int", "io", "iq", "ir", "is", "it", "je", "jm", "jo", "jobs", "jp", "ke", "kg", "kh", "ki", "km", "kn", "kp", "kr", "kw", "ky", "kz", "la", "lb", "lc", "li", "lk", "lr", "ls", "lt", "lu", "lv", "ly", "ma", "mc", "md", "me", "mg", "mh", "mil", "mk", "ml", "mm", "mn", "mo", "mobi", "mp", "mq", "mr", "ms", "mt", "mu", "museum", "mv", "mw", "mx", "my", "mz", "na", "name", "nc", "ne", "net", "nf", "ng", "ni", "nl", "no", "np", "nr", "nu", "nz", "om", "org", "pa", "pe", "pf", "pg", "ph", "pk", "pl", "pm", "pn", "pr", "pro", "ps", "pt", "pw", "py", "qa", "re", "ro", "rs", "ru", "rw", "sa", "sb", "sc", "sd", "se", "sg", "sh", "si", "sj", "sk", "sl", "sm", "sn", "so", "sr", "st", "su", "sv", "sy", "sz", "tc", "td", "tel", "tf", "tg", "th", "tj", "tk", "tl", "tm", "tn", "to", "tp", "tr", "travel", "tt", "tv", "tw", "tz", "ua", "ug", "uk", "us", "uy", "uz", "va", "vc", "ve", "vg", "vi", "vn", "vu", "wf", "ws", "xn--0zwm56d", "xn--11b5bs3a9aj6g", "xn--3e0b707e", "xn--45brj9c", "xn--80akhbyknj4f", "xn--90a3ac", "xn--9t4b11yi5a", "xn--clchc0ea0b2g2a9gcd", "xn--deba0ad", "xn--fiqs8s", "xn--fiqz9s", "xn--fpcrj9c3d", "xn--fzc2c9e2c", "xn--g6w251d", "xn--gecrj9c", "xn--h2brj9c", "xn--hgbk6aj7f53bba", "xn--hlcj6aya9esc7a", "xn--j6w193g", "xn--jxalpdlp", "xn--kgbechtv", "xn--kprw13d", "xn--kpry57d", "xn--lgbbat1ad8j", "xn--mgbaam7a8h", "xn--mgbayh7gpa", "xn--mgbbh1a71e", "xn--mgbc0a9azcg", "xn--mgberp4a5d4ar", "xn--o3cw4h", "xn--ogbpf8fl", "xn--p1ai", "xn--pgbs0dh", "xn--s9brj9c", "xn--wgbh1c", "xn--wgbl6a", "xn--xkc2al3hye2a", "xn--xkc2dl3a5ee0h", "xn--yfro4i67o", "xn--ygbi2ammx", "xn--zckzah", "xxx", "ye", "yt", "za", "zm", "zw"].join()


var tabs = [];
var tab_host = '';
var tab_id = false;
var app = {
  title: title => chrome.browserAction.setTitle({
    title: title
  }),
  icon: (file = 'block') => chrome.browserAction.setIcon({
    path: {
      '32': 'data/icons/' + file + '.png',
      '64': 'data/icons/' + file + '.png'
    }
  })
};


var main = {
  whitelist: {},
  d: {},
  open: false,
  hostname: '',
  hostnames: [],
  count: 0,
  list_type: 'whitelist',
  get_whitelist: function() {
    let db = browser.storage.local.get();
    db.then(main.set_whitelist);
  },
  set_whitelist: function(db) {
    main.whitelist = db;
  },

  is_in_whitelist: function(hostname) {
    if (main.list_type == 'whitelist') {
      var _true = true;
      var _false = false;
    } else {
      var _true = false;
      var _false = true;
    }

    if (main.whitelist.hasOwnProperty(hostname)) {
      set_icons(_true);
      return _true;
    } else {
      if (is_wildcard(hostname) == true) {
        set_icons(_true);
        return _true;
      }
      set_icons(_false);
      return _false;
    }
  },

  listen: (e) => {
    //console.log('xxxxxxxxxxx','listen:',' --- url:'+ e.url,' --- main.open:'+main.open,' --- main.hostname:'+main.hostname,e,'xxxxxxxxxxxxxxx'); 
    if (e.type === 'main_frame') {
      tab_host = new URL(e.url).hostname.trim();
      main.open = main.is_in_whitelist(tab_host);
      main.hostname = tab_host;
      tabs[e.tabId] = {
        'tab_host': tab_host,
        'scripts': [],
        'whitelist': main.open
      };
      browser.pageAction.show(e.tabId);
    }
    tabs[e.tabId].scripts.push(e.url);
    tabs[e.tabId].scripts = tabs[e.tabId].scripts.filter((v, i) => tabs[e.tabId].scripts.indexOf(v) == i);
    tabs[e.tabId].scripts.sort();

    if (main.open) {
      return false;
    } else {
      let responseHeaders = e.responseHeaders;
      responseHeaders.push({
        'name': 'Content-Security-Policy',
        'value': 'script-src \'none\''
      });
      return {
        responseHeaders
      };
    }
  },

  on_error: function() {
    console.log(e);
  },
};


/* callback after the hacker/ok icon was clicked */
var tab_click = {
  get_tabs: function(tabs) {
    if (tabs.length > 0) {
      let active_tab = browser.tabs.get(tabs[0].id);
      active_tab.then(tab_click.process, on_error);
    }
  },
  process: function(tab) {
    var url = new URL(tab.url);
    var get_title = browser.browserAction.getTitle({});
    get_title.then(toggle_icon);
    var hostname = url.hostname.trim();
    if (hostname != '') {
      whitelist(hostname);
    }
  }
}


/* check if the domain is wildcard */
function is_wildcard(hostname) {
  var count = (hostname.match(/\./g) || []).length;
  if (count > 1) {
    var tokens = hostname.split('.').slice(1);
    var base_domain = tokens.join('.');
    if (main.whitelist.hasOwnProperty(base_domain)) {
      var wild = main.whitelist[base_domain]['wild'];
      if (wild == 1) {
        return true;
      }
    }
  }
  return false;
}


/* general error call back func */
function on_error(error) {
  //console.log(`Error: ${error}`);
}

/* set a hostname to the list db */
function set_whitelist(hostname, obj) {
  if (Object.keys(obj).length === 0) {
    var domain = get_domain(hostname);
    var db = {};
    db[hostname] = {
      'wild': 0
    };

    if (domain != hostname) //add base domain to whitelist
    {
      db[domain] = {
        'wild': 1
      };
    }

    let added = browser.storage.local.set(db);
    added.then(db_updated);
  } else {
    let remove = browser.storage.local.remove(hostname);
    var domain = get_domain(hostname);
    if (domain != hostname) //remove base domain from whitelist
    {
      let remove = browser.storage.local.remove(domain);
    }
    remove.then(db_updated);
  }
}

/* update db after set a list entry */
function db_updated() {
  main.get_whitelist();
  browser.tabs.reload({
    bypassCache: true
  });
}

/* get list hostname entry from the db */
function whitelist(hostname) {
  let item = browser.storage.local.get(hostname);
  item.then(set_whitelist.bind(null, hostname)); //!send an additional parameter with promise
}

/* get active tab, set icon and show address info icon */
function activated_tab(e) {
  var tab = browser.tabs.get(e.tabId);
  tab.then(set_icon, on_error);
  //browser.pageAction.show(e.tabId);
}

/* check before set the hacker/ok icon */
function set_icon(e) {
  var hostname = new URL(e.url).hostname.trim();
  if ((e.id in tabs)) {
    set_icons(tabs[e.id].whitelist);
  } else {
    main.is_in_whitelist(hostname);
  }
}

/* set hacker or ok icon  */
function set_icons(e) {
  if (e === true) {
    app.icon('allow');
    app.title('JavaScript is enabled');
    return true;
  } else {
    app.icon();
    app.title('JavaScript is disabled');
    return false;
  }
}


/* get the base domain from a subdomain */
function get_domain(url) {
  var parts = url.split('.');
  if (parts[0] === 'www') {
    return url;
  }
  var ln = parts.length;
  var i = ln;
  var min = parts[parts.length - 1].length;
  var part;
  var domain = '';
  for (var x = ln - 1; x >= 0; x--)


  {
    if (TLDs.indexOf(parts[x]) < 0) {
      return parts.slice(x, ln).join('.');
    }
  }
  return url;
}

/* set the list_type whitelist or blacklist from the db - can be changed in the option page */
let list_type = browser.storage.local.get("list_type");
list_type.then(set_list_type, on_error);

function set_list_type(e) {
  if (e['list_type']) {
    main.list_type = e['list_type'];
  }
}



/* Events */

/*
Main Entry Point:
listen on page load
https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/webRequest/onHeadersReceived
*/
browser.webRequest.onHeadersReceived.addListener(
  main.listen, {
    'urls': ["<all_urls>"],
    'types': ['script', 'main_frame', 'sub_frame']
  }, ['blocking', 'responseHeaders']
);

browser.webNavigation.onDOMContentLoaded.addListener(function(details) {
  var tab_host = new URL(details.url).hostname.trim();
  if (!main.is_in_whitelist(tab_host)) {
    var executing = browser.tabs.executeScript(details.tabId, {
      file: "/process-blocked.js"
    });
  }
});

/* click the hacker/ok icon */
browser.browserAction.onClicked.addListener((e) => {
  var querying = browser.tabs.query({
    currentWindow: true,
    active: true
  });
  querying.then(tab_click.get_tabs, on_error);
});


/* Click one Tab */
browser.tabs.onActivated.addListener(activated_tab);

/* Open the Info Popup  when tabs get loaded */
browser.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => {
  if (changeInfo.status) {
    browser.pageAction.show(tabId);
    if (changeInfo.status == "loading") {
      browser.pageAction.setPopup({
        tabId,
        popup: "/popup/loading.html"
      });
    } else {
      tab_id = tabId;
      browser.pageAction.setPopup({
        tabId,
        popup: "/popup/complete.html"
      });
    }
  }
});

/* Open the Info Popup  when tabs get click*/
browser.tabs.onActivated.addListener((e) => {
  tab_id = e.tabId;
  browser.pageAction.setPopup({
    tabId: e.tabId,
    popup: "/popup/complete.html"
  });
});


/*
//use this prechecking for later
function set_main_host(d) {
  if(d.frameId == 0)
  {
    main.hostname = new URL(d.url).hostname.trim();
  }
}
browser.webNavigation.onBeforeNavigate.addListener(set_main_host);
*/

function toggle_icon(title) {
  //console.log(title);
  if (title === 'JavaScript is enabled') {
    //console.log('off');
    app.title("This page is currently not trusted.");
    app.icon('block');
  } else {
    //console.log('on');
    app.icon('allow');
    app.title('This is a trusted page.');
  }
}

/* Entry Point */
main.get_whitelist();