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

// Corrected function: Takes a list of member IDs and formats the payload
export const createGroup = async (groupName, memberIds) => {
    const membersPayload = memberIds.map(id => ({ id: id }));
    const response = await axios.post(`${API_BASE_URL}/groups`, {
        name: groupName,
        members: membersPayload
    });
    return response.data;
};

export const addExpense = async (expenseData) => {
    const response = await axios.post(`${API_BASE_URL}/expenses`, expenseData);
    return response.data;
};

export const getExpensesForGroup = async (groupId) => {
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