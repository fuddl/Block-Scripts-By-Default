for (let noscript of document.querySelectorAll("noscript")) {
  let replacement = document.createElement("span");
  for (let attr of noscript.attributes) {
    replacement.setAttribute(attr.nodeName, attr.nodeValue);
  }
  replacement.innerHTML = noscript.innerHTML;
  noscript.replaceWith(replacement);
}