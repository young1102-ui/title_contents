const { TranslatorEngine } = require('./translator.js');
const engine = new TranslatorEngine();

async function test() {
  const result = await engine.translate("Nowadays, everyone creates and distributes automation apps.", 'ko', 'en');
  console.log("Translation:", result.translatedText);
  console.log("Vocab:", result.vocabulary);
}

test();
