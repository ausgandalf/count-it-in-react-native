export type SettingsType = {
    theme: 'light' | 'dark' | '',
    apiUrl: string,
    versionUrl: string,
    version: number,
}

export const Settings:SettingsType = {
    theme: '',
    apiUrl: 'https://countitin.com/api/songs',
    versionUrl: 'https://countitin.com/api/version',
    version: 0,
}