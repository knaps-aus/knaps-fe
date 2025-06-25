import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { ReactKeycloakProvider } from "@react-keycloak/web";
import { keycloak } from "./keycloak";
ReactDOM.render(
  <ReactKeycloakProvider authClient={keycloak}>
    <App />
  </ReactKeycloakProvider>,
  document.getElementById("root")
);


const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'dist', 'public');

app.use(express.static(publicDir));

app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Client service listening on port ${port}`);
});
