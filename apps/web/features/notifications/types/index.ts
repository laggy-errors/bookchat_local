// TODO: Implement notification model structures and preferences schemas.
export interface NotificationPreference {
  id: string;
  type: 'mention' | 'reply' | 'system' | 'library';
  enabled: boolean;
}
