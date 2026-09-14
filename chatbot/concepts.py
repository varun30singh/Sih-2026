# chatbot/concepts.py
"""
ProcureAI Conceptual Knowledge Base & Calculation Explainer
SIH26032 - Multilingual Procurement Assistant

Provides natural language definitions, calculations, and formula explanations
for basic and advanced procurement terms across:
  - English
  - Hindi (Devanagari script)
  - Hinglish (Roman script)
  - Marathi (Devanagari script)
  - Marathi-English (Roman script)
"""

import re
from typing import Optional, Dict, Any, Tuple


# ============================================================
# CONCEPTUAL DEFINITIONS DICTIONARY
# ============================================================

CONCEPT_DEFINITIONS: Dict[str, Dict[str, str]] = {
    "procurement": {
        "english": (
            "Procurement is the process of purchasing goods, raw materials, or services that an organization needs from suppliers. "
            "It usually includes identifying requirements, selecting suppliers, negotiating prices, placing purchase orders, tracking deliveries, and evaluating supplier performance."
        ),
        "hindi": (
            "प्रोक्योरमेंट (खरीद प्रक्रिया) का अर्थ है किसी संगठन के लिए आवश्यक वस्तुओं, कच्चे माल या सेवाओं की खरीद की प्रक्रिया। "
            "इसमें आवश्यकताओं की पहचान करना, सप्लायर्स का चयन करना, कीमत पर बातचीत, ऑर्डर देना, डिलीवरी को ट्रैक करना और सप्लायर के प्रदर्शन का मूल्यांकन करना शामिल होता है।"
        ),
        "hinglish": (
            "Procurement ka matlab kisi organization ke liye zaroori goods, materials ya services suppliers se khareedne ka process hai. "
            "Isme requirements identify karna, suppliers select karna, pricing negotiate karna, purchase orders place karna, delivery track karna aur supplier performance evaluate karna shamil hai."
        ),
        "marathi": (
            "प्रोक्योरमेंट (खरेदी प्रक्रिया) म्हणजे संस्थेला आवश्यक असणाऱ्या वस्तू, कच्चा माल किंवा सेवा बाह्य पुरवठादारांकडून (suppliers) खरेदी करण्याची प्रक्रिया होय. "
            "यामध्ये आवश्यकता ओळखणे, सप्लायर निवडणे, वाटाघाटी, ऑर्डर देणे, डिलिव्हरी ट्रॅक करणे आणि सप्लायरच्या कामगिरीचे मूल्यांकन करणे समाविष्ट असते."
        ),
        "marathi_english": (
            "Procurement mhanje organization sathi lagnare goods, materials kiwa services external suppliers kadun kharedi karnyachi process aahe. "
            "Yatch requirements olakhne, supplier select karne, order place karne, delivery track karne aani performance evaluate karne samavisht aahe."
        ),
    },

    "procurement_scheduling": {
        "english": (
            "Procurement Scheduling is the systematic planning, timing, and sequencing of purchase orders, supplier lead times, and expected delivery dates. "
            "It ensures raw materials arrive exactly when needed to prevent manufacturing bottlenecks while avoiding excessive inventory holding costs."
        ),
        "hindi": (
            "प्रोक्योरमेंट शेड्यूलिंग (खरीद शेड्यूलिंग) खरीद आदेशों, सप्लायर लीड टाइम और डिलीवरी की तारीखों की योजना और समय-निर्धारण की प्रक्रिया है। "
            "यह सुनिश्चित करता है कि सामग्री समय पर पहुंचे ताकि उत्पादन में कोई रुकावट न आए और अनावश्यक भंडारण लागत भी न बढ़े।"
        ),
        "hinglish": (
            "Procurement Scheduling ka matlab purchase orders, supplier lead times aur delivery dates ko plan aur time karna hai. "
            "Iska main aim ye ensure karna hota hai ki materials timely deliver ho sakein bina production delay ya extra holding cost ke."
        ),
        "marathi": (
            "प्रोक्योरमेंट शेड्यूलिंग (खरेदी शेड्यूलिंग) म्हणजे खरेदी ऑर्डर्स, सप्लायरचा लीड टाइम आणि अपेक्षित डिलिव्हरी तारखांचे योग्य नियोजन आणि वेळ निश्चित करणे. "
            "यामुळे उत्पादन वेळेवर सुरू राहते, विलंबाचा धोका टळतो आणि अतिरिक्त साठवणूक खर्च वाचतो."
        ),
        "marathi_english": (
            "Procurement Scheduling mhanje purchase orders, lead time aani delivery dates che proper time table tayar karne. "
            "Yane production delay hot nahi aani inventory storage cost pan kami rahto."
        ),
    },

    "procurement_score": {
        "english": (
            "Procurement Score is an overall indicator used to evaluate procurement efficiency, delivery reliability, cost control, and supplier risk. "
            "In ProcureAI, this is primarily measured through the Procurement Health Score (0–100), combining delivery delay rates (35%), order completion (20%), risk exposure (30%), and delivery urgency (15%)."
        ),
        "hindi": (
            "प्रोक्योरमेंट स्कोर खरीद प्रक्रिया के प्रदर्शन को मापने वाला एक समग्र संकेतक है। इसमें सप्लायर का प्रदर्शन, डिलीवरी में देरी, लागत और जोखिम जैसे कारकों को शामिल किया जा सकता है। "
            "ProcureAI में, इसे मुख्य रूप से 'प्रोक्योरमेंट हेल्थ स्कोर' (0–100) के रूप में मापा जाता है, जिसमें देरी दर (35%), पूर्णता (20%), जोखिम (30%) और तात्कालिकता (15%) शामिल हैं।"
        ),
        "hinglish": (
            "Procurement Score ek overall metric hai jo procurement performance ko measure karta hai. Isme supplier performance, delivery delays, cost aur risk jaise factors consider kiye ja sakte hain. "
            "ProcureAI mein ise mainly Procurement Health Score (0-100) ke form mein track kiya jata hai jo delay rate, completion rate aur risk penalties par based hota hai."
        ),
        "marathi": (
            "प्रोक्योरमेंट स्कोअर हा खरेदी प्रक्रियेची कार्यक्षमता मोजण्यासाठी वापरला जाणारा एक महत्त्वाचा मापदंड आहे. यामध्ये सप्लायरची कामगिरी, डिलिव्हरीमधील विलंब, खर्च आणि जोखीम यांसारख्या घटकांचा विचार केला जातो. "
            "ProcureAI मध्ये हा प्रामुख्याने 'प्रोक्योरमेंट हेल्थ स्कोअर' (0–100) द्वारे दर्शविला जातो, ज्यामध्ये विलंब दर (35%), पूर्णता (20%), जोखीम (30%) आणि तातडी (15%) विचारात घेतली जाते."
        ),
        "marathi_english": (
            "Procurement Score ha procurement efficiency measure karnara overall metric aahe. Yatch supplier performance, delays, cost aani risk evaluate hoto. "
            "ProcureAI madhye ha mainly Procurement Health Score (0-100) dware dakhvla jato."
        ),
    },

    "health_score": {
        "english": (
            "Health Score in ProcureAI is an automated 0–100 composite index measuring the overall operational stability of procurement operations. "
            "Scores ≥80 indicate Healthy, 60–79 At Risk, 40–59 High Risk, and <40 Critical. It penalizes delivery delays, unfulfilled orders, and critical supply bottlenecks."
        ),
        "hindi": (
            "हेल्थ स्कोर (Health Score) ProcureAI में 0 से 100 तक का एक समग्र संकेतक है, जो खरीद संचालन की स्थिति को दर्शाता है। "
            "80 या उससे अधिक स्कोर स्वस्थ (Healthy), 60–79 जोखिम में (At Risk), 40–59 उच्च जोखिम (High Risk), और 40 से कम गंभीर (Critical) स्थिति दर्शाता है।"
        ),
        "hinglish": (
            "Health Score ProcureAI mein 0 se 100 ke beech ka ek health index hai jo procurement process ki stability batata hai. "
            "80+ score Healthy hota hai, 60-79 At Risk, 40-59 High Risk, aur 40 se kam Critical hota hai."
        ),
        "marathi": (
            "हेल्थ स्कोअर (Health Score) हा ProcureAI मधील 0 ते 100 दरम्यानचा एक निर्देशांक आहे, जो खरेदी प्रक्रियेचे आरोग्य दर्शवितो. "
            "80 किंवा अधिक सुरक्षित (Healthy), 60–79 धोक्यात (At Risk), 40–59 उच्च जोखीम (High Risk), आणि 40 पेक्षा कमी गंभीर (Critical) मानले जाते."
        ),
        "marathi_english": (
            "Health Score ha ProcureAI madhye 0 te 100 cha composite index aahe jo procurement operations chi stability dakhavto. "
            "80+ score Healthy aahe, 60-79 At Risk, 40-59 High Risk, aani 40 pekshe kami Critical aahe."
        ),
    },

    "supplier": {
        "english": (
            "A Supplier (or vendor) is an external business entity that provides raw materials, parts, equipment, or services needed by an organization. "
            "In ProcureAI, suppliers like SKF India, Tata Steel, and Bosch India are tracked for on-time delivery, cost, and reliability."
        ),
        "hindi": (
            "सप्लायर (विक्रेता / वेंडर) वह बाहरी कंपनी या संस्था है जो किसी संगठन को आवश्यक कच्चा माल, पुर्जे या सेवाएं उपलब्ध कराती है। "
            "ProcureAI में सप्लायर्स के समय पर डिलीवरी, लागत और विश्वसनीयता का निरंतर विश्लेषण किया जाता है।"
        ),
        "hinglish": (
            "Supplier ek external entity ya company hoti hai jo organization ko raw materials, parts ya services supply karti hai. "
            "ProcureAI mein suppliers ki delivery reliability, orders aur costs track ki jaati hain."
        ),
        "marathi": (
            "सप्लायर (पुरवठादार) म्हणजे अशी बाह्य कंपनी किंवा संस्था जी संस्थेला आवश्यक कच्चा माल, साहित्य किंवा सेवा पुरवते. "
            "ProcureAI मध्ये पुरवठादारांची वेळेवर डिलिव्हरी, खर्च आणि विश्वासार्हता तपासली जाते."
        ),
        "marathi_english": (
            "Supplier mhanje aashi external company ji organization la raw materials kiwa services supply karte. "
            "ProcureAI madhye suppliers che delivery performance aani cost track kele jaatat."
        ),
    },

    "supplier_performance": {
        "english": (
            "Supplier Performance measures how reliably and efficiently a vendor fulfills purchase orders. "
            "ProcureAI rates suppliers out of 100 based on their delivery delay rate and order completion history: ≥80 Excellent, ≥60 Good, ≥40 Needs Attention, <40 Poor."
        ),
        "hindi": (
            "सप्लायर का प्रदर्शन (Supplier Performance) यह दर्शाता है कि कोई विक्रेता अपने खरीद आदेशों को कितनी कुशलता और समय पर पूरा करता है। "
            "ProcureAI में सप्लायर को 100 में से अंक दिए जाते हैं: 80+ उत्कृष्ट (Excellent), 60+ अच्छा (Good), 40+ सुधार की आवश्यकता (Needs Attention), और 40 से कम खराब (Poor)।"
        ),
        "hinglish": (
            "Supplier Performance ye batata hai ki koi vendor kitne time par aur kitne accurately orders deliver karta hai. "
            "ProcureAI har supplier ko 100 me se score deta hai: 80+ Excellent, 60+ Good, 40+ Needs Attention, aur 40 se kam Poor."
        ),
        "marathi": (
            "सप्लायर कामगिरी (Supplier Performance) ही पुरवठादार आपल्या खरेदी ऑर्डर्स किती अचूक आणि वेळेवर पूर्ण करतो हे मोजते. "
            "ProcureAI मध्ये 100 पैकी गुण दिले जातात: 80+ उत्कृष्ट, 60+ चांगले, 40+ सुधारणेची गरज, आणि 40 पेक्षा कमी खराब."
        ),
        "marathi_english": (
            "Supplier Performance dakhavte ki supplier kitpat accurate aani timely orders deliver karto. "
            "ProcureAI madhye 100 paiki score dila jato: 80+ Excellent, 60+ Good, 40+ Needs Attention, aani 40 peksha kami Poor."
        ),
    },

    "delay": {
        "english": (
            "A Delay occurs when a purchase order is not delivered on or before the committed expected delivery date. "
            "ProcureAI tracks delay days and alerts procurement managers to minimize production interruptions."
        ),
        "hindi": (
            "देरी (Delay) तब होती है जब कोई खरीद आदेश तय की गई अपेक्षित डिलीवरी तिथि तक नहीं पहुंचता है। "
            "ProcureAI प्रत्येक विलंबित ऑर्डर के देरी के दिनों (delay days) को ट्रैक करता है ताकि उत्पादन पर असर न पड़े।"
        ),
        "hinglish": (
            "Delay tab hota hai jab koi purchase order committed delivery date tak deliver nahi hota. "
            "ProcureAI delay days ko track karta hai taaki production operations affect na hon."
        ),
        "marathi": (
            "विलंब (Delay) म्हणजे जेव्हा एखादी खरेदी ऑर्डर ठरलेल्या अपेक्षित डिलिव्हरी तारखेपर्यंत पोहोचत नाही. "
            "ProcureAI विलंबाचे दिवस ट्रॅक करते जेणेकरून उत्पादनावर परिणाम होऊ नये."
        ),
        "marathi_english": (
            "Delay mhanje purchase order expected date chya nantar deliver hone. "
            "ProcureAI delay days track karun operational risks alert karte."
        ),
    },

    "delay_rate": {
        "english": (
            "Delay Rate is the percentage of total purchase orders that experienced delivery delays.\n\n"
            "Formula:\n"
            "Delay Rate = (Delayed Orders ÷ Total Orders) × 100\n\n"
            "For example, if 2 out of 10 orders were delayed, the delay rate is 20%."
        ),
        "hindi": (
            "देरी की दर (Delay Rate) कुल ऑर्डर्स में से उन ऑर्डर्स का प्रतिशत है जो समय पर डिलीवर नहीं हुए।\n\n"
            "सूत्र (Formula):\n"
            "देरी दर = (विलंबित ऑर्डर ÷ कुल ऑर्डर) × 100\n\n"
            "उदाहरण के लिए, यदि 10 में से 2 ऑर्डर विलंबित हैं, तो देरी दर 20% होगी।"
        ),
        "hinglish": (
            "Delay Rate ka matlab delayed orders ka total orders me percentage hota hai.\n\n"
            "Formula:\n"
            "Delay Rate = (Delayed Orders ÷ Total Orders) × 100\n\n"
            "Example: Agar 10 me se 2 orders late hue, to delay rate 20% hoga."
        ),
        "marathi": (
            "विलंब दर (Delay Rate) म्हणजे एकूण ऑर्डर्सपैकी वेळेवर न पोहोचलेल्या ऑर्डर्सची टक्केवारी होय.\n\n"
            "सूत्र (Formula):\n"
            "विलंब दर = (विलंबित ऑर्डर्स ÷ एकूण ऑर्डर्स) × 100\n\n"
            "उदाहरणार्थ, 10 पैकी 2 ऑर्डर्स उशिरा आल्यास विलंब दर 20% असेल."
        ),
        "marathi_english": (
            "Delay Rate mhanje total orders paiki kiti orders late jhalya yachi percentage.\n\n"
            "Formula:\n"
            "Delay Rate = (Delayed Orders ÷ Total Orders) × 100\n\n"
            "Example: 10 paiki 2 orders late astil tar delay rate 20% hoto."
        ),
    },

    "delayed_order": {
        "english": (
            "A Delayed Order is an active purchase order that has passed its committed expected delivery date without fulfillment, "
            "or an order that was marked late upon arrival."
        ),
        "hindi": (
            "विलंबित ऑर्डर (Delayed Order) वह खरीद आदेश है जिसकी निर्धारित डिलीवरी तिथि बीत चुकी है लेकिन सामग्री अभी तक प्राप्त नहीं हुई है।"
        ),
        "hinglish": (
            "Delayed Order wo purchase order hota hai jiski committed delivery date nikal chuki hai lekin material abhi tak nahi mila."
        ),
        "marathi": (
            "विलंबित ऑर्डर (Delayed Order) म्हणजे अशी खरेदी ऑर्डर ज्याची अपेक्षित डिलिव्हरी तारीख उलटून गेली आहे तरीही माल मिळालेला नाही."
        ),
        "marathi_english": (
            "Delayed Order mhanje expected delivery date cross jhali aahe pan ajun material deliver jhale nahi."
        ),
    },

    "on_time_order": {
        "english": (
            "An On-Time Order is a procurement order that was delivered on or before the committed deadline without delay."
        ),
        "hindi": (
            "समय पर दिया गया ऑर्डर (On-Time Order) वह खरीद आदेश है जो बिना किसी देरी के अपनी निर्धारित तिथि पर या उससे पहले प्राप्त हो गया।"
        ),
        "hinglish": (
            "On-Time Order wo order hai jo committed date par ya usse pehle successfully deliver ho gaya bina kisi delay ke."
        ),
        "marathi": (
            "वेळेवर डिलिव्हरी (On-Time Order) म्हणजे अशी ऑर्डर जी कोणत्याही विलंबाशिवाय ठरलेल्या तारखेला किंवा त्यापूर्वी पूर्ण झाली."
        ),
        "marathi_english": (
            "On-Time Order mhanje committed deadline chya aadhi kiwa proper date la deliver jhaleli order."
        ),
    },

    "procurement_value": {
        "english": (
            "Procurement Value (or Total Spend) is the total monetary expenditure allocated or paid across all purchase orders.\n\n"
            "Formula:\n"
            "Procurement Value = Sum of (Order Quantity × Unit Price)"
        ),
        "hindi": (
            "प्रोक्योरमेंट मूल्य (Procurement Value या Total Spend) सभी खरीद आदेशों पर खर्च की गई या आवंटित कुल धनराशि है।\n\n"
            "सूत्र:\n"
            "प्रोक्योरमेंट मूल्य = कुल (ऑर्डर मात्रा × प्रति इकाई मूल्य)"
        ),
        "hinglish": (
            "Procurement Value ka matlab total purchase orders par hone wala kul financial expenditure hota hai.\n\n"
            "Formula:\n"
            "Total Value = Sum of (Quantity × Unit Price)"
        ),
        "marathi": (
            "प्रोक्योरमेंट मूल्य (Procurement Value) म्हणजे सर्व खरेदी ऑर्डर्सवर खर्च झालेली किंवा वाटप केलेली एकूण आर्थिक रक्कम.\n\n"
            "सूत्र:\n"
            "एकूण खरेदी मूल्य = बेरीज (ऑर्डर प्रमाण × प्रति युनिट किंमत)"
        ),
        "marathi_english": (
            "Procurement Value mhanje sagle purchase orders var kiti total financial spend jhala aahe te. Formula: Sum of (Quantity × Price)."
        ),
    },

    "supplier_risk": {
        "english": (
            "Supplier Risk refers to the likelihood and business impact of a supplier failing to deliver required goods on time, at expected quality, or within budget. "
            "In ProcureAI, risk is categorized into Critical, High Risk, Moderate, and Low Risk based on delay duration, critical material priority, and order completion track records."
        ),
        "hindi": (
            "सप्लायर जोखिम (Supplier Risk) से तात्पर्य उस संभावना और नुकसान से है यदि कोई सप्लायर समय पर, सही गुणवत्ता में या तय लागत पर सामान देने में विफल रहता है। "
            "ProcureAI में जोखिम को देरी के दिनों, महत्वपूर्ण सामग्री और सप्लायर के रिकॉर्ड के आधार पर 'गंभीर' (Critical), 'उच्च जोखिम' (High Risk), और 'कम जोखिम' (Low Risk) में बांटा गया है।"
        ),
        "hinglish": (
            "Supplier Risk ka matlab wo threat ya loss hota hai jo supplier ke time par deliver na karne ya default hone se ho sakta hai. "
            "ProcureAI mein risk ko Critical, High Risk, aur Low Risk categories mein classify kiya jata hai."
        ),
        "marathi": (
            "सप्लायर जोखीम (Supplier Risk) म्हणजे पुरवठादाराकडून वेळेवर किंवा योग्य गुणवत्तेत माल न मिळण्याची शक्यता आणि त्यामुळे होणारे नुकसान. "
            "ProcureAI मध्ये जोखीम ही Critical, High Risk, आणि Low Risk अशा स्तरांमध्ये विभागली जाते."
        ),
        "marathi_english": (
            "Supplier Risk mhanje supplier kadun delays kiwa failure hone yacha threat. ProcureAI madhye yaache Critical, High Risk aani Low Risk levels astat."
        ),
    },

    "purchase_order": {
        "english": (
            "A Purchase Order (PO) is an official commercial contract issued by a buyer to a supplier specifying materials, quantities, agreed prices, payment terms, and delivery schedules."
        ),
        "hindi": (
            "खरीद आदेश (Purchase Order / PO) खरीदार द्वारा सप्लायर को जारी किया जाने वाला एक आधिकारिक दस्तावेज है जिसमें सामग्री, मात्रा, तय मूल्य और डिलीवरी की तारीख का विवरण होता है।"
        ),
        "hinglish": (
            "Purchase Order (PO) ek official contract document hota hai jo buyer supplier ko deta hai jisme item, quantity, agreed price aur delivery date likhi hoti hai."
        ),
        "marathi": (
            "खरेदी आदेश (Purchase Order / PO) हा खरेदीदाराने पुरवठादाराला दिलेला अधिकृत दस्तऐवज आहे ज्यामध्ये साहित्य, प्रमाण, किंमत आणि डिलिव्हरी वेळापत्रक नमूद केलेले असते."
        ),
        "marathi_english": (
            "Purchase Order (PO) ha ek official contract asato jo buyer supplier la deto jyat item, quantity, price aani delivery date aste."
        ),
    },

    "recommendation": {
        "english": (
            "ProcureAI Recommendations are data-driven actionable suggestions generated automatically by analyzing supplier performance, delivery delays, and critical order risk. "
            "They help procurement managers reallocate orders to dependable suppliers and expedite overdue critical shipments."
        ),
        "hindi": (
            "ProcureAI के सुझाव (Recommendations) डेटा पर आधारित व्यावहारिक रणनीतियाँ हैं जो सप्लायर के प्रदर्शन, देरी और जोखिम का विश्लेषण करके दी जाती हैं। "
            "इनसे यह निर्णय लेने में मदद मिलती है कि किस सप्लायर को अधिक ऑर्डर दें और किन महत्वपूर्ण ऑर्डर्स को तुरंत गति दें।"
        ),
        "hinglish": (
            "ProcureAI Recommendations automated actionable tips hoti hain jo delays, risks aur supplier performance analyse karke di jaati hain, taaki delay kam ho aur reliable suppliers choose kiye ja sakein."
        ),
        "marathi": (
            "ProcureAI च्या शिफारशी (Recommendations) डेटाच्या आधारे तयार केलेल्या व्यावहारिक सूचना आहेत, ज्यामुळे चांगल्या सप्लायर्सची निवड करणे आणि विलंबावर मात करणे सोपे होते."
        ),
        "marathi_english": (
            "ProcureAI Recommendations he automated suggestions astat je delay analysis aani supplier rating varun banavle jaatat."
        ),
    },

    "lead_time": {
        "english": (
            "Lead Time is the total amount of time that elapses between placing a purchase order with a supplier and the actual receipt and inspection of the goods at your facility."
        ),
        "hindi": (
            "लीड टाइम (Lead Time) किसी सप्लायर को खरीद आदेश देने से लेकर सामान के वास्तव में फैक्ट्री या गोदाम में प्राप्त होने के बीच का कुल समय होता है।"
        ),
        "hinglish": (
            "Lead Time wo total time duration hota hai jo purchase order place karne se lekar material facility par receive hone tak lagta hai."
        ),
        "marathi": (
            "लीड टाइम (Lead Time) म्हणजे पुरवठादाराला ऑर्डर दिल्यापासून माल प्रत्यक्षात गोदामात किंवा कारखान्यात पोहोचेपर्यंतचा एकूण वेळ."
        ),
        "marathi_english": (
            "Lead Time mhanje order place kelyapasun goods receive hoiparyantcha total time."
        ),
    },

    "delivery_performance": {
        "english": (
            "Delivery Performance reflects how consistently a supplier fulfills orders on or before the committed delivery date, in complete quantities and defect-free condition."
        ),
        "hindi": (
            "डिलीवरी प्रदर्शन (Delivery Performance) यह दर्शाता है कि कोई सप्लायर कितनी निरंतरता से तय समय पर और पूरी मात्रा में सामान पहुंचाता है।"
        ),
        "hinglish": (
            "Delivery Performance batata hai ki supplier kitne consistently committed delivery dates follow karta hai bina delays ke."
        ),
        "marathi": (
            "डिलिव्हरी कामगिरी (Delivery Performance) हे पुरवठादार ठरलेल्या तारखेला वेळेवर आणि पूर्ण साहित्याची डिलिव्हरी कशी करतो हे दर्शविते."
        ),
        "marathi_english": (
            "Delivery Performance dakhavto ki supplier committed dates la kiti consistently follow karto."
        ),
    },

    "cost_efficiency": {
        "english": (
            "Cost Efficiency in procurement involves obtaining required materials at the best value without compromising delivery schedules, quality, or increasing disruption risk."
        ),
        "hindi": (
            "लागत दक्षता (Cost Efficiency) का अर्थ है गुणवत्ता या डिलीवरी समय से समझौता किए बिना सामग्री को सबसे किफायती और उचित मूल्य पर खरीदना।"
        ),
        "hinglish": (
            "Cost Efficiency ka matlab best price par zaroori materials procure karna bina delay ya quality risk ke."
        ),
        "marathi": (
            "खर्च कार्यक्षमता (Cost Efficiency) म्हणजे गुणवत्तेशी किंवा वेळेवर डिलिव्हरीशी कोणतीही तडजोड न करता सर्वात योग्य खर्चात खरेदी करणे."
        ),
        "marathi_english": (
            "Cost Efficiency mhanje quality aani delivery la affect na karta best price madhye materials procure karne."
        ),
    },

    "procurement_analytics": {
        "english": (
            "Procurement Analytics uses quantitative data, supplier scorecards, historical delivery patterns, and predictive scheduling to optimize costs, minimize lead times, and eliminate delays."
        ),
        "hindi": (
            "प्रोक्योरमेंट एनालिटिक्स (Procurement Analytics) ऐतिहासिक डिलीवरी डेटा, सप्लायर स्कोरकार्ड और शेड्यूलिंग ट्रेंड्स का विश्लेषण करके खरीद में देरी कम करने और लागत बचाने में मदद करता है।"
        ),
        "hinglish": (
            "Procurement Analytics historical procurement data, supplier performance aur delay metrics ka use karke procurement operations optimize karta hai."
        ),
        "marathi": (
            "प्रोक्योरमेंट ॲनालिटिक्स (Procurement Analytics) डेटाचे विश्लेषण करून पुरवठादारांची कामगिरी तपासणे, विलंब रोखणे आणि खरेदी खर्च कमी करण्यास मदत करते."
        ),
        "marathi_english": (
            "Procurement Analytics mhanje procurement data analyze karun cost optimize karne aani delays kami karne."
        ),
    },

    "how_it_works": {
        "english": (
            "ProcureAI is an intelligent procurement scheduling platform built for SIH26032. "
            "It connects directly to your procurement database, continuously analyzes purchase orders and suppliers, calculates health and performance scores, detects delay risks, and provides actionable recommendations in English, Hindi, and Marathi."
        ),
        "hindi": (
            "ProcureAI एक बुद्धिमान प्रोक्योरमेंट शेड्यूलिंग प्लेटफ़ॉर्म है (SIH26032)। "
            "यह आपके खरीद डेटाबेस से सीधे जुड़ता है, ऑर्डर्स और सप्लायर्स का निरंतर विश्लेषण करता है, हेल्थ और परफॉर्मेंस स्कोर की गणना करता है, देरी और जोखिम की पहचान करता है और हिंदी, अंग्रेजी और मराठी में सुझाव देता है।"
        ),
        "hinglish": (
            "ProcureAI ek smart procurement scheduling assistant hai (SIH26032). "
            "Ye database se connect hoke orders, suppliers, delays, health scores aur financial exposure analyze karta hai aur English, Hindi aur Marathi mein contextual answers deta hai."
        ),
        "marathi": (
            "ProcureAI हे SIH26032 साठी तयार केलेले बुद्धिमान खरेदी शेड्यूलिंग प्लॅटफॉर्म आहे. "
            "हे थेट खरेदी डेटाबेसशी कनेक्ट होऊन ऑर्डर्स, सप्लायर्स, विलंब आणि हेल्थ स्कोअरचे विश्लेषण करते आणि इंग्रजी, मराठी व हिंदीत अचूक मार्गदर्शन करते."
        ),
        "marathi_english": (
            "ProcureAI he smart procurement scheduling platform aahe (SIH26032). "
            "He database connect karun orders, suppliers, delays aani health scores analyze karte aani actionable recommendations dete."
        ),
    },

    "what_can_you_do": {
        "english": (
            "I can help you with:\n"
            "• Analyzing supplier delivery performance and delays\n"
            "• Calculating overall procurement health scores (0–100)\n"
            "• Comparing two suppliers side-by-side (delays, cost, rating)\n"
            "• Identifying critical and high-risk orders\n"
            "• Tracking financial exposure and upcoming shipment schedules\n"
            "• Generating smart procurement recommendations"
        ),
        "hindi": (
            "मैं आपकी इन कार्यों में मदद कर सकता हूँ:\n"
            "• सप्लायर्स के प्रदर्शन और डिलीवरी में देरी का विश्लेषण करना\n"
            "• समग्र प्रोक्योरमेंट हेल्थ स्कोर (0–100) की गणना करना\n"
            "• किन्हीं दो सप्लायर्स की विस्तृत तुलना करना (देरी, खर्च, रेटिंग)\n"
            "• गंभीर और उच्च जोखिम वाले ऑर्डर्स की पहचान करना\n"
            "• कुल वित्तीय खर्च और आगामी डिलीवरी को ट्रैक करना\n"
            "• व्यावहारिक और स्मार्ट सुझाव (Recommendations) देना"
        ),
        "hinglish": (
            "Main ye sab kar sakta hoon:\n"
            "• Supplier delays aur performance analyze karna\n"
            "• Procurement Health Score (0-100) calculate karna\n"
            "• Suppliers ko side-by-side compare karna\n"
            "• Critical aur high-risk orders identify karna\n"
            "• Total costs aur upcoming deliveries track karna\n"
            "• Actionable recommendations provide karna"
        ),
        "marathi": (
            "मी तुम्हाला खालील बाबींमध्ये मदत करू शकतो:\n"
            "• पुरवठादारांची कामगिरी आणि विलंबाचे विश्लेषण करणे\n"
            "• एकूण प्रोक्योरमेंट हेल्थ स्कोअर (0–100) मोजणे\n"
            "• दोन सप्लायर्सची सविस्तर तुलना करणे (विलंब, खर्च, स्कोअर)\n"
            "• गंभीर आणि उच्च जोखीम असलेल्या ऑर्डर्स शोधणे\n"
            "• आगामी डिलिव्हरी आणि एकूण खर्चाचा मागोवा घेणे\n"
            "• खरेदी सुधारणेसाठी उपयुक्त शिफारशी देणे"
        ),
        "marathi_english": (
            "Mi he sagla karu shakto:\n"
            "• Suppliers delays aani performance analyze karne\n"
            "• Procurement Health Score calculate karne\n"
            "• Don suppliers madhye comparison karne\n"
            "• Critical aani high risk orders dakhvane\n"
            "• Spend aani upcoming deliveries track karne\n"
            "• Smart recommendations dene"
        ),
    },
}


