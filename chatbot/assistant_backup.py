import sqlite3
import re
from datetime import datetime
from difflib import get_close_matches

# =========================================================
# CONFIGURATION
# =========================================================

BOT_NAME = "ProcureAI"

DB_PATH = "database/procurement.db"


# =========================================================
# CONVERSATION MEMORY
# =========================================================

conversation_memory = {
    "last_intent": None,
    "last_procurement_id": None,
    "last_supplier": None,
    "last_item": None,
    "last_result": None,
    "last_result_type": None,
    "last_procurement_ids": [],
    "last_supplier_list": [],
    "last_top_suppliers": [],
    "last_compared_ids": [],
    "last_language": "english"
}


# =========================================================
# DATABASE
# =========================================================

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def get_all_procurements():
    conn = get_connection()

    try:
        rows = conn.execute(
            "SELECT * FROM procurements ORDER BY id"
        ).fetchall()

        return [dict(row) for row in rows]

    except sqlite3.Error:
        return []

    finally:
        conn.close()


def get_procurement_by_id(procurement_id):

    if not procurement_id:
        return None

    raw_id = str(procurement_id).strip().upper()

    # PR001 -> 1
    numeric_id = re.sub(r"^PR0*", "", raw_id)

    if not numeric_id:
        numeric_id = raw_id

    conn = get_connection()

    try:

        # First try human-readable procurement_id
        row = conn.execute(
            """
            SELECT *
            FROM procurements
            WHERE UPPER(procurement_id) = ?
            """,
            (raw_id,)
        ).fetchone()

        if row:
            return dict(row)

        # Then try numeric database id
        row = conn.execute(
            """
            SELECT *
            FROM procurements
            WHERE CAST(id AS TEXT) = ?
            """,
            (numeric_id,)
        ).fetchone()

        if row:
            return dict(row)

        return None

    except sqlite3.Error:
        return None

    finally:
        conn.close()


# =========================================================
# VALUE CALCULATION
# =========================================================

def get_procurement_value(row):

    if not row:
        return 0

    try:
        quantity = float(row.get("quantity") or 0)
        unit_price = float(row.get("unit_price") or 0)

        return quantity * unit_price

    except (ValueError, TypeError):
        return 0


def format_currency(value):

    try:
        value = float(value)
    except (ValueError, TypeError):
        value = 0

    if value >= 10000000:
        return f"₹{value / 10000000:.2f} Cr"

    if value >= 100000:
        return f"₹{value / 100000:.2f} L"

    if value >= 1000:
        return f"₹{value / 1000:.2f} K"

    return f"₹{value:,.2f}"


# =========================================================
# TEXT NORMALIZATION
# =========================================================

def normalize_query(text):

    if not text:
        return ""

    text = str(text).lower().strip()

    text = re.sub(r"[^\w\s]", " ", text)

    text = text.replace("_", " ")

    text = re.sub(r"\s+", " ", text)

    return text.strip()


# =========================================================
# LANGUAGE / STYLE DETECTION
# =========================================================

HINDI_ROMAN_WORDS = {
    "hai",
    "hain",
    "ka",
    "ki",
    "ke",
    "kya",
    "kitna",
    "kitni",
    "kitne",
    "kis",
    "kaun",
    "sabse",
    "zyada",
    "kam",
    "wala",
    "wali",
    "wale",
    "mera",
    "meri",
    "mere",
    "aur",
    "batao",
    "dikhao",
    "chahiye",
    "kyun",
    "kyon",
    "kab",
    "kahan",
    "me",
    "mein",
    "par",
    "se",
    "ko",
    "ho",
    "hoga",
    "hogi",
    "delay",
    "deri",
    "supplier",
    "risk",
    "order"
}

MARATHI_ROMAN_WORDS = {
    "aahe",
    "ahe",
    "ahet",
    "cha",
    "chi",
    "che",
    "kiti",
    "kitī",
    "konacha",
    "konachi",
    "konache",
    "sarvat",
    "jasta",
    "kami",
    "aani",
    "ani",
    "kay",
    "kasa",
    "kashi",
    "kashe",
    "kuthe",
    "kadhe",
    "kadhi",
    "sanga",
    "dakhva",
    "pahije",
    "ka",
    "mhanje",
    "madhye",
    "var",
    "pasun",
    "yacha",
    "yachi",
    "yache",
    "order",
    "supplier",
    "delay",
    "risk"
}


def contains_devanagari(text):

    return bool(re.search(r"[\u0900-\u097F]", text))


def detect_language_style(text):

    if not text:
        return "english"

    original = text.strip()
    normalized = normalize_query(text)

    # -----------------------------------------------------
    # Devanagari detection
    # -----------------------------------------------------

    if contains_devanagari(original):

        hindi_markers = [
            "सबसे",
            "ज्यादा",
            "किस",
            "कितना",
            "कितनी",
            "कौन",
            "का",
            "की",
            "के",
            "है",
            "हैं",
            "देरी",
            "विलंब"
        ]

        marathi_markers = [
            "सर्वात",
            "जास्त",
            "कोणत्या",
            "किती",
            "आहे",
            "आहेत",
            "चा",
            "ची",
            "चे",
            "विलंब"
        ]

        hindi_score = sum(
            1 for word in hindi_markers
            if word in original
        )

        marathi_score = sum(
            1 for word in marathi_markers
            if word in original
        )

        if marathi_score > hindi_score:
            return "marathi"

        return "hindi"

    # -----------------------------------------------------
    # Roman language detection
    # -----------------------------------------------------

    words = set(normalized.split())

    hindi_score = len(words.intersection(HINDI_ROMAN_WORDS))

    marathi_score = len(words.intersection(MARATHI_ROMAN_WORDS))

    # Marathi-specific structures
    marathi_patterns = [
        r"\bcha\b",
        r"\bchi\b",
        r"\bche\b",
        r"\bkiti\b",
        r"\bahe\b",
        r"\baahe\b",
        r"\baani\b",
        r"\bsarvat\b",
        r"\bjasta\b",
        r"\bkonacha\b",
        r"\bkonachi\b"
    ]

    hindi_patterns = [
        r"\bhai\b",
        r"\bhain\b",
        r"\bka\b",
        r"\bki\b",
        r"\bke\b",
        r"\bkitna\b",
        r"\bkitni\b",
        r"\bkitne\b",
        r"\bsabse\b",
        r"\bzyada\b",
        r"\bkaun\b"
    ]

    for pattern in marathi_patterns:
        if re.search(pattern, normalized):
            marathi_score += 1

    for pattern in hindi_patterns:
        if re.search(pattern, normalized):
            hindi_score += 1

    # -----------------------------------------------------
    # Mixed Roman language
    # -----------------------------------------------------

    if marathi_score >= 2 and hindi_score >= 1:
        return "marathi_english"

    if marathi_score >= 2:
        return "marathi_english"

    if hindi_score >= 2:
        return "hinglish"

    # If only English technical words are used
    return "english"


