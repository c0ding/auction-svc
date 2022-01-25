export const getStringEnv = (envName: string): string => {
  const value = process.env[envName];
  if (!value) {
    throw new Error(`Configuration ${envName} is not specified`);
  }
  return value;
};

export const getNumEnv = (envName: string): number => {
  const value = Number(getStringEnv(envName));
  if (Number.isNaN(value)) {
    throw new Error(`Configuration ${envName} is not a valid number`);
  }
  return value;
};
