export type SettingsType = {
    theme: 'light' | 'dark' | '',
    url: string,
}

export const Settings:SettingsType = {
    theme: '',
    url: 'https://countitin.com/api/songs',
}