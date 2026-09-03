/**
 * translator.js - 쉬운 영어 / 쉬운 한국어 번역 엔진
 */

// Node.js 환경 대비 모듈 로드
if (typeof require !== 'undefined') {
  try {
    if (typeof englishToKoreanPhonetics === 'undefined') {
      const phoneticModule = require('./phonetic.js');
      global.englishToKoreanPhonetics = phoneticModule.englishToKoreanPhonetics;
    }
    if (typeof PRESET_CATEGORIES === 'undefined') {
      const presetsModule = require('./presets.js');
      global.PRESET_CATEGORIES = presetsModule.PRESET_CATEGORIES;
    }
  } catch (e) {}
}

// 쉬운 영어 변환용 대체 사전 (어려운 영어 표현 -> 일상 쉬운 영어)
const EASY_ENGLISH_REPLACEMENTS = [
  { hard: /\butilize\b/gi, easy: "use" },
  { hard: /\bpurchase\b/gi, easy: "buy" },
  { hard: /\bcommence\b/gi, easy: "start" },
  { hard: /\bterminate\b/gi, easy: "end" },
  { hard: /\bcomprehend\b/gi, easy: "understand" },
  { hard: /\bassistance\b/gi, easy: "help" },
  { hard: /\bassist\b/gi, easy: "help" },
  { hard: /\binquire\b/gi, easy: "ask" },
  { hard: /\bapproximately\b/gi, easy: "about" },
  { hard: /\bcurrently\b/gi, easy: "now" },
  { hard: /\bnotify\b/gi, easy: "tell" },
  { hard: /\bobtain\b/gi, easy: "get" },
  { hard: /\brequire\b/gi, easy: "need" },
  { hard: /\bdemonstrate\b/gi, easy: "show" },
  { hard: /\bprovide\b/gi, easy: "give" },
  { hard: /\bnumerous\b/gi, easy: "many" },
  { hard: /\bapologize\b/gi, easy: "say sorry" },
  { hard: /\bdesire\b/gi, easy: "want" },
  { hard: /\bpermit\b/gi, easy: "let" },
  { hard: /\badditional\b/gi, easy: "more" }
];

// 쉬운 한국어 변환용 정제 (딱딱한 문어체 -> 친절하고 자연스러운 구어체)
const EASY_KOREAN_REPLACEMENTS = [
  { hard: /하십시오/g, easy: "해 주세요" },
  { hard: /바랍니다/g, easy: "부탁드려요" },
  { hard: /되어집니다/g, easy: "돼요" },
  { hard: /것으로 사료됩니다/g, easy: "인 것 같아요" },
  { hard: /그것은 /g, easy: "그건 " },
  { hard: /이것은 /g, easy: "이건 " },
  { hard: /당신/g, easy: "상대방" },
  { hard: /사용하시겠습니까\?/g, easy: "쓰실래요?" },
  { hard: /구매하시겠습니까\?/g, easy: "사실래요?" },
  { hard: /위치하고 있습니다/g, easy: "있어요" },
  { hard: /가능합니다/g, easy: "할 수 있어요" },
  { hard: /불가능합니다/g, easy: "안 돼요" }
];

class TranslatorEngine {
  constructor() {
    this.cache = new Map();
  }

  /**
   * 언어 자동 감지: 한글이 포함되어 있으면 'ko', 아니면 'en'
   */
  detectLanguage(text) {
    const koreanRegex = /[\uac00-\ud7af\u1100-\u11ff\u3130-\u318f]/;
    return koreanRegex.test(text) ? 'ko' : 'en';
  }

  /**
   * 영어를 더 쉬운 영어 표현으로 단순화
   */
  simplifyEnglish(text) {
    let simplified = text;
    for (const rule of EASY_ENGLISH_REPLACEMENTS) {
      simplified = simplified.replace(rule.hard, rule.easy);
    }
    return simplified;
  }

  /**
   * 한국어를 더 친근하고 쉬운 일상 구어체로 단순화
   */
  simplifyKorean(text) {
    let simplified = text;
    for (const rule of EASY_KOREAN_REPLACEMENTS) {
      simplified = simplified.replace(rule.hard, rule.easy);
    }
    return simplified;
  }

