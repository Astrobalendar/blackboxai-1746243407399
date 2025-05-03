import stripe
from datetime import datetime
from typing import Optional
from apps.backend.models import PaymentRequest, PaymentResult

stripe.api_key = "sk_test_your_test_key_here"  # Replace with your Stripe test secret key

def create_checkout_session(payment_request: PaymentRequest) -> str:
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': payment_request.currency,
                    'product_data': {
                        'name': payment_request.description or 'AstroBalendar Prediction',
                    },
                    'unit_amount': int(payment_request.amount * 100),
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url='https://yourdomain.com/payment-success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url='https://yourdomain.com/payment-cancel',
        )
        return session.id
    except Exception as e:
        raise e

def verify_payment(session_id: str) -> Optional[PaymentResult]:
    try:
        session = stripe.checkout.Session.retrieve(session_id)
        if session.payment_status == 'paid':
            payment = PaymentResult(
                payment_id=session.id,
                status=session.payment_status,
                amount=session.amount_total / 100,
                currency=session.currency,
                client_id=session.metadata.get('client_id', ''),
                created_at=datetime.fromtimestamp(session.created),
            )
            # TODO: Update prediction/client records with payment info
            return payment
        return None
    except Exception as e:
        raise e

def initiate_upi_payment():
    # Placeholder for UPI payment initiation logic
    pass
