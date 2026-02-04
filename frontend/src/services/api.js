// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// API Helper Function
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const config = { ...defaultOptions, ...options };

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

// Mahasiswa API
export const mahasiswaAPI = {
    getAll: () => apiRequest('/mahasiswa'),
    getByNim: (nim) => apiRequest(`/mahasiswa/${nim}`),
    create: (data) => apiRequest('/mahasiswa', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    update: (nim, data) => apiRequest(`/mahasiswa/${nim}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    delete: (nim) => apiRequest(`/mahasiswa/${nim}`, {
        method: 'DELETE'
    }),
    bulkCreate: (mahasiswa) => apiRequest('/mahasiswa/bulk', {
        method: 'POST',
        body: JSON.stringify({ mahasiswa })
    })
};

// Dosen API
export const dosenAPI = {
    getAll: () => apiRequest('/dosen'),
    getByFakultas: (fakultas) => apiRequest(`/dosen/fakultas/${fakultas}`),
    toggleExclude: (nik, exclude) => apiRequest(`/dosen/${nik}/exclude`, {
        method: 'PATCH',
        body: JSON.stringify({ exclude })
    }),
    delete: (nik) => apiRequest(`/dosen/${nik}`, {
        method: 'DELETE'
    }),
    bulkInsert: (dosen) => apiRequest('/dosen/bulk', {
        method: 'POST',
        body: JSON.stringify({ dosen })
    }),
    getMaster: () => apiRequest('/dosen/master'),
    deleteMaster: (nik) => apiRequest(`/dosen/master/${nik}`, {
        method: 'DELETE'
    }),
    bulkInsertMaster: (dosen) => apiRequest('/dosen/master/bulk', {
        method: 'POST',
        body: JSON.stringify({ dosen })
    })
};

// Libur API
export const liburAPI = {
    getAll: () => apiRequest('/libur'),
    create: (data) => apiRequest('/libur', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    delete: (id) => apiRequest(`/libur/${id}`, {
        method: 'DELETE'
    }),
    deleteByNik: (nik) => apiRequest(`/libur/nik/${nik}`, {
        method: 'DELETE'
    }),
    deleteAll: () => apiRequest('/libur/action/wipe', {
        method: 'DELETE'
    }),
    bulkCreate: (libur) => apiRequest('/libur/bulk', {
        method: 'POST',
        body: JSON.stringify({ libur })
    })
};

// Slots API
export const slotsAPI = {
    getAll: () => apiRequest('/slots'),
    getByDate: (date) => apiRequest(`/slots/date/${date}`),
    deleteAll: () => apiRequest('/slots', {
        method: 'DELETE'
    }),
    delete: (id) => apiRequest(`/slots/${id}`, {
        method: 'DELETE'
    }),
    bulkCreate: (slots) => apiRequest('/slots/bulk', {
        method: 'POST',
        body: JSON.stringify({ slots })
    })
};

// Schedule API
export const scheduleAPI = {
    generate: (targetProdi = 'all', isIncremental = false) => apiRequest('/schedule/generate', {
        method: 'POST',
        body: JSON.stringify({ targetProdi, isIncremental })
    })
};

// Settings API
export const settingsAPI = {
    get: () => apiRequest('/settings'),
    update: (settings) => apiRequest('/settings', {
        method: 'POST',
        body: JSON.stringify(settings)
    })
};

// Health Check
export const healthCheck = () => fetch(`${API_BASE_URL.replace('/api', '')}/health`).then(r => r.json());
