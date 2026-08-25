"""RailMadad AI Platform — Backend Complaints & AI Chat API Tests."""

import pytest
from httpx import AsyncClient
from app.services.ai_intelligence import ai_intelligence_service


# ── Unit Tests: AI Intelligence Service ───────────────────

@pytest.mark.asyncio
async def test_ai_classification_categories():
    """Unit test for category classification logic."""
    res_clean = await ai_intelligence_service.classify_complaint("The toilet in coach B2 is dirty and smelling")
    assert res_clean["category"] == "cleanliness"
    assert "Health" in res_clean["department"]

    res_ac = await ai_intelligence_service.classify_complaint("AC air conditioner is not working and fan is stopped")
    assert res_ac["category"] == "electrical"

    res_food = await ai_intelligence_service.classify_complaint("Pantry food quality is expired and cold tea")
    assert res_food["category"] == "catering"


@pytest.mark.asyncio
async def test_ai_severity_detection():
    """Unit test for severity detection logic."""
    crit = await ai_intelligence_service.detect_severity("Emergency fire in coach S3")
    assert crit["severity"] == "critical"

    high = await ai_intelligence_service.detect_severity("Passenger handbag stolen RPF required immediately")
    assert high["severity"] == "high"

    norm = await ai_intelligence_service.detect_severity("General inquiry about seat allotment")
    assert norm["severity"] == "medium" or norm["severity"] == "low"


# ── Integration Tests: Complaints & Chat API Endpoints ─────

@pytest.mark.asyncio
async def test_create_complaint_validation(client: AsyncClient):
    """Unit/Validation test: rejects complaint with missing required fields."""
    response = await client.post("/api/complaints/", json={"title": "", "description": ""})
    assert response.status_code == 422 or response.status_code == 400


@pytest.mark.asyncio
async def test_complaint_crud_round_trip(client: AsyncClient):
    """Integration test: POST /api/complaints -> GET /api/complaints/:id round trip."""
    payload = {
        "title": "Unwashed blankets provided in Coach A1",
        "description": "The bedroll provided in coach A1 seat 23 is unwashed and dirty.",
        "category": "bed_roll",
        "pnr_number": "2415678901",
        "coach_number": "A1",
        "seat_number": "23",
    }

    create_res = await client.post("/api/complaints/", json=payload)
    assert create_res.status_code == 201
    created_data = create_res.json()

    assert "id" in created_data
    assert created_data["complaint_number"].startswith("RM-")
    assert created_data["category"] == "bed_roll"
    assert created_data["status"] == "submitted"

    complaint_id = created_data["id"]

    # GET complaint by ID
    get_res = await client.get(f"/api/complaints/{complaint_id}")
    assert get_res.status_code == 200
    fetched_data = get_res.json()
    assert fetched_data["id"] == complaint_id
    assert fetched_data["pnr_number"] == "2415678901"


@pytest.mark.asyncio
async def test_complaint_status_transition(client: AsyncClient):
    """Integration test: Status update endpoint persists status transition."""
    # First create a complaint
    payload = {
        "title": "Water supply empty in coach S5",
        "description": "No water in toilet tank of coach S5 since morning.",
        "category": "water",
    }
    create_res = await client.post("/api/complaints/", json=payload)
    complaint_id = create_res.json()["id"]

    # Update status via PATCH /api/complaints/:id/status
    patch_res = await client.patch(
        f"/api/complaints/{complaint_id}/status",
        params={"new_status": "in_progress", "remarks": "Dispatching watering team at next station"},
    )
    assert patch_res.status_code == 200
    updated_data = patch_res.json()
    assert updated_data["status"] == "in_progress"

    # Verify status history timeline
    hist_res = await client.get(f"/api/complaints/{complaint_id}/status-history")
    assert hist_res.status_code == 200
    history = hist_res.json()
    assert len(history) >= 2  # submitted -> in_progress


@pytest.mark.asyncio
async def test_conversational_chat_endpoint(client: AsyncClient):
    """Integration test: POST /api/chat processes message and returns AI response."""
    chat_payload = {
        "message": "AC is not working in coach B1 seat 12 PNR 9876543210. Extremely hot.",
        "auto_create_complaint": True,
    }

    chat_res = await client.post("/api/chat/", json=chat_payload)
    assert chat_res.status_code == 200
    data = chat_res.json()

    assert "reply" in data
    assert data["category"] == "electrical"
    assert data["extracted_pnr"] == "9876543210"
    assert data["extracted_coach"] == "B1"
    assert data["complaint_id"] is not None
    assert data["complaint_number"].startswith("RM-")
