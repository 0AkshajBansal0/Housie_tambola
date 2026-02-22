import fetch from "node-fetch";

const languageIdMap = {
  python: 71,
  cpp: 54,
  java: 62,
  javascript: 63,
  typescript: 74,
  go: 60,
  rust: 73,
  c: 50
};

export async function runJudgeBatch(code, language, testCases) {

  const language_id = languageIdMap[language];
  if (!language_id) throw new Error("Unsupported language");

  const url = process.env.JUDGE + "/submissions/batch?fields=*";

  const submissions = testCases.map(tc => ({
    source_code: code,
    language_id,
    stdin: tc.input,
    expected_output: tc.expectedOutput
  }));

  const createRes = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ submissions })
  });

  const data = await createRes.json();
  const tokens = data.map(d => d.token);

  return await checkStatus(tokens);
}

async function checkStatus(tokens) {

  const tokenQuery = tokens.join(",");
  const baseUrl =
    process.env.JUDGE +
    `/submissions/batch?tokens=${tokenQuery}&base64_encoded=true&fields=*`;

  while (true) {

    const res = await fetch(baseUrl);
    const data = await res.json();
    const results = data.submissions || data;

    const allDone = results.every(
      r => r && r.status?.id !== 1 && r.status?.id !== 2
    );

    if (!allDone) {
      await new Promise(r => setTimeout(r, 1500));
      continue;
    }

    return results;
  }
}