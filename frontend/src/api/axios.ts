import axios from "axios";
import { useAuthStore } from "@/stores/authStore";

export const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (credentials: any) => {
  const response = await axios.post("/api/auth/login", credentials, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" }
  });
  return response.data;
};

export const getMe = async (token: string) => {
  const response = await axios.get("/api/auth/me", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getDashboardStats = async () => {
  const response = await api.get("/dashboard");
  return response.data;
};

export const getUsers = async () => {
  const response = await api.get("/users");
  return response.data.users;
};

export const createUser = async (userData: any) => {
  const response = await api.post("/users", userData);
  return response.data.user;
};
export const getGroups = async () => {
  const response = await api.get("/groups");
  return response.data.groups;
};

export const createGroup = async (groupData: any) => {
  const response = await api.post("/groups", groupData);
  return response.data.group;
};

export const getOUs = async () => {
  const response = await api.get("/ous");
  return response.data.ous;
};

export const createOU = async (ouData: any) => {
  const response = await api.post("/ous", ouData);
  return response.data.ou;
};

export const getComputers = async () => {
  const response = await api.get("/computers");
  return response.data.computers;
};

export const getDnsZones = async () => {
  const response = await api.get("/dns/zones");
  return response.data.zones;
};

export const getDnsRecords = async (zone?: string) => {
  const url = zone ? `/dns/records?zone=${zone}` : "/dns/records";
  const response = await api.get(url);
  return response.data.records;
};

export const createDnsRecord = async (record: any) => {
  const response = await api.post("/dns/records", record);
  return response.data;
};

export const deleteDnsRecord = async (id: number) => {
  const response = await api.delete(`/dns/records/${id}`);
  return response.data;
};

export const getAuditLogs = async () => {
  const response = await api.get("/audit/logs");
  return response.data.logs;
};

export const getBackups = async () => {
  const response = await api.get("/backups");
  return response.data.backups;
};

export const runBackup = async () => {
  const response = await api.post("/backups/run");
  return response.data.backup;
};

export const restoreBackup = async (id: number) => {
  const response = await api.post(`/backups/restore/${id}`);
  return response.data;
};

export const getShares = async () => {
  const response = await api.get("/shares");
  return response.data.shares;
};

export const getShareAcl = async (id: number) => {
  const response = await api.get(`/shares/${id}/acl`);
  return response.data.acl;
};

export const createShare = async (shareData: any) => {
  const response = await api.post("/shares", shareData);
  return response.data.share;
};

export const getSettings = async () => {
  const response = await api.get("/settings");
  return response.data.settings;
};

export const updateSettings = async (settings: any) => {
  const response = await api.post("/settings", settings);
  return response.data.settings;
};
export const getSetupStatus = async () => {
  const response = await api.get("/setup/status");
  return response.data;
};

export const provisionDomain = async (data: any) => {
  const response = await api.post("/setup/provision", data);
  return response.data;
};

export const connectDomain = async (data: any) => {
  const response = await api.post("/setup/connect", data);
  return response.data;
};
