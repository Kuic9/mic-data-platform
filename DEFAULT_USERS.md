# Default User Accounts

The system has pre-configured the following test users. You can directly use these accounts to login without re-registration:

## Administrator Account
- **Username**: `admin`
- **Email**: `admin@mic-platform.com`
- **Password**: `admin123`
- **Role**: System Administrator
- **Permissions**: All permissions (Read, Search, Modify, Analyze, Comment, Data Input)

## Designer Account
- **Username**: `designer`
- **Email**: `designer@example.com`
- **Password**: `designer123`
- **Role**: Designer
- **Permissions**: Read, Search, Modify, Analyze, Comment

## Contractor Account
- **Username**: `contractor`
- **Email**: `contractor@example.com`
- **Password**: `contractor123`
- **Role**: Contractor
- **Permissions**: Read, Search, Modify, Comment

## Manufacturer Account
- **Username**: `manufacturer`
- **Email**: `manufacturer@example.com`
- **Password**: `manufacturer123`
- **Role**: Manufacturer
- **Permissions**: Read, Search, Data Input

## Supplier Account
- **Username**: `supplier`
- **Email**: `supplier@example.com`
- **Password**: `supplier123`
- **Role**: Supplier
- **Permissions**: Read, Search

---

## Important Notes

1. **Data Persistence**: These user accounts are stored in the SQLite database and will persist even after server restarts
2. **Re-initialization**: If you run `npm run init-db`, the system will check if users already exist and won't create duplicates
3. **Password Security**: These are test default passwords. Please change them in production environments
4. **Permission Testing**: Different role users have different permissions, which can be used to test permission control functionality

## Quick Login Recommendation

We recommend using the **admin** account for testing as it has all permissions and can access all system features. 