

export class ASTNode {
    constructor(value){
        this.value = value
        this.children = []
    }

    eval(context){
        return null
    }

    add(){
        this.children.push(...arguments)
    }
}