import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"), 
  route('/auth', 'routes/auth.tsx'), 
  route('/upload', 'routes/upload.tsx'),
  route('/resume/:id', 'routes/resume.tsx'),
  route('/wipe', 'routes/Wipe.tsx'),
  // Catch-all route for unmatched paths (including DevTools requests)
  route('*', 'routes/404.tsx')
] satisfies RouteConfig;
