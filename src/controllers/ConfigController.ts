import { resolve } from "dns";

export class ConfigController {

    constructor(){
    }

    async parseParams(archive){
        let fs = require('fs');
        let parser = require('xml2js');
        let json;

        fs.readFile( archive, async function(err, data) {
            await parser.parseString(data, { mergeAttrs: true }, async (err, result) =>{
                return new Promise(resolve => {
                    json = JSON.stringify(result, null, 4);
                    console.log("1");
                    resolve(json);
                })
            });         
         });    
     
        console.log("2");
    };
}