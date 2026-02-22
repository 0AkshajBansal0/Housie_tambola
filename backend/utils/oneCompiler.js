import axios from "axios";

const ONECOMPILER_URL = "https://api.onecompiler.com/v1/run";

export const runCodeWithOneCompiler = async (code, language, inputArray) => {

  const response = await axios.post(
    ONECOMPILER_URL,
    {
      language,
      stdin: inputArray,   // batch execution
      files: [
        {
          name: "main",
          content: code
        }
      ]
    },
    {
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.ONECOMPILER_API_KEY
      }
    }
  );

  return response.data;
};