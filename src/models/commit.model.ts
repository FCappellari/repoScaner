export class Commit {
    
    public author_email:String = "";
    public author_name:String = "";
    public body:String = "";
    public date:String = "";
    public hash:String = "";
    public message:String = "";
    public refs:String = "";
    public previousHash:String = "";

    constructor(logline?:any){
        this.author_email= logline.author_email
        this.author_name= logline.author_name
        this.body= logline.body
        this.date= logline.date
        this.hash= logline.hash
        this.message= logline.message
        this.refs= logline.refs
        this.previousHash= logline.previousHash
        this.author_email = logline.author_email
    }
}