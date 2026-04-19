type DataLayer = Array<Record<string, unknown>>;

interface Window {
  dataLayer: DataLayer; 
}

// eslint-disable-next-line no-var
  declare var dataLayer: DataLayer;