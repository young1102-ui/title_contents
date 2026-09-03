const { englishToKoreanPhonetics } = require('./phonetic.js');

const tests = [
  "She goes into the crowd and sings. The response from the audience is very good."
];

tests.forEach(t => {
  console.log('EN:', t);
  console.log('  Natural:', englishToKoreanPhonetics(t, 'natural'));
  console.log('  Clear:  ', englishToKoreanPhonetics(t, 'clear'));
  console.log('');
});
