const production = import.meta.env.PROD;

const ORIGIN = production ? "http://localhost:4000" : "http://localhost:4000";

const WCA_ORIGIN = production
  ? "https://www.worldcubeassociation.org"
  : "http://0.0.0.0:3000";

const GROUPIFIER_ORIGIN = "https://groupifier.jonatanklosko.com";

const SCRAMBLES_MATCHER_ORIGIN =
  "https://scrambles-matcher.worldcubeassociation.org";

export function appUrl(path = "") {
  return `${ORIGIN}${path}`;
}

export function wcaUrl(path = "") {
  return `${WCA_ORIGIN}${path}`;
}

export function groupifierUrl(path = "") {
  const query = production ? "" : "?staging=true";
  return `${GROUPIFIER_ORIGIN}${path}${query}`;
}

export function scramblesMatcherUrl(path = "") {
  const query = production ? "" : "?staging=true";
  return `${SCRAMBLES_MATCHER_ORIGIN}${path}${query}`;
}
