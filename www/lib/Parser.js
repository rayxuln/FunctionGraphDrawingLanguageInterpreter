import { ASTNode } from "./ASTNode.js"
import { TokenType } from "./Token.js"
import { RaiixEnumType } from "./RaiixEnumType.js"
import { RaiixTest } from "./RaiixTest.js"
import { Scanner } from "./Scanner.js"
import { Vector } from "./Vector.js"

export var ParserErrorType = RaiixEnumType(
    "MATCH_ERROR",
    "UNKOWN_STATEMENT",
    "UNEXPECTED_TERM"
)
ParserErrorType.__name__ = {
    0: "缺失",
    1: "无法识别的语句",
    2: "无法识别的记号"
}

//用于输出错误
const TOKENTYPE_TRANSLATE_TABLE = {
    "PLUS": '+', 
    "MINUS": '-', 
    "MUL": '*', 
    "DIV": '/', 
    "POW": '**',
    "SEMICO": ';', 
    "L_BRANCKET": '(', 
    "R_BRANCKET": ')', 
    "COMMA": ',',
}

class Program extends ASTNode {
    constructor(){
        super(null)
        this.children.push(...arguments)
    }

    eval(context){
        //初始化
        context.symbol_table["T"] = 0
        context.symbol_table["ORIGIN"] = Vector.ZERO2()
        context.symbol_table["SCALE"] = new Vector(1, 1)
        context.symbol_table["ROT"] = 0

        //重置坐标变换
        // let ctx = context.canvas_context
        // ctx.resetTransform()

        for(let c of this.children)
        {
            c.eval(context)
        }
        return null
    }
}

class OriginStatement extends ASTNode {
    constructor(l, r){
        super(null)
        this.add(l, r)
    }

    eval(context)
    {
        let l = this.children[0].eval(context)
        let r = this.children[1].eval(context)
        context.symbol_table["ORIGIN"] = new Vector(l, r)

        return null
    }
}

class ScaleStatement extends ASTNode {
    constructor(l, r){
        super(null)
        this.add(l, r)
    }

    eval(context)
    {
        let l = this.children[0].eval(context)
        let r = this.children[1].eval(context)
        context.symbol_table["SCALE"] = new Vector(l, r)

        return null
    }
}

class RotStatement extends ASTNode {
    constructor(x){
        super(null)
        this.add(x)
    }

    eval(context)
    {
        let x = this.children[0].eval(context)
        context.symbol_table["ROT"] = x

        return null
    }
}

class ForStatement extends ASTNode {
    constructor(t, e1, e2, e3, e4, e5) {
        super(null)
        this.add(t, e1, e2, e3, e4, e5)
    }

    eval(context)
    {
        // t 是一个变量
        let t = this.children[0].value

        // 其余的为常量
        let from = this.children[1].eval(context)
        let to = this.children[2].eval(context)
        let step = this.children[3].eval(context)

        // 初始化T
        context.symbol_table[t] = from

        let ctx = context.canvas_context

        let origin = context.symbol_table["ORIGIN"]
        let scale = context.symbol_table["SCALE"]
        let rot = context.symbol_table["ROT"]

        let width = ctx.canvas.width
        let height = ctx.canvas.height

        // 循环
        for(; context.symbol_table[t] <= to; context.symbol_table[t]+=step)
        {
            // 计算点的坐标
            let x = this.children[4].eval(context)
            let y = this.children[5].eval(context)

            x *= scale.x
            y *= scale.y

            x = x*Math.cos(rot) + y*Math.sin(rot)
            y = y*Math.cos(rot) - x*Math.sin(rot)

            x += origin.x
            y += origin.y

            // 转换坐标系
            x += 15
            y += 15
            y = height - y

            // 绘制点
            ctx.fillStyle = "#ee1111"
            ctx.fillRect(x, y, 1, 1)
        }


        return null
    }
}