  /**
   * 번역 실행
   * @param {string} text 입력 텍스트
   * @param {string} sourceLang 'ko' | 'en' | 'auto'
   * @param {string} targetLang 'ko' | 'en'
   * @returns {Promise<{ translatedText: string, phonetic?: string, sourceLang: string, targetLang: string, alternatives?: Array<{text: string, pron: string, desc: string}> }>}
   */
  async translate(text, sourceLang = 'auto', targetLang = 'en') {
    const trimmed = text.trim();
    if (!trimmed) {
      return { translatedText: "", sourceLang, targetLang };
    }

    // 1. 언어 자동 판별
    let actualSource = sourceLang;
    let actualTarget = targetLang;
    if (sourceLang === 'auto') {
      actualSource = this.detectLanguage(trimmed);
      actualTarget = actualSource === 'ko' ? 'en' : 'ko';
    }

    // 캐시 키
    const cacheKey = `${actualSource}->${actualTarget}:${trimmed}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    let translatedText = "";
    let alternatives = [];

    // 2. 프리셋/내장 데이터에서 일치하는 것 검색
    const presetMatch = this.findInPresets(trimmed, actualSource);
    if (presetMatch) {
      translatedText = actualSource === 'ko' ? presetMatch.en : presetMatch.ko;
      const phonetic = actualSource === 'ko' ? presetMatch.pron || englishToKoreanPhonetics(translatedText) : undefined;
      
      if (actualSource === 'ko' && presetMatch.alternatives) {
        alternatives = presetMatch.alternatives;
      }

      const result = {
        translatedText,
        phonetic,
        sourceLang: actualSource,
        targetLang: actualTarget,
        alternatives,
        isPreset: true
      };
      this.cache.set(cacheKey, result);
      return result;
    }

    // 3. 외부 무료 번역 API 호출
    try {
      translatedText = await this.fetchTranslation(trimmed, actualSource, actualTarget);
    } catch (err) {
      console.warn("API Translation failed, fallback to basic dictionary:", err);
      translatedText = this.fallbackTranslate(trimmed, actualSource);
    }

    // 4. 쉬운 표현으로 가공
    if (actualTarget === 'en') {
      translatedText = this.simplifyEnglish(translatedText);
      alternatives = this.generateEasyAlternatives(trimmed, translatedText);
    } else {
      translatedText = this.simplifyKorean(translatedText);
    }

    // 5. 단어장 추출 로직
    let englishText = actualTarget === 'en' ? translatedText : trimmed;
    let vocabulary = await this.extractVocabulary(englishText);

    const result = {
      translatedText,
      vocabulary,
      sourceLang: actualSource,
      targetLang: actualTarget,
      alternatives
    };

    this.cache.set(cacheKey, result);
    return result;
  }

  // 어려운 영단어 추출 및 뜻 가져오기
  async extractVocabulary(englishText) {
    const STOP_WORDS = new Set(['i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'you', 'your', 'yours', 'he', 'him', 'his', 'she', 'her', 'hers', 'it', 'its', 'they', 'them', 'their', 'theirs', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now', 'always', 'today', 'yesterday', 'tomorrow', 'good', 'bad', 'well', 'much', 'many', 'like', 'make', 'made', 'go', 'goes', 'went', 'take', 'took', 'get', 'got', 'know', 'knew', 'think', 'thought', 'say', 'said', 'see', 'saw', 'come', 'came', 'want', 'look', 'use', 'find', 'give', 'tell', 'work', 'call', 'try', 'ask', 'need', 'feel', 'become', 'leave', 'put', 'mean', 'keep', 'let', 'begin', 'seem', 'help', 'talk', 'turn', 'start', 'might', 'show', 'hear', 'play', 'run', 'move', 'live', 'believe', 'hold', 'bring', 'happen', 'must', 'write', 'provide', 'sit', 'stand', 'lose', 'pay', 'meet', 'include', 'continue', 'set', 'learn', 'change', 'lead', 'understand', 'watch', 'follow', 'stop', 'create', 'speak', 'read', 'allow', 'add', 'spend', 'grow', 'open', 'walk', 'win', 'offer', 'remember', 'love', 'consider', 'appear', 'buy', 'wait', 'serve', 'die', 'send', 'expect', 'build', 'stay', 'fall', 'cut', 'reach', 'kill', 'remain', 'yes', 'no', 'ok', 'okay', 'right', 'really', 'there', 'their', 'theyre', 'im', 'cant', 'dont', 'wont', 'would', 'could', 'shouldnt']);

    // 특수문자 제거 후 단어 분리
    const words = englishText.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/);
    
    // 불용어 제외, 4글자 이상, 길이순(어려운 단어 우선) 정렬하여 최대 3개 추출
    const candidates = [...new Set(words)]
        .filter(w => w.length >= 4 && !STOP_WORDS.has(w))
        .sort((a, b) => b.length - a.length)
        .slice(0, 3);

    const vocabList = [];
    for (const word of candidates) {
        try {
            // 단어별 한글 뜻 가져오기
            const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q=${encodeURIComponent(word)}`);
            const data = await res.json();
            const meaning = data[0][0][0];
            
