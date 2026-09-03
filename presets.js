/**
 * presets.js - 일상생활 및 해외여행 필수 쉬운 영어 표현 모음
 */

const PRESET_CATEGORIES = [
  {
    id: "greetings",
    name: "👋 기본 인사 & 매너",
    items: [
      { ko: "안녕하세요!", en: "Hello!", pron: "헬로우!", tag: "인사" },
      { ko: "만나서 반가워요.", en: "Nice to meet you.", pron: "나이스 투 미트 유.", tag: "인사" },
      { ko: "감사합니다.", en: "Thank you.", pron: "땡큐.", tag: "매너" },
      { ko: "정말 고마워요!", en: "Thank you so much!", pron: "땡큐 쏘우 머치!", tag: "매너" },
      { ko: "천만에요 (별말씀을요).", en: "You're welcome.", pron: "유어 웰컴.", tag: "매너" },
      { ko: "실례합니다 / 저기요.", en: "Excuse me.", pron: "익스큐즈 미.", tag: "매너" },
      { ko: "죄송합니다.", en: "I'm sorry.", pron: "아임 쏘리.", tag: "매너" },
      { ko: "좋은 하루 보내세요!", en: "Have a good day!", pron: "해브 어 굿 데이!", tag: "인사" },
      { ko: "나중에 봐요!", en: "See you later!", pron: "씨 유 레이터!", tag: "인사" }
    ]
  },
  {
    id: "restaurant",
    name: "🍽️ 식당 & 카페",
    items: [
      { ko: "메뉴판 좀 주시겠어요?", en: "Menu, please.", pron: "메뉴, 플리즈.", tag: "주문" },
      { ko: "이거 주세요.", en: "This one, please.", pron: "디스 원, 플리즈.", tag: "주문" },
      { ko: "물 좀 주세요.", en: "Water, please.", pron: "워터, 플리즈.", tag: "주문" },
      { ko: "아이스 아메리카노 하나 주세요.", en: "One iced Americano, please.", pron: "원 아이스드 아메리카노, 플리즈.", tag: "카페" },
      { ko: "계산해 주세요.", en: "Check, please.", pron: "체크, 플리즈.", tag: "계산" },
      { ko: "포장해 갈게요 (테이크아웃).", en: "To go, please.", pron: "투 고, 플리즈.", tag: "주문" },
      { ko: "여기서 먹고 갈게요.", en: "For here, please.", pron: "포 히어, 플리즈.", tag: "주문" },
      { ko: "추천 메뉴가 뭐예요?", en: "What is good here?", pron: "왓 이즈 굿 히어?", tag: "질문" },
      { ko: "정말 맛있어요!", en: "It's so delicious!", pron: "잇츠 쏘우 딜리셔스!", tag: "칭찬" }
    ]
  },
  {
    id: "shopping",
    name: "🛍️ 쇼핑 & 계산",
    items: [
      { ko: "이거 얼마예요?", en: "How much is this?", pron: "하우 머치 이즈 디스?", tag: "가격" },
      { ko: "입어봐도 되나요?", en: "Can I try this on?", pron: "캔 아이 트라이 디스 온?", tag: "쇼핑" },
      { ko: "더 큰 사이즈 있나요?", en: "Do you have a bigger size?", pron: "두 유 해브 어 비거 사이즈?", tag: "쇼핑" },
      { ko: "카드 되나요?", en: "Can I pay with card?", pron: "캔 아이 페이 위드 카드?", tag: "결제" },
      { ko: "현금으로 낼게요.", en: "I'll pay cash.", pron: "아일 페이 캐시.", tag: "결제" },
      { ko: "영수증 주세요.", en: "Receipt, please.", pron: "리시트, 플리즈.", tag: "결제" },
      { ko: "그냥 둘러보는 중이에요.", en: "I'm just looking.", pron: "아임 저스트 루킹.", tag: "응답" },
      { ko: "이걸로 살게요.", en: "I'll take this.", pron: "아일 테이크 디스.", tag: "구매" }
    ]
  },
  {
    id: "directions",
    name: "🗺️ 길찾기 & 교통",
    items: [
      { 
        ko: "화장실이 어디예요?", 
        en: "Where is the bathroom?", 
        pron: "웨어 이즈 더 배쓰룸?", 
        tag: "위치",
        alternatives: [
          { text: "Bathroom, please?", pron: "배쓰룸, 플리즈?", desc: "짧게 2단어로 묻기" },
          { text: "Where is toilet?", pron: "웨어 이즈 토일렛?", desc: "직관적인 표현" }
        ]
      },
      { 
        ko: "지하철역이 어디예요?", 
        en: "Where is the subway station?", 
        pron: "웨어 이즈 더 서브웨이 스테이션?", 
        tag: "교통",
        alternatives: [
          { text: "Subway, please?", pron: "서브웨이, 플리즈?", desc: "초간단 길묻기" }
        ]
      },
      { ko: "여기가 어디예요?", en: "Where am I?", pron: "웨어 엠 아이?", tag: "위치" },
      { ko: "이 주소로 가주세요.", en: "Please take me to this address.", pron: "플리즈 테이크 미 투 디스 어드레스.", tag: "택시" },
      { ko: "여기서 내려주세요.", en: "Please drop me here.", pron: "플리즈 드롭 미 히어.", tag: "택시" },
      { ko: "걸어서 얼마나 걸려요?", en: "How long on foot?", pron: "하우 롱 온 풋?", tag: "소요시간" },
      { ko: "공항으로 가주세요.", en: "To the airport, please.", pron: "투 디 에어포트, 플리즈.", tag: "택시" }
    ]
  },
  {
    id: "hotel",
    name: "🏨 호텔 & 숙소",
    items: [
      { ko: "체크인 하고 싶어요.", en: "I'd like to check in.", pron: "아이드 라이크 투 체크 인.", tag: "체크인" },
      { ko: "제 짐을 맡길 수 있나요?", en: "Can I leave my bags here?", pron: "캔 아이 리브 마이 백스 히어?", tag: "짐보관" },
      { ko: "와이파이 비밀번호가 뭐예요?", en: "What is the Wi-Fi password?", pron: "왓 이즈 더 와이파이 패스워드?", tag: "인터넷" },
      { ko: "수건 더 주실 수 있나요?", en: "More towels, please.", pron: "모어 타월스, 플리즈.", tag: "요청" },
      { ko: "체크아웃 할게요.", en: "I'd like to check out.", pron: "아이드 라이크 투 체크 아웃.", tag: "체크아웃" },
      { ko: "방 키를 잃어버렸어요.", en: "I lost my room key.", pron: "아이 로스트 마이 룸 키.", tag: "문제" }
    ]
  },
  {
    id: "emergency",
    name: "🚨 긴급 & 도움 요청",
    items: [
      { ko: "도와주세요!", en: "Help me, please!", pron: "헬프 미, 플리즈!", tag: "긴급" },
      { ko: "영어를 잘 못해요.", en: "I speak a little English.", pron: "아이 스피크 어 리틀 잉글리시.", tag: "소통" },
      { ko: "천천히 말씀해 주시겠어요?", en: "Please speak slowly.", pron: "플리즈 스피크 슬로우-리.", tag: "소통" },
      { ko: "다시 말씀해 주시겠어요?", en: "One more time, please.", pron: "원 모어 타임, 플리즈.", tag: "소통" },
      { ko: "몸이 아파요.", en: "I'm not feeling well.", pron: "아임 낫 필링 웰.", tag: "의료" },
      { ko: "병원/약국이 어디예요?", en: "Where is the pharmacy?", pron: "웨어 이즈 더 파머시?", tag: "의료" },
      { ko: "한국어 할 수 있는 분 계신가요?", en: "Anyone speaks Korean?", pron: "애니원 스피크스 코리안?", tag: "소통" }
    ]
  },
  {
    id: "airport",
    name: "✈️ 공항 & 입국심사",
    items: [
      { ko: "여권 여기 있습니다.", en: "Here is my passport.", pron: "히어 이즈 마이 패스포트.", tag: "여권" },
      { ko: "관광 목적으로 왔어요.", en: "I'm here for sightseeing.", pron: "아임 히어 포 사이트시잉.", tag: "목적" },
      { ko: "비즈니스 때문에 왔어요.", en: "I'm here for business.", pron: "아임 히어 포 비즈니스.", tag: "목적" },
      { ko: "5일 동안 머물 예정입니다.", en: "I will stay for 5 days.", pron: "아이 윌 스테이 포 파이브 데이즈.", tag: "기간" },
      { ko: "호텔에 머물 예정입니다.", en: "I'm staying at a hotel.", pron: "아임 스테이잉 앳 어 호텔.", tag: "숙소" },
      { ko: "제 짐이 안 나왔어요.", en: "My baggage is missing.", pron: "마이 배기지 이즈 미씽.", tag: "문제" },
      { ko: "환승은 어디서 하나요?", en: "Where is the transfer desk?", pron: "웨어 이즈 더 트랜스퍼 데스크?", tag: "환승" },
      { ko: "돌아가는 티켓 여기 있습니다.", en: "Here is my return ticket.", pron: "히어 이즈 마이 리턴 티켓.", tag: "티켓" }
    ]
  }
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = { PRESET_CATEGORIES };
}
