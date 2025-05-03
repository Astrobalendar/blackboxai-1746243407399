from typing import List
from apps.backend.models import AdminStatsSummary, AdminPredictionOut, AdminPaymentOut
from apps.backend.storage import load_predictions, load_payments, load_users, load_clients

def get_admin_stats_summary() -> AdminStatsSummary:
    users = load_users()
    clients = load_clients()
    predictions = load_predictions()
    payments = load_payments()

    total_revenue = sum(payment.get("amount", 0) for payment in payments)

    return AdminStatsSummary(
        total_users=len(users),
        total_clients=len(clients),
        total_predictions=len(predictions),
        total_revenue=total_revenue,
    )

def get_admin_predictions(page: int = 1, page_size: int = 20) -> List[AdminPredictionOut]:
    predictions = load_predictions()
    start = (page - 1) * page_size
    end = start + page_size
    paged = predictions[start:end]
    return [AdminPredictionOut(**pred) for pred in paged]

def get_admin_payments(page: int = 1, page_size: int = 20) -> List[AdminPaymentOut]:
    payments = load_payments()
    start = (page - 1) * page_size
    end = start + page_size
    paged = payments[start:end]
    return [AdminPaymentOut(**payment) for payment in paged]

def get_admin_users(page: int = 1, page_size: int = 20):
    users = load_users()
    start = (page - 1) * page_size
    end = start + page_size
    return users[start:end]

def get_admin_clients(page: int = 1, page_size: int = 20):
    clients = load_clients()
    start = (page - 1) * page_size
    end = start + page_size
    return clients[start:end]