# =========================================================
# ENTITY PROTECTION
# =========================================================

def protect_entities(text):

    entities = []

    all_rows = get_all_procurements()

    names = set()

    for row in all_rows:

        if row.get("supplier"):
            names.add(str(row["supplier"]))

        if row.get("item_name"):
            names.add(str(row["item_name"]))

        if row.get("procurement_id"):
            names.add(str(row["procurement_id"]))

    # Longest first
    names = sorted(names, key=len, reverse=True)

    for index, name in enumerate(names):

        placeholder = f"__ENTITY_{index}__"

        if name.lower() in text.lower():

            pattern = re.compile(
                re.escape(name),
                re.IGNORECASE
            )

            text = pattern.sub(
                placeholder,
                text
            )

            entities.append(
                (placeholder, name)
            )

    return text, entities


def restore_entities(text, entities):

    for placeholder, original in entities:

        text = text.replace(
            placeholder,
            original
        )

    return text


# =========================================================
# PROCUREMENT ID DETECTION
# =========================================================

def detect_procurement_ids(text):

    if not text:
        return []

    matches = re.findall(
        r"\bPR\d{3,}\b",
        text.upper()
    )

    return list(dict.fromkeys(matches))


# =========================================================
# SUPPLIER DETECTION
# =========================================================

def get_all_suppliers():

    rows = get_all_procurements()

    suppliers = []

    for row in rows:

        supplier = row.get("supplier")

        if supplier and supplier not in suppliers:
            suppliers.append(supplier)

    return suppliers


def detect_supplier(text):

    suppliers = get_all_suppliers()

    text_lower = text.lower()

    # Exact / partial match
    for supplier in suppliers:

        if supplier.lower() in text_lower:
            return supplier

    # Fuzzy matching
    words = text_lower.split()

    for supplier in suppliers:

        supplier_words = supplier.lower().split()

        for word in words:

            matches = get_close_matches(
                word,
                supplier_words,
                n=1,
                cutoff=0.75
            )

            if matches:
                return supplier

    return None


# =========================================================
# ITEM DETECTION
# =========================================================

def detect_item(text):

    rows = get_all_procurements()

    text_lower = text.lower()

    for row in rows:

        item = row.get("item_name")

        if item and item.lower() in text_lower:
            return item

    return None


# =========================================================
# STATUS HELPERS
# =========================================================

def is_delayed(row):

    return str(row.get("status", "")).lower() == "delayed"


def is_scheduled(row):

    return str(row.get("status", "")).lower() == "scheduled"


def is_critical(row):

    return str(row.get("priority", "")).lower() == "critical"


def is_high_priority(row):

    return str(row.get("priority", "")).lower() == "high"


# =========================================================
# RISK SCORE
# =========================================================

def calculate_risk_score(row):

    score = 0

    status = str(row.get("status", "")).lower()
    priority = str(row.get("priority", "")).lower()

    if status == "delayed":
        score += 50

    elif status == "scheduled":
        score += 10

    if priority == "critical":
        score += 40

    elif priority == "high":
        score += 30

    elif priority == "medium":
        score += 15

    elif priority == "low":
        score += 5

    value = get_procurement_value(row)

    if value >= 100000:
        score += 10

    elif value >= 50000:
        score += 5

    return min(score, 100)


def risk_label(score):

    if score >= 75:
        return "HIGH"

    if score >= 45:
        return "MEDIUM"

    return "LOW"


# =========================================================
# URGENCY SCORE
# =========================================================

def calculate_urgency_score(row):

    score = 0

    status = str(row.get("status", "")).lower()
    priority = str(row.get("priority", "")).lower()

    if status == "delayed":
        score += 50

    if priority == "critical":
        score += 40

    elif priority == "high":
        score += 30

    elif priority == "medium":
        score += 15

    value = get_procurement_value(row)

    if value >= 100000:
        score += 10

    return min(score, 100)


# =========================================================
# INTENT DETECTION
# =========================================================

def detect_intent(text):

    query = normalize_query(text)

    if not query:
        return "unknown"

    # Greetings
    if any(word in query for word in [
        "hello",
        "hi",
        "hey",
        "namaste"
    ]):
        return "greeting"

    # Thanks
    if any(word in query for word in [
        "thanks",
        "thank you",
        "dhanyavad"
    ]):
        return "thanks"

    # Help
    if any(word in query for word in [
        "help",
        "what can you do",
        "commands",
        "features"
    ]):
        return "help"

    # -----------------------------------------------------
    # Comparison
    # -----------------------------------------------------

    ids = detect_procurement_ids(text)

    comparison_phrases = [
        "compare",
        "comparison",
        "versus",
        "vs",
        "over",
        "prioritize",
        "priority",
        "better",
        "which should",
        "which one",
        "difference",
        "choose",
        "select",
        "prefer"
    ]

    if len(ids) >= 2 and any(
        phrase in query
        for phrase in comparison_phrases
    ):
        return "compare"

    # -----------------------------------------------------
    # Value at risk
    # -----------------------------------------------------

    value_risk_phrases = [
        "value at risk",
        "money at risk",
        "amount at risk",
        "financial risk",
        "financial exposure",
        "worth at risk"
    ]

    if any(
        phrase in query
        for phrase in value_risk_phrases
    ):
        return "value_at_risk"

    # -----------------------------------------------------
    # Supplier delay
    # -----------------------------------------------------

    if (
        ("supplier" in query or "vendor" in query)
        and (
            "delay" in query
            or "delayed" in query
            or "late" in query
            or "deri" in query
            or "vilamb" in query
        )
    ):
        return "supplier_delay"

    # -----------------------------------------------------
    # Supplier details
    # -----------------------------------------------------

    supplier = detect_supplier(text)

    if supplier:

        if any(word in query for word in [
            "supplier",
            "vendor",
            "delay",
            "risk",
            "procurement",
            "order",
            "value",
            "details"
        ]):
            return "supplier_details"

    # -----------------------------------------------------
    # Delayed procurement
    # -----------------------------------------------------

    if any(word in query for word in [
        "delayed",
        "delay",
        "late",
        "overdue",
        "deri",
        "विलंब",
        "देरी"
    ]):
        return "delayed"

    # -----------------------------------------------------
    # Upcoming
    # -----------------------------------------------------

    if any(word in query for word in [
        "upcoming",
        "scheduled",
        "next",
        "coming"
    ]):
        return "upcoming"

    # -----------------------------------------------------
    # Critical
    # -----------------------------------------------------

    if any(word in query for word in [
        "critical",
        "urgent",
        "high priority",
        "important"
    ]):
        return "critical"

    # -----------------------------------------------------
    # Most expensive
    # -----------------------------------------------------

    if any(word in query for word in [
        "most expensive",
        "highest value",
        "largest procurement",
        "maximum value",
        "costliest"
    ]):
        return "most_expensive"

    # -----------------------------------------------------
    # Risk
    # -----------------------------------------------------

    if any(word in query for word in [
        "risk",
        "risky",
        "danger"
    ]):
        return "risk"

    # -----------------------------------------------------
    # Recommendations
    # -----------------------------------------------------

    if any(word in query for word in [
        "recommend",
        "recommendation",
        "suggest",
        "what should",
        "what do you suggest"
    ]):
        return "recommendation"

    # -----------------------------------------------------
    # Action plan
    # -----------------------------------------------------

    if any(word in query for word in [
        "action plan",
        "what should we do",
        "next steps",
        "next step"
    ]):
        return "action_plan"

    # -----------------------------------------------------
    # Procurement ID
    # -----------------------------------------------------

    if ids:
        return "procurement_details"

    # -----------------------------------------------------
    # Item
    # -----------------------------------------------------

    if detect_item(text):
        return "item_info"

    return "unknown"


