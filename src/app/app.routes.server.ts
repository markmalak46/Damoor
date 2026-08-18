import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Client,
  },
  {
    path: 'login',
    renderMode: RenderMode.Client,
  },
  {
    path: 'register',
    renderMode: RenderMode.Client,
  },
  {
    path: 'forget',
    renderMode: RenderMode.Client,
  },
  {
    path: 'notification',
    renderMode: RenderMode.Client,
  },
  {
    path: 'change',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
