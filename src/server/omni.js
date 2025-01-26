import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://api.omnistack.sh/openai/v1",
  apiKey: "osk_11ce2c0548ece1bed3b6950f3d0413b8",
});

async function main() {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: "You are a helpful assistant." }],
    model: "pauline_silas_patricia",
  });

  console.log(completion.choices[0]);
}

main();