# =========================================================
# PROCUREMENT DETAILS
# =========================================================

def procurement_details(row, style="english"):

    if not row:
        return "Procurement not found."

    value = get_procurement_value(row)

    score = calculate_risk_score(row)
    risk = risk_label(score)

    urgency = calculate_urgency_score(row)

    pid = row.get("procurement_id")
    item = row.get("item_name")
    supplier = row.get("supplier")
    quantity = row.get("quantity")
    status = row.get("status")
    priority = row.get("priority")
    expected = row.get("expected_date")

    if style == "hinglish":

        return f"""📦 PROCUREMENT DETAILS

Procurement ID: {pid}
Item: {item}
Supplier: {supplier}
Quantity: {quantity}
Status: {status}
Priority: {priority}
Expected Date: {expected}
Procurement Value: {format_currency(value)}
Urgency Score: {urgency}/100
Risk Score: {score}/100 ({risk})

👉 Is procurement ko priority dena recommended hai."""


    if style == "marathi_english":

        return f"""📦 PROCUREMENT DETAILS

Procurement ID: {pid}
Item: {item}
Supplier: {supplier}
Quantity: {quantity}
Status: {status}
Priority: {priority}
Expected Date: {expected}
Procurement Value: {format_currency(value)}
Urgency Score: {urgency}/100
Risk Score: {score}/100 ({risk})

👉 Ya procurement la priority dene recommended aahe."""


    if style == "hindi":

        return f"""📦 खरीद विवरण

Procurement ID: {pid}
Item: {item}
Supplier: {supplier}
Quantity: {quantity}
Status: {status}
Priority: {priority}
Expected Date: {expected}
Procurement Value: {format_currency(value)}
Urgency Score: {urgency}/100
Risk Score: {score}/100 ({risk})

👉 इस procurement को priority देना recommended है।"""


    if style == "marathi":

        return f"""📦 खरेदी तपशील

Procurement ID: {pid}
Item: {item}
Supplier: {supplier}
Quantity: {quantity}
Status: {status}
Priority: {priority}
Expected Date: {expected}
Procurement Value: {format_currency(value)}
Urgency Score: {urgency}/100
Risk Score: {score}/100 ({risk})

👉 या procurement ला priority देणे recommended आहे."""


    return f"""📦 PROCUREMENT DETAILS

Procurement ID: {pid}
Item: {item}
Supplier: {supplier}
Quantity: {quantity}
Status: {status}
Priority: {priority}
Expected Date: {expected}
Procurement Value: {format_currency(value)}
Urgency Score: {urgency}/100
Risk Score: {score}/100 ({risk})

👉 Recommended: prioritize this procurement."""


# =========================================================
# SUPPLIER DETAILS
# =========================================================

def supplier_details(supplier, style="english"):

    rows = get_all_procurements()

    supplier_rows = [
        row for row in rows
        if str(row.get("supplier", "")).lower()
        == str(supplier).lower()
    ]

    if not supplier_rows:
        return "Supplier not found."

    total = len(supplier_rows)

    delayed = sum(
        1 for row in supplier_rows
        if is_delayed(row)
    )

    total_value = sum(
        get_procurement_value(row)
        for row in supplier_rows
    )

    delay_rate = (
        delayed / total * 100
        if total
        else 0
    )

    if style == "hinglish":

        return f"""🏢 SUPPLIER DETAILS

Supplier: {supplier}
Total procurements: {total}
Delayed orders: {delayed}
Delay rate: {delay_rate:.0f}%
Total value: {format_currency(total_value)}

👉 Delay rate {delay_rate:.0f}% hai, so supplier performance ko monitor karna chahiye."""


    if style == "marathi_english":

        return f"""🏢 SUPPLIER DETAILS

Supplier: {supplier}
Total procurements: {total}
Delayed orders: {delayed}
Delay rate: {delay_rate:.0f}%
Total value: {format_currency(total_value)}

👉 Delay rate {delay_rate:.0f}% aahe, so supplier performance monitor karne recommended aahe."""


    if style == "hindi":

        return f"""🏢 आपूर्तिकर्ता विवरण

Supplier: {supplier}
Total procurements: {total}
Delayed orders: {delayed}
Delay rate: {delay_rate:.0f}%
Total value: {format_currency(total_value)}

👉 Delay rate {delay_rate:.0f}% है, इसलिए supplier performance monitor करना चाहिए।"""


    if style == "marathi":

        return f"""🏢 पुरवठादार तपशील

Supplier: {supplier}
Total procurements: {total}
Delayed orders: {delayed}
Delay rate: {delay_rate:.0f}%
Total value: {format_currency(total_value)}

👉 Delay rate {delay_rate:.0f}% आहे, त्यामुळे supplier performance monitor करणे recommended आहे."""


    return f"""🏢 SUPPLIER DETAILS

Supplier: {supplier}
Total procurements: {total}
Delayed orders: {delayed}
Delay rate: {delay_rate:.0f}%
Total value: {format_currency(total_value)}

👉 Recommendation: monitor supplier performance."""


# =========================================================
# SUPPLIER DELAY ANALYSIS
# =========================================================

