export type DeviceStatus = 'online' | 'offline';

export interface Device {
  id: string;
  userId: string;
  name: string;
  platform: 'windows' | 'mac' | 'linux';
  status: DeviceStatus;
  agentVersion: string | null;
  lastSeenAt: string | null;
}

export type ActivityStatus = 'pending' | 'dispatched' | 'success' | 'error' | 'rejected';

export interface ActivityLog {
  id: string;
  userId: string;
  deviceId: string | null;
  actionType: string;
  payload: Record<string, unknown>;
  status: ActivityStatus;
  output: string | null;
  error: string | null;
  createdAt: string;
}
