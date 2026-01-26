export interface Building {
  id: string;
  name: string;
  fullName: string;
  campus: 'SGW' | 'LOYOLA';
  coordinates: { latitude: number; longitude: number }[];
  info: string;
  
}

export const CONCORDIA_BUILDINGS: Building[] = [
  // --- SIR GEORGE WILLIAMS (SGW) CAMPUS ---
  {
    id: 'H',
    name: 'Hall',
    fullName: 'Henry F. Hall Building',
    campus: 'SGW',
    info: 'Home to the Faculty of Engineering and Computer Science and the 7th floor lounge.',
    coordinates: [
      { latitude: 45.4971, longitude: -73.5788 },
      { latitude: 45.4968, longitude: -73.5791 },
      { latitude: 45.4973, longitude: -73.5798 },
      { latitude: 45.4976, longitude: -73.5795 },
    ],
  },
  {
    id: 'LB',
    name: 'LB',
    fullName: 'J.W. McConnell Building',
    campus: 'SGW',
    info: 'Contains the Webster Library, Birks Student Service Centre, and Cinema Politica.',
    coordinates: [
      { latitude: 45.4966, longitude: -73.5779 },
      { latitude: 45.4962, longitude: -73.5785 },
      { latitude: 45.4967, longitude: -73.5791 },
      { latitude: 45.4971, longitude: -73.5785 },
    ],
  },
  {
    id: 'EV',
    name: 'EV',
    fullName: 'Engineering, Computer Science and Visual Arts Integrated Complex',
    campus: 'SGW',
    info: 'State-of-the-art labs and the FOFA Gallery.',
    coordinates: [
      { latitude: 45.4954, longitude: -73.5779 },
      { latitude: 45.4951, longitude: -73.5784 },
      { latitude: 45.4957, longitude: -73.5792 },
      { latitude: 45.4960, longitude: -73.5787 },
    ],
  },
  {
    id: 'MB',
    name: 'MB',
    fullName: 'John Molson Building',
    campus: 'SGW',
    info: 'Home of the John Molson School of Business.',
    coordinates: [
      { latitude: 45.4951, longitude: -73.5792 },
      { latitude: 45.4947, longitude: -73.5797 },
      { latitude: 45.4952, longitude: -73.5804 },
      { latitude: 45.4956, longitude: -73.5799 },
    ],
  },
  {
    id: 'GM',
    name: 'GM',
    fullName: 'Guy-De Maisonneuve Building',
    campus: 'SGW',
    info: 'Contains university administrative offices and various classrooms.',
    coordinates: [
      { latitude: 45.4961, longitude: -73.5796 },
      { latitude: 45.4958, longitude: -73.5801 },
      { latitude: 45.4963, longitude: -73.5807 },
      { latitude: 45.4966, longitude: -73.5802 },
    ],
  },
  {
    id: 'VA',
    name: 'VA',
    fullName: 'Visual Arts Building',
    campus: 'SGW',
    info: 'Dedicated space for the Faculty of Fine Arts.',
    coordinates: [
      { latitude: 45.4956, longitude: -73.5739 },
      { latitude: 45.4953, longitude: -73.5744 },
      { latitude: 45.4958, longitude: -73.5750 },
      { latitude: 45.4961, longitude: -73.5745 },
    ],
  },
  {
    id: 'FB',
    name: 'FB',
    fullName: 'Faubourg Building',
    campus: 'SGW',
    info: 'Classrooms and the Mel Hoppenheim School of Cinema.',
    coordinates: [
      { latitude: 45.4947, longitude: -73.5777 },
      { latitude: 45.4943, longitude: -73.5782 },
      { latitude: 45.4948, longitude: -73.5788 },
      { latitude: 45.4952, longitude: -73.5783 },
    ],
  },

  // --- LOYOLA CAMPUS ---
  {
    id: 'VL',
    name: 'VL',
    fullName: 'Vanier Library Building',
    campus: 'LOYOLA',
    info: 'The main library for the Loyola campus.',
    coordinates: [
      { latitude: 45.4592, longitude: -73.6385 },
      { latitude: 45.4589, longitude: -73.6391 },
      { latitude: 45.4594, longitude: -73.6397 },
      { latitude: 45.4597, longitude: -73.6391 },
    ],
  },
  {
    id: 'AD',
    name: 'AD',
    fullName: 'Administration Building',
    campus: 'LOYOLA',
    info: 'Main administrative hub for the Loyola Campus.',
    coordinates: [
      { latitude: 45.4581, longitude: -73.6398 },
      { latitude: 45.4578, longitude: -73.6403 },
      { latitude: 45.4583, longitude: -73.6409 },
      { latitude: 45.4586, longitude: -73.6404 },
    ],
  },
  {
    id: 'SP',
    name: 'SP',
    fullName: 'Richard J. Renaud Science Complex',
    campus: 'LOYOLA',
    info: 'Houses advanced research labs and the Department of Biology.',
    coordinates: [
      { latitude: 45.4577, longitude: -73.6417 },
      { latitude: 45.4573, longitude: -73.6423 },
      { latitude: 45.4578, longitude: -73.6430 },
      { latitude: 45.4582, longitude: -73.6424 },
    ],
  },
  {
    id: 'CJ',
    name: 'CJ',
    fullName: 'Communication Studies and Journalism Building',
    campus: 'LOYOLA',
    info: 'Contains media labs, radio stations, and journalism facilities.',
    coordinates: [
      { latitude: 45.4574, longitude: -73.6404 },
      { latitude: 45.4570, longitude: -73.6410 },
      { latitude: 45.4575, longitude: -73.6417 },
      { latitude: 45.4579, longitude: -73.6411 },
    ],
  },
  {
    id: 'SC',
    name: 'SC',
    fullName: 'Student Centre',
    campus: 'LOYOLA',
    info: 'Student life hub including the Hive Cafe and food services.',
    coordinates: [
      { latitude: 45.4591, longitude: -73.6413 },
      { latitude: 45.4588, longitude: -73.6419 },
      { latitude: 45.4593, longitude: -73.6425 },
      { latitude: 45.4596, longitude: -73.6419 },
    ],
  },
  {
    id: 'PY',
    name: 'PY',
    fullName: 'Psychology Building',
    campus: 'LOYOLA',
    info: 'Home to the Department of Psychology and research clinics.',
    coordinates: [
      { latitude: 45.4588, longitude: -73.6405 },
      { latitude: 45.4585, longitude: -73.6411 },
      { latitude: 45.4590, longitude: -73.6417 },
      { latitude: 45.4593, longitude: -73.6411 },
    ],
  },
  {
    id: 'HU',
    name: 'HU',
    fullName: 'Applied Science Hub',
    campus: 'LOYOLA',
    info: 'Interdisciplinary research center focusing on aquatic science and nano-science.',
    coordinates: [
      { latitude: 45.4584, longitude: -73.6426 },
      { latitude: 45.4580, longitude: -73.6432 },
      { latitude: 45.4585, longitude: -73.6438 },
      { latitude: 45.4589, longitude: -73.6432 },
    ],
  },
];