# ============================================================
# FORMULA & CALCULATION EXPLANATIONS
# ============================================================

CALCULATION_EXPLANATIONS: Dict[str, Dict[str, str]] = {
    "health_score": {
        "english": (
            "ProcureAI calculates the Procurement Health Score (0–100) using a weighted 4-component formula:\n\n"
            "1. Delay Score (35% Weight):\n"
            "   Delay Score = max(0, 100 - Delay Rate × 1.5)\n\n"
            "2. Completion Score (20% Weight):\n"
            "   Completion Score = min(100, Completion Rate + 20)\n\n"
            "3. Risk Score (30% Weight):\n"
            "   Risk Score = max(0, 100 - (Critical Orders × 15 + High Risk Orders × 8))\n\n"
            "4. Delivery Pressure Score (15% Weight):\n"
            "   Delivery Score = max(0, 100 - min(Urgent Active Orders ≤ 3 days × 5, 50))\n\n"
            "Total Health Score =\n"
            "(Delay Score × 0.35) + (Completion Score × 0.20) + (Risk Score × 0.30) + (Delivery Score × 0.15)\n\n"
            "Status Tiers: ≥80 Healthy, 60–79 At Risk, 40–59 High Risk, <40 Critical."
        ),
        "hindi": (
            "ProcureAI में प्रोक्योरमेंट हेल्थ स्कोर (0–100) की गणना 4 महत्वपूर्ण घटकों के भारित औसत (weighted formula) से होती है:\n\n"
            "1. देरी स्कोर (Delay Score - 35% भार):\n"
            "   देरी स्कोर = max(0, 100 - देरी दर × 1.5)\n\n"
            "2. पूर्णता स्कोर (Completion Score - 20% भार):\n"
            "   पूर्णता स्कोर = min(100, पूर्णता दर + 20)\n\n"
            "3. जोखिम स्कोर (Risk Score - 30% भार):\n"
            "   जोखिम स्कोर = max(0, 100 - (गंभीर ऑर्डर × 15 + उच्च जोखिम ऑर्डर × 8))\n\n"
            "4. तात्कालिकता स्कोर (Delivery Pressure - 15% भार):\n"
            "   डिलीवरी स्कोर = max(0, 100 - min(3 दिन में आने वाले तत्काल ऑर्डर × 5, 50))\n\n"
            "कुल हेल्थ स्कोर =\n"
            "(देरी स्कोर × 0.35) + (पूर्णता स्कोर × 0.20) + (जोखिम स्कोर × 0.30) + (डिलीवरी स्कोर × 0.15)\n\n"
            "स्थिति श्रेणियां: ≥80 स्वस्थ (Healthy), 60–79 जोखिम में (At Risk), 40–59 उच्च जोखिम (High Risk), <40 गंभीर (Critical)।"
        ),
        "hinglish": (
            "ProcureAI Procurement Health Score (0-100) 4 weighted components se calculate karta hai:\n\n"
            "1. Delay Score (35% weight): max(0, 100 - Delay Rate × 1.5)\n"
            "2. Completion Score (20% weight): min(100, Completion Rate + 20)\n"
            "3. Risk Score (30% weight): max(0, 100 - (Critical Orders × 15 + High Risk Orders × 8))\n"
            "4. Delivery Score (15% weight): max(0, 100 - min(Urgent Active Orders ≤ 3 days × 5, 50))\n\n"
            "Final Score = (Delay × 0.35) + (Completion × 0.20) + (Risk × 0.30) + (Delivery × 0.15)\n"
            "Tiers: ≥80 Healthy, 60-79 At Risk, 40-59 High Risk, <40 Critical."
        ),
        "marathi": (
            "ProcureAI मध्ये प्रोक्योरमेंट हेल्थ स्कोअर (0–100) खालील 4 घटकांच्या आधारे मोजला जातो:\n\n"
            "1. विलंब स्कोअर (35% भार): max(0, 100 - विलंब दर × 1.5)\n"
            "2. पूर्णता स्कोअर (20% भार): min(100, पूर्णता दर + 20)\n"
            "3. जोखीम स्कोअर (30% भार): max(0, 100 - (गंभीर ऑर्डर्स × 15 + उच्च जोखीम ऑर्डर्स × 8))\n"
            "4. तात्काळ डिलिव्हरी दबाव (15% भार): max(0, 100 - min(3 दिवसांत येणाऱ्या ऑर्डर्स × 5, 50))\n\n"
            "एकूण हेल्थ स्कोअर =\n"
            "(विलंब × 0.35) + (पूर्णता × 0.20) + (जोखीम × 0.30) + (डिलिव्हरी × 0.15)\n\n"
            "श्रेणी: ≥80 सुरक्षित, 60–79 धोक्यात, 40–59 उच्च जोखीम, <40 गंभीर."
        ),
        "marathi_english": (
            "ProcureAI madhye Health Score (0-100) 4 weighted parts varun calculate hoto:\n"
            "1. Delay Score (35%): max(0, 100 - Delay Rate × 1.5)\n"
            "2. Completion Score (20%): min(100, Completion Rate + 20)\n"
            "3. Risk Score (30%): max(0, 100 - (Critical × 15 + High Risk × 8))\n"
            "4. Delivery Score (15%): max(0, 100 - min(Urgent orders × 5, 50))\n"
            "Tiers: ≥80 Healthy, 60-79 At Risk, 40-59 High Risk, <40 Critical."
        ),
    },

    "procurement_score": {
        "english": (
            "ProcureAI calculates the Procurement Health Score (0–100) using 4 weighted components:\n\n"
            "1. Delay Score (35% Weight):\n"
            "   Delay Score = max(0, 100 - Delay Rate × 1.5)\n\n"
            "2. Completion Score (20% Weight):\n"
            "   Completion Score = min(100, Completion Rate + 20)\n\n"
            "3. Operational Risk Score (30% Weight):\n"
            "   Risk Score = max(0, 100 - (Critical Orders × 15 + High Risk Orders × 8))\n\n"
            "4. Delivery Pressure Score (15% Weight):\n"
            "   Delivery Score = max(0, 100 - min(Urgent Active Orders ≤ 3 days × 5, 50))\n\n"
            "Total Health Score =\n"
            "(Delay Score × 0.35) + (Completion Score × 0.20) + (Risk Score × 0.30) + (Delivery Score × 0.15)\n\n"
            "Status Tiers: ≥80 Healthy, 60–79 At Risk, 40–59 High Risk, <40 Critical."
        ),
        "hindi": (
            "ProcureAI में प्रोक्योरमेंट हेल्थ स्कोर (0–100) की गणना 4 महत्वपूर्ण घटकों के भारित औसत (weighted formula) से होती है:\n\n"
            "1. देरी स्कोर (Delay Score - 35% भार):\n"
            "   देरी स्कोर = max(0, 100 - देरी दर × 1.5)\n\n"
            "2. पूर्णता स्कोर (Completion Score - 20% भार):\n"
            "   पूर्णता स्कोर = min(100, पूर्णता दर + 20)\n\n"
            "3. जोखिम स्कोर (Risk Score - 30% भार):\n"
            "   जोखिम स्कोर = max(0, 100 - (गंभीर ऑर्डर × 15 + उच्च जोखिम ऑर्डर × 8))\n\n"
            "4. तात्कालिकता स्कोर (Delivery Pressure - 15% भार):\n"
            "   डिलीवरी स्कोर = max(0, 100 - min(3 दिन में आने वाले तत्काल ऑर्डर × 5, 50))\n\n"
            "कुल हेल्थ स्कोर =\n"
            "(देरी स्कोर × 0.35) + (पूर्णता स्कोर × 0.20) + (जोखिम स्कोर × 0.30) + (डिलीवरी स्कोर × 0.15)\n\n"
            "स्थिति श्रेणियां: ≥80 स्वस्थ (Healthy), 60–79 जोखिम में (At Risk), 40–59 उच्च जोखिम (High Risk), <40 गंभीर (Critical)।"
        ),
        "hinglish": (
            "ProcureAI Procurement Health Score (0-100) 4 weighted components se calculate karta hai:\n\n"
            "1. Delay Score (35% weight): max(0, 100 - Delay Rate × 1.5)\n"
            "2. Completion Score (20% weight): min(100, Completion Rate + 20)\n"
            "3. Risk Score (30% weight): max(0, 100 - (Critical Orders × 15 + High Risk Orders × 8))\n"
            "4. Delivery Score (15% weight): max(0, 100 - min(Urgent Active Orders ≤ 3 days × 5, 50))\n\n"
            "Final Score = (Delay × 0.35) + (Completion × 0.20) + (Risk × 0.30) + (Delivery × 0.15)\n"
            "Tiers: ≥80 Healthy, 60-79 At Risk, 40-59 High Risk, <40 Critical."
        ),
        "marathi": (
            "ProcureAI मध्ये प्रोक्योरमेंट हेल्थ स्कोअर (0–100) खालील 4 घटकांच्या आधारे मोजला जातो:\n\n"
            "1. विलंब स्कोअर (35% भार): max(0, 100 - विलंब दर × 1.5)\n"
            "2. पूर्णता स्कोअर (20% भार): min(100, पूर्णता दर + 20)\n"
            "3. जोखीम स्कोअर (30% भार): max(0, 100 - (गंभीर ऑर्डर्स × 15 + उच्च जोखीम ऑर्डर्स × 8))\n"
            "4. तात्काळ डिलिव्हरी दबाव (15% भार): max(0, 100 - min(3 दिवसांत येणाऱ्या ऑर्डर्स × 5, 50))\n\n"
            "एकूण हेल्थ स्कोअर =\n"
            "(विलंब × 0.35) + (पूर्णता × 0.20) + (जोखिम × 0.30) + (डिलिव्हरी × 0.15)\n\n"
            "श्रेणी: ≥80 सुरक्षित, 60–79 धोक्यात, 40–59 उच्च जोखीम, <40 गंभीर."
        ),
        "marathi_english": (
            "ProcureAI madhye Health Score (0-100) 4 weighted parts varun calculate hoto:\n"
            "1. Delay Score (35%): max(0, 100 - Delay Rate × 1.5)\n"
            "2. Completion Score (20%): min(100, Completion Rate + 20)\n"
            "3. Risk Score (30%): max(0, 100 - (Critical × 15 + High Risk × 8))\n"
            "4. Delivery Score (15%): max(0, 100 - min(Urgent orders × 5, 50))\n"
            "Tiers: ≥80 Healthy, 60-79 At Risk, 40-59 High Risk, <40 Critical."
        ),
    },

    "delay_rate": {
        "english": (
            "Delay Rate is calculated as the proportion of delayed orders to the total number of orders:\n\n"
            "Formula:\n"
            "Delay Rate = (Delayed Orders ÷ Total Orders) × 100\n\n"
            "Example: If an organization has 9 total orders and 4 of them are delayed, Delay Rate = (4 ÷ 9) × 100 = 44.4%."
        ),
        "hindi": (
            "देरी की दर (Delay Rate) कुल ऑर्डर्स में विलंबित ऑर्डर्स के अनुपात से निकाली जाती है:\n\n"
            "सूत्र:\n"
            "देरी दर = (विलंबित ऑर्डर ÷ कुल ऑर्डर) × 100\n\n"
            "उदाहरण: यदि कुल 9 ऑर्डर हैं और उनमें से 4 में देरी है, तो देरी दर = (4 ÷ 9) × 100 = 44.4% होगी।"
        ),
        "hinglish": (
            "Delay Rate ka formula simple hai:\n\n"
            "Delay Rate = (Delayed Orders ÷ Total Orders) × 100\n\n"
            "Example: Agar 9 total orders mein se 4 late hain, toh delay rate = (4 ÷ 9) × 100 = 44.4% hota hai."
        ),
        "marathi": (
            "विलंब दर (Delay Rate) खालीलप्रमाणे मोजला जातो:\n\n"
            "सूत्र:\n"
            "विलंब दर = (विलंबित ऑर्डर्स ÷ एकूण ऑर्डर्स) × 100\n\n"
            "उदाहरण: जर एकूण 9 ऑर्डर्सपैकी 4 ऑर्डर्स उशिरा असतील, तर विलंब दर = (4 ÷ 9) × 100 = 44.4% असेल."
        ),
        "marathi_english": (
            "Delay Rate formula:\n"
            "Delay Rate = (Delayed Orders ÷ Total Orders) × 100\n"
            "Example: 9 total orders paiki 4 late jhalya tar delay rate 44.4% hoto."
        ),
    },

    "supplier_performance": {
        "english": (
            "ProcureAI calculates the Supplier Performance Score (0–100) using actual delivery data:\n\n"
            "1. Base Score: 100 points\n"
            "2. Delay Penalty: Deduct min(Delay Rate × 0.7, 70)\n"
            "3. Low Completion Penalty: Deduct 10 points if completion rate < 50%\n\n"
            "Formula:\n"
            "Score = max(0, 100 - min(Delay Rate × 0.7, 70) - (10 if Completion < 50% else 0))\n\n"
            "Ratings: ≥80 Excellent, ≥60 Good, ≥40 Needs Attention, <40 Poor."
        ),
        "hindi": (
            "ProcureAI में सप्लायर परफॉरमेंस स्कोर (0–100) की गणना वास्तविक डिलीवरी डेटा से की जाती है:\n\n"
            "1. बेस स्कोर: 100 अंक\n"
            "2. देरी पेनल्टी: min(देरी दर × 0.7, 70) अंक घटाए जाते हैं\n"
            "3. कम पूर्णता पेनल्टी: यदि पूर्णता दर 50% से कम हो तो 10 अंक की कटौती\n\n"
            "सूत्र:\n"
            "स्कोर = max(0, 100 - min(देरी दर × 0.7, 70) - (10 यदि पूर्णता < 50%))\n\n"
            "रेटिंग: ≥80 उत्कृष्ट, ≥60 अच्छा, ≥40 सुधार की जरूरत, <40 खराब।"
        ),
        "hinglish": (
            "Supplier Performance Score (0-100) aise calculate hota hai:\n"
            "• Base Score = 100 points\n"
            "• Delay Penalty = min(Delay Rate × 0.7, 70) deduct hota hai\n"
            "• Low Completion Penalty = 10 points deduct agar completion rate < 50%\n\n"
            "Ratings: ≥80 Excellent, ≥60 Good, ≥40 Needs Attention, <40 Poor."
        ),
        "marathi": (
            "सप्लायर परफॉर्मन्स स्कोअर (0–100) ची गणना:\n\n"
            "1. बेस स्कोअर: 100 गुण\n"
            "2. विलंब पेनल्टी: min(विलंब दर × 0.7, 70) गुण वजा केले जातात\n"
            "3. कमी पूर्णता पेनल्टी: पूर्णता दर 50% पेक्षा कमी असल्यास 10 गुण वजा\n\n"
            "रेटिंग: ≥80 उत्कृष्ट, ≥60 चांगले, ≥40 सुधारणेची गरज, <40 खराब."
        ),
        "marathi_english": (
            "Supplier Performance Score formula:\n"
            "Base 100 - min(Delay Rate × 0.7, 70) - (10 if completion < 50%)\n"
            "Ratings: ≥80 Excellent, ≥60 Good, ≥40 Needs Attention, <40 Poor."
        ),
    },

    "procurement_cost": {
        "english": (
            "Procurement Cost (Value) is calculated by multiplying each order's quantity by its agreed unit price and summing across all purchase orders:\n\n"
            "Total Cost = Sum of (Order Quantity × Unit Price)"
        ),
        "hindi": (
            "प्रोक्योरमेंट लागत (Procurement Cost) प्रत्येक ऑर्डर की मात्रा को उसके तय प्रति इकाई मूल्य से गुणा करके निकाली जाती है:\n\n"
            "कुल लागत = सभी ऑर्डर्स के (मात्रा × इकाई मूल्य) का कुल जोड़"
        ),
        "hinglish": (
            "Procurement Cost har purchase order ki quantity ko unit price se multiply karke sum karne par nikalti hai:\n\n"
            "Total Spend = Sum of (Quantity × Unit Price)"
        ),
        "marathi": (
            "खरेदी खर्च (Procurement Cost) प्रत्येक ऑर्डरचे प्रमाण आणि प्रति युनिट किंमत यांचा गुणाकार करून मोजला जातो:\n\n"
            "एकूण खर्च = सर्व ऑर्डर्सच्या (प्रमाण × किंमत) ची बेरीज"
        ),
        "marathi_english": (
            "Procurement Cost = Sum of (Order Quantity × Unit Price)."
        ),
    },
}

