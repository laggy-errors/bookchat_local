import { prisma } from '../prisma';

export interface ThemePreferenceData {
  themeName?: string;
  fontSize?: string;
  reducedMotion?: boolean;
  highContrast?: boolean;
  largeText?: boolean;
  masterMute?: boolean;
  uiVolume?: number;
  writingVolume?: number;
  ambienceVolume?: number;
}

export class SettingsService {
  async getThemePreference(userId: string) {
    return await prisma.themePreference.findUnique({
      where: { userId },
    });
  }

  async updateThemePreference(
    userId: string,
    data: ThemePreferenceData
  ) {
    return await prisma.themePreference.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        themeName: data.themeName || 'Classic Library',
        fontSize: data.fontSize || 'medium',
        reducedMotion: data.reducedMotion || false,
        highContrast: data.highContrast || false,
        largeText: data.largeText || false,
        masterMute: data.masterMute || false,
        uiVolume: data.uiVolume !== undefined ? data.uiVolume : 0.4,
        writingVolume: data.writingVolume !== undefined ? data.writingVolume : 0.5,
        ambienceVolume: data.ambienceVolume !== undefined ? data.ambienceVolume : 0.2,
      },
    });
  }
}

export const settingsService = new SettingsService();
