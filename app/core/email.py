from __future__ import annotations

import logging
from datetime import datetime
from typing import Iterable

import requests

from app.core.config import settings
from app.models.search import ItineraryOption, SearchRequest

logger = logging.getLogger(__name__)

SENDGRID_API_URL = "https://api.sendgrid.com/v3/mail/send"


def send_email(to_email: str, subject: str, html_body: str) -> None:
    """Send an email using SendGrid.

    If EMAIL_API_KEY is not set, the function will log and skip sending.
    Any errors while sending are logged but will not raise to the caller.
    """

    if not settings.email_api_key:
        logger.info("Skipping email to %s; EMAIL_API_KEY not configured.", to_email)
        return

    payload = {
        "personalizations": [
            {
                "to": [{"email": to_email}],
                "subject": subject,
            }
        ],
        "from": {"email": settings.email_from, "name": "MilesMapped"},
        "content": [
            {
                "type": "text/html",
                "value": html_body,
            }
        ],
    }

    headers = {
        "Authorization": f"Bearer {settings.email_api_key}",
        "Content-Type": "application/json",
    }

    try:
        response = requests.post(SENDGRID_API_URL, headers=headers, json=payload, timeout=10)
        response.raise_for_status()
    except Exception as exc:  # pragma: no cover - best effort logging
        logger.warning("Failed to send email to %s: %s", to_email, exc)


def welcome_email_html(full_name: str) -> str:
    greeting = full_name or "there"
    return f"""
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f5f7fb; padding: 24px; color: #0b1f33;">
        <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 6px 14px rgba(0,0,0,0.06); overflow: hidden;">
          <div style="background: linear-gradient(135deg, #0f6fff, #26c9d9); padding: 20px 28px; color: #ffffff;">
            <h1 style="margin: 0; font-size: 24px;">MilesMapped</h1>
            <p style="margin: 4px 0 0; font-size: 14px; letter-spacing: 0.5px;">Find your perfect award trip</p>
          </div>
          <div style="padding: 28px;">
            <p style="font-size: 16px;">Hi {greeting},</p>
            <p style="font-size: 15px; line-height: 1.6;">
              Welcome to <strong>MilesMapped</strong>! Your travel concierge is ready to turn points and miles into memorable journeys.
              Start a concierge request any time and we'll handle the heavy lifting.
            </p>
            <a href="{settings.dashboard_url}" style="display: inline-block; margin-top: 16px; background: #0f6fff; color: #ffffff; padding: 12px 18px; border-radius: 8px; text-decoration: none; font-weight: 600;">Open dashboard</a>
          </div>
        </div>
      </body>
    </html>
    """


def concierge_request_received_html(user_name: str, search_request: SearchRequest) -> str:
    return f"""
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f5f7fb; padding: 24px; color: #0b1f33;">
        <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 6px 14px rgba(0,0,0,0.06); overflow: hidden;">
          <div style="background: linear-gradient(135deg, #0f6fff, #26c9d9); padding: 20px 28px; color: #ffffff;">
            <h1 style="margin: 0; font-size: 24px;">MilesMapped Concierge</h1>
            <p style="margin: 4px 0 0; font-size: 14px; letter-spacing: 0.5px;">We're on it!</p>
          </div>
          <div style="padding: 28px;">
            <p style="font-size: 16px;">Hi {user_name},</p>
            <p style="font-size: 15px; line-height: 1.6;">Thanks for submitting your trip. We're already searching for the best options.</p>
            <div style="background: #f0f5ff; padding: 16px; border-radius: 10px; margin: 16px 0;">
              <p style="margin: 0 0 8px; font-weight: 600;">Trip snapshot</p>
              <p style="margin: 4px 0;">{search_request.origin} → {search_request.destination}</p>
              <p style="margin: 4px 0;">Departure: {search_request.departure_date}</p>
              <p style="margin: 4px 0;">Return: {search_request.return_date or "One-way"}</p>
              <p style="margin: 4px 0;">Cabin: {search_request.cabin or "Any"} • Travelers: {search_request.passengers}</p>
            </div>
            <p style="font-size: 15px; line-height: 1.6;">We'll email you as soon as options are ready.</p>
            <a href="{settings.dashboard_url}" style="display: inline-block; margin-top: 10px; background: #0f6fff; color: #ffffff; padding: 12px 18px; border-radius: 8px; text-decoration: none; font-weight: 600;">View requests</a>
          </div>
        </div>
      </body>
    </html>
    """


def concierge_request_completed_html(
    user_name: str, search_request: SearchRequest, itineraries: Iterable[ItineraryOption]
) -> str:
    itinerary_rows = "".join(
        _render_itinerary_row(
            option.carrier,
            option.flight_numbers,
            option.departure_time,
            option.arrival_time,
            option.cabin,
            option.cash_price,
            option.points_price,
            option.taxes_and_fees,
        )
        for option in itineraries
    )
    itinerary_table = itinerary_rows or "<p style=\"margin:0;\">Itineraries will appear here once added.</p>"

    return f"""
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f5f7fb; padding: 24px; color: #0b1f33;">
        <div style="max-width: 720px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 6px 14px rgba(0,0,0,0.06); overflow: hidden;">
          <div style="background: linear-gradient(135deg, #0f6fff, #26c9d9); padding: 20px 28px; color: #ffffff;">
            <h1 style="margin: 0; font-size: 24px;">Your MilesMapped options are ready</h1>
            <p style="margin: 4px 0 0; font-size: 14px; letter-spacing: 0.5px;">Here's what we found for {search_request.origin} → {search_request.destination}</p>
          </div>
          <div style="padding: 28px;">
            <p style="font-size: 16px;">Hi {user_name},</p>
            <p style="font-size: 15px; line-height: 1.6;">We've marked your concierge request as completed. Review the itineraries below and confirm your favorite in the dashboard.</p>
            <div style="margin-top: 16px; border: 1px solid #e6ecf5; border-radius: 12px; overflow: hidden;">
              <div style="background: #f0f5ff; padding: 12px 16px; font-weight: 700;">Itineraries</div>
              <div style="padding: 16px;">{itinerary_table}</div>
            </div>
            <a href="{settings.dashboard_url}" style="display: inline-block; margin-top: 16px; background: #0f6fff; color: #ffffff; padding: 12px 18px; border-radius: 8px; text-decoration: none; font-weight: 600;">Open dashboard</a>
          </div>
        </div>
      </body>
    </html>
    """


def _render_itinerary_row(
    carrier: str,
    flight_numbers: str,
    departure_time: datetime,
    arrival_time: datetime,
    cabin: str | None,
    cash_price: float | None,
    points_price: int | None,
    taxes_and_fees: float | None,
) -> str:
    departure = departure_time.strftime("%b %d, %Y %I:%M %p")
    arrival = arrival_time.strftime("%b %d, %Y %I:%M %p")
    cash = f"${cash_price:,.2f}" if cash_price is not None else "—"
    points = f"{points_price:,} pts" if points_price is not None else "—"
    taxes = f"${taxes_and_fees:,.2f}" if taxes_and_fees is not None else "—"

    return f"""
      <div style="border: 1px solid #e6ecf5; border-radius: 10px; padding: 12px 14px; margin-bottom: 12px;">
        <p style="margin: 0 0 6px; font-weight: 700;">{carrier} • {flight_numbers}</p>
        <p style="margin: 0 0 4px;">{departure} → {arrival}</p>
        <p style="margin: 0 0 4px;">Cabin: {cabin or "Any"}</p>
        <p style="margin: 0;">Cash: {cash} | Points: {points} | Taxes/Fees: {taxes}</p>
      </div>
    """

