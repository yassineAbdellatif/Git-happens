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
      { latitude: 45.496831703073426, longitude: -73.57886161006161 },
      { latitude: 45.497164066012594, longitude: -73.57954284420437 },
      { latitude: 45.49770467748888, longitude: -73.57903266885518 },
      { latitude: 45.4973744212895, longitude: -73.57833943058655 },
    ],
  },
  {
    id: "LB",
    name: "LB",
    fullName: "J.W. McConnell Building",
    campus: "SGW",
    info: "Contains the Webster Library, Birks Student Service Centre, and Cinema Politica.",
    coordinates: [
      { latitude: 45.4962608117808, longitude: -73.57770546619393 },
      { latitude: 45.496846013401424, longitude: -73.5771905221769 },
      { latitude: 45.49726071952932, longitude: -73.57805825762689 },
      { latitude: 45.496692417764145, longitude: -73.57859511415528 },
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
      { latitude: 45.495866665347314, longitude: -73.57849513713523 },
      { latitude: 45.495593229550785, longitude: -73.57876461699963 },
      { latitude: 45.49521411588751, longitude: -73.5778789139488 },
      { latitude: 45.495445283059006, longitude: -73.57761131855897 },
    ],
  },
  {
    id: "MB",
    name: "MB",
    fullName: "John Molson Building",
    campus: "SGW",
    info: "Home of the John Molson School of Business.",
    coordinates: [
      { latitude: 45.495520469231906, longitude: -73.5792020907505 }, // top-left
      { latitude: 45.4953576540106, longitude: -73.57936862583686 }, // top-right
      { latitude: 45.49500130207221, longitude: -73.57874192801188 }, // bottom-right
      { latitude: 45.4951856223219, longitude: -73.57853375915393 }, // bottom-left
    ],
  },
  {
    id: "GM",
    name: "GM",
    fullName: "Guy-De Maisonneuve Building",
    campus: "SGW",
    info: "Contains university administrative offices and various classrooms.",
    coordinates: [
      { latitude: 45.49594367960742, longitude: -73.57843753001087 }, // top-left
      { latitude: 45.49612840702602, longitude: -73.5788110982497 }, // top-right
      { latitude: 45.49578275677468, longitude: -73.5791452720197 }, // bottom-right
      { latitude: 45.49561897685144, longitude: -73.57874861047155 }, // bottom-left
    ],
  },
  {
    id: "VA",
    name: "VA",
    fullName: "Visual Arts Building",
    campus: "SGW",
    info: "Dedicated space for the Faculty of Fine Arts.",
    coordinates: [
      { latitude: 45.49618642295494, longitude: -73.5737950018861 }, // top-left
      { latitude: 45.49592636675518, longitude: -73.57327467694199 }, // top-right
      { latitude: 45.495403013501104, longitude: -73.57376883169661 }, // bottom-right
      { latitude: 45.49566846751203, longitude: -73.5743122479844 }, // bottom-left
    ],
  },
  {
    id: "FB",
    name: "FB",
    fullName: "Faubourg Building",
    campus: "SGW",
    info: "Classrooms and the Mel Hoppenheim School of Cinema.",
    coordinates: [
      { latitude: 45.494910677711516, longitude: -73.57778435124267 }, // top-left
      { latitude: 45.49465262793321, longitude: -73.57721900844952 }, // top-right
      { latitude: 45.493628097201814, longitude: -73.57873097173558 }, // bottom-right
      { latitude: 45.493823174208444, longitude: -73.57906842440856 }, // bottom-left
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
      { latitude: 45.459510972578045, longitude: -73.63915299892896 }, // top-left
      { latitude: 45.45908744439003, longitude: -73.63793229118957 }, // top-right
      { latitude: 45.4587280846448, longitude: -73.6382198240618 }, // bottom-right
      { latitude: 45.459034273959844, longitude: -73.63951110805166 }, // bottom-left
    ],
  },
  {
    id: "SP",
    name: "SP",
    fullName: "Administration Building",
    campus: "LOYOLA",
    info: "Main administrative hub for the Loyola Campus.",
    coordinates: [
      { latitude: 45.458359606506505, longitude: -73.64142443063798 }, // top-left
      { latitude: 45.45822874595657, longitude: -73.64108899416341 }, // top-right
      { latitude: 45.45790225416947, longitude: -73.64142066168884 }, // bottom-right
      { latitude: 45.45800800070426, longitude: -73.64168071918036 }, // bottom-left
    ],
  },
  {
    id: "RR",
    name: "RR",
    fullName: "Richard J. Renaud Science Complex",
    campus: "LOYOLA",
    info: "Houses advanced research labs and the Department of Biology.",
    coordinates: [
      { latitude: 45.457998747890386, longitude: -73.64170333287528 }, // top-left
      { latitude: 45.457898288670556, longitude: -73.64142819958714 }, // top-right
      { latitude: 45.45761673753494, longitude: -73.64160910914646 }, // bottom-right
      { latitude: 45.457734381138174, longitude: -73.64188801138376 }, // bottom-left
    ],
  },
  {
    id: "SJB",
    name: "SJB",
    fullName: "Communication Studies and Journalism Building",
    campus: "LOYOLA",
    info: "Contains media labs, radio stations, and journalism facilities.",
    coordinates: [
      { latitude: 45.45751876328547, longitude: -73.63999916817816 }, // top-left
      { latitude: 45.457444466936586, longitude: -73.63975820019054 }, // top-right
      { latitude: 45.45722714955416, longitude: -73.63988265618416 }, // bottom-right
      { latitude: 45.4572819433321, longitude: -73.64009582017319 }, // bottom-left
    ],
  },
  {
    id: "Hive",
    name: "Hive",
    fullName: "Hive cafe and Student Services Building",
    campus: "LOYOLA",
    info: "Student life hub including the Hive Cafe and food services.",
    coordinates: [
      { latitude: 45.4577598134696, longitude: -73.64036854809433 }, // top-left
      { latitude: 45.45764757333694, longitude: -73.64005368011232 }, // top-right
      { latitude: 45.457198610572135, longitude: -73.64040468048572 }, // bottom-right
      { latitude: 45.45732261878991, longitude: -73.64071438669754 }, // bottom-left
    ],
  },
  {
    id: "PY",
    name: "PY",
    fullName: "Psychology Building",
    campus: "LOYOLA",
    info: "Home to the Department of Psychology and research clinics.",
    coordinates: [
      { latitude: 45.45923414686468, longitude: -73.64057235160632 }, // top-left
      { latitude: 45.45906116560649, longitude: -73.64015050736825 }, // top-right
      { latitude: 45.45866967974583, longitude: -73.64045985981015 }, // bottom-right
      { latitude: 45.458813073137804, longitude: -73.64079192694113 }, // bottom-left
    ],
  },
  {
    id: "SFG",
    name: "SFG",
    fullName: "Center for structural and functional genomics",
    campus: "LOYOLA",
    info: "Interdisciplinary research center focusing on aquatic science and nano-science.",
    coordinates: [
      { latitude: 45.45717976633968, longitude: -73.64056919425785 }, // top-left
      { latitude: 45.457059011727615, longitude: -73.64017986647805 }, // top-right
      { latitude: 45.45681843061432, longitude: -73.6404023394951 }, // bottom-right
      { latitude: 45.45695311900883, longitude: -73.64075458843872 }, // bottom-left
    ],
  },
];
