import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api';

export const getFriends = async () => {
    const response = await axios.get(`${API_BASE_URL}/friends`);
    return response.data;
};

export const getGroups = async () => {
    const response = await axios.get(`${API_BASE_URL}/groups`);
    return response.data;
};

export const getGroupById = async (groupId) => {
    const response = await axios.get(`${API_BASE_URL}/groups/${groupId}`);
    return response.data;
};

export const createFriend = async (friendName) => {
    const response = await axios.post(`${API_BASE_URL}/friends`, { name: friendName });
    return response.data;
};

export const createGroup = async (groupName, initialMemberId) => {
    const response = await axios.post(`${API_BASE_URL}/groups`, {
        name: groupName,
        members: [{ id: initialMemberId }]
    });
    return response.data;
};

export const addExpense = async (expenseData) => {
    const response = await axios.post(`${API_BASE_URL}/expenses`, expenseData);
    return response.data;
};

// This is the function that was missing.
export const getExpensesByGroupId = async (groupId) => {
    const response = await axios.get(`${API_BASE_URL}/expenses/group/${groupId}`);
    return response.data;
};

export const calculateBalances = async (groupId) => {
    const response = await axios.get(`${API_BASE_URL}/expenses/balances/${groupId}`);
    return response.data;
};

export const addFriendToGroup = async (groupId, friendId) => {
    const response = await axios.post(`${API_BASE_URL}/groups/${groupId}/add-friend/${friendId}`);
    return response.data;
};

export const deleteFriend = async (friendId) => {
    const response = await axios.delete(`${API_BASE_URL}/friends/${friendId}`);
    return response.data;
};

export const deleteGroup = async (groupId) => {
    const response = await axios.delete(`${API_BASE_URL}/groups/${groupId}`);
    return response.data;
};