class ConstExpression extends ASTNode {
    constructor(value){
        super(value)
    }

    eval(context){
        return this.value
    }
}

class VarExpression extends ASTNode {
    constructor(value){
        super(value.toUpperCase())
    }

    eval(context) {
        return context.symbol_table[this.value]
    }
}

class FuncExpression extends ASTNode {
    constructor() {
        super(null)
        this.children.push(...arguments)
    }

    eval(context){
        let func = this.children[0].eval(context)

        let args = []
        for(let i=1; i<this.children.length; ++i)
        {
            let res = this.children[i].eval(context)
            args.push(res)
        }

        return func(...args)
    }
}

export class Parser {
    constructor(scanner){
        this.scanner = scanner

        this.next_token = null
    }

    //输出错误信息
    error(type, expected=""){
        let start_next = this.next_token.start_next
        let end_next = this.next_token.end_next

        let res = this.scanner.calc_line_column(start_next, end_next)
        let line = res[0]
        let column = res[1]
        let left_line_wrap_pos = res[2]
        let right_line_wrap_pos = res[3]

        let err_type = ParserErrorType.to_string(type)
        let expected_type = TOKENTYPE_TRANSLATE_TABLE[expected]
        if(expected_type === undefined) expected_type = expected
        if(expected_type !== "") expected_type = " '" + expected_type + "'"

        let tip = this.scanner.calc_tip_str(start_next, end_next, left_line_wrap_pos)
        let line_str = this.scanner.calc_line_str(left_line_wrap_pos, right_line_wrap_pos)

        let err_msg = "[ERROR:"+type+"]"+err_type+expected_type+" at line "+line+" column "+column
        err_msg += "\n" + line_str
        err_msg += "\n" + tip

        return err_msg
    }

    is(type){
        return this.next_token.type === type
    }

    //匹配并向前推进
    match(type){
        if(this.is(type))
        {
            return this.advance()
        }
        throw this.error(
            ParserErrorType.MATCH_ERROR,
            TokenType.to_string(type)
            )
    }

    //向前推进
    advance(){
        let token = this.next_token
        this.next_token = this.scanner.get_token();

        //跳过注释
        while(this.is(TokenType.COMMENT))
            this.next_token = this.scanner.get_token();
        return token
    }

    parse(){
        let statements = []
        this.next_token = this.scanner.get_token()

        try{
            while(!this.is(TokenType.EOF)){
                statements.push(this.statement())
                this.match(TokenType.SEMICO)
            }
        }catch(e)
        {
            console.error(e)
            return null;
        }
        

        return new Program(...statements)
    }

    statement(){
        let res = null;
        if(this.is(TokenType.ORIGIN))
        {
            res = this.origin_statement()
        }else
        if(this.is(TokenType.SCALE))
        {
            res = this.scale_statement()
        }else
        if(this.is(TokenType.ROT))
        {
            res = this.rot_statement()
        }else
        if(this.is(TokenType.FOR))
        {
            res = this.for_statement()
        }else throw this.error(
            ParserErrorType.UNKOWN_STATEMENT
        )

        return res
    }

    origin_statement(){
        this.match(TokenType.ORIGIN)
        this.match(TokenType.IS)

        this.match(TokenType.L_BRANCKET)
        let l = this.expression()
        this.match(TokenType.COMMA)
        let r = this.expression()
        this.match(TokenType.R_BRANCKET)

        return new OriginStatement(l, r)
    }

    scale_statement(){
        this.match(TokenType.SCALE)
        this.match(TokenType.IS)

        this.match(TokenType.L_BRANCKET)
        let l = this.expression()
        this.match(TokenType.COMMA)
        let r = this.expression()
        this.match(TokenType.R_BRANCKET)

        return new ScaleStatement(l, r)
    }

    rot_statement(){
        this.match(TokenType.ROT)
        this.match(TokenType.IS)

        let x = this.expression()

        return new RotStatement(x)
    }

