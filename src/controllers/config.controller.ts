import { ConfigDTO } from "../models/config.model";

const fs = require('fs');

export class ConfigController {

    constructor(){
    }

    async parseParams(archive){

        const config : ConfigDTO = JSON.parse(await readXMLConvertJson(fs, archive));

        return new Promise<ConfigDTO>(resolve  => {
            resolve(config);
        });
    };
};

function readXMLConvertJson(fs, archive){
    return new Promise<string>(resolve  => {
        fs.readFile( archive, function(err, data) {
            if (err !== null){
                console.log("Problemas com o arquivo: " + archive);
                return;
            }
            resolve(data);
        });         
     });
} 