import { RaiixTest } from "./RaiixTest.js"
import { DFA } from "./DFA.js"
import { TokenType, Token } from "./Token.js"


function make_transition_condition(cond_char)
{
    return function(char){
        for(let x of cond_char)
        {
            if(x == char) return true
        }
        return false
    }
}

function is_letter(char){
    return /[a-zA-Z]/.test(char)
}

function is_digit(char){
    return /[0-9]/.test(char)
}

const TRANSITION_TABLE = [
    [//0
        {condition:is_letter, to_state:1},
        {condition:is_digit, to_state:2},
        {condition:make_transition_condition('*'), to_state:4},
        {condition:make_transition_condition('/'), to_state:6},
        {condition:make_transition_condition('-'), to_state:7},
        {condition:make_transition_condition('+,;()'), to_state:5},
    ],
    [//1
        {condition:is_letter, to_state:1},
        {condition:is_digit, to_state:1},
    ],
    [//2
        {condition:is_digit, to_state:2},
        {condition:make_transition_condition('.'), to_state:3},
    ],
    [//3
        {condition:is_digit, to_state:3},
    ],
    [//4
        {condition:make_transition_condition('*'), to_state:5},
    ],
    [//5
    ],
    [//6
        {condition:make_transition_condition('/'), to_state:5},
    ],
    [//7
        {condition:make_transition_condition('-'), to_state:5},
    ]
]

const FINAL_STATES = [1, 2, 3, 4, 5, 6, 7]

const COMMENT_PREFIX = ['//', '--']

const LINE_WRAP = "\n"

const BLANK_WORD = " \n\r\t\b"

let TOKEN_TABLE = {
    "PI": new Token(TokenType.CONST, "PI", Math.PI, null),
    "E": new Token(TokenType.CONST, "E", Math.E, null),
    "T": new Token(TokenType.T, "T", 0, null),
    "SIN": new Token(TokenType.FUNC, "SIN", 0, Math.sin),
    "COS": new Token(TokenType.FUNC, "COS", 0, Math.cos),
    "TAN": new Token(TokenType.FUNC, "TAN", 0, Math.tan),
    "LN": new Token(TokenType.FUNC, "LN", 0, Math.log),
    "EXP": new Token(TokenType.FUNC, "EXP", 0, Math.exp),
    "SQRT": new Token(TokenType.FUNC, "SQRT", 0, Math.sqrt),
    "ORIGIN": new Token(TokenType.ORIGIN, "ORIGIN", 0, null),
    "SCALE": new Token(TokenType.SCALE, "SCALE", 0, null),
    "ROT": new Token(TokenType.ROT, "ROT", 0, null),
    "IS": new Token(TokenType.IS, "IS", 0, null),
    "FOR": new Token(TokenType.FOR, "FOR", 0, null),
    "FROM": new Token(TokenType.FROM, "FROM", 0, null),
    "TO": new Token(TokenType.TO, "TO", 0, null),
    "STEP": new Token(TokenType.STEP, "STEP", 0, null),
    "DRAW": new Token(TokenType.DRAW, "DRAW", 0, null),

    "+": new Token(TokenType.PLUS, "+", 0, null),
    "-": new Token(TokenType.MINUS, "-", 0, null),
    "*": new Token(TokenType.MUL, "*", 0, null),
    "/": new Token(TokenType.DIV, "/", 0, null),
    "**": new Token(TokenType.POW, "**", 0, null),

    "--": new Token(TokenType.COMMENT, "--", 0, null),
    "//": new Token(TokenType.COMMENT, "//", 0, null),

    ",": new Token(TokenType.COMMA, ",", 0, null),
    ";": new Token(TokenType.SEMICO, ";", 0, null),
    "(": new Token(TokenType.L_BRANCKET, "(", 0, null),
    ")": new Token(TokenType.R_BRANCKET, ")", 0, null),
}


export class Scanner {
    constructor(input_str){
        this.input_str = input_str
        this.next = 0 //向前看一个字符
        this.max_next = input_str.length
    }

