import { RaiixTest } from "./RaiixTest.js"
import { DFA } from "./DFA.js"
import { TokenType, Token } from "./Token.js"

//用于生成条件判断函数
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

//获取字符的编码
const LETTER_a = "a".charCodeAt(0)
const LETTER_z = "z".charCodeAt(0)
const LETTER_A = "A".charCodeAt(0)
const LETTER_Z = "Z".charCodeAt(0)
const DIGIT_0 = "0".charCodeAt(0)
const DIGIT_9 = "9".charCodeAt(0)

//判断是否为字母（包括双字节字符以支持中文）
function is_letter(char){
    char = char.charCodeAt(0)
    return (char >= LETTER_a && char <= LETTER_z) || (char >= LETTER_A && char <= LETTER_Z) || char > 127
}

//判断是否为数字
function is_digit(char){
    char = char.charCodeAt(0)
    return char >= DIGIT_0 && char <= DIGIT_9
}

//DFA需要用到的状态转移表
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

//终态集合
const FINAL_STATES = [1, 2, 3, 4, 5, 6, 7]

const COMMENT_PREFIX = ['//', '--']
const LINE_WRAP = "\n"
const BLANK_WORD = " \n\r\t\b"

//记号表
//用于将识别到的字符串转换为对应的记号，并给常量记号赋值
let TOKEN_TABLE = {
    "PI": new Token(TokenType.CONST, "PI", Math.PI, null),
    "E": new Token(TokenType.CONST, "E", Math.E, null),

    "SIN": new Token(TokenType.CONST, "SIN", 0, Math.sin),
    "COS": new Token(TokenType.CONST, "COS", 0, Math.cos),
    "TAN": new Token(TokenType.CONST, "TAN", 0, Math.tan),
    "LN": new Token(TokenType.CONST, "LN", 0, Math.log),
    "EXP": new Token(TokenType.CONST, "EXP", 0, Math.exp),
    "SQRT": new Token(TokenType.CONST, "SQRT", 0, Math.sqrt),

    "ORIGIN": new Token(TokenType.ORIGIN, "ORIGIN", 0, null),
    "SCALE": new Token(TokenType.SCALE, "SCALE", 0, null),
    "ROT": new Token(TokenType.ROT, "ROT", 0, null),
    "IS": new Token(TokenType.IS, "IS", 0, null),
    "FOR": new Token(TokenType.FOR, "FOR", 0, null),
    "FROM": new Token(TokenType.FROM, "FROM", 0, null),
    "TO": new Token(TokenType.TO, "TO", 0, null),
    "STEP": new Token(TokenType.STEP, "STEP", 0, null),
    "DRAW": new Token(TokenType.DRAW, "DRAW", 0, null),

    "+": new Token(TokenType.PLUS, "+", 0, (l, r)=>l+r),
    "-": new Token(TokenType.MINUS, "-", 0, (l, r)=>l-r),
    "*": new Token(TokenType.MUL, "*", 0, (l, r)=>l*r),
    "/": new Token(TokenType.DIV, "/", 0, (l, r)=>l/r),
    "**": new Token(TokenType.POW, "**", 0, (l, r)=>Math.pow(l, r)),

    "--": new Token(TokenType.COMMENT, "--", 0, null),
    "//": new Token(TokenType.COMMENT, "//", 0, null),

    ",": new Token(TokenType.COMMA, ",", 0, null),
    ";": new Token(TokenType.SEMICO, ";", 0, null),
    "(": new Token(TokenType.L_BRANCKET, "(", 0, null),
    ")": new Token(TokenType.R_BRANCKET, ")", 0, null),
}


export class Scanner {
    constructor(input_str, verbose=true){
        this.input_str = input_str
        this.next = 0 //向前看一个字符
        this.max_next = input_str.length
        this.verbose = verbose
    }

    //判断是否为多节字符
    is_wide_char(pos)
    {
        return this.input_str.charCodeAt(pos) > 127
    }

    //输出错误信息
    error(start_next, end_next, msg){
        if(!this.verbose) return
        let res = this.calc_line_column(start_next, end_next)
        let line = res[0]
        let column = res[1]
        let left_line_wrap_pos = res[2]
        let right_line_wrap_pos = res[3]
        
        let error_msg = msg + " at line " + line + ", column " + column
        error_msg += '\n' + this.calc_line_str(left_line_wrap_pos, right_line_wrap_pos)
        error_msg += '\n' + this.calc_tip_str(start_next, end_next, left_line_wrap_pos)
        console.error(error_msg)
    }

    calc_tip_str(start_next, end_next, left_line_wrap_pos){
        let tip = ""
        for(let i=0; i<start_next-left_line_wrap_pos-1; ++i) tip += ' ' + (this.is_wide_char(left_line_wrap_pos+1+i) ? ' ' : '')
        for(let i=0; i<end_next-start_next; ++i) tip += '~' + (this.is_wide_char(start_next+1+i) ? '~' : '')
        tip += (this.is_wide_char(end_next-1) ? '~' : '') + '^'

        return tip
    }

    calc_line_str(left_line_wrap_pos, right_line_wrap_pos){
        return this.input_str.substring(left_line_wrap_pos+1, right_line_wrap_pos)
    }

    calc_line_column(start_next, end_next){
        if(end_next === undefined) end_next = start_next

        let left_line_wrap_pos = -1
        let line = 1
        for(let i=0; i<this.input_str.length; ++i)
        {
            if(i > start_next) break;
            if(this.input_str[i] == '\n'){
                left_line_wrap_pos = i
                line += 1
            }
        }
        let right_line_wrap_pos = this.input_str.length
        for(let i=this.input_str.length; i>=left_line_wrap_pos; --i)
        {
            if(i < end_next) break;
            if(this.input_str[i] == '\n') right_line_wrap_pos = i
        }

        let column = start_next - left_line_wrap_pos - 1

        return [line, column, left_line_wrap_pos, right_line_wrap_pos]
    }

