// localStorageUtils.ts

const encryptData = (data: any) => {
    const serializedData = JSON.stringify(data);
    const encryptedData = btoa(serializedData);
    return encryptedData;
};

const decryptData = (encryptedData: string) => {
    const decryptedData = atob(encryptedData);
    const parsedData = JSON.parse(decryptedData);
    return parsedData;
};

export const setDataInLocalStorage = (key: string, data: any) => {
    try {
        const encryptedData = encryptData(data);
        localStorage.setItem(key, encryptedData);
    } catch (error) {
        console.error('Error saving data to localStorage:', error);
    }
};

export const getDataFromLocalStorage = (key: string) => {
    try {
        const encryptedData = localStorage.getItem(key);
        if (encryptedData === null) {
            return undefined;
        }
        const decryptedData = decryptData(encryptedData);
        return decryptedData;
    } catch (error) {
        console.log('Error retrieving data from localStorage:', error);
        return error;
    }
};

export const removeDataFromLocalStorage = (key: string) => {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('Error removing data from localStorage:', error);
    }
};
