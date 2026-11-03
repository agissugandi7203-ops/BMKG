import { NormalizedEarthquake, SimulationEvent } from './types';

interface GlobalStore {
  latest: NormalizedEarthquake | null;
  events: NormalizedEarthquake[];
  activeSimulation: SimulationEvent | null;
  lastSyncTime: string | null;
  lastSyncStatus: 'SUCCESS' | 'FAILED' | 'NEVER';
  syncError: string | null;
}

// In-memory persistent cache across requests within the Node process
declare global {
  // eslint-disable-next-line no-var
  var __bmkg_store: GlobalStore | undefined;
}

const store: GlobalStore = global.__bmkg_store || {
  latest: null,
  events: [],
  activeSimulation: null,
  lastSyncTime: null,
  lastSyncStatus: 'NEVER',
  syncError: null,
};

if (process.env.NODE_ENV !== 'production') {
  global.__bmkg_store = store;
}

export const memoryStore = {
  getLatest(): NormalizedEarthquake | null {
    return store.latest;
  },

  getAllEvents(): NormalizedEarthquake[] {
    return store.events;
  },

  setEvents(events: NormalizedEarthquake[], latest: NormalizedEarthquake | null) {
    store.events = events;
    if (latest) {
      store.latest = latest;
    } else if (events.length > 0) {
      store.latest = events[0];
    }
    store.lastSyncTime = new Date().toISOString();
    store.lastSyncStatus = 'SUCCESS';
    store.syncError = null;
  },

  recordSyncFailure(errorMsg: string) {
    store.lastSyncStatus = 'FAILED';
    store.syncError = errorMsg;
  },

  getSyncInfo() {
    return {
      lastSyncTime: store.lastSyncTime,
      lastSyncStatus: store.lastSyncStatus,
      syncError: store.syncError,
      totalEvents: store.events.length,
    };
  },

  // Simulation controls
  getActiveSimulation(): SimulationEvent | null {
    return store.activeSimulation;
  },

  setSimulation(sim: Omit<SimulationEvent, 'id' | 'started_at' | 'status' | 'is_active'>): SimulationEvent {
    const simulation: SimulationEvent = {
      ...sim,
      id: 'sim_' + Date.now(),
      status: 'ACTIVE',
      is_active: true,
      started_at: new Date().toISOString(),
      stopped_at: null,
    };
    store.activeSimulation = simulation;
    return simulation;
  },

  stopSimulation(): boolean {
    if (store.activeSimulation) {
      store.activeSimulation.is_active = false;
      store.activeSimulation.status = 'STOPPED';
      store.activeSimulation.stopped_at = new Date().toISOString();
      const stopped = store.activeSimulation;
      store.activeSimulation = null;
      return true;
    }
    return false;
  },
};
