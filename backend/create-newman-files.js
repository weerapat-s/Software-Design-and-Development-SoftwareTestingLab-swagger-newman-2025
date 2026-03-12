const fs   = require('fs');
const path = require('path');

fs.mkdirSync('newman',  { recursive: true });
fs.mkdirSync('reports', { recursive: true });

const env = {
  id: 'hotel-booking-local-env',
  name: 'Hotel Booking - Local',
  values: [
    { key: 'baseUrl',   value: 'http://localhost:3001', type: 'default', enabled: true },
    { key: 'token',     value: '',                      type: 'default', enabled: true },
    { key: 'bookingId', value: '',                      type: 'default', enabled: true }
  ],
  _postman_variable_scope: 'environment'
};

const collection = {
  info: {
    name: 'Hotel Booking API Tests (Complete)',
    description: 'Automated API Tests สำหรับ Hotel Booking System — Part 1-3 รหัส Weerapat',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
  },
  item: [
    {
      name: '1. POST /api/login',
      event: [{ listen: 'test', script: { type: 'text/javascript', exec: [
        'pm.test("Status code is 200", function() {',
        '  pm.response.to.have.status(200);',
        '});',
        'pm.test("Response has token and user info", function() {',
        '  const d = pm.response.json();',
        '  pm.expect(d).to.have.property("token");',
        '  pm.expect(d.token).to.be.a("string").and.not.empty;',
        '  pm.expect(d.user).to.have.property("role", "admin");',
        '  pm.expect(d.user).to.not.have.property("password");',
        '  pm.environment.set("token", d.token);',
        '});',
        'pm.test("user.id is a positive number", function() {',
        '  const d = pm.response.json();',
        '  pm.expect(d.user.id).to.be.a("number").and.above(0);',
        '});',
        'pm.test("Response time is less than 2000ms", function() {',
        '  pm.expect(pm.response.responseTime).to.be.below(2000);',
        '});'
      ]}}],
      request: {
        method: 'POST',
        header: [{ key: 'Content-Type', value: 'application/json' }],
        body: { mode: 'raw', raw: JSON.stringify({ username: 'admin', password: 'admin123' }) },
        url: { raw: '{{baseUrl}}/api/login', host: ['{{baseUrl}}'], path: ['api', 'login'] }
      }
    },
    {
      name: '2. POST /api/bookings',
      event: [{ listen: 'test', script: { type: 'text/javascript', exec: [
        'pm.test("Status code is 201 Created", function() {',
        '  pm.response.to.have.status(201);',
        '});',
        'pm.test("Has id and status defaults to pending", function() {',
        '  const d = pm.response.json();',
        '  pm.expect(d).to.have.property("id");',
        '  pm.expect(d.id).to.be.a("number").and.above(0);',
        '  pm.expect(d.status).to.equal("pending");',
        '  pm.environment.set("bookingId", d.id);',
        '});'
      ]}}],
      request: {
        method: 'POST',
        header: [{ key: 'Content-Type', value: 'application/json' }],
        body: {
          mode: 'raw',
          raw: JSON.stringify({
            fullname: 'Weerapat 66xxxxxxxx', email: 'weerapat@university.ac.th',
            phone: '0812345678', checkin: '2026-12-01', checkout: '2026-12-03',
            roomtype: 'standard', guests: 2
          })
        },
        url: { raw: '{{baseUrl}}/api/bookings', host: ['{{baseUrl}}'], path: ['api', 'bookings'] }
      }
    },
    {
      name: '3. GET /api/bookings (with token)',
      event: [{ listen: 'test', script: { type: 'text/javascript', exec: [
        'pm.test("Status code is 200", function() {',
        '  pm.response.to.have.status(200);',
        '});',
        'pm.test("Response is an array", function() {',
        '  pm.expect(pm.response.json()).to.be.an("array");',
        '});',
        'pm.test("Each booking has all required fields", function() {',
        '  const arr = pm.response.json();',
        '  if (arr.length > 0) {',
        '    pm.expect(arr[0]).to.include.all.keys(',
        '      "id", "fullname", "email", "phone",',
        '      "checkin", "checkout", "roomtype",',
        '      "guests", "status", "created_at"',
        '    );',
        '  }',
        '});'
      ]}}],
      request: {
        method: 'GET',
        header: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
        url: { raw: '{{baseUrl}}/api/bookings', host: ['{{baseUrl}}'], path: ['api', 'bookings'] }
      }
    },
    {
      name: '4. GET /api/bookings (NO token - Negative)',
      event: [{ listen: 'test', script: { type: 'text/javascript', exec: [
        'pm.test("Returns 401 without token", function() {',
        '  pm.response.to.have.status(401);',
        '});',
        'pm.test("Has error message about login", function() {',
        '  const d = pm.response.json();',
        '  pm.expect(d).to.have.property("error");',
        '  pm.expect(d.error).to.include("เข้าสู่ระบบ");',
        '  pm.expect(d).to.not.have.property("id");',
        '});'
      ]}}],
      request: {
        method: 'GET', header: [],
        url: { raw: '{{baseUrl}}/api/bookings', host: ['{{baseUrl}}'], path: ['api', 'bookings'] }
      }
    },
    {
      name: '5. GET /api/bookings/:id',
      event: [{ listen: 'test', script: { type: 'text/javascript', exec: [
        'pm.test("Status code is 200", function() {',
        '  pm.response.to.have.status(200);',
        '});',
        'pm.test("Returned id matches requested id", function() {',
        '  const d = pm.response.json();',
        '  pm.expect(d.id).to.equal(parseInt(pm.environment.get("bookingId")));',
        '  pm.expect(d.email).to.be.a("string").and.not.empty;',
        '});',
        'pm.test("fullname is not empty", function() {',
        '  const d = pm.response.json();',
        '  pm.expect(d.fullname).to.be.a("string").and.not.empty;',
        '});'
      ]}}],
      request: {
        method: 'GET',
        header: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
        url: {
          raw: '{{baseUrl}}/api/bookings/{{bookingId}}',
          host: ['{{baseUrl}}'], path: ['api', 'bookings', '{{bookingId}}']
        }
      }
    },
    {
      name: '6. PUT /api/bookings/:id',
      event: [{ listen: 'test', script: { type: 'text/javascript', exec: [
        'pm.test("Status code is 200", function() {',
        '  pm.response.to.have.status(200);',
        '});',
        'pm.test("Updated fields are saved correctly", function() {',
        '  const d = pm.response.json();',
        '  pm.expect(d.comment).to.equal("Updated by Newman test");',
        '  pm.expect(d.roomtype).to.equal("deluxe");',
        '  pm.expect(d).to.have.property("id");',
        '});',
        'pm.test("guests matches 3", function() {',
        '  const d = pm.response.json();',
        '  pm.expect(d.guests).to.equal(3);',
        '});'
      ]}}],
      request: {
        method: 'PUT',
        header: [
          { key: 'Authorization', value: 'Bearer {{token}}' },
          { key: 'Content-Type',  value: 'application/json' }
        ],
        body: {
          mode: 'raw',
          raw: JSON.stringify({
            fullname: 'Weerapat 66xxxxxxxx (Updated)', email: 'weerapat-updated@university.ac.th',
            phone: '0898765432', checkin: '2026-12-01', checkout: '2026-12-05',
            roomtype: 'deluxe', guests: 3, comment: 'Updated by Newman test'
          })
        },
        url: {
          raw: '{{baseUrl}}/api/bookings/{{bookingId}}',
          host: ['{{baseUrl}}'], path: ['api', 'bookings', '{{bookingId}}']
        }
      }
    },
    {
      name: '7. POST /api/bookings/:id/checkin',
      event: [{ listen: 'test', script: { type: 'text/javascript', exec: [
        'pm.test("Status code is 200", function() {',
        '  pm.response.to.have.status(200);',
        '});',
        'pm.test("Response has checkinId", function() {',
        '  const d = pm.response.json();',
        '  pm.expect(d).to.have.property("checkinId");',
        '});'
      ]}}],
      request: {
        method: 'POST',
        header: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
        url: {
          raw: '{{baseUrl}}/api/bookings/{{bookingId}}/checkin',
          host: ['{{baseUrl}}'], path: ['api', 'bookings', '{{bookingId}}', 'checkin']
        }
      }
    },
    {
      name: '8. POST /api/bookings/:id/checkout',
      event: [{ listen: 'test', script: { type: 'text/javascript', exec: [
        'pm.test("Status code is 200", function() {',
        '  pm.response.to.have.status(200);',
        '});',
        'pm.test("Response has checkoutId", function() {',
        '  const d = pm.response.json();',
        '  pm.expect(d).to.have.property("checkoutId");',
        '});'
      ]}}],
      request: {
        method: 'POST',
        header: [
          { key: 'Authorization', value: 'Bearer {{token}}' },
          { key: 'Content-Type',  value: 'application/json' }
        ],
        body: {
          mode: 'raw',
          raw: JSON.stringify({ checkinId: 'CI-100{{bookingId}}' })
        },
        url: {
          raw: '{{baseUrl}}/api/bookings/{{bookingId}}/checkout',
          host: ['{{baseUrl}}'], path: ['api', 'bookings', '{{bookingId}}', 'checkout']
        }
      }
    },
    {
      name: '9. POST /api/bookings/:id/confirm-checkout',
      event: [{ listen: 'test', script: { type: 'text/javascript', exec: [
        'pm.test("Status code is 200", function() {',
        '  pm.response.to.have.status(200);',
        '});',
        'pm.test("Response status is completed", function() {',
        '  const d = pm.response.json();',
        '  pm.expect(d.status).to.equal("completed");',
        '});'
      ]}}],
      request: {
        method: 'POST',
        header: [
          { key: 'Authorization', value: 'Bearer {{token}}' },
          { key: 'Content-Type',  value: 'application/json' }
        ],
        body: {
          mode: 'raw',
          raw: JSON.stringify({ checkoutId: 'CO-200{{bookingId}}' })
        },
        url: {
          raw: '{{baseUrl}}/api/bookings/{{bookingId}}/confirm-checkout',
          host: ['{{baseUrl}}'], path: ['api', 'bookings', '{{bookingId}}', 'confirm-checkout']
        }
      }
    },
    {
      name: '10. DELETE /api/bookings/:id',
      event: [{ listen: 'test', script: { type: 'text/javascript', exec: [
        'pm.test("Status code is 200", function() {',
        '  pm.response.to.have.status(200);',
        '});',
        'pm.test("Response has message and deleted id", function() {',
        '  const d = pm.response.json();',
        '  pm.expect(d).to.have.property("message");',
        '  pm.expect(d.id.toString()).to.equal(pm.environment.get("bookingId").toString());',
        '  pm.environment.unset("bookingId");',
        '});'
      ]}}],
      request: {
        method: 'DELETE',
        header: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
        url: {
          raw: '{{baseUrl}}/api/bookings/{{bookingId}}',
          host: ['{{baseUrl}}'], path: ['api', 'bookings', '{{bookingId}}']
        }
      }
    },
    {
      name: '11. POST /api/login — Wrong Password',
      event: [{ listen: 'test', script: { type: 'text/javascript', exec: [
        'pm.test("Status code is 401", function() {',
        '  pm.response.to.have.status(401);',
        '});',
        'pm.test("Has error message for wrong password", function() {',
        '  const d = pm.response.json();',
        '  pm.expect(d).to.have.property("error");',
        '  pm.expect(d.error).to.include("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");',
        '});'
      ]}}],
      request: {
        method: 'POST',
        header: [{ key: 'Content-Type', value: 'application/json' }],
        body: { mode: 'raw', raw: JSON.stringify({ username: 'admin', password: 'wrongpassword' }) },
        url: { raw: '{{baseUrl}}/api/login', host: ['{{baseUrl}}'], path: ['api', 'login'] }
      }
    }
  ]
};

fs.writeFileSync(
  path.join('newman', 'hotel-booking-env.json'),
  JSON.stringify(env, null, 2),
  'utf8'
);
console.log('✅ สร้าง newman/hotel-booking-env.json เรียบร้อย');

fs.writeFileSync(
  path.join('newman', 'hotel-booking-collection.json'),
  JSON.stringify(collection, null, 2),
  'utf8'
);
console.log('✅ สร้าง newman/hotel-booking-collection.json เรียบร้อย');
