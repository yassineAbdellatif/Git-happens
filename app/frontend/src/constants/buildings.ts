export interface Building {
  id: string;
  name: string;
  fullName: string;
  campus: "SGW" | "LOYOLA";
  coordinates: { latitude: number; longitude: number }[];
  info: string;
  image?: string;
}

export const CONCORDIA_BUILDINGS: Building[] = [
  // --- SIR GEORGE WILLIAMS (SGW) CAMPUS ---
  {
    id: "H",
    name: "Hall",
    fullName: "Henry F. Hall Building",
    campus: "SGW",
    info: "The central hub of SGW campus. Houses the Gina Cody School of Engineering, large lecture theatres, the 7th-floor student lounge, and the DB Clarke Theatre. Features a popular cafeteria and tunnel access to the LB building.",
    coordinates: [
      { latitude: 45.496831703073426, longitude: -73.57886161006161 },
      { latitude: 45.497164066012594, longitude: -73.57954284420437 },
      { latitude: 45.49770467748888, longitude: -73.57903266885518 },
      { latitude: 45.4973744212895, longitude: -73.57833943058655 },
    ],
    image: "https://live.staticflickr.com/6102/6310030294_ed7366df3f_b.jpg",
  },
  {
    id: "LB",
    name: "LB",
    fullName: "J.W. McConnell Building",
    campus: "SGW",
    info: "Home to the Webster Library (open 24/7), the Birks Student Service Centre, and Cinema Politica. It also contains the Leonard & Bina Ellen Art Gallery and is the primary gateway to the Guy-Concordia Metro station via the underground tunnel.",
    coordinates: [
      { latitude: 45.4962608117808, longitude: -73.57770546619393 },
      { latitude: 45.496846013401424, longitude: -73.5771905221769 },
      { latitude: 45.49726071952932, longitude: -73.57805825762689 },
      { latitude: 45.496692417764145, longitude: -73.57859511415528 },
    ],
    image:
      "https://thelinknewspaper.ca/images/articles/Stock%20Images/_resized/STOCK.LBBuilding.EmanueleBarbier.jpg",
  },
  {
    id: "EV",
    name: "EV",
    fullName:
      "Engineering, Computer Science and Visual Arts Integrated Complex",
    campus: "SGW",
    info: "A modern glass landmark featuring state-of-the-art engineering labs and the FOFA Gallery. It offers bright study spaces, a popular Le Frigo Vert grocery, and direct indoor connections to the MB and GM buildings.",
    coordinates: [
      { latitude: 45.495866665347314, longitude: -73.57849513713523 },
      { latitude: 45.495593229550785, longitude: -73.57876461699963 },
      { latitude: 45.49521411588751, longitude: -73.5778789139488 },
      { latitude: 45.495445283059006, longitude: -73.57761131855897 },
    ],
    image:
      "https://nck.ca/wp-content/uploads/2021/08/NCK-Universite-Concordia-University-Pavillon-EV-Montreal-2021-1-1401x2000.jpg",
  },
  {
    id: "MB",
    name: "MB",
    fullName: "John Molson Building",
    campus: "SGW",
    info: "The flagship building for the John Molson School of Business. It features a stunning tiered atrium, several private study rooms, a trading lab, and a direct tunnel link to the Guy-Concordia Metro.",
    coordinates: [
      { latitude: 45.495520469231906, longitude: -73.5792020907505 }, // top-left
      { latitude: 45.4953576540106, longitude: -73.57936862583686 }, // top-right
      { latitude: 45.49500130207221, longitude: -73.57874192801188 }, // bottom-right
      { latitude: 45.4951856223219, longitude: -73.57853375915393 }, // bottom-left
    ],
    image:
      "https://images.squarespace-cdn.com/content/v1/597b8962ebbd1a681f3b6efb/1520004557787-X66JBMR6FDIRR5A6PV9O/John+Molson+School+of+Business.jpg?format=original",
  },
  {
    id: "GM",
    name: "GM",
    fullName: "Guy-De Maisonneuve Building",
    campus: "SGW",
    info: "A multi-use building housing university administrative offices, Human Resources, and several high-traffic classrooms. It is connected to the EV building via a 2nd-floor walkway.",
    coordinates: [
      { latitude: 45.49594367960742, longitude: -73.57843753001087 }, // top-left
      { latitude: 45.49612840702602, longitude: -73.5788110982497 }, // top-right
      { latitude: 45.49578275677468, longitude: -73.5791452720197 }, // bottom-right
      { latitude: 45.49561897685144, longitude: -73.57874861047155 }, // bottom-left
    ],
    image: "https://photos.wikimapia.org/p/00/01/61/95/80_big.jpg",
  },
  {
    id: "VA",
    name: "VA",
    fullName: "Visual Arts Building",
    campus: "SGW",
    info: "Dedicated to the Faculty of Fine Arts, this building contains specialized studios for painting, drawing, and sculpture. It features gallery spaces and student-run exhibition areas.",
    coordinates: [
      { latitude: 45.49618642295494, longitude: -73.5737950018861 }, // top-left
      { latitude: 45.49592636675518, longitude: -73.57327467694199 }, // top-right
      { latitude: 45.495403013501104, longitude: -73.57376883169661 }, // bottom-right
      { latitude: 45.49566846751203, longitude: -73.5743122479844 }, // bottom-left
    ],
    image:
      "https://thelinknewspaper.ca/images/articles/Stock%20Images/_resized/STOCK.VABuilding.EmanueleBarbier.jpg",
  },
  {
    id: "FB",
    name: "FB",
    fullName: "Faubourg Building",
    campus: "SGW",
    info: "Located in a former shopping mall, it houses the Mel Hoppenheim School of Cinema and the Department of Education. Features a food court on the ground level and large, quiet classrooms on the upper floors.",
    coordinates: [
      { latitude: 45.494910677711516, longitude: -73.57778435124267 }, // top-left
      { latitude: 45.49465262793321, longitude: -73.57721900844952 }, // top-right
      { latitude: 45.493628097201814, longitude: -73.57873097173558 }, // bottom-right
      { latitude: 45.493823174208444, longitude: -73.57906842440856 }, // bottom-left
    ],
    image:
      "https://thelinknewspaper.ca/images/articles/Volume_37/News/_resized/19ca.refugeecenter(nikolas_litzenberger).jpg",
  },

  // --- LOYOLA CAMPUS ---
  {
    id: "VL",
    name: "VL",
    fullName: "Vanier Library Building",
    campus: "LOYOLA",
    info: "The primary research and study hub for the Loyola campus. It offers 24/7 access during exam periods, specialized science resources, and silent study zones overlooking the campus greenery.",
    coordinates: [
      { latitude: 45.459510972578045, longitude: -73.63915299892896 }, // top-left
      { latitude: 45.45908744439003, longitude: -73.63793229118957 }, // top-right
      { latitude: 45.4587280846448, longitude: -73.6382198240618 }, // bottom-right
      { latitude: 45.459034273959844, longitude: -73.63951110805166 }, // bottom-left
    ],
    image:
      "https://www.concordia.ca/content/dam/concordia/now/2014/02/vanier-library-620.jpg",
  },
  {
    id: "SP",
    name: "SP",
    fullName: "Administration Building",
    campus: "LOYOLA",
    info: "The iconic administrative heart of the Loyola campus. Houses the Dean's offices, recruitment services, and general administrative support for faculty and staff.",
    coordinates: [
      { latitude: 45.458359606506505, longitude: -73.64142443063798 }, // top-left
      { latitude: 45.45822874595657, longitude: -73.64108899416341 }, // top-right
      { latitude: 45.45790225416947, longitude: -73.64142066168884 }, // bottom-right
      { latitude: 45.45800800070426, longitude: -73.64168071918036 }, // bottom-left
    ],
    image:
      "https://www.concordia.ca/content/shared/en/news/main/stories/2019/10/08/this-work-is-far-more-than-a-landscaping-facelift.img.png/1570558584455.jpg",
  },
  {
    id: "RR",
    name: "RR",
    fullName: "Richard J. Renaud Science Complex",
    campus: "LOYOLA",
    info: "A massive, ultra-modern science facility housing advanced labs for Biology, Chemistry, and Physics. Features a large, sunlit atrium often used for science fairs and events.",
    coordinates: [
      { latitude: 45.457998747890386, longitude: -73.64170333287528 }, // top-left
      { latitude: 45.457898288670556, longitude: -73.64142819958714 }, // top-right
      { latitude: 45.45761673753494, longitude: -73.64160910914646 }, // bottom-right
      { latitude: 45.457734381138174, longitude: -73.64188801138376 }, // bottom-left
    ],
    image:
      "https://jlp.ca/image/1/955/0/uploads/media/complexe-sciences-concordia_04-fr-1509468196.jpg",
  },
  {
    id: "SJB",
    name: "SJB",
    fullName: "Communication Studies and Journalism Building",
    campus: "LOYOLA",
    info: "Home to the Department of Journalism and Communication Studies. Equipped with professional TV studios, sound recording booths, and digital editing suites.",
    coordinates: [
      { latitude: 45.45751876328547, longitude: -73.63999916817816 }, // top-left
      { latitude: 45.457444466936586, longitude: -73.63975820019054 }, // top-right
      { latitude: 45.45722714955416, longitude: -73.63988265618416 }, // bottom-right
      { latitude: 45.4572819433321, longitude: -73.64009582017319 }, // bottom-left
    ],
    image:
      "https://archive.org/download/de8090d2-aeea-4ce4-90a0-a17f449f2d77/131_CJ_night.jpg",
  },
  {
    id: "Hive",
    name: "Hive",
    fullName: "Hive cafe and Student Services Building",
    campus: "LOYOLA",
    info: "The social hub of Loyola. Contains the Hive Cafe (vegan-friendly), student union offices, and a multi-faith space. Great for community events and grabbing a coffee between classes.",
    coordinates: [
      { latitude: 45.4577598134696, longitude: -73.64036854809433 }, // top-left
      { latitude: 45.45764757333694, longitude: -73.64005368011232 }, // top-right
      { latitude: 45.457198610572135, longitude: -73.64040468048572 }, // bottom-right
      { latitude: 45.45732261878991, longitude: -73.64071438669754 }, // bottom-left
    ],
    image: "https://hivecafe.ca/loyolaSpace3.jpg",
  },
  {
    id: "PY",
    name: "PY",
    fullName: "Psychology Building",
    campus: "LOYOLA",
    info: "Focuses on the Department of Psychology, housing specialized research labs, observation rooms, and the Applied Psychology Centre clinic.",
    coordinates: [
      { latitude: 45.45923414686468, longitude: -73.64057235160632 }, // top-left
      { latitude: 45.45906116560649, longitude: -73.64015050736825 }, // top-right
      { latitude: 45.45866967974583, longitude: -73.64045985981015 }, // bottom-right
      { latitude: 45.458813073137804, longitude: -73.64079192694113 }, // bottom-left
    ],
    image:
      "https://www.concordia.ca/content/concordia/en/maps/buildings/py.img.png/1754585849970.jpg",
  },
  {
    id: "SFG",
    name: "SFG",
    fullName: "Center for structural and functional genomics",
    campus: "LOYOLA",
    info: "A cutting-edge research facility dedicated to genomic studies. It brings together researchers from Biology, Chemistry, and Physics to study molecular life sciences.",
    coordinates: [
      { latitude: 45.45717976633968, longitude: -73.64056919425785 }, // top-left
      { latitude: 45.457059011727615, longitude: -73.64017986647805 }, // top-right
      { latitude: 45.45681843061432, longitude: -73.6404023394951 }, // bottom-right
      { latitude: 45.45695311900883, longitude: -73.64075458843872 }, // bottom-left
    ],
    image:
      "https://www.concordia.ca/content/concordia/en/research/genomics/contact/_jcr_content/content-main/image.img.jpg/1449604501174.jpg",
  },
];


export const SGW_REGION = {
  latitude: 45.4971,
  longitude: -73.5788,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

export const LOYOLA_REGION = {
  latitude: 45.4582,
  longitude: -73.6405,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