# Link procurement_score calculation directly to health_score calculation
CALCULATION_EXPLANATIONS["procurement_score"] = CALCULATION_EXPLANATIONS["health_score"]


# ============================================================
# SHORT QUERY CLARIFICATIONS & EXPANSIONS
# ============================================================

AMBIGUOUS_SHORT_CLARIFICATIONS: Dict[str, Dict[str, str]] = {
    "score": {
        "english": "Do you mean Procurement Score, Supplier Performance Score, or Project Health Score?",
        "hindi": "क्या आपका मतलब प्रोक्योरमेंट स्कोर, सप्लायर परफॉरमेंस स्कोर, या प्रोजेक्ट हेल्थ स्कोर से है?",
        "hinglish": "Aapka matlab Procurement Score, Supplier Performance Score, ya Project Health Score se hai?",
        "marathi": "तुमचा अर्थ प्रोक्योरमेंट स्कोअर, सप्लायर परफॉर्मन्स स्कोअर, की प्रोजेक्ट हेल्थ स्कोअर असा आहे?",
        "marathi_english": "Tumcha arth Procurement Score, Supplier Performance Score, ki Project Health Score asa aahe?",
    },
    "score_calc": {
        "english": "Which score calculation would you like me to explain? (1) Procurement Health Score, or (2) Supplier Performance Score?",
        "hindi": "आप किस स्कोर की गणना समझना चाहते हैं? (1) प्रोक्योरमेंट हेल्थ स्कोर, या (2) सप्लायर परफॉरमेंस स्कोर?",
        "hinglish": "Aap kaunsa score calculation samajhna chahte hain? (1) Procurement Health Score, ya (2) Supplier Performance Score?",
        "marathi": "आपण कोणत्या स्कोअरची गणना समजू इच्छिता? (1) प्रोक्योरमेंट हेल्थ स्कोअर, किंवा (2) सप्लायर परफॉर्मन्स स्कोअर?",
        "marathi_english": "Tumhi kontya score che calculation explain karaycha aahe? (1) Health Score, ki (2) Supplier Performance Score?",
    }
}


