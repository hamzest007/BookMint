# Frontend-Backend Integration Test Guide

This guide helps you test the integration between the React Native frontend and the new Node.js backend.

## Prerequisites

1. **Backend Running**: Ensure the backend server is running on port 5000
   ```bash
   cd backend
   npm run dev
   ```

2. **Frontend Ready**: React Native app should be ready to run

3. **MongoDB Running**: Ensure MongoDB is accessible

## Quick Integration Test

### 1. Test Backend Health

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 123.456
}
```

### 2. Test User Registration

From your React Native app or using curl:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

Expected response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Test User",
    "email": "test@example.com",
    "handle": "@test.user123"
  }
}
```

### 3. Test User Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 4. Test Book Creation

Use the token from login:

```bash
curl -X POST http://localhost:5000/api/books \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Test Book",
    "author": "Test Author",
    "category": "Fiction",
    "description": "A test book"
  }'
```

### 5. Test AI Chat

```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "message": "Hello, can you help me?",
    "bookContext": {
      "title": "Test Book",
      "content": "Some book content..."
    }
  }'
```

## Frontend Testing Steps

### 1. Update Configuration

Ensure `src/config/backend.ts` has the correct URLs:

```typescript
export const API_BASE_URL = 'http://localhost:5000/api';
export const WS_URL = 'http://localhost:5000';
```

### 2. Test Authentication Flow

1. Open the React Native app
2. Navigate to the login/register screen
3. Try to register a new user
4. Verify the user is created and logged in
5. Check that user data is displayed correctly

### 3. Test Book Operations

1. Navigate to the Library screen
2. Try to add a new book (via Upload or other method)
3. Verify the book appears in the list
4. Try to update reading progress
5. Test bookmarks and notes functionality

### 4. Test AI Features

1. Open a book in the reader
2. Access the AI chat feature
3. Ask a question about the book
4. Verify the AI responds correctly
5. Test real-time chat if WebSocket is connected

### 5. Test Public Books

1. Publish a book as public
2. Navigate to the Home screen
3. Check if the book appears in public books section
4. Test search and filtering

## Debugging Common Issues

### Connection Refused

**Problem**: `Network request failed` or `ECONNREFUSED`

**Solutions**:
- Ensure backend is running: `cd backend && npm run dev`
- Check backend is on port 5000
- Verify no firewall blocking the connection
- Check if API_BASE_URL is correct in config

### Authentication Errors

**Problem**: `401 Unauthorized` or `Invalid token`

**Solutions**:
- Verify JWT_SECRET is set in backend .env
- Check token is being stored correctly in AsyncStorage
- Ensure token is being sent in Authorization header
- Try logging out and logging in again

### CORS Errors

**Problem**: CORS policy errors in browser console

**Solutions**:
- Check CORS_ORIGIN in backend .env
- Ensure it matches your frontend URL
- For React Native, CORS might not be an issue

### Database Connection

**Problem**: `MongoDB connection failed`

**Solutions**:
- Ensure MongoDB is running
- Check MONGODB_URI in backend .env
- Verify MongoDB credentials
- Check network connectivity to MongoDB

### Socket Connection Issues

**Problem**: WebSocket connection fails

**Solutions**:
- Ensure WS_URL is correct in config
- Check backend Socket.io is running
- Verify no firewall blocking WebSocket
- Check browser console for socket errors

## Monitoring Backend Logs

While testing, monitor the backend console for:

```bash
cd backend
npm run dev
```

Look for:
- Request logs
- Error messages
- Database connection status
- WebSocket connection logs

## Testing Checklist

- [ ] Backend health endpoint responds
- [ ] User registration works
- [ ] User login works and returns valid token
- [ ] User profile can be updated
- [ ] Books can be created
- [ ] Books can be retrieved
- [ ] Book progress can be updated
- [ ] Bookmarks can be added/removed
- [ ] Notes can be added
- [ ] AI chat responds to questions
- [ ] Public books can be published
- [ ] Public books can be retrieved
- [ ] File uploads work
- [ ] WebSocket connection works (optional)

## Performance Testing

### Test Response Times

```bash
# Test API response time
time curl http://localhost:5000/health

# Test authentication time
time curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Load Testing

For basic load testing:

```bash
# Install apache bench
brew install apache2  # macOS
sudo apt-get install apache2-utils  # linux

# Test authentication endpoint
ab -n 100 -c 10 -p login.json -T application/json \
  http://localhost:5000/api/auth/login
```

## Rollback Plan

If integration fails:

1. **Revert frontend changes**: Use git to revert context and service changes
2. **Keep backend running**: Backend can still be used for future testing
3. **Restore local storage**: Clear AsyncStorage to reset app state
4. **Check environment**: Ensure all environment variables are correct

## Next Steps

Once integration is verified:

1. **Deploy backend**: Follow deployment guide for production
2. **Update production URLs**: Change API_BASE_URL and WS_URL
3. **Test in production**: Verify everything works in production environment
4. **Monitor performance**: Set up monitoring and logging
5. **Scale as needed**: Add more resources if needed

## Support

If you encounter issues:

1. Check backend console logs
2. Check React Native debugger console
3. Verify network connectivity
4. Review API documentation
5. Check MongoDB connection status
6. Ensure all dependencies are installed