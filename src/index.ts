import { ConflictController }  from "./controllers/ConflictController";
import { ConfigController }    from "./controllers/ConfigController";

const params = process.argv.slice(2);

console.log(params[0]);

let configController = new ConfigController();
let variables = configController.parseParams(params[0]);

let conflictController = new ConflictController(variables);
conflictController.run();