def supplier_delay_analysis(style="english"):

    rows = get_all_procurements()

    supplier_data = {}

    for row in rows:

        supplier = row.get("supplier", "Unknown")

        if supplier not in supplier_data:
            supplier_data[supplier] = {
                "total": 0,
                "delayed": 0
            }

        supplier_data[supplier]["total"] += 1

        if is_delayed(row):
            supplier_data[supplier]["delayed"] += 1

    if not supplier_data:
        return "No supplier data available."

    result = []

    if style == "hindi":

        result.append("🏢 आपूर्तिकर्ता विलंब विश्लेषण\n")

    elif style == "marathi":

        result.append("🏢 पुरवठादार विलंब विश्लेषण\n")

    else:

        result.append("🏢 SUPPLIER DELAY ANALYSIS\n")

    highest_delay = -1
    highest_suppliers = []

    for supplier, data in supplier_data.items():

        total = data["total"]
        delayed = data["delayed"]

        rate = delayed / total * 100

        if delayed > highest_delay:

            highest_delay = delayed
            highest_suppliers = [supplier]

        elif delayed == highest_delay:

            highest_suppliers.append(supplier)

        result.append(
            f"• {supplier}\n"
            f"  Delayed: {delayed}/{total}\n"
            f"  Delay rate: {rate:.0f}%\n"
        )

    if len(highest_suppliers) > 1:

        names = ", ".join(highest_suppliers)

        if style == "hinglish":

            result.append(
                f"⚠️ Highest delay count — TIE: "
                f"{names} ({highest_delay} delayed each)"
            )

        elif style == "marathi_english":

            result.append(
                f"⚠️ Highest delay count — TIE: "
                f"{names} (pratyeki {highest_delay} delayed)"
            )

        elif style == "hindi":

            result.append(
                f"⚠️ सबसे ज्यादा delay: {names} "
                f"({highest_delay} delayed each)"
            )

        elif style == "marathi":

            result.append(
                f"⚠️ सर्वाधिक विलंब: {names} "
                f"(प्रत्येकी {highest_delay} delayed)"
            )

        else:

            result.append(
                f"⚠️ Highest delay count — TIE: "
                f"{names} ({highest_delay} delayed each)"
            )

    else:

        supplier = highest_suppliers[0]

        if style == "hinglish":

            result.append(
                f"⚠️ Highest delay: {supplier} "
                f"({highest_delay} delayed)"
            )

        elif style == "marathi_english":

            result.append(
                f"⚠️ Highest delay: {supplier} "
                f"({highest_delay} delayed)"
            )

        elif style == "hindi":

            result.append(
                f"⚠️ सबसे ज्यादा delay: {supplier} "
                f"({highest_delay} delayed)"
            )

        elif style == "marathi":

            result.append(
                f"⚠️ सर्वाधिक विलंब: {supplier} "
                f"({highest_delay} delayed)"
            )

        else:

            result.append(
                f"⚠️ Highest delay: {supplier} "
                f"({highest_delay} delayed)"
            )

    conversation_memory["last_supplier_list"] = list(
        supplier_data.keys()
    )

    conversation_memory["last_top_suppliers"] = highest_suppliers

    return "\n".join(result)


# =========================================================
# DELAYED PROCUREMENT
# =========================================================

def delayed_procurements(style="english"):

    rows = get_all_procurements()

    delayed = [
        row for row in rows
        if is_delayed(row)
    ]

    if not delayed:

        if style == "hindi":
            return "✅ अभी कोई delayed procurement नहीं है।"

        if style in ["marathi", "marathi_english"]:
            return "✅ सध्या कोणतीही delayed procurement नाही."

        if style == "hinglish":
            return "✅ Abhi koi delayed procurement nahi hai."

        return "✅ No delayed procurements found."

    total_value = sum(
        get_procurement_value(row)
        for row in delayed
    )

    if style == "hinglish":

        result = [
            "⚠️ DELAYED PROCUREMENTS\n"
        ]

        for row in delayed:

            result.append(
                f"• {row['procurement_id']} — "
                f"{row['item_name']}\n"
                f"  Supplier: {row['supplier']}\n"
                f"  Expected: {row['expected_date']}\n"
                f"  Priority: {row['priority']}\n"
                f"  Value: {format_currency(get_procurement_value(row))}\n"
            )

        result.append(
            f"💰 Total value at risk: "
            f"{format_currency(total_value)}"
        )

        return "\n".join(result)

    if style == "marathi_english":

        result = [
            "⚠️ DELAYED PROCUREMENTS\n"
        ]

        for row in delayed:

            result.append(
                f"• {row['procurement_id']} — "
                f"{row['item_name']}\n"
                f"  Supplier: {row['supplier']}\n"
                f"  Expected: {row['expected_date']}\n"
                f"  Priority: {row['priority']}\n"
                f"  Value: {format_currency(get_procurement_value(row))}\n"
            )

        result.append(
            f"💰 Total value at risk: "
            f"{format_currency(total_value)}"
        )

        return "\n".join(result)

    if style == "hindi":

        result = [
            "⚠️ विलंबित खरीद\n"
        ]

        for row in delayed:

            result.append(
                f"• {row['procurement_id']} — "
                f"{row['item_name']}\n"
                f"  Supplier: {row['supplier']}\n"
                f"  Expected: {row['expected_date']}\n"
                f"  Priority: {row['priority']}\n"
                f"  Value: {format_currency(get_procurement_value(row))}\n"
            )

        result.append(
            f"💰 जोखिम में कुल मूल्य: "
            f"{format_currency(total_value)}"
        )

        return "\n".join(result)

    if style == "marathi":

        result = [
            "⚠️ विलंबित खरेदी\n"
        ]

        for row in delayed:

            result.append(
                f"• {row['procurement_id']} — "
                f"{row['item_name']}\n"
                f"  Supplier: {row['supplier']}\n"
                f"  Expected: {row['expected_date']}\n"
                f"  Priority: {row['priority']}\n"
                f"  Value: {format_currency(get_procurement_value(row))}\n"
            )

        result.append(
            f"💰 जोखमीतील एकूण मूल्य: "
            f"{format_currency(total_value)}"
        )

        return "\n".join(result)

    result = [
        "⚠️ DELAYED PROCUREMENTS\n"
    ]

    for row in delayed:

        result.append(
            f"• {row['procurement_id']} — "
            f"{row['item_name']}\n"
            f"  Supplier: {row['supplier']}\n"
            f"  Expected: {row['expected_date']}\n"
            f"  Priority: {row['priority']}\n"
            f"  Value: {format_currency(get_procurement_value(row))}\n"
        )

    result.append(
        f"💰 Total value at risk: "
        f"{format_currency(total_value)}"
    )

    return "\n".join(result)