    is_eof(){
        return this.next >= this.input_str.length
    }

    next_char(){
        return this.input_str[this.next] 
    }

    //向前推进一个字符
    advance(){
        return this.next += 1
    }

    escape_blank(){
        while(!this.is_eof() && BLANK_WORD.indexOf(this.next_char()) !== -1) this.advance();
    }

    escape_to_line_wrap(){
        while(!this.is_eof() && LINE_WRAP.indexOf(this.next_char()) === -1) this.advance();
    }

    //处理dfa返回的结果，返回识别到的记号
    process_dfa_res(start_state, start_next, dfa_res)
    {
        let end_state = dfa_res[0]
        let end_next = dfa_res[1]

        if(end_state === start_state){
            let token = new Token(TokenType.EOF, "", 0, null);//扫描完毕
            token.start_next = end_next
            token.end_state = end_next
            return token
        }

        if(end_state === -1)//终态为-1为从当前字符开始无法完整识别
        {
            this.error(start_next, start_next, "无法识别字符: '" + this.input_str[start_next] + "'")
            this.advance(); //跳过
            let token = new Token(TokenType.ERR, this.input_str[start_next], 0, null)
            token.start_next = start_next
            token.end_next = end_next
            return token
        }else if(end_state === -2)//终态为-2为非法的字符
        {
            this.error(start_next, start_next, "非法字符: '" + this.input_str[start_next] + "'")
            this.advance(); //跳过
            let token = new Token(TokenType.ERR, this.input_str[start_next], 0, null)
            token.start_next = start_next
            token.end_next = end_next
            return token
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
            let token = new Token(TokenType.CONST, raw_value, Number.parseFloat(raw_value), null)
            token.start_next = start_next
            token.end_next = end_next
            return token
        }

        //根据识别到的标识符获取token（包括操作符）
        let token = TOKEN_TABLE[raw_value.toUpperCase()]
        if(token === undefined)
        {
            //变量标识符
            token = new Token(TokenType.VAR, raw_value, 0, null)
        }
        token.raw_value = raw_value
        //用于错误输出
        token.start_next = start_next
        token.end_next = end_next

        //截取注释作为token的值
        if(token.type === TokenType.COMMENT){
            token.value = this.input_str.substring(start_next+2, this.next)
        }

        return token
    }

    get_token() {
        this.escape_blank();//跳过空白字符
        
        //输入初态、状态转换表和终态集给DFA
        //得到的结果为二元组 [终态， 识别到的字符结束位置]
        let dfa = new DFA(0, TRANSITION_TABLE, FINAL_STATES)
        let start_next = this.next
        let dfa_res = dfa.run(start_next, this.input_str)
        
        //根据DFA的结果返回记号
        return this.process_dfa_res(0, start_next, dfa_res)
    }
}

export class ScannerTest extends RaiixTest {
    constructor(){
        super("ScannerTest")
        var that = this
        this.enable = true
        this.cases = {
            _test_basic_functions(){
                let f = make_transition_condition('x')
                console.log(f('x'))
                console.log(f('y'))
                f = make_transition_condition('abcdefg')
                console.log(f('a'))
                console.log(f('k'))
            },
            test_letter(){
                that.assert_equal(is_letter('a'), true)
                that.assert_equal(is_letter('b'), true)
                that.assert_equal(is_letter('c'), true)
                that.assert_equal(is_letter('d'), true)
                that.assert_equal(is_letter('A'), true)
                that.assert_equal(is_letter('B'), true)
                that.assert_equal(is_letter('C'), true)
                that.assert_equal(is_letter('e'), true)
                that.assert_equal(is_letter('Z'), true)
                that.assert_equal(is_letter('z'), true)

                that.assert_equal(is_letter('1'), false)
                that.assert_equal(is_letter('3'), false)
                that.assert_equal(is_letter('-'), false)

                that.assert_equal(is_letter('中'), true)
            },
            test_digit(){
                that.assert_equal(is_digit('0'), true)
                that.assert_equal(is_digit('1'), true)
                that.assert_equal(is_digit('5'), true)
                that.assert_equal(is_digit('9'), true)

                that.assert_equal(is_digit('A'), false)
                that.assert_equal(is_digit('B'), false)
                that.assert_equal(is_digit('C'), false)
            },
            _test_get_token(){
                let input = "asd we wq/e / o 中文12.32 //中文this is a comment * 0 - 1 + 3\n a6 * - 34 -- ** a23 3a\npi e"
                console.log("语句: \n", input)
                let s = new Scanner(input)
                let token
                let cnt = 0
                do{
                    token = s.get_token()
                    console.log(token.to_string())
                    cnt += 1
                }while(token.type !== TokenType.EOF && cnt <= 100)
            },
            async test_valid_file(){
                await that.test_file("/test/scanner_test/valid.txt")
            },
            async _test_invalid_file(){
                await that.test_file("/test/scanner_test/invalid.txt")
            },
            async _test_valid_with_invalid_file(){
                await that.test_file("/test/scanner_test/valid_with_invalid.txt")
            },
            async _test_parser_valid_file(){
                await that.test_file("/test/parser_test/valid.txt")
            },
        }
    }

    async test_file(url){
        let input = await this.fetch_file_text(url)

        document.getElementById("code-container").value = input

        let s = new Scanner(input)
        let token
        do{
            token = s.get_token()
            console.log(token.to_string())
        }while(!token.eof())
    }
}