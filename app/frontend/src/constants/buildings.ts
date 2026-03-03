import { isPointInPolygon } from "geolib";

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
      { latitude: 45.497159, longitude: -73.579554 },
      { latitude: 45.497722, longitude: -73.579022 },
      { latitude: 45.497387, longitude: -73.578305 },
      { latitude: 45.496824, longitude: -73.578837 },
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
      { latitude: 45.497282, longitude: -73.578036 }, 
      { latitude: 45.496910, longitude: -73.577255 }, 
      { latitude: 45.496560, longitude: -73.577590 }, 
      { latitude: 45.496485, longitude: -73.577435 },
      { latitude: 45.496221, longitude: -73.577682 },
      { latitude: 45.496676, longitude: -73.578626 },
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
      { latitude: 45.495567, longitude: -73.578776 },
      { latitude: 45.495947, longitude: -73.578416 },
      { latitude: 45.495755, longitude: -73.578009 },
      { latitude: 45.496088, longitude: -73.577684 },
      { latitude: 45.495855, longitude: -73.577180 },
      { latitude: 45.495153, longitude: -73.577883 },
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
      { latitude: 45.495531, longitude: -73.579224 },
      { latitude: 45.495197, longitude: -73.578468 },
      { latitude: 45.494941, longitude: -73.578800 },
      { latitude: 45.495129, longitude: -73.579111 },
      { latitude: 45.495189, longitude: -73.579111 },
      { latitude: 45.495377, longitude: -73.579465 },
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
      { latitude: 45.496172, longitude: -73.573791 },
      { latitude: 45.496051, longitude: -73.573539 },
      { latitude: 45.495780, longitude: -73.573802 },
      { latitude: 45.495634, longitude: -73.573496 },
      { latitude: 45.495356, longitude: -73.573743 },
      { latitude: 45.495615, longitude: -73.574321 },
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
      { latitude: 45.494910, longitude: -73.577770 },
      { latitude: 45.494658, longitude: -73.577181 },
      { latitude: 45.494318, longitude: -73.577578 },
      { latitude: 45.494412, longitude: -73.577718 },
      { latitude: 45.494167, longitude: -73.578082 },
      { latitude: 45.494348, longitude: -73.578409 },
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
      { latitude: 45.459095, longitude: -73.637839 },
      { latitude: 45.458727, longitude: -73.638365 }, 
      { latitude: 45.458795, longitude: -73.638598 }, 
      { latitude: 45.458679, longitude: -73.638684 }, 
      { latitude: 45.458825, longitude: -73.639086 },
      { latitude: 45.459318, longitude: -73.638657 },
    ],
    image:
      "https://www.concordia.ca/content/dam/concordia/now/2014/02/vanier-library-620.jpg",
  },
  {
    id: "AD",
    name: "AD",
    fullName: "Administration Building",
    campus: "LOYOLA",
    info: "The iconic administrative heart of the Loyola campus. Houses the Dean's offices, recruitment services, and general administrative support for faculty and staff.",
    coordinates: [
      { latitude: 45.458327, longitude: -73.639403 },
      { latitude: 45.457691, longitude: -73.639831 },
      { latitude: 45.457810, longitude: -73.640190 },
      { latitude: 45.458446, longitude: -73.639762 },
    ],
    image:
      "https://www.concordia.ca/content/shared/en/news/main/stories/2019/10/08/this-work-is-far-more-than-a-landscaping-facelift.img.png/1570558584455.jpg",
  },
  {
    id: "SP",
    name: "SP",
    fullName: "Richard J. Renaud Science Complex",
    campus: "LOYOLA",
    info: "A massive, ultra-modern science facility housing advanced labs for Biology, Chemistry, and Physics. Features a large, sunlit atrium often used for science fairs and events.",
    coordinates: [
      { latitude: 45.458372, longitude: -73.641435 },
      { latitude: 45.458175, longitude: -73.640937 },
      { latitude: 45.457522, longitude: -73.641462 },
      { latitude: 45.457195, longitude: -73.640636 },
      { latitude: 45.456958, longitude: -73.640826 },
      { latitude: 45.457481, longitude: -73.642150 },
    ],
    image:
      "https://jlp.ca/image/1/955/0/uploads/media/complexe-sciences-concordia_04-fr-1509468196.jpg",
  },
  {
    id: "CJ",
    name: "CJ",
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
      { latitude: 45.459106, longitude: -73.639467 },
      { latitude: 45.459516, longitude: -73.639160 },
      { latitude: 45.459371, longitude: -73.638716 },
      { latitude: 45.458942, longitude: -73.639081 },
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
      { latitude: 45.459083, longitude: -73.640084 },
      { latitude: 45.458619, longitude: -73.640434 },
      { latitude: 45.458801, longitude: -73.640922 },
      { latitude: 45.459264, longitude: -73.640572 },
    ],
    image:
      "https://www.concordia.ca/content/concordia/en/maps/buildings/py.img.png/1754585849970.jpg",
  },
  {
    id: "GE",
    name: "GE",
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
  {
    id: "CC",
    name: "CC",
    fullName: "Central Building",
    campus: "LOYOLA",
    info: "Central Building  includes classrooms, the Guadagni Lounge and the student-run campus radio station, CJLO.",
    coordinates: [
      { latitude: 45.458534, longitude: -73.640691 }, // top-left
      { latitude: 45.458218, longitude: -73.639893 }, // top-right
      { latitude: 45.458073, longitude: -73.639997 }, // bottom-right
      { latitude: 45.458366, longitude: -73.640828 }, // bottom-left
    ],
    image:
      "https://www.concordia.ca/content/concordia/en/maps/buildings/cc/_jcr_content/content-main/grid_container_307846512/grid-container-parsys/box_427340212/box-parsys/image.img.jpg/1750701910958.jpg",
  },
  {
    id: "VE",
    name: "VE",
    fullName: "Vanier Extension",
    campus: "LOYOLA",
    info: "Vanier Extension offers flexible, digitally equipped classrooms and also houses spaces for the Department of Applied Human Sciences.",
    coordinates: [
      { latitude: 45.458607, longitude: -73.638470 }, // top-left n
      { latitude: 45.458727, longitude: -73.638365 }, // top-right
      { latitude: 45.458795, longitude: -73.638598 }, // bottom-right
      { latitude: 45.458679, longitude: -73.638684 }, // bottom-left
    ],
    image:
      "https://www.concordia.ca/content/concordia/en/maps/buildings/ve/_jcr_content/content-main/grid_container_307846512/grid-container-parsys/box_427340212/box-parsys/image.img.jpg/1754323922442.jpg",
  }
];

export const getDisplayStatus = (
  userLocation: { latitude: number; longitude: number } | null,
  currentRegion: { latitude: number; longitude: number },
  selectedBuilding: Building | null, 
  currentBuilding: Building | null
): string => {
  // 1. If we don't have a user location, default to the Map's Center Campus
  if (!userLocation) {
    return "--";
  }

  // 2. If the user clicked a building, show that building's name
  if (selectedBuilding) {
    return selectedBuilding.name;
  }

  if (currentBuilding) {
    return currentBuilding.name;
  }

  // 3. Check if the user's point is inside any building's polygon
  const buildingInside = CONCORDIA_BUILDINGS.find((building: Building) =>
    isPointInPolygon(userLocation, building.coordinates)
  );

  // 4. Return the building name if found, otherwise return the Campus name
  if (buildingInside) {
    return buildingInside.name;
  }

  return "--";
};

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

