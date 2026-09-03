/**
 * app.js - UI 상호작용, 음성 지원(TTS/STT), 저장소 관리
 */

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const sourceInput = document.getElementById("source-input");
  const translatedTextEl = document.getElementById("translated-text");
  const vocabContainer = document.getElementById("vocab-box");
  const placeholderText = document.getElementById("placeholder-text");
  
  const translateBtn = document.getElementById("translate-btn");
  const clearBtn = document.getElementById("clear-btn");
  const micBtn = document.getElementById("mic-btn");
  const swapLangBtn = document.getElementById("swap-lang-btn");
  
  const srcLangLabel = document.getElementById("src-lang-label");
  const tgtLangLabel = document.getElementById("tgt-lang-label");
  const inputHeaderTitle = document.getElementById("input-header-title");
  const outputHeaderTitle = document.getElementById("output-header-title");
  const charCountEl = document.getElementById("char-count");
  
  const speakBtn = document.getElementById("speak-btn");
  const speakSlowBtn = document.getElementById("speak-slow-btn");
  const practiceBtn = document.getElementById("practice-btn");
  const copyBtn = document.getElementById("copy-btn");
  const favBtn = document.getElementById("fav-btn");
  
  const alternativesContainer = document.getElementById("alternatives-box") || document.getElementById("alternatives-container");
  const alternativesList = document.getElementById("alt-content") || document.getElementById("alternatives-list");
  const practiceContainer = document.getElementById("practice-container");
  const practiceStatus = document.getElementById("practice-status");
  const practiceFeedback = document.getElementById("practice-feedback");

  const toast = document.getElementById("toast");
  const navTabs = document.querySelectorAll(".nav-tab-btn");
  const tabViews = document.querySelectorAll(".tab-view");

  // State
  let currentSourceLang = "ko"; // 'ko' or 'en'
  let currentTargetLang = "en";
  let lastTranslationResult = null;
  let isRecording = false;
  let isPracticing = false;
  let recognition = null;
  let practiceRecognition = null;
  let favorites = JSON.parse(localStorage.getItem("easy_eng_favs") || "[]");

  // --- Initial Setup ---
  updateLangUI();
  renderPresetCategories();
  renderFavorites();

  // --- Tab Navigation ---
  navTabs.forEach(btn => {
    btn.addEventListener("click", () => {
      navTabs.forEach(b => b.classList.remove("active"));
      tabViews.forEach(v => v.classList.remove("active"));
      
      btn.classList.add("active");
      const targetId = btn.getAttribute("data-tab");
      const targetView = document.getElementById(targetId);
      if (targetView) targetView.classList.add("active");
    });
  });

  // --- Language Toggle (Swap) ---
  swapLangBtn.addEventListener("click", () => {
    const temp = currentSourceLang;
    currentSourceLang = currentTargetLang;
    currentTargetLang = temp;

    // Swap text if already exists
    const currentSrcText = sourceInput.value.trim();
    const currentTgtText = translatedTextEl.textContent.trim();
    
    if (currentTgtText && currentSrcText) {
      sourceInput.value = currentTgtText;
      charCountEl.textContent = `${currentTgtText.length} / 500`;
    }
    
    updateLangUI();
    if (sourceInput.value.trim()) {
      handleTranslate();
    }
  });

  function updateLangUI() {
    if (currentSourceLang === "ko") {
      srcLangLabel.textContent = "🇰🇷 한국어";
      tgtLangLabel.textContent = "🇺🇸 쉬운 영어";
      inputHeaderTitle.innerHTML = `<i class="fa-solid fa-pen"></i> 번역할 한국어 입력`;
      outputHeaderTitle.innerHTML = `<i class="fa-solid fa-language"></i> 영어 번역 결과`;
      sourceInput.placeholder = "번역할 한국어 문장을 입력하세요.\n(예: 이 근처에 맛있는 식당이 있나요?)";
    } else {
      srcLangLabel.textContent = "🇺🇸 영어";
      tgtLangLabel.textContent = "🇰🇷 쉬운 한국어";
      inputHeaderTitle.innerHTML = `<i class="fa-solid fa-pen"></i> 번역할 영어 입력`;
      outputHeaderTitle.innerHTML = `<i class="fa-solid fa-language"></i> 한국어 번역 결과`;
      sourceInput.placeholder = "번역할 영어 문장을 입력하세요.\n(예: Is there a good restaurant nearby?)";
    }
    updateFavButtonState();
  }

  // --- Character Count ---
  sourceInput.addEventListener("input", () => {
    const len = sourceInput.value.length;
    charCountEl.textContent = `${len} / 500`;
  });

  // --- Clear Button ---
  clearBtn.addEventListener("click", () => {
    sourceInput.value = "";
    charCountEl.textContent = "0 / 500";
    clearOutput();
    sourceInput.focus();
  });

  function clearOutput() {
    lastTranslationResult = null;
    placeholderText.style.display = "block";
    translatedTextEl.style.display = "none";
    translatedTextEl.textContent = "";
    phoneticContainer.style.display = "none";
    phoneticTextEl.textContent = "";
    alternativesContainer.style.display = "none";
    practiceContainer.style.display = "none";
    
    speakBtn.disabled = true;
    speakSlowBtn.disabled = true;
    practiceBtn.disabled = true;
    copyBtn.disabled = true;
    favBtn.disabled = true;
    updateFavButtonState();
  }

  // --- Translation Trigger ---
  translateBtn.addEventListener("click", () => {
    handleTranslate();
  });

  sourceInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleTranslate();
    }
  });

  async function handleTranslate() {
    const text = sourceInput.value.trim();
    if (!text) {
      clearOutput();
      return;
    }

    // Auto switch language mode if needed
    const detected = translator.detectLanguage(text);
    if (detected !== currentSourceLang) {
      currentSourceLang = detected;
      currentTargetLang = detected === "ko" ? "en" : "ko";
      updateLangUI();
    }

    // UI Loading state
    placeholderText.style.display = "none";
    translatedTextEl.style.display = "block";
    translatedTextEl.innerHTML = '<span style="color: #94a3b8;"><i class="fa-solid fa-spinner fa-spin"></i> 쉬운 표현으로 번역 중...</span>';
    if(vocabContainer) vocabContainer.style.display = "none";
    practiceContainer.style.display = "none";

    try {
      const result = await translator.translate(text, currentSourceLang, currentTargetLang);
      lastTranslationResult = result;

      // Render Result
      translatedTextEl.textContent = result.translatedText;
      
      // Render Vocabulary
      if (vocabContainer) {
        if (result.vocabulary && result.vocabulary.length > 0) {
          vocabContainer.innerHTML = `<div class="vocab-header">📚 주요 단어</div>` + result.vocabulary.map(v => `
            <div class="vocab-item">
              <span class="vocab-en">${v.word}</span>
              <button class="vocab-speak-btn" onclick="speakWord('${encodeURIComponent(v.word)}')"><i class="fa-solid fa-volume-high"></i></button>
              <span class="vocab-ko">${v.meaning}</span>
            </div>
          `).join("");
          vocabContainer.style.display = "block";
        } else {
          vocabContainer.style.display = "none";
        }
      }

      // Enable action buttons
      speakBtn.disabled = false;
      speakSlowBtn.disabled = false;
      practiceBtn.disabled = (result.targetLang !== "en");
      copyBtn.disabled = false;
      favBtn.disabled = false;
      updateFavButtonState();

    } catch (err) {
      translatedTextEl.textContent = "번역 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
      console.error(err);
    }
  }

  // --- Text to Speech (TTS) ---
  function speak(text, lang, rate = 1.0) {
    if (!("speechSynthesis" in window)) {
      showToast("이 브라우저는 음성 듣기를 지원하지 않습니다.");
      return;
    }

    window.speechSynthesis.cancel(); // Stop any previous speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === "en" ? "en-US" : "ko-KR";
    utterance.rate = rate; // 1.0 (normal) or 0.7 (slow)
    utterance.pitch = 1.0;

    window.speechSynthesis.speak(utterance);
  }

  window.speakWord = (encodedWord) => {
    const word = decodeURIComponent(encodedWord);
    speak(word, "en", 1.0);
  };

  speakBtn.addEventListener("click", () => {
    if (!lastTranslationResult) return;
    speak(lastTranslationResult.translatedText, lastTranslationResult.targetLang, 1.0);
  });

  speakSlowBtn.addEventListener("click", () => {
    if (!lastTranslationResult) return;
    speak(lastTranslationResult.translatedText, lastTranslationResult.targetLang, 0.7);
    showToast("🐢 0.7배속으로 천천히 들려드립니다.");
  });

  // --- Speech to Text (STT / Mic) ---
  if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      isRecording = true;
      micBtn.classList.add("recording");
      micBtn.querySelector("span").textContent = "듣는 중...";
      showToast("🎙️ 마이크에 대고 말씀하세요.");
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      sourceInput.value = transcript;
      charCountEl.textContent = `${transcript.length} / 500`;
      handleTranslate();
    };

    recognition.onerror = (event) => {
      console.warn("Speech recognition error:", event.error);
      showToast("음성 인식 오류가 발생했습니다: " + event.error);
      stopRecording();
    };

    recognition.onend = () => {
      stopRecording();
    };
  }

  micBtn.addEventListener("click", () => {
    if (!recognition) {
      showToast("이 브라우저는 마이크 음성 입력을 지원하지 않습니다.");
      return;
    }

    if (isRecording) {
      recognition.stop();
      stopRecording();
    } else {
      recognition.lang = currentSourceLang === "ko" ? "ko-KR" : "en-US";
      try {
        recognition.start();
      } catch (e) {
        console.error(e);
      }
    }
  });

  function stopRecording() {
    isRecording = false;
    micBtn.classList.remove("recording");
    micBtn.querySelector("span").textContent = "음성 입력";
  }

  // --- Pronunciation Practice Mode (Shadowing) ---
  practiceBtn.addEventListener("click", () => {
    if (!lastTranslationResult || lastTranslationResult.targetLang !== "en") return;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast("이 브라우저는 음성 인식을 지원하지 않습니다.");
      return;
    }

    if (isPracticing) {
      if (practiceRecognition) practiceRecognition.stop();
      isPracticing = false;
      practiceBtn.classList.remove("active");
      practiceStatus.textContent = "연습 종료";
      return;
    }

    practiceContainer.style.display = "block";
    practiceStatus.textContent = "🎙️ 영어로 읽어보세요...";
    practiceFeedback.innerHTML = '<span style="color: #6B7280;">듣고 있습니다...</span>';
    practiceBtn.classList.add("active");
    isPracticing = true;

    practiceRecognition = new SpeechRecognition();
    practiceRecognition.lang = "en-US";
    practiceRecognition.continuous = false;
    practiceRecognition.interimResults = false;

    practiceRecognition.onresult = (event) => {
      const userSpoke = event.results[0][0].transcript.trim();
      const targetText = lastTranslationResult.translatedText.trim();
      
      // Compare (simple similarity)
      const cleanTarget = targetText.toLowerCase().replace(/[.,?!]/g, '');
      const cleanUser = userSpoke.toLowerCase().replace(/[.,?!]/g, '');

      if (cleanTarget === cleanUser || cleanTarget.includes(cleanUser) || cleanUser.includes(cleanTarget)) {
        practiceFeedback.innerHTML = `
          <div style="color: #059669;">
            🎉 <strong>완벽해요!</strong> "${userSpoke}"<br>
            <span style="font-size: 12px; color: #10B981;">원어민처럼 훌륭하게 발음하셨어요!</span>
          </div>
        `;
      } else {
        practiceFeedback.innerHTML = `
          <div style="color: #D97706;">
            💡 <strong>인식된 발음:</strong> "${userSpoke}"<br>
            <span style="font-size: 12px; color: #6B7280;">목표: "${targetText}" (발음을 다시 한 번 들어보세요)</span>
          </div>
        `;
      }
      practiceStatus.textContent = "연습 완료";
      practiceBtn.classList.remove("active");
      isPracticing = false;
    };

    practiceRecognition.onerror = (e) => {
      practiceStatus.textContent = "인식 실패";
      practiceFeedback.innerHTML = `<span style="color: #EF4444;">다시 시도해 보세요 (${e.error})</span>`;
      practiceBtn.classList.remove("active");
      isPracticing = false;
    };

    practiceRecognition.onend = () => {
      practiceBtn.classList.remove("active");
      isPracticing = false;
    };

    try {
      practiceRecognition.start();
    } catch (e) {
      console.error(e);
    }
  });

  // --- Copy to Clipboard ---
  copyBtn.addEventListener("click", () => {
    if (!lastTranslationResult) return;
    
    let copyText = lastTranslationResult.translatedText;
    
    // 복사 시 단어장 내용 포함
    if (lastTranslationResult.vocabulary && lastTranslationResult.vocabulary.length > 0) {
      copyText += `\n\n[📚 어려운 단어 사전]`;
      lastTranslationResult.vocabulary.forEach(v => {
        copyText += `\n- ${v.word}: ${v.meaning}`;
      });
    }

    navigator.clipboard.writeText(copyText).then(() => {
      showToast("번역과 단어장이 클립보드에 복사되었습니다.");
    }).catch(() => {
      showToast("복사에 실패했습니다.");
    });
  });

  // --- Favorites Management ---
  favBtn.addEventListener("click", () => {
    if (!lastTranslationResult) return;

    const sourceText = sourceInput.value.trim();
    const targetText = lastTranslationResult.translatedText;
    const vocabulary = lastTranslationResult.vocabulary || [];

    const existingIdx = favorites.findIndex(f => f.sourceText === sourceText && f.targetText === targetText);

    if (existingIdx >= 0) {
      favorites.splice(existingIdx, 1);
      showToast("⭐ 저장 목록에서 삭제되었습니다.");
    } else {
      favorites.unshift({
        id: Date.now(),
        sourceText,
        targetText,
        phonetic,
        sourceLang: currentSourceLang,
        targetLang: currentTargetLang,
        date: new Date().toLocaleDateString("ko-KR")
      });
      showToast("⭐ 문장장에 저장되었습니다!");
    }

    localStorage.setItem("easy_eng_favs", JSON.stringify(favorites));
    updateFavButtonState();
    renderFavorites();
  });

  function updateFavButtonState() {
    if (!lastTranslationResult) {
      favBtn.innerHTML = '<i class="fa-regular fa-star"></i> <span>저장</span>';
      return;
    }
    const sourceText = sourceInput.value.trim();
    const targetText = lastTranslationResult.translatedText;
    const isSaved = favorites.some(f => f.sourceText === sourceText && f.targetText === targetText);

    if (isSaved) {
      favBtn.innerHTML = '<i class="fa-solid fa-star" style="color: #F59E0B;"></i> <span>저장됨</span>';
    } else {
      favBtn.innerHTML = '<i class="fa-regular fa-star"></i> <span>저장</span>';
    }
  }

  function renderFavorites() {
    const listEl = document.getElementById("favorites-list");
    const countEl = document.getElementById("fav-count");
    countEl.textContent = favorites.length;

    if (favorites.length === 0) {
      listEl.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: #94A3B8;">
          <i class="fa-regular fa-star" style="font-size: 32px; margin-bottom: 10px; display: block;"></i>
          저장된 문장이 없습니다. 자주 쓰는 표현을 저장해 보세요!
        </div>
      `;
      return;
    }

    listEl.innerHTML = favorites.map(fav => `
      <div class="fav-card">
        <div class="fav-info" style="cursor: pointer;" onclick="loadFavorite(${fav.id})">
          <span class="fav-ko">${fav.sourceLang === 'ko' ? fav.sourceText : fav.targetText}</span>
          <span class="fav-en">${fav.targetLang === 'en' ? fav.targetText : fav.sourceText}</span>
        </div>
        <div class="fav-actions">
          <button class="icon-btn" onclick="speakFav('${encodeURIComponent(fav.targetText)}', '${fav.targetLang}')" title="듣기">
            <i class="fa-solid fa-volume-high"></i>
          </button>
          <button class="icon-btn" onclick="deleteFavorite(${fav.id})" title="삭제" style="color: #EF4444;">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>
    `).join("");
  }

  window.loadFavorite = (id) => {
    const item = favorites.find(f => f.id === id);
    if (!item) return;

    // Switch to translate tab
    document.querySelector('.nav-tab-btn[data-tab="translate-tab"]').click();
    
    currentSourceLang = item.sourceLang;
    currentTargetLang = item.targetLang;
    updateLangUI();

    sourceInput.value = item.sourceText;
    charCountEl.textContent = `${item.sourceText.length} / 500`;
    handleTranslate();
  };

  window.speakFav = (encodedText, lang) => {
    const text = decodeURIComponent(encodedText);
    speak(text, lang, 1.0);
  };

  window.deleteFavorite = (id) => {
    favorites = favorites.filter(f => f.id !== id);
    localStorage.setItem("easy_eng_favs", JSON.stringify(favorites));
    renderFavorites();
    updateFavButtonState();
    showToast("삭제되었습니다.");
  };

  document.getElementById("clear-favs-btn").addEventListener("click", () => {
    if (favorites.length === 0) return;
    if (confirm("저장된 문장장을 모두 비우시겠습니까?")) {
      favorites = [];
      localStorage.setItem("easy_eng_favs", JSON.stringify(favorites));
      renderFavorites();
      updateFavButtonState();
      showToast("문장장이 모두 삭제되었습니다.");
    }
  });

  // --- Situation Presets Rendering ---
  function renderPresetCategories() {
    if (typeof PRESET_CATEGORIES === "undefined") return;

    const tabsContainer = document.getElementById("preset-cat-tabs");
    tabsContainer.innerHTML = PRESET_CATEGORIES.map((cat, idx) => `
      <button class="cat-btn ${idx === 0 ? 'active' : ''}" data-cat-id="${cat.id}">
        ${cat.name}
      </button>
    `).join("");

    tabsContainer.querySelectorAll(".cat-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        tabsContainer.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderPresetCards(btn.getAttribute("data-cat-id"));
      });
    });

    renderPresetCards(PRESET_CATEGORIES[0].id);
  }

  function renderPresetCards(categoryId) {
    const grid = document.getElementById("preset-grid");
    const category = PRESET_CATEGORIES.find(c => c.id === categoryId);
    if (!category) return;

    grid.innerHTML = category.items.map(item => {
      // 어포스트로피(') 등 특수문자로 인한 onclick 에러 방지
      const safeKo = encodeURIComponent(item.ko).replace(/'/g, "%27");
      const safeEn = encodeURIComponent(item.en).replace(/'/g, "%27");
      
      return `
      <div class="preset-card" onclick="selectPreset('${safeKo}', '${safeEn}')">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="preset-ko">${item.ko}</span>
          <span style="font-size: 11px; color: #6366F1; font-weight: 600; background: #EEF2FF; padding: 2px 6px; border-radius: 4px;">${item.tag}</span>
        </div>
        <span class="preset-en">${item.en}</span>
      </div>
      `;
    }).join("");
  }

  window.selectPreset = (encodedKo, encodedEn) => {
    // 탭 전환 및 텍스트 박스 입력 등 기존 동작 삭제
    // 즉시 영어 음성만 재생 (장면 전환 없음)
    if (encodedEn) {
      const enText = decodeURIComponent(encodedEn);
      speak(enText, "en", 1.0);
    }
  };

  // --- Toast Notification ---
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 2500);
  }
});
