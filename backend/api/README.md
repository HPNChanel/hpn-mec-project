# API Routes

This directory contains API route definitions for the HPN MEC Medical Health System.

## Structure

- **routes/**: Organized API route modules
  - **auth.py**: Authentication endpoints (login, register, etc.)
  - **users.py**: User management endpoints
  - **health_records.py**: Health record management
  - **admin.py**: Administrative endpoints

Each route module should:
1. Define endpoint paths
2. Specify HTTP methods
3. Apply appropriate authorization
4. Call the appropriate service functions
5. Return the correct response models 