# =========================================================
# VALUE AT RISK
# =========================================================

def value_at_risk(style="english"):

    rows = get_all_procurements()

    delayed = [
        row for row in rows
        if is_delayed(row)
    ]

    value = sum(
        get_procurement_value(row)
        for row in delayed
    )

    if style == "hinglish":

        return (
            f"💰 VALUE AT RISK\n\n"
            f"Delayed procurements: {len(delayed)}\n"
            f"Total value at risk: {format_currency(value)}\n\n"
            f"⚠️ Ye amount delayed procurements mein currently at risk hai."
        )

    if style == "marathi_english":

        return (
            f"💰 VALUE AT RISK\n\n"
            f"Delayed procurements: {len(delayed)}\n"
            f"Total value at risk: {format_currency(value)}\n\n"
            f"⚠️ Hi amount delayed procurements mule currently at risk aahe."
        )

    if style == "hindi":

        return (
            f"💰 VALUE AT RISK\n\n"
            f"Delayed procurements: {len(delayed)}\n"
            f"Total value at risk: {format_currency(value)}\n\n"
            f"⚠️ यह राशि delayed procurements के कारण जोखिम में है।"
        )

    if style == "marathi":

        return (
            f"💰 VALUE AT RISK\n\n"
            f"Delayed procurements: {len(delayed)}\n"
            f"Total value at risk: {format_currency(value)}\n\n"
            f"⚠️ ही रक्कम delayed procurements मुळे जोखमीत आहे."
        )

    return (
        f"💰 VALUE AT RISK\n\n"
        f"Delayed procurements: {len(delayed)}\n"
        f"Total value at risk: {format_currency(value)}\n\n"
        f"⚠️ This amount is currently at risk due to delayed procurements."
    )


# =========================================================
# MOST EXPENSIVE
# =========================================================

def most_expensive(style="english"):

    rows = get_all_procurements()

    if not rows:
        return "No procurement data available."

    row = max(
        rows,
        key=get_procurement_value
    )

    value = get_procurement_value(row)

    if style == "hinglish":

        return (
            f"💰 MOST EXPENSIVE PROCUREMENT\n\n"
            f"{row['procurement_id']} — {row['item_name']}\n"
            f"Supplier: {row['supplier']}\n"
            f"Value: {format_currency(value)}\n\n"
            f"👉 Ye procurement sabse high-value order hai."
        )

    if style == "marathi_english":

        return (
            f"💰 MOST EXPENSIVE PROCUREMENT\n\n"
            f"{row['procurement_id']} — {row['item_name']}\n"
            f"Supplier: {row['supplier']}\n"
            f"Value: {format_currency(value)}\n\n"
            f"👉 Hi procurement highest-value order aahe."
        )

    return (
        f"💰 MOST EXPENSIVE PROCUREMENT\n\n"
        f"{row['procurement_id']} — {row['item_name']}\n"
        f"Supplier: {row['supplier']}\n"
        f"Value: {format_currency(value)}"
    )


# =========================================================
# CRITICAL PROCUREMENT
# =========================================================

def critical_procurements(style="english"):

    rows = get_all_procurements()

    critical = [
        row for row in rows
        if is_critical(row) or is_high_priority(row)
    ]

    if not critical:
        return "No critical/high-priority procurements found."

    result = [
        "🚨 CRITICAL / HIGH PRIORITY PROCUREMENTS\n"
    ]

    for row in critical:

        score = calculate_risk_score(row)

        result.append(
            f"• {row['procurement_id']} — "
            f"{row['item_name']}\n"
            f"  Supplier: {row['supplier']}\n"
            f"  Priority: {row['priority']}\n"
            f"  Status: {row['status']}\n"
            f"  Risk: {score}/100 ({risk_label(score)})\n"
        )

    if style == "hinglish":

        result.append(
            "👉 In procurements ko pehle review karna recommended hai."
        )

    elif style == "marathi_english":

        result.append(
            "👉 Ya procurements la first review karne recommended aahe."
        )

    elif style == "hindi":

        result.append(
            "👉 इन procurements को पहले review करना recommended है।"
        )

    elif style == "marathi":

        result.append(
            "👉 या procurements चे आधी review करणे recommended आहे."
        )

    else:

        result.append(
            "👉 These procurements should be reviewed first."
        )

    return "\n".join(result)


# =========================================================
# RISK REPORT
# =========================================================

def risk_report(style="english"):

    rows = get_all_procurements()

    if not rows:
        return "No procurement data available."

    result = [
        "⚠️ PROCUREMENT RISK REPORT\n"
    ]

    sorted_rows = sorted(
        rows,
        key=calculate_risk_score,
        reverse=True
    )

    for row in sorted_rows:

        score = calculate_risk_score(row)

        result.append(
            f"• {row['procurement_id']} — "
            f"{row['item_name']}\n"
            f"  Supplier: {row['supplier']}\n"
            f"  Risk Score: {score}/100\n"
            f"  Risk Level: {risk_label(score)}\n"
        )

    return "\n".join(result)


# =========================================================
# UPCOMING
# =========================================================

def upcoming_procurements(style="english"):

    rows = get_all_procurements()

    scheduled = [
        row for row in rows
        if is_scheduled(row)
    ]

    if not scheduled:

        if style == "hinglish":
            return "📅 Abhi koi upcoming scheduled procurement nahi hai."

        if style == "marathi_english":
            return "📅 Sadhya upcoming scheduled procurement nahi aahe."

        return "📅 No upcoming scheduled procurements."

    result = [
        "📅 UPCOMING PROCUREMENTS\n"
    ]

    for row in scheduled:

        result.append(
            f"• {row['procurement_id']} — "
            f"{row['item_name']}\n"
            f"  Supplier: {row['supplier']}\n"
            f"  Expected: {row['expected_date']}\n"
            f"  Value: {format_currency(get_procurement_value(row))}\n"
        )

    return "\n".join(result)


# =========================================================
# COMPARISON
# =========================================================

