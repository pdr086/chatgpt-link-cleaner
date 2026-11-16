"use strict";

const chatGPTDomains = ["chatgpt.com", "chat.openai.com"];
const trackingKeys = new Set([
  "utm_source", "utm_medium", "utm_campaign", "utm_id", "utm_term",
  "utm_content", "utm_source_platform", "ref", "referrer", "source",
]);

function isChatGPTHost(hostname) {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  return chatGPTDomains.some(domain => host === domain || host.endsWith(`.${domain}`));
}

function isChatGPTUrl(value) {
  const url = URL.parse(value);
  return Boolean(url && ["https:", "http:"].includes(url.protocol) && isChatGPTHost(url.hostname));
}

function isChatGPTMarker(value) {
  const marker = value.trim().toLowerCase();
  return marker === "chatgpt" || isChatGPTHost(marker) || isChatGPTUrl(marker);
}

function cleanTrackingParameters(address) {
  const url = new URL(address);
  if (!url.search) {
    return undefined;
  }

  // Keep the original encoding, order and repeats of the parameters we retain.
  const parameters = url.search.slice(1).split("&");
  const remaining = parameters.filter(parameter => {
    const [entry] = new URLSearchParams(`?${parameter}`);
    return !entry || !trackingKeys.has(entry[0].toLowerCase()) || !isChatGPTMarker(entry[1]);
  });
  if (remaining.length === parameters.length) {
    return undefined;
  }

  url.search = remaining.join("&");
  return url.href;
}

const navigations = { urls: ["*://*/*"], types: ["main_frame"] };

browser.webRequest.onBeforeRequest.addListener(({ method, url }) => {
  // Only redirect regular link navigations, leaving form submissions intact.
  if (method === "GET") {
    const redirectUrl = cleanTrackingParameters(url);
    if (redirectUrl) {
      return { redirectUrl };
    }
  }
  return undefined;
}, navigations, ["blocking"]);

browser.webRequest.onBeforeSendHeaders.addListener(({ url, requestHeaders }) => {
  if (isChatGPTUrl(url)) {
    return undefined;
  }

  const headers = requestHeaders.filter(header =>
    header.name.toLowerCase() !== "referer" || !isChatGPTUrl(header.value)
  );
  return headers.length === requestHeaders.length ? undefined : { requestHeaders: headers };
}, navigations, ["blocking", "requestHeaders"]);

const chatGPTDocuments = {
  urls: ["*://*.chatgpt.com/*", "*://*.chat.openai.com/*"],
  types: ["main_frame", "sub_frame"],
};
const referrerPolicies = new Set([
  "no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin",
  "same-origin", "strict-origin", "strict-origin-when-cross-origin", "unsafe-url",
]);

browser.webRequest.onHeadersReceived.addListener(({ responseHeaders }) => {
  // Firefox computes document.referrer separately from the outgoing Referer header.
  const policyHeaders = responseHeaders.filter(header => header.name.toLowerCase() === "referrer-policy");
  const originalPolicy = policyHeaders.flatMap(header => (header.value ?? "").toLowerCase().split(","))
    .map(policy => policy.trim()).findLast(policy => referrerPolicies.has(policy));

  if (originalPolicy === "no-referrer" || originalPolicy === "same-origin") {
    return undefined;
  }

  const policy = originalPolicy === "origin" || originalPolicy === "strict-origin"
    ? "no-referrer" : "same-origin";
  return {
    responseHeaders: [
      ...responseHeaders.filter(header => !policyHeaders.includes(header)),
      { name: "Referrer-Policy", value: policy },
    ],
  };
}, chatGPTDocuments, ["blocking", "responseHeaders"]);
