import { Language, RiskLevel } from './types';

export const RISK_LABELS: Record<Language, Record<RiskLevel, string>> = {
  en: {
    LOW: 'Low Risk',
    MODERATE: 'Moderate Risk',
    ELEVATED: 'Elevated Risk',
    HIGH: 'High Risk',
    CRITICAL: 'Critical Risk',
  },
  hi: {
    LOW: 'कम जोखिम (Low)',
    MODERATE: 'मध्यम जोखिम (Moderate)',
    ELEVATED: 'बढ़ा हुआ जोखिम (Elevated)',
    HIGH: 'उच्च जोखिम (High)',
    CRITICAL: 'गंभीर जोखिम (Critical)',
  },
  mr: {
    LOW: 'कमी धोका (Low)',
    MODERATE: 'मध्यम धोका (Moderate)',
    ELEVATED: 'वाढीव धोका (Elevated)',
    HIGH: 'जास्त धोका (High)',
    CRITICAL: 'गंभीर धोका (Critical)',
  },
};

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    appName: 'MONSOON-SENSE',
    appTagline: 'Hyperlocal Monsoon Intelligence for Smarter Agricultural Decisions',
    heroSubheading: 'Hyperlocal 7–30 day monsoon intelligence for Block and Panchayat-level agricultural decisions.',
    exploreDashboard: 'Explore Dashboard',
    viewRiskMap: 'View Risk Map',
    farmerDashboard: 'Farmer Dashboard',
    extensionOfficerDashboard: 'Agricultural Extension Officer Dashboard',
    systemAdmin: 'System Administration',
    roleFarmer: 'Farmer',
    roleOfficer: 'Extension Officer',
    roleAdmin: 'Administrator',
    
    // Navigation
    navDashboard: 'Dashboard',
    navRiskMap: 'Risk Map',
    navForecast: '7–30D Forecast',
    navClimateSignals: 'Climate Signals',
    navAdvisories: 'Crop Advisories',
    navHistory: 'Historical Analytics',
    navAlerts: 'Alert Center',
    navHowItWorks: 'How It Works',
    navAbout: 'About',
    navDataStatus: 'Data Status',
    navSettings: 'Settings',
    navLogin: 'Sign In',
    navSignup: 'Register',
    
    // Selectors
    state: 'State',
    district: 'District',
    block: 'Block',
    panchayat: 'Panchayat / Village',
    selectLocation: 'Select Location',
    forecastHorizon: 'Forecast Horizon',
    selectCrop: 'Select Crop',
    cropStage: 'Crop Stage',
    
    // Metrics
    onsetProbability: 'Monsoon Onset Probability',
    breakProbability: 'Break-Monsoon Probability',
    heavyRainProbability: 'Heavy Rainfall Probability',
    revivalProbability: 'Monsoon Revival Probability',
    forecastConfidence: 'Forecast Confidence',
    expectedRainfall: 'Expected Rainfall',
    normalRainfall: 'Historical Normal',
    rainfallAnomaly: 'Rainfall Anomaly',
    rainyDays: 'Rainy Days Expected',
    dryDays: 'Consecutive Dry Days',
    
    // Explanations & Contributing Factors
    whyThisPrediction: 'Contributing Factors & Model Explainability',
    primaryDrivers: 'Primary Scientific Drivers',
    shapContribution: 'Attribution Weight',
    
    // Advisories
    recommendedAction: 'Recommended Action',
    scientificReason: 'Agronomic Rationale',
    timeWindow: 'Advisory Window',
    ruleReference: 'Reference Advisory Rule',
    noActiveAdvisories: 'No active agricultural advisories for the selected crop and location.',
    
    // Alerts
    activeAlerts: 'Active Monsoon Alerts',
    broadcastChannel: 'Dissemination Channels',
    noAlerts: 'No critical alerts active for this jurisdiction.',
    
    // Climate Signals
    ensoStatus: 'ENSO (El Niño–Southern Oscillation)',
    iodStatus: 'IOD (Indian Ocean Dipole)',
    mjoStatus: 'MJO (Madden–Julian Oscillation)',
    monsoonInfluence: 'Monsoon Influence',
    signalTrend: 'Signal Trend',
    observationDate: 'Observed Date',
    dataSource: 'Data Source',
    
    // Empty & Status States
    dataUnavailable: 'Data currently unavailable from meteorological provider.',
    noForecastAvailable: 'No forecast is currently available for this location.',
    climateSignalUnavailable: 'Climate signal data is currently unavailable.',
    historicalDataUnavailable: 'No historical rainfall records are available.',
    mapDataUnavailable: 'Geospatial boundary data unavailable for the selected region.',
    loadingData: 'Retrieving meteorological records...',
    operational: 'Operational',
  },
  hi: {
    appName: 'मानसून-सेंस (MONSOON-SENSE)',
    appTagline: 'सटीक कृषि निर्णयों के लिए हाइपरलोकल मानसून इंटेलिजेंस',
    heroSubheading: 'ब्लॉक और पंचायत स्तर पर 7-30 दिवसीय सटीक मानसूनी पूर्वानुमान और कृषि परामर्श।',
    exploreDashboard: 'डैशबोर्ड देखें',
    viewRiskMap: 'जोखिम मानचित्र',
    farmerDashboard: 'किसान डैशबोर्ड',
    extensionOfficerDashboard: 'कृषि प्रसार अधिकारी डैशबोर्ड',
    systemAdmin: 'सिस्टम प्रशासन',
    roleFarmer: 'किसान',
    roleOfficer: 'प्रसार अधिकारी',
    roleAdmin: 'व्यवस्थापक',
    
    // Navigation
    navDashboard: 'डैशबोर्ड',
    navRiskMap: 'जोखिम मानचित्र',
    navForecast: '7-30 दिन पूर्वानुमान',
    navClimateSignals: 'जलवायु संकेत',
    navAdvisories: 'फसल परामर्श',
    navHistory: 'ऐतिहासिक विश्लेषण',
    navAlerts: 'चेतावनी केंद्र',
    navHowItWorks: 'कार्यप्रणाली',
    navAbout: 'परिचय',
    navDataStatus: 'डेटा स्थिति',
    navSettings: 'सेटिंग्स',
    navLogin: 'लॉग इन',
    navSignup: 'पंजीकरण',
    
    // Selectors
    state: 'राज्य',
    district: 'जिला',
    block: 'ब्लॉक (प्रखंड)',
    panchayat: 'पंचायत / ग्राम',
    selectLocation: 'स्थान चुनें',
    forecastHorizon: 'पूर्वानुमान अवधि',
    selectCrop: 'फसल चुनें',
    cropStage: 'फसल की अवस्था',
    
    // Metrics
    onsetProbability: 'मानसून आगमन की संभावना',
    breakProbability: 'मानसून ब्रेक (सूखा) की संभावना',
    heavyRainProbability: 'भारी वर्षा की संभावना',
    revivalProbability: 'मानसून वापसी/सक्रियता की संभावना',
    forecastConfidence: 'पूर्वानुमान विश्वसनीयता',
    expectedRainfall: 'अपेक्षित वर्षा',
    normalRainfall: 'सामान्य वर्षा',
    rainfallAnomaly: 'वर्षा का विचलन',
    rainyDays: 'वर्षा वाले दिन',
    dryDays: 'लगातार सूखे दिन',
    
    // Explanations
    whyThisPrediction: 'पूर्वानुमान का वैज्ञानिक कारण',
    primaryDrivers: 'प्रमुख उत्तरदायी कारक',
    shapContribution: 'योगदान भार',
    
    // Advisories
    recommendedAction: 'सुझाई गई कृषि कार्रवाई',
    scientificReason: 'वैज्ञानिक कारण',
    timeWindow: 'समय सीमा',
    ruleReference: 'नियम संदर्भ',
    noActiveAdvisories: 'चयनित फसल और स्थान के लिए कोई सक्रिय सलाह नहीं है।',
    
    // Alerts
    activeAlerts: 'सक्रिय मानसूनी चेतावनियाँ',
    broadcastChannel: 'प्रसारण माध्यम',
    noAlerts: 'इस क्षेत्र के लिए वर्तमान में कोई गंभीर चेतावनी नहीं है।',
    
    // Climate Signals
    ensoStatus: 'ईएनएसओ (ENSO - एल नीनो/ला नीना)',
    iodStatus: 'आईओडी (IOD - हिंद महासागर द्विध्रुव)',
    mjoStatus: 'एमजेओ (MJO - मैडेन-जूलियन दोलन)',
    monsoonInfluence: 'मानसून पर प्रभाव',
    signalTrend: 'संकेत प्रवृत्ति',
    observationDate: 'अवलोकन तिथि',
    dataSource: 'डेटा स्रोत',
    
    // Empty & Status States
    dataUnavailable: 'मौसम विज्ञान प्रदाता से डेटा वर्तमान में अनुपलब्ध है।',
    noForecastAvailable: 'इस स्थान के लिए वर्तमान में कोई पूर्वानुमान उपलब्ध नहीं है।',
    climateSignalUnavailable: 'जलवायु संकेत डेटा वर्तमान में अनुपलब्ध है।',
    historicalDataUnavailable: 'कोई ऐतिहासिक वर्षा रिकॉर्ड उपलब्ध नहीं है।',
    mapDataUnavailable: 'चयनित क्षेत्र के लिए भू-स्थानिक सीमा डेटा अनुपलब्ध है।',
    loadingData: 'मौसम विज्ञान रिकॉर्ड लोड हो रहे हैं...',
    operational: 'सक्रिय (Operational)',
  },
  mr: {
    appName: 'मॉन्सून-सेन्स (MONSOON-SENSE)',
    appTagline: 'अचूक कृषी निर्णयांसाठी हायपरलोकल मॉन्सून इंटेलिजन्स',
    heroSubheading: 'तालुका आणि ग्रामपंचायत पातळीवर ७-३० दिवसांचे अचूक मॉन्सून अंदाज व कृषी सल्लागार.',
    exploreDashboard: 'डॅशबोर्ड उघडा',
    viewRiskMap: 'धोका नकाशा',
    farmerDashboard: 'शेतकरी डॅशबोर्ड',
    extensionOfficerDashboard: 'कृषी विस्तार अधिकारी डॅशबोर्ड',
    systemAdmin: 'प्रणाली प्रशासन',
    roleFarmer: 'शेतकरी',
    roleOfficer: 'विस्तार अधिकारी',
    roleAdmin: 'प्रशासक',
    
    // Navigation
    navDashboard: 'डॅशबोर्ड',
    navRiskMap: 'धोका नकाशा',
    navForecast: '७-३० दिवस अंदाज',
    navClimateSignals: 'हवामान संकेत',
    navAdvisories: 'पीक सल्लागार',
    navHistory: 'ऐतिहासिक विश्लेषण',
    navAlerts: 'सतर्कता केंद्र',
    navHowItWorks: 'कसे कार्य करते',
    navAbout: 'माहिती',
    navDataStatus: 'डेटा स्थिती',
    navSettings: 'सेटिंग्ज',
    navLogin: 'साइन इन',
    navSignup: 'नोंदणी',
    
    // Selectors
    state: 'राज्य',
    district: 'जिल्हा',
    block: 'तालुका',
    panchayat: 'ग्रामपंचायत / गाव',
    selectLocation: 'स्थान निवडा',
    forecastHorizon: 'अंदाज कालावधी',
    selectCrop: 'पीक निवडा',
    cropStage: 'पिकाची अवस्था',
    
    // Metrics
    onsetProbability: 'मॉन्सून आगमनाची शक्यता',
    breakProbability: 'मॉन्सून खंड (कोरडा काळ) शक्यता',
    heavyRainProbability: 'मुसळधार पावसाची शक्यता',
    revivalProbability: 'मॉन्सून पुनरुज्जीवन शक्यता',
    forecastConfidence: 'अंदाज विश्वासार्हता',
    expectedRainfall: 'अपेक्षित पाऊस',
    normalRainfall: 'ऐतिहासिक सरासरी',
    rainfallAnomaly: 'पावसातील तफावत',
    rainyDays: 'पावसाचे दिवस',
    dryDays: 'सलग कोरडे दिवस',
    
    // Explanations
    whyThisPrediction: 'अंदाजाचे शास्त्रीय कारण',
    primaryDrivers: 'मुख्य वातावरणीय घटक',
    shapContribution: 'योगदान भार',
    
    // Advisories
    recommendedAction: 'शिफारस केलेली कृती',
    scientificReason: 'शास्त्रीय कारण',
    timeWindow: 'कालावधी',
    ruleReference: 'नियम संदर्भ',
    noActiveAdvisories: 'निवडलेल्या पिकासाठी आणि स्थानासाठी सध्या कोणताही सक्रिय सल्ला उपलब्ध नाही.',
    
    // Alerts
    activeAlerts: 'सक्रिय मॉन्सून सतर्कता सूचना',
    broadcastChannel: 'प्रसारण माध्यमे',
    noAlerts: 'या क्षेत्रासाठी सध्या कोणतीही गंभीर सतर्कता नाही.',
    
    // Climate Signals
    ensoStatus: 'ईएनएसओ (ENSO - एल निनो / ला निना)',
    iodStatus: 'आयओडी (IOD - इंडियन ओशन द्विध्रुव)',
    mjoStatus: 'एमजेओ (MJO - मॅडन-ज्युलियन दोलन)',
    monsoonInfluence: 'मॉन्सूनवरील परिणाम',
    signalTrend: 'संकेत प्रवाह',
    observationDate: 'नोंद तारीख',
    dataSource: 'डेटा स्त्रोत',
    
    // Empty & Status States
    dataUnavailable: 'हवामानशास्त्र विभागाकडून डेटा सध्या उपलब्ध नाही.',
    noForecastAvailable: 'या स्थानासाठी सध्या कोणताही अंदाज उपलब्ध नाही.',
    climateSignalUnavailable: 'हवामान संकेत डेटा सध्या अनुपलब्ध आहे.',
    historicalDataUnavailable: 'कोणतेही ऐतिहासिक पावसाचे रेकॉर्ड उपलब्ध नाहीत.',
    mapDataUnavailable: 'निवडलेल्या भागासाठी भौगोलिक सीमा डेटा अनुपलब्ध आहे.',
    loadingData: 'हवामान रेकॉर्ड लोड होत आहेत...',
    operational: 'सुरू (Operational)',
  },
};
