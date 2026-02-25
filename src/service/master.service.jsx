import axios from 'axios';
import { authHeader } from './auth.header';
import config from "../environment/config";
const API_URL = config.API_URL;

export function handleApiError(error, defaultMsg) {
    if (error.response) {
        const data = error.response.data;

        if (data?.data && typeof data.data === "object") {
            return Object.values(data.data)[0];
        }
        if (data?.message) {
            return data.message;
        }
    }
    return defaultMsg || "Something went wrong";
}

export const getEmployees = async (empId, roleName) => {
    try {
        return (await axios.get(`${API_URL}api/master/employee`, {
            headers: { 'Content-Type': 'application/json', ...authHeader() },
            params: {
                empId: empId,
                roleName: roleName
            }
        },
        )).data;
    } catch (error) {
        console.error('Error occurred in getEmployees():', error);
        throw error;
    }
};

export const getDesignation = async () => {
    try {
        return (await axios.get(`${API_URL}api/master/designation`, { headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
    } catch (error) {
        console.error('Error occurred in getDesignation():', error);
        throw error;
    }
};

export const getDivisions = async () => {
    try {
        return (await axios.get(`${API_URL}api/master/division`, { headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
    } catch (error) {
        console.error('Error occurred in getDivisions():', error);
        throw error;
    }
};

export const existsUsername = async (username) => {
    try {
        return (await axios.get(`${API_URL}api/admin/exists/${username}`, { headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
    } catch (error) {
        console.error('Error occurred in existsUsername():', error);
        throw error;
    }
};

export const getUserById = async (loginId) => {
    try {
        return (await axios.get(`${API_URL}api/admin/user/${loginId}`, { headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
    } catch (error) {
        console.error('Error occurred in getUserById():', error);
        throw error;
    }
};

export const addUser = async (data) => {
    try {
        return (await axios.post(`${API_URL}api/admin/add-user`, data, { headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
    } catch (error) {
        console.error('Error occurred in addUser():', error);
        throw error;
    }
};

export const updateUser = async (data) => {
    try {
        return (await axios.patch(`${API_URL}api/admin/update-user/${data.loginId}`, data, { headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
    } catch (error) {
        console.error('Error occurred in updateUser():', error);
        throw error;
    }
};

export const getSignAuthorityRoles = async () => {
    try {
        return (await axios.get(`${API_URL}api/master/sign-auth-roles`, { headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
    } catch (error) {
        console.error("Error fetching Sign Authority Roles:", error);
        throw error;
    }
};

export const getSignAuthorityList = async () => {
    try {
        return (await axios.get(`${API_URL}api/master/sign-authority`, { headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
    } catch (error) {
        console.error('Error occurred in getSignAuthorityList():', error);
        throw error;
    }
};

export const insertSignRoleAuthority = async (payload) => {
    try {
        return (await axios.post(`${API_URL}api/master/add-sign-authority`, payload, { headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
    } catch (error) {
        console.error('Error occurred in insertSignRoleAuthority():', error);
        throw error;
    }
};

export const updateSignRoleAuthority = async (payload) => {
    try {
        return (await axios.put(`${API_URL}api/master/update-sign-authority`, payload, { headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
    } catch (error) {
        console.error('Error occurred in updateSignRoleAuthority():', error);
        throw error;
    }
};