# ============================================================
# INTENT PATTERN MATCHING FOR CONCEPTUAL QUERIES
# ============================================================

CONCEPT_KEYWORD_MAP: Dict[str, str] = {
    # Procurement
    "procurement": "procurement",
    "procurment": "procurement",
    "procuremnt": "procurement",
    "खरेदी प्रक्रिया": "procurement",
    "खरीद प्रक्रिया": "procurement",
    "प्रोक्योरमेंट": "procurement",

    # Procurement Scheduling
    "procurement scheduling": "procurement_scheduling",
    "scheduling": "procurement_scheduling",
    "purchase scheduling": "procurement_scheduling",
    "शेड्यूलिंग": "procurement_scheduling",

    # Procurement Score
    "procurement score": "procurement_score",
    "procurment score": "procurement_score",
    "procurement scroe": "procurement_score",
    "प्रोक्योरमेंट स्कोर": "procurement_score",
    "प्रोक्योरमेंट स्कोअर": "procurement_score",

    # Health Score
    "health score": "health_score",
    "health scroe": "health_score",
    "helath score": "health_score",
    "प्रोजेक्ट हेल्थ स्कोर": "health_score",
    "हेल्थ स्कोर": "health_score",
    "हेल्थ स्कोअर": "health_score",

    # Supplier
    "supplier": "supplier",
    "supplir": "supplier",
    "suplier": "supplier",
    "vendors": "supplier",
    "vendor": "supplier",
    "सप्लायर": "supplier",
    "पुरवठादार": "supplier",

    # Supplier Performance
    "supplier performance": "supplier_performance",
    "supplier performance score": "supplier_performance",
    "supplier score": "supplier_performance",
    "vendor performance": "supplier_performance",
    "सप्लायर का प्रदर्शन": "supplier_performance",
    "सप्लायर प्रदर्शन": "supplier_performance",
    "सप्लायर परफॉर्मन्स": "supplier_performance",

    # Delay / Delayed Order
    "delay": "delay",
    "delays": "delay",
    "delayed order": "delayed_order",
    "delayed orders": "delayed_order",
    "late order": "delayed_order",
    "late orders": "delayed_order",
    "देरी": "delay",
    "विलंब": "delay",
    "विलंबित ऑर्डर": "delayed_order",

    # Delay Rate
    "delay rate": "delay_rate",
    "delay percentage": "delay_rate",
    "rate of delay": "delay_rate",
    "देरी की दर": "delay_rate",
    "विलंब दर": "delay_rate",
    "विलंबाचा दर": "delay_rate",

    # On-Time Order
    "on time order": "on_time_order",
    "on-time order": "on_time_order",
    "on time delivery": "on_time_order",
    "on-time delivery": "on_time_order",
    "समय पर डिलीवरी": "on_time_order",
    "वेळेवर डिलिव्हरी": "on_time_order",

    # Procurement Value / Cost
    "procurement value": "procurement_value",
    "procurement cost": "procurement_cost",
    "procurement spend": "procurement_value",
    "total spend": "procurement_value",
    "कुल खर्च": "procurement_value",
    "प्रोक्योरमेंट मूल्य": "procurement_value",

    # Risk
    "supplier risk": "supplier_risk",
    "procurement risk": "supplier_risk",
    "risk": "supplier_risk",
    "high risk": "supplier_risk",
    "low risk": "supplier_risk",
    "critical risk": "supplier_risk",
    "सप्लायर जोखिम": "supplier_risk",
    "जोखिम": "supplier_risk",
    "जोखीम": "supplier_risk",

    # Purchase Order
    "purchase order": "purchase_order",
    "po": "purchase_order",
    "order": "purchase_order",
    "orders": "purchase_order",
    "खरीद आदेश": "purchase_order",
    "खरेदी ऑर्डर": "purchase_order",

    # Recommendation
    "recommendation": "recommendation",
    "recommendations": "recommendation",
    "smart recommendation": "recommendation",
    "सुझाव": "recommendation",
    "शिफारशी": "recommendation",

    # Operations
    "lead time": "lead_time",
    "लीड टाइम": "lead_time",
    "delivery performance": "delivery_performance",
    "डिलीवरी प्रदर्शन": "delivery_performance",
    "cost efficiency": "cost_efficiency",
    "लागत दक्षता": "cost_efficiency",
    "procurement analytics": "procurement_analytics",
    "procurement optimization": "procurement_optimization",

    # System capabilities
    "how does procureai work": "how_it_works",
    "how procureai works": "how_it_works",
    "how does it work": "how_it_works",
    "what can you do": "what_can_you_do",
    "who are you": "how_it_works",
    "who are u": "how_it_works",
}


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def get_concept_explanation(concept_key: str, language: str = "english") -> str:
    """Retrieve localized conceptual definition for a term."""
    data = CONCEPT_DEFINITIONS.get(concept_key)
    if not data:
        return ""
    return data.get(language, data.get("english", ""))


