const { englishToKoreanPhonetics } = require('./phonetic.js');

console.log('EN:', 'Korean pronunciation');
console.log('  Natural:', englishToKoreanPhonetics('Korean pronunciation', 'natural'));
console.log('  Clear:  ', englishToKoreanPhonetics('Korean pronunciation', 'clear'));
