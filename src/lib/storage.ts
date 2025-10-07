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

  get: (key: string): string | null => {
    return localStorage.getItem(key);
  },

  set: (key: string, value: string): void => {
    localStorage.setItem(key, value);
  },

  remove: (key: string): void => {
    localStorage.removeItem(key);
  },

  clear: (): void => {
    localStorage.clear();
    sessionStorage.clear();
  },
};
