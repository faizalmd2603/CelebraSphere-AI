export type SupportedLanguage = 'en' | 'ta' | 'hi' | 'ml' | 'kn' | 'te' | 'bn' | 'mr' | 'gu';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🌐' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
];

export interface TranslationDictionary {
  appName: string;
  tagline: string;
  eventPlatform: string;
  
  // Navigation Tabs
  navDashboard: string;
  navBudget: string;
  navTimeline: string;
  navVendors: string;
  navIdeas: string;
  navAiCopilot: string;
  
  // Personas
  personaWedding: string;
  personaBirthday: string;
  personaCommunity: string;
  personaCustom: string;
  
  // Metric Labels
  readiness: string;
  daysToGo: string;
  guests: string;
  budgetCeiling: string;
  spent: string;
  remaining: string;
  contingency: string;
  
  // Agentic & Actions
  autoRun: string;
  applyToPlan: string;
  applied: string;
  undo: string;
  checkWeather: string;
  rainFailover: string;
  rebalanceBudget: string;
  reflowSchedule: string;
  scaleGuests: string;
  automateTasks: string;
  
  // Placeholders & Alerts
  askPlaceholder: string;
  privacyShield: string;
  inspectSnapshot: string;
}

export const TRANSLATIONS: Record<SupportedLanguage, TranslationDictionary> = {
  en: {
    appName: 'CelebraSphere AI',
    tagline: 'Intelligent Celebration & Event Operations Platform',
    eventPlatform: 'Event Operations Platform',
    navDashboard: 'Command Dashboard',
    navBudget: 'Predictive Budget',
    navTimeline: 'Timeline & Disruption',
    navVendors: 'Vendor Pipeline',
    navIdeas: 'Ideas Studio & RSVP',
    navAiCopilot: 'AI Operations Agent',
    personaWedding: '💍 Royal Wedding',
    personaBirthday: '🎂 Milestone Birthday',
    personaCommunity: '🎪 Community Fest',
    personaCustom: '+ Custom Plan',
    readiness: 'Readiness',
    daysToGo: 'days to go',
    guests: 'Guests',
    budgetCeiling: 'Total Budget',
    spent: 'Committed Spend',
    remaining: 'Remaining Buffer',
    contingency: 'Emergency Contingency',
    autoRun: 'Auto-Run: ON',
    applyToPlan: 'Apply to Live Plan',
    applied: 'Applied to Live Plan',
    undo: 'Undo',
    checkWeather: '🌤️ Check Live Weather',
    rainFailover: '🌧️ Rain Backup Failover',
    rebalanceBudget: '💰 Auto-Rebalance Budget',
    reflowSchedule: '⏱️ Reflow +25m Delay',
    scaleGuests: '👥 Scale +25 Guests',
    automateTasks: '📋 Automate Critical Tasks',
    askPlaceholder: 'Ask agent: "Check weather", "Rebalance budget", "Delay +25m"...',
    privacyShield: 'Privacy Shield',
    inspectSnapshot: 'Inspect Context Snapshot'
  },
  ta: {
    appName: 'செலிப்ராஸ்பியர் AI',
    tagline: 'புத்திசாலித்தனமான விழா மற்றும் நிகழ்வு மேலாண்மை தளம்',
    eventPlatform: 'நிகழ்வு மேலாண்மை தளம்',
    navDashboard: 'கட்டளை கட்டுப்பாட்டகம்',
    navBudget: 'கணிப்பு பட்ஜெட்',
    navTimeline: 'காலவரிசை & இடையூறு',
    navVendors: 'விற்பனையாளர் கட்டமைப்பு',
    navIdeas: 'வடிவமைப்பு அரங்கம் & RSVP',
    navAiCopilot: 'AI செயல்பாட்டு முகவர்',
    personaWedding: '💍 அரச திருமண விழா',
    personaBirthday: '🎂 பிறந்தநாள் விழா',
    personaCommunity: '🎪 சமுதாயத் திருவிழா',
    personaCustom: '+ புதிய விழா',
    readiness: 'தயார்நிலை',
    daysToGo: 'நாட்கள் மீதம்',
    guests: 'விருந்தினர்கள்',
    budgetCeiling: 'மொத்த பட்ஜெட்',
    spent: 'செலவிடப்பட்ட தொகை',
    remaining: 'மீதமுள்ள இருப்பு',
    contingency: 'அவசரக்கால இருப்பு',
    autoRun: 'தானியங்கி: இயங்குகிறது',
    applyToPlan: 'திட்டத்தில் செயல்படுத்து',
    applied: 'திட்டத்தில் செயல்படுத்தப்பட்டது',
    undo: 'முந்தைய நிலைக்கு',
    checkWeather: '🌤️ வானிலை சரிபார்',
    rainFailover: '🌧️ மழை பாதுகாப்பு திட்டம்',
    rebalanceBudget: '💰 பட்ஜெட் சமநிலைப்படுத்து',
    reflowSchedule: '⏱️ +25 நிமிடம் தாமத சீரமைப்பு',
    scaleGuests: '👥 +25 விருந்தினர் உயர்வு',
    automateTasks: '📋 பணிகளை தானியங்குபடுத்து',
    askPlaceholder: 'AI முகவரிடம் கேளுங்கள்: "வானிலை சரிபார்", "பட்ஜெட் சீரமை"...',
    privacyShield: 'தனியுரிமை பாதுகாப்பு',
    inspectSnapshot: 'நிகழ்வு சூழலை ஆய்வு செய்'
  },
  hi: {
    appName: 'सेलिब्रॉस्फीयर AI',
    tagline: 'इंटेलिजेंट उत्सव और इवेंट ऑपरेशंस प्लेटफॉर्म',
    eventPlatform: 'इवेंट ऑपरेशंस प्लेटफॉर्म',
    navDashboard: 'कमांड डैशबोर्ड',
    navBudget: 'पूर्वानुमानित बजट',
    navTimeline: 'समयरेखा और व्यवधान',
    navVendors: 'वेंडर पाइपलाइन',
    navIdeas: 'आइडिया स्टूडियो और RSVP',
    navAiCopilot: 'AI ऑपरेशंस एजेंट',
    personaWedding: '💍 शाही विवाह उत्सव',
    personaBirthday: '🎂 जन्मदिन समारोह',
    personaCommunity: '🎪 सामुदायिक महोत्सव',
    personaCustom: '+ कस्टम योजना',
    readiness: 'तैयारी स्कोर',
    daysToGo: 'दिन शेष',
    guests: 'अतिथि',
    budgetCeiling: 'कुल बजट',
    spent: 'वर्तमान खर्च',
    remaining: 'शेष राशि',
    contingency: 'आपातकालीन रिज़र्व',
    autoRun: 'ऑटो-रन: चालू',
    applyToPlan: 'लाइव प्लान पर लागू करें',
    applied: 'योजना में लागू किया गया',
    undo: 'पूर्ववत करें',
    checkWeather: '🌤️ लाइव मौसम जांचें',
    rainFailover: '🌧️ बारिश बैकअप सक्रिय करें',
    rebalanceBudget: '💰 बजट को पुनः संतुलित करें',
    reflowSchedule: '⏱️ +25 मिनट देरी का समाधान',
    scaleGuests: '👥 +25 अतिथि क्षमता बढ़ाएं',
    automateTasks: '📋 महत्वपूर्ण कार्य स्वचालित करें',
    askPlaceholder: 'एजेंट से पूछें: "मौसम जांचें", "बजट संतुलित करें"...',
    privacyShield: 'गोपनीयता शील्ड',
    inspectSnapshot: 'इवेंट संदर्भ स्नैपशॉट देखें'
  },
  ml: {
    appName: 'സെലിബ്രാസ്ഫിയർ AI',
    tagline: 'ഇന്റലിജന്റ് ആഘോഷവും ഇവന്റ് മാനേജ്മെന്റ് പ്ലാറ്റ്ഫോമും',
    eventPlatform: 'ഇവന്റ് മാനേജ്മെന്റ് പ്ലാറ്റ്ഫോം',
    navDashboard: 'കമാൻഡ് ഡാഷ്‌ബോർഡ്',
    navBudget: 'ബജറ്റ് കണക്കുകൂട്ടൽ',
    navTimeline: 'സമയക്രമവും മാറ്റങ്ങളും',
    navVendors: 'വെണ്ടർ നെറ്റ്‌വർക്ക്',
    navIdeas: 'ഐഡിയ സ്റ്റുഡിയോ & RSVP',
    navAiCopilot: 'AI ഓപ്പറേഷൻസ് ഏജന്റ്',
    personaWedding: '💍 രാജകീയ വിവാഹം',
    personaBirthday: '🎂 ജന്മദിനാഘോഷം',
    personaCommunity: '🎪 കമ്മ്യൂണിറ്റി ഫെസ്റ്റ്',
    personaCustom: '+ പുതിയ ഇവന്റ്',
    readiness: 'തയ്യാറെടുപ്പ്',
    daysToGo: 'ദിവസങ്ങൾ ബാക്കി',
    guests: 'അതിഥികൾ',
    budgetCeiling: 'ആകെ ബജറ്റ്',
    spent: 'ചെലവഴിച്ചത്',
    remaining: 'ബാക്കി തുക',
    contingency: 'അടിയന്തര കരുതൽധനം',
    autoRun: 'ഓട്ടോ-റൺ: ഓൺ',
    applyToPlan: 'പ്ലാനിൽ പ്രയോഗിക്കുക',
    applied: 'പ്ലാനിൽ ചേർത്തു',
    undo: 'തിരുത്തുക',
    checkWeather: '🌤️ കാലാവസ്ഥ പരിശോധിക്കുക',
    rainFailover: '🌧️ മഴ പ്ലാൻ നടപ്പിലാക്കുക',
    rebalanceBudget: '💰 ബജറ്റ് ക്രമീകരിക്കുക',
    reflowSchedule: '⏱️ +25 മിനിറ്റ് ഷെഡ്യൂൾ മാറ്റുക',
    scaleGuests: '👥 +25 അതിഥികളെ ചേർക്കുക',
    automateTasks: '📋 പ്രധാന ജോലികൾ ഓട്ടോമേറ്റ് ചെയ്യുക',
    askPlaceholder: 'ചോദിക്കുക: "കാലാവസ്ഥ പരിശോധിക്കുക", "ബജറ്റ് ക്രമീകരിക്കുക"...',
    privacyShield: 'സ്വകാര്യതാ സംരക്ഷണം',
    inspectSnapshot: 'വിവരങ്ങൾ പരിശോധിക്കുക'
  },
  kn: {
    appName: 'ಸೆಲಿಬ್ರಾಸ್ಫಿಯರ್ AI',
    tagline: 'ಬುದ್ಧಿವಂತ ಆಚರಣೆ ಮತ್ತು ಈವೆಂಟ್ ಕಾರ್ಯಾಚರಣೆಗಳ ವೇದಿಕೆ',
    eventPlatform: 'ಈವೆಂಟ್ ಕಾರ್ಯಾಚರಣೆಗಳ ವೇದಿಕೆ',
    navDashboard: 'ಕಮಾಂಡ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    navBudget: 'ಬಜೆಟ್ ಮುನ್ಸೂಚನೆ',
    navTimeline: 'ಸಮಯಾವಧಿ ಮತ್ತು ಬದಲಾವಣೆ',
    navVendors: 'ಮಾರಾಟಗಾರರ ಜಾಲ',
    navIdeas: 'ಐಡಿಯಾ ಸ್ಟುಡಿಯೋ & RSVP',
    navAiCopilot: 'AI ಕಾರ್ಯಾಚರಣೆ ಏಜೆಂಟ್',
    personaWedding: '💍 ರಾಜಮನೆತನದ ವಿವಾಹ',
    personaBirthday: '🎂 ಜನ್ಮದಿನದ ಸಂಭ್ರಮ',
    personaCommunity: '🎪 ಸಾಮುದಾಯಿಕ ಉತ್ಸವ',
    personaCustom: '+ ಕಸ್ಟಮ್ ಯೋಜನೆ',
    readiness: 'ಸಿದ್ಧತಾ ಸ್ಕೋರ್',
    daysToGo: 'ದಿನಗಳು ಬಾಕಿ',
    guests: 'ಅತಿಥಿಗಳು',
    budgetCeiling: 'ಒಟ್ಟು ಬಜೆಟ್',
    spent: 'ಖರ್ಚು ಮಾಡಿದ ಮೊತ್ತ',
    remaining: 'ಉಳಿದಿರುವ ಮೊತ್ತ',
    contingency: 'ತುರ್ತು ನಿಧಿ',
    autoRun: 'ಆಟೋ-ರನ್: ಆನ್',
    applyToPlan: 'ಯೋಜನೆಗೆ ಅನ್ವಯಿಸಿ',
    applied: 'ಯೋಜನೆಗೆ ಅನ್ವಯಿಸಲಾಗಿದೆ',
    undo: 'ಹಿಂದಕ್ಕೆ ಪಡೆಯಿರಿ',
    checkWeather: '🌤️ ಹವಾಮಾನ ಪರೀಕ್ಷಿಸಿ',
    rainFailover: '🌧️ ಮಳೆ ಮುನ್ನೆಚ್ಚರಿಕೆ ಯೋಜನೆ',
    rebalanceBudget: '💰 ಬಜೆಟ್ ಮರುಹೊಂದಿಸಿ',
    reflowSchedule: '⏱️ +25 ನಿಮಿಷ ವಿಳಂಬ ತಿದ್ದುಪಡಿ',
    scaleGuests: '👥 +25 ಅತಿಥಿಗಳನ್ನು ಹೆಚ್ಚಿಸಿ',
    automateTasks: '📋 ಪ್ರಮುಖ ಕಾರ್ಯ ಸ್ವಯಂಚಾಲಿತಗೊಳಿಸಿ',
    askPlaceholder: 'ಕೇಳಿ: "ಹವಾಮಾನ ಪರೀಕ್ಷಿಸಿ", "ಬಜೆಟ್ ಸರಿಹೊಂದಿಸಿ"...',
    privacyShield: 'ಗೌಪ್ಯತೆ ರಕ್ಷಣೆ',
    inspectSnapshot: 'ವಿವರಗಳನ್ನು ವೀಕ್ಷಿಸಿ'
  },
  te: {
    appName: 'సెలెబ్రాస్ఫియర్ AI',
    tagline: 'ఇంటెలిజెంట్ సెలబ్రేషన్ మరియు ఈవెంట్ ఆపరేషన్స్ ప్లాట్‌ఫారమ్',
    eventPlatform: 'ఈవెంట్ ఆపరేషన్స్ ప్లాట్‌ఫారమ్',
    navDashboard: 'కమాండ్ డాష్‌బోర్డ్',
    navBudget: 'బడ్జెట్ అంచనా',
    navTimeline: 'సమయరేఖ & మార్పులు',
    navVendors: 'వెండర్ నెట్‌వర్క్',
    navIdeas: 'ఐడియా స్టూడియో & RSVP',
    navAiCopilot: 'AI ఆపరేషన్స్ ఏజెంట్',
    personaWedding: '💍 రాజ వివాహ మహోత్సవం',
    personaBirthday: '🎂 పుట్టినరోజు వేడుక',
    personaCommunity: '🎪 సామాజిక ఉత్సవం',
    personaCustom: '+ కస్టమ్ ఈవెంట్',
    readiness: 'సంసిద్ధత స్కోర్',
    daysToGo: 'రోజులు మిగిలి ఉన్నాయి',
    guests: 'అతిథులు',
    budgetCeiling: 'మొత్తం బడ్జెట్',
    spent: 'ఖర్చు చేసిన మొత్తం',
    remaining: 'మిగిలిన నిల్వ',
    contingency: 'అత్యవసర నిధి',
    autoRun: 'ఆటో-రన్: ఆన్',
    applyToPlan: 'ప్లాన్‌కు వర్తింపజేయండి',
    applied: 'ప్లాన్‌కు వర్తింపజేయబడింది',
    undo: 'రద్దు చేయండి',
    checkWeather: '🌤️ వాతావరణం పరిశీలించండి',
    rainFailover: '🌧️ వర్షం ప్రత్యామ్నాయ ప్లాన్',
    rebalanceBudget: '💰 బడ్జెట్ రీబ్యాలెన్స్ చేయండి',
    reflowSchedule: '⏱️ +25 నిమిషాల షెడ్యూల్ మార్పు',
    scaleGuests: '👥 +25 అతిథులను పెంచండి',
    automateTasks: '📋 ముఖ్యమైన పనులను ఆటోమేట్ చేయండి',
    askPlaceholder: 'అడగండి: "వాతావరణం ఎలా ఉంది", "బడ్జెట్ సరిచేయి"...',
    privacyShield: 'గోప్యతా రక్షణ',
    inspectSnapshot: 'వివరాలు పరిశీలించండి'
  },
  bn: {
    appName: 'সেলিব্রাস্ফিয়ার AI',
    tagline: 'বুদ্ধিমান উৎসব এবং অনুষ্ঠান পরিচালনা প্ল্যাটফর্ম',
    eventPlatform: 'অনুষ্ঠান পরিচালনা প্ল্যাটফর্ম',
    navDashboard: 'কমান্ড ড্যাশবোর্ড',
    navBudget: 'বাজেট পূর্বাভাস',
    navTimeline: 'সময়সূচী ও পরিবর্তন',
    navVendors: 'ভেন্ডর পাইপলাইন',
    navIdeas: 'আইডিয়া স্টুডিও ও RSVP',
    navAiCopilot: 'AI অপারেশন এজেন্ট',
    personaWedding: '💍 রাজকীয় বিবাহ উৎসব',
    personaBirthday: '🎂 জন্মদিনের অনুষ্ঠান',
    personaCommunity: '🎪 কমিউনিটি উৎসব',
    personaCustom: '+ কাস্টম প্ল্যান',
    readiness: 'প্রস্তুতি স্কোর',
    daysToGo: 'দিন বাকি',
    guests: 'অতিথি',
    budgetCeiling: 'মোট বাজেট',
    spent: 'ব্যয়িত অর্থ',
    remaining: 'অবশিষ্ট অর্থ',
    contingency: 'জরুরী তহবিল',
    autoRun: 'অটো-রান: চালু',
    applyToPlan: 'পরিকল্পনায় প্রয়োগ করুন',
    applied: 'প্রয়োগ করা হয়েছে',
    undo: 'পূর্বাবস্থায় ফেরান',
    checkWeather: '🌤️ আবহাওয়া পরীক্ষা করুন',
    rainFailover: '🌧️ বৃষ্টি ব্যাকআপ সক্রিয় করুন',
    rebalanceBudget: '💰 বাজেট পুনর্ভারসাম্য করুন',
    reflowSchedule: '⏱️ +২৫ মিনিট বিলম্ব সমন্বয়',
    scaleGuests: '👥 +২৫ অতিথি বৃদ্ধি করুন',
    automateTasks: '📋 গুরুত্বপূর্ণ কাজ স্বয়ংক্রিয় করুন',
    askPlaceholder: 'জিজ্ঞাসা করুন: "আবহাওয়া চেক করুন", "বাজেট ঠিক করুন"...',
    privacyShield: 'গোপনীয়তা রক্ষা',
    inspectSnapshot: 'স্ন্যাপশট দেখুন'
  },
  mr: {
    appName: 'सेलिब्रॉस्फीअर AI',
    tagline: 'उत्सव आणि इव्हेंट ऑपरेशन्स प्लॅटफॉर्म',
    eventPlatform: 'इव्हेंट ऑपरेशन्स प्लॅटफॉर्म',
    navDashboard: 'कमांड डॅशबोर्ड',
    navBudget: 'अंदाजपत्रक',
    navTimeline: 'वेळापत्रक आणि बदल',
    navVendors: 'व्हेंडर व्यवस्थापन',
    navIdeas: 'आयडिया स्टुडिओ आणि RSVP',
    navAiCopilot: 'AI ऑपरेशन्स एजंट',
    personaWedding: '💍 शाही विवाह सोहळा',
    personaBirthday: '🎂 वाढदिवस सोहळा',
    personaCommunity: '🎪 समुदाय महोत्सव',
    personaCustom: '+ नवीन योजना',
    readiness: 'तयारी स्कोर',
    daysToGo: 'दिवस शिल्लक',
    guests: 'पाहुणे',
    budgetCeiling: 'एकूण बजेट',
    spent: 'झालेला खर्च',
    remaining: 'शिल्लक रक्कम',
    contingency: 'आपत्कालीन निधी',
    autoRun: 'ऑटो-रन: चालू',
    applyToPlan: 'प्लॅनमध्ये लागू करा',
    applied: 'प्लॅनमध्ये लागू केले',
    undo: 'पूर्ववत करा',
    checkWeather: '🌤️ हवामान तपासा',
    rainFailover: '🌧️ पाऊस बॅकअप प्लॅन',
    rebalanceBudget: '💰 बजेट संतुलित करा',
    reflowSchedule: '⏱️ +२५ मिनिटे उशीर नियोजन',
    scaleGuests: '👥 +२५ पाहुणे वाढवा',
    automateTasks: '📋 महत्त्वाची कामे स्वयंचलित करा',
    askPlaceholder: 'विचारा: "हवामान तपासा", "बजेट संतुलित करा"...',
    privacyShield: 'गोपनीयता संरक्षण',
    inspectSnapshot: 'तपशील पहा'
  },
  gu: {
    appName: 'સેલિબ્રાસ્ફિયર AI',
    tagline: 'ઉત્સવ અને ઇવેન્ટ ઓપરેશન્સ પ્લેટફોર્મ',
    eventPlatform: 'ઇવેન્ટ ઓપરેશન્સ પ્લેટફોર્મ',
    navDashboard: 'કમાન્ડ ડેશબોર્ડ',
    navBudget: 'બજેટ અંદાજ',
    navTimeline: 'સમયરેખા અને ફેરફારો',
    navVendors: 'વેન્ડર મેનેજમેન્ટ',
    navIdeas: 'આઈડિયા સ્ટુડિયો & RSVP',
    navAiCopilot: 'AI ઓપરેશન્સ એજન્ટ',
    personaWedding: '💍 શાહી લગ્ન મહોત્સવ',
    personaBirthday: '🎂 જન્મદિવસની ઉજવણી',
    personaCommunity: '🎪 સામાજિક ઉત્સવ',
    personaCustom: '+ કસ્ટમ પ્લાન',
    readiness: 'તૈયારી સ્કોર',
    daysToGo: 'દિવસો બાકી',
    guests: 'મહેમાનો',
    budgetCeiling: 'કુલ બજેટ',
    spent: 'થયેલ ખર્ચ',
    remaining: 'બાકી રકમ',
    contingency: 'ઇમરજન્સી ફંડ',
    autoRun: 'ઓટો-રન: ચાલુ',
    applyToPlan: 'પ્લાન પર લાગુ કરો',
    applied: 'પ્લાન પર લાગુ કરાયું',
    undo: 'પાછું વાળો',
    checkWeather: '🌤️ હવામાન તપાસો',
    rainFailover: '🌧️ વરસાદ બેકઅપ પ્લાન',
    rebalanceBudget: '💰 બજેટ પુનઃસંતુલિત કરો',
    reflowSchedule: '⏱️ +૨૫ મિનિટ વિલંબ ગોઠવો',
    scaleGuests: '👥 +૨૫ મહેમાનો વધારો',
    automateTasks: '📋 મહત્વપૂર્ણ કાર્યો ઓટોમેટ કરો',
    askPlaceholder: 'પૂછો: "હવામાન તપાસો", "બજેટ સંતુલિત કરો"...',
    privacyShield: 'ગોપનીયતા સુરક્ષા',
    inspectSnapshot: 'વિગતો જુઓ'
  }
};

export function getTranslation(lang: SupportedLanguage = 'en'): TranslationDictionary {
  return TRANSLATIONS[lang] || TRANSLATIONS.en;
}
