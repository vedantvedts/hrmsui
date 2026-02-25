import axios from 'axios';
import config from '../environment/config';
import { authHeader } from './auth.header';
import { authenticationDetails } from './admin.service';

const API_URL = config.API_URL;
const LABCODE = config.LABCODE;


export const login = async (username, password) => {
  try {
    let encryptedPassword = btoa(password);

    // Add timestamp to prevent replay attacks
    const timestamp = Date.now();

    const loginData = {
      username: username.trim(),
      password: LABCODE==='CAIR' ? password : encryptedPassword,
      timestamp: timestamp
    };

    const response = await authenticationDetails(loginData);

    if (response.data.data.token) {
      localStorage.setItem(
        'user',
        JSON.stringify({
          token: response.data.data.token,
          username
        })
      );
      const emp = await getUserDetails(username);

      console.log('User details:', emp);

      localStorage.setItem('loginId', emp?.data.loginId);
      localStorage.setItem('empId', emp?.data.empId);
      localStorage.setItem('empName', emp?.data.empName);
      localStorage.setItem('roleName', emp?.data.roleName);
      localStorage.setItem('designationCode', emp?.data.empDesigName);
      localStorage.setItem('title', emp?.data.title);
      localStorage.setItem('roleId', emp?.data.roleId);


      return response.data;
    } else {
      throw new Error('Invalid response from server');
    }
  } catch (error) {
    console.error('Error occurred in login:', error);
    throw error;
  }
};

export const setLocalStorageData = async (username) => {
  if (!username) {
    throw new Error('No user found');
  }

  try {
     const emp = await getUserDetails(username);

      console.log('User details:', emp);

      localStorage.setItem('loginId', emp?.data.loginId);
      localStorage.setItem('empId', emp?.data.empId);
      localStorage.setItem('empName', emp?.data.empName);
      localStorage.setItem('roleName', emp?.data.roleName);
      localStorage.setItem('designationCode', emp?.data.empDesigName);
      localStorage.setItem('title', emp?.data.title);
      localStorage.setItem('roleId', emp?.data.roleId);
      //await customAuditStampingLogin(username);
    
  } catch (error) {
    console.error('Error occurred in getEmpDetails()', error);
    throw error;
  }
};

export const logout = async (logoutType) => {
  const user = getCurrentUser();
  const keysToRemove = [
    'loginId', 'roleName', 'empName', 'user','empId'
  ];
  if (user && user.username) {
    try {
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Error occurred in logout:', error);
      throw error;
    }
  } else {
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
};

export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

export const getUserDetails = async (username) => {
  if (!username) {
    throw new Error('No user found');
  } try {
    return (await axios.get(`${API_URL}api/master/getUser/${username}`, { headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
  } catch (error) {
    console.error('Error occurred in getUserDetails():', error);
    throw error;
  }
};
