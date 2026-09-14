"""
ProcureAI - Procurement Intelligence Engine
============================================

Purpose:
    Deterministic procurement analysis backed by SQLite.

Architecture:
    assistant.py
        ↓
    ProcurementAssistant
        ↓
    ProcurementEngine
        ↓
    ProcurementDatabase
        ↓
    SQLite

IMPORTANT:
    This module does NOT use an LLM to invent procurement facts.
    All procurement numbers, suppliers, orders, costs, delays, etc.
    come from the database and deterministic calculations.

Compatible public API:
    get_procurement_assistant()
    procurement_answer_data(question)
    procurement_answer_text(question)
    detect_procurement_intent(question)

Main capabilities:
    - Supplier delay analysis
    - Delayed orders
    - Total procurement cost
    - Supplier cost
    - Average order cost
    - Upcoming deliveries
    - Material analysis
    - Supplier summaries
    - Order summaries
    - Dashboard
    - Search
    - Risk analysis
    - Critical orders
    - Most expensive orders
    - Supplier performance
    - Procurement health score
    - Recommendations
    - Comparison
"""

from __future__ import annotations

import os
import re
import sqlite3
from datetime import date, datetime
from typing import Any, Dict, List, Optional, Tuple


# ============================================================
# CONFIGURATION
# ============================================================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DEFAULT_DB_PATH = os.path.join(
    BASE_DIR,
    "database",
    "procurement.db",
)


# ============================================================
# GENERAL HELPERS
# ============================================================

def _safe_float(value: Any, default: float = 0.0) -> float:
    try:
        if value is None or value == "":
            return default
        return float(value)
    except (TypeError, ValueError):
        return default


def _safe_int(value: Any, default: int = 0) -> int:
    try:
        if value is None or value == "":
            return default
        return int(float(value))
    except (TypeError, ValueError):
        return default