def compare_procurements(ids, style="english"):

    rows = []

    for pid in ids:

        row = get_procurement_by_id(pid)

        if row:
            rows.append(row)

    if len(rows) < 2:
        return "I need at least two valid procurement IDs to compare."

    conversation_memory["last_compared_ids"] = [
        row["procurement_id"]
        for row in rows
    ]

    result = []

    result.append("📊 PROCUREMENT COMPARISON\n")

    result.append(
        "| Metric | "
        + " | ".join(row["procurement_id"] for row in rows)
        + " |"
    )

    result.append(
        "|---|"
        + "---|" * len(rows)
    )

    metrics = [
        ("Item", lambda r: r["item_name"]),
        ("Supplier", lambda r: r["supplier"]),
        ("Priority", lambda r: r["priority"]),
        ("Status", lambda r: r["status"]),
        (
            "Procurement Value",
            lambda r: format_currency(
                get_procurement_value(r)
            )
        ),
        (
            "Urgency Score",
            lambda r: f"{calculate_urgency_score(r)}/100"
        ),
        (
            "Risk Score",
            lambda r: f"{calculate_risk_score(r)}/100"
        )
    ]

    for name, getter in metrics:

        result.append(
            "| "
            + name
            + " | "
            + " | ".join(str(getter(row)) for row in rows)
            + " |"
        )

    scores = [
        (
            row,
            calculate_urgency_score(row)
            + calculate_risk_score(row)
        )
        for row in rows
    ]

    recommended = max(
        scores,
        key=lambda x: x[1]
    )[0]

    result.append("")

    if style == "hinglish":

        result.append(
            f"🎯 Recommendation: {recommended['procurement_id']} "
            f"ko higher priority deni chahiye."
        )

    elif style == "marathi_english":

        result.append(
            f"🎯 Recommendation: {recommended['procurement_id']} "
            f"la higher priority dene recommended aahe."
        )

    elif style == "hindi":

        result.append(
            f"🎯 Recommendation: {recommended['procurement_id']} "
            f"को higher priority देनी चाहिए।"
        )

    elif style == "marathi":

        result.append(
            f"🎯 Recommendation: {recommended['procurement_id']} "
            f"ला higher priority देणे recommended आहे."
        )

    else:

        result.append(
            f"🎯 Recommendation: {recommended['procurement_id']} "
            f"should receive higher priority."
        )

    return "\n".join(result)


# =========================================================
# RECOMMENDATIONS
# =========================================================

def recommendations(style="english"):

    rows = get_all_procurements()

    if not rows:
        return "No procurement data available."

    delayed = [
        row for row in rows
        if is_delayed(row)
    ]

    critical = [
        row for row in rows
        if is_critical(row)
    ]

    highest_risk = max(
        rows,
        key=calculate_risk_score
    )

    result = [
        "💡 PROCUREMENT RECOMMENDATIONS\n"
    ]

    if delayed:

        result.append(
            f"1. Review {len(delayed)} delayed procurement(s) immediately."
        )

    if critical:

        result.append(
            f"2. Prioritize {len(critical)} critical procurement(s)."
        )

    result.append(
        f"3. Closely monitor {highest_risk['supplier']} "
        f"for {highest_risk['item_name']}."
    )

    result.append(
        "4. Track supplier delay rates regularly."
    )

    result.append(
        "5. Use risk score and procurement value together "
        "for prioritization."
    )

    if style == "hinglish":

        result.append(
            "\n👉 Overall: delayed aur high-risk procurements "
            "ko first priority do."
        )

    elif style == "marathi_english":

        result.append(
            "\n👉 Overall: delayed ani high-risk procurements "
            "la first priority dya."
        )

    elif style == "hindi":

        result.append(
            "\n👉 Overall: delayed और high-risk procurements "
            "को first priority दें।"
        )

    elif style == "marathi":

        result.append(
            "\n👉 Overall: delayed आणि high-risk procurements "
            "ला first priority द्या."
        )

    else:

        result.append(
            "\n👉 Overall: prioritize delayed and high-risk procurements first."
        )

    return "\n".join(result)


# =========================================================
# ACTION PLAN
# =========================================================

def action_plan(style="english"):

    rows = get_all_procurements()

    delayed = [
        row for row in rows
        if is_delayed(row)
    ]

    if style == "hinglish":

        return f"""🚀 PROCUREMENT ACTION PLAN

1. Delayed orders ko immediately review karo.
2. Suppliers se revised delivery dates confirm karo.
3. Critical procurements ko highest priority do.
4. High-value delayed orders ko escalate karo.
5. Supplier delay performance track karo.

Current delayed orders: {len(delayed)}
Current value at risk: {format_currency(sum(get_procurement_value(r) for r in delayed))}"""

    if style == "marathi_english":

        return f"""🚀 PROCUREMENT ACTION PLAN

1. Delayed orders immediately review kara.
2. Suppliers kadun revised delivery dates confirm kara.
3. Critical procurements la highest priority dya.
4. High-value delayed orders escalate kara.
5. Supplier delay performance track kara.

Current delayed orders: {len(delayed)}
Current value at risk: {format_currency(sum(get_procurement_value(r) for r in delayed))}"""

    if style == "hindi":

        return f"""🚀 खरीद कार्य योजना

1. Delayed orders की तुरंत समीक्षा करें।
2. Suppliers से revised delivery dates confirm करें।
3. Critical procurements को highest priority दें।
4. High-value delayed orders को escalate करें।
5. Supplier delay performance को track करें।

Current delayed orders: {len(delayed)}
Current value at risk: {format_currency(sum(get_procurement_value(r) for r in delayed))}"""

    if style == "marathi":

        return f"""🚀 खरेदी कृती योजना

1. Delayed orders ची त्वरित समीक्षा करा.
2. Suppliers कडून revised delivery dates confirm करा.
3. Critical procurements ला highest priority द्या.
4. High-value delayed orders escalate करा.
5. Supplier delay performance track करा.

Current delayed orders: {len(delayed)}
Current value at risk: {format_currency(sum(get_procurement_value(r) for r in delayed))}"""

    return f"""🚀 PROCUREMENT ACTION PLAN

1. Review delayed orders immediately.
2. Confirm revised delivery dates with suppliers.
3. Give critical procurements the highest priority.
4. Escalate high-value delayed orders.
5. Track supplier delay performance.

Current delayed orders: {len(delayed)}
Current value at risk: {format_currency(sum(get_procurement_value(r) for r in delayed))}"""


# =========================================================
# GREETING
# =========================================================

def greeting(style="english"):

    if style == "hinglish":
        return "👋 Hello! Main ProcureAI hoon. Procurement data ke baare mein kuch bhi pooch sakte ho."

    if style == "marathi_english":
        return "👋 Hello! Mi ProcureAI aahe. Procurement data baddal kahi hi vicharu shakta."

    if style == "hindi":
        return "👋 नमस्ते! मैं ProcureAI हूँ। आप procurement data के बारे में कुछ भी पूछ सकते हैं।"

    if style == "marathi":
        return "👋 नमस्कार! मी ProcureAI आहे. तुम्ही procurement data बद्दल काहीही विचारू शकता."

    return "👋 Hello! I am ProcureAI. Ask me anything about your procurement data."


