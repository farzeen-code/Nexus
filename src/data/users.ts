import { User } from '../types';

// Empty arrays - real users come from API
export const entrepreneurs: any[] = [];
export const investors: any[] = [];
export const users: User[] = [];

// Helper functions that return empty/null for now
export const findUserById = (id: string) => null;
export const getUsersByRole = (role: 'entrepreneur' | 'investor') => [];