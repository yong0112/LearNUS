// LearNUS/backend/tests/__tests__/classesModel.test.js
const admin = require('firebase-admin');
const { getUserClasses } = require('../../models/classesModel');

describe('classesModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getUserClasses returns user classes', async () => {
    const uid = 'user123';
    const mockClasses = [
      { id: 'class1', name: 'Math 101' },
      { id: 'class2', name: 'Physics 201' },
    ];

    // Mock Firestore get() to return a QuerySnapshot
    const mockSnapshot = {
      empty: false,
      docs: mockClasses.map((cls) => ({
        id: cls.id,
        data: jest.fn(() => cls),
      })),
    };
    admin.firestore().collection('users').doc(uid).collection('classes').get.mockResolvedValue(mockSnapshot);

    const result = await getUserClasses(uid);
    expect(result).toEqual(mockClasses);
    expect(admin.firestore().collection).toHaveBeenCalledWith('users');
    expect(admin.firestore().collection().doc).toHaveBeenCalledWith(uid);
    expect(admin.firestore().collection().doc().collection).toHaveBeenCalledWith('classes');
  });

  it('getUserClasses returns empty array when no classes exist', async () => {
    const uid = 'user123';

    // Mock Firestore get() to return an empty QuerySnapshot
    const mockSnapshot = {
      empty: true,
      docs: [],
    };
    admin.firestore().collection('users').doc(uid).collection('classes').get.mockResolvedValue(mockSnapshot);

    const result = await getUserClasses(uid);
    expect(result).toEqual([]);
    expect(admin.firestore().collection).toHaveBeenCalledWith('users');
    expect(admin.firestore().collection().doc).toHaveBeenCalledWith(uid);
    expect(admin.firestore().collection().doc().collection).toHaveBeenCalledWith('classes');
  });
});