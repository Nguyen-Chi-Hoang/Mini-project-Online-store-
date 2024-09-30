// Kiểm tra việc kết nối MongoDB.
// Kiểm tra middleware checkAuthentication.
const request = require('supertest');
const sinon = require('sinon');
const mongoose = require('mongoose');
let expect;
let app;

describe('MongoDB Connection', () => {
    let connectStub;

    before(() => {
        // Stub mongoose.connect
        connectStub = sinon.stub(mongoose, 'connect').resolves();

        // Khởi tạo ứng dụng
        app = require('../index');
    });

    after(() => {
        // Phục hồi lại trạng thái của mongoose.connect
        connectStub.restore();
    });

    it('should call mongoose.connect when server starts', () => {
        sinon.assert.calledOnce(connectStub);  // Kiểm tra nếu mongoose.connect được gọi
    });
});


describe('Unit Test for index.js', () => {
  before(async () => {
    // Import Chai bằng import() động
    const chai = await import('chai');
    expect = chai.expect;
    
    // Khởi tạo app
    app = require('../index');
  });

  it('should handle /login route without authentication', async () => {
    const res = await request(app).get('/login');
    expect(res.status).to.equal(200); // Kiểm tra nếu status trả về là 200
  });
});