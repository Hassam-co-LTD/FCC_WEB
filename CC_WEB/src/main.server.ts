import "zone.js/node";
import { bootstrapApplication } from "@angular/platform-server";
import { AppComponent } from "./app/app.component";

const bootstrap = () => bootstrapApplication(AppComponent);

export default bootstrap;
