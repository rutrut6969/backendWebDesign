   // backend/src/__tests__/auth.controller.test.ts
   import request from 'supertest';
   import app from '../app'; // Adjust the import based on your app's entry point
   import { User } from '../models/User'; // Import your User model

   describe('Authentication Endpoints', () => {
       beforeAll(async () => {
           // Setup: Create a test user in the database
           await User.create({
               email: 'test@example.com',
               password: 'password123', // Make sure to hash this in your actual implementation
               name: 'Test User',
               role: 'user',
           });
       });

       afterAll(async () => {
           // Cleanup: Remove the test user from the database
           await User.deleteMany({ email: 'test@example.com' });
       });

       it('should log in successfully', async () => {
           const response = await request(app)
               .post('/api/auth/login')
               .send({
                   email: 'test@example.com',
                   password: 'password123', // Use the correct plain text password
               });

           expect(response.status).toBe(200);
           expect(response.body).toHaveProperty('message', 'Login successful');
           expect(response.body).toHaveProperty('token');
           expect(response.body.user).toHaveProperty('id');
           expect(response.body.user).toHaveProperty('email', 'test@example.com');
       });

       it('should log out successfully', async () => {
           // First, log in to get the token
           const loginResponse = await request(app)
               .post('/api/auth/login')
               .send({
                   email: 'test@example.com',
                   password: 'password123',
               });

           const token = loginResponse.body.token;

           // Now, log out
           const logoutResponse = await request(app)
               .post('/api/auth/logout')
               .set('Authorization', `Bearer ${token}`);

           expect(logoutResponse.status).toBe(200);
           expect(logoutResponse.body).toHaveProperty('message', 'Logout successful');
       });
   });