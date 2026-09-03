const { englishToKoreanPhonetics } = require('./phonetic.js');

const tests = [
  "I can't take my eyes off you",
  "Don't do that",
  "I won't give up",
  "They didn't see it"
];

tests.forEach(t => {
  console.log('EN:', t);
  console.log('  Natural:', englishToKoreanPhonetics(t, 'natural'));
  console.log('  Clear:  ', englishToKoreanPhonetics(t, 'clear'));
  console.log('');
});
