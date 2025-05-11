# Pydantic Schemas

This directory contains Pydantic schemas for request/response validation and serialization in the HPN MEC Medical Health System.

## Schemas

- **user.py**: User data schemas
- **patient.py**: Patient data schemas
- **health_record.py**: Health record schemas
- **appointment.py**: Appointment schemas
- **auth.py**: Authentication request/response schemas

Each schema should:
1. Define the data structure
2. Include validation rules
3. Provide examples
4. Define relationships between schemas where needed

Pydantic schemas are used to:
- Validate incoming request data
- Serialize outgoing response data
- Document API endpoints in the OpenAPI schema
- Generate automatic API documentation 