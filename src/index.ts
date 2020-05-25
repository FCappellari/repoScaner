import { ConflictController }  from "./controllers/ConflictController";
import { ConfigController }    from "./controllers/ConfigController";

start();

async function start() {
    const outParams        = process.argv.slice(2);
    const configController = new ConfigController(outParams[0]);
    const params           = JSON.parse(await configController.parseParams());

    const conflictController = new ConflictController(params.note.customer, 
                                                    params.note.version, 
                                                    params.note.technology, 
                                                    params.note.gitDirectory);

    conflictController.run();
};