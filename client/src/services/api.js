/**
 * ┌────────────────────────────────────────────────────────────────────────────
 * │ @author                    Christophe Vandevoir
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @file           api.js
 * │ @path          client/src/services/api.js
 * │ @description   api implementation
 * │ @version       1.0.0
 * │
 * │ @email         christophe.vandevoir@epitech.eu
 * │ @date          2025-04-29
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @copyright     (c) 2025 Christophe Vandevoir
 * └────────────────────────────────────────────────────────────────────────────
 */

import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
});

// Intercept requests to add JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const authService = {
    login: async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            return response.data;
        } catch (error) {
            // Check if it's a first login
            if (error.response && error.response.status === 401 &&
                error.response.data && error.response.data.requiresPasswordSet) {
                return error.response.data;
            }
            throw error;
        }
    },

    setPassword: async (userId, password) => {
        const response = await api.post('/auth/set-password', { userId, password });
        return response.data;
    },

    getProfile: async () => {
        const response = await api.get('/auth/profile');
        return response.data;
    }
};

export const teamService = {
    getAllTeams: async () => {
        const response = await api.get('/teams');
        return response.data.teams;
    },

    getAllTeamsWithPoints: async () => {
        const response = await api.get('/teams/with-points');
        return response.data.teams;
    },

    getTeamById: async (id) => {
        const response = await api.get(`/teams/${id}`);
        return response.data.team;
    },

    getTeamStudents: async (id) => {
        const response = await api.get(`/teams/${id}/students`);
        return response.data.students;
    },

    getTopStudents: async (id, limit = 5) => {
        const response = await api.get(`/teams/${id}/top-students?limit=${limit}`);
        return response.data.topStudents;
    },

    createTeam: async (teamData) => {
        const response = await api.post('/teams', teamData);
        return response.data;
    },

    updateTeam: async (id, teamData) => {
        const response = await api.put(`/teams/${id}`, teamData);
        return response.data;
    },

    deleteTeam: async (id) => {
        const response = await api.delete(`/teams/${id}`);
        return response.data;
    },

    addStudentToTeam: async (teamId, userId) => {
        const response = await api.post(`/teams/${teamId}/students`, { userId });
        return response.data;
    },

    removeStudentFromTeam: async (teamId, userId) => {
        const response = await api.delete(`/teams/${teamId}/students/${userId}`);
        return response.data;
    }
};

export const studentService = {
    getAllStudents: async () => {
        const response = await api.get('/students');
        return response.data.students;
    },

    getStudentById: async (id) => {
        const response = await api.get(`/students/${id}`);
        return response.data.student;
    },

    createStudent: async (studentData) => {
        const response = await api.post('/students', studentData);
        return response.data;
    },

    updateStudent: async (id, studentData) => {
        const response = await api.put(`/students/${id}`, studentData);
        return response.data;
    },

    deleteStudent: async (id) => {
        const response = await api.delete(`/students/${id}`);
        return response.data;
    }
};

export const pointService = {
    addPoints: async (pointData) => {
        const response = await api.post('/points', pointData);
        return response.data;
    },

    getPointsHistory: async (userId) => {
        const response = await api.get(`/points/user/${userId}/history`);
        return response.data;
    },

    getTotalPoints: async (userId) => {
        const response = await api.get(`/points/user/${userId}/total`);
        return response.data.totalPoints;
    },

    getAllStudentsPointsSummary: async () => {
        const response = await api.get('/points/summary');
        return response.data.summary;
    }
};

export default api;
