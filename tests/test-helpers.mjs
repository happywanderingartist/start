export function jsonRequest(path, { method = "GET", body } = {}) {
  return new Request(`https://example.test${path}`, {
    method,
    headers: body === undefined ? {} : { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export async function readJson(response) {
  return JSON.parse(await response.text());
}
