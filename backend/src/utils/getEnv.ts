export const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (value !== undefined) return value;
  if (defaultValue !== undefined) return defaultValue;
  throw new Error(`Missing environment variable ${key}`);
};