# =========================================================
# HELP
# =========================================================

def help_response(style="english"):

    if style == "hinglish":

        return """🤖 PROCUREAI HELP

Aap mujhse ye questions pooch sakte ho:

• Which supplier has the most delays?
• SKF India ka delay kitna hai?
• PR001 details
• Which procurements are delayed?
• What is the value at risk?
• Which procurement is most expensive?
• Show critical procurements
• Give me risk report
• Compare PR001 and PR004
• What should we do?
• Give recommendations

Aap Hindi, English, Hinglish ya Marathi-English mein bhi pooch sakte ho."""

    if style == "marathi_english":

        return """🤖 PROCUREAI HELP

Tumhi mala he questions vicharu shakta:

• Which supplier has the most delays?
• SKF India cha delay kiti aahe?
• PR001 details
• Which procurements are delayed?
• What is the value at risk?
• Which procurement is most expensive?
• Show critical procurements
• Give me risk report
• Compare PR001 and PR004
• What should we do?
• Give recommendations

Tumhi English, Hindi, Marathi kiwa mixed language madhye vicharu shakta."""

    return """🤖 PROCUREAI HELP

You can ask:

• Which supplier has the most delays?
• SKF India delay details
• PR001 details
• Which procurements are delayed?
• What is the value at risk?
• Which procurement is most expensive?
• Show critical procurements
• Give me risk report
• Compare PR001 and PR004
• What should we do?
• Give recommendations

You can use English, Hindi, Marathi, Hinglish or Marathi-English."""


# =========================================================
# FOLLOW-UP CONTEXT
# =========================================================

def resolve_followup(text, intent):

    normalized = normalize_query(text)

    followup_words = [
        "and",
        "also",
        "aur",
        "aani",
        "risk",
        "delay",
        "details",
        "more",
        "tell me more",
        "what about",
        "what about it",
        "iska",
        "iska risk",
        "tyacha",
        "tyachi"
    ]

    is_followup = any(
        word in normalized
        for word in followup_words
    )

    if not is_followup:
        return intent

    # If user asks "aur risk?"
    if "risk" in normalized:

        if (
            conversation_memory["last_procurement_id"]
            or conversation_memory["last_supplier"]
        ):
            return "risk"

    return intent


# =========================================================
# RISK FOR CONTEXT
# =========================================================

def contextual_risk(style="english"):

    procurement_id = conversation_memory[
        "last_procurement_id"
    ]

    supplier = conversation_memory[
        "last_supplier"
    ]

    if procurement_id:

        row = get_procurement_by_id(procurement_id)

        if row:

            score = calculate_risk_score(row)

            if style == "hinglish":

                return (
                    f"⚠️ {row['procurement_id']} ka risk "
                    f"{risk_label(score)} hai "
                    f"({score}/100)."
                )

            if style == "marathi_english":

                return (
                    f"⚠️ {row['procurement_id']} cha risk "
                    f"{risk_label(score)} aahe "
                    f"({score}/100)."
                )

            if style == "hindi":

                return (
                    f"⚠️ {row['procurement_id']} का risk "
                    f"{risk_label(score)} है "
                    f"({score}/100)।"
                )

            if style == "marathi":

                return (
                    f"⚠️ {row['procurement_id']} चा risk "
                    f"{risk_label(score)} आहे "
                    f"({score}/100)."
                )

            return (
                f"⚠️ {row['procurement_id']} has "
                f"{risk_label(score)} risk "
                f"({score}/100)."
            )

    if supplier:

        rows = get_all_procurements()

        supplier_rows = [
            row for row in rows
            if str(row.get("supplier", "")).lower()
            == str(supplier).lower()
        ]

        if supplier_rows:

            highest = max(
                supplier_rows,
                key=calculate_risk_score
            )

            score = calculate_risk_score(highest)

            if style == "hinglish":

                return (
                    f"⚠️ {supplier} ke procurement ka "
                    f"highest risk {risk_label(score)} hai "
                    f"({score}/100)."
                )

            if style == "marathi_english":

                return (
                    f"⚠️ {supplier} chya procurement cha "
                    f"highest risk {risk_label(score)} aahe "
                    f"({score}/100)."
                )

            return (
                f"⚠️ {supplier} has "
                f"{risk_label(score)} risk "
                f"({score}/100)."
            )

    return risk_report(style)


# =========================================================
# UNKNOWN RESPONSE
# =========================================================

def unknown_response(style="english"):

    if style == "hinglish":

        return (
            "🤔 Mujhe ye query clearly samajh nahi aayi.\n\n"
            "Aap try karo:\n"
            "• Which supplier has the most delays?\n"
            "• SKF India ka delay kitna hai?\n"
            "• PR001 details\n"
            "• What is the value at risk?\n"
            "• Compare PR001 and PR004"
        )

    if style == "marathi_english":

        return (
            "🤔 Mala hi query clearly samajli nahi.\n\n"
            "Tumhi try kara:\n"
            "• Which supplier has the most delays?\n"
            "• SKF India cha delay kiti aahe?\n"
            "• PR001 details\n"
            "• What is the value at risk?\n"
            "• Compare PR001 and PR004"
        )

    if style == "hindi":

        return (
            "🤔 मुझे यह query स्पष्ट रूप से समझ नहीं आई।\n\n"
            "आप try कर सकते हैं:\n"
            "• Which supplier has the most delays?\n"
            "• SKF India का delay कितना है?\n"
            "• PR001 details\n"
            "• What is the value at risk?\n"
            "• Compare PR001 and PR004"
        )

    if style == "marathi":

        return (
            "🤔 मला ही query स्पष्टपणे समजली नाही.\n\n"
            "तुम्ही try करू शकता:\n"
            "• Which supplier has the most delays?\n"
            "• SKF India चा delay किती आहे?\n"
            "• PR001 details\n"
            "• What is the value at risk?\n"
            "• Compare PR001 and PR004"
        )

    return (
        "🤔 I couldn't clearly understand that query.\n\n"
        "Try:\n"
        "• Which supplier has the most delays?\n"
        "• SKF India delay details\n"
        "• PR001 details\n"
        "• What is the value at risk?\n"
        "• Compare PR001 and PR004"
    )


# =========================================================
# MAIN PROCESSOR
# =========================================================