def get_calculation_explanation(concept_key: str, language: str = "english") -> str:
    """Retrieve formula / calculation explanation for a metric."""
    data = CALCULATION_EXPLANATIONS.get(concept_key)
    if data and data.get(language):
        return data.get(language, data.get("english", ""))
    elif data and data.get("english"):
        return data["english"]

    # Fallback for metrics not separately calculated by ProcureAI
    fallbacks = {
        "english": f"ProcureAI currently does not calculate '{concept_key}' as a separate metric. However, you can check related available metrics such as Delay Rate, Supplier Performance Score, and Procurement Health Score.",
        "hindi": f"ProcureAI वर्तमान में '{concept_key}' को एक अलग मेट्रिक के रूप में कैलकुलेट नहीं करता है। हालांकि, आप इससे संबंधित उपलब्ध मेट्रिक्स जैसे देरी दर (Delay Rate), सप्लायर परफॉरमेंस स्कोर, और हेल्थ स्कोर देख सकते हैं।",
        "hinglish": f"ProcureAI filhaal '{concept_key}' ko alag metric ke form mein calculate nahi karta. Aap isse related metrics jaise Delay Rate, Supplier Performance Score aur Health Score dekh sakte hain.",
        "marathi": f"ProcureAI सध्या '{concept_key}' ला स्वतंत्र मेट्रिक म्हणून कॅल्क्युलेट करत नाही. तथापि, आपण विलंब दर (Delay Rate), सप्लायर परफॉर्मन्स स्कोअर आणि हेल्थ स्कोअर तपासू शकता.",
        "marathi_english": f"ProcureAI sadhya '{concept_key}' la separate metric mhanun calculate karat nahi. Tumhi Delay Rate, Supplier Performance Score aani Health Score check karu shakta.",
    }
    return fallbacks.get(language, fallbacks["english"])