            if (meaning && meaning.toLowerCase() !== word.toLowerCase()) {
                vocabList.push({ word, meaning });
            }
        } catch (e) {
            console.error('Vocab fetch error:', e);
        }
    }
    return vocabList;
  }

  /**
   * 초보자를 위한 더 짧고 쉬운 대안 표현 자동 추천
   */
  generateEasyAlternatives(koText, enText) {
    const list = [];
    const lowerKo = koText.toLowerCase();

    if (lowerKo.includes("화장실")) {
      list.push({ text: "Bathroom, please?", pron: "배쓰룸, 플리즈?", desc: "가장 짧고 확실한 표현" });
      list.push({ text: "Where is toilet?", pron: "웨어 이즈 토일렛?", desc: "직관적인 표현" });
    } else if (lowerKo.includes("얼마")) {
      list.push({ text: "How much?", pron: "하우 머치?", desc: "가격 물어볼 때 2단어로 끝내기" });
    } else if (lowerKo.includes("주세요") || lowerKo.includes("부탁")) {
      list.push({ text: "This, please.", pron: "디스, 플리즈.", desc: "손가락으로 가리키며 말하기" });
    } else if (lowerKo.includes("도와") || lowerKo.includes("도움")) {
      list.push({ text: "Help me!", pron: "헬프 미!", desc: "긴급할 때 외치는 2단어" });
    } else if (lowerKo.includes("계산") || lowerKo.includes("얼마예요")) {
      list.push({ text: "Bill, please.", pron: "빌, 플리즈.", desc: "식당에서 계산할 때" });
    }

    return list;
  }

  /**
   * 프리셋 검색
   */
  findInPresets(text, sourceLang) {
    if (typeof PRESET_CATEGORIES === 'undefined') return null;
    
    const clean = text.toLowerCase().replace(/[?!.,]/g, '').trim();
    for (const cat of PRESET_CATEGORIES) {
      for (const item of cat.items) {
        const itemSrc = (sourceLang === 'ko' ? item.ko : item.en).toLowerCase().replace(/[?!.,]/g, '').trim();
        if (clean === itemSrc) {
          return item;
        }
      }
    }
    return null;
  }

  /**
   * 구글 무료 번역 API 엔드포인트 호출
   */
  async fetchTranslation(text, sourceLang, targetLang) {
    // 1차 시도: Google Translate Single endpoint
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data && data[0] && Array.isArray(data[0])) {
          return data[0].map(item => item[0]).join(" ").trim();
        }
      }
    } catch (e) {
      console.warn("Google endpoint error, trying MyMemory API...", e);
    }

    // 2차 시도: MyMemory Translation API
    try {
      const pair = `${sourceLang}|${targetLang}`;
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${pair}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data && data.responseData && data.responseData.translatedText) {
          return data.responseData.translatedText.trim();
        }
      }
    } catch (e) {
      console.warn("MyMemory endpoint error...", e);
    }

    throw new Error("Translation service currently unavailable");
  }

  /**
   * 오프라인 기본 번역 fallback
   */
  fallbackTranslate(text, sourceLang) {
    if (sourceLang === 'ko') {
      return "Translation service network is offline.";
    } else {
      return "번역 네트워크가 오프라인 상태입니다.";
    }
  }
}

// 전역 인스턴스
const translator = new TranslatorEngine();

if (typeof module !== "undefined" && module.exports) {
  module.exports = { TranslatorEngine, translator };
}
