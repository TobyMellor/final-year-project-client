export default {
  get: (key: string) => {
    try {
      const item: any = localStorage.getItem(key);
      return JSON.parse(item);
    } catch (e) {
      return false;
    }
  },
  set: (key: string, value: any) => {
    try {
      const stringValue = JSON.stringify(value);
      localStorage.setItem(key, stringValue);
      return true;
    } catch (e) {
      return false;
    }
  },
  remove: (key: string) => {
    if (!localStorage.getItem(key)) {
      return false;
    }
    localStorage.removeItem(key);
    return true;
  }
};
