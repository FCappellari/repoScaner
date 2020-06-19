import { GenerationController }  from "./controllers/generation.controller";
import { ConfigController }    from "./controllers/config.controller";
import { ConfigDTO } from "./models/config.model";

const outParams = process.argv.slice(2);

if (outParams[0] == "allRepository"){
    allRepository();
} else if(outParams[0] == "branch"){
    oneBranch();
};

async function allRepository() {
    const configController   = new ConfigController();
    const config : ConfigDTO = await configController.parseParams(outParams[1]);

    const generationController = new GenerationController(config);
    await generationController.allRepository();

    console.log("Processo concluido!");
};

async function oneBranch(){
    const configController   = new ConfigController();
    const config : ConfigDTO = await configController.parseParams(outParams[2]);

    const generationController = new GenerationController(config);
    await generationController.oneBranch(outParams[1]);

    console.log("Processo concluido!");
};