DATA_MARKERS = [
    "our", "our project", "hamara", "hamare", "hamari", "amcha", "amchi", "amche", "aamcha", "aamche",
    "current", "latest", "database", "today", "show me", "give me", "list", "हमारी", "हमारा", "हमारे",
    "आमचा", "आमची", "आमचे", "डेटा", "डेटाबेस", "दिखाओ", "दाखवा", "काढा", "आताचा",
    "which", "who", "whom", "whose", "highest", "most", "maximum", "lowest", "least", "minimum",
    "sabse", "saglyat", "kis", "kiske", "kiska", "kaun", "kaunsa", "kaunsi", "kaunse",
    "kon", "kontya", "konala", "konta", "konti",
    "सबसे", "किस", "कौन", "कौनसा", "कौनसी", "कौनसे", "कोण", "कोणत्या", "सगळ्यात", "सर्वाधिक"
]

BARE_DATA_TERMS = {
    "delay", "delays", "delayed", "delayed order", "delayed orders",
    "risk", "risks", "high risk", "cost", "costs", "total cost",
    "supplier", "suppliers", "order", "orders", "materials", "material", "critical"
}


def detect_concept_intent(text: str) -> Optional[Tuple[str, bool]]:
    """
    Analyzes normalized user query to determine if it is asking for a
    conceptual definition or calculation formula.

    Returns:
        (concept_key, is_calculation_query) if conceptual query, else None.
    """
    clean = text.strip().lower()
    bare = re.sub(r"[^\w\s\u0900-\u097F]", "", clean).strip()

    # If it's a bare data keyword like "delays", "delays?", "risk?", route to data query
    if bare in BARE_DATA_TERMS:
        return None

    # Detect calculation query patterns:
    calc_patterns = [
        r"how\s+(is|are|do\s+we|to)\s+(it|this|the\s+)?(?P<term>.+?)\s*(calculated|computed)",
        r"(?P<term>.+?)\s*(formula|calculation)\s*(kya|hai|aahe|batao|explain)?",
        r"(?P<term>.+?)\s*(kaise|kasa)\s*(calculate|compute)\s*(hota|hoto)",
        r"(?P<term>.+?)\s*(कैसे|कसा)\s*(कैलकुलेट|कॅल्क्युलेट)\s*(होता|होतो)",
        r"how\s+is\s+it\s+calculated",
        r"how\s+is\s+it\s+computed",
        r"kaise\s+calculate\s+hota\s+hai",
        r"kasa\s+calculate\s+hoto",
        r"कैसे\s+कैलकुलेट\s+होता\s+है",
        r"कसा\s+कॅल्क्युलेट\s+होतो",
    ]

    for p in calc_patterns:
        m = re.search(p, clean)
        if m:
            term = m.groupdict().get("term", "").strip() if "term" in m.groupdict() else ""
            if term:
                for k, v in sorted(CONCEPT_KEYWORD_MAP.items(), key=lambda x: len(x[0]), reverse=True):
                    if k in term:
                        return (v, True)
            return ("score_calc", True)

    # If user mentions data markers ("our", "hamara", "current") and NOT asking for calculation, it's a DATA question
    has_data_marker = any(dm in clean for dm in DATA_MARKERS)
    if has_data_marker:
        return None

    # Detect conceptual definition patterns:
    concept_patterns = [
        r"^(what\s+is|what\s+are|what\s+does|meaning\s+of|define|definition\s+of)\s+(the\s+)?(?P<term>.+)",
        r"^(explain|tell\s+me\s+about)\s+(the\s+)?(?P<term>.+)",
        r"(?P<term>.+?)\s*(kya\s+hai|kya\s+hota\s+hai|kya\s+hoti\s+hai|ka\s+matlab|ko\s+explain|samjhao|samjha|explain\s+karo)",
        r"(?P<term>.+?)\s*(mhanje\s+kay|kay\s+aahe|samjavun\s+sanga|sanga)",
        r"(?P<term>.+?)\s*(क्या\s+है|क्या\s+होता\s+है|का\s+अर्थ|समझाओ|समझाइए)",
        r"(?P<term>.+?)\s*(म्हणजे\s+काय|काय\s+आहे|समजावून\s+सांगा)",
        r"^(how\s+does\s+procureai\s+work|what\s+can\s+you\s+do|who\s+are\s+you)",
    ]

    for p in concept_patterns:
        m = re.search(p, clean)
        if m:
            term = m.groupdict().get("term", "").strip() if "term" in m.groupdict() else clean
            for k, v in sorted(CONCEPT_KEYWORD_MAP.items(), key=lambda x: len(x[0]), reverse=True):
                if k in term or term == k:
                    return (v, False)

    # Check direct term matching if the query is a simple phrase
    for k, v in sorted(CONCEPT_KEYWORD_MAP.items(), key=lambda x: len(x[0]), reverse=True):
        if re.search(r"\b" + re.escape(k) + r"\b", clean):
            if any(qw in clean for qw in ["what is", "kya hai", "meaning", "explain", "mhanje", "काय आहे", "क्या है", "समझाओ", "संगा"]) or clean == k:
                return (v, False)

    return None