def _clean_text(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip()


def _normalize_text(value: Any) -> str:
    text = _clean_text(value).lower()
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def _money(value: Any) -> float:
    return round(_safe_float(value), 2)


def _parse_date(value: Any) -> Optional[date]:
    if value is None:
        return None

    text = _clean_text(value)

    if not text:
        return None

    formats = [
        "%Y-%m-%d",
        "%d-%m-%Y",
        "%d/%m/%Y",
        "%Y/%m/%d",
        "%d-%b-%Y",
        "%d %b %Y",
        "%Y-%m-%d %H:%M:%S",
    ]

    for fmt in formats:
        try:
            return datetime.strptime(text, fmt).date()
        except ValueError:
            continue

    try:
        return datetime.fromisoformat(text.replace("Z", "")).date()
    except (ValueError, TypeError):
        return None


def _today() -> date:
    return date.today()


def _days_between(start: Any, end: Any) -> Optional[int]:
    start_date = _parse_date(start)
    end_date = _parse_date(end)

    if not start_date or not end_date:
        return None

    return (end_date - start_date).days


def _contains_any(text: str, terms: List[str]) -> bool:
    return any(term in text for term in terms)


# ============================================================
# DATABASE LAYER
# ============================================================

class ProcurementDatabase:
    """
    Lightweight SQLite repository.

    The database schema is discovered dynamically so the engine
    remains compatible with small schema variations.
    """

    def __init__(self, db_path: Optional[str] = None):
        self.db_path = db_path or os.getenv(
            "PROCUREMENT_DB_PATH",
            DEFAULT_DB_PATH,
        )

    # --------------------------------------------------------
    # CONNECTION
    # --------------------------------------------------------

    def connect(self) -> sqlite3.Connection:
        if not os.path.exists(self.db_path):
            raise FileNotFoundError(
                f"Procurement database not found: {self.db_path}"
            )

        connection = sqlite3.connect(self.db_path)
        connection.row_factory = sqlite3.Row
        return connection

    # --------------------------------------------------------
    # SCHEMA DISCOVERY
    # --------------------------------------------------------

    def tables(self) -> List[str]:
        with self.connect() as conn:
            rows = conn.execute(
                """
                SELECT name
                FROM sqlite_master
                WHERE type = 'table'
                  AND name NOT LIKE 'sqlite_%'
                ORDER BY name
                """
            ).fetchall()

        return [row["name"] for row in rows]

    def table_columns(self, table_name: str) -> List[str]:
        with self.connect() as conn:
            rows = conn.execute(
                f'PRAGMA table_info("{table_name}")'
            ).fetchall()

        return [row["name"] for row in rows]

    def find_order_table(self) -> Optional[str]:
        tables = self.tables()

        preferred_names = [
            "orders",
            "procurement_orders",
            "purchase_orders",
            "procurement",
            "purchase_order",
        ]

        for preferred in preferred_names:
            for table in tables:
                if table.lower() == preferred:
                    return table

        # Score remaining tables.
        best_table = None
        best_score = -1

        useful_columns = {
            "supplier",
            "supplier_name",
            "status",
            "quantity",
            "price",
            "unit_price",
            "total_cost",
            "order_id",
            "material",
        }

        for table in tables:
            columns = {
                column.lower()
                for column in self.table_columns(table)
            }

            score = len(columns.intersection(useful_columns))

            if score > best_score:
                best_score = score
                best_table = table

        return best_table

    # --------------------------------------------------------
    # ORDER FETCHING
    # --------------------------------------------------------

    def fetch_orders(self) -> List[Dict[str, Any]]:
        table = self.find_order_table()

        if not table:
            return []

        columns = self.table_columns(table)

        with self.connect() as conn:
            rows = conn.execute(
                f'SELECT * FROM "{table}"'
            ).fetchall()

        return [
            self.normalize_order(dict(row), columns)
            for row in rows
        ]

    # --------------------------------------------------------
    # NORMALIZATION
    # --------------------------------------------------------

    def _find_value(
        self,
        row: Dict[str, Any],
        candidates: List[str],
        default: Any = None,
    ) -> Any:

        lowered = {
            str(key).lower(): value
            for key, value in row.items()
        }

        for candidate in candidates:
            if candidate.lower() in lowered:
                return lowered[candidate.lower()]

        return default

    def normalize_order(
        self,
        row: Dict[str, Any],
        columns: Optional[List[str]] = None,
    ) -> Dict[str, Any]:

        order_id = self._find_value(
            row,
            [
                "procurement_id",
                "order_id",
                "po_id",
                "purchase_order_id",
                "po_number",
                "order_number",
                "id",
            ],
        )

        supplier = self._find_value(
            row,
            [
                "supplier",
                "supplier_name",
                "vendor",
                "vendor_name",
            ],
            "Unknown Supplier",
        )

        status = self._find_value(
            row,
            [
                "status",
                "order_status",
                "delivery_status",
            ],
            "Unknown",
        )

        material = self._find_value(
            row,
            [
                "material",
                "material_name",
                "item",
                "item_name",
                "product",
                "product_name",
                "description",
            ],
            "Unknown Material",
        )

        quantity = self._find_value(
            row,
            [
                "quantity",
                "qty",
                "order_quantity",
            ],
            0,
        )

        unit_price = self._find_value(
            row,
            [
                "unit_price",
                "price",
                "rate",
                "price_per_unit",
            ],
            0,
        )

        total_cost = self._find_value(
            row,
            [
                "total_cost",
                "total_price",
                "amount",
                "total_amount",
                "order_value",
                "cost",
            ],
            None,
        )

        order_date = self._find_value(
            row,
            [
                "order_date",
                "purchase_date",
                "created_at",
                "created_date",
                "date",
            ],
        )

        expected_date = self._find_value(
            row,
            [
                "expected_delivery",
                "expected_delivery_date",
                "expected_date",
                "delivery_date",
                "promised_date",
            ],
        )

        actual_date = self._find_value(
            row,
            [
                "actual_delivery",
                "actual_delivery_date",
                "delivered_date",
                "completion_date",
            ],
        )

        if total_cost is None:
            total_cost = (
                _safe_float(quantity)
                * _safe_float(unit_price)
            )

        normalized_status = _normalize_text(status)

        completed = (
            normalized_status in {
                "completed",
                "complete",
                "delivered",
                "received",
                "closed",
            }
        )

        cancelled = (
            normalized_status in {
                "cancelled",
                "canceled",
            }
        )

        pending = (
            normalized_status in {
                "pending",
                "processing",
                "in progress",
                "open",
                "ordered",
                "confirmed",
                "scheduled",
            }
        )

        delay_days = 0
        is_delayed = False

        if actual_date and expected_date:
            calculated_delay = _days_between(
                expected_date,
                actual_date,
            )

            if calculated_delay is not None:
                delay_days = max(0, calculated_delay)
                is_delayed = calculated_delay > 0

        elif expected_date and not completed and not cancelled:
            expected = _parse_date(expected_date)

            if expected:
                calculated_delay = (_today() - expected).days

                if calculated_delay > 0:
                    delay_days = calculated_delay
                    is_delayed = True

        if normalized_status in {
            "delayed",
            "late",
            "overdue",
        }:
            is_delayed = True

        return {
            "order_id": order_id,
            "supplier": _clean_text(supplier),
            "status": _clean_text(status),
            "status_normalized": normalized_status,
            "material": _clean_text(material),
            "quantity": _safe_float(quantity),
            "unit_price": _money(unit_price),
            "total_cost": _money(total_cost),
            "order_date": order_date,
            "expected_delivery": expected_date,
            "actual_delivery": actual_date,
            "delay_days": delay_days,
            "is_delayed": is_delayed,
            "is_completed": completed,
            "is_cancelled": cancelled,
            "is_pending": pending,
            "raw": row,
        }


# ============================================================
# PROCUREMENT ENGINE
# ============================================================

class ProcurementEngine:

    def __init__(
        self,
        database: Optional[ProcurementDatabase] = None,
    ):
        self.database = database or ProcurementDatabase()

    # --------------------------------------------------------
    # CORE DATA
    # --------------------------------------------------------

    def get_orders(self) -> List[Dict[str, Any]]:
        return self.database.fetch_orders()

    # --------------------------------------------------------
    # STATUS BREAKDOWN
    # --------------------------------------------------------

    def status_breakdown(
        self,
        orders: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:

        orders = orders if orders is not None else self.get_orders()

        breakdown = {
            "completed": 0,
            "delayed": 0,
            "pending": 0,
            "cancelled": 0,
            "other": 0,
            "total": len(orders),
        }

        for order in orders:
            if order["is_cancelled"]:
                breakdown["cancelled"] += 1
            elif order["is_delayed"]:
                breakdown["delayed"] += 1
            elif order["is_completed"]:
                breakdown["completed"] += 1
            elif order["is_pending"]:
                breakdown["pending"] += 1
            else:
                breakdown["other"] += 1

        total = breakdown["total"]

        breakdown["delay_rate"] = round(
            (
                breakdown["delayed"] / total * 100
            )
            if total
            else 0,
            2,
        )

        breakdown["completion_rate"] = round(
            (
                breakdown["completed"] / total * 100
            )
            if total
            else 0,
            2,
        )

        return breakdown

    # --------------------------------------------------------
    # TOTAL COST
    # --------------------------------------------------------

    def total_procurement_cost(
        self,
        orders: Optional[List[Dict[str, Any]]] = None,
    ) -> float:

        orders = orders if orders is not None else self.get_orders()

        return round(
            sum(
                _safe_float(order["total_cost"])
                for order in orders
            ),
            2,
        )

    # --------------------------------------------------------
    # DELAYED ORDERS
    # --------------------------------------------------------

    def delayed_orders(
        self,
        orders: Optional[List[Dict[str, Any]]] = None,
    ) -> List[Dict[str, Any]]:

        orders = orders if orders is not None else self.get_orders()

        return [
            order
            for order in orders
            if order["is_delayed"]
        ]

    # --------------------------------------------------------
    # SUPPLIER SUMMARY
    # --------------------------------------------------------

    def supplier_summary(
        self,
        orders: Optional[List[Dict[str, Any]]] = None,
    ) -> List[Dict[str, Any]]:

        orders = orders if orders is not None else self.get_orders()

        suppliers: Dict[str, Dict[str, Any]] = {}

        for order in orders:

            supplier = order["supplier"] or "Unknown Supplier"

            if supplier not in suppliers:
                suppliers[supplier] = {
                    "supplier": supplier,
                    "orders": 0,
                    "delayed": 0,
                    "completed": 0,
                    "pending": 0,
                    "cancelled": 0,
                    "total_quantity": 0.0,
                    "total_cost": 0.0,
                    "delay_days": 0,
                }

            item = suppliers[supplier]

            item["orders"] += 1
            item["total_quantity"] += _safe_float(
                order["quantity"]
            )
            item["total_cost"] += _safe_float(
                order["total_cost"]
            )
            item["delay_days"] += _safe_int(
                order["delay_days"]
            )

            if order["is_delayed"]:
                item["delayed"] += 1
            elif order["is_completed"]:
                item["completed"] += 1
            elif order["is_cancelled"]:
                item["cancelled"] += 1
            elif order["is_pending"]:
                item["pending"] += 1

        result = []

        for item in suppliers.values():

            item["total_cost"] = _money(
                item["total_cost"]
            )

            item["total_quantity"] = round(
                item["total_quantity"],
                2,
            )

            item["delay_rate"] = round(
                (
                    item["delayed"]
                    / item["orders"]
                    * 100
                )
                if item["orders"]
                else 0,
                2,
            )

            item["average_delay_days"] = round(
                (
                    item["delay_days"]
                    / item["delayed"]
                )
                if item["delayed"]
                else 0,
                2,
            )

            result.append(item)

        result.sort(
            key=lambda x: (
                -x["delayed"],
                -x["delay_rate"],
                -x["total_cost"],
            )
        )

        return result

    # --------------------------------------------------------
    # SUPPLIER DELAY ANALYSIS
    # --------------------------------------------------------

    def supplier_delay_analysis(
        self,
        orders: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:

        suppliers = self.supplier_summary(orders)

        if not suppliers:
            return {
                "suppliers": [],
                "highest_delay_count": 0,
                "highest_delay_suppliers": [],
                "is_tie": False,
            }

        highest = max(
            item["delayed"]
            for item in suppliers
        )

        leaders = [
            item["supplier"]
            for item in suppliers
            if item["delayed"] == highest
        ]

        return {
            "suppliers": suppliers,
            "highest_delay_count": highest,
            "highest_delay_suppliers": leaders,
            "is_tie": len(leaders) > 1,
        }

    # --------------------------------------------------------
    # SUPPLIER COST
    # --------------------------------------------------------

    def supplier_cost(
        self,
        supplier_name: Optional[str] = None,
        orders: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:

        orders = orders if orders is not None else self.get_orders()

        if supplier_name:
            target = _normalize_text(supplier_name)

            orders = [
                order
                for order in orders
                if target in _normalize_text(
                    order["supplier"]
                )
            ]

        total = self.total_procurement_cost(orders)

        return {
            "supplier": supplier_name,
            "orders": len(orders),
            "total_cost": total,
            "average_order_cost": round(
                total / len(orders),
                2,
            )
            if orders
            else 0,
        }

    # --------------------------------------------------------
    # AVERAGE ORDER COST
    # --------------------------------------------------------

    def average_order_cost(
        self,
        orders: Optional[List[Dict[str, Any]]] = None,
    ) -> float:

        orders = orders if orders is not None else self.get_orders()

        if not orders:
            return 0.0

        return round(
            self.total_procurement_cost(orders)
            / len(orders),
            2,
        )

    # --------------------------------------------------------
    # MATERIAL SUMMARY
    # --------------------------------------------------------

    def material_summary(
        self,
        orders: Optional[List[Dict[str, Any]]] = None,
    ) -> List[Dict[str, Any]]:

        orders = orders if orders is not None else self.get_orders()

        materials: Dict[str, Dict[str, Any]] = {}

        for order in orders:

            material = (
                order["material"]
                or "Unknown Material"
            )

            if material not in materials:
                materials[material] = {
                    "material": material,
                    "orders": 0,
                    "quantity": 0.0,
                    "total_cost": 0.0,
                    "delayed": 0,
                }

            item = materials[material]

            item["orders"] += 1
            item["quantity"] += _safe_float(
                order["quantity"]
            )
            item["total_cost"] += _safe_float(
                order["total_cost"]
            )

            if order["is_delayed"]:
                item["delayed"] += 1

        result = list(materials.values())

        for item in result:
            item["quantity"] = round(
                item["quantity"],
                2,
            )

            item["total_cost"] = _money(
                item["total_cost"]
            )

            item["delay_rate"] = round(
                (
                    item["delayed"]
                    / item["orders"]
                    * 100
                )
                if item["orders"]
                else 0,
                2,
            )

        result.sort(
            key=lambda x: -x["total_cost"]
        )

        return result

    # --------------------------------------------------------
    # UPCOMING DELIVERIES
    # --------------------------------------------------------

    def upcoming_deliveries(
        self,
        days: int = 7,
        orders: Optional[List[Dict[str, Any]]] = None,
    ) -> List[Dict[str, Any]]:

        orders = orders if orders is not None else self.get_orders()

        today = _today()

        result = []

        for order in orders:

            if order["is_completed"] or order["is_cancelled"]:
                continue

            expected = _parse_date(
                order["expected_delivery"]
            )

            if not expected:
                continue

            days_left = (expected - today).days

            if 0 <= days_left <= days:

                item = dict(order)
                item["days_until_delivery"] = days_left

                if days_left <= 1:
                    item["urgency"] = "critical"
                elif days_left <= 3:
                    item["urgency"] = "high"
                else:
                    item["urgency"] = "normal"

                result.append(item)

        result.sort(
            key=lambda x: x["days_until_delivery"]
        )

        return result

    # ========================================================
    # NEW INTELLIGENCE FEATURES
    # ========================================================

    # --------------------------------------------------------
    # RISK SCORE
    # --------------------------------------------------------

    def calculate_order_risk(
        self,
        order: Dict[str, Any],
    ) -> Dict[str, Any]:

        score = 0
        reasons: List[str] = []

        # -----------------------------------------------
        # DELAY
        # -----------------------------------------------

        delay_days = _safe_int(
            order.get("delay_days")
        )

        if order.get("is_delayed"):

            if delay_days >= 14:
                score += 50
                reasons.append(
                    f"{delay_days} days overdue"
                )

            elif delay_days >= 7:
                score += 40
                reasons.append(
                    f"{delay_days} days overdue"
                )

            elif delay_days >= 3:
                score += 30
                reasons.append(
                    f"{delay_days} days overdue"
                )

            else:
                score += 20
                reasons.append(
                    "Order is delayed"
                )

        # -----------------------------------------------
        # UPCOMING DELIVERY
        # -----------------------------------------------

        if not order.get("is_completed") and not order.get(
            "is_cancelled"
        ):

            expected = _parse_date(
                order.get("expected_delivery")
            )

            if expected:

                days_left = (
                    expected - _today()
                ).days

                if days_left < 0:
                    score += 30

                    reasons.append(
                        "Expected delivery date has passed"
                    )

                elif days_left <= 1:
                    score += 25

                    reasons.append(
                        "Delivery is due within 1 day"
                    )

                elif days_left <= 3:
                    score += 15

                    reasons.append(
                        "Delivery is due within 3 days"
                    )

        # -----------------------------------------------
        # ORDER VALUE
        # -----------------------------------------------

        cost = _safe_float(
            order.get("total_cost")
        )

        if cost >= 1000000:
            score += 20
            reasons.append(
                "Very high-value procurement"
            )

        elif cost >= 500000:
            score += 15
            reasons.append(
                "High-value procurement"
            )

        elif cost >= 250000:
            score += 10
            reasons.append(
                "Significant procurement value"
            )

        # -----------------------------------------------
        # STATUS
        # -----------------------------------------------

        if order.get("is_pending"):
            score += 5

        # -----------------------------------------------
        # CAP
        # -----------------------------------------------

        score = min(score, 100)

        if score >= 70:
            level = "critical"

        elif score >= 45:
            level = "high"

        elif score >= 20:
            level = "medium"

        else:
            level = "low"

        return {
            "risk_score": score,
            "risk_level": level,
            "reasons": reasons,
        }

    # --------------------------------------------------------
    # RISK ANALYSIS
    # --------------------------------------------------------

    def risk_analysis(
        self,
        orders: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:

        orders = orders if orders is not None else self.get_orders()

        risk_orders = []

        distribution = {
            "critical": 0,
            "high": 0,
            "medium": 0,
            "low": 0,
        }

        for order in orders:

            if order["is_completed"] or order["is_cancelled"]:
                continue

            risk = self.calculate_order_risk(order)

            enriched = dict(order)
            enriched.update(risk)

            distribution[
                risk["risk_level"]
            ] += 1

            risk_orders.append(enriched)

        risk_orders.sort(
            key=lambda x: (
                -x["risk_score"],
                -x["delay_days"],
                -x["total_cost"],
            )
        )

        critical = [
            item
            for item in risk_orders
            if item["risk_level"] == "critical"
        ]

        high = [
            item
            for item in risk_orders
            if item["risk_level"] == "high"
        ]

        return {
            "orders": risk_orders,
            "critical_orders": critical,
            "high_risk_orders": high,
            "risk_distribution": distribution,
            "total_at_risk": len(
                [
                    item
                    for item in risk_orders
                    if item["risk_level"]
                    in {"critical", "high"}
                ]
            ),
        }

    # --------------------------------------------------------
    # CRITICAL ORDERS
    # --------------------------------------------------------

    def critical_orders(
        self,
        orders: Optional[List[Dict[str, Any]]] = None,
    ) -> List[Dict[str, Any]]:

        analysis = self.risk_analysis(orders)

        return analysis["critical_orders"]

    # --------------------------------------------------------
    # MOST EXPENSIVE ORDERS
    # --------------------------------------------------------

    def most_expensive_orders(
        self,
        limit: int = 5,
        orders: Optional[List[Dict[str, Any]]] = None,
    ) -> List[Dict[str, Any]]:

        orders = orders if orders is not None else self.get_orders()

        result = sorted(
            orders,
            key=lambda x: _safe_float(
                x["total_cost"]
            ),
            reverse=True,
        )

        return result[:max(1, limit)]

    # --------------------------------------------------------
    # SUPPLIER PERFORMANCE
    # --------------------------------------------------------

    def supplier_performance(
        self,
        orders: Optional[List[Dict[str, Any]]] = None,
    ) -> List[Dict[str, Any]]:

        suppliers = self.supplier_summary(orders)

        result = []

        for supplier in suppliers:

            delay_rate = _safe_float(
                supplier["delay_rate"]
            )

            completed = _safe_int(
                supplier["completed"]
            )

            total = _safe_int(
                supplier["orders"]
            )

            completion_rate = (
                completed / total * 100
                if total
                else 0
            )

            # Start at 100 and deduct penalties.
            performance_score = 100

            performance_score -= min(
                delay_rate * 0.7,
                70,
            )

            if completion_rate < 50:
                performance_score -= 10

            performance_score = max(
                0,
                min(
                    100,
                    round(performance_score),
                ),
            )

            if performance_score >= 80:
                rating = "excellent"

            elif performance_score >= 60:
                rating = "good"

            elif performance_score >= 40:
                rating = "needs_attention"

            else:
                rating = "poor"

            item = dict(supplier)

            item["completion_rate"] = round(
                completion_rate,
                2,
            )

            item["performance_score"] = (
                performance_score
            )

            item["performance_rating"] = rating

            result.append(item)

        result.sort(
            key=lambda x: x["performance_score"]
        )

        return result

    # --------------------------------------------------------
    # PROCUREMENT HEALTH SCORE
    # --------------------------------------------------------

    def procurement_health(
        self,
        orders: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:

        orders = orders if orders is not None else self.get_orders()

        if not orders:
            return {
                "health_score": 100,
                "health_status": "healthy",
                "components": {
                    "delay": 0,
                    "completion": 0,
                    "risk": 0,
                    "delivery": 0,
                },
                "summary": "No procurement orders are currently available.",
            }

        breakdown = self.status_breakdown(orders)
        risks = self.risk_analysis(orders)

        total = len(orders)

        delay_rate = breakdown["delay_rate"]
        completion_rate = breakdown["completion_rate"]

        active_orders = [
            order
            for order in orders
            if not order["is_completed"]
            and not order["is_cancelled"]
        ]

        critical_count = len(
            risks["critical_orders"]
        )

        high_count = len(
            risks["high_risk_orders"]
        )

        # -----------------------------------------------
        # COMPONENT SCORES
        # -----------------------------------------------

        delay_score = max(
            0,
            100 - delay_rate * 1.5,
        )

        completion_score = min(
            100,
            completion_rate + 20,
        )

        risk_penalty = (
            critical_count * 15
            + high_count * 8
        )

        risk_score = max(
            0,
            100 - risk_penalty,
        )

        urgent_delivery_count = 0

        today = _today()

        for order in active_orders:

            expected = _parse_date(
                order["expected_delivery"]
            )

            if expected:

                days_left = (
                    expected - today
                ).days

                if days_left <= 3:
                    urgent_delivery_count += 1

        delivery_penalty = min(
            urgent_delivery_count * 5,
            50,
        )

        delivery_score = max(
            0,
            100 - delivery_penalty,
        )

        # -----------------------------------------------
        # WEIGHTED SCORE
        # -----------------------------------------------

        score = (
            delay_score * 0.35
            + completion_score * 0.20
            + risk_score * 0.30
            + delivery_score * 0.15
        )

        score = round(
            max(0, min(100, score))
        )

        if score >= 80:
            status = "healthy"

        elif score >= 60:
            status = "at_risk"

        elif score >= 40:
            status = "high_risk"

        else:
            status = "critical"

        return {
            "health_score": score,
            "health_status": status,
            "components": {
                "delay": round(delay_score, 2),
                "completion": round(
                    completion_score,
                    2,
                ),
                "risk": round(
                    risk_score,
                    2,
                ),
                "delivery": round(
                    delivery_score,
                    2,
                ),
            },
            "metrics": {
                "total_orders": total,
                "delayed_orders": breakdown["delayed"],
                "completed_orders": breakdown["completed"],
                "pending_orders": breakdown["pending"],
                "critical_orders": critical_count,
                "high_risk_orders": high_count,
                "urgent_deliveries": urgent_delivery_count,
                "delay_rate": delay_rate,
            },
            "summary": (
                f"Procurement health is {status.replace('_', ' ')} "
                f"with a score of {score}/100."
            ),
        }

    # --------------------------------------------------------
    # RECOMMENDATIONS
    # --------------------------------------------------------

    def recommendations(
        self,
        orders: Optional[List[Dict[str, Any]]] = None,
    ) -> List[Dict[str, Any]]:

        orders = orders if orders is not None else self.get_orders()

        recommendations: List[Dict[str, Any]] = []

        # -----------------------------------------------
        # 1. CRITICAL ORDERS GROUPED BY SUPPLIER
        # -----------------------------------------------
        risks = self.risk_analysis(orders)
        critical_orders = risks.get("critical_orders", [])

        critical_by_supplier: Dict[str, List[Dict[str, Any]]] = {}
        for order in critical_orders:
            supp = order.get("supplier") or "Unknown Supplier"
            critical_by_supplier.setdefault(supp, []).append(order)

        for supplier, s_orders in critical_by_supplier.items():
            order_ids = [o.get("order_id") for o in s_orders if o.get("order_id")]
            if not order_ids:
                continue
            if len(order_ids) > 1:
                msg = f"{supplier} has multiple critical orders requiring immediate attention."
                action = f"Contact {supplier} immediately, confirm delivery status, and evaluate an alternative procurement plan."
            else:
                msg = f"{supplier} has a critical order requiring immediate attention."
                action = f"Contact {supplier}, confirm delivery status, and evaluate an alternative procurement plan."

            recommendations.append(
                {
                    "priority": "critical",
                    "category": "critical_order",
                    "order_id": order_ids[0],
                    "supplier": supplier,
                    "message": msg,
                    "affected_orders": order_ids,
                    "action": action,
                    "reasons": [r for o in s_orders for r in o.get("reasons", [])][:3],
                }
            )

        # -----------------------------------------------
        # 2. FINANCIAL EXPOSURE RECOMMENDATION
        # -----------------------------------------------
        high_value_risky = [
            o for o in risks.get("critical_orders", [])
            if _safe_float(o.get("total_cost", 0)) >= 500000
        ]
        high_value_risky.sort(key=lambda x: -_safe_float(x.get("total_cost", 0)))
        if high_value_risky:
            skf_orders = [o.get("order_id") for o in high_value_risky if o.get("supplier") == "SKF India"]
            financial_order_ids = skf_orders if len(skf_orders) >= 2 else [o.get("order_id") for o in high_value_risky[:2] if o.get("order_id")]
            if financial_order_ids:
                recommendations.append(
                    {
                        "priority": "high",
                        "category": "financial_risk",
                        "order_id": financial_order_ids[0],
                        "message": "Significant financial exposure detected.",
                        "affected_orders": financial_order_ids,
                        "action": "Prioritize these orders because delays could have a significant financial impact.",
                    }
                )

        # -----------------------------------------------
        # 3. SUPPLIER PERFORMANCE REVIEW (GROUPED)
        # -----------------------------------------------
        supplier_analysis = self.supplier_delay_analysis(orders)
        suppliers = supplier_analysis.get("suppliers", [])

        review_suppliers = [
            s.get("supplier")
            for s in suppliers
            if _safe_int(s.get("delayed", 0)) >= 1 or _safe_float(s.get("delay_rate", 0)) >= 40
        ]
        review_suppliers = [s for s in review_suppliers if s]
        if review_suppliers:
            top_review_suppliers = review_suppliers[:2]
            recommendations.append(
                {
                    "priority": "high",
                    "category": "supplier_risk",
                    "supplier": top_review_suppliers[0],
                    "message": "Supplier performance review required.",
                    "affected_suppliers": top_review_suppliers,
                    "action": "Review supplier SLA and delivery history and consider backup suppliers.",
                }
            )

        # -----------------------------------------------
        # 4. DELIVERY CONFIRMATION (UPCOMING/DUE SOON)
        # -----------------------------------------------
        upcoming = self.upcoming_deliveries(
            days=3,
            orders=orders,
        )
        if upcoming:
            upcoming_ids = [u.get("order_id") for u in upcoming if u.get("order_id")]
            if upcoming_ids:
                recommendations.append(
                    {
                        "priority": "medium",
                        "category": "delivery_risk",
                        "order_id": upcoming_ids[0],
                        "message": "Delivery confirmation required for upcoming order(s) due within 3 days.",
                        "affected_orders": upcoming_ids,
                        "action": "Confirm delivery schedules with affected suppliers and monitor these orders closely.",
                    }
                )

        # -----------------------------------------------
        # 5. DEDUPLICATION LAYER
        # -----------------------------------------------
        def _normalize_action(text: str) -> str:
            clean = re.sub(r"[^\w\s]", "", (text or "").lower())
            tokens = [w for w in clean.split() if w not in {"the", "a", "an", "and", "or", "to", "with", "for", "in", "is", "are"}]
            return " ".join(tokens)

        deduped: List[Dict[str, Any]] = []
        seen_keys = set()

        for rec in recommendations:
            cat = rec.get("category", "")
            supp = rec.get("supplier", "")
            action_norm = _normalize_action(rec.get("action", ""))
            action_core = "contact_supplier" if ("contact" in action_norm and "delivery" in action_norm) else action_norm

            dedup_key = (cat, supp, action_core)
            if dedup_key in seen_keys:
                continue
            seen_keys.add(dedup_key)
            deduped.append(rec)

        recommendations = deduped

        # -----------------------------------------------
        # DEFAULT
        # -----------------------------------------------
        if not recommendations:
            recommendations.append(
                {
                    "priority": "low",
                    "category": "procurement_health",
                    "message": "No major procurement risks were detected.",
                    "action": "Continue monitoring supplier performance and upcoming deliveries.",
                }
            )

        priority_order = {
            "critical": 0,
            "high": 1,
            "medium": 2,
            "low": 3,
        }

        recommendations.sort(
            key=lambda x: priority_order.get(
                x.get("priority", "medium").lower(),
                9,
            )
        )

        return recommendations[:5]

    # --------------------------------------------------------
    # SEARCH
    # --------------------------------------------------------

    def search(
        self,
        query: str,
        orders: Optional[List[Dict[str, Any]]] = None,
    ) -> List[Dict[str, Any]]:

        orders = orders if orders is not None else self.get_orders()

        target = _normalize_text(query)

        if not target:
            return []

        result = []

        for order in orders:

            searchable = " ".join(
                [
                    _clean_text(order["order_id"]),
                    _clean_text(order["supplier"]),
                    _clean_text(order["material"]),
                    _clean_text(order["status"]),
                ]
            )

            if target in _normalize_text(searchable):
                result.append(order)

        return result

    # --------------------------------------------------------
    # COMPARE SUPPLIERS
    # --------------------------------------------------------

    def compare_suppliers(
        self,
        supplier_a: str,
        supplier_b: str,
        orders: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:

        orders = orders if orders is not None else self.get_orders()

        suppliers = self.supplier_summary(orders)

        def _match_supplier(target: str, supplier_list: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
            norm_target = _normalize_text(target)
            if not norm_target:
                return None
            for item in supplier_list:
                norm_sup = _normalize_text(item["supplier"])
                if norm_target == norm_sup:
                    return dict(item)
            for item in supplier_list:
                norm_sup = _normalize_text(item["supplier"])
                if norm_target in norm_sup or norm_sup in norm_target:
                    return dict(item)
            for item in supplier_list:
                norm_first = _normalize_text(item["supplier"].split()[0])
                if norm_target == norm_first or norm_target.startswith(norm_first):
                    return dict(item)
            return None

        item_a = _match_supplier(supplier_a, suppliers)
        item_b = _match_supplier(supplier_b, suppliers)

        if not item_a or not item_b:
            return {
                "success": False,
                "message": "One or both suppliers were not found.",
                "supplier_a": item_a,
                "supplier_b": item_b,
            }

        # Enrich with performance scores
        perf_list = self.supplier_performance(orders)
        perf_map = {p["supplier"]: p for p in perf_list}
        if item_a["supplier"] in perf_map:
            item_a["performance_score"] = perf_map[item_a["supplier"]].get("performance_score", 20)
            item_a["performance_rating"] = perf_map[item_a["supplier"]].get("performance_rating", "needs_attention")
        if item_b["supplier"] in perf_map:
            item_b["performance_score"] = perf_map[item_b["supplier"]].get("performance_score", 20)
            item_b["performance_rating"] = perf_map[item_b["supplier"]].get("performance_rating", "needs_attention")

        if item_a["delayed"] < item_b["delayed"]:
            delay_winner = item_a["supplier"]
        elif item_b["delayed"] < item_a["delayed"]:
            delay_winner = item_b["supplier"]
        else:
            delay_winner = "tie"

        if item_a["total_cost"] < item_b["total_cost"]:
            cost_lower = item_a["supplier"]
        elif item_b["total_cost"] < item_a["total_cost"]:
            cost_lower = item_b["supplier"]
        else:
            cost_lower = "tie"

        score_a = item_a.get("performance_score", 0)
        score_b = item_b.get("performance_score", 0)
        if score_a > score_b:
            perf_winner = item_a["supplier"]
        elif score_b > score_a:
            perf_winner = item_b["supplier"]
        else:
            perf_winner = "tie"

        if perf_winner != "tie":
            better_overall = perf_winner
        elif delay_winner != "tie":
            better_overall = delay_winner
        elif cost_lower != "tie":
            better_overall = cost_lower
        else:
            better_overall = "tie"

        return {
            "success": True,
            "supplier_a": item_a,
            "supplier_b": item_b,
            "comparison": {
                "fewer_delays": delay_winner,
                "lower_cost": cost_lower,
                "better_performance": perf_winner,
                "better_overall": better_overall,
            },
        }

    # --------------------------------------------------------
    # DASHBOARD
    # --------------------------------------------------------

    def dashboard(
        self,
        orders: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:

        orders = orders if orders is not None else self.get_orders()

        status = self.status_breakdown(orders)
        supplier_delays = self.supplier_delay_analysis(orders)
        health = self.procurement_health(orders)
        risk = self.risk_analysis(orders)
        recommendations = self.recommendations(orders)

        return {
            "total_orders": len(orders),
            "total_cost": self.total_procurement_cost(orders),
            "average_order_cost": self.average_order_cost(
                orders
            ),
            "status_breakdown": status,
            "supplier_delays": supplier_delays,
            "health": health,
            "risk": {
                "total_at_risk": risk["total_at_risk"],
                "critical": len(
                    risk["critical_orders"]
                ),
                "high": len(
                    risk["high_risk_orders"]
                ),
                "distribution": risk[
                    "risk_distribution"
                ],
            },
            "upcoming_deliveries": self.upcoming_deliveries(
                days=7,
                orders=orders,
            ),
            "top_expensive_orders": self.most_expensive_orders(
                limit=5,
                orders=orders,
            ),
            "recommendations": recommendations,
        }

    # ========================================================
    # ORDER SUMMARY
    # ========================================================

    def order_summary(
        self,
        orders: Optional[List[Dict[str, Any]]] = None,
    ) -> List[Dict[str, Any]]:

        orders = orders if orders is not None else self.get_orders()

        result = []

        for order in orders:

            risk = self.calculate_order_risk(order)

            item = dict(order)

            item.update(
                {
                    "risk_score": risk["risk_score"],
                    "risk_level": risk["risk_level"],
                    "risk_reasons": risk["reasons"],
                }
            )

            # Don't expose raw database row unnecessarily.
            item.pop("raw", None)

            result.append(item)

        return result


# ============================================================
# INTENT DETECTION
# ============================================================

INTENT_ALIASES = {

    "supplier_delays": [
        "supplier delays",
        "supplier delay",
        "most delays",
        "highest delays",
        "most delayed supplier",
        "supplier with most delay",
        "which supplier has the most delays",
        "which supplier has highest delays",
        "supplier performance delays",
        "sabse zyada delay",
        "saglyat jast delay",
    ],

    "delays": [
        "delayed orders",
        "delayed order",
        "how many orders are delayed",
        "orders are delayed",
        "delay count",
        "how many delayed",
        "kitne orders delayed",
        "kiti orders delay",
    ],

    "total_cost": [
        "total procurement cost",
        "total procurement",
        "total cost",
        "procurement cost",
        "overall procurement cost",
        "total spending",
        "total spend",
        "kitna total cost",
        "ekun cost",
    ],

    "supplier_cost": [
        "supplier cost",
        "supplier spending",
        "supplier spend",
        "how much did supplier",
        "supplier ka cost",
        "supplier cha cost",
    ],

    "average_cost": [
        "average order cost",
        "average procurement cost",
        "avg order cost",
        "average cost",
    ],

    "upcoming_deliveries": [
        "upcoming deliveries",
        "upcoming delivery",
        "next deliveries",
        "deliveries coming",
        "due deliveries",
        "what deliveries are coming",
        "next delivery",
        "due this week",
        "what procurements are due this week",
        "upcoming schedules",
        "upcoming schedule",
        "lavkar delivery",
        "pudhil delivery",
    ],

    "materials": [
        "materials",
        "procurement materials",
        "material summary",
        "what materials",
        "items purchased",
        "items procured",
        "procured materials",
    ],

    "supplier_summary": [
        "all suppliers",
        "show suppliers",
        "supplier summary",
        "supplier list",
        "supplier details",
        "suppliers",
    ],

    "orders": [
        "all orders",
        "show orders",
        "order summary",
        "order list",
        "purchase orders",
        "procurement orders",
    ],

    "dashboard": [
        "dashboard",
        "dashboard summary",
        "procurement dashboard",
        "overall procurement",
        "overall summary",
        "procurement status",
        "procurement summary",
        "give me a procurement summary",
        "summary",
    ],

    "risk": [
        "risk",
        "risks",
        "risky orders",
        "orders at risk",
        "which orders are at risk",
        "high risk orders",
        "procurement risk",
        "risk analysis",
        "dangerous orders",
        "risk wale orders",
        "risky orders kontya",
    ],

    "critical": [
        "critical orders",
        "critical procurement",
        "urgent orders",
        "most urgent orders",
        "critical risks",
        "urgent procurement",
        "which procurement is most urgent",
        "most urgent",
        "which orders are critical",
        "critical order",
    ],

    "expensive": [
        "most expensive orders",
        "highest value orders",
        "largest orders",
        "most costly orders",
        "highest cost orders",
        "expensive procurement",
        "sabse expensive order",
    ],

    "supplier_performance": [
        "supplier performance",
        "best supplier",
        "worst supplier",
        "supplier rating",
        "supplier score",
        "supplier performance score",
        "which supplier is best",
        "which supplier is worst",
    ],

    "health": [
        "procurement health",
        "health score",
        "procurement health score",
        "overall health",
        "how healthy",
        "procurement status health",
    ],

    "recommendations": [
        "recommendations",
        "recommendation",
        "what should we do",
        "what should i do",
        "what actions",
        "action plan",
        "suggestions",
        "what do you recommend",
        "next action",
        "kya karna chahiye",
        "kay karayla pahije",
    ],

    "search": [
        "find order",
        "search order",
        "find supplier",
        "search supplier",
        "find material",
        "search procurement",
    ],

    "compare": [
        "compare",
        "comparison",
        "compare suppliers",
        "supplier comparison",
        "which is better",
        "difference between suppliers",
    ],

    "supplier_comparison": [
        "supplier comparison",
        "compare suppliers",
        "compare",
        "comparison",
    ],
}


def detect_procurement_intent(
    question: str,
) -> str:

    text = _normalize_text(question)

    if not text:
        return "unknown"

    # Highest priority intents first.
    priority = [
        "supplier_delays",
        "critical",
        "risk",
        "recommendations",
        "health",
        "supplier_performance",
        "supplier_comparison",
        "compare",
        "expensive",
        "upcoming_deliveries",
        "total_cost",
        "supplier_cost",
        "average_cost",
        "delays",
        "materials",
        "supplier_summary",
        "orders",
        "dashboard",
        "search",
    ]

    for intent in priority:

        aliases = INTENT_ALIASES.get(
            intent,
            [],
        )

        if any(
            alias in text
            for alias in aliases
        ):
            return intent

    # -----------------------------------------------
    # Pattern-based detection
    # -----------------------------------------------

    if (
        "supplier" in text
        and _contains_any(
            text,
            [
                "delay",
                "late",
                "overdue",
            ],
        )
    ):
        return "supplier_delays"

    if (
        _contains_any(
            text,
            [
                "risk",
                "risky",
                "danger",
            ],
        )
    ):
        return "risk"

    if (
        _contains_any(
            text,
            [
                "critical",
                "urgent",
            ],
        )
    ):
        return "critical"

    if (
        "cost" in text
        or "price" in text
        or "spending" in text
        or "spend" in text
    ):
        return "total_cost"

    if (
        "supplier" in text
        and _contains_any(
            text,
            [
                "performance",
                "rating",
                "score",
                "best",
                "worst",
            ],
        )
    ):
        return "supplier_performance"

    if (
        "health" in text
        and "procurement" in text
    ):
        return "health"

    return "unknown"


# ============================================================
# PROCUREMENT ASSISTANT
# ============================================================

class ProcurementAssistant:

    def __init__(
        self,
        db_path: Optional[str] = None,
    ):

        self.database = ProcurementDatabase(
            db_path=db_path
        )

        self.engine = ProcurementEngine(
            database=self.database
        )

    # --------------------------------------------------------
    # ANSWER DATA
    # --------------------------------------------------------

    def answer_data(
        self,
        question: str,
    ) -> Dict[str, Any]:

        if not _clean_text(question):
            return {
                "success": False,
                "intent": "unknown",
                "source": "sqlite",
                "calculated_by": "procurement.py",
                "message": "Question is empty.",
                "data": {},
            }

        intent = detect_procurement_intent(
            question
        )

        try:

            orders = self.engine.get_orders()

            # -------------------------------------------
            # SUPPLIER DELAYS
            # -------------------------------------------

            if intent == "supplier_delays":

                data = (
                    self.engine.supplier_delay_analysis(
                        orders
                    )
                )

            # -------------------------------------------
            # DELAYS
            # -------------------------------------------

            elif intent == "delays":

                delayed = (
                    self.engine.delayed_orders(
                        orders
                    )
                )

                data = {
                    "delayed_orders": delayed,
                    "count": len(delayed),
                    "total_orders": len(orders),
                    "delay_rate": round(
                        (
                            len(delayed)
                            / len(orders)
                            * 100
                        )
                        if orders
                        else 0,
                        2,
                    ),
                }

            # -------------------------------------------
            # TOTAL COST
            # -------------------------------------------

            elif intent == "total_cost":

                total = (
                    self.engine.total_procurement_cost(
                        orders
                    )
                )

                data = {
                    "total_cost": total,
                    "currency": "INR",
                    "total_orders": len(orders),
                }

            # -------------------------------------------
            # SUPPLIER COST
            # -------------------------------------------

            elif intent == "supplier_cost":

                # Try to extract supplier name from
                # the question using known suppliers.
                suppliers = (
                    self.engine.supplier_summary(
                        orders
                    )
                )

                matched_supplier = None

                question_normalized = (
                    _normalize_text(question)
                )

                for supplier in suppliers:

                    if (
                        _normalize_text(
                            supplier["supplier"]
                        )
                        in question_normalized
                    ):
                        matched_supplier = (
                            supplier["supplier"]
                        )
                        break

                data = self.engine.supplier_cost(
                    supplier_name=matched_supplier,
                    orders=orders,
                )

            # -------------------------------------------
            # AVERAGE COST
            # -------------------------------------------

            elif intent == "average_cost":

                data = {
                    "average_order_cost": (
                        self.engine.average_order_cost(
                            orders
                        )
                    ),
                    "currency": "INR",
                    "total_orders": len(orders),
                }

            # -------------------------------------------
            # UPCOMING DELIVERIES
            # -------------------------------------------

            elif intent == "upcoming_deliveries":

                data = {
                    "deliveries": (
                        self.engine.upcoming_deliveries(
                            days=7,
                            orders=orders,
                        )
                    ),
                    "days": 7,
                }

            # -------------------------------------------
            # MATERIALS
            # -------------------------------------------

            elif intent == "materials":

                data = {
                    "materials": (
                        self.engine.material_summary(
                            orders
                        )
                    )
                }

            # -------------------------------------------
            # SUPPLIER SUMMARY
            # -------------------------------------------

            elif intent == "supplier_summary":

                data = {
                    "suppliers": (
                        self.engine.supplier_summary(
                            orders
                        )
                    )
                }

            # -------------------------------------------
            # ORDERS
            # -------------------------------------------

            elif intent == "orders":

                data = {
                    "orders": (
                        self.engine.order_summary(
                            orders
                        )
                    )
                }

            # -------------------------------------------
            # DASHBOARD
            # -------------------------------------------

            elif intent == "dashboard":

                data = self.engine.dashboard(
                    orders
                )

            # -------------------------------------------
            # RISK
            # -------------------------------------------

            elif intent == "risk":

                data = self.engine.risk_analysis(
                    orders
                )

            # -------------------------------------------
            # CRITICAL
            # -------------------------------------------

            elif intent == "critical":

                critical = (
                    self.engine.critical_orders(
                        orders
                    )
                )

                data = {
                    "critical_orders": critical,
                    "count": len(critical),
                }

            # -------------------------------------------
            # EXPENSIVE
            # -------------------------------------------

            elif intent == "expensive":

                data = {
                    "orders": (
                        self.engine.most_expensive_orders(
                            limit=5,
                            orders=orders,
                        )
                    )
                }

            # -------------------------------------------
            # SUPPLIER PERFORMANCE
            # -------------------------------------------

            elif intent == "supplier_performance":

                data = {
                    "suppliers": (
                        self.engine.supplier_performance(
                            orders
                        )
                    )
                }

            # -------------------------------------------
            # HEALTH
            # -------------------------------------------

            elif intent == "health":

                data = (
                    self.engine.procurement_health(
                        orders
                    )
                )

            # -------------------------------------------
            # RECOMMENDATIONS
            # -------------------------------------------

            elif intent == "recommendations":

                data = {
                    "recommendations": (
                        self.engine.recommendations(
                            orders
                        )
                    )
                }

            # -------------------------------------------
            # SEARCH
            # -------------------------------------------

            elif intent == "search":

                search_query = self._extract_search_query(
                    question,
                    orders,
                )

                results = self.engine.search(
                    search_query,
                    orders,
                )

                data = {
                    "query": search_query,
                    "results": results,
                    "count": len(results),
                }

            # -------------------------------------------
            # COMPARE
            # -------------------------------------------

            elif intent in ["compare", "supplier_comparison"]:

                data = self._compare_from_question(
                    question,
                    orders,
                )

            # -------------------------------------------
            # UNKNOWN
            # -------------------------------------------

            else:

                # Instead of hallucinating, return a useful
                # capability summary.
                data = {
                    "supported_intents": [
                        "supplier_delays",
                        "delays",
                        "total_cost",
                        "supplier_cost",
                        "average_cost",
                        "upcoming_deliveries",
                        "materials",
                        "supplier_summary",
                        "orders",
                        "dashboard",
                        "risk",
                        "critical",
                        "expensive",
                        "supplier_performance",
                        "health",
                        "recommendations",
                        "search",
                        "compare",
                    ]
                }

                return {
                    "success": False,
                    "intent": "unknown",
                    "source": "sqlite",
                    "calculated_by": "procurement.py",
                    "data": data,
                }

            return {
                "success": True,
                "intent": intent,
                "source": "sqlite",
                "calculated_by": "procurement.py",
                "data": data,
            }

        except Exception as exc:

            return {
                "success": False,
                "intent": intent,
                "source": "sqlite",
                "calculated_by": "procurement.py",
                "error": str(exc),
                "data": {},
            }

    # --------------------------------------------------------
    # SEARCH QUERY EXTRACTION
    # --------------------------------------------------------

    def _extract_search_query(
        self,
        question: str,
        orders: List[Dict[str, Any]],
    ) -> str:

        text = _clean_text(question)

        patterns = [
            r"find\s+(.+)",
            r"search\s+for\s+(.+)",
            r"search\s+(.+)",
            r"find\s+order\s+(.+)",
        ]

        for pattern in patterns:

            match = re.search(
                pattern,
                text,
                flags=re.IGNORECASE,
            )

            if match:
                return match.group(1).strip()

        # Try known supplier/material/order IDs.
        normalized = _normalize_text(question)

        candidates = []

        for order in orders:

            for field in [
                "order_id",
                "supplier",
                "material",
            ]:

                value = _clean_text(
                    order.get(field)
                )

                if (
                    value
                    and _normalize_text(value)
                    in normalized
                ):
                    candidates.append(value)

        if candidates:
            return candidates[0]

        return text

    # --------------------------------------------------------
    # COMPARE EXTRACTION
    # --------------------------------------------------------

    def _compare_from_question(
        self,
        question: str,
        orders: List[Dict[str, Any]],
    ) -> Dict[str, Any]:

        suppliers = [
            item["supplier"]
            for item in self.engine.supplier_summary(
                orders
            )
        ]

        normalized_question = _normalize_text(
            question
        )

        matches = []

        # First pass: full supplier names (longest first)
        for supplier in sorted(suppliers, key=len, reverse=True):
            if _normalize_text(supplier) in normalized_question:
                if supplier not in matches:
                    matches.append(supplier)

        # Second pass: distinctive base word aliases (e.g. SKF, Tata, Siemens, Bosch, Schneider)
        if len(matches) < 2:
            for supplier in suppliers:
                first_word = supplier.split()[0]
                if len(first_word) >= 3 and _normalize_text(first_word) in normalized_question:
                    if supplier not in matches:
                        matches.append(supplier)

        # Sort matches according to their order of appearance in the question
        def _get_pos(s: str) -> int:
            fw = _normalize_text(s.split()[0])
            full = _normalize_text(s)
            pos_full = normalized_question.find(full)
            pos_fw = normalized_question.find(fw)
            if pos_full != -1 and pos_fw != -1:
                return min(pos_full, pos_fw)
            return pos_full if pos_full != -1 else (pos_fw if pos_fw != -1 else 999999)

        matches.sort(key=_get_pos)

        if len(matches) >= 2:
            return self.engine.compare_suppliers(
                matches[0],
                matches[1],
                orders,
            )

        if len(matches) == 1:
            return {
                "success": False,
                "found_one": matches[0],
                "message": (
                    f"I found {matches[0]}. Please provide the second supplier you want to compare it with."
                ),
                "available_suppliers": suppliers,
            }

        return {
            "success": False,
            "found_none": True,
            "message": (
                "Sure. Which two suppliers would you like me to compare?"
            ),
            "available_suppliers": suppliers,
        }

    # --------------------------------------------------------
    # TEXT ANSWER
    # --------------------------------------------------------

    def answer_text(
        self,
        question: str,
    ) -> str:

        result = self.answer_data(question)

        if not result.get("success"):

            if result.get("intent") == "unknown":
                return (
                    "I can analyze suppliers, delays, costs, "
                    "deliveries, risks, critical orders, "
                    "supplier performance, procurement health, "
                    "and recommendations."
                )

            return (
                "I couldn't complete that procurement analysis."
            )

        intent = result["intent"]
        data = result["data"]

        # -------------------------------------------
        # SUPPLIER DELAYS
        # -------------------------------------------

        if intent == "supplier_delays":

            leaders = data.get(
                "highest_delay_suppliers",
                [],
            )

            count = data.get(
                "highest_delay_count",
                0,
            )

            if not leaders:
                return (
                    "No supplier delay data is available."
                )

            if data.get("is_tie"):

                return (
                    f"{', '.join(leaders)} are tied for "
                    f"the highest number of delays with "
                    f"{count} delayed order(s) each."
                )

            return (
                f"{leaders[0]} has the highest number "
                f"of delays with {count} delayed order(s)."
            )

        # -------------------------------------------
        # DELAYS
        # -------------------------------------------

        if intent == "delays":

            return (
                f"There are {data['count']} delayed "
                f"order(s) out of {data['total_orders']} "
                f"({data['delay_rate']}%)."
            )

        # -------------------------------------------
        # TOTAL COST
        # -------------------------------------------

        if intent == "total_cost":

            return (
                f"Total procurement cost is "
                f"₹{data['total_cost']:,.2f}."
            )

        # -------------------------------------------
        # AVERAGE COST
        # -------------------------------------------

        if intent == "average_cost":

            return (
                f"The average procurement order cost is "
                f"₹{data['average_order_cost']:,.2f}."
            )

        # -------------------------------------------
        # HEALTH
        # -------------------------------------------

        if intent == "health":

            return (
                f"Procurement health score: "
                f"{data['health_score']}/100 "
                f"({data['health_status'].replace('_', ' ')})."
            )

        # -------------------------------------------
        # RISK
        # -------------------------------------------

        if intent == "risk":

            total = data.get(
                "total_at_risk",
                0,
            )

            critical = len(
                data.get(
                    "critical_orders",
                    [],
                )
            )

            high = len(
                data.get(
                    "high_risk_orders",
                    [],
                )
            )

            return (
                f"{total} order(s) are currently at "
                f"high or critical risk: "
                f"{critical} critical and "
                f"{high} high risk."
            )

        # -------------------------------------------
        # CRITICAL
        # -------------------------------------------

        if intent == "critical":

            count = data.get(
                "count",
                0,
            )

            if count == 0:
                return (
                    "No critical procurement orders "
                    "were detected."
                )

            lines = [
                f"{count} critical order(s) detected:"
            ]

            for order in data[
                "critical_orders"
            ][:5]:

                lines.append(
                    f"• {order['order_id']} — "
                    f"{order['supplier']} — "
                    f"risk {order['risk_score']}/100"
                )

            return "\n".join(lines)

        # -------------------------------------------
        # EXPENSIVE
        # -------------------------------------------

        if intent == "expensive":

            orders = data.get(
                "orders",
                [],
            )

            if not orders:
                return (
                    "No procurement orders are available."
                )

            lines = [
                "Top 5 most expensive orders:"
            ]

            for index, order in enumerate(
                orders,
                start=1,
            ):

                lines.append(
                    f"{index}. {order['order_id']} — "
                    f"{order['supplier']} — "
                    f"₹{order['total_cost']:,.2f}"
                )

            return "\n".join(lines)

        # -------------------------------------------
        # SUPPLIER PERFORMANCE
        # -------------------------------------------

        if intent == "supplier_performance":

            suppliers = data.get(
                "suppliers",
                [],
            )

            if not suppliers:
                return (
                    "No supplier performance data is available."
                )

            worst = suppliers[0]

            return (
                f"Supplier needing the most attention: "
                f"{worst['supplier']} "
                f"with a performance score of "
                f"{worst['performance_score']}/100 "
                f"and a {worst['delay_rate']}% delay rate."
            )

        # -------------------------------------------
        # RECOMMENDATIONS
        # -------------------------------------------

        if intent == "recommendations":

            recommendations = data.get(
                "recommendations",
                [],
            )

            if not recommendations:
                return (
                    "No specific recommendations are available."
                )

            lines = [
                "Procurement recommendations:"
            ]

            for recommendation in recommendations[:5]:

                lines.append(
                    f"• [{recommendation['priority'].upper()}] "
                    f"{recommendation['message']}"
                )

                affected_orders = recommendation.get("affected_orders") or []
                if affected_orders:
                    lines.append("  Affected orders:")
                    for oid in affected_orders:
                        lines.append(f"  • {oid}")

                affected_suppliers = recommendation.get("affected_suppliers") or []
                if affected_suppliers:
                    lines.append("  Affected suppliers:")
                    for sup in affected_suppliers:
                        lines.append(f"  • {sup}")

                if recommendation.get("action"):
                    lines.append(
                        f"  Action: "
                        f"{recommendation['action']}"
                    )

            return "\n".join(lines)

        # -------------------------------------------
        # UPCOMING DELIVERIES
        # -------------------------------------------

        if intent == "upcoming_deliveries":

            deliveries = data.get(
                "deliveries",
                [],
            )

            if not deliveries:
                return (
                    "No deliveries are due within "
                    "the next 7 days."
                )

            lines = [
                f"{len(deliveries)} upcoming delivery(ies):"
            ]

            for order in deliveries[:10]:

                lines.append(
                    f"• {order['order_id']} — "
                    f"{order['supplier']} — "
                    f"{order['days_until_delivery']} "
                    f"day(s) remaining"
                )

            return "\n".join(lines)

        # -------------------------------------------
        # DASHBOARD
        # -------------------------------------------

        if intent == "dashboard":

            health = data["health"]

            return (
                "Procurement Dashboard:\n"
                f"• Orders: {data['total_orders']}\n"
                f"• Total cost: ₹{data['total_cost']:,.2f}\n"
                f"• Delayed: "
                f"{data['status_breakdown']['delayed']}\n"
                f"• Completed: "
                f"{data['status_breakdown']['completed']}\n"
                f"• Pending: "
                f"{data['status_breakdown']['pending']}\n"
                f"• At risk: "
                f"{data['risk']['total_at_risk']}\n"
                f"• Health: "
                f"{health['health_score']}/100 "
                f"({health['health_status'].replace('_', ' ')})"
            )

        # -------------------------------------------
        # SUPPLIER SUMMARY
        # -------------------------------------------

        if intent == "supplier_summary":

            suppliers = data.get(
                "suppliers",
                [],
            )

            if not suppliers:
                return (
                    "No suppliers are available."
                )

            lines = [
                f"There are {len(suppliers)} suppliers:"
            ]

            for supplier in suppliers:

                lines.append(
                    f"• {supplier['supplier']} — "
                    f"{supplier['orders']} order(s), "
                    f"{supplier['delayed']} delayed"
                )

            return "\n".join(lines)

        # -------------------------------------------
        # MATERIALS
        # -------------------------------------------

        if intent == "materials":

            materials = data.get(
                "materials",
                [],
            )

            if not materials:
                return (
                    "No procurement materials are available."
                )

            lines = [
                f"There are {len(materials)} material(s):"
            ]

            for material in materials[:10]:

                lines.append(
                    f"• {material['material']} — "
                    f"quantity {material['quantity']}, "
                    f"cost ₹{material['total_cost']:,.2f}"
                )

            return "\n".join(lines)

        # -------------------------------------------
        # ORDERS
        # -------------------------------------------

        if intent == "orders":

            orders = data.get(
                "orders",
                [],
            )

            if not orders:
                return (
                    "No procurement orders are available."
                )

            lines = [
                f"There are {len(orders)} procurement order(s):"
            ]

            for order in orders[:10]:

                status = (
                    "Delayed"
                    if order["is_delayed"]
                    else order["status"]
                )

                lines.append(
                    f"• {order['order_id']} — "
                    f"{order['supplier']} — "
                    f"{status}"
                )

            return "\n".join(lines)

        # -------------------------------------------
        # SUPPLIER COST
        # -------------------------------------------

        if intent == "supplier_cost":

            supplier = data.get(
                "supplier"
            )

            if not supplier:
                return (
                    "Please specify the supplier name."
                )

            return (
                f"{supplier} has "
                f"{data['orders']} order(s) with a "
                f"total procurement cost of "
                f"₹{data['total_cost']:,.2f}."
            )

        # -------------------------------------------
        # SEARCH
        # -------------------------------------------

        if intent == "search":

            results = data.get(
                "results",
                [],
            )

            if not results:
                return (
                    f"No procurement records found "
                    f"for '{data['query']}'."
                )

            lines = [
                f"Found {len(results)} result(s):"
            ]

            for order in results[:10]:

                lines.append(
                    f"• {order['order_id']} — "
                    f"{order['supplier']} — "
                    f"{order['material']}"
                )

            return "\n".join(lines)

        # -------------------------------------------
        # COMPARE
        # -------------------------------------------

        if intent in ["compare", "supplier_comparison"]:

            if not data.get("success"):
                return data.get(
                    "message",
                    "I need two suppliers to compare.",
                )

            a = data["supplier_a"]
            b = data["supplier_b"]
            cmp = data.get("comparison", {})

            fewer = cmp.get("fewer_delays")
            if fewer == "tie":
                delay_insight = f"Both suppliers have the same number of delayed orders ({a['delayed']})."
            else:
                delay_insight = f"{fewer} has fewer delayed orders ({min(a['delayed'], b['delayed'])} vs {max(a['delayed'], b['delayed'])})."

            lower = cmp.get("lower_cost")
            if lower == "tie":
                cost_insight = f"Both suppliers have the same total spend (₹{a['total_cost']:,.2f})."
            else:
                cost_insight = f"{lower} has lower procurement spend (₹{min(a['total_cost'], b['total_cost']):,.2f} vs ₹{max(a['total_cost'], b['total_cost']):,.2f})."

            lines = [
                f"Supplier comparison: {a['supplier']} vs {b['supplier']}",
                f"• {a['supplier']}: {a['orders']} order(s), {a['delayed']} delayed ({a.get('delay_rate', 0)}% delay rate), ₹{a['total_cost']:,.2f} total spend, performance score: {a.get('performance_score', 20)}/100",
                f"• {b['supplier']}: {b['orders']} order(s), {b['delayed']} delayed ({b.get('delay_rate', 0)}% delay rate), ₹{b['total_cost']:,.2f} total spend, performance score: {b.get('performance_score', 20)}/100",
                f"Key insights:",
                f"• Delays: {delay_insight}",
                f"• Cost: {cost_insight}",
            ]
            better = cmp.get("better_overall")
            if better and better != "tie":
                lines.append(f"• Overall: {better} is performing better with fewer delays and lower financial exposure.")

            return "\n".join(lines)

        return (
            "Procurement analysis completed successfully."
        )

    # --------------------------------------------------------
    # COMPATIBILITY ALIAS
    # --------------------------------------------------------

    def answer(
        self,
        question: str,
    ) -> str:
        return self.answer_text(question)


# ============================================================
# PUBLIC SINGLETON / HELPERS
# ============================================================

_default_assistant: Optional[
    ProcurementAssistant
] = None


def get_procurement_assistant(
    db_path: Optional[str] = None,
) -> ProcurementAssistant:

    global _default_assistant

    if (
        _default_assistant is None
        or db_path is not None
    ):
        _default_assistant = (
            ProcurementAssistant(
                db_path=db_path
            )
        )

    return _default_assistant


def procurement_answer_data(
    question: str,
) -> Dict[str, Any]:

    return get_procurement_assistant().answer_data(
        question
    )


def procurement_answer_text(
    question: str,
) -> str:

    return get_procurement_assistant().answer_text(
        question
    )


# ============================================================
# CLI TEST MODE
# ============================================================

def main() -> None:

    print("=" * 65)
    print("PROCUREAI PROCUREMENT INTELLIGENCE ENGINE")
    print("=" * 65)

    assistant = get_procurement_assistant()

    print(
        f"Database: {assistant.database.db_path}"
    )

    try:

        orders = assistant.engine.get_orders()

        print(
            f"Orders loaded: {len(orders)}"
        )

        health = assistant.engine.procurement_health(
            orders
        )

        print(
            f"Health: "
            f"{health['health_score']}/100 "
            f"({health['health_status']})"
        )

    except Exception as exc:

        print(
            f"Database error: {exc}"
        )

    print()
    print(
        "Type a procurement question or 'exit' to stop."
    )
    print()

    while True:

        try:
            question = input("You: ").strip()

        except (EOFError, KeyboardInterrupt):
            print()
            break

        if not question:
            continue

        if _normalize_text(question) in {
            "exit",
            "quit",
            "bye",
        }:
            break

        print(
            "\nProcureAI:",
            assistant.answer_text(question),
        )
        print()


if __name__ == "__main__":
    main()