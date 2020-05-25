const fs = require('fs');
const parser = require('xml2js');

export class ConfigController {

    archive:string;

    constructor(archive){
        this.archive = archive;
    }

    async parseParams(){
        let json = await readXMLConvertJson(fs, this.archive, parser);
    
        return new Promise<string>(resolve => {
            resolve(json);
        });
    };
};

function readXMLConvertJson(fs, archive, parser){
    return new Promise<string>(resolve  => {
        fs.readFile( archive, function(err, data) {
            if (err !== null){
                console.log("Problemas com o arquivo: " + archive);
                return;
            }
            parser.parseString(data, { mergeAttrs: true },  (err, result) =>{
                resolve(JSON.stringify(result, null, 4));
            })
        });         
     });
} 