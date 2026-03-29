import request from 'supertest';
import { Server } from '../../src/apps/backend/server';

const BASE_URL = 'http://localhost:3000';

describe('E2E Tests - Flow completo', () => {
  let token: string;
  let gardenId: string;
  let plotId: string;

  const testUser = {
    name: 'Test User',
    email: `test_${Date.now()}@example.com`,
    password: 'password123'
  };

  const testGarden = {
    name: 'Mi Huerto Test',
    description: 'Huerto de prueba para test e2e',
    surface_m2: 100,
    climate_zone: 'mediterranean'
  };

  const testPlot = {
    name: 'Parcela Test 1',
    surface_m2: 25,
    soil_type: 'loam'
  };

  describe('1. Registro de usuario', () => {
    it('POST /api/auth/register - debe crear un usuario y devolver token', async () => {
      const response = await request(BASE_URL)
        .post('/api/auth/register')
        .send(testUser);

      console.log('=== REGISTRO ===');
      console.log('Status:', response.status);
      console.log('Content-Type:', response.headers['content-type']);
      console.log('Response:', response.text);

      if (response.status === 201) {
        expect(response.body.success).toBe(true);
        expect(response.body.data.token).toBeDefined();
        expect(response.body.data.user).toBeDefined();
        token = response.body.data.token;
        console.log('Token:', token);
      }
    });
  });

  describe('2. Login de usuario', () => {
    it('POST /api/auth/login - debe devolver token con credenciales válidas', async () => {
      const response = await request(BASE_URL)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      console.log('=== LOGIN ===');
      console.log('Status:', response.status);
      console.log('Response:', JSON.stringify(response.body, null, 2));

      if (response.status === 200 && response.body.data?.token) {
        expect(response.body.data.token).toBeDefined();
        token = response.body.data.token;
      }
    });
  });

  describe('3. Crear huerto (garden)', () => {
    it('POST /api/gardens - debe crear un huerto con autenticación', async () => {
      if (!token) {
        console.log('SKIP: No hay token disponible');
        return;
      }

      const response = await request(BASE_URL)
        .post('/api/gardens')
        .set('Authorization', `Bearer ${token}`)
        .send(testGarden)
        .expect('Content-Type', /json/);

      console.log('=== CREAR HUERTO ===');
      console.log('Status:', response.status);
      console.log('Response:', JSON.stringify(response.body, null, 2));

      if (response.status === 201) {
        expect(response.body.message).toBe('Garden created successfully');
      }
    });
  });

  describe('4. Listar huertos', () => {
    it('GET /api/gardens - debe listar los huertos del usuario', async () => {
      if (!token) {
        console.log('SKIP: No hay token disponible');
        return;
      }

      const response = await request(BASE_URL)
        .get('/api/gardens')
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/);

      console.log('=== LISTAR HUERTOS ===');
      console.log('Status:', response.status);
      console.log('Response:', JSON.stringify(response.body, null, 2));

      if (response.status === 200 && response.body.data && response.body.data.length > 0) {
        gardenId = response.body.data[0].id;
        console.log('Garden ID:', gardenId);
      }
    });
  });

  describe('5. Crear parcela (plot)', () => {
    it('POST /api/gardens/:gardenId/plots - debe crear una parcela', async () => {
      if (!token || !gardenId) {
        console.log('SKIP: No hay token o gardenId');
        return;
      }

      const response = await request(BASE_URL)
        .post(`/api/gardens/${gardenId}/plots`)
        .set('Authorization', `Bearer ${token}`)
        .send(testPlot)
        .expect('Content-Type', /json/);

      console.log('=== CREAR PARCELA ===');
      console.log('Status:', response.status);
      console.log('Response:', JSON.stringify(response.body, null, 2));

      if (response.status === 201) {
        expect(response.body.message).toBe('Plot created successfully');
      }
    });
  });

  describe('6. Listar parcelas', () => {
    it('GET /api/gardens/:gardenId/plots - debe listar las parcelas', async () => {
      if (!token || !gardenId) {
        console.log('SKIP: No hay token o gardenId');
        return;
      }

      const response = await request(BASE_URL)
        .get(`/api/gardens/${gardenId}/plots`)
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/);

      console.log('=== LISTAR PARCELAS ===');
      console.log('Status:', response.status);
      console.log('Response:', JSON.stringify(response.body, null, 2));

      if (response.status === 200 && response.body.data && response.body.data.length > 0) {
        plotId = response.body.data[0].id;
        console.log('Plot ID:', plotId);
      }
    });
  });

  describe('7. Invitar consultor/collaborator', () => {
    it('POST /api/gardens/:gardenId/collaborators - debe invitar a un consultor', async () => {
      if (!token || !gardenId) {
        console.log('SKIP: No hay token o gardenId');
        return;
      }

      const response = await request(BASE_URL)
        .post(`/api/gardens/${gardenId}/collaborators`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          gardenId: gardenId,
          email: 'consultor@example.com',
          role: 'collaborator'
        })
        .expect('Content-Type', /json/);

      console.log('=== INVITAR CONSULTOR ===');
      console.log('Status:', response.status);
      console.log('Response:', JSON.stringify(response.body, null, 2));
    });
  });
});