    error(start_next, end_next, msg){
        // console.error(msg)
        // let left_line_wrap_pos = 0
        // for(let i=0; i<this.input_str.length; ++i)
        // {
        //     if(i > start_next) break;
        //     if(this.input_str[i] == '\n') left_line_wrap_pos = i
        // }
        // let right_line_wrap_pos = this.input_str.length
        // for(let i=this.input_str.length; i>=left_line_wrap_pos; --i)
        // {
        //     if(i < end_next) break;
        //     if(this.input_str[i] == '\n') right_line_wrap_pos = i
        // }
        // console.error(this.input_str.substring(left_line_wrap_pos, right_line_wrap_pos))
        // let tip = ""
        // for(let i=0; i<start_next-left_line_wrap_pos; ++i) tip += ' '
        // for(let i=0; i<end_next-start_next; ++i) tip += '~'
        // tip += '^'
        // console.error(tip)
    }

    is_eof(){
        return this.next >= this.input_str.length
    }

    next_char(){
        return this.input_str[this.next] 
    }

    move_on(){
        return this.next += 1
    }

    escape_blank(){
        while(!this.is_eof() && BLANK_WORD.indexOf(this.next_char()) !== -1) this.move_on();
    }

    escape_to_line_wrap(){
        while(!this.is_eof() && LINE_WRAP.indexOf(this.next_char()) === -1) this.move_on();
    }

    get_token() {
        if(this.is_eof()) return new Token(TokenType.EOF, "", 0, null);//扫描完毕
        this.escape_blank();//跳过空白字符
        

        let dfa = new DFA(0, TRANSITION_TABLE, FINAL_STATES)
        let start_next = this.next
        let dfa_res = dfa.run(start_next, this.input_str)
        let end_state = dfa_res[0]
        let end_next = dfa_res[1]


        if(end_state === -1)
        {
            this.error(start_next, start_next, "无法识别字符: '" + this.input_str[start_next] + "' at " + (start_next))
            this.move_on(); //跳过
            return new Token(TokenType.ERR, this.input_str[start_next], 0, null)
        }else if(end_state === -2)
        {
            this.error(start_next, start_next, "非法字符: '" + this.input_str[start_next] + "' at " + (start_next))
            this.move_on(); //跳过
            return new Token(TokenType.ERR, this.input_str[start_next], 0, null)
        }
        this.next = end_next

        let raw_value = this.input_str.substring(start_next, end_next)

        //跳过注释
        if(COMMENT_PREFIX.indexOf(raw_value) !== -1)
        {
            this.escape_to_line_wrap()
        }

        //数值字面量
        if(end_state === 2 || end_state === 3)
        {
            return new Token(TokenType.CONST, raw_value, Number.parseFloat(raw_value), null)
        }

        let token = TOKEN_TABLE[raw_value.toUpperCase()]
        if(token === undefined)
        {
            this.error(start_next, end_next-1, "未定义标识: " + raw_value)
            token = new Token(TokenType.ERR, raw_value, 0, null)
        }

        if(token.type === TokenType.COMMENT){
            token.value = this.input_str.substring(start_next+2, this.next)
        }

        return token
    }
}

export class ScannerTest extends RaiixTest {
    constructor(){
        super("ScannerTest")
        var that = this
        this.enable = true
        this.cases = {
            test_basic_functions(){
                let f = make_transition_condition('x')
                console.log(f('x'))
                console.log(f('y'))
                f = make_transition_condition('abcdefg')
                console.log(f('a'))
                console.log(f('k'))
                
                console.log(is_letter('a'))
                console.log(is_letter('1'))
                console.log(is_digit('a'))
                console.log(is_digit('1'))
            },
            test_get_token(){
                let input = "asd we wq/e / o 12.32 //this is a comment * 0 - 1 + 3\n a6 * - 34 -- ** a23 3a\npi e"
                console.log("语句: \n", input)
                let s = new Scanner(input)
                let token
                let cnt = 0
                do{
                    token = s.get_token()
                    console.log(token.to_string())
                    cnt += 1
                }while(token !== 0 && cnt <= 100)
            }

        }
    }
}