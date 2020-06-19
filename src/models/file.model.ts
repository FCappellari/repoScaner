export class File{
    
    public type: Number = 0;
    public fileName: string = "";
    public repository: string = "";

    constructor(fileName:string, repository:string){
        this.fileName = fileName;
        this.repository = repository;

        if(this.fileName.indexOf(".i") != -1)
            this.type = FileType.Include;
        else if(this.fileName.indexOf(".f") != -1)
            this.type = FileType.Frame;
        else this.type = FileType.Programa;
    }
}

export enum FileType{
    Programa = 1,
    Include,
    Frame
}