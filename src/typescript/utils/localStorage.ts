
export const get = (key: string) => {
  try {
    const item: any = localStorage.getItem(key);
    return JSON.parse(item);
  } catch (e) {
    return false;
  }
};

export const set = (key: string, value: any) => {
  try {
    const stringValue = JSON.stringify(value);
    localStorage.setItem(key, stringValue);
    return true;
  } catch (e) {
    return false;
  }
};

export const remove = (key: string) => {
  if (!localStorage.getItem(key)) {
    return false;
  }
  localStorage.removeItem(key);
  return true;
};
