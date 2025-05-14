const UserDataStorage = require('../../src/cloud_integration/user_data_storage');

describe('UserDataStorage', () => {
    let userDataStorage;

    beforeEach(() => {
        userDataStorage = new UserDataStorage();
    });

    test('should save user data correctly', async () => {
        const userId = 'user123';
        const data = { name: 'John Doe', age: 30 };

        await userDataStorage.saveUserData(userId, data);
        const retrievedData = await userDataStorage.retrieveUserData(userId);

        expect(retrievedData).toEqual(data);
    });

    test('should return null for non-existent user data', async () => {
        const userId = 'nonExistentUser';

        const retrievedData = await userDataStorage.retrieveUserData(userId);

        expect(retrievedData).toBeNull();
    });
});