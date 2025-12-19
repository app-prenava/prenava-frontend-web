export const storage = {
  getToken: (): string | null => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  },

  setToken: (token: string, remember = true): void => {
    if (remember) {
      localStorage.setItem('token', token);
      sessionStorage.removeItem('token');
    } else {
      sessionStorage.setItem('token', token);
      localStorage.removeItem('token');
    }
  },

  removeToken: (): void => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
  },

  getRole: (): string | null => {
    return localStorage.getItem('role') || sessionStorage.getItem('role');
  },

  setRole: (role: string, remember = true): void => {
    if (remember) {
      localStorage.setItem('role', role);
      sessionStorage.removeItem('role');
    } else {
      sessionStorage.setItem('role', role);
      localStorage.removeItem('role');
    }
  },

  removeRole: (): void => {
    localStorage.removeItem('role');
    sessionStorage.removeItem('role');
  },

  getUserName: (): string | null => {
    return localStorage.getItem('userName') || sessionStorage.getItem('userName');
  },

  setUserName: (userName: string, remember = true): void => {
    if (remember) {
      localStorage.setItem('userName', userName);
      sessionStorage.removeItem('userName');
    } else {
      sessionStorage.setItem('userName', userName);
      localStorage.removeItem('userName');
    }
  },

  removeUserName: (): void => {
    localStorage.removeItem('userName');
    sessionStorage.removeItem('userName');
  },

  get: (key: string): string | null => {
    return localStorage.getItem(key) || sessionStorage.getItem(key);
  },

  set: (key: string, value: string, remember = true): void => {
    if (remember) {
      localStorage.setItem(key, value);
      sessionStorage.removeItem(key);
    } else {
      sessionStorage.setItem(key, value);
      localStorage.removeItem(key);
    }
  },

  remove: (key: string): void => {
    localStorage.removeItem(key);
  },

  clear: (): void => {
    localStorage.clear();
    sessionStorage.clear();
  },
};