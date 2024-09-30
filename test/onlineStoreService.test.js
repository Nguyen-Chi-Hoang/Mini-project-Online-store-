const sinon = require('sinon');
const User = require('../src/models/User');  // Giả định bạn có model User
const { loginPageService } = require('../src/services/onlineStore/onlineStoreService'); // Đường dẫn tới loginPageService

let expect;

describe('loginPageService', () => {
    let req, res, userFindStub;

    before(async () => {
        // Sử dụng import() động để load chai
        const chai = await import('chai');
        expect = chai.expect;
    });

    beforeEach(() => {
        // Tạo req và res giả lập
        req = {
            body: {
                username: 'johnDoe',
                password: 'password123'
            }
        };

        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub(),
            redirect: sinon.stub()
        };

        // Stub phương thức User.findOne để kiểm soát kết quả
        userFindStub = sinon.stub(User, 'findOne');
    });

    afterEach(() => {
        // Khôi phục lại trạng thái gốc của stub
        sinon.restore();
    });

    it('should return 409 if username or password is incorrect', async () => {
        // Giả lập không tìm thấy người dùng
        userFindStub.resolves(null);

        await loginPageService(req, res);

        expect(res.status.calledWith(409)).to.be.true;
        expect(res.json.calledWith({
            status: 'error',
            message: 'Username or password is not correct'
        })).to.be.true;
    });

    it('should return 400 if email is not verified', async () => {
        // Giả lập tìm thấy người dùng nhưng chưa xác thực email
        userFindStub.resolves({
            username: 'johnDoe',
            password: 'password123',
            verified: false
        });

        await loginPageService(req, res);

        expect(res.status.calledWith(400)).to.be.true;
        expect(res.json.calledWith({
            status: "FAILED",
            message: "Email hasn't been verified yet. Check your inbox."
        })).to.be.true;
    });

    it('should redirect to /store-item-id/:userId on successful login', async () => {
        // Giả lập người dùng hợp lệ và email đã xác thực
        userFindStub.resolves({
            _id: 'userId123',
            username: 'johnDoe',
            password: 'password123',
            verified: true
        });

        await loginPageService(req, res);

        expect(res.redirect.calledWith('/store-item-id/userId123')).to.be.true;
    });
});
