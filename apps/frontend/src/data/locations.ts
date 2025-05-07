export interface Locations {
  [country: string]: {
    [state: string]: {
      [district: string]: string[];
    };
  };
}

const locations: Locations = {
  India: {
    "Tamil Nadu": {
      Vellore: ["Sholinghur", "Walajapet", "Arcot"],
      Chennai: ["Guindy", "T Nagar"],
    },
    Kerala: {
      Kollam: ["Paravur", "Kottiyam"],
    },
  },
  USA: {
    California: {
      "Los Angeles": ["Hollywood", "Beverly Hills"],
      "San Francisco": ["Downtown", "Chinatown"],
    },
    Texas: {
      Houston: ["Downtown", "Midtown"],
    },
  },
};

export default locations;
