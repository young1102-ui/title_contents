const { englishToKoreanPhonetics } = require('./phonetic.js');

const tests = [
  // 유저 스크린샷 문장 (이번)
  "What are you doing now? You know you have to read a lot these days, right?",
  // 이전 스크린샷 문장
  "I'm working hard on the app right now. But it doesn't work out",
  // 다양한 추가 테스트
  "She doesn't like it",
  "Let's figure out the problem",
  "I just want to go out",
  "It isn't easy to learn English",
  "We'll get through this together",
  "I've already been there before",
  // fallback 테스트 (사전에 없는 단어들)
  "The magnificent elephant disappeared",
  "She absolutely loves chocolate",
  "Can you recommend a restaurant nearby?",
  "My grandmother bakes wonderful cookies",
];

tests.forEach(t => {
  console.log('EN:', t);
  console.log('  Natural:', englishToKoreanPhonetics(t, 'natural'));
  console.log('  Clear:  ', englishToKoreanPhonetics(t, 'clear'));
  console.log('');
});
