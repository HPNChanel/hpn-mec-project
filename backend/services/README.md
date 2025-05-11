# Service Layer

This directory contains business logic services for the HPN MEC Medical Health System.

## Services

- **auth_service.py**: User authentication and authorization
- **user_service.py**: User management
- **patient_service.py**: Patient data management
- **health_record_service.py**: Health record operations
- **admin_service.py**: Administrative operations

Each service should:
1. Implement business logic
2. Handle database operations via models
3. Process data from/to schemas
4. Handle errors and exceptions
5. Implement validation rules

The service layer separates business logic from API routes, making the code more maintainable and testable. 