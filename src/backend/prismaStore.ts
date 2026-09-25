import { postgresStore } from './postgresStore';

// Database store re-export for backwards compatibility
export const prismaStore = postgresStore;
export default postgresStore;