    for_statement(){
        this.match(TokenType.FOR)
        let t = this.var()
        this.match(TokenType.FROM)
        let from = this.expression()
        this.match(TokenType.TO)
        let to = this.expression()
        this.match(TokenType.STEP)
        let step = this.expression()
        this.match(TokenType.DRAW)

        this.match(TokenType.L_BRANCKET)
        let l = this.expression()
        this.match(TokenType.COMMA)
        let r = this.expression()
        this.match(TokenType.R_BRANCKET)

        return new ForStatement(t, from, to, step, l, r)
    }

    expression(){
        let l = this.term()

        while(this.is(TokenType.PLUS) || this.is(TokenType.MINUS))
        {
            let op_token = this.advance()
            let r = this.term()
            
            let op = new ConstExpression(op_token.value)
            l = new FuncExpression(op, l, r)
        }

        return l
    }

    term()
    {
        let l = this.factor()

        while(this.is(TokenType.MUL) || this.is(TokenType.DIV))
        {
            let op_token = this.advance()
            let r = this.factor()

            let op = new ConstExpression(op_token.value)
            l = new FuncExpression(op, l, r)
        }

        return l
    }

    factor()
    {
        if(this.is(TokenType.PLUS) || this.is(TokenType.MINUS))
        {
            let op_token = this.advance()
            let r = this.factor()

            let op = new ConstExpression(op_token.value)
            let l = new ConstExpression(0)
            return new FuncExpression(op, l, r)
        }

        return this.component()
    }

    component()
    {
        let l = this.atom()

        if(this.is(TokenType.POW))
        {
            let op_token = this.advance()
            let r = this.component()

            let op = new ConstExpression(op_token.value)
            return new FuncExpression(op, l, r)
        }

        return l
    }

    var()
    {
        let token = this.match(TokenType.VAR)
        return new VarExpression(token.raw_value)
    }

    atom()
    {
        let expr = null
        if(this.is(TokenType.CONST) || this.is(TokenType.VAR))
        {
            let token = this.advance()
            if(token.type === TokenType.CONST)
                expr = new ConstExpression(token.value)
            if(token.type === TokenType.VAR)
                expr = new VarExpression(token.raw_value)
        }
        else if(this.is(TokenType.L_BRANCKET))
        {
            this.match(TokenType.L_BRANCKET)
            expr = this.expression()
            this.match(TokenType.R_BRANCKET)
        }
        if(expr === null)
        {
            throw this.error(ParserErrorType.UNEXPECTED_TERM)
        }
        if(this.is(TokenType.L_BRANCKET))
        {
            this.match(TokenType.L_BRANCKET)
            let args = []
            if(!this.is(TokenType.R_BRANCKET))
            {
                args = this.args()
            }
            this.match(TokenType.R_BRANCKET)

            expr = new FuncExpression(expr, ...args)
        }
        return expr
    }

    args(){
        let args = [this.expression()]

        while(this.is(TokenType.COMMA))
        {
            args.push(this.expression())
        }

        return args
    }
}


export class ParserTest extends RaiixTest {
    constructor(){
        super("ParserTest")
        var that = this
        this.enable = true
        this.cases = {
            async test_valid(){
                let input = await that.fetch_file_text("/test/parser_test/valid.txt")
                that.test_input(input)
            },
            async test_invalid_0(){
                that.test_input("-16+5**3/cos(T)")
            },
            async test_invalid_1(){
                that.test_input("rot is -16+5**3/cos(T)")
            },
            async test_invalid_2(){
                that.test_input("rot pi")
            },
            async test_invalid_3(){
                that.test_input("test pi")
            },
            async test_empty_input(){
                that.test_input("")
            },
        }
    }

    test_input(input){
        document.getElementById("code-container").value = input

        let s = new Scanner(input)
        let p = new Parser(s)

        console.log(p.parse())
    }
}