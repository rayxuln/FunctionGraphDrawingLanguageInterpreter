import { RaiixEnumType } from "./RaiixEnumType.js"

//记号类型
export var TokenType = RaiixEnumType(
    "CONST", "VAR",
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

        //用于输出错误信息
        this.start_next = 0
        this.end_next = 0

        if(func != null) this.value = func
    }

    to_string(){
        return "<" + TokenType.to_string(this.type) + ", '" + this.raw_value + "', " + this.value + ">"
    }

    eof(){
        return this.type === TokenType.EOF
    }
}