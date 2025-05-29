// filepath: c:\Users\feca1\Desktop\Programing_project\my-money-app\src\utils\localStorageUtil.js
const LOCAL_STORAGE_KEY = 'budgetEntries';

export const saveEntries = (entries) => {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(entries));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
};

export const getEntries = () => {
    try {
        const data = localStorage.getItem(LOCAL_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error accessing localStorage:', error);
        return [];
    }
};

export const clearEntries = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
};