import { RaiixEnumType } from "./RaiixEnumType.js"

export var TokenType = RaiixEnumType(
    "CONST", "T", "FUNC",
    "ORIGIN", "SCALE", "ROT", "IS", "TO", "STEP", "DRAW", "FOR", "FROM",
    "PLUS", "MINUS", "MUL", "DIV", "POW",
    "SEMICO", "L_BRANCKET", "R_BRANCKET", "COMMA",
    "ERR",
    "EOF",
    "COMMENT"
    )


export class Token {
    constructor(type, raw_value, value, func) {
        this.type = type
        this.raw_value = raw_value
        this.value = value
        this.func = func

        if(func != null) this.value = func
    }

    to_string(){
        return "<" + TokenType.to_string(this.type) + ", '" + this.raw_value + "', " + this.value + ">"
    }

    eof(){
        return this.type === TokenType.EOF
    }
}