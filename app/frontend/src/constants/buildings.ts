export interface Building {
  id: string;
  name: string;
  fullName: string;
  campus: "SGW" | "LOYOLA";
  coordinates: { latitude: number; longitude: number }[];
  info: string;
}

export const CONCORDIA_BUILDINGS: Building[] = [
  // --- SIR GEORGE WILLIAMS (SGW) CAMPUS ---
  {
    id: "H",
    name: "Hall",
    fullName: "Henry F. Hall Building",
    campus: "SGW",
    info: "Home to the Faculty of Engineering and Computer Science and the 7th floor lounge.",
    coordinates: [
      { latitude: 45.497159, longitude: -73.579554 },
      { latitude: 45.497722, longitude: -73.579022 },
      { latitude: 45.497387, longitude: -73.578305 },
      { latitude: 45.496824, longitude: -73.578837 },
    ],
  },
  {
    id: "LB",
    name: "LB",
    fullName: "J.W. McConnell Building",
    campus: "SGW",
    info: "Contains the Webster Library, Birks Student Service Centre, and Cinema Politica.",
    coordinates: [
      { latitude: 45.497282, longitude: -73.578036 }, 
      { latitude: 45.496910, longitude: -73.577255 }, 
      { latitude: 45.496560, longitude: -73.577590 }, 
      { latitude: 45.496485, longitude: -73.577435 },
      { latitude: 45.496221, longitude: -73.577682 },
      { latitude: 45.496676, longitude: -73.578626 } 
    ],
  },
  {
    id: "EV",
    name: "EV",
    fullName:
      "Engineering, Computer Science and Visual Arts Integrated Complex",
    campus: "SGW",
    info: "State-of-the-art labs and the FOFA Gallery.",
    coordinates: [
      { latitude: 45.495567, longitude: -73.578776 },
      { latitude: 45.495947, longitude: -73.578416 },
      { latitude: 45.495755, longitude: -73.578009 },
      { latitude: 45.496088, longitude: -73.577684 },
      { latitude: 45.495855, longitude: -73.577180 },
      { latitude: 45.495153, longitude: -73.577883 },
    ],
  },
  {
    id: "MB",
    name: "MB",
    fullName: "John Molson Building",
    campus: "SGW",
    info: "Home of the John Molson School of Business.",
    coordinates: [
      { latitude: 45.495531, longitude: -73.579224 },
      { latitude: 45.495197, longitude: -73.578468 },
      { latitude: 45.494941, longitude: -73.578800 },
      { latitude: 45.495129, longitude: -73.579111 },
      { latitude: 45.495189, longitude: -73.579111 },
      { latitude: 45.495377, longitude: -73.579465 },
    ],
  },
  {
    id: "GM",
    name: "GM",
    fullName: "Guy-De Maisonneuve Building",
    campus: "SGW",
    info: "Contains university administrative offices and various classrooms.",
    coordinates: [
      { latitude: 45.496530, longitude: -73.579557 },
      { latitude: 45.496369, longitude: -73.579238 },
      { latitude: 45.496157, longitude: -73.579455 },
      { latitude: 45.496269, longitude: -73.579677 },
      { latitude: 45.496353, longitude: -73.579591 },
      { latitude: 45.496402, longitude: -73.579689 },
    ],
  },
  {
    id: "VA",
    name: "VA",
    fullName: "Visual Arts Building",
    campus: "SGW",
    info: "Dedicated space for the Faculty of Fine Arts.",
    coordinates: [
      { latitude: 45.496172, longitude: -73.573791 },
      { latitude: 45.496051, longitude: -73.573539 },
      { latitude: 45.495780, longitude: -73.573802 },
      { latitude: 45.495634, longitude: -73.573496 },
      { latitude: 45.495356, longitude: -73.573743 },
      { latitude: 45.495615, longitude: -73.574321 },
    ],
  },
  {
    id: "FB",
    name: "FB",
    fullName: "Faubourg Building",
    campus: "SGW",
    info: "Classrooms and the Mel Hoppenheim School of Cinema.",
    coordinates: [
      { latitude: 45.494910, longitude: -73.577770 },
      { latitude: 45.494658, longitude: -73.577181 },
      { latitude: 45.494318, longitude: -73.577578 },
      { latitude: 45.494412, longitude: -73.577718 },
      { latitude: 45.494167, longitude: -73.578082 },
      { latitude: 45.494348, longitude: -73.578409 },
    ],
  },

  // --- LOYOLA CAMPUS ---
  {
    id: "VL",
    name: "VL",
    fullName: "Vanier Library Building",
    campus: "LOYOLA",
    info: "The main library for the Loyola campus.",
    coordinates: [
      { latitude: 45.459095, longitude: -73.637839 },
      { latitude: 45.458568, longitude: -73.638330 },
      { latitude: 45.458825, longitude: -73.639086 },
      { latitude: 45.459318, longitude: -73.638657 },
    ],
  },
  {
    id: "SP",
    name: "SP",
    fullName: "Administration Building",
    campus: "LOYOLA",
    info: "Main administrative hub for the Loyola Campus.",
    coordinates: [
      { latitude: 45.458327, longitude: -73.639403 },
      { latitude: 45.457691, longitude: -73.639831 },
      { latitude: 45.457810, longitude: -73.640190 },
      { latitude: 45.458446, longitude: -73.639762 },
    ],
  },
  {
    id: "RR",
    name: "RR",
    fullName: "Richard J. Renaud Science Complex",
    campus: "LOYOLA",
    info: "Houses advanced research labs and the Department of Biology.",
    coordinates: [
      { latitude: 45.458372, longitude: -73.641435 },
      { latitude: 45.458175, longitude: -73.640937 },
      { latitude: 45.457522, longitude: -73.641462 },
      { latitude: 45.457195, longitude: -73.640636 },
      { latitude: 45.456958, longitude: -73.640826 },
      { latitude: 45.457481, longitude: -73.642150 },
    ],
  },
  {
    id: "SJB",
    name: "SJB",
    fullName: "Communication Studies and Journalism Building",
    campus: "LOYOLA",
    info: "Contains media labs, radio stations, and journalism facilities.",
    coordinates: [
      { latitude: 45.457846, longitude: -73.640509 },
      { latitude: 45.457488, longitude: -73.639603 },
      { latitude: 45.457037, longitude: -73.639946 },
      { latitude: 45.457383, longitude: -73.640857 },
    ],
  },
  {
    id: "Hive",
    name: "Hive",
    fullName: "Hive cafe and Student Services Building",
    campus: "LOYOLA",
    info: "Student life hub including the Hive Cafe and food services.",
    coordinates: [
      { latitude: 45.459106, longitude: -73.639467 },
      { latitude: 45.459516, longitude: -73.639160 },
      { latitude: 45.459371, longitude: -73.638716 },
      { latitude: 45.458942, longitude: -73.639081 },
    ],
  },
  {
    id: "PY",
    name: "PY",
    fullName: "Psychology Building",
    campus: "LOYOLA",
    info: "Home to the Department of Psychology and research clinics.",
    coordinates: [
      { latitude: 45.459083, longitude: -73.640084 },
      { latitude: 45.458619, longitude: -73.640434 },
      { latitude: 45.458801, longitude: -73.640922 },
      { latitude: 45.459264, longitude: -73.640572 },
    ],
  },
  {
    id: "SFG",
    name: "SFG",
    fullName: "Center for structural and functional genomics",
    campus: "LOYOLA",
    info: "Interdisciplinary research center focusing on aquatic science and nano-science.",
    coordinates: [
  { latitude: 45.458233, longitude: -73.641693 },
  { latitude: 45.458417, longitude: -73.642171 },
  { latitude: 45.458750, longitude: -73.641910 },
  { latitude: 45.458566, longitude: -73.641432 },
],
  },
];
