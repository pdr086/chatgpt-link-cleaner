"use strict";

function protectLink(event) {
  const link = event.composedPath().find(node =>
    node instanceof HTMLAnchorElement || node instanceof HTMLAreaElement
  );
  if (!link?.hasAttribute("href")) {
    return;
  }

  const destination = URL.parse(link.href);
  if (!destination || !["https:", "http:"].includes(destination.protocol) || destination.origin === location.origin) {
    return;
  }

  // A link can override the page's Referrer-Policy with its own attribute.
  if (link instanceof HTMLAreaElement) {
    link.relList.add("noreferrer");
  } else {
    link.referrerPolicy = "no-referrer";
  }
}

for (const event of ["click", "auxclick", "contextmenu", "dragstart"]) {
  window.addEventListener(event, protectLink, { capture: true });
}
