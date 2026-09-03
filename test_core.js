const { TranslatorEngine } = require('./translator.js');
const engine = new TranslatorEngine();

async function test() {
  try {
    console.log("Testing ko -> en...");
    const result = await engine.translate("안녕하세요, 이것은 테스트입니다.", 'ko', 'en');
    console.log(result);
  } catch (e) {
    console.error("Error during translation:", e);
  }
}
test();
