/**
 * Campus Map Routes
 * Single example route - expand with your team's implementation
 */

export interface Route {
  id: string;
  name: string;
  path: string;
}

export const routes: Route[] = [
  {
    id: 'home',
    name: 'Home',
    path: '/',
  },
];

export const getRouteById = (id: string): Route | undefined => {
  return routes.find(route => route.id === id);
};
