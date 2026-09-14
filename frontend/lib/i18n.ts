export type Language = 'en' | 'hi' | 'mr';

export interface Translations {
  appName: string;
  tagline: string;
  nav: {
    home: string;
    howItWorks: string;
    features: string;
    about: string;
    login: string;
    register: string;
    farmerPortal: string;
    adminPortal: string;
    assistedBooking: string;
  };
  hero: {
    headline: string;
    subheading: string;
    registerCta: string;
    findCentreCta: string;
    trackTokenCta: string;
  };
  features: {
    noWaitTitle: string;
    noWaitDesc: string;
    dynamicSlotsTitle: string;
    dynamicSlotsDesc: string;
    smartMatchingTitle: string;
    smartMatchingDesc: string;
    digitalTwinTitle: string;
    digitalTwinDesc: string;
    fairnessTitle: string;
    fairnessDesc: string;
  };
  farmer: {
    welcome: string;
    token: string;
    farmersAhead: string;
    estimatedWait: string;
    recommendedArrival: string;
    statusOnTrack: string;
    noNeedToWait: string;
  };
}

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    appName: 'MandiSetu',
    tagline: 'Smart Procurement. Zero Waiting.',
    nav: {
      home: 'Home',
      howItWorks: 'How It Works',
      features: 'Features',
      about: 'About',
      login: 'Login',
      register: 'Register as Farmer',
      farmerPortal: 'Farmer Portal',
      adminPortal: 'Admin Dashboard',
      assistedBooking: 'Assisted Booking (CSC)',
    },
    hero: {
      headline: 'Smart Procurement. Zero Waiting.',
      subheading:
        'Connect farmers with procurement centres, manage digital tokens, and reach the mandi at the exact right time — eliminating unnecessary waiting lines.',
      registerCta: 'Register as Farmer',
      findCentreCta: 'Find Procurement Centre',
      trackTokenCta: 'Track Live Queue',
    },
    features: {
      noWaitTitle: 'Smart No-Wait Arrival',
      noWaitDesc: 'Farmers stay home until their slot approaches. Turn alerts inform you exactly when to depart.',
      dynamicSlotsTitle: 'Dynamic Slot Adjustment',
      dynamicSlotsDesc: 'Real-time bottleneck detection automatically shifts or reallocates slots when centres slow down.',
      smartMatchingTitle: 'Intelligent Centre Matching',
      smartMatchingDesc: 'Multi-factor algorithm matches you with the fastest mandi considering queues, distance, and speed.',
      digitalTwinTitle: 'Digital Twin of Mandis',
      digitalTwinDesc: 'Virtual floorplan monitors physical choke-points from gate to weighing bridge and loading bays.',
      fairnessTitle: 'Queue Fairness Engine',
      fairnessDesc: 'Transparent priority rules protect farmers against mandi-caused delays and equipment slowdowns.',
    },
    farmer: {
      welcome: 'Namaste, Farmer 👋',
      token: 'Token',
      farmersAhead: 'Farmers ahead',
      estimatedWait: 'Estimated waiting time',
      recommendedArrival: 'Recommended arrival',
      statusOnTrack: 'On Track',
      noNeedToWait: "You don't need to wait at the centre. Relax at home until your alert arrives.",
    },
  },
  hi: {
    appName: 'मंडीसेतु',
    tagline: 'स्मार्ट उपार्जन। शून्य प्रतीक्षा।',
    nav: {
      home: 'मुख्य पृष्ठ',
      howItWorks: 'यह कैसे काम करता है',
      features: 'विशेषताएं',
      about: 'हमारे बारे में',
      login: 'लॉग इन',
      register: 'किसान पंजीकरण',
      farmerPortal: 'किसान पोर्टल',
      adminPortal: 'प्रशासन डैशबोर्ड',
      assistedBooking: 'सहायता प्राप्त बुकिंग (CSC)',
    },
    hero: {
      headline: 'स्मार्ट उपार्जन। शून्य प्रतीक्षा।',
      subheading:
        'किसानों को उपार्जन केंद्रों से जोड़ें, डिजिटल टोकन प्रबंधित करें और सही समय पर मंडी पहुंचें — बिना किसी लंबी कतार के।',
      registerCta: 'किसान पंजीकरण करें',
      findCentreCta: 'उपार्जन केंद्र खोजें',
      trackTokenCta: 'लाइव कतार देखें',
    },
    features: {
      noWaitTitle: 'स्मार्ट नो-वेट अराइवल',
      noWaitDesc: 'किसान अपने घर पर रहें। टोकन की बारी आने से पहले सटीक समय पर सूचना प्राप्त करें।',
      dynamicSlotsTitle: 'डायनामिक स्लॉट समायोजन',
      dynamicSlotsDesc: 'मंडी में धीमा काम होने पर सिस्टम स्वचालित रूप से स्लॉट को समायोजित करता है।',
      smartMatchingTitle: 'स्मार्ट केंद्र चयन',
      smartMatchingDesc: 'दूरी, कतार और गति के आधार पर सबसे तेज उपार्जन केंद्र की सिफारिश करता है।',
      digitalTwinTitle: 'मंडी का डिजिटल ट्विन',
      digitalTwinDesc: 'गेट से लेकर तौल कांटे तक हर चरण का सजीव आभासी दृश्य और रुकावट की पहचान।',
      fairnessTitle: 'पारदर्शी निष्पक्षता प्रणाली',
      fairnessDesc: 'मंडी की देरी के कारण किसानों के टोकन को विशेष सुरक्षा और निष्पक्ष प्राथमिकता मिलती है।',
    },
    farmer: {
      welcome: 'नमस्ते, किसान भाई 👋',
      token: 'टोकन',
      farmersAhead: 'आपसे आगे किसान',
      estimatedWait: 'अनुमानित प्रतीक्षा समय',
      recommendedArrival: 'पहुंचने का सही समय',
      statusOnTrack: 'सही समय पर',
      noNeedToWait: 'आपको केंद्र पर जाकर बैठने की आवश्यकता नहीं है। समय होने पर ही निकलें।',
    },
  },
  mr: {
    appName: 'मंडीसेतू',
    tagline: 'स्मार्ट खरेदी. शून्य प्रतीक्षा.',
    nav: {
      home: 'मुख्य पृष्ठ',
      howItWorks: 'कसे कार्य करते',
      features: 'वैशिष्ट्ये',
      about: 'माहिती',
      login: 'लॉगिन',
      register: 'शेतकरी नोंदणी',
      farmerPortal: 'शेतकरी पोर्टल',
      adminPortal: 'प्रशासन डॅशबोर्ड',
      assistedBooking: 'मदत केंद्र बुकिंग (CSC)',
    },
    hero: {
      headline: 'स्मार्ट खरेदी. शून्य प्रतीक्षा.',
      subheading:
        'शेतकऱ्यांना खरेदी केंद्रांशी जोडा, डिजिटल टोकन व्यवस्थापित करा आणि वेळेवर बाजारात पोहोचा — तासनतास थांबण्याची गरज नाही.',
      registerCta: 'शेतकरी नोंदणी करा',
      findCentreCta: 'खरेदी केंद्र शोधा',
      trackTokenCta: 'थेट रांग पहा',
    },
    features: {
      noWaitTitle: 'स्मार्ट नो-वेट आगमन',
      noWaitDesc: 'शेतकऱ्यांना केंद्रावर तासनतास थांबावे लागणार नाही. नंबर येण्यापूर्वी थेट फोनवर संदेश मिळेल.',
      dynamicSlotsTitle: 'डायनॅमिक स्लॉट व्यवस्थापन',
      dynamicSlotsDesc: 'खरेदी केंद्र संथ असल्यास स्लॉट आपोआप पुन्हा वेळेवर नियोजित केले जातात.',
      smartMatchingTitle: 'स्मार्ट केंद्र निवड',
      smartMatchingDesc: 'कमी गर्दी आणि वेगवान प्रक्रिया असणारे सर्वोत्तम केंद्र आपोआप सुचवले जाते.',
      digitalTwinTitle: 'बाजाराचा डिजिटल ट्विन',
      digitalTwinDesc: 'प्रवेशद्वारापासून ते वजन काट्यापर्यंत संपूर्ण प्रक्रियेचे थेट डिजिटल दृश्य.',
      fairnessTitle: 'पारदर्शक रांग न्याय प्रणाली',
      fairnessDesc: 'केंद्राच्या तांत्रिक अडचणींमुळे शेतकऱ्याचे नुकसान होणार नाही याची हमी.',
    },
    farmer: {
      welcome: 'नमस्कार, शेतकरी मित्र 👋',
      token: 'टोकन',
      farmersAhead: 'पुढील शेतकरी',
      estimatedWait: 'अंदाजे वेळ',
      recommendedArrival: 'पोहोचण्याची वेळ',
      statusOnTrack: 'सुरळीत सुरू',
      noNeedToWait: 'केंद्रावर जाऊन बसण्याची गरज नाही. संदेश आल्यावरच घराबाहेर पडा.',
    },
  },
};
