import axios from "axios";

const PISTON_URL = "https://emkc.org/api/v2/piston/execute";

const languageMap = {
  python: "python",
  cpp: "cpp",
  c: "c",
  java: "java"
};

export const runCodeWithPiston = async (code, lang, input) => {

  const selected = languageMap[lang];
  if (!selected) throw new Error("Unsupported language");

  const response = await axios.post(PISTON_URL, {
    language: selected,
    version: "*",
    files: [
      {
        content: code
      }
    ],
    stdin: input || ""
  });

  return response.data.run;
};