def process_message(user_message):

    if not user_message:
        return "Please enter a message."

    # -----------------------------------------------------
    # Detect language/style
    # -----------------------------------------------------

    detected_style = detect_language_style(
        user_message
    )

    # -----------------------------------------------------
    # Preserve previous style for ambiguous followups
    # -----------------------------------------------------

    normalized = normalize_query(user_message)

    ambiguous_followups = [
        "aur risk",
        "and risk",
        "aani risk",
        "iska risk",
        "tyacha risk",
        "more details",
        "tell me more",
        "what about it",
        "details"
    ]

    if (
        any(x in normalized for x in ambiguous_followups)
        and detected_style == "english"
        and conversation_memory["last_language"] != "english"
    ):
        detected_style = conversation_memory[
            "last_language"
        ]

    # -----------------------------------------------------
    # Detect intent
    # -----------------------------------------------------

    intent = detect_intent(user_message)

    intent = resolve_followup(
        user_message,
        intent
    )

    # -----------------------------------------------------
    # IDs / supplier / item
    # -----------------------------------------------------

    ids = detect_procurement_ids(
        user_message
    )

    supplier = detect_supplier(
        user_message
    )

    item = detect_item(
        user_message
    )

    # -----------------------------------------------------
    # Context
    # -----------------------------------------------------

    if ids:

        conversation_memory[
            "last_procurement_id"
        ] = ids[-1]

    elif intent == "risk" and conversation_memory[
        "last_procurement_id"
    ]:

        pass

    if supplier:

        conversation_memory[
            "last_supplier"
        ] = supplier

    if item:

        conversation_memory[
            "last_item"
        ] = item

    # -----------------------------------------------------
    # Execute intent
    # -----------------------------------------------------

    response = None

    if intent == "greeting":

        response = greeting(detected_style)

    elif intent == "thanks":

        if detected_style == "hinglish":
            response = "😊 Welcome! Jab bhi procurement analysis chahiye, pooch lena."

        elif detected_style == "marathi_english":
            response = "😊 Welcome! Procurement analysis pahije asel tar kadhi hi vichara."

        elif detected_style == "hindi":
            response = "😊 Welcome! जब भी procurement analysis चाहिए, पूछ सकते हैं।"

        elif detected_style == "marathi":
            response = "😊 Welcome! Procurement analysis पाहिजे असेल तर कधीही विचारा."

        else:
            response = "😊 You're welcome! Ask me anytime for procurement analysis."

    elif intent == "help":

        response = help_response(
            detected_style
        )

    elif intent == "supplier_delay":

        response = supplier_delay_analysis(
            detected_style
        )

    elif intent == "supplier_details":

        supplier_name = supplier or conversation_memory[
            "last_supplier"
        ]

        if supplier_name:

            response = supplier_details(
                supplier_name,
                detected_style
            )

        else:

            response = unknown_response(
                detected_style
            )

    elif intent == "delayed":

        response = delayed_procurements(
            detected_style
        )

    elif intent == "value_at_risk":

        response = value_at_risk(
            detected_style
        )

    elif intent == "most_expensive":

        response = most_expensive(
            detected_style
        )

    elif intent == "critical":

        response = critical_procurements(
            detected_style
        )

    elif intent == "upcoming":

        response = upcoming_procurements(
            detected_style
        )

    elif intent == "risk":

        response = contextual_risk(
            detected_style
        )

    elif intent == "compare":

        if len(ids) >= 2:

            response = compare_procurements(
                ids,
                detected_style
            )

        else:

            previous_ids = conversation_memory[
                "last_compared_ids"
            ]

            if len(previous_ids) >= 2:

                response = compare_procurements(
                    previous_ids,
                    detected_style
                )

            else:

                response = unknown_response(
                    detected_style
                )

    elif intent == "recommendation":

        response = recommendations(
            detected_style
        )

    elif intent == "action_plan":

        response = action_plan(
            detected_style
        )

    elif intent == "procurement_details":

        procurement_id = (
            ids[-1]
            if ids
            else conversation_memory[
                "last_procurement_id"
            ]
        )

        row = get_procurement_by_id(
            procurement_id
        )

        if row:

            conversation_memory[
                "last_procurement_id"
            ] = row["procurement_id"]

            conversation_memory[
                "last_supplier"
            ] = row["supplier"]

            conversation_memory[
                "last_item"
            ] = row["item_name"]

            response = procurement_details(
                row,
                detected_style
            )

        else:

            response = unknown_response(
                detected_style
            )

    elif intent == "item_info":

        item_name = item or conversation_memory[
            "last_item"
        ]

        rows = get_all_procurements()

        matching = [
            row for row in rows
            if str(row.get("item_name", "")).lower()
            == str(item_name).lower()
        ]

        if matching:

            row = matching[0]

            response = procurement_details(
                row,
                detected_style
            )

        else:

            response = unknown_response(
                detected_style
            )

    else:

        # -------------------------------------------------
        # Smart context fallback
        # -------------------------------------------------

        if (
            conversation_memory["last_supplier"]
            and any(
                word in normalized
                for word in [
                    "delay",
                    "risk",
                    "details",
                    "more"
                ]
            )
        ):

            if "risk" in normalized:

                response = contextual_risk(
                    detected_style
                )

            else:

                response = supplier_details(
                    conversation_memory["last_supplier"],
                    detected_style
                )

        elif conversation_memory[
            "last_procurement_id"
        ] and any(
            word in normalized
            for word in [
                "risk",
                "delay",
                "details",
                "more"
            ]
        ):

            response = contextual_risk(
                detected_style
            )

        else:

            response = unknown_response(
                detected_style
            )

    # -----------------------------------------------------
    # Update memory
    # -----------------------------------------------------

    conversation_memory[
        "last_intent"
    ] = intent

    conversation_memory[
        "last_language"
    ] = detected_style

    conversation_memory[
        "last_result"
    ] = response

    conversation_memory[
        "last_result_type"
    ] = intent

    if ids:

        conversation_memory[
            "last_procurement_ids"
        ] = ids

    return response


# =========================================================
# TERMINAL CHAT
# =========================================================

def main():

    print("=" * 60)
    print("🤖 PROCUREAI — PROCUREMENT INTELLIGENCE ASSISTANT")
    print("=" * 60)

    print("\nType 'help' to see what I can do.")

    print("Type 'exit' or 'quit' to stop.\n")

    while True:

        try:

            user_message = input("You: ").strip()

            if not user_message:
                continue

            if normalize_query(user_message) in [
                "exit",
                "quit",
                "bye"
            ]:

                print(
                    "\nProcureAI: Goodbye! 👋"
                )

                break

            response = process_message(
                user_message
            )

            print(
                f"\nProcureAI: {response}\n"
            )

        except KeyboardInterrupt:

            print(
                "\n\nProcureAI: Goodbye! 👋"
            )

            break

        except Exception as error:

            print(
                f"\nProcureAI Error: {error}\n"
            )


# =========================================================
# START
# =========================================================

if __name__ == "__main__":
    main()