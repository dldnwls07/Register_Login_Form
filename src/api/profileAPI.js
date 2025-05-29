import api from './axiosConfig';

export const getProfile = async () => {
  try {
    const response = await api.get('/api/profile');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || '프로필 정보를 가져오는데 실패했습니다.');
  }
};

export const updateProfile = async (profileData) => {
  try {
    const response = await api.put('/api/profile', profileData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || '프로필 업데이트에 실패했습니다.');
  }
};

export const updatePreferences = async (preferences) => {
  try {
    const response = await api.patch('/api/profile/preferences', { preferences });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || '환경설정 업데이트에 실패했습니다.');
  }
};
