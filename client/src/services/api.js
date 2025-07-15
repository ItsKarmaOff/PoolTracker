/**
 * ┌────────────────────────────────────────────────────────────────────────────
 * │ @author                    Christophe Vandevoir
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @file          api.js
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

export const userService = {
    getAllUsers: async () => {
        const response = await api.get('/users');
        return response.data.users;
    },

    getUsersByRole: async (role) => {
        const response = await api.get(`/users/by-role/${role}`);
        return response.data.users;
    },

    // Admin user management
    createAdmin: async (userData) => {
        const response = await api.post('/users/admin', userData);
        return response.data;
    },

    updateAdmin: async (id, userData) => {
        const response = await api.put(`/users/admin/${id}`, userData);
        return response.data;
    },

    deleteAdmin: async (id) => {
        const response = await api.delete(`/users/admin/${id}`);
        return response.data;
    },

    // APE user management
    createAPE: async (userData) => {
        const response = await api.post('/users/ape', userData);
        return response.data;
    },

    updateAPE: async (id, userData) => {
        const response = await api.put(`/users/ape/${id}`, userData);
        return response.data;
    },

    deleteAPE: async (id) => {
        const response = await api.delete(`/users/ape/${id}`);
        return response.data;
    },

    // AER user management
    createAER: async (userData) => {
        const response = await api.post('/users/aer', userData);
        return response.data;
    },

    updateAER: async (id, userData) => {
        const response = await api.put(`/users/aer/${id}`, userData);
        return response.data;
    },

    deleteAER: async (id) => {
        const response = await api.delete(`/users/aer/${id}`);
        return response.data;
    },

    // Generic user management (including role changes)
    updateUser: async (id, userData) => {
        const response = await api.put(`/users/${id}`, userData);
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
    },

    getAllPointsHistory: async () => {
        const response = await api.get('/points/history');
        return response.data.history;
    }
};

export const questService = {
    getDailyQuest: async () => {
        const response = await api.get('/quests/daily');
        return response.data.quest;
    },

    submitQuestCode: async (submissionData) => {
        const response = await api.post('/quests/submit', submissionData);
        return response.data;
    },

    getAllQuests: async () => {
        const response = await api.get('/quests');
        return response.data.quests;
    },

    getQuestById: async (id) => {
        const response = await api.get(`/quests/${id}`);
        return response.data.quest;
    },

    createQuest: async (questData) => {
        const response = await api.post('/quests', questData);
        return response.data;
    },

    updateQuest: async (id, questData) => {
        const response = await api.put(`/quests/${id}`, questData);
        return response.data;
    },

    deleteQuest: async (id) => {
        const response = await api.delete(`/quests/${id}`);
        return response.data;
    },

    getStatistics: async () => {
        const response = await api.get('/quests/statistics');
        return response.data.statistics;
    },

    getConfig: async () => {
        const response = await api.get('/quests/config');
        return response.data.config;
    },

    updateConfig: async (configData) => {
        const response = await api.put('/quests/config', configData);
        return response.data;
    },

    assignDailyQuests: async () => {
        const response = await api.post('/quests/assign');
        return response.data;
    }
